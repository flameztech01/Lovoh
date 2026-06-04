// controllers/sellerController.js
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import ProductReport from '../models/productReportModel.js';
import UduuaAccountDetails from '../models/uduuaAccountDetailsModel.js';
import UduuaSettings from '../models/uduuaSettingsModel.js';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Helper function to get Paystack secret key from settings
const getPaystackSecretKey = async () => {
  const settings = await UduuaSettings.findOne();
  if (!settings || !settings.payment.paystackEnabled) {
    throw new Error('Paystack payments are currently disabled');
  }
  return settings.payment.paystackSecretKey;
};

// Helper function to get platform fee percentage
const getPlatformFeePercentage = async () => {
  const settings = await UduuaSettings.findOne();
  return settings?.payment?.platformFeePercentage || 6;
};

// Fallback bank mapping for common banks (used when Paystack API fails)
const FALLBACK_BANKS = {
  '044': 'Access Bank',
  '058': 'Guaranty Trust Bank',
  '011': 'First Bank of Nigeria',
  '033': 'United Bank for Africa',
  '057': 'Zenith Bank',
  '070': 'Fidelity Bank',
  '035': 'Wema Bank',
  '214': 'First City Monument Bank',
  '232': 'Sterling Bank',
  '076': 'Polaris Bank',
  '082': 'Keystone Bank',
  '050': 'Ecobank Nigeria',
  '215': 'Unity Bank',
  '007': 'Stanbic IBTC Bank',
  '999992': 'OPay Digital Bank',
  '000013': 'Kuda Bank',
  '000026': 'Moniepoint MFB',
  '000008': 'Opay',
  '000010': 'Palmpay',
};

// Helper function to get bank name from code
const getBankNameFromCode = async (bankCode) => {
  if (!bankCode) return '';
  
  // Check fallback first
  if (FALLBACK_BANKS[bankCode]) {
    return FALLBACK_BANKS[bankCode];
  }
  
  try {
    const PAYSTACK_SECRET_KEY = await getPaystackSecretKey();
    const bankResponse = await axios.get(`${PAYSTACK_BASE_URL}/bank`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      params: { country: 'nigeria', perPage: 100 }
    });
    
    const bank = bankResponse.data.data.find(b => b.code === bankCode);
    return bank?.name || '';
  } catch (error) {
    console.error('Bank fetch error:', error.message);
    return FALLBACK_BANKS[bankCode] || '';
  }
};

// ==================== SELLER APPLICATION ====================

