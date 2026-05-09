// controllers/notificationController.js
import asyncHandler from 'express-async-handler';
import webPush from 'web-push';
import NotificationPreference from '../models/notificationModel.js';
import InAppNotification from '../models/InAppNotificationModel.js';

// ---------- Type to preference key mapping ----------
// The 'type' parameter is singular ('video', 'article', 'magazine')
// But DB stores preference keys as plural ('videos', 'articles', 'magazines')
const TYPE_TO_PREF_KEY = {
  article: 'articles',
  magazine: 'magazines',
  video: 'videos',
  follow: 'followers',
  unfollow: 'followers',
};

// ---------- Configure web-push once ----------
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_EMAIL) {
  console.error('WARNING: VAPID keys or email not configured. Push notifications will fail.');
} else {
  webPush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// ---------- Internal helper ----------
const saveNotification = async ({ userId, type, message, data = {} }) => {
  try {
    if (!userId) {
      console.error('❌ saveNotification: userId is required but was not provided');
      return null;
    }
    
    const notification = await InAppNotification.create({ 
      user: userId, 
      type, 
      message, 
      data 
    });
    
    console.log(`✅ In-app notification saved for user ${userId}: ${type}`);
    return notification;
  } catch (error) {
    console.error('❌ Failed to save in-app notification:', error.message);
    return null;
  }
};

// ---------- Preferences ----------
const getPreferences = asyncHandler(async (req, res) => {
  let prefs = await NotificationPreference.findOne({ userId: req.user._id });
  if (!prefs) {
    prefs = await NotificationPreference.create({ 
      userId: req.user._id,
      preferences: {
        articles: { enabled: true, fromFollowingOnly: false },
        magazines: { enabled: true, fromFollowingOnly: false },
        videos: { enabled: true, fromFollowingOnly: false },
        followers: { enabled: true }
      }
    });
  }
  res.json(prefs);
});

const updatePreferences = asyncHandler(async (req, res) => {
  const { preferences, pushSubscription } = req.body;
  const updateFields = {};

  if (preferences) updateFields.preferences = preferences;
  if (pushSubscription !== undefined) updateFields.pushSubscription = pushSubscription;

  const prefs = await NotificationPreference.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updateFields },
    { new: true, upsert: true }
  );
  res.json(prefs);
});

// ---------- Web-push subscription management ----------
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
 * Send push + in-app notification for new content (article, magazine, video)
 */
const notifyNewContent = async ({ type, content }) => {
  const startTime = Date.now();
  
  try {
    // Validate inputs
    if (!type || !content || !content._id) {
      console.error('❌ notifyNewContent: Invalid arguments', { type, hasContent: !!content, contentId: content?._id });
      return { success: false, error: 'Invalid arguments' };
    }

    // Map singular type to plural preference key
    const prefKey = TYPE_TO_PREF_KEY[type];
    if (!prefKey) {
      console.error(`❌ notifyNewContent: Unknown type '${type}'. No mapping found.`);
      return { success: false, error: `Unknown type: ${type}` };
    }
    
    console.log(`🔔 notifyNewContent started: type=${type}, prefKey=${prefKey}, contentId=${content._id}`);

    // Determine the author ID robustly
    // Articles/Magazines use 'createdBy', Videos use 'user'
    let authorId = content.createdBy || content.user;
    
    // Handle Mongoose ObjectId or string
    if (authorId && typeof authorId === 'object' && authorId.toString) {
      authorId = authorId.toString();
    }
    
    console.log(`   Author ID determined: ${authorId}`);

    // Build the query using the PLURAL preference key
    const prefField = `preferences.${prefKey}.enabled`;
    console.log(`   Querying with: { ${prefField}: true }`);

    // Find users who have this content type enabled
    const prefs = await NotificationPreference.find({ [prefField]: true })
      .populate('userId', 'following name username')  // Include name/username for debugging
      .lean();

    console.log(`📊 Found ${prefs.length} users with ${prefKey} notifications enabled`);

    if (!prefs || prefs.length === 0) {
      console.log(`ℹ️ No users have enabled ${prefKey} notifications. Skipping.`);
      return { success: true, notificationsSent: 0, reason: 'No enabled preferences' };
    }

    const title = content.title || 'New Content';
    const body = content.summary || content.excerpt || content.description || '';
    const message = `New ${type}: ${title}`;
    const dataPayload = {
      type,
      contentId: content._id.toString(),
      slug: content.slug || '',
    };

    let notificationsSent = 0;
    let pushNotificationsSent = 0;
    let skippedCount = 0;

    for (const pref of prefs) {
      // Handle populated userId - it could be an object or just the ID
      const user = pref.userId;
      
      if (!user) {
        console.warn(`⚠️ Skipping preference ${pref._id}: userId not populated`);
        continue;
      }

      // Extract user ID robustly
      const userId = user._id ? user._id.toString() : user.toString();
      
      // Skip if this is the author themselves (optional - remove if you want authors to get their own notifications)
      if (authorId && userId === authorId) {
        console.log(`⏭️ Skipping author ${userId} (self-notification)`);
        continue;
      }

      // Check fromFollowingOnly filter using the PLURAL key
      const followOnly = pref.preferences?.[prefKey]?.fromFollowingOnly;
      console.log(`   User ${userId}: followOnly=${followOnly}, following=${user.following?.length || 0}`);
      
      if (followOnly && authorId) {
        const following = user.following || [];
        const isFollowing = following.some(f => {
          const followId = f && f.toString ? f.toString() : String(f);
          return followId === authorId;
        });
        
        if (!isFollowing) {
          console.log(`   ⏭️ User ${userId} skipped (not following author)`);
          skippedCount++;
          continue; // Skip this user - they only want notifications from people they follow
        }
      }

      // Save in-app notification for this user
      try {
        await saveNotification({
          userId,
          type,
          message,
          data: dataPayload,
        });
        notificationsSent++;
        console.log(`   ✅ In-app notification saved for user ${userId}`);
      } catch (err) {
        console.error(`   ❌ Failed to save in-app notification for user ${userId}:`, err.message);
        // Continue to try push even if in-app fails
      }

      // Send web-push if subscription exists
      if (pref.pushSubscription && pref.pushSubscription.endpoint) {
        try {
          await webPush.sendNotification(
            pref.pushSubscription,
            JSON.stringify({ title, body, data: dataPayload })
          );
          pushNotificationsSent++;
          console.log(`   📱 Push sent to user ${userId}`);
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription expired or invalid - remove it
            console.log(`   🗑️ Removing expired push subscription for user ${userId}`);
            await NotificationPreference.findOneAndUpdate(
              { userId },
              { $set: { pushSubscription: null } }
            );
          } else {
            console.error(`   ❌ Push failed for user ${userId}:`, err.message);
          }
        }
      } else {
        console.log(`   ℹ️ No push subscription for user ${userId}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ notifyNewContent completed in ${duration}ms: ${notificationsSent} in-app, ${pushNotificationsSent} push, ${skippedCount} skipped`);

    return { 
      success: true, 
      notificationsSent, 
      pushNotificationsSent, 
      skippedCount,
      duration 
    };

  } catch (error) {
    console.error('❌ notifyNewContent fatal error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push + in-app notification for follower events
 */
const notifyFollowerEvent = async ({ targetUserId, followerName, type }) => {
  try {
    if (!targetUserId) {
      console.error('❌ notifyFollowerEvent: targetUserId is required');
      return { success: false, error: 'targetUserId required' };
    }

    const pref = await NotificationPreference.findOne({
      userId: targetUserId,
      'preferences.followers.enabled': true,
    }).lean();

    const message =
      type === 'follow'
        ? `${followerName} started following you`
        : `${followerName} unfollowed you`;

    // Always save in-app notification regardless of push preference
    await saveNotification({
      userId: targetUserId,
      type: 'follow',  // Schema uses 'follow' for both follow/unfollow events
      message,
      data: { event: type, followerName },
    });

    if (!pref || !pref.pushSubscription) {
      return { success: true, pushSent: false, reason: 'No push subscription' };
    }

    const title = type === 'follow' ? 'New follower 👤' : 'Follower removed 🚶';

    try {
      await webPush.sendNotification(
        pref.pushSubscription,
        JSON.stringify({
          title,
          body: message,
          data: { type: 'follow', event: type },
        })
      );
      return { success: true, pushSent: true };
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await NotificationPreference.findOneAndUpdate(
          { userId: targetUserId },
          { $set: { pushSubscription: null } }
        );
        return { success: true, pushSent: false, reason: 'Subscription expired' };
      } else {
        console.error('❌ Follower push failed:', err);
        return { success: false, error: err.message };
      }
    }
  } catch (error) {
    console.error('❌ notifyFollowerEvent error:', error);
    return { success: false, error: error.message };
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
  subscribeToPush,
  unsubscribeFromPush,
  notifyNewContent,
  notifyFollowerEvent,
  getNotifications,
  markAsRead,
  markAllAsRead,
  saveNotification,
};