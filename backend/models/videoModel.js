// models/videoModel.js
import mongoose from 'mongoose';

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const videoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    
    // Video type: 'upload' for regular videos, 'youtube' for YouTube links
    videoType: {
      type: String,
      enum: ['upload', 'youtube'],
      default: 'upload',
    },
    
    // For uploaded videos
    videoUrl: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      default: 0,
    },
    
    // For YouTube videos
    youtubeUrl: {
      type: String,
      default: '',
    },
    youtubeId: {
      type: String,
      default: '',
    },
    youtubeThumbnail: {
      type: String,
      default: '',
    },
    
    category: {
      type: String,
      default: 'General',
    },
    tags: [String],
    views: {
      type: Number,
      default: 0,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [commentSchema],
    shares: {
      type: Number,
      default: 0,
    },
    isEducational: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: String,
    authorProfile: String,
    
    // Author Type field
    authorType: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    
    // Status of the video
    status: {
      type: String,
      enum: ['published', 'draft', 'private'],
      default: 'published',
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
videoSchema.index({ user: 1, createdAt: -1 });
videoSchema.index({ category: 1 });
videoSchema.index({ isEducational: 1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ videoType: 1 });
videoSchema.index({ youtubeId: 1 });
videoSchema.index({ authorType: 1 });

// Text index for search functionality
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Video = mongoose.model('Video', videoSchema);
export default Video;