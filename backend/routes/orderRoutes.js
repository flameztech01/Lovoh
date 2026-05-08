// routes/orderRoutes.js
import express from "express";
import {
  // Cart controllers
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  // Order controllers
  createOrder,
  checkoutCart,
  getMyOrders,
  getSellerOwnOrders,
  getOrderById,
  updateDeliveryStatus,
  confirmDelivery,
  cancelOrder,
  // Paystack helpers
  getBankList,
  resolveBankAccount,
  // Paystack payment
  verifyPayment,
  paystackWebhook,
  reinitializePayment,
  // Withdrawal
  initiateWithdrawal,
  getSellerBalance,
  // Admin order controllers
  getAllOrders,
  getSellerOrders,
  confirmPayment,
  rejectPayment,
  processSellerPayout,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// Cloudinary config for payment receipts
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const receiptStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "The_Brave_Receipts",
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "webp"],
    transformation: [{ width: 2000, height: 2000, crop: "limit" }],
  },
});

const uploadReceipt = multer({
  storage: receiptStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ==================== PAYSTACK HELPER ROUTES (Protected) ====================
router.get("/banks", protect, getBankList);
router.post("/resolve-account", protect, resolveBankAccount);

// ==================== CART ROUTES (Protected) ====================
router.get("/cart", protect, getCart);
router.delete("/cart", protect, clearCart);
router.post("/cart/add", protect, addToCart);
router.get("/cart/summary", protect, getCartSummary);
router.put("/cart/:productId", protect, updateCartItem);
router.delete("/cart/:productId", protect, removeFromCart);

// ==================== ORDER ROUTES (Protected) ====================
router.post(
  "/checkout",
  protect,
  uploadReceipt.single("receipt"),
  checkoutCart,
);
router.post("/", protect, uploadReceipt.single("receipt"), createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/seller/orders", protect, getSellerOwnOrders);

router.put("/:id/delivery-status", protect, updateDeliveryStatus);
router.put("/:id/confirm-delivery", protect, confirmDelivery);
router.put("/:id/cancel", protect, cancelOrder);

// ==================== PAYSTACK PAYMENT ROUTES (Public) ====================
router.get("/verify-payment/:reference", verifyPayment);
router.post("/paystack-webhook", paystackWebhook);
// Add this route to orderRoutes.js
router.post("/reinitialize-payment", protect, reinitializePayment);

// ==================== SELLER WITHDRAWAL ROUTES (Protected Seller) ====================
router.post("/withdraw", protect, initiateWithdrawal);
router.get("/seller-balance", protect, getSellerBalance);

// ==================== ADMIN ORDER ROUTES (Protected Admin) ====================
router.get("/admin/all", protectAdmin, getAllOrders);
router.get("/admin/seller/:sellerId", protectAdmin, getSellerOrders);
router.put("/:id/confirm-payment", protectAdmin, confirmPayment);
router.put("/:id/reject-payment", protectAdmin, rejectPayment);
router.post("/:id/process-payout", protectAdmin, processSellerPayout);

router.get("/:id", protect, getOrderById);

export default router;
