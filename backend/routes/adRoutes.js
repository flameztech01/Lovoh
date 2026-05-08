// routes/adRoutes.js
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import {
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
} from '../controllers/adsController.js';

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Storage for ad images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Ads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif', 'gif'],
    transformation: [{ width: 1200, height: 900, crop: 'limit' }],
  },
});

// Storage for ad videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Ads/Videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm', 'mkv'],
  },
});

// Storage for ad thumbnails
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Ads/Thumbnails',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 400, height: 300, crop: 'limit' }],
  },
});

// Configure multer with different storage for each field
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for manual upload
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

// ==================== PUBLIC ROUTES ====================
router.get('/', getAds);
router.post('/:id/click', trackAdClick);
router.post('/:id/view', trackAdView);

// ==================== ADMIN ROUTES ====================
router.get('/admin/all', protectAdmin, getAllAds);
router.get('/stats', protectAdmin, getAdStats);
router.get('/:id', protectAdmin, getAdById);
router.post('/', protectAdmin, upload, createAd);
router.put('/:id', protectAdmin, upload, updateAd);
router.delete('/:id', protectAdmin, deleteAd);
router.put('/:id/status', protectAdmin, updateAdStatus);
router.post('/bulk-delete', protectAdmin, bulkDeleteAds);
router.post('/bulk-status', protectAdmin, bulkUpdateStatus);

export default router;