// @desc    Apply to become a seller
// @route   POST /api/seller/apply
// @access  Private
const applyForSeller = asyncHandler(async (req, res) => {
  const {
    businessName,
    businessEmail,
    businessPhone,
    whatsappPhone,
    callingPhone,
    businessAddress,
    bankAccountName,
    bankAccountNumber,
    bankCode,
    taxIdentificationNumber,
  } = req.body;

  // Validate required fields
  if (!businessName || businessName.trim() === '') {
    res.status(400);
    throw new Error('Business name is required');
  }
  if (!businessEmail || businessEmail.trim() === '') {
    res.status(400);
    throw new Error('Business email is required');
  }
  if (!businessPhone || businessPhone.trim() === '') {
    res.status(400);
    throw new Error('Business phone is required');
  }
  if (!businessAddress || businessAddress.trim() === '') {
    res.status(400);
    throw new Error('Business address is required');
  }
  if (!bankAccountName || bankAccountName.trim() === '') {
    res.status(400);
    throw new Error('Bank account name is required');
  }
  if (!bankAccountNumber || bankAccountNumber.trim() === '') {
    res.status(400);
    throw new Error('Bank account number is required');
  }
  if (!bankCode || bankCode.trim() === '') {
    res.status(400);
    throw new Error('Bank selection is required');
  }
  if (!taxIdentificationNumber || taxIdentificationNumber.trim() === '') {
    res.status(400);
    throw new Error('Tax Identification Number is required');
  }

  // Check for uploaded files
  if (!req.files) {
    res.status(400);
    throw new Error('Please upload all required documents');
  }

  const brandLogo = req.files.brandLogo?.[0]?.path || '';
  const profileImage = req.files.profileImage?.[0]?.path || '';
  const cacCertificate = req.files.cacCertificate?.[0]?.path || '';
  const governmentId = req.files.governmentId?.[0]?.path || '';
  const proofOfAddress = req.files.proofOfAddress?.[0]?.path || '';

  if (!brandLogo) {
    res.status(400);
    throw new Error('Brand logo is required');
  }
  if (!profileImage) {
    res.status(400);
    throw new Error('Profile image is required');
  }
  if (!cacCertificate) {
    res.status(400);
    throw new Error('CAC certificate is required');
  }
  if (!governmentId) {
    res.status(400);
    throw new Error('Government ID is required');
  }
  if (!proofOfAddress) {
    res.status(400);
    throw new Error('Proof of address is required');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isSeller) {
    res.status(400);
    throw new Error('You are already a seller');
  }

  if (user.sellerStatus === 'pending') {
    res.status(400);
    throw new Error('Your application is already pending review');
  }

  // Resolve bank name from bank code
  const bankName = await getBankNameFromCode(bankCode);

  // Save seller application
  user.sellerStatus = 'pending';
  user.sellerApplication = {
    businessName: businessName.trim(),
    businessEmail: businessEmail.trim(),
    businessPhone: businessPhone.trim(),
    whatsappPhone: whatsappPhone ? whatsappPhone.trim() : '',
    callingPhone: callingPhone ? callingPhone.trim() : '',
    businessAddress: businessAddress.trim(),
    brandLogo: brandLogo,
    profileImage: profileImage,
    cacCertificate: cacCertificate,
    governmentId: governmentId,
    taxIdentificationNumber: taxIdentificationNumber.trim(),
    proofOfAddress: proofOfAddress,
    bankAccountName: bankAccountName.trim(),
    bankAccountNumber: bankAccountNumber.trim(),
    bankCode: bankCode,
    bankName: bankName,
    submittedAt: new Date(),
    reviewedAt: null,
    rejectionReason: ''
  };

  await user.save();

  console.log('Seller application saved:', {
    userId: user._id,
    businessName,
    bankCode,
    bankName
  });

  res.status(201).json({
    success: true,
    message: 'Seller application submitted successfully. Awaiting admin approval.',
    application: {
      bankCode,
      bankName,
      bankAccountName,
      bankAccountNumber
    }
  });
});

// @desc    Get seller application status for logged-in user
// @route   GET /api/seller/application-status
// @access  Private
const getSellerApplicationStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('isSeller sellerStatus sellerApplication sellerMetrics');

  res.json({
    isSeller: user.isSeller,
    sellerStatus: user.sellerStatus || 'not_applied',
    sellerApplication: user.sellerApplication || {},
    sellerMetrics: user.sellerMetrics || {},
  });
});

// @desc    Get seller application by ID (Admin only)
// @route   GET /api/seller/application/:userId
// @access  Private/Admin
const getSellerApplicationById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    profile: user.profile,
    isSeller: user.isSeller,
    sellerStatus: user.sellerStatus || 'not_applied',
    sellerApplication: user.sellerApplication || {},
    sellerMetrics: user.sellerMetrics || {},
    createdAt: user.createdAt,
  });
});

