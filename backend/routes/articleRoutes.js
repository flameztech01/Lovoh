// routes/articleRoutes.js - Final clean version
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protectBoth } from '../middleware/authMiddleware.js';
import {
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
} from '../controllers/articlesController.js';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 5);

// ==================== FIXED/STATIC ROUTES (checked first) ====================
router.get('/', getArticles);
router.post('/', protectBoth, upload, createArticle);
router.get('/categories', getArticleCategories);
router.get('/bookmarks/my', protectBoth, getBookmarkedArticles);

// ==================== SLUG ROUTE - Use a specific path to avoid conflict ====================
router.get('/slug/:slug', getArticleBySlug);

// ==================== ID-BASED ROUTES (all use :id) ====================
router.get('/:id', getArticleById);
router.put('/:id', protectBoth, upload, updateArticle);
router.delete('/:id', protectBoth, deleteArticle);

// Social actions
router.post('/:id/like', protectBoth, likeArticle);
router.post('/:id/bookmark', protectBoth, bookmarkArticle);
router.post('/:id/comment', protectBoth, addArticleComment);
router.post('/:id/comment/:commentId/like', protectBoth, likeArticleComment);
router.delete('/:id/comment/:commentId', protectBoth, deleteArticleComment);

// Admin actions
router.put('/:id/featured', protectBoth, toggleFeatured);
router.put('/:id/editors-pick', protectBoth, toggleEditorsPick);

export default router;