import mongoose from 'mongoose';

const inAppNotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['article', 'magazine', 'video', 'follow', 'unfollow', 'system'],
      required: true,
    },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }, // extra payload (slug, contentId, etc.)
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model('InAppNotification', inAppNotificationSchema);