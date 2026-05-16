// routes/subscribeRoutes.js
import express from 'express';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import {
  subscribe,
  unsubscribe,
  getSubscriptionStatus,
  getSubscribers,           // active only (legacy)
  getAllSubscribers,       // NEW: all with search/status
  adminUnsubscribe,        // NEW: admin force unsubscribe
  sendWeeklyDigestManual,
} from '../controllers/subscribeController.js';

const router = express.Router();

// ==================== Public routes ====================
router.post('/', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/status', getSubscriptionStatus);

// ==================== Admin routes ====================
// Legacy: returns only active subscribers
router.get('/subscribers', protectAdmin, getSubscribers);

// New: returns all subscribers (active + inactive) with pagination, search, and status filter
router.get('/admin/all', protectAdmin, getAllSubscribers);

// Admin force unsubscribe (soft delete)
router.post('/admin/unsubscribe', protectAdmin, adminUnsubscribe);

// Admin manual weekly digest trigger
router.post('/send-digest', protectAdmin, sendWeeklyDigestManual);

export default router;