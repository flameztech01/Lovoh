// controllers/videoController.js – With ownership & user videos
import asyncHandler from 'express-async-handler';
import { v2 as cloudinary } from 'cloudinary';
import Video from '../models/videoModel.js';
import User from '../models/userModel.js';
import streamifier from 'streamifier';
import { notifyNewContent } from './notificationController.js';

// ==================== CREATE VIDEO (upload) ====================
const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description, category, tags, isEducational } = req.body;

  if (!title || !req.file) {
    res.status(400);
    throw new Error('Title and video file are required');
  }

  const authorType = req.user.role === 'admin' ? 'admin' : 'user';

  let videoUrl = '';
  let thumbnailUrl = '';
  let duration = 0;

  try {
    const uploadFromBuffer = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: 'Bizzed_Videos',
            eager: [
              { format: 'mp4', quality: 'auto' },
              { format: 'webm', quality: 'auto' }
            ],
            eager_async: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
    };

    const videoResult = await uploadFromBuffer();
    videoUrl = videoResult.secure_url;
    duration = videoResult.duration || 0;
    thumbnailUrl = cloudinary.url(videoResult.public_id, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [{ width: 640, height: 360, crop: 'fill' }]
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500);
    throw new Error('Failed to upload video');
  }

  const video = await Video.create({
    title: title.trim(),
    description: description || '',
    category: category || 'General',
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    videoUrl,
    thumbnail: thumbnailUrl,
    duration,
    isEducational: isEducational === 'true' || isEducational === true,
    user: req.user._id,
    authorName: req.user.name || req.user.username,
    authorProfile: req.user.profile || '',
    authorType: authorType,
    videoType: 'upload',
    status: 'published',
  });

  const notifyResult = await notifyNewContent({ type: 'video', content: video });
  console.log('Video upload notification result:', notifyResult);

  res.status(201).json(video);
});

// ==================== GET ALL VIDEOS (public) ====================
const getVideos = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    isEducational,
    videoType,
    userId,
    authorType,
    page = 1,
    limit = 12,
    sort = '-createdAt'
  } = req.query;

  let query = {};

  if (category) query.category = category;
  if (isEducational !== undefined) query.isEducational = isEducational === 'true';
  if (videoType) query.videoType = videoType;
  if (userId) query.user = userId;
  if (authorType) query.authorType = authorType;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const videos = await Video.find(query)
    .populate('user', 'name username profile role')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const videosWithStrings = videos.map(video => ({
    ...video,
    _id: video._id ? video._id.toString() : video._id,
    user: video.user ?
      (typeof video.user === 'object' ?
        { ...video.user, _id: video.user._id ? video.user._id.toString() : video.user._id }
        : video.user.toString())
      : null,
    likes: (video.likes || []).map(id => id ? id.toString() : id),
    comments: (video.comments || []).map(c => ({
      ...c,
      _id: c._id ? c._id.toString() : c._id,
      user: c.user ? c.user.toString() : c.user,
      likes: (c.likes || []).map(id => id ? id.toString() : id),
    })),
    likesCount: (video.likes || []).length,
    commentsCount: (video.comments || []).length,
  }));

  const count = await Video.countDocuments(query);

  res.json({
    videos: videosWithStrings,
    page: Number(page),
    pages: Math.ceil(count / limit),
    total: count,
  });
});

// ==================== GET VIDEOS BY USER (public) ====================
const getUserVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const videos = await Video.find({ user: req.params.userId })
    .populate('user', 'name username profile')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);
  const count = await Video.countDocuments({ user: req.params.userId });
  res.json({
    videos,
    page: Number(page),
    pages: Math.ceil(count / limit),
    total: count,
  });
});

// ==================== GET LOGGED-IN USER'S OWN VIDEOS ====================
const getMyVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const videos = await Video.find({ user: req.user._id })
    .populate('user', 'name username profile')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);
  const count = await Video.countDocuments({ user: req.user._id });
  res.json({
    videos,
    page: Number(page),
    pages: Math.ceil(count / limit),
    total: count,
  });
});

// ==================== GET VIDEO FEED (following + educational) ====================
const getFeedVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const user = await User.findById(req.user._id);
  const following = user?.following || [];

  const videos = await Video.find({
    $or: [
      { user: { $in: following } },
      { isEducational: true }
    ]
  })
    .populate('user', 'name username profile')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Video.countDocuments({
    $or: [
      { user: { $in: following } },
      { isEducational: true }
    ]
  });

  res.json({
    videos,
    page: Number(page),
    pages: Math.ceil(count / limit),
    total: count,
  });
});

// ==================== GET SINGLE VIDEO ====================
const getVideoById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id)
    .populate('user', 'name username profile followers following');

  if (!video) {
    res.status(404);
    throw new Error('Video not found');
  }

  video.views += 1;
  await video.save();

  res.json(video);
});

// ==================== UPDATE VIDEO (owner or admin) ====================
const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    res.status(404);
    throw new Error('Video not found');
  }

  const isAdmin = req.user.role === 'admin';
  const isOwner = video.user.toString() === req.user._id.toString();
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update this video');
  }

  const { title, description, category, tags, isEducational, youtubeUrl, youtubeId } = req.body;

  if (title) video.title = title.trim();
  if (description !== undefined) video.description = description;
  if (category) video.category = category;
  if (tags) video.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
  if (isEducational !== undefined) video.isEducational = isEducational;

  if (video.videoType === 'youtube' && youtubeUrl) {
    video.youtubeUrl = youtubeUrl;
    if (youtubeId) video.youtubeId = youtubeId;

    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    const thumbnailCheck = await fetch(thumbnailUrl);
    video.youtubeThumbnail = thumbnailCheck.ok ? thumbnailUrl : `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    video.thumbnail = video.youtubeThumbnail;

    if (!title) {
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;
        const response = await fetch(oembedUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.title) video.title = data.title;
        }
      } catch (error) {
        console.error('Error fetching YouTube title:', error);
      }
    }
  }

  await video.save();

  res.json({
    message: 'Video updated successfully',
    video: {
      ...video.toObject(),
      _id: video._id.toString(),
      user: video.user.toString(),
    }
  });
});

// ==================== DELETE VIDEO (owner or admin) ====================
const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    res.status(404);
    throw new Error('Video not found');
  }

  const isAdmin = req.user.role === 'admin';
  const isOwner = video.user.toString() === req.user._id.toString();
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this video');
  }

  if (video.videoType === 'upload' && video.videoUrl) {
    try {
      const publicId = video.videoUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`Bizzed_Videos/${publicId}`, { resource_type: 'video' });
    } catch (error) {
      console.error('Error deleting video from Cloudinary:', error);
    }
  }

  await Video.deleteOne({ _id: req.params.id });
  res.json({ message: 'Video removed' });
});

// ==================== LIKE / UNLIKE VIDEO ====================
const likeVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    res.status(404);
    throw new Error('Video not found');
  }

  const userId = req.user._id;
  const isLiked = video.likes.includes(userId);

  if (isLiked) {
    video.likes.pull(userId);
  } else {
    video.likes.push(userId);
  }

  await video.save();

  res.json({
    liked: !isLiked,
    likesCount: video.likes.length,
  });
});

// ==================== ADD COMMENT ====================
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const video = await Video.findById(req.params.id);
  if (!video) {
    res.status(404);
    throw new Error('Video not found');
  }

  const comment = {
    user: req.user._id,
    text,
    userName: req.user.name || req.user.username,
    userProfile: req.user.profile || '',
  };

  video.comments.push(comment);
  await video.save();

  const populatedVideo = await Video.findById(video._id)
    .populate('comments.user', 'name username profile');

  const newComment = populatedVideo.comments[populatedVideo.comments.length - 1];
  res.status(201).json(newComment);
});

// ==================== LIKE COMMENT ====================
const likeComment = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    res.status(404);
    throw new Error('Video not found');
  }

  const comment = video.comments.id(req.params.commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const userId = req.user._id;
  const isLiked = comment.likes.includes(userId);

  if (isLiked) {
    comment.likes.pull(userId);
  } else {
    comment.likes.push(userId);
  }

  await video.save();

  res.json({
    liked: !isLiked,
    likesCount: comment.likes.length,
  });
});

// ==================== DELETE COMMENT (owner or admin) ====================
const deleteComment = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    res.status(404);
    throw new Error('Video not found');
  }

  const comment = video.comments.id(req.params.commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const isAdmin = req.user.role === 'admin';
  const isOwner = comment.user.toString() === req.user._id.toString();
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  comment.remove();
  await video.save();
  res.json({ message: 'Comment removed' });
});

// ==================== POST YOUTUBE VIDEO ====================
const postYoutubeVideo = asyncHandler(async (req, res) => {
  const { youtubeUrl, category, tags, isEducational } = req.body;
  if (!youtubeUrl) {
    res.status(400);
    throw new Error('YouTube URL is required');
  }

  const authorType = req.user.role === 'admin' ? 'admin' : 'user';

  const extractYoutubeId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const youtubeId = extractYoutubeId(youtubeUrl);
  if (!youtubeId) {
    res.status(400);
    throw new Error('Invalid YouTube URL');
  }

  let videoTitle = '';
  let thumbnailUrl = '';

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      videoTitle = data.title || '';
    }
    thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    const thumbnailCheck = await fetch(thumbnailUrl);
    if (!thumbnailCheck.ok) {
      thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }
  } catch (error) {
    console.error('Error fetching YouTube details:', error);
    thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  const video = await Video.create({
    title: videoTitle || 'YouTube Video',
    description: req.body.description || '',
    category: category || 'General',
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    videoType: 'youtube',
    youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    youtubeId,
    youtubeThumbnail: thumbnailUrl,
    isEducational: isEducational === 'true' || isEducational === true,
    user: req.user._id,
    authorName: req.user.name || req.user.username,
    authorProfile: req.user.profile || '',
    authorType: authorType,
    thumbnail: thumbnailUrl,
    status: 'published',
  });

  const notifyResult = await notifyNewContent({ type: 'video', content: video });
  console.log('YouTube video notification result:', notifyResult);

  res.status(201).json(video);
});

// ==================== EXPORTS ====================
export {
  uploadVideo,
  getVideos,
  getVideoById,
  getUserVideos,
  getMyVideos,
  getFeedVideos,
  updateVideo,
  deleteVideo,
  likeVideo,
  addComment,
  likeComment,
  deleteComment,
  postYoutubeVideo,
};