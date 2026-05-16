// routes/videoRoutes.js – Fixed route order
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protectBoth } from '../middleware/authMiddleware.js';
import {
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
} from '../controllers/videoController.js';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Allowed: MP4, WebM, MOV, AVI'), false);
    }
  },
}).single('video');

// ==================== PUBLIC ROUTES (specific paths first) ====================
router.get('/', getVideos);
router.get('/user/:userId', getUserVideos);

// ==================== AUTHENTICATED ROUTES (BEFORE /:id) ====================
router.get('/feed', protectBoth, getFeedVideos);
router.get('/my-videos', protectBoth, getMyVideos);          // ← MUST be before /:id

// ==================== CRUD & Social (these use /:id) ====================
router.post('/', protectBoth, upload, uploadVideo);
router.put('/:id', protectBoth, updateVideo);
router.delete('/:id', protectBoth, deleteVideo);

router.post('/:id/like', protectBoth, likeVideo);
router.post('/:id/comment', protectBoth, addComment);
router.post('/:id/comment/:commentId/like', protectBoth, likeComment);
router.delete('/:id/comment/:commentId', protectBoth, deleteComment);

// YouTube
router.post('/youtube', protectBoth, postYoutubeVideo);

// ==================== PUBLIC single video (MUST BE LAST) ====================
router.get('/:id', getVideoById);  // ← Move to very end

export default router;