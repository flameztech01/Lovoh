// models/magazineModel.js - Updated with comingSoon, featuredRequest, and User reference
import mongoose from 'mongoose';

const replySchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  userName: String,
  userProfile: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  userName: String,
  userProfile: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
});

const magazineSchema = mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    tags: [String],
    pdfUrl: { type: String, default: '' },
    coverImage: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    views: { type: Number, default: 0 },
    
    // Social features
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    shares: { type: Number, default: 0 },
    
    // Featured & status
    isFeatured: { type: Boolean, default: false },
    featuredAt: Date,
    status: { 
      type: String, 
      enum: ['published', 'draft', 'coming_soon'], 
      default: 'draft' 
    },
    publishedAt: Date,
    
    // Creator information – now referencing User (both regular users and admins)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorType: { type: String, enum: ['admin', 'user'], default: 'user' },
    
    // Coming soon flag
    comingSoon: { type: Boolean, default: false },
    
    // Featured request (user-initiated)
    featuredRequest: { type: Boolean, default: false },
    featuredRequestAt: Date,
  },
  { timestamps: true }
);

const Magazine = mongoose.model('Magazine', magazineSchema);
export default Magazine;