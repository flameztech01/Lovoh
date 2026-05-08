// routes/magRoutes.js - Refactored (subscription routes removed)
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import { protectBoth } from '../middleware/authMiddleware.js';
import {
  createMagazine,
  getMagazines,
  getMagazineBySlug,
  getMagazineById,
  updateMagazine,
  deleteMagazine,
  toggleFeatured,
  getMagazineStats,
  likeMagazine,
  bookmarkMagazine,
  addMagazineComment,
  likeMagazineComment,
  deleteMagazineComment,
  getBookmarkedMagazines,
} from '../controllers/magController.js';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
}).fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

// ------------------ Static / Specific routes first ------------------
router.get('/', getMagazines);
router.get('/stats', getMagazineStats);
router.get('/bookmarks/list', protectBoth, getBookmarkedMagazines);

// Slug route (must be before /:id to avoid slug being mistaken for id)
router.get('/:slug', getMagazineBySlug);

// Admin ID route
router.get('/id/:id', protectAdmin, getMagazineById);

// ------------------ Auth required social actions ------------------
router.post('/:id/like', protectBoth, likeMagazine);
router.post('/:id/bookmark', protectBoth, bookmarkMagazine);
router.post('/:id/comment', protectBoth, addMagazineComment);
router.post('/:id/comment/:commentId/like', protectBoth, likeMagazineComment);
router.delete('/:id/comment/:commentId', protectBoth, deleteMagazineComment);

// ------------------ Admin only actions ------------------
router.post('/', protectAdmin, upload, createMagazine);
router.put('/:id', protectAdmin, upload, updateMagazine);
router.delete('/:id', protectAdmin, deleteMagazine);
router.put('/:id/featured', protectAdmin, toggleFeatured);

export default router;