// models/SubscribeModel.js
import mongoose from 'mongoose';

const subscribeSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      default: '',
    },
    preferences: {
      magazines: { type: Boolean, default: true },
      articles: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true },
    },
    active: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Subscribe = mongoose.model('Subscribe', subscribeSchema);
export default Subscribe;