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
  getReportStats,
  deleteReport,
  bulkUpdateReportStatus,
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

// ==================== PUBLIC / USER REPORT ROUTES ====================
// Report a product (user must be logged in and have purchased the product)
router.post('/product', protect, uploadReportImages, reportProduct);

// Get seller's own reports (seller only)
router.get('/seller', protect, getSellerReports);

// ==================== ADMIN REPORT ROUTES ====================
// Get all reports with pagination and filters
router.get('/admin', protectAdmin, getAllReports);

// Get report statistics for dashboard
router.get('/admin/stats', protectAdmin, getReportStats);

// Get single report by ID
router.get('/admin/:reportId', protectAdmin, getReportById);

// Update report status (investigating, resolved, dismissed)
router.put('/admin/:reportId/status', protectAdmin, updateReportStatus);

// Delete a report
router.delete('/admin/:reportId', protectAdmin, deleteReport);

// Bulk update report status
router.put('/admin/bulk-update', protectAdmin, bulkUpdateReportStatus);

// Legacy route (keeping for backward compatibility)
router.get('/:reportId', protectAdmin, getReportById);
router.put('/:reportId/status', protectAdmin, updateReportStatus);

export default router;