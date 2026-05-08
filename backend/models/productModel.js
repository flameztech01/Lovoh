// models/productModel.js
import mongoose from 'mongoose';

// Review schema with helpful/not helpful functionality
const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    helpful: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    notHelpful: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  }
);

// Bulk pricing schema
const bulkPricingSchema = mongoose.Schema({
  minQuantity: {
    type: Number,
    required: true,
  },
  maxQuantity: {
    type: Number,
    default: null,
  },
  price: {
    type: Number,
    required: true,
  },
});

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    retailPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    bulkPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['New', 'Trending', 'Bulk Available', 'Shoppers Favourite', 'Limited', 'Featured'],
      default: 'New',
    },
    images: [
      {
        type: String,
      },
    ],
    quantityAvailable: {
      type: Number,
      required: true,
      default: 0,
    },
    quantitySold: {
      type: Number,
      default: 0,
    },
    minOrderAmount: {
      type: Number,
      required: true,
      default: 60000,
    },
    bulkPricing: [bulkPricingSchema],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isSoldOut: {
      type: Boolean,
      default: false,
    },
    // Review fields
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
    // Seller fields
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // Admin approval required
    },
    approvedAt: {
      type: Date,
    },
    deliveryOptions: {
      payOnDelivery: { type: Boolean, default: true },
      payOnline: { type: Boolean, default: true },
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountStartDate: {
      type: Date,
    },
    discountEndDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== VIRTUALS ====================

// Virtual for checking if product can be ordered
productSchema.virtual('canOrder').get(function () {
  return this.isAvailable && !this.isSoldOut && this.quantityAvailable > 0;
});

// Virtual for helpful count
productSchema.virtual('helpfulCount').get(function () {
  if (!this.reviews) return 0;
  return this.reviews.reduce((total, review) => total + (review.helpful?.length || 0), 0);
});

// ==================== METHODS ====================

// Method to calculate discounted price (MOVED HERE from fields)
productSchema.methods.getDiscountedPrice = function() {
  if (this.discount && this.discount > 0) {
    const now = new Date();
    if (this.discountStartDate && this.discountEndDate) {
      if (now >= this.discountStartDate && now <= this.discountEndDate) {
        return this.retailPrice * (1 - this.discount / 100);
      }
    } else {
      return this.retailPrice * (1 - this.discount / 100);
    }
  }
  return this.retailPrice;
};

// Method to calculate price based on quantity
productSchema.methods.calculatePrice = function (quantity) {
  const bulkTier = this.bulkPricing?.find(
    (tier) => quantity >= tier.minQuantity && (!tier.maxQuantity || quantity <= tier.maxQuantity)
  );

  if (bulkTier) {
    return bulkTier.price;
  }

  if (quantity >= 2 && this.bulkPrice) {
    return this.bulkPrice;
  }

  return this.retailPrice;
};

// Method to get total price for a quantity
productSchema.methods.getTotalPrice = function (quantity) {
  return this.calculatePrice(quantity) * quantity;
};

// Method to check if order meets minimum amount
productSchema.methods.meetsMinOrder = function (quantity) {
  const totalPrice = this.getTotalPrice(quantity);
  return totalPrice >= this.minOrderAmount;
};

// Method to get display price based on quantity
productSchema.methods.getDisplayPrice = function (quantity = 1) {
  if (quantity >= 2 && this.bulkPrice) {
    return this.bulkPrice;
  }
  return this.retailPrice;
};

// Method to calculate savings percentage (bulk vs retail)
productSchema.methods.getBulkSavings = function () {
  if (this.retailPrice > this.bulkPrice && this.bulkPrice > 0) {
    return Math.round(((this.retailPrice - this.bulkPrice) / this.retailPrice) * 100);
  }
  return 0;
};

// Method to update rating distribution and average
productSchema.methods.updateRatingStats = function () {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;

  this.reviews.forEach((review) => {
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    totalRating += review.rating;
  });

  this.ratingDistribution = distribution;
  this.numReviews = this.reviews.length;
  this.rating = this.reviews.length > 0 ? totalRating / this.reviews.length : 0;

  return this;
};

// Method to check if user has purchased this product
productSchema.methods.hasUserPurchased = async function (userId) {
  const Order = mongoose.model('Order');
  const order = await Order.findOne({
    user: userId,
    'orderItems.product': this._id,
    status: 'delivered',
    isDelivered: true,
  });
  return !!order;
};

// Method to get user's existing review
productSchema.methods.getUserReview = function (userId) {
  return this.reviews.find(
    (review) => review.user.toString() === userId.toString()
  );
};

// Method to check if user can review
productSchema.methods.canUserReview = async function (userId) {
  const existingReview = this.getUserReview(userId);
  if (existingReview) return false;

  return await this.hasUserPurchased(userId);
};

const Product = mongoose.model('Product', productSchema);

export default Product;