// @desc    Get all seller applications (Admin only)
// @route   GET /api/seller/applications
// @access  Private/Admin
const getSellerApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  let query = {};
  
  if (status === 'pending') {
    query.sellerStatus = 'pending';
  } else if (status === 'approved') {
    query.sellerStatus = 'approved';
  } else if (status === 'rejected') {
    query.sellerStatus = 'rejected';
  } else if (status === 'all') {
    query.sellerStatus = { $in: ['pending', 'approved', 'rejected'] };
  } else {
    query.sellerStatus = 'pending';
  }

  const users = await User.find(query)
    .select('name email phone profile sellerStatus sellerApplication createdAt')
    .sort({ 'sellerApplication.submittedAt': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    applications: users,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Approve seller application (Admin only)
// @route   PUT /api/seller/approve/:userId
// @access  Private/Admin
const approveSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.sellerStatus !== 'pending') {
    res.status(400);
    throw new Error('Application is not pending');
  }

  // Get Paystack secret key from settings
  let PAYSTACK_SECRET_KEY;
  try {
    PAYSTACK_SECRET_KEY = await getPaystackSecretKey();
  } catch (error) {
    console.error('Paystack not configured:', error.message);
    // Continue without Paystack setup - can be done later
    PAYSTACK_SECRET_KEY = null;
  }

  // Get platform fee percentage
  const platformFeePercentage = await getPlatformFeePercentage();

  // Ensure bank name is set
  let bankName = user.sellerApplication.bankName;
  if (!bankName && user.sellerApplication.bankCode) {
    bankName = await getBankNameFromCode(user.sellerApplication.bankCode);
    user.sellerApplication.bankName = bankName;
    await user.save();
  }

  let subaccountCode = '';
  let recipientCode = '';

  // Only attempt Paystack setup if secret key is available
  if (PAYSTACK_SECRET_KEY) {
    try {
      // Create Paystack subaccount for split payments
      const subaccountResponse = await axios.post(
        `${PAYSTACK_BASE_URL}/subaccount`,
        {
          business_name: user.sellerApplication.businessName,
          settlement_bank: user.sellerApplication.bankCode,
          account_number: user.sellerApplication.bankAccountNumber,
          percentage_charge: platformFeePercentage,
          description: `Seller: ${user.sellerApplication.businessEmail}`,
        },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }
      );

      subaccountCode = subaccountResponse.data.data.subaccount_code;

      // Create transfer recipient for payouts
      const recipientResponse = await axios.post(
        `${PAYSTACK_BASE_URL}/transferrecipient`,
        {
          type: 'nuban',
          name: user.sellerApplication.businessName,
          account_number: user.sellerApplication.bankAccountNumber,
          bank_code: user.sellerApplication.bankCode,
          currency: 'NGN',
        },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }
      );

      recipientCode = recipientResponse.data.data.recipient_code;

      // Save account details to UduuaAccountDetails
      await UduuaAccountDetails.create({
        user: user._id,
        paystackSubaccountCode: subaccountCode,
        paystackRecipientCode: recipientCode,
        bankName: bankName,
        bankCode: user.sellerApplication.bankCode,
        accountNumber: user.sellerApplication.bankAccountNumber,
        accountName: user.sellerApplication.bankAccountName,
        businessName: user.sellerApplication.businessName,
        businessEmail: user.sellerApplication.businessEmail,
        businessPhone: user.sellerApplication.businessPhone,
        whatsappPhone: user.sellerApplication.whatsappPhone,
        callingPhone: user.sellerApplication.callingPhone,
        businessAddress: user.sellerApplication.businessAddress,
        cacCertificate: user.sellerApplication.cacCertificate,
        governmentId: user.sellerApplication.governmentId,
        taxIdentificationNumber: user.sellerApplication.taxIdentificationNumber,
        proofOfAddress: user.sellerApplication.proofOfAddress,
        brandLogo: user.sellerApplication.brandLogo,
        profileImage: user.sellerApplication.profileImage,
        isVerified: true,
        verifiedAt: new Date(),
      });

    } catch (error) {
      console.error('Paystack setup error:', error.response?.data || error.message);
      // Continue with approval even if Paystack fails - can be retried later
    }
  } else {
    console.warn('Paystack not configured. Seller approved without Paystack setup.');
  }

  // Update user
  user.isSeller = true;
  user.sellerStatus = 'approved';
  user.paystackSubaccountCode = subaccountCode;
  user.paystackRecipientCode = recipientCode;
  user.hasPaystackAccount = !!subaccountCode;
  user.sellerApplication.reviewedAt = new Date();

  await user.save();

  res.json({
    success: true,
    message: 'Seller application approved successfully',
    subaccountCode: subaccountCode || 'Paystack setup pending',
    recipientCode: recipientCode || 'Paystack setup pending',
    bankDetails: {
      bankName: user.sellerApplication.bankName,
      bankCode: user.sellerApplication.bankCode,
      accountNumber: user.sellerApplication.bankAccountNumber,
      accountName: user.sellerApplication.bankAccountName
    }
  });
});

// @desc    Reject seller application (Admin only)
// @route   PUT /api/seller/reject/:userId
// @access  Private/Admin
const rejectSeller = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    res.status(400);
    throw new Error('Rejection reason is required');
  }

  const user = await User.findById(req.params.userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.sellerStatus !== 'pending') {
    res.status(400);
    throw new Error('Application is not pending');
  }

  user.sellerStatus = 'rejected';
  user.sellerApplication.rejectionReason = reason;
  user.sellerApplication.reviewedAt = new Date();

  await user.save();

  res.json({
    success: true,
    message: 'Seller application rejected',
  });
});

// @desc    Update seller bank account (Seller only)
// @route   PUT /api/seller/bank-account
// @access  Private (Seller only)
const updateBankAccount = asyncHandler(async (req, res) => {
  const { bankAccountName, bankAccountNumber, bankCode } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user || !user.isSeller) {
    res.status(403);
    throw new Error('You are not a seller');
  }

  if (!bankAccountName || !bankAccountNumber || !bankCode) {
    res.status(400);
    throw new Error('All bank account fields are required');
  }

  // Get Paystack secret key from settings
  let PAYSTACK_SECRET_KEY;
  try {
    PAYSTACK_SECRET_KEY = await getPaystackSecretKey();
  } catch (error) {
    res.status(400);
    throw new Error('Paystack not configured. Please contact admin.');
  }

  // Get bank name from bank code
  const bankName = await getBankNameFromCode(bankCode);

  // Update Paystack recipient
  try {
    const recipientResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      {
        type: 'nuban',
        name: user.sellerApplication?.businessName || user.name,
        account_number: bankAccountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }
    );

    user.paystackRecipientCode = recipientResponse.data.data.recipient_code;
    
    // Update UduuaAccountDetails
    await UduuaAccountDetails.findOneAndUpdate(
      { user: userId },
      {
        bankName: bankName,
        bankCode: bankCode,
        accountNumber: bankAccountNumber,
        accountName: bankAccountName,
        paystackRecipientCode: recipientResponse.data.data.recipient_code,
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Recipient update error:', error.response?.data || error.message);
    res.status(400);
    throw new Error('Failed to update bank account with Paystack');
  }

  // Update user
  if (!user.sellerApplication) {
    user.sellerApplication = {};
  }
  user.sellerApplication.bankAccountName = bankAccountName;
  user.sellerApplication.bankAccountNumber = bankAccountNumber;
  user.sellerApplication.bankCode = bankCode;
  user.sellerApplication.bankName = bankName;

  await user.save();

  res.json({
    success: true,
    message: 'Bank account updated successfully',
    bankAccount: {
      accountName: bankAccountName,
      accountNumber: bankAccountNumber,
      bankName: bankName,
      bankCode: bankCode
    }
  });
});

// @desc    Get seller dashboard stats
// @route   GET /api/seller/dashboard
// @access  Private (Seller only)
const getSellerDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.isSeller) {
    res.status(403);
    throw new Error('You are not a seller');
  }

  const products = await Product.find({ seller: req.user._id });
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive && p.isApproved).length;
  const pendingProducts = products.filter(p => !p.isApproved).length;

  const orders = await Order.find({ seller: req.user._id });
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.deliveryStatus === 'pending').length;
  const processingOrders = orders.filter(o => o.deliveryStatus === 'processing').length;
  const inTransitOrders = orders.filter(o => o.deliveryStatus === 'in_transit').length;
  const deliveredOrders = orders.filter(o => o.deliveryStatus === 'delivered').length;

  const totalRevenue = orders.reduce((sum, order) => sum + (order.sellerPayoutAmount || 0), 0);

  const recentOrders = await Order.find({ seller: req.user._id })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(10);

  const reports = await ProductReport.find({ seller: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    stats: {
      totalProducts,
      activeProducts,
      pendingProducts,
      totalOrders,
      pendingOrders,
      processingOrders,
      inTransitOrders,
      deliveredOrders,
      totalRevenue,
    },
    recentOrders,
    recentReports: reports,
    sellerMetrics: user.sellerMetrics,
  });
});

// ==================== EXPORTS ====================

export {
  applyForSeller,
  getSellerApplicationStatus,
  getSellerApplicationById,
  getSellerApplications,
  approveSeller,
  rejectSeller,
  updateBankAccount,
  getSellerDashboard,
};