// routes/eventRoutes.js
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
  getEventCustomForm,
  updateEventCustomForm,
  sendReminder,
  sendAllReminders,
  generatePosterForRegistration,   // <-- NEW import
  getPosterStatus,                 // <-- NEW import
} from '../controllers/eventController.js';

// NEW: Import team controller functions
import {
  addTeamMember,
  removeTeamMember,
  getEventTeam,
  getMyTeamEvents,
  getEventRegistrationsTeam,
  verifyTicketTeam,
  verifyTicketValidityTeam,
} from '../controllers/eventTeamController.js';

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

// ==================== MULTER CONFIG ====================
// Storage for event/speaker images (multiple)
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
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

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).any();

// NEW: Single file upload for poster photo (temporary storage, then processed by controller)
const uploadPosterPhoto = multer({
  storage: multer.diskStorage({}), // store in memory; controller will handle Cloudinary upload
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('photo');

// ==================== AUTH MIDDLEWARE ====================
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

// ==================== PUBLIC ROUTES (no auth) ====================
router.get('/banks', getBankList);
router.get('/filters', getEventFilters);
router.get('/registrations/verify/:reference', verifyEventPayment);
router.get('/verify-ticket/:ticketId', verifyTicket);
router.post(
  '/paystack-webhook',
  express.raw({ type: 'application/json' }),
  handlePaystackWebhook
);

// ==================== PROTECTED ROUTES (user or admin) ====================
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

// ==================== REMINDER ROUTES ====================
router.post('/:id/send-reminder', protectBoth, sendReminder);
router.post('/send-all-reminders', sendAllReminders);

// ==================== CUSTOM FORM ROUTES ====================
router.get('/:id/custom-form', getEventCustomForm);
router.put('/:id/custom-form', protectBoth, updateEventCustomForm);

// ==================== TEAM MEMBER ROUTES ====================
router.get('/team/my-events', protectBoth, getMyTeamEvents);

router
  .route('/:id/team')
  .get(protectBoth, getEventTeam)
  .post(protectBoth, addTeamMember);

router.delete('/:id/team/:userId', protectBoth, removeTeamMember);

router.get('/:id/team/registrations', protectBoth, getEventRegistrationsTeam);
router.get('/:id/team/verify/:ticketId', protectBoth, verifyTicketValidityTeam);
router.post('/:id/team/checkin/:ticketId', protectBoth, verifyTicketTeam);

// ==================== POSTER ROUTES (NEW) ====================
// Get poster status for a registration
router.get('/:id/registrations/:registrationId/poster', getPosterStatus);
// Generate poster for a registration (upload photo)
router.post(
  '/:id/registrations/:registrationId/generate-poster',
  uploadPosterPhoto,
  generatePosterForRegistration
);

// ==================== EVENT REGISTRATION (public) ====================
router.post('/:id/register', registerForEvent);

// ==================== EVENT REPORTING ====================
router.post('/:id/report', reportEvent);

// ==================== EVENT CRUD (protected) ====================
router.put('/:id', protectBoth, upload, updateEvent);
router.delete('/:id', protectBoth, deleteEvent);

// ==================== GET EVENT REGISTRATIONS (creator/admin only) ====================
router.get('/:id/registrations', protectBoth, getEventRegistrations);

// ==================== GET SINGLE EVENT (public - must be last) ====================
router.get('/:id', getEventById);

// ==================== CREATE EVENT & GET ALL EVENTS ====================
router.post('/', protectBoth, upload, createEvent);
router.get('/', getEvents);

export default router;