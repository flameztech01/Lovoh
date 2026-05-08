import express from 'express';
import {
  createEvent,
  getEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  reportEvent,
  toggleEventStatus,
  registerForEvent,
  verifyEventPayment,
  setupPaystackWallet,
  getWalletInfo,
  withdrawEarnings,
  getBankList,
  getEventRegistrations,
  getMyRegistrations,
  getAdminDashboard,
  getEventFilters,
  checkInAttendee,
  verifyTicket,
  handlePaystackWebhook,
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Admin from '../models/adminModel.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Single storage configuration that handles both event and speaker images
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Determine folder based on fieldname
    const isSpeakerImage = file.fieldname.startsWith('speakerImages');
    
    return {
      folder: isSpeakerImage ? 'The_Brave_Events/speakers' : 'The_Brave_Events',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
      transformation: isSpeakerImage 
        ? [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }]
        : [{ width: 2000, height: 2000, crop: 'limit' }],
    };
  },
});

// Single multer upload that accepts all files
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).any(); // Accept any field names

// Unified auth middleware
const protectBoth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt_user) {
    token = req.cookies.jwt_user;
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userId) {
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
        req.user.role = 'user';
        return next();
      }
    }

    if (decoded.adminId) {
      const admin = await Admin.findById(decoded.adminId).select('-password');
      if (admin) {
        req.user = admin;
        req.user.role = 'admin';
        return next();
      }
    }

    res.status(401);
    throw new Error('Not authorized, invalid token');
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, invalid token');
  }
});

// ==================== FIXED PUBLIC ROUTES FIRST ====================
router.get('/banks', getBankList);
router.get('/filters', getEventFilters);
router.get('/registrations/verify/:reference', verifyEventPayment);
router.get('/verify-ticket/:ticketId', verifyTicket);
router.post(
  '/paystack-webhook',
  express.raw({ type: 'application/json' }),
  handlePaystackWebhook
);

// ==================== FIXED PROTECTED ROUTES ====================
router.get('/my-events/list', protect, getMyEvents);
router.get('/my-registrations/list', protect, getMyRegistrations);
router.put('/check-in/:ticketId', protectBoth, checkInAttendee);

// ==================== WALLET ROUTES ====================
router.post('/wallet/setup', protect, setupPaystackWallet);
router.get('/wallet/info', protect, getWalletInfo);
router.post('/wallet/withdraw', protect, withdrawEarnings);

// ==================== ADMIN ROUTES ====================
router.get('/admin/dashboard', protectAdmin, getAdminDashboard);
router.put('/admin/:id/toggle-status', protectAdmin, toggleEventStatus);

// ==================== :id ROUTES (with sub-paths) ====================
router.get('/:id/registrations', protectBoth, getEventRegistrations);
router.post('/:id/register', registerForEvent);
router.post('/:id/report', reportEvent);
router.put('/:id', protectBoth, upload, updateEvent);
router.delete('/:id', protectBoth, deleteEvent);

// ==================== PLAIN :id LAST ====================
router.get('/:id', getEventById);

// ==================== ROOT ROUTES ====================
router.post('/', protectBoth, upload, createEvent);
router.get('/', getEvents);

export default router;