// models/userModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  brandName: {
    type: String,
    default: "",
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    authMethod: {
      type: String,
      enum: ["google", "local", "email"],
      default: "local",
    },
    
    // ==================== LOGIN SECURITY FIELDS ====================
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    
    // OTP fields
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    resetPasswordOtp: {
      type: String,
      default: null,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
    
    // Paystack fields
    paystackSubaccountCode: { type: String, default: "" },
    paystackRecipientCode: { type: String, default: "" },
    paystackAccountDetails: {
      accountNumber: { type: String, default: "" },
      bankCode: { type: String, default: "" },
      businessName: { type: String, default: "" },
    },
    hasPaymentWallet: { type: Boolean, default: false },

    // Social features
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    bookmarkedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    bookmarkedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],

    storySubscribe: { type: Boolean, default: false },

    likedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    likedMagazines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Magazine" }],
    bookmarkedArticles: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Article" },
    ],
    bookmarkedMagazines: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Magazine" },
    ],
    storySubscribeAt: Date,
    storyUnsubscribeAt: Date,

    cart: [cartItemSchema],

    // Seller fields
    isSeller: { type: Boolean, default: false },
    sellerStatus: {
      type: String,
      enum: ["not_applied", "pending", "approved", "rejected", "suspended"],
      default: "not_applied",
    },
    sellerApplication: {
      businessName: { type: String, default: "" },
      businessEmail: { type: String, default: "" },
      businessPhone: { type: String, default: "" },
      whatsappPhone: { type: String, default: "" },
      callingPhone: { type: String, default: "" },
      businessAddress: { type: String, default: "" },
      brandLogo: { type: String, default: "" },
      profileImage: { type: String, default: "" },
      cacCertificate: { type: String, default: "" },
      governmentId: { type: String, default: "" },
      taxIdentificationNumber: { type: String, default: "" },
      proofOfAddress: { type: String, default: "" },
      bankAccountName: { type: String, default: "" },
      bankAccountNumber: { type: String, default: "" },
      bankName: { type: String, default: "" },
      bankCode: { type: String, default: "" },
      submittedAt: { type: Date, default: Date.now },
      reviewedAt: { type: Date },
      rejectionReason: { type: String, default: "" },
    },
    sellerMetrics: {
      totalProducts: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      responseRate: { type: Number, default: 0 },
      responseTime: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
    },
    hasPaystackAccount: { type: Boolean, default: false },

    // Contributor fields
    biizzed_contributor: {
      type: Boolean,
      default: false,
    },
    contributor_application: {
      status: {
        type: String,
        enum: ["not_applied", "pending", "approved", "rejected"],
        default: "not_applied",
      },
      queryLetter: { type: String, default: "" },
      publishedWorks: [{ type: String }],
      briefBio: { type: String, default: "" },
      resume: { type: String, default: "" },
      adminNotes: { type: String, default: "" },
      submittedAt: { type: Date },
      reviewedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to remove unverified users after 10 minutes
userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 600,
    partialFilterExpression: { isVerified: false },
  }
);

// Method to check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > new Date();
};

// Method to get remaining lock time in minutes
userSchema.methods.getLockTimeRemaining = function () {
  if (!this.lockUntil || this.lockUntil <= new Date()) return 0;
  return Math.ceil((this.lockUntil - new Date()) / 60000);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  return this.save();
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function (maxAttempts, lockoutMinutes) {
  this.loginAttempts = (this.loginAttempts || 0) + 1;
  
  if (this.loginAttempts >= maxAttempts) {
    this.lockUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
  }
  
  return this.save();
};

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (
    !this.isModified("password") ||
    this.password.startsWith("google-auth-")
  ) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.authMethod === "google") {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Cart helper methods
userSchema.methods.addToCart = function (product, quantity = 1) {
  const cartItemIndex = this.cart.findIndex(
    (item) => item.product.toString() === product._id.toString()
  );

  const getItemPrice = (qty) => {
    if (product.bulkPricing && product.bulkPricing.length > 0) {
      const sortedPricing = [...product.bulkPricing].sort(
        (a, b) => b.minQuantity - a.minQuantity
      );
      for (const tier of sortedPricing) {
        if (qty >= tier.minQuantity) {
          return tier.price;
        }
      }
    }
    if (qty >= 2 && product.bulkPrice) {
      return product.bulkPrice;
    }
    const basePrice = product.retailPrice || product.price || 0;
    if (product.discount && product.discount > 0) {
      const now = new Date();
      const isDiscountValid =
        (!product.discountStartDate || now >= product.discountStartDate) &&
        (!product.discountEndDate || now <= product.discountEndDate);
      if (isDiscountValid) {
        return basePrice * (1 - product.discount / 100);
      }
    }
    return basePrice;
  };

  const itemPrice = getItemPrice(quantity);

  if (cartItemIndex >= 0) {
    const newQuantity = this.cart[cartItemIndex].quantity + quantity;
    this.cart[cartItemIndex].quantity = newQuantity;
    this.cart[cartItemIndex].price = getItemPrice(newQuantity);
  } else {
    this.cart.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      price: itemPrice,
      quantity: quantity,
      seller: product.seller,
      brandName: product.brandName,
    });
  }
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  this.cart = this.cart.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  return this.save();
};

userSchema.methods.updateCartItemQuantity = function (
  productId,
  quantity,
  product
) {
  const cartItem = this.cart.find(
    (item) => item.product.toString() === productId.toString()
  );
  if (cartItem) {
    cartItem.quantity = quantity;
    if (product) {
      const getItemPrice = (qty) => {
        if (product.bulkPricing && product.bulkPricing.length > 0) {
          const sortedPricing = [...product.bulkPricing].sort(
            (a, b) => b.minQuantity - a.minQuantity
          );
          for (const tier of sortedPricing) {
            if (qty >= tier.minQuantity) {
              return tier.price;
            }
          }
        }
        if (qty >= 2 && product.bulkPrice) {
          return product.bulkPrice;
        }
        if (product.discount && product.discount > 0) {
          const now = new Date();
          const isDiscountValid =
            (!product.discountStartDate || now >= product.discountStartDate) &&
            (!product.discountEndDate || now <= product.discountEndDate);
          if (isDiscountValid) {
            return (
              (product.retailPrice || product.price || 0) *
              (1 - product.discount / 100)
            );
          }
        }
        return product.retailPrice || product.price || 0;
      };
      cartItem.price = getItemPrice(quantity);
    }
    return this.save();
  }
  throw new Error("Item not found in cart");
};

userSchema.methods.clearCart = function () {
  this.cart = [];
  return this.save();
};

userSchema.methods.getCartTotal = function () {
  if (!this.cart || this.cart.length === 0) return 0;
  return this.cart.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 0),
    0
  );
};

userSchema.methods.getCartItemCount = function () {
  if (!this.cart || this.cart.length === 0) return 0;
  return this.cart.reduce((count, item) => count + (item.quantity || 0), 0);
};

// Auto-update followersCount before saving
userSchema.pre('save', function(next) {
  if (this.isModified('followers')) {
    this.followersCount = this.followers.length;
  }
  if (this.isModified('following')) {
    this.followingCount = this.following.length;
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;