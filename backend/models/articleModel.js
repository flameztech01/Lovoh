// models/articleModel.js - Added comingSoon support
import mongoose from 'mongoose';

const replySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  userName: String,
  userProfile: String,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const commentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  userName: String,
  userProfile: String,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  replies: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const articleSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: '', // Not required – allows coming soon articles
    },
    category: {
      type: String,
      required: true,
    },
    tags: [String],
    images: [String],
    featuredImage: {
      type: String,
    },
    author: {
      type: String,
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    authorType: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    readTime: {
      type: String,
      default: '5 min read',
    },
    views: {
      type: Number,
      default: 0,
    },
    // Social features
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    bookmarks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [commentSchema],
    shares: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isEditorsPick: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'coming_soon'],
      default: 'draft',
    },
    publishedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // NEW: comingSoon flag – for frontend convenience
    comingSoon: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
articleSchema.index({ slug: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ likes: 1 });
articleSchema.index({ bookmarks: 1 });
articleSchema.index({ 'comments.user': 1 });

// Calculate read time (only if content exists and is not empty)
articleSchema.pre('save', function(next) {
  if (this.isModified('content') && this.content && this.content.trim().length > 0) {
    const words = this.content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    this.readTime = `${minutes} min read`;
  } else if (this.comingSoon || this.status === 'coming_soon') {
    this.readTime = 'Coming Soon';
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);
export default Article;