// controllers/uduuaPayoutController.js
import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import UduuaAccountDetails from '../models/uduuaAccountDetailsModel.js';
import UduuaSettings from '../models/uduuaSettingsModel.js';
import axios from 'axios';
import mongoose from 'mongoose';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Helper function to get Paystack secret key from settings
const getPaystackSecretKey = async () => {
  const settings = await UduuaSettings.findOne();
  if (!settings || !settings.payment.paystackEnabled) {
    throw new Error('Paystack payments are currently disabled. Please enable Paystack in settings.');
  }
  if (!settings.payment.paystackSecretKey) {
    throw new Error('Paystack secret key not configured. Please update payment settings.');
  }
  return settings.payment.paystackSecretKey;
};

// Helper function to get minimum withdrawal amount
const getMinimumWithdrawal = async () => {
  const settings = await UduuaSettings.findOne();
  return settings?.payment?.minimumWithdrawal || 10000;
};

// Helper function to get platform fee percentage
const getPlatformFeePercentage = async () => {
  const settings = await UduuaSettings.findOne();
  return settings?.payment?.platformFeePercentage || 6;
};

// ==================== ADMIN PAYOUT CONTROLLERS ====================

// @desc    Get all pending payouts (Admin only)
// @route   GET /api/payouts/admin/pending
// @access  Private/Admin
const getPendingPayouts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sellerId } = req.query;

  let query = { 
    sellerPayoutStatus: 'pending', 
    sellerPayoutEligible: true,
    isPaid: true,
    buyerConfirmedDelivery: true
  };
  
  if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
    query.seller = sellerId;
  }

  const orders = await Order.find(query)
    .populate('seller', 'name email businessName phone')
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  // Calculate total pending amount
  const pendingAmounts = await Order.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" } } }
  ]);

  // Group by seller for summary
  const sellerSummary = await Order.aggregate([
    { $match: query },
    { 
      $group: { 
        _id: "$seller", 
        totalAmount: { $sum: "$sellerPayoutAmount" },
        orderCount: { $sum: 1 }
      } 
    },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "sellerInfo" } }
  ]);

  res.json({
    payouts: orders,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
    totalPendingAmount: pendingAmounts[0]?.total || 0,
    sellerSummary: sellerSummary.map(s => ({
      sellerId: s._id,
      businessName: s.sellerInfo[0]?.businessName || s.sellerInfo[0]?.name,
      email: s.sellerInfo[0]?.email,
      totalAmount: s.totalAmount,
      orderCount: s.orderCount,
    })),
  });
});

// @desc    Get completed payouts (Admin only)
// @route   GET /api/payouts/admin/completed
// @access  Private/Admin
const getCompletedPayouts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sellerId, startDate, endDate } = req.query;

  let query = { sellerPayoutStatus: 'completed' };
  
  if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
    query.seller = sellerId;
  }
  if (startDate || endDate) {
    query.sellerPayoutDate = {};
    if (startDate) query.sellerPayoutDate.$gte = new Date(startDate);
    if (endDate) query.sellerPayoutDate.$lte = new Date(endDate);
  }

  const orders = await Order.find(query)
    .populate('seller', 'name email businessName phone')
    .populate('user', 'name email phone')
    .sort({ sellerPayoutDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  const completedAmounts = await Order.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" } } }
  ]);

  res.json({
    payouts: orders,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
    totalCompletedAmount: completedAmounts[0]?.total || 0,
  });
});

// @desc    Get all payouts with filters (Admin only)
// @route   GET /api/payouts/admin/all
// @access  Private/Admin
const getAllPayouts = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, sellerId, search } = req.query;

  let query = {};
  
  if (status === 'pending') {
    query = { sellerPayoutStatus: 'pending', sellerPayoutEligible: true, isPaid: true, buyerConfirmedDelivery: true };
  } else if (status === 'completed') {
    query = { sellerPayoutStatus: 'completed' };
  } else if (status === 'all') {
    query = { sellerPayoutStatus: { $in: ['pending', 'completed'] } };
  }

  if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
    query.seller = sellerId;
  }

  if (search) {
    query.$or = [
      { _id: { $regex: search, $options: 'i' } },
      { 'seller.name': { $regex: search, $options: 'i' } },
      { 'seller.businessName': { $regex: search, $options: 'i' } },
    ];
  }

  const orders = await Order.find(query)
    .populate('seller', 'name email businessName phone bankName accountNumber accountName')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  // Calculate summary
  const [pendingAmount, completedAmount, platformFees] = await Promise.all([
    Order.aggregate([
      { $match: { sellerPayoutStatus: 'pending', sellerPayoutEligible: true, isPaid: true, buyerConfirmedDelivery: true } },
      { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" }, count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $match: { sellerPayoutStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" }, count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$platformAmount" } } }
    ])
  ]);

  const uniqueSellers = await Order.distinct('seller', { sellerPayoutStatus: { $in: ['pending', 'completed'] } });

  res.json({
    payouts: orders,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
    summary: {
      pendingAmount: pendingAmount[0]?.total || 0,
      pendingCount: pendingAmount[0]?.count || 0,
      completedAmount: completedAmount[0]?.total || 0,
      completedCount: completedAmount[0]?.count || 0,
      totalPlatformFees: platformFees[0]?.total || 0,
      totalSellers: uniqueSellers.length,
    },
  });
});

