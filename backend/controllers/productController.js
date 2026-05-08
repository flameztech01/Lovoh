// controllers/productController.js
import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import { v2 as cloudinary } from 'cloudinary';

// ==================== PUBLIC PRODUCT CONTROLLERS ====================

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, available, status, brand, minPrice, maxPrice, sort, sellerId } = req.query;

  let query = { isApproved: true, isActive: true };

  if (category) query.category = category;
  if (status) query.status = status;
  if (brand) query.brandName = { $regex: brand, $options: 'i' };
  if (sellerId) query.seller = sellerId;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brandName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (minPrice || maxPrice) {
    query.retailPrice = {};
    if (minPrice) query.retailPrice.$gte = Number(minPrice);
    if (maxPrice) query.retailPrice.$lte = Number(maxPrice);
  }

  if (available === 'true') {
    query.isAvailable = true;
    query.isSoldOut = false;
    query.quantityAvailable = { $gt: 0 };
  }

  let sortOptions = { createdAt: -1 };
  if (sort) {
    switch (sort) {
      case 'price-asc': sortOptions = { retailPrice: 1 }; break;
      case 'price-desc': sortOptions = { retailPrice: -1 }; break;
      case 'name-asc': sortOptions = { name: 1 }; break;
      case 'name-desc': sortOptions = { name: -1 }; break;
      case 'popular': sortOptions = { quantitySold: -1 }; break;
      case 'rating': sortOptions = { rating: -1 }; break;
      default: sortOptions = { createdAt: -1 };
    }
  }

  const products = await Product.find(query)
    .sort(sortOptions)
    .populate('seller', 'name businessName brandLogo sellerMetrics');

  const productsWithData = products.map(product => {
    const productObj = product.toObject();
    productObj.bulkSavings = product.getBulkSavings();
    productObj.discountedPrice = product.getDiscountedPrice();
    return productObj;
  });

  res.json(productsWithData);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('reviews.user', 'name profile')
    .populate('seller', 'name businessName brandLogo sellerMetrics phone email');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const productObj = product.toObject();
  productObj.bulkSavings = product.getBulkSavings();
  productObj.discountedPrice = product.getDiscountedPrice();

  if (req.user) {
    productObj.canUserReview = await product.canUserReview(req.user._id);
    productObj.userHasPurchased = await product.hasUserPurchased(req.user._id);
    productObj.userReview = product.getUserReview(req.user._id);
  }

  res.json(productObj);
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories.filter(c => c));
});

// @desc    Get product brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brandName');
  res.json(brands.filter(b => b).sort());
});

// ==================== SELLER PRODUCT CONTROLLERS ====================

// @desc    Create product (Seller only)
// @route   POST /api/products
// @access  Private (Seller)
const createProduct = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.isSeller || user.sellerStatus !== 'approved') {
    res.status(403);
    throw new Error('Only approved sellers can create products');
  }

  const {
    name,
    brandName,
    description,
    retailPrice,
    bulkPrice,
    category,
    status,
    quantityAvailable,
    minOrderAmount,
    bulkPricing,
    payOnDelivery,
    payOnline,
    discount,
    discountStartDate,
    discountEndDate,
  } = req.body;

  if (!name || !brandName || !description || !retailPrice || !category || !quantityAvailable) {
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await cloudinary.uploader.destroy(file.filename);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    }
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  if (Number(retailPrice) <= Number(bulkPrice || 0)) {
    res.status(400);
    throw new Error('Retail price must be greater than bulk price');
  }

  let parsedBulkPricing = [];
  if (bulkPricing) {
    try {
      parsedBulkPricing = typeof bulkPricing === 'string' ? JSON.parse(bulkPricing) : bulkPricing;
    } catch (error) {
      res.status(400);
      throw new Error('Invalid bulk pricing format');
    }
  }

  const images = req.files && req.files.length > 0 ? req.files.map((file) => file.path) : [];

  if (images.length === 0) {
    res.status(400);
    throw new Error('At least one product image is required');
  }

  const product = await Product.create({
    name: name.trim(),
    brandName: brandName.trim().toUpperCase(),
    description: description.trim(),
    retailPrice: Number(retailPrice),
    bulkPrice: Number(bulkPrice || 0),
    category,
    status: status || 'New',
    images,
    quantityAvailable: Number(quantityAvailable),
    quantitySold: 0,
    minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 60000,
    bulkPricing: parsedBulkPricing,
    isAvailable: true,
    isSoldOut: false,
    seller: req.user._id,
    isApproved: false,
    deliveryOptions: {
      payOnDelivery: payOnDelivery === 'true' || payOnDelivery === true,
      payOnline: payOnline === 'true' || payOnline === true,
    },
    discount: discount ? Number(discount) : 0,
    discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
    discountEndDate: discountEndDate ? new Date(discountEndDate) : null,
    rating: 0,
    numReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    createdBy: req.user._id,
  });

  user.sellerMetrics.totalProducts += 1;
  await user.save();

  res.status(201).json(product);
});

// @desc    Get seller's products
// @route   GET /api/products/seller/my-products
// @access  Private (Seller)
const getSellerProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  let query = { seller: req.user._id };
  if (status === 'approved') query.isApproved = true;
  if (status === 'pending') query.isApproved = false;

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  res.json({
    products,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Update product (Seller only)
// @route   PUT /api/products/:id
// @access  Private (Seller)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  const {
    name,
    brandName,
    description,
    retailPrice,
    bulkPrice,
    category,
    status,
    quantityAvailable,
    minOrderAmount,
    bulkPricing,
    payOnDelivery,
    payOnline,
    discount,
    discountStartDate,
    discountEndDate,
    isAvailable,
    keepImages,
  } = req.body;

  if (retailPrice && bulkPrice && Number(retailPrice) <= Number(bulkPrice)) {
    res.status(400);
    throw new Error('Retail price must be greater than bulk price');
  }

  let parsedBulkPricing = product.bulkPricing;
  if (bulkPricing !== undefined) {
    try {
      parsedBulkPricing = typeof bulkPricing === 'string' ? JSON.parse(bulkPricing) : bulkPricing;
    } catch (error) {
      res.status(400);
      throw new Error('Invalid bulk pricing format');
    }
  }

  let updatedImages = product.images;

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => file.path);

    let imagesToKeep = [];
    if (keepImages) {
      imagesToKeep = Array.isArray(keepImages) ? keepImages : [keepImages];
    }

    for (const oldImage of product.images) {
      if (!imagesToKeep.includes(oldImage)) {
        try {
          const publicId = oldImage.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`The_Brave_Products/${publicId}`);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
    }

    updatedImages = [...imagesToKeep, ...newImages];
  }

  if (name) product.name = name.trim();
  if (brandName) product.brandName = brandName.trim().toUpperCase();
  if (description) product.description = description.trim();
  if (retailPrice) product.retailPrice = Number(retailPrice);
  if (bulkPrice) product.bulkPrice = Number(bulkPrice);
  if (category) product.category = category;
  if (status) product.status = status;
  product.images = updatedImages;
  if (quantityAvailable !== undefined) product.quantityAvailable = Number(quantityAvailable);
  if (minOrderAmount !== undefined) product.minOrderAmount = Number(minOrderAmount);
  if (bulkPricing !== undefined) product.bulkPricing = parsedBulkPricing;
  if (isAvailable !== undefined) product.isAvailable = isAvailable === 'true' || isAvailable === true;
  if (payOnDelivery !== undefined) product.deliveryOptions.payOnDelivery = payOnDelivery === 'true' || payOnDelivery === true;
  if (payOnline !== undefined) product.deliveryOptions.payOnline = payOnline === 'true' || payOnline === true;
  if (discount !== undefined) product.discount = Number(discount);
  if (discountStartDate !== undefined) product.discountStartDate = discountStartDate ? new Date(discountStartDate) : null;
  if (discountEndDate !== undefined) product.discountEndDate = discountEndDate ? new Date(discountEndDate) : null;

  const significantChanges = name || description || retailPrice || bulkPrice || updatedImages !== product.images;
  if (significantChanges) {
    product.isApproved = false;
  }

  if (product.quantityAvailable <= 0) {
    product.isSoldOut = true;
    product.isAvailable = false;
  } else {
    product.isSoldOut = false;
  }

  const updatedProduct = await product.save();
  const productObj = updatedProduct.toObject();
  productObj.bulkSavings = updatedProduct.getBulkSavings();
  productObj.discountedPrice = updatedProduct.getDiscountedPrice();

  res.json(productObj);
});

// @desc    Delete product (Seller only)
// @route   DELETE /api/products/:id
// @access  Private (Seller)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  for (const image of product.images) {
    try {
      const publicId = image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`The_Brave_Products/${publicId}`);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  await Product.deleteOne({ _id: req.params.id });

  const user = await User.findById(req.user._id);
  user.sellerMetrics.totalProducts -= 1;
  await user.save();

  res.json({ message: 'Product removed successfully' });
});

// ==================== ADMIN PRODUCT CONTROLLERS ====================

// @desc    Get pending products (Admin only)
// @route   GET /api/products/pending
// @access  Private/Admin
const getPendingProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const products = await Product.find({ isApproved: false, isActive: true })
    .populate('seller', 'name email businessName phone brandLogo')
    .sort({ createdAt: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments({ isApproved: false, isActive: true });

  res.json({
    products,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Approve product (Admin only)
// @route   PUT /api/products/:id/approve
// @access  Private/Admin
const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.isApproved = true;
  product.approvedAt = new Date();

  await product.save();

  res.json({
    success: true,
    message: 'Product approved successfully',
    product,
  });
});

// @desc    Reject product (Admin only)
// @route   PUT /api/products/:id/reject
// @access  Private/Admin
const rejectProduct = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.isApproved = false;
  product.isActive = false;
  product.rejectionReason = reason || 'Product rejected by admin';

  await product.save();

  res.json({
    success: true,
    message: 'Product rejected',
    product,
  });
});

// @desc    Get all products (Admin view)
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isApproved, sellerId } = req.query;

  let query = {};
  if (isApproved !== undefined) query.isApproved = isApproved === 'true';
  if (sellerId) query.seller = sellerId;

  const products = await Product.find(query)
    .populate('seller', 'name email businessName phone')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  res.json({
    products,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total,
  });
});

// ==================== REVIEW CONTROLLERS ====================

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, orderId } = req.body;
  const productId = req.params.id;

  if (!rating || !title || !comment) {
    res.status(400);
    throw new Error('Rating, title, and comment are required');
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const hasPurchased = await product.hasUserPurchased(req.user._id);
  if (!hasPurchased) {
    res.status(403);
    throw new Error('You can only review products you have purchased and received');
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const reviewImages = req.files ? req.files.map(file => file.path) : [];

  let isVerifiedPurchase = hasPurchased;
  if (orderId) {
    const order = await Order.findById(orderId);
    if (order && order.user.toString() === req.user._id.toString()) {
      isVerifiedPurchase = true;
    }
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    title: title.trim(),
    comment: comment.trim(),
    images: reviewImages,
    isVerifiedPurchase,
    orderId: orderId || null,
  };

  product.reviews.push(review);
  product.updateRatingStats();
  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    review: product.reviews[product.reviews.length - 1],
    rating: product.rating,
    numReviews: product.numReviews,
    ratingDistribution: product.ratingDistribution,
  });
});

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'newest', rating } = req.query;
  const product = await Product.findById(req.params.id)
    .populate('reviews.user', 'name profile');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let reviews = [...product.reviews];

  if (rating) {
    reviews = reviews.filter(r => r.rating === Number(rating));
  }

  switch (sort) {
    case 'newest':
      reviews.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case 'oldest':
      reviews.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case 'highest':
      reviews.sort((a, b) => b.rating - a.rating);
      break;
    case 'lowest':
      reviews.sort((a, b) => a.rating - b.rating);
      break;
    default:
      reviews.sort((a, b) => b.createdAt - a.createdAt);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + Number(limit);
  const paginatedReviews = reviews.slice(startIndex, endIndex);

  if (req.user) {
    paginatedReviews.forEach(review => {
      review._doc.userHasMarkedHelpful = review.helpful?.some(
        h => h.user.toString() === req.user._id.toString()
      );
    });
  }

  res.json({
    reviews: paginatedReviews,
    page: Number(page),
    pages: Math.ceil(reviews.length / limit),
    total: reviews.length,
    ratingDistribution: product.ratingDistribution,
    averageRating: product.rating,
  });
});

// @desc    Update product review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
const updateProductReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const { id: productId, reviewId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }

  if (rating) review.rating = Number(rating);
  if (title) review.title = title.trim();
  if (comment) review.comment = comment.trim();

  product.updateRatingStats();
  await product.save();

  res.json({
    success: true,
    message: 'Review updated successfully',
    review,
    rating: product.rating,
  });
});

// @desc    Delete product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = asyncHandler(async (req, res) => {
  const { id: productId, reviewId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  if (review.images && review.images.length > 0) {
    for (const image of review.images) {
      try {
        const publicId = image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`The_Brave_Reviews/${publicId}`);
      } catch (error) {
        console.error('Error deleting review image:', error);
      }
    }
  }

  review.deleteOne();
  product.updateRatingStats();
  await product.save();

  res.json({
    success: true,
    message: 'Review deleted successfully',
    rating: product.rating,
  });
});

export {
  // Public
  getProducts,
  getProductById,
  getCategories,
  getBrands,
  getProductReviews,
  // Seller
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  // Admin
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllProductsAdmin,
  // Reviews
  createProductReview,
  updateProductReview,
  deleteProductReview,
};