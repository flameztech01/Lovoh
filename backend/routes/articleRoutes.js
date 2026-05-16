// routes/articleRoutes.js – With featured requests & user's own articles
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protectBoth } from '../middleware/authMiddleware.js';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import {
  createArticle,
  getArticles,
  getUserArticles,
  getArticleBySlug,
  getArticleById,
  updateArticle,
  deleteArticle,
  requestFeatured,
  approveFeatured,
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

// ==================== PUBLIC ROUTES ====================
router.get('/', getArticles);
router.get('/categories', getArticleCategories);
router.get('/slug/:slug', getArticleBySlug);

// ==================== AUTHENTICATED USER ROUTES ====================
router.get('/my-articles', protectBoth, getUserArticles);
router.get('/bookmarks/my', protectBoth, getBookmarkedArticles);

// CRUD (authenticated)
router.post('/', protectBoth, upload, createArticle);
router.get('/:id', protectBoth, getArticleById);
router.put('/:id', protectBoth, upload, updateArticle);
router.delete('/:id', protectBoth, deleteArticle);

// Social
router.post('/:id/like', protectBoth, likeArticle);
router.post('/:id/bookmark', protectBoth, bookmarkArticle);
router.post('/:id/comment', protectBoth, addArticleComment);
router.post('/:id/comment/:commentId/like', protectBoth, likeArticleComment);
router.delete('/:id/comment/:commentId', protectBoth, deleteArticleComment);

// Featured requests
router.post('/:id/request-featured', protectBoth, requestFeatured);
router.post('/:id/approve-featured', protectAdmin, approveFeatured);

// Admin moderation (toggle featured/editors-pick – controller checks admin role)
router.put('/:id/featured', protectBoth, toggleFeatured);
router.put('/:id/editors-pick', protectBoth, toggleEditorsPick);

export default router;