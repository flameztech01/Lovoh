// models/magazineModel.js - Updated with social features
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
    pdfUrl: { type: String, required: true },
    coverImage: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    views: { type: Number, default: 0 },
    // Social features
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    shares: { type: Number, default: 0 },
    // Existing
    isFeatured: { type: Boolean, default: false },
    featuredAt: Date,
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    publishedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    authorType: { type: String, enum: ['admin', 'user'], default: 'admin' },
  },
  { timestamps: true }
);

const Magazine = mongoose.model('Magazine', magazineSchema);
export default Magazine;