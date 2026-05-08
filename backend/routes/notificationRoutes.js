import express from 'express';
import { protectBoth } from '../middleware/authMiddleware.js';
import {
  getPreferences,
  updatePreferences,
  registerDevice,
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/preferences', protectBoth, getPreferences);
router.put('/preferences', protectBoth, updatePreferences);
router.post('/register', protectBoth, registerDevice);

// In-app notifications
router.get('/', protectBoth, getNotifications);
router.put('/:id/read', protectBoth, markAsRead);
router.put('/read-all', protectBoth, markAllAsRead);

export default router;