// routes/subscribeRoutes.js
import express from 'express';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendWeeklyDigestManual,
  getSubscriptionStatus
} from '../controllers/subscribeController.js';

const router = express.Router();

// Public routes
router.post('/', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/status', getSubscriptionStatus);

// Admin routes
router.get('/subscribers', protectAdmin, getSubscribers);
router.post('/send-digest', protectAdmin, sendWeeklyDigestManual);

export default router;