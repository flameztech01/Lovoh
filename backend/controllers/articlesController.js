// controllers/articlesController.js – with push notification on publish
import asyncHandler from 'express-async-handler';
import Article from '../models/articleModel.js';
import User from '../models/userModel.js';
import { v2 as cloudinary } from 'cloudinary';
import { notifySubscribersOfNewContent } from './subscribeController.js';
import { notifyNewContent } from './notificationController.js';   // push

// ==================== CRUD OPERATIONS ====================

const createArticle = asyncHandler(async (req, res) => {
  const {
    title,
    excerpt,
    content,
    category,
    tags,
    isFeatured,
    isEditorsPick,
    status,
  } = req.body;

  if (!title || !excerpt || !content || !category) {
    res.status(400);
    throw new Error('Please provide title, excerpt, content, and category');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('At least one image is required');
  }

  const imageUrls = [];
  for (const file of req.files) {
    try {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'Bizzed_Articles',
        transformation: [{ width: 1200, height: 800, crop: 'limit' }],
      });
      imageUrls.push(result.secure_url);
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500);
      throw new Error('Failed to upload images');
    }
  }

  const featuredImage = imageUrls[0];

  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  let slug = baseSlug;
  let counter = 1;
  while (await Article.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const article = await Article.create({
    title,
    excerpt,
    content,
    category,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
    images: imageUrls,
    featuredImage,
    author: req.user.name || req.user.username || 'User',
    authorId: req.user._id,
    authorType: req.user.role === 'admin' ? 'admin' : 'user',
    isFeatured: isFeatured === 'true' || isFeatured === true,
    isEditorsPick: isEditorsPick === 'true' || isEditorsPick === true,
    status: status || 'published',
    slug,
    publishedAt: status !== 'draft' ? new Date() : null,
    createdBy: req.user._id,
  });

  if (article.status === 'published') {
    // Email subscribers (fire-and-forget is okay for email)
    notifySubscribersOfNewContent(article, 'article');
    
    // Push + in-app notifications (must await to ensure delivery)
    const notifyResult = await notifyNewContent({ type: 'article', content: article });
    console.log('Article publish notification result:', notifyResult);
  }

  res.status(201).json(article);
});

const getArticles = asyncHandler(async (req, res) => {
  const {
    category,
    featured,
    editorsPick,
    search,
    status = 'published',
    page = 1,
    limit = 12,
    sort = '-createdAt',
  } = req.query;

  let query = { status };

  if (category && category !== 'All') query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (editorsPick === 'true') query.isEditorsPick = true;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
    ];
  }

  try {
    const articles = await Article.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const articlesWithCounts = articles.map(article => ({
      ...article,
      _id: article._id ? article._id.toString() : article._id,
      authorId: article.authorId ? article.authorId.toString() : null,
      createdBy: article.createdBy ? article.createdBy.toString() : null,
      authorType: article.authorType || 'user',
      author: article.author || 'Unknown',
      likes: (article.likes || []).map(id => id ? id.toString() : id),
      bookmarks: (article.bookmarks || []).map(id => id ? id.toString() : id),
      comments: (article.comments || []).map(c => ({
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
      likesCount: (article.likes || []).length,
      commentsCount: (article.comments || []).length,
      bookmarksCount: (article.bookmarks || []).length,
    }));

    const count = await Article.countDocuments(query);

    res.json({
      articles: articlesWithCounts,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500);
    throw new Error('Failed to fetch articles');
  }
});

const getArticleBySlug = asyncHandler(async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
    .populate('authorId', 'name username profile')
    .populate('comments.user', 'name username profile')
    .lean();

  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  const articleWithCounts = {
    ...article,
    likesCount: article.likes?.length || 0,
    commentsCount: article.comments?.length || 0,
    bookmarksCount: article.bookmarks?.length || 0,
  };

  await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });

  res.json(articleWithCounts);
});

const getArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id)
    .populate('authorId', 'name username profile')
    .populate('comments.user', 'name username profile');

  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  res.json(article);
});

const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  if (article.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this article');
  }

  const {
    title, excerpt, content, category, tags,
    isFeatured, isEditorsPick, status, keepImages,
  } = req.body;

  let updatedImages = article.images;
  let featuredImage = article.featuredImage;

  if (req.files && req.files.length > 0) {
    const newImages = [];
    for (const file of req.files) {
      try {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'Bizzed_Articles',
          transformation: [{ width: 1200, height: 800, crop: 'limit' }],
        });
        newImages.push(result.secure_url);
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }

    let imagesToKeep = [];
    if (keepImages) {
      imagesToKeep = Array.isArray(keepImages) ? keepImages : [keepImages];
    }

    for (const oldImage of article.images) {
      if (!imagesToKeep.includes(oldImage)) {
        try {
          const publicId = oldImage.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`Bizzed_Articles/${publicId}`);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
    }

    updatedImages = [...imagesToKeep, ...newImages];
    featuredImage = updatedImages[0];
  }

  if (title && title !== article.title) {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let newSlug = baseSlug;
    let counter = 1;
    while (await Article.findOne({ slug: newSlug, _id: { $ne: article._id } })) {
      newSlug = `${baseSlug}-${counter++}`;
    }
    article.slug = newSlug;
  }

  if (title) article.title = title;
  if (excerpt) article.excerpt = excerpt;
  if (content) article.content = content;
  if (category) article.category = category;
  if (tags) article.tags = Array.isArray(tags) ? tags : tags.split(',');

  if (req.user.role === 'admin') {
    if (isFeatured !== undefined) article.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isEditorsPick !== undefined) article.isEditorsPick = isEditorsPick === 'true' || isEditorsPick === true;
  }

  if (updatedImages) article.images = updatedImages;
  if (featuredImage) article.featuredImage = featuredImage;

  if (status) {
    const oldStatus = article.status;
    article.status = status;
    
    if (oldStatus !== 'published' && status === 'published') {
      article.publishedAt = new Date();
      await article.save(); // persist before notifying

      // Email subscribers
      notifySubscribersOfNewContent(article, 'article');
      
      // Push + in-app notifications (must await)
      const notifyResult = await notifyNewContent({ type: 'article', content: article });
      console.log('Article status-change notification result:', notifyResult);
      
      return res.json(article);
    }
  }

  const updatedArticle = await article.save();
  res.json(updatedArticle);
});

const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  if (article.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this article');
  }

  for (const image of article.images) {
    try {
      const publicId = image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`Bizzed_Articles/${publicId}`);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  await User.updateMany(
    { bookmarkedArticles: article._id },
    { $pull: { bookmarkedArticles: article._id } },
  );

  await Article.deleteOne({ _id: req.params.id });
  res.json({ message: 'Article removed' });
});

// ==================== SOCIAL FEATURES ====================

const likeArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  const userId = req.user._id;
  const isLiked = article.likes.includes(userId);

  if (isLiked) {
    article.likes.pull(userId);
    await User.findByIdAndUpdate(userId, { $pull: { likedArticles: article._id } });
  } else {
    article.likes.push(userId);
    await User.findByIdAndUpdate(userId, { $addToSet: { likedArticles: article._id } });
  }

  await article.save();

  res.json({
    liked: !isLiked,
    likesCount: article.likes.length,
  });
});

const bookmarkArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  const userId = req.user._id;
  const isBookmarked = article.bookmarks.includes(userId);

  if (isBookmarked) {
    article.bookmarks.pull(userId);
    await User.findByIdAndUpdate(userId, { $pull: { bookmarkedArticles: article._id } });
  } else {
    article.bookmarks.push(userId);
    await User.findByIdAndUpdate(userId, { $addToSet: { bookmarkedArticles: article._id } });
  }

  await article.save();

  res.json({
    bookmarked: !isBookmarked,
    bookmarksCount: article.bookmarks.length,
  });
});

const addArticleComment = asyncHandler(async (req, res) => {
  const { text, parentCommentId } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  const comment = {
    user: req.user._id,
    text: text.trim(),
    userName: req.user.name || req.user.username,
    userProfile: req.user.profile || '',
  };

  if (parentCommentId) {
    const parentComment = article.comments.id(parentCommentId);
    if (!parentComment) {
      res.status(404);
      throw new Error('Parent comment not found');
    }
    parentComment.replies.push(comment);
  } else {
    article.comments.push(comment);
  }

  await article.save();

  const populatedArticle = await Article.findById(article._id)
    .populate('comments.user', 'name username profile')
    .populate('comments.replies.user', 'name username profile');

  const allComments = populatedArticle.comments;
  let newComment;

  if (parentCommentId) {
    const parent = allComments.id(parentCommentId);
    newComment = parent?.replies[parent.replies.length - 1];
  } else {
    newComment = allComments[allComments.length - 1];
  }

  res.status(201).json(newComment);
});

const likeArticleComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const { replyId } = req.body;

  const article = await Article.findById(id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  let comment;
  if (replyId) {
    const parentComment = article.comments.id(commentId);
    if (!parentComment) {
      res.status(404);
      throw new Error('Parent comment not found');
    }
    comment = parentComment.replies.id(replyId);
  } else {
    comment = article.comments.id(commentId);
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

  await article.save();

  res.json({
    liked: !isLiked,
    likesCount: comment.likes?.length || 0,
  });
});

const deleteArticleComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const { replyId } = req.body;

  const article = await Article.findById(id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  if (replyId) {
    const parentComment = article.comments.id(commentId);
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
    const comment = article.comments.id(commentId);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized');
    }
    article.comments.pull(commentId);
  }

  await article.save();
  res.json({ message: 'Comment removed' });
});

const getBookmarkedArticles = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('bookmarkedArticles');
  res.json(user.bookmarkedArticles || []);
});

const getArticleCategories = asyncHandler(async (req, res) => {
  const categories = await Article.distinct('category');
  res.json(categories);
});

const toggleFeatured = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admins can feature articles');
  }
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }
  article.isFeatured = !article.isFeatured;
  await article.save();
  res.json({ message: `Article ${article.isFeatured ? 'featured' : 'unfeatured'}`, article });
});

const toggleEditorsPick = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admins can set editor\'s pick');
  }
  const article = await Article.findById(req.params.id);
  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }
  article.isEditorsPick = !article.isEditorsPick;
  await article.save();
  res.json({ message: `Article ${article.isEditorsPick ? 'is editor\'s pick' : 'removed from editor\'s pick'}`, article });
});

export {
  createArticle,
  getArticles,
  getArticleBySlug,
  getArticleById,
  updateArticle,
  deleteArticle,
  toggleFeatured,
  toggleEditorsPick,
  getArticleCategories,
  likeArticle,
  bookmarkArticle,
  addArticleComment,
  likeArticleComment,
  deleteArticleComment,
  getBookmarkedArticles,
};