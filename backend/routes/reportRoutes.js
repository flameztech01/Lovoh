// routes/reportRoutes.js
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protect } from '../middleware/authMiddleware.js';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import {
  reportProduct,
  getSellerReports,
  getAllReports,
  updateReportStatus,
  getReportById,
} from '../controllers/productReportController.js';

const router = express.Router();

// Cloudinary config for report images
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const reportImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'The_Brave_Report_Images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
  },
});

const uploadReportImages = multer({
  storage: reportImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 5);

// ==================== REPORT ROUTES ====================
router.post('/product', protect, uploadReportImages, reportProduct);
router.get('/seller', protect, getSellerReports);
router.get('/admin', protectAdmin, getAllReports);
router.get('/:reportId', protectAdmin, getReportById);
router.put('/:reportId/status', protectAdmin, updateReportStatus);

export default router;