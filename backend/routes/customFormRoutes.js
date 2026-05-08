// routes/customFormRoutes.js - Fixed route order
import express from 'express';
import { protectBoth } from '../middleware/authMiddleware.js';
import {
  createForm,
  getForms,
  getFormById,
  getPublicForm,
  updateForm,
  deleteForm,
  duplicateForm,
  submitForm,
  getSubmissions,
  getSubmissionById,
  deleteSubmission,
  exportSubmissions,
  addManager,
  removeManager,
  getFormAnalytics,
  adminGetAllForms,
} from '../controllers/customFormController.js';

const router = express.Router();

// ==================== PUBLIC ROUTES FIRST ====================
// These MUST be before any /:id routes
router.get('/public/:slug', getPublicForm);
router.post('/public/:slug/submit', submitForm);

// ==================== ADMIN ROUTE ====================
router.get('/admin/all', protectBoth, adminGetAllForms);

// ==================== PROTECTED CRUD ====================
router.post('/', protectBoth, createForm);
router.get('/', protectBoth, getForms);

// ==================== ID-BASED ROUTES LAST ====================
router.get('/:id', protectBoth, getFormById);
router.put('/:id', protectBoth, updateForm);
router.delete('/:id', protectBoth, deleteForm);
router.post('/:id/duplicate', protectBoth, duplicateForm);

// Submissions
router.get('/:id/submissions', protectBoth, getSubmissions);
router.get('/:id/submissions/export', protectBoth, exportSubmissions);
router.get('/:id/submissions/:submissionId', protectBoth, getSubmissionById);
router.delete('/:id/submissions/:submissionId', protectBoth, deleteSubmission);

// Managers
router.post('/:id/managers', protectBoth, addManager);
router.delete('/:id/managers/:userId', protectBoth, removeManager);

// Analytics
router.get('/:id/analytics', protectBoth, getFormAnalytics);

export default router;