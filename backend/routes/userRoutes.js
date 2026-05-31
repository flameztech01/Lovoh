// routes/userRoutes.js
import express from 'express';
import { 
  postMessage, 
  googleAuth, 
  updateProfile, 
  logout, 
  deleteAccount,
  getProfileInfo,
  getProfileById,
  getProfileByUsername,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserSuggestions,
  getUserPosts,
  // Auth routes
  registerUser,
  verifyEmail,
  resendOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  // Settings routes
  changePassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "The_Brave_ProfilePicture",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
  },
});

const upload = multer({ storage });

cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connected successfully"))
  .catch((err) => console.error("❌ Cloudinary not connected:", err.message));

// ==================== PUBLIC ROUTES ====================

// Auth routes
router.post('/auth/google', googleAuth);
router.post('/register', registerUser);           // sign up with email/password
router.post('/verify-email', verifyEmail);        // verify OTP
router.post('/resend-otp', resendOTP);            // resend OTP
router.post('/login', loginUser);                 // email/password login

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Contact route
router.post('/contact', postMessage);

// Public profile routes
router.get('/profile/:id', getProfileById);                    // Get profile by ID
router.get('/profile/username/:username', getProfileByUsername); // Get profile by username
router.get('/profile/:id/posts', getUserPosts);                // Get user posts

// Followers/Following routes (public view)
router.get('/followers/:id', getFollowers);
router.get('/following/:id', getFollowing);

// ==================== PROTECTED ROUTES ====================

// Profile routes
router.get('/profile', protect, getProfileInfo);
router.put('/profile', protect, upload.single('profile'), updateProfile);
router.delete('/profile', protect, deleteAccount);

// Password change route (for settings page)
router.put('/change-password', protect, changePassword);

// Follow/Unfollow routes
router.post('/follow/:id', protect, followUser);
router.post('/unfollow/:id', protect, unfollowUser);
router.get('/suggestions', protect, getUserSuggestions);

// Logout route
router.post('/logout', logout);

export default router;