import express from 'express';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import { getUserMessage, getOneMessage,markMessageAsRead, deleteUserMessage, authAdmin, registerAdmin, logoutAdmin } from '../controllers/adminController.js';

const router = express.Router();

router.get('/messages', protectAdmin, getUserMessage);
router.get('/messages/:id', protectAdmin, getOneMessage);
router.put('/messages/:id/read', protectAdmin, markMessageAsRead);
router.delete('/messages/:id', protectAdmin, deleteUserMessage);
router.post('/login', authAdmin);
router.post('/register', protectAdmin, registerAdmin);
router.post('/logout', logoutAdmin);

export default router;
