// routes/videoRoutes.js
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect, protectBoth } from '../middleware/authMiddleware.js';
import {
  uploadVideo,
  getVideos,
  getVideoById,
  updateVideo, // ADD THIS IMPORT
  deleteVideo,
  likeVideo,
  addComment,
  likeComment,
  deleteComment,
  getUserVideos,
  getFeedVideos,
  postYoutubeVideo,
} from '../controllers/videoController.js';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Use MEMORY storage (not disk storage)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Allowed: MP4, WebM, MOV, AVI'), false);
    }
  },
}).single('video');

// Public routes
router.get('/', getVideos);
router.get('/feed', protectBoth, getFeedVideos);
router.get('/user/:userId', getUserVideos);
router.get('/:id', getVideoById);

// Protected routes
router.post('/', protectBoth, upload, uploadVideo);
router.put('/:id', protectBoth, updateVideo); // ADD THIS LINE - Update video
router.delete('/:id', protectBoth, deleteVideo);
router.post('/:id/like', protectBoth, likeVideo);
router.post('/:id/comment', protectBoth, addComment);
router.post('/:id/comment/:commentId/like', protectBoth, likeComment);
router.delete('/:id/comment/:commentId', protectBoth, deleteComment);
router.post('/youtube', protectBoth, postYoutubeVideo);

export default router;