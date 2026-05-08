// routes/sellerRoutes.js
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protect } from '../middleware/authMiddleware.js';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import {
  applyForSeller,
  getSellerApplicationStatus,
  getSellerApplicationById,
  getSellerApplications,
  approveSeller,
  rejectSeller,
  updateBankAccount,
  getSellerDashboard,
} from '../controllers/sellerController.js';

const router = express.Router();

// Cloudinary config for seller documents
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Multer -> Cloudinary storage for seller application documents
const sellerDocumentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'The_Brave_Seller_Documents',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'webp'],
    transformation: [{ width: 2000, height: 2000, crop: 'limit' }],
  },
});

const uploadSellerDocuments = multer({
  storage: sellerDocumentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).fields([
  { name: 'brandLogo', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 },
  { name: 'cacCertificate', maxCount: 1 },
  { name: 'governmentId', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 },
]);

// ==================== SELLER ROUTES (Protected) ====================
router.post('/apply', protect, uploadSellerDocuments, applyForSeller);
router.get('/application-status', protect, getSellerApplicationStatus);
router.get('/dashboard', protect, getSellerDashboard);
router.put('/bank-account', protect, updateBankAccount);

// ==================== ADMIN ROUTES (Protected Admin) ====================
router.get('/applications', protectAdmin, getSellerApplications);
router.get('/application/:userId', protectAdmin, getSellerApplicationById);
router.put('/approve/:userId', protectAdmin, approveSeller);
router.put('/reject/:userId', protectAdmin, rejectSeller);

export default router;