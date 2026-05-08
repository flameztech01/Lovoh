import asyncHandler from 'express-async-handler';
import NotificationPreference from '../models/notificationModel.js';
import InAppNotification from '../models/InAppNotificationModel.js';   // new
import admin from '../config/firebase.js';

// ---------- Internal helper ----------
const saveNotification = async ({ userId, type, message, data = {} }) => {
  try {
    await InAppNotification.create({ user: userId, type, message, data });
  } catch (error) {
    console.error('Failed to save in-app notification:', error);
  }
};

// ---------- CRUD for push preferences ----------
const getPreferences = asyncHandler(async (req, res) => {
  let prefs = await NotificationPreference.findOne({ userId: req.user._id });
  if (!prefs) {
    prefs = await NotificationPreference.create({ userId: req.user._id });
  }
  res.json(prefs);
});

const updatePreferences = asyncHandler(async (req, res) => {
  const { preferences, deviceToken } = req.body;
  const updateFields = {};

  if (preferences) updateFields.preferences = preferences;

  if (deviceToken) {
    const existing = await NotificationPreference.findOne({ userId: req.user._id });
    const tokens = existing?.deviceTokens || [];
    if (!tokens.includes(deviceToken)) {
      if (tokens.length >= 10) tokens.shift();
      tokens.push(deviceToken);
    }
    updateFields.deviceTokens = tokens;
  }

  const prefs = await NotificationPreference.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updateFields },
    { new: true, upsert: true }
  );
  res.json(prefs);
});

// ---------- Device token registration ----------
const registerDevice = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error('Device token is required');
  }

  let prefs = await NotificationPreference.findOne({ userId: req.user._id });

  if (!prefs) {
    prefs = await NotificationPreference.create({
      userId: req.user._id,
      deviceTokens: [token],
    });
  } else {
    const tokens = prefs.deviceTokens || [];
    if (!tokens.includes(token)) {
      if (tokens.length >= 10) tokens.shift();
      tokens.push(token);
    }
    prefs.deviceTokens = tokens;
    await prefs.save();
  }

  res.json({ message: 'Device registered', deviceTokens: prefs.deviceTokens });
});

// ---------- Push dispatchers (now also save in-app records) ----------

/**
 * Send push + in-app notification for new content (article, magazine, video)
 */
const notifyNewContent = async ({ type, content }) => {
  try {
    const prefField = `preferences.${type}.enabled`;

    const prefs = await NotificationPreference.find({ [prefField]: true })
      .populate('userId', 'following')
      .lean();

    const title = content.title;
    const body = content.summary || content.excerpt || '';
    const message = `New ${type}: ${title}`;
    const dataPayload = {
      type,
      contentId: content._id.toString(),
      slug: content.slug || '',
    };

    const messagePayload = {
      notification: { title, body },
      data: { ...dataPayload, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
    };

    const tokensToSend = [];
    for (const pref of prefs) {
      const user = pref.userId;
      const followOnly = pref.preferences[type]?.fromFollowingOnly;

      if (followOnly && content.createdBy) {
        const isFollowing = user.following?.some(
          f => f.toString() === content.createdBy.toString()
        );
        if (!isFollowing) continue;
      }

      // Save in-app notification for this user
      await saveNotification({
        userId: user._id,
        type,
        message,
        data: dataPayload,
      });

      if (pref.deviceTokens?.length) {
        tokensToSend.push(...pref.deviceTokens);
      }
    }

    if (tokensToSend.length) {
      const chunkSize = 500;
      for (let i = 0; i < tokensToSend.length; i += chunkSize) {
        const chunk = tokensToSend.slice(i, i + chunkSize);
        await admin.messaging().sendMulticast({
          tokens: chunk,
          ...messagePayload,
        });
      }
      console.log(`📲 Push sent to ${tokensToSend.length} devices for "${title}"`);
    }
  } catch (error) {
    console.error('Push notification error:', error);
  }
};

/**
 * Send push + in-app notification for follower events
 */
const notifyFollowerEvent = async ({ targetUserId, followerName, type }) => {
  try {
    const pref = await NotificationPreference.findOne({
      userId: targetUserId,
      'preferences.followers.enabled': true,
    }).lean();

    const message =
      type === 'follow'
        ? `${followerName} started following you`
        : `${followerName} unfollowed you`;

    // Save in-app notification
    await saveNotification({
      userId: targetUserId,
      type: 'follow',        // or 'unfollow'
      message,
      data: { event: type, followerName },
    });

    if (!pref || !pref.deviceTokens?.length) return;

    const title =
      type === 'follow' ? 'New follower 👤' : 'Follower removed 🚶';
    const body = message;

    const messagePayload = {
      notification: { title, body },
      data: {
        type: 'follow',
        event: type,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
    };

    const chunkSize = 500;
    for (let i = 0; i < pref.deviceTokens.length; i += chunkSize) {
      const chunk = pref.deviceTokens.slice(i, i + chunkSize);
      await admin.messaging().sendMulticast({
        tokens: chunk,
        ...messagePayload,
      });
    }
    console.log(`📲 Follower push sent to ${targetUserId}`);
  } catch (error) {
    console.error('Follower notification error:', error);
  }
};

// ---------- In-app notification retrieval and read actions ----------
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const notifications = await InAppNotification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await InAppNotification.countDocuments({ user: req.user._id });
  const unreadCount = await InAppNotification.countDocuments({
    user: req.user._id,
    read: false,
  });

  res.json({
    notifications,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
    unreadCount,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await InAppNotification.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.json(notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await InAppNotification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );
  res.json({ message: 'All marked as read' });
});

export {
  getPreferences,
  updatePreferences,
  registerDevice,
  notifyNewContent,
  notifyFollowerEvent,
  getNotifications,
  markAsRead,
  markAllAsRead,
  saveNotification,   // exported in case other controllers need it directly
};