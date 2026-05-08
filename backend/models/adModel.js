// models/adModel.js
import mongoose from 'mongoose';

const adSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    // Media fields
    mediaType: {
      type: String,
      enum: ['image', 'video', 'both'],
      default: 'image',
    },
    image: {
      type: String,
      default: '',
    },
    video: {
      type: String,
      default: '',
    },
    // For ads that have both image and video (fallback)
    thumbnail: {
      type: String,
      default: '',
    },
    // Ad content
    ctaText: {
      type: String,
      default: 'Learn More',
    },
    ctaLink: {
      type: String,
      default: '',
    },
    // Target pages - where this ad should appear
    // No enum to allow custom pages without model changes
    pages: {
      type: [String],
      default: ['uduua'],
    },
    // Card placement identifiers on each page
    // No enum to allow custom placements without model changes
    placements: {
      type: [String],
      default: ['hero'],
    },
    // Ad styling
    bgColor: {
      type: String,
      default: 'from-[#0043FC] to-[#0038D4]',
    },
    accentColor: {
      type: String,
      default: '#79FFFF',
    },
    // Status and scheduling
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'expired'],
      default: 'active',
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    // Tracking
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    // Order for display
    displayOrder: {
      type: Number,
      default: 0,
    },
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
adSchema.index({ pages: 1, status: 1, startDate: 1, endDate: 1 });
adSchema.index({ placements: 1 });
adSchema.index({ priority: -1 });
adSchema.index({ displayOrder: 1 });

// Virtual for checking if ad is active
adSchema.virtual('isActive').get(function () {
  const now = new Date();
  return (
    this.status === 'active' &&
    this.startDate <= now &&
    (!this.endDate || this.endDate >= now)
  );
});

// Virtual for click-through rate
adSchema.virtual('ctr').get(function () {
  if (this.views === 0) return 0;
  return ((this.clicks / this.views) * 100).toFixed(2);
});

// Method to check if ad is compatible with a card
adSchema.methods.isCompatibleWithCard = function (cardConfig) {
  // If card only supports images and this ad is video-only
  if (!cardConfig.supportsVideo && this.mediaType === 'video') {
    return false;
  }
  // If card only supports videos and this ad is image-only
  if (!cardConfig.supportsImage && this.mediaType === 'image') {
    return false;
  }
  return true;
};

// Method to increment views
adSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Method to increment clicks
adSchema.methods.incrementClicks = function () {
  this.clicks += 1;
  return this.save();
};

// Static method to get ads for a specific page and placement
adSchema.statics.getAdsForPlacement = async function (page, placement, cardConfig = {}) {
  const now = new Date();
  
  const ads = await this.find({
    pages: page,
    placements: placement,
    status: 'active',
    startDate: { $lte: now },
    $or: [
      { endDate: { $gte: now } },
      { endDate: null },
    ],
  }).sort({ priority: -1, displayOrder: 1, createdAt: -1 });

  // Filter ads by card compatibility if cardConfig is provided
  if (cardConfig.supportsImage !== undefined || cardConfig.supportsVideo !== undefined) {
    return ads.filter(ad => {
      if (!cardConfig.supportsVideo && ad.mediaType === 'video') return false;
      if (!cardConfig.supportsImage && ad.mediaType === 'image') return false;
      return true;
    });
  }

  return ads;
};

// Ensure virtuals are included in JSON
adSchema.set('toJSON', { virtuals: true });
adSchema.set('toObject', { virtuals: true });

const Ad = mongoose.model('Ad', adSchema);

export default Ad;