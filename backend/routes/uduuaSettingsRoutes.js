// routes/uduuaSettingsRoutes.js
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import {
  getAllSettings,
  updateGeneralSettings,
  updateStoreSettings,
  updatePaymentSettings,
  updateEmailSettings,
  updateSecuritySettings,
  updateAppearanceSettings,
  updateSeoSettings,
  testEmailConfig,
  sendPromoEmail,
  sendProductNotification,
  clearCache,
  getPublicSettings,
} from '../controllers/uduuaSettingsController.js';

const router = express.Router();

// Cloudinary config for logo uploads
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Uduua_Settings',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'svg'],
    transformation: [{ width: 200, height: 200, crop: 'limit' }],
  },
});

const uploadLogo = multer({ storage: logoStorage }).single('logo');

// Public routes
router.get('/public', getPublicSettings);

// Admin routes
router.get('/', protectAdmin, getAllSettings);
router.put('/general', protectAdmin, uploadLogo, updateGeneralSettings);
router.put('/store', protectAdmin, updateStoreSettings);
router.put('/payment', protectAdmin, updatePaymentSettings);
router.put('/email', protectAdmin, updateEmailSettings);
router.put('/security', protectAdmin, updateSecuritySettings);
router.put('/appearance', protectAdmin, updateAppearanceSettings);
router.put('/seo', protectAdmin, updateSeoSettings);
router.post('/test-email', protectAdmin, testEmailConfig);
router.post('/send-promo-email', protectAdmin, sendPromoEmail);
router.post('/send-product-notification', protectAdmin, sendProductNotification);
router.post('/clear-cache', protectAdmin, clearCache);

export default router;