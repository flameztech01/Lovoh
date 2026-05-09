import asyncHandler from 'express-async-handler';
import webPush from 'web-push';
import NotificationPreference from '../models/notificationModel.js';
import InAppNotification from '../models/InAppNotificationModel.js';

// ---------- Configure web‑push once ----------
webPush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ---------- Internal helper ----------
const saveNotification = async ({ userId, type, message, data = {} }) => {
  try {
    await InAppNotification.create({ user: userId, type, message, data });
  } catch (error) {
    console.error('Failed to save in-app notification:', error);
  }
};

// ---------- Preferences ----------
const getPreferences = asyncHandler(async (req, res) => {
  let prefs = await NotificationPreference.findOne({ userId: req.user._id });
  if (!prefs) {
    prefs = await NotificationPreference.create({ userId: req.user._id });
  }
  res.json(prefs);
});

const updatePreferences = asyncHandler(async (req, res) => {
  const { preferences, pushSubscription } = req.body;
  const updateFields = {};

  if (preferences) updateFields.preferences = preferences;
  if (pushSubscription) updateFields.pushSubscription = pushSubscription;

  const prefs = await NotificationPreference.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updateFields },
    { new: true, upsert: true }
  );
  res.json(prefs);
});

// ---------- Web‑push subscription management ----------
const subscribeToPush = asyncHandler(async (req, res) => {
  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint) {
    res.status(400);
    throw new Error('Valid subscription object with endpoint is required');
  }

  await NotificationPreference.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { pushSubscription: subscription } },
    { upsert: true }
  );

  res.json({ message: 'Subscribed to push notifications' });
});

const unsubscribeFromPush = asyncHandler(async (req, res) => {
  await NotificationPreference.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { pushSubscription: null } }
  );
  res.json({ message: 'Unsubscribed from push notifications' });
});

// ---------- Internal dispatchers ----------

/**
 * Send push + in‑app notification for new content (article, magazine, video)
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

    // Determine the author ID (videos use 'user', others use 'createdBy')
    const authorId = content.createdBy || content.user;

    for (const pref of prefs) {
      const user = pref.userId;
      const followOnly = pref.preferences[type]?.fromFollowingOnly;

      if (followOnly && authorId) {
        const isFollowing = user.following?.some(
          f => f.toString() === authorId.toString()
        );
        if (!isFollowing) continue;
      }

      // Save in‑app notification for this user
      await saveNotification({
        userId: user._id,
        type,
        message,
        data: dataPayload,
      });

      // Send web‑push if subscription exists
      if (pref.pushSubscription) {
        try {
          await webPush.sendNotification(
            pref.pushSubscription,
            JSON.stringify({ title, body, data: dataPayload })
          );
        } catch (err) {
          if (err.statusCode === 410) {
            await NotificationPreference.findOneAndUpdate(
              { userId: user._id },
              { $set: { pushSubscription: null } }
            );
          } else {
            console.error(`Push failed for user ${user._id}:`, err);
          }
        }
      }
    }
  } catch (error) {
    console.error('notifyNewContent error:', error);
  }
};

/**
 * Send push + in‑app notification for follower events
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

    // Save in‑app notification
    await saveNotification({
      userId: targetUserId,
      type: 'follow',
      message,
      data: { event: type, followerName },
    });

    if (!pref || !pref.pushSubscription) return;

    const title =
      type === 'follow' ? 'New follower 👤' : 'Follower removed 🚶';

    try {
      await webPush.sendNotification(
        pref.pushSubscription,
        JSON.stringify({
          title,
          body: message,
          data: { type: 'follow', event: type },
        })
      );
    } catch (err) {
      if (err.statusCode === 410) {
        await NotificationPreference.findOneAndUpdate(
          { userId: targetUserId },
          { $set: { pushSubscription: null } }
        );
      } else {
        console.error('Follower push failed:', err);
      }
    }
  } catch (error) {
    console.error('notifyFollowerEvent error:', error);
  }
};

// ---------- In‑app notification retrieval and read actions ----------
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
  subscribeToPush,
  unsubscribeFromPush,
  notifyNewContent,
  notifyFollowerEvent,
  getNotifications,
  markAsRead,
  markAllAsRead,
  saveNotification,
};