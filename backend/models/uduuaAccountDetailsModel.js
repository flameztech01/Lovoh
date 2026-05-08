// models/uduuaAccountDetailsModel.js
import mongoose from 'mongoose';

const uduuaAccountDetailsSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Paystack subaccount for receiving payments
    paystackSubaccountCode: {
      type: String,
      default: '',
    },
    paystackRecipientCode: {
      type: String,
      default: '',
    },
    // Bank account details
    bankName: {
      type: String,
      required: true,
    },
    bankCode: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    // Business verification
    businessName: {
      type: String,
      required: true,
    },
    businessEmail: {
      type: String,
      required: true,
    },
    businessPhone: {
      type: String,
      required: true,
    },
    whatsappPhone: {
      type: String,
      default: '',
    },
    callingPhone: {
      type: String,
      default: '',
    },
    businessAddress: {
      type: String,
      required: true,
    },
    // Documents
    cacCertificate: {
      type: String,
      required: true,
    },
    governmentId: {
      type: String,
      required: true,
    },
    taxIdentificationNumber: {
      type: String,
      required: true,
    },
    proofOfAddress: {
      type: String,
      required: true,
    },
    brandLogo: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: true,
    },
    // Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    // Paystack split configuration
    splitPercentage: {
      type: Number,
      default: 94, // Seller gets 94%, platform gets 6%
    },
  },
  {
    timestamps: true,
  }
);

const UduuaAccountDetails = mongoose.model('UduuaAccountDetails', uduuaAccountDetailsSchema);
export default UduuaAccountDetails;