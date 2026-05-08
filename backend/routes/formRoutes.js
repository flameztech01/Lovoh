// routes/formRoutes.js
import express from 'express';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import {
  submitForm,
  getAllFormSubmissions,
  getFormSubmissionById,
  updateFormStatus,
  markAsRead,
  deleteFormSubmission,
  getFormStats,
  bulkDeleteFormSubmissions,
  bulkUpdateStatus
} from '../controllers/formController.js';

const router = express.Router();

// Public route - submit any form
router.post('/submit', submitForm);

// Admin routes
router.get('/', protectAdmin, getAllFormSubmissions);
router.get('/stats', protectAdmin, getFormStats);
router.get('/:id', protectAdmin, getFormSubmissionById);
router.put('/:id/status', protectAdmin, updateFormStatus);
router.put('/:id/read', protectAdmin, markAsRead);
router.delete('/:id', protectAdmin, deleteFormSubmission);

// Bulk operations
router.post('/bulk-delete', protectAdmin, bulkDeleteFormSubmissions);
router.post('/bulk-status', protectAdmin, bulkUpdateStatus);

export default router;