// controllers/magController.js – with push notification on publish
import asyncHandler from 'express-async-handler';
import Magazine from '../models/magazineModel.js';
import User from '../models/userModel.js';
import { notifySubscribersOfNewContent } from './subscribeController.js';
import { notifyNewContent } from './notificationController.js';   // push

// ==================== CRUD ====================

const createMagazine = asyncHandler(async (req, res) => {
  const { title, summary, author, category, tags, isFeatured, status } = req.body;

  if (!title || !summary || !author || !req.files?.pdf || !req.files?.coverImage) {
    res.status(400);
    throw new Error('Please provide title, summary, author, PDF file, and cover image');
  }

  const { v2: cloudinary } = await import('cloudinary');

  // Upload PDF
  const pdfFile = req.files.pdf[0];
  const pdfB64 = Buffer.from(pdfFile.buffer).toString('base64');
  const pdfDataURI = `data:${pdfFile.mimetype};base64,${pdfB64}`;
  const pdfResult = await cloudinary.uploader.upload(pdfDataURI, {
    folder: 'LovohCreate_Magazines',
    resource_type: 'raw',
    format: 'pdf',
  });

  // Upload Cover
  const coverFile = req.files.coverImage[0];
  const coverB64 = Buffer.from(coverFile.buffer).toString('base64');
  const coverDataURI = `data:${coverFile.mimetype};base64,${coverB64}`;
  const coverResult = await cloudinary.uploader.upload(coverDataURI, {
    folder: 'LovohCreate_Magazines_Covers',
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  });

  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  let slug = baseSlug;
  let counter = 1;
  while (await Magazine.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const magazine = await Magazine.create({
    title,
    summary,
    author: author || req.admin?.name || req.user?.name,
    category,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
    pdfUrl: pdfResult.secure_url,
    coverImage: coverResult.secure_url,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    status: status || 'published',
    slug,
    publishedAt: status === 'published' ? new Date() : null,
    createdBy: req.admin?._id || req.user?._id,
    authorType: req.admin ? 'admin' : 'user',
  });

  // Notify if published
  if (magazine.status === 'published') {
    // Email subscribers (fire-and-forget is okay for email)
    notifySubscribersOfNewContent(magazine, 'magazine');
    
    // Push + in-app notifications (must await to ensure delivery)
    const notifyResult = await notifyNewContent({ type: 'magazine', content: magazine });
    console.log('Magazine publish notification result:', notifyResult);
  }

  res.status(201).json(magazine);
});

const getMagazines = asyncHandler(async (req, res) => {
  const { category, featured, search, status = 'published', page = 1, limit = 12 } = req.query;

  let query = { status };
  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
    ];
  }

  const magazines = await Magazine.find(query)
    .populate('createdBy', 'name username profile')
    .sort({ isFeatured: -1, publishedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const magazinesWithCounts = magazines.map(mag => ({
    ...mag,
    _id: mag._id ? mag._id.toString() : mag._id,
    createdBy: mag.createdBy
      ? typeof mag.createdBy === 'object'
        ? { ...mag.createdBy, _id: mag.createdBy._id ? mag.createdBy._id.toString() : mag.createdBy._id }
        : mag.createdBy.toString()
      : null,
    likes: (mag.likes || []).map(id => id ? id.toString() : id),
    bookmarks: (mag.bookmarks || []).map(id => id ? id.toString() : id),
    comments: (mag.comments || []).map(c => ({
      ...c,
      _id: c._id ? c._id.toString() : c._id,
      user: c.user ? c.user.toString() : c.user,
      likes: (c.likes || []).map(id => id ? id.toString() : id),
      replies: (c.replies || []).map(r => ({
        ...r,
        _id: r._id ? r._id.toString() : r._id,
        user: r.user ? r.user.toString() : r.user,
        likes: (r.likes || []).map(id => id ? id.toString() : id),
      })),
    })),
    likesCount: (mag.likes || []).length,
    commentsCount: (mag.comments || []).length,
    bookmarksCount: (mag.bookmarks || []).length,
  }));

  const count = await Magazine.countDocuments(query);

  res.json({
    magazines: magazinesWithCounts,
    page: Number(page),
    pages: Math.ceil(count / limit),
    total: count,
  });
});

const getMagazineBySlug = asyncHandler(async (req, res) => {
  const magazine = await Magazine.findOne({ slug: req.params.slug })
    .populate('createdBy', 'name username profile')
    .populate('comments.user', 'name username profile');

  if (!magazine) {
    res.status(404);
    throw new Error('Magazine not found');
  }

  magazine.views += 1;
  await magazine.save();

  res.json(magazine);
});

const getMagazineById = asyncHandler(async (req, res) => {
  const magazine = await Magazine.findById(req.params.id)
    .populate('createdBy', 'name username profile');
  if (!magazine) {
    res.status(404);
    throw new Error('Magazine not found');
  }
  res.json(magazine);
});

const updateMagazine = asyncHandler(async (req, res) => {
  const magazine = await Magazine.findById(req.params.id);
  if (!magazine) {
    res.status(404);
    throw new Error('Magazine not found');
  }

  const { title, summary, author, category, tags, isFeatured, status } = req.body;
  const { v2: cloudinary } = await import('cloudinary');

  if (req.files?.pdf) {
    try {
      const oldId = magazine.pdfUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`LovohCreate_Magazines/${oldId}`, { resource_type: 'raw' });
    } catch (err) { console.error('Error deleting old PDF:', err); }

    const pdfFile = req.files.pdf[0];
    const pdfB64 = Buffer.from(pdfFile.buffer).toString('base64');
    const pdfDataURI = `data:${pdfFile.mimetype};base64,${pdfB64}`;
    const pdfResult = await cloudinary.uploader.upload(pdfDataURI, {
      folder: 'LovohCreate_Magazines',
      resource_type: 'raw',
    });
    magazine.pdfUrl = pdfResult.secure_url;
  }

  if (req.files?.coverImage) {
    try {
      const oldId = magazine.coverImage.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`LovohCreate_Magazines_Covers/${oldId}`);
    } catch (err) { console.error('Error deleting old cover:', err); }

    const coverFile = req.files.coverImage[0];
    const coverB64 = Buffer.from(coverFile.buffer).toString('base64');
    const coverDataURI = `data:${coverFile.mimetype};base64,${coverB64}`;
    const coverResult = await cloudinary.uploader.upload(coverDataURI, {
      folder: 'LovohCreate_Magazines_Covers',
      transformation: [{ width: 800, height: 600, crop: 'limit' }],
    });
    magazine.coverImage = coverResult.secure_url;
  }

  if (title && title !== magazine.title) {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let newSlug = baseSlug;
    let counter = 1;
    while (await Magazine.findOne({ slug: newSlug, _id: { $ne: magazine._id } })) {
      newSlug = `${baseSlug}-${counter++}`;
    }
    magazine.slug = newSlug;
  }

  if (title) magazine.title = title;
  if (summary) magazine.summary = summary;
  if (author) magazine.author = author;
  if (category) magazine.category = category;
  if (tags) magazine.tags = Array.isArray(tags) ? tags : tags.split(',');
  if (isFeatured !== undefined) magazine.isFeatured = isFeatured === 'true' || isFeatured === true;
  
  if (status) {
    const oldStatus = magazine.status;
    magazine.status = status;
    
    if (oldStatus !== 'published' && status === 'published') {
      magazine.publishedAt = new Date();
      await magazine.save(); // persist before notifying

      // Email subscribers
      notifySubscribersOfNewContent(magazine, 'magazine');
      
      // Push + in-app notifications (must await)
      const notifyResult = await notifyNewContent({ type: 'magazine', content: magazine });
      console.log('Magazine status-change notification result:', notifyResult);
      
      return res.json(magazine);
    }
  }

  await magazine.save();
  res.json(magazine);
});

const deleteMagazine = asyncHandler(async (req, res) => {
  const magazine = await Magazine.findById(req.params.id);
  if (!magazine) {
    res.status(404);
    throw new Error('Magazine not found');
  }

  const { v2: cloudinary } = await import('cloudinary');

  try {
    const pdfId = magazine.pdfUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`LovohCreate_Magazines/${pdfId}`, { resource_type: 'raw' });
  } catch (err) { console.error('Error deleting PDF:', err); }

  if (magazine.coverImage) {
    try {
      const coverId = magazine.coverImage.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`LovohCreate_Magazines_Covers/${coverId}`);
    } catch (err) { console.error('Error deleting cover:', err); }
  }

  await User.updateMany(
    { bookmarkedMagazines: magazine._id },
    { $pull: { bookmarkedMagazines: magazine._id } },
  );

  await Magazine.deleteOne({ _id: req.params.id });
  res.json({ message: 'Magazine removed' });
});

// ==================== SOCIAL FEATURES ====================

const likeMagazine = asyncHandler(async (req, res) => {
  const magazine = await Magazine.findById(req.params.id);
  if (!magazine) {
    res.status(404);
    throw new Error('Magazine not found');
  }

  const userId = req.user._id;
  const isLiked = magazine.likes.includes(userId);

  if (isLiked) {
    magazine.likes.pull(userId);
    await User.findByIdAndUpdate(userId, { $pull: { likedMagazines: magazine._id } });
  } else {
    magazine.likes.push(userId);
    await User.findByIdAndUpdate(userId, { $addToSet: { likedMagazines: magazine._id } });
  }

  await magazine.save();

  res.json({
    liked: !isLiked,
    likesCount: magazine.likes.length,
  });
});

const bookmarkMagazine = asyncHandler(async (req, res) => {
  const magazine = await Magazine.findById(req.params.id);
  if (!magazine) {
    res.status(404);
    throw new Error('Magazine not found');
  }

  const userId = req.user._id;
  const isBookmarked = magazine.bookmarks.includes(userId);

  if (isBookmarked) {
    magazine.bookmarks.pull(userId);
    await User.findByIdAndUpdate(userId, { $pull: { bookmarkedMagazines: magazine._id } });
  } else {
    magazine.bookmarks.push(userId);
    await User.findByIdAndUpdate(userId, { $addToSet: { bookmarkedMagazines: magazine._id } });
  }

  await magazine.save();

  res.json({
    bookmarked: !isBookmarked,
    bookmarksCount: magazine.bookmarks.length,
  });
});

const addMagazineComment = asyncHandler(async (req, res) => {
  const { text, parentCommentId } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const magazine = await Magazine.findById(req.params.id);
  if (!magazine) {
    res.status(404);
    throw new Error('Magazine not found');
  }

  const comment = {
    user: req.user._id,
    text: text.trim(),
    userName: req.user.name || req.user.username,
    userProfile: req.user.profile || '',
  };

  if (parentCommentId) {
    const parentComment = magazine.comments.id(parentCommentId);
    if (!parentComment) {
      res.status(404);
      throw new Error('Parent comment not found');
    }
    parentComment.replies.push(comment);
  } else {
    magazine.comments.push(comment);
  }

  await magazine.save();

  const populatedMagazine = await Magazine.findById(magazine._id)
    .populate('comments.user', 'name username profile')
    .populate('comments.replies.user', 'name username profile');

  res.status(201).json(populatedMagazine.comments);
});

const likeMagazineComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const { replyId } = req.body;

  const magazine = await Magazine.findById(id);
  if (!magazine) {
    res.status(404);
    throw new Error('Magazine not found');
  }

  let comment;
  if (replyId) {
    const parentComment = magazine.comments.id(commentId);
    if (!parentComment) {
      res.status(404);
      throw new Error('Parent comment not found');
    }
    comment = parentComment.replies.id(replyId);
  } else {
    comment = magazine.comments.id(commentId);
  }

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const userId = req.user._id;
  const isLiked = comment.likes?.includes(userId);

  if (isLiked) {
    comment.likes.pull(userId);
  } else {
    if (!comment.likes) comment.likes = [];
    comment.likes.push(userId);
  }

  await magazine.save();

  res.json({
    liked: !isLiked,
    likesCount: comment.likes?.length || 0,
  });
});

const deleteMagazineComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const { replyId } = req.body;

  const magazine = await Magazine.findById(id);
  if (!magazine) {
    res.status(404);
    throw new Error('Magazine not found');
  }

  if (replyId) {
    const parentComment = magazine.comments.id(commentId);
    if (!parentComment) {
      res.status(404);
      throw new Error('Parent comment not found');
    }
    const reply = parentComment.replies.id(replyId);
    if (!reply) {
      res.status(404);
      throw new Error('Reply not found');
    }
    if (reply.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized');
    }
    parentComment.replies.pull(replyId);
  } else {
    const comment = magazine.comments.id(commentId);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized');
    }
    magazine.comments.pull(commentId);
  }

  await magazine.save();
  res.json({ message: 'Comment removed' });
});

const getBookmarkedMagazines = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('bookmarkedMagazines');
  res.json(user.bookmarkedMagazines || []);
});

const toggleFeatured = asyncHandler(async (req, res) => {
  const magazine = await Magazine.findById(req.params.id);
  if (!magazine) {
    res.status(404);
    throw new Error('Magazine not found');
  }
  magazine.isFeatured = !magazine.isFeatured;
  if (magazine.isFeatured) magazine.featuredAt = new Date();
  await magazine.save();
  res.json({ message: `Magazine ${magazine.isFeatured ? 'featured' : 'unfeatured'}`, magazine });
});

// ==================== STATS ====================
const getMagazineStats = asyncHandler(async (req, res) => {
  const categories = await Magazine.distinct('category');
  const stats = await Magazine.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const featuredMagazines = await Magazine.find({ isFeatured: true, status: 'published' })
    .select('title slug category coverImage').sort({ featuredAt: -1 }).limit(5);
  const totalViews = await Magazine.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);

  res.json({
    categories,
    stats: stats.reduce((acc, curr) => { acc[curr._id] = curr.count; return acc; }, {}),
    featuredMagazines,
    totalViews: totalViews[0]?.total || 0,
  });
});

export {
  createMagazine,
  getMagazines,
  getMagazineBySlug,
  getMagazineById,
  updateMagazine,
  deleteMagazine,
  toggleFeatured,
  likeMagazine,
  bookmarkMagazine,
  addMagazineComment,
  likeMagazineComment,
  deleteMagazineComment,
  getBookmarkedMagazines,
  getMagazineStats,
};