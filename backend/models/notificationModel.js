// models/notificationModel.js
import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    deviceTokens: [String], // Firebase Cloud Messaging tokens
    preferences: {
      articles: {
        enabled: { type: Boolean, default: true },
        fromFollowingOnly: { type: Boolean, default: false },
      },
      magazines: {
        enabled: { type: Boolean, default: true },
        fromFollowingOnly: { type: Boolean, default: false },
      },
      videos: {
        enabled: { type: Boolean, default: true },
        fromFollowingOnly: { type: Boolean, default: false },
      },
      followers: {
        enabled: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

const NotificationPreference = mongoose.model(
  'NotificationPreference',
  notificationPreferenceSchema
);

export default NotificationPreference;