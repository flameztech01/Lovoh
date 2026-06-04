// controllers/productReportController.js
import asyncHandler from 'express-async-handler';
import ProductReport from '../models/productReportModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Report a product (must be verified buyer)
// @route   POST /api/reports/product
// @access  Private
const reportProduct = asyncHandler(async (req, res) => {
  const { productId, orderId, reportType, title, description } = req.body;

  if (!productId || !orderId || !reportType || !title || !description) {
    res.status(400);
    throw new Error('All fields are required');
  }

  // Verify the user has purchased this product
  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    'orderItems.product': productId,
    buyerConfirmedDelivery: true, // Must have confirmed delivery
  });

  if (!order) {
    res.status(403);
    throw new Error('You can only report products you have purchased and received');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if already reported
  const existingReport = await ProductReport.findOne({
    product: productId,
    order: orderId,
    reporter: req.user._id,
  });

  if (existingReport) {
    res.status(400);
    throw new Error('You have already reported this product');
  }

  // Handle uploaded images
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    imageUrls = req.files.map(file => file.path);
  }

  const report = await ProductReport.create({
    product: productId,
    order: orderId,
    reporter: req.user._id,
    seller: product.seller,
    reportType,
    title,
    description,
    images: imageUrls,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully. Admin will investigate.',
    report,
  });
});

// @desc    Get reports for seller (Seller only)
// @route   GET /api/reports/seller
// @access  Private (Seller)
const getSellerReports = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  let query = { seller: req.user._id };
  if (status && status !== 'all') query.status = status;

  const reports = await ProductReport.find(query)
    .populate('product', 'name images retailPrice')
    .populate('reporter', 'name email phone')
    .populate('order', 'orderItems totalPrice deliveryStatus')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ProductReport.countDocuments(query);

  res.json({
    reports,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get all reports (Admin only)
// @route   GET /api/reports/admin
// @access  Private/Admin
const getAllReports = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  let query = {};
  if (status && status !== 'all') query.status = status;

  const reports = await ProductReport.find(query)
    .populate('product', 'name images retailPrice seller')
    .populate('reporter', 'name email phone')
    .populate('seller', 'name email businessName')
    .populate('order', 'orderItems totalPrice deliveryStatus')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ProductReport.countDocuments(query);

  // Get summary statistics
  const pendingCount = await ProductReport.countDocuments({ status: 'pending' });
  const investigatingCount = await ProductReport.countDocuments({ status: 'investigating' });
  const resolvedCount = await ProductReport.countDocuments({ 
    status: { $in: ['resolved_refunded', 'resolved_replaced'] } 
  });
  const dismissedCount = await ProductReport.countDocuments({ status: 'dismissed' });

  res.json({
    reports,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
    summary: {
      pending: pendingCount,
      investigating: investigatingCount,
      resolved: resolvedCount,
      dismissed: dismissedCount,
    },
  });
});

// @desc    Update report status (Admin only)
// @route   PUT /api/reports/:reportId/status
// @access  Private/Admin
const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes, refundAmount } = req.body;

  if (!['investigating', 'resolved_refunded', 'resolved_replaced', 'dismissed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const report = await ProductReport.findById(req.params.reportId)
    .populate('product', 'name seller')
    .populate('reporter', 'name email')
    .populate('order');

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  report.status = status;
  if (adminNotes) report.adminNotes = adminNotes;
  if (refundAmount && status === 'resolved_refunded') {
    report.refundAmount = parseFloat(refundAmount);
    // Here you would initiate refund via Paystack
    // await initiateRefund(report.order.paymentReference, refundAmount);
  }
  report.resolvedAt = new Date();
  report.resolvedBy = req.user._id; // Assuming admin is in req.user

  await report.save();

  res.json({
    success: true,
    message: `Report status updated to ${status}`,
    report,
  });
});

// @desc    Get single report details (Admin only)
// @route   GET /api/reports/:reportId
// @access  Private/Admin
const getReportById = asyncHandler(async (req, res) => {
  const report = await ProductReport.findById(req.params.reportId)
    .populate('product', 'name images retailPrice bulkPrice seller')
    .populate('reporter', 'name email phone profile')
    .populate('seller', 'name email businessName brandLogo')
    .populate('order', 'orderItems totalPrice shippingAddress deliveryStatus')
    .populate('resolvedBy', 'name');

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  res.json(report);
});

// @desc    Get report statistics for dashboard (Admin only)
// @route   GET /api/reports/admin/stats
// @access  Private/Admin
const getReportStats = asyncHandler(async (req, res) => {
  const totalReports = await ProductReport.countDocuments();
  const pendingReports = await ProductReport.countDocuments({ status: 'pending' });
  const investigatingReports = await ProductReport.countDocuments({ status: 'investigating' });
  const resolvedReports = await ProductReport.countDocuments({ 
    status: { $in: ['resolved_refunded', 'resolved_replaced'] } 
  });
  const dismissedReports = await ProductReport.countDocuments({ status: 'dismissed' });

  // Get reports by type
  const reportsByType = await ProductReport.aggregate([
    { $group: { _id: '$reportType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    total: totalReports,
    pending: pendingReports,
    investigating: investigatingReports,
    resolved: resolvedReports,
    dismissed: dismissedReports,
    byType: reportsByType,
  });
});

// @desc    Delete report (Admin only)
// @route   DELETE /api/reports/:reportId
// @access  Private/Admin
const deleteReport = asyncHandler(async (req, res) => {
  const report = await ProductReport.findById(req.params.reportId);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Delete associated images from Cloudinary
  if (report.images && report.images.length > 0) {
    for (const image of report.images) {
      try {
        const publicId = image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`The_Brave_Reports/${publicId}`);
      } catch (error) {
        console.error('Error deleting report image:', error);
      }
    }
  }

  await report.deleteOne();

  res.json({
    success: true,
    message: 'Report deleted successfully',
  });
});

// @desc    Bulk update report status (Admin only)
// @route   PUT /api/reports/admin/bulk-update
// @access  Private/Admin
const bulkUpdateReportStatus = asyncHandler(async (req, res) => {
  const { reportIds, status, adminNotes } = req.body;

  if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
    res.status(400);
    throw new Error('Report IDs are required');
  }

  if (!['investigating', 'resolved_refunded', 'resolved_replaced', 'dismissed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const result = await ProductReport.updateMany(
    { _id: { $in: reportIds } },
    { 
      $set: { 
        status, 
        adminNotes: adminNotes || '',
        resolvedAt: new Date(),
      } 
    }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} reports updated successfully`,
    updatedCount: result.modifiedCount,
  });
});

export {
  reportProduct,
  getSellerReports,
  getAllReports,
  updateReportStatus,
  getReportById,
  getReportStats,
  deleteReport,
  bulkUpdateReportStatus,
};