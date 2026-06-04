// controllers/adsController.js
import asyncHandler from 'express-async-handler';
import Ad from '../models/adModel.js';
import { v2 as cloudinary } from 'cloudinary';

// ==================== PUBLIC ENDPOINTS ====================

// @desc    Get ads for a specific page and placement
// @route   GET /api/ads
// @access  Public
// controllers/adsController.js - Updated getAds function

// @desc    Get ads for a specific page and placement
// @route   GET /api/ads
// @access  Public
const getAds = asyncHandler(async (req, res) => {
  const { page, placement, limit = 10 } = req.query;
  
  if (!page) {
    res.status(400);
    throw new Error('Page parameter is required');
  }

  if (!placement) {
    res.status(400);
    throw new Error('Placement parameter is required');
  }

  // Optional card configuration for compatibility filtering
  const cardConfig = {
    supportsImage: req.query.supportsImage !== 'false',
    supportsVideo: req.query.supportsVideo === 'true',
  };

  // Only get ads for the specific page/site
  let ads = await Ad.getAdsForPlacement(page, placement, cardConfig);
  
  // Additional filter to ensure only ads for this specific page are shown
  // (in case the model method doesn't filter properly)
  ads = ads.filter(ad => ad.pages && ad.pages.includes(page));

  // Apply limit
  ads = ads.slice(0, parseInt(limit));

  res.json({
    success: true,
    page,
    placement,
    count: ads.length,
    ads,
  });
});

// @desc    Track ad click
// @route   POST /api/ads/:id/click
// @access  Public
const trackAdClick = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    res.status(404);
    throw new Error('Ad not found');
  }

  await ad.incrementClicks();

  res.json({
    success: true,
    message: 'Click tracked',
  });
});

// @desc    Track ad view
// @route   POST /api/ads/:id/view
// @access  Public
const trackAdView = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    res.status(404);
    throw new Error('Ad not found');
  }

  await ad.incrementViews();

  res.json({
    success: true,
    message: 'View tracked',
  });
});

// ==================== ADMIN ENDPOINTS ====================

// @desc    Create new ad
// @route   POST /api/ads
// @access  Private/Admin
const createAd = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    description,
    mediaType,
    ctaText,
    ctaLink,
    pages,
    placements,
    bgColor,
    accentColor,
    status,
    priority,
    startDate,
    endDate,
    displayOrder,
  } = req.body;

  // Validation
  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  // Parse pages and placements from JSON strings
  let parsedPages = ['uduua'];
  let parsedPlacements = ['hero'];

  if (pages) {
    try {
      parsedPages = typeof pages === 'string' ? JSON.parse(pages) : pages;
    } catch (error) {
      console.error('Error parsing pages:', error);
      parsedPages = Array.isArray(pages) ? pages : [pages];
    }
  }

  if (placements) {
    try {
      parsedPlacements = typeof placements === 'string' ? JSON.parse(placements) : placements;
    } catch (error) {
      console.error('Error parsing placements:', error);
      parsedPlacements = Array.isArray(placements) ? placements : [placements];
    }
  }

  // Ensure they are arrays
  if (!Array.isArray(parsedPages)) parsedPages = [parsedPages];
  if (!Array.isArray(parsedPlacements)) parsedPlacements = [parsedPlacements];

  console.log('Parsed pages:', parsedPages);
  console.log('Parsed placements:', parsedPlacements);

  if (parsedPages.length === 0) {
    res.status(400);
    throw new Error('At least one page must be selected');
  }

  // Upload files to Cloudinary
  let imageUrl = '';
  let videoUrl = '';
  let thumbnailUrl = '';

  try {
    // Upload image if provided
    if (req.files && req.files.image) {
      const imageFile = req.files.image[0];
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'Ads',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
            transformation: [{ width: 1200, height: 900, crop: 'limit' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(imageFile.buffer);
      });
      imageUrl = result.secure_url;
    }

    // Upload video if provided
    if (req.files && req.files.video) {
      const videoFile = req.files.video[0];
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'Ads/Videos',
            resource_type: 'video',
            allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(videoFile.buffer);
      });
      videoUrl = result.secure_url;
    }

    // Upload thumbnail if provided
    if (req.files && req.files.thumbnail) {
      const thumbnailFile = req.files.thumbnail[0];
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'Ads/Thumbnails',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 400, height: 300, crop: 'limit' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(thumbnailFile.buffer);
      });
      thumbnailUrl = result.secure_url;
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500);
    throw new Error('Failed to upload media to Cloudinary');
  }

  // Validate media based on mediaType
  if (mediaType === 'image' && !imageUrl) {
    res.status(400);
    throw new Error('Image is required for image ads');
  }

  if (mediaType === 'video' && !videoUrl) {
    res.status(400);
    throw new Error('Video is required for video ads');
  }

  if (mediaType === 'both' && (!imageUrl || !videoUrl)) {
    res.status(400);
    throw new Error('Both image and video are required for mixed media ads');
  }

  // Use image as thumbnail if no thumbnail provided
  if (!thumbnailUrl && imageUrl) {
    thumbnailUrl = imageUrl;
  }

  const ad = await Ad.create({
    title: title.trim(),
    subtitle: subtitle?.trim() || '',
    description: description?.trim() || '',
    mediaType: mediaType || 'image',
    image: imageUrl,
    video: videoUrl,
    thumbnail: thumbnailUrl,
    ctaText: ctaText?.trim() || 'Learn More',
    ctaLink: ctaLink?.trim() || '',
    pages: parsedPages,
    placements: parsedPlacements,
    bgColor: bgColor || 'from-[#0043FC] to-[#0038D4]',
    accentColor: accentColor || '#79FFFF',
    status: status || 'active',
    priority: priority || 1,
    startDate: startDate || new Date(),
    endDate: endDate || null,
    displayOrder: displayOrder || 0,
    createdBy: req.admin._id,
  });

  res.status(201).json({
    success: true,
    message: 'Ad created successfully',
    ad,
  });
});

// @desc    Get all ads (Admin only)
// @route   GET /api/ads/admin/all
// @access  Private/Admin
const getAllAds = asyncHandler(async (req, res) => {
  const {
    pageName,      // Filter by page/site (uduua, thefruiit, etc.)
    placement,
    status,
    mediaType,
    search,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;
  
  // Get pagination page separately
  const page = parseInt(req.query.page) || 1;

  let query = {};

  // Filter by page name (site)
  if (pageName) {
    query.pages = pageName;
  }

  // Filter by placement
  if (placement) {
    query.placements = placement;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by media type
  if (mediaType) {
    query.mediaType = mediaType;
  }

  // Search by title or subtitle
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { subtitle: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const ads = await Ad.find(query)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort(sortOptions)
    .limit(parseInt(limit))
    .skip((page - 1) * parseInt(limit));

  // Get total count
  const total = await Ad.countDocuments(query);

  // Get statistics for the filtered query
  const stats = await Ad.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalViews: { $sum: '$views' },
        totalClicks: { $sum: '$clicks' },
        avgCtr: { 
          $avg: { 
            $cond: [
              { $eq: ['$views', 0] }, 
              0, 
              { $multiply: [{ $divide: ['$clicks', '$views'] }, 100] }
            ] 
          } 
        },
      },
    },
  ]);

  res.json({
    ads,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
    stats: stats[0] || { totalViews: 0, totalClicks: 0, avgCtr: 0 },
  });
});

// @desc    Get single ad (Admin only)
// @route   GET /api/ads/:id
// @access  Private/Admin
const getAdById = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!ad) {
    res.status(404);
    throw new Error('Ad not found');
  }

  res.json(ad);
});

// @desc    Update ad
// @route   PUT /api/ads/:id
// @access  Private/Admin
const updateAd = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    res.status(404);
    throw new Error('Ad not found');
  }

  const {
    title,
    subtitle,
    description,
    mediaType,
    ctaText,
    ctaLink,
    pages,
    placements,
    bgColor,
    accentColor,
    status,
    priority,
    startDate,
    endDate,
    displayOrder,
    keepImage,
    keepVideo,
    keepThumbnail,
  } = req.body;

  // Parse pages from JSON string if provided
  let parsedPages = ad.pages;
  if (pages !== undefined) {
    try {
      parsedPages = typeof pages === 'string' ? JSON.parse(pages) : pages;
    } catch (error) {
      console.error('Error parsing pages:', error);
      parsedPages = Array.isArray(pages) ? pages : [pages];
    }
    // Ensure it's an array
    if (!Array.isArray(parsedPages)) parsedPages = [parsedPages];
  }

  // Parse placements from JSON string if provided
  let parsedPlacements = ad.placements;
  if (placements !== undefined) {
    try {
      parsedPlacements = typeof placements === 'string' ? JSON.parse(placements) : placements;
    } catch (error) {
      console.error('Error parsing placements:', error);
      parsedPlacements = Array.isArray(placements) ? placements : [placements];
    }
    // Ensure it's an array
    if (!Array.isArray(parsedPlacements)) parsedPlacements = [parsedPlacements];
  }

  console.log('Update - Parsed pages:', parsedPages);
  console.log('Update - Parsed placements:', parsedPlacements);

  // Upload new files to Cloudinary if provided
  let imageUrl = ad.image;
  let videoUrl = ad.video;
  let thumbnailUrl = ad.thumbnail;

  try {
    // Upload new image if provided
    if (req.files && req.files.image) {
      // Delete old image if not kept
      if (!keepImage && ad.image) {
        try {
          const publicId = ad.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`Ads/${publicId}`);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      const imageFile = req.files.image[0];
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'Ads',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
            transformation: [{ width: 1200, height: 900, crop: 'limit' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(imageFile.buffer);
      });
      imageUrl = result.secure_url;
    }

    // Upload new video if provided
    if (req.files && req.files.video) {
      // Delete old video if not kept
      if (!keepVideo && ad.video) {
        try {
          const publicId = ad.video.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`Ads/Videos/${publicId}`, { resource_type: 'video' });
        } catch (error) {
          console.error('Error deleting old video:', error);
        }
      }

      const videoFile = req.files.video[0];
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'Ads/Videos',
            resource_type: 'video',
            allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(videoFile.buffer);
      });
      videoUrl = result.secure_url;
    }

    // Upload new thumbnail if provided
    if (req.files && req.files.thumbnail) {
      // Delete old thumbnail if not kept and not same as image
      if (!keepThumbnail && ad.thumbnail && ad.thumbnail !== ad.image) {
        try {
          const publicId = ad.thumbnail.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`Ads/Thumbnails/${publicId}`);
        } catch (error) {
          console.error('Error deleting old thumbnail:', error);
        }
      }

      const thumbnailFile = req.files.thumbnail[0];
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'Ads/Thumbnails',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 400, height: 300, crop: 'limit' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(thumbnailFile.buffer);
      });
      thumbnailUrl = result.secure_url;
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500);
    throw new Error('Failed to upload media to Cloudinary');
  }

  // Set thumbnail to image if not provided
  if (!thumbnailUrl && imageUrl) {
    thumbnailUrl = imageUrl;
  }

  // Update text fields
  if (title !== undefined) ad.title = title.trim();
  if (subtitle !== undefined) ad.subtitle = subtitle?.trim() || '';
  if (description !== undefined) ad.description = description?.trim() || '';
  if (mediaType !== undefined) ad.mediaType = mediaType;
  if (ctaText !== undefined) ad.ctaText = ctaText?.trim() || 'Learn More';
  if (ctaLink !== undefined) ad.ctaLink = ctaLink?.trim() || '';
  if (pages !== undefined) ad.pages = parsedPages;
  if (placements !== undefined) ad.placements = parsedPlacements;
  if (bgColor !== undefined) ad.bgColor = bgColor;
  if (accentColor !== undefined) ad.accentColor = accentColor;
  if (status !== undefined) ad.status = status;
  if (priority !== undefined) ad.priority = Number(priority);
  if (startDate !== undefined) ad.startDate = startDate;
  if (endDate !== undefined) ad.endDate = endDate || null;
  if (displayOrder !== undefined) ad.displayOrder = Number(displayOrder);
  
  ad.image = imageUrl;
  ad.video = videoUrl;
  ad.thumbnail = thumbnailUrl;
  ad.updatedBy = req.admin._id;

  const updatedAd = await ad.save();

  res.json({
    success: true,
    message: 'Ad updated successfully',
    ad: updatedAd,
  });
});

// @desc    Delete ad
// @route   DELETE /api/ads/:id
// @access  Private/Admin
const deleteAd = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    res.status(404);
    throw new Error('Ad not found');
  }

  // Delete media from Cloudinary
  if (ad.image) {
    try {
      const publicId = ad.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`Ads/${publicId}`);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  if (ad.video) {
    try {
      const publicId = ad.video.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`Ads/Videos/${publicId}`, { resource_type: 'video' });
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  }

  if (ad.thumbnail && ad.thumbnail !== ad.image) {
    try {
      const publicId = ad.thumbnail.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`Ads/Thumbnails/${publicId}`);
    } catch (error) {
      console.error('Error deleting thumbnail:', error);
    }
  }

  await Ad.deleteOne({ _id: req.params.id });

  res.json({
    success: true,
    message: 'Ad deleted successfully',
  });
});

// @desc    Update ad status (Admin only)
// @route   PUT /api/ads/:id/status
// @access  Private/Admin
const updateAdStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['draft', 'active', 'paused', 'expired'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    res.status(404);
    throw new Error('Ad not found');
  }

  ad.status = status;
  ad.updatedBy = req.admin._id;

  await ad.save();

  res.json({
    success: true,
    message: `Ad status updated to ${status}`,
    status: ad.status,
  });
});

// @desc    Bulk delete ads (Admin only)
// @route   POST /api/ads/bulk-delete
// @access  Private/Admin
const bulkDeleteAds = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of ad IDs');
  }

  // Delete media files first
  const ads = await Ad.find({ _id: { $in: ids } });
  
  for (const ad of ads) {
    if (ad.image) {
      try {
        const publicId = ad.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`Ads/${publicId}`);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    if (ad.video) {
      try {
        const publicId = ad.video.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`Ads/Videos/${publicId}`, { resource_type: 'video' });
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  }

  const result = await Ad.deleteMany({ _id: { $in: ids } });

  res.json({
    success: true,
    message: `${result.deletedCount} ads deleted`,
    deletedCount: result.deletedCount,
  });
});

// @desc    Bulk update status (Admin only)
// @route   POST /api/ads/bulk-status
// @access  Private/Admin
const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of ad IDs');
  }

  if (!['draft', 'active', 'paused', 'expired'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const result = await Ad.updateMany(
    { _id: { $in: ids } },
    { $set: { status, updatedBy: req.admin._id } }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} ads updated to ${status}`,
    modifiedCount: result.modifiedCount,
  });
});

// @desc    Get ad statistics
// @route   GET /api/ads/stats
// @access  Private/Admin
const getAdStats = asyncHandler(async (req, res) => {
  const stats = await Ad.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalClicks: { $sum: '$clicks' },
      },
    },
  ]);

  const pageStats = await Ad.aggregate([
    { $unwind: '$pages' },
    {
      $group: {
        _id: '$pages',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const placementStats = await Ad.aggregate([
    { $unwind: '$placements' },
    {
      $group: {
        _id: '$placements',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const topPerforming = await Ad.find({ status: 'active' })
    .sort({ views: -1 })
    .limit(5)
    .select('title views clicks mediaType pages');

  res.json({
    statusStats: stats,
    pageStats,
    placementStats,
    topPerforming,
    totalAds: await Ad.countDocuments(),
    totalActive: await Ad.countDocuments({ status: 'active' }),
  });
});

export {
  // Public
  getAds,
  trackAdClick,
  trackAdView,
  // Admin
  createAd,
  getAllAds,
  getAdById,
  updateAd,
  deleteAd,
  updateAdStatus,
  bulkDeleteAds,
  bulkUpdateStatus,
  getAdStats,
};