// @desc    Process single payout (Admin only)
// @route   POST /api/payouts/admin/process/:orderId
// @access  Private/Admin
const processSinglePayout = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { amount, notes } = req.body;

  // Get Paystack secret key from settings
  let PAYSTACK_SECRET_KEY;
  try {
    PAYSTACK_SECRET_KEY = await getPaystackSecretKey();
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }

  const order = await Order.findById(orderId).populate('seller');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.sellerPayoutStatus !== 'pending') {
    res.status(400);
    throw new Error('Payout is not pending');
  }

  if (!order.sellerPayoutEligible) {
    res.status(400);
    throw new Error('Order is not eligible for payout');
  }

  const payoutAmount = amount || order.sellerPayoutAmount;

  // Get seller's bank details
  const bankDetails = await UduuaAccountDetails.findOne({ user: order.seller._id });
  
  if (!bankDetails || !bankDetails.paystackRecipientCode) {
    res.status(400);
    throw new Error('Seller bank details not found. Please ask seller to update their bank information.');
  }

  try {
    // Initiate transfer via Paystack
    const transferResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        source: 'balance',
        amount: Math.round(payoutAmount * 100),
        recipient: bankDetails.paystackRecipientCode,
        reason: `Payout for order ${order._id}`,
        reference: `PAYOUT-${order._id}-${Date.now()}`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Update order
    order.sellerPayoutStatus = 'completed';
    order.sellerPayoutDate = new Date();
    order.processedPayoutAmount = payoutAmount;
    order.payoutNotes = notes || `Processed by admin on ${new Date().toLocaleString()}`;
    order.payoutTransactionId = transferResponse.data.data.transfer_code;
    order.payoutReference = transferResponse.data.data.reference;
    await order.save();

    res.json({
      success: true,
      message: 'Payout processed successfully',
      payout: {
        orderId: order._id,
        amount: payoutAmount,
        transactionId: transferResponse.data.data.transfer_code,
        status: transferResponse.data.data.status,
      },
    });
  } catch (error) {
    console.error('Payout error:', error.response?.data || error.message);
    
    // Mark as failed
    order.sellerPayoutStatus = 'failed';
    order.payoutError = error.response?.data?.message || error.message;
    await order.save();

    res.status(500);
    throw new Error(error.response?.data?.message || 'Failed to process payout');
  }
});

// @desc    Process bulk payouts (Admin only)
// @route   POST /api/payouts/admin/process-bulk
// @access  Private/Admin
const processBulkPayout = asyncHandler(async (req, res) => {
  const { orderIds, notes } = req.body;

  // Get Paystack secret key from settings
  let PAYSTACK_SECRET_KEY;
  try {
    PAYSTACK_SECRET_KEY = await getPaystackSecretKey();
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    res.status(400);
    throw new Error('Order IDs are required');
  }

  const orders = await Order.find({ 
    _id: { $in: orderIds },
    sellerPayoutStatus: 'pending',
    sellerPayoutEligible: true,
    isPaid: true,
    buyerConfirmedDelivery: true
  }).populate('seller');

  if (orders.length === 0) {
    res.status(404);
    throw new Error('No valid pending payouts found');
  }

  let processedCount = 0;
  let failedCount = 0;
  const failedOrders = [];

  for (const order of orders) {
    try {
      const bankDetails = await UduuaAccountDetails.findOne({ user: order.seller._id });
      
      if (!bankDetails || !bankDetails.paystackRecipientCode) {
        failedCount++;
        failedOrders.push({ orderId: order._id, reason: 'Bank details not found' });
        continue;
      }

      const transferResponse = await axios.post(
        `${PAYSTACK_BASE_URL}/transfer`,
        {
          source: 'balance',
          amount: Math.round(order.sellerPayoutAmount * 100),
          recipient: bankDetails.paystackRecipientCode,
          reason: `Payout for order ${order._id}`,
          reference: `PAYOUT-${order._id}-${Date.now()}`,
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      order.sellerPayoutStatus = 'completed';
      order.sellerPayoutDate = new Date();
      order.processedPayoutAmount = order.sellerPayoutAmount;
      order.payoutNotes = notes || `Bulk payout processed by admin on ${new Date().toLocaleString()}`;
      order.payoutTransactionId = transferResponse.data.data.transfer_code;
      order.payoutReference = transferResponse.data.data.reference;
      await order.save();
      
      processedCount++;
    } catch (error) {
      failedCount++;
      failedOrders.push({ orderId: order._id, reason: error.response?.data?.message || error.message });
      
      order.sellerPayoutStatus = 'failed';
      order.payoutError = error.response?.data?.message || error.message;
      await order.save();
    }
  }

  res.json({
    success: true,
    message: `Processed ${processedCount} payouts successfully. Failed: ${failedCount}`,
    processedCount,
    failedCount,
    failedOrders,
  });
});

// @desc    Get payout summary statistics (Admin only)
// @route   GET /api/payouts/admin/summary
// @access  Private/Admin
const getPayoutSummary = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Run all aggregations in parallel
  const [
    monthlyStats,
    weeklyStats,
    yearlyStats,
    platformStats,
    topSellers,
    pendingStats,
    completedStats,
  ] = await Promise.all([
    // Monthly payouts
    Order.aggregate([
      { $match: { sellerPayoutDate: { $gte: startOfMonth }, sellerPayoutStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" }, count: { $sum: 1 } } }
    ]),
    // Weekly payouts
    Order.aggregate([
      { $match: { sellerPayoutDate: { $gte: startOfWeek }, sellerPayoutStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" }, count: { $sum: 1 } } }
    ]),
    // Yearly payouts
    Order.aggregate([
      { $match: { sellerPayoutDate: { $gte: startOfYear }, sellerPayoutStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" }, count: { $sum: 1 } } }
    ]),
    // Platform revenue stats
    Order.aggregate([
      { $match: { isPaid: true } },
      { 
        $group: { 
          _id: null, 
          totalPlatformFees: { $sum: "$platformAmount" },
          totalSales: { $sum: "$totalPrice" }
        } 
      }
    ]),
    // Top sellers by payout amount
    Order.aggregate([
      { $match: { sellerPayoutStatus: 'completed' } },
      { 
        $group: { 
          _id: "$seller", 
          totalPayout: { $sum: "$sellerPayoutAmount" },
          orderCount: { $sum: 1 }
        } 
      },
      { $sort: { totalPayout: -1 } },
      { $limit: 10 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "sellerInfo" } }
    ]),
    // Pending payouts stats
    Order.aggregate([
      { $match: { sellerPayoutStatus: 'pending', sellerPayoutEligible: true, isPaid: true, buyerConfirmedDelivery: true } },
      { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" }, count: { $sum: 1 } } }
    ]),
    // Completed payouts stats
    Order.aggregate([
      { $match: { sellerPayoutStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: "$sellerPayoutAmount" }, count: { $sum: 1 } } }
    ])
  ]);

  // Monthly breakdown for chart
  const monthlyBreakdown = await Order.aggregate([
    { $match: { sellerPayoutStatus: 'completed', sellerPayoutDate: { $exists: true } } },
    {
      $group: {
        _id: {
          year: { $year: "$sellerPayoutDate" },
          month: { $month: "$sellerPayoutDate" }
        },
        total: { $sum: "$sellerPayoutAmount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 }
  ]);

  res.json({
    monthly: {
      total: monthlyStats[0]?.total || 0,
      count: monthlyStats[0]?.count || 0,
    },
    weekly: {
      total: weeklyStats[0]?.total || 0,
      count: weeklyStats[0]?.count || 0,
    },
    yearly: {
      total: yearlyStats[0]?.total || 0,
      count: yearlyStats[0]?.count || 0,
    },
    platform: {
      totalFees: platformStats[0]?.totalPlatformFees || 0,
      totalSales: platformStats[0]?.totalSales || 0,
    },
    pending: {
      total: pendingStats[0]?.total || 0,
      count: pendingStats[0]?.count || 0,
    },
    completed: {
      total: completedStats[0]?.total || 0,
      count: completedStats[0]?.count || 0,
    },
    topSellers: topSellers.map(s => ({
      sellerId: s._id,
      businessName: s.sellerInfo[0]?.businessName || s.sellerInfo[0]?.name,
      email: s.sellerInfo[0]?.email,
      totalPayout: s.totalPayout,
      orderCount: s.orderCount,
    })),
    monthlyBreakdown: monthlyBreakdown.map(m => ({
      month: `${m._id.year}-${m._id.month}`,
      total: m.total,
      count: m.count,
    })),
  });
});

// @desc    Export payouts to CSV (Admin only)
// @route   GET /api/payouts/admin/export
// @access  Private/Admin
const exportPayouts = asyncHandler(async (req, res) => {
  const { status, startDate, endDate, sellerId } = req.query;

  let query = {};
  
  if (status === 'pending') {
    query = { sellerPayoutStatus: 'pending', sellerPayoutEligible: true, isPaid: true, buyerConfirmedDelivery: true };
  } else if (status === 'completed') {
    query = { sellerPayoutStatus: 'completed' };
  } else if (status === 'all') {
    query = { sellerPayoutStatus: { $in: ['pending', 'completed'] } };
  }

  if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
    query.seller = sellerId;
  }

  if (startDate || endDate) {
    const dateField = status === 'completed' ? 'sellerPayoutDate' : 'createdAt';
    query[dateField] = {};
    if (startDate) query[dateField].$gte = new Date(startDate);
    if (endDate) query[dateField].$lte = new Date(endDate);
  }

  const orders = await Order.find(query)
    .populate('seller', 'name email businessName phone bankName accountNumber accountName')
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  // Create CSV
  const csvHeaders = [
    'Order ID', 'Order Date', 'Seller Name', 'Seller Business', 'Seller Email', 
    'Seller Phone', 'Seller Bank', 'Seller Account Number', 'Seller Account Name',
    'Order Amount (₦)', 'Platform Fee (₦)', 'Seller Payout (₦)', 
    'Payout Status', 'Payout Date', 'Transaction ID',
    'Customer Name', 'Customer Email', 'Customer Phone'
  ];

  const csvRows = orders.map(order => [
    order._id,
    new Date(order.createdAt).toLocaleDateString(),
    order.seller?.name || 'N/A',
    order.seller?.businessName || 'N/A',
    order.seller?.email || 'N/A',
    order.seller?.phone || 'N/A',
    order.seller?.bankName || 'N/A',
    order.seller?.accountNumber || 'N/A',
    order.seller?.accountName || 'N/A',
    (order.totalPrice || 0).toLocaleString(),
    (order.platformAmount || 0).toLocaleString(),
    (order.sellerPayoutAmount || 0).toLocaleString(),
    order.sellerPayoutStatus === 'completed' ? 'Completed' : 'Pending',
    order.sellerPayoutDate ? new Date(order.sellerPayoutDate).toLocaleDateString() : 'Not processed',
    order.payoutTransactionId || 'N/A',
    order.user?.name || 'N/A',
    order.user?.email || 'N/A',
    order.user?.phone || 'N/A',
  ]);

  const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=payouts_${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csvContent);
});

// @desc    Get seller payout history (Seller only)
// @route   GET /api/payouts/seller/history
// @access  Private (Seller)
const getSellerPayoutHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const sellerId = req.user._id;

  const orders = await Order.find({ 
    seller: sellerId,
    sellerPayoutStatus: { $in: ['completed', 'pending', 'failed'] }
  })
    .populate('user', 'name email')
    .sort({ sellerPayoutDate: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments({ 
    seller: sellerId,
    sellerPayoutStatus: { $in: ['completed', 'pending', 'failed'] }
  });

  // Calculate totals
  const totals = await Order.aggregate([
    { $match: { seller: mongoose.Types.ObjectId(sellerId) } },
    {
      $group: {
        _id: '$sellerPayoutStatus',
        total: { $sum: '$sellerPayoutAmount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const summary = {
    completed: totals.find(t => t._id === 'completed')?.total || 0,
    pending: totals.find(t => t._id === 'pending')?.total || 0,
    failed: totals.find(t => t._id === 'failed')?.total || 0,
    total: orders.reduce((sum, o) => sum + (o.sellerPayoutAmount || 0), 0),
  };

  res.json({
    payouts: orders,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
    summary,
  });
});

export {
  getPendingPayouts,
  getCompletedPayouts,
  getAllPayouts,
  processSinglePayout,
  processBulkPayout,
  getPayoutSummary,
  exportPayouts,
  getSellerPayoutHistory,
};