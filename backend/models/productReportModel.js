// models/productReportModel.js
import mongoose from 'mongoose';

const productReportSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportType: {
      type: String,
      enum: ['scam', 'fake_product', 'wrong_item', 'damaged_item', 'not_delivered', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved_refunded', 'resolved_replaced', 'dismissed'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundProcessed: {
      type: Boolean,
      default: false,
    },
    refundReference: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
productReportSchema.index({ product: 1, status: 1 });
productReportSchema.index({ seller: 1, createdAt: -1 });

const ProductReport = mongoose.model('ProductReport', productReportSchema);
export default ProductReport;