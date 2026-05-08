// controllers/subscribeController.js
import asyncHandler from 'express-async-handler';
import Subscribe from '../models/SubscribeModel.js';
import Magazine from '../models/magazineModel.js';
import Article from '../models/articleModel.js';
import {
  sendSubscriptionConfirmation,
  sendNewMagazineNotification,
  sendWeeklyDigest,
  sendUnsubscribeConfirmation,
} from '../utils/magazineEmailService.js';

// @desc    Subscribe (or update preferences)
// @route   POST /api/subscribe
// @access  Public
const subscribe = asyncHandler(async (req, res) => {
  const { email, name, preferences } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  let subscriber = await Subscribe.findOne({ email: email.toLowerCase() });

  if (subscriber) {
    subscriber.active = true;
    subscriber.unsubscribedAt = undefined;
    if (name) subscriber.name = name;
    if (preferences) {
      subscriber.preferences = {
        ...subscriber.preferences,
        ...preferences,
      };
    }
    subscriber.subscribedAt = new Date();
    await subscriber.save();
  } else {
    subscriber = await Subscribe.create({
      email: email.toLowerCase(),
      name: name || '',
      preferences: preferences || {},
      active: true,
      subscribedAt: new Date(),
    });
  }

  await sendSubscriptionConfirmation(subscriber.email, subscriber.name);

  res.json({ message: 'Subscription successful', subscriber });
});

// @desc    Unsubscribe
// @route   POST /api/subscribe/unsubscribe
// @access  Public
const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const subscriber = await Subscribe.findOne({ email: email.toLowerCase() });

  if (!subscriber || !subscriber.active) {
    res.status(400);
    throw new Error('Not subscribed');
  }

  subscriber.active = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  await sendUnsubscribeConfirmation(subscriber.email, subscriber.name);

  res.json({ message: 'Unsubscribed successfully' });
});

// @desc    Get all subscribers (Admin)
// @route   GET /api/subscribe/subscribers
// @access  Private/Admin
const getSubscribers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const subscribers = await Subscribe.find({ active: true })
    .select('email name preferences subscribedAt')
    .sort({ subscribedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Subscribe.countDocuments({ active: true });

  res.json({
    subscribers,
    page: Number(page),
    pages: Math.ceil(count / limit),
    total: count,
  });
});

// @desc    Manually trigger weekly digest
// @route   POST /api/subscribe/send-digest
// @access  Private/Admin
const sendWeeklyDigestManual = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const [magazines, articles] = await Promise.all([
    Magazine.find({
      status: 'published',
      publishedAt: { $gte: start, $lte: end },
    })
      .select('title category summary slug coverImage')
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean(),
    Article.find({
      status: 'published',
      publishedAt: { $gte: start, $lte: end },
    })
      .select('title category excerpt slug featuredImage')
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const stories = [
    ...magazines.map(m => ({
      title: m.title,
      category: m.category,
      excerpt: m.summary || m.excerpt,
      slug: m.slug,
      readTime: '5 min read',
    })),
    ...articles.map(a => ({
      title: a.title,
      category: a.category,
      excerpt: a.excerpt,
      slug: a.slug,
      readTime: a.readTime || '5 min read',
    })),
  ];

  if (stories.length === 0) {
    res.status(400);
    throw new Error('No content found for the given period');
  }

  const subscribers = await Subscribe.find({
    active: true,
    'preferences.weeklyDigest': true,
  }).select('email name');

  let sentCount = 0;
  for (let i = 0; i < subscribers.length; i += 50) {
    const batch = subscribers.slice(i, i + 50);
    await Promise.all(
      batch.map(sub =>
        sendWeeklyDigest(sub.email, sub.name, stories).then(() => sentCount++)
      )
    );
    if (i + 50 < subscribers.length) await new Promise(r => setTimeout(r, 1000));
  }

  res.json({
    message: `Weekly digest sent to ${sentCount} subscribers`,
    storiesCount: stories.length,
  });
});

/**
 * Notify subscribers about new content (magazine or article)
 * @param {Object} content - the magazine or article document
 * @param {String} type    - 'magazine' or 'article'
 */
const notifySubscribersOfNewContent = async (content, type) => {
  try {
    const preferenceField = type === 'magazine' ? 'preferences.magazines' : 'preferences.articles';

    const subscribers = await Subscribe.find({
      active: true,
      [preferenceField]: true,
      email: { $exists: true, $ne: '' },
    }).select('email name');

    const storyData = {
      title: content.title,
      category: content.category,
      summary: content.summary || content.excerpt,
      slug: content.slug,
      coverImage: content.coverImage || content.featuredImage,
    };

    for (let i = 0; i < subscribers.length; i += 50) {
      const batch = subscribers.slice(i, i + 50);
      await Promise.all(
        batch.map(sub =>
          sendNewMagazineNotification(
            sub.email,
            sub.name,
            storyData,
            content.isFeatured || false
          )
        )
      );
      if (i + 50 < subscribers.length) await new Promise(r => setTimeout(r, 1000));
    }
  } catch (error) {
    console.error('Failed to notify subscribers:', error);
  }
};

const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }
  const subscriber = await Subscribe.findOne({ email: email.toLowerCase(), active: true });
  res.json({ subscribed: !!subscriber });
});

export {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendWeeklyDigestManual,
  notifySubscribersOfNewContent,
  getSubscriptionStatus
};