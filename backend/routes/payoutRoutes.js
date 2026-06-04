// routes/payoutRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import {
  getPendingPayouts,
  getCompletedPayouts,
  getAllPayouts,
  processSinglePayout,
  processBulkPayout,
  getPayoutSummary,
  exportPayouts,
  getSellerPayoutHistory,
} from '../controllers/uduuaPayoutController.js';

const router = express.Router();

// ==================== ADMIN PAYOUT ROUTES ====================
router.get('/admin/pending', protectAdmin, getPendingPayouts);
router.get('/admin/completed', protectAdmin, getCompletedPayouts);
router.get('/admin/all', protectAdmin, getAllPayouts);
router.post('/admin/process/:orderId', protectAdmin, processSinglePayout);
router.post('/admin/process-bulk', protectAdmin, processBulkPayout);
router.get('/admin/summary', protectAdmin, getPayoutSummary);
router.get('/admin/export', protectAdmin, exportPayouts);

// ==================== SELLER PAYOUT ROUTES ====================
router.get('/seller/history', protect, getSellerPayoutHistory);

export default router;