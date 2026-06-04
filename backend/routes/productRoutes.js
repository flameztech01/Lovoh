// routes/productRoutes.js
import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
  getSellerProducts,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllProductsAdmin,
  searchProducts,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'The_Brave_Products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
  },
});

const reviewStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'The_Brave_Reviews',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const uploadProduct = multer({ 
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadReview = multer({ 
  storage: reviewStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ==================== PUBLIC ROUTES ====================
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);
router.get('/search', searchProducts);

// ==================== SELLER ROUTES (Protected) ====================
router.get('/seller/my-products', protect, getSellerProducts);
router.post('/', protect, uploadProduct.array('images', 5), createProduct);
router.put('/:id', protect, uploadProduct.array('images', 5), updateProduct);
router.delete('/:id', protect, deleteProduct);

// ==================== REVIEW ROUTES (Protected) ====================
router.post('/:id/reviews', protect, uploadReview.array('images', 3), createProductReview);
router.put('/:id/reviews/:reviewId', protect, updateProductReview);
router.delete('/:id/reviews/:reviewId', protect, deleteProductReview);

// ==================== ADMIN ROUTES ====================
router.get('/admin/all', protectAdmin, getAllProductsAdmin);
router.get('/admin/pending', protectAdmin, getPendingProducts);
router.put('/admin/:id/approve', protectAdmin, approveProduct);
router.put('/admin/:id/reject', protectAdmin, rejectProduct);

export default router;