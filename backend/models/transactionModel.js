import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventRegistration',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    companyShare: {
      type: Number,
      required: true,
    },
    creatorShare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    withdrawn: {
      type: Boolean,
      default: false,
    },
    withdrawnAt: Date,
    paystackReference: String,
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;