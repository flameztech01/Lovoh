// routes/magRoutes.js – Full with user magazines, featured requests, and ownership
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
  getUserMagazines,
  updateMagazine,
  deleteMagazine,
  requestFeatured,
  approveFeatured,
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

// ------------------ Public routes (specific paths first) ------------------
router.get('/', getMagazines);
router.get('/stats', getMagazineStats);

// ------------------ Authenticated user routes (BEFORE /:slug) ------------------
router.get('/my-magazines', protectBoth, getUserMagazines);
router.get('/bookmarks/list', protectBoth, getBookmarkedMagazines);
router.get('/id/:id', protectBoth, getMagazineById);

// ------------------ Social interactions ------------------
router.post('/:id/like', protectBoth, likeMagazine);
router.post('/:id/bookmark', protectBoth, bookmarkMagazine);
router.post('/:id/comment', protectBoth, addMagazineComment);
router.post('/:id/comment/:commentId/like', protectBoth, likeMagazineComment);
router.delete('/:id/comment/:commentId', protectBoth, deleteMagazineComment);

// ------------------ Magazine CRUD ------------------
router.post('/', protectBoth, upload, createMagazine);
router.put('/:id', protectBoth, upload, updateMagazine);
router.delete('/:id', protectBoth, deleteMagazine);

// ------------------ Featured requests ------------------
router.post('/:id/request-featured', protectBoth, requestFeatured);
router.post('/:id/approve-featured', protectAdmin, approveFeatured);
router.put('/:id/featured', protectAdmin, toggleFeatured);

// ------------------ Public slug route (MUST BE LAST) ------------------
router.get('/:slug', getMagazineBySlug);

export default router;