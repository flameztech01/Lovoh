// models/orderModel.js
import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const shippingAddressSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: 'Nigeria',
  },
  deliveryNotes: {
    type: String,
  },
});

const deliveryTrackingSchema = mongoose.Schema({
  riderName: { type: String, default: '' },
  riderPhone: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  lastUpdate: { type: Date },
  updates: [{
    status: { type: String },
    message: { type: String },
    date: { type: Date, default: Date.now },
  }],
});

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      required: true,
      enum: ['paystack', 'onsite', 'offsite', 'ondelivery'],
    },
    paymentReceipt: {
      type: String,
      default: '',
    },
    paymentReference: {
      type: String,
      default: '',
    },
    paymentRejectionReason: {
      type: String,
      default: '',
    },
    paystackData: {
      type: Object,
      default: null,
    },
    phone: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    sellerPayoutAmount: {
      type: Number,
      default: 0,
    },
    platformAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['order_placed', 'in_transit', 'delivered', 'cancelled'],
      default: 'order_placed',
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: [
        'pending',
        'pending_payment',
        'awaiting_confirmation',
        'confirmed',
        'rejected',
        'paid_on_delivery',
        'paid',
        'cancelled',
      ],
      default: 'pending_payment',
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'processing', 'dispatched', 'in_transit', 'delivered', 'returned'],
      default: 'pending',
    },
    deliveryTracking: deliveryTrackingSchema,
    buyerConfirmedDelivery: {
      type: Boolean,
      default: false,
    },
    buyerConfirmedAt: {
      type: Date,
    },
    sellerPayoutStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    sellerPayoutReference: {
      type: String,
      default: '',
    },
    sellerPayoutEligible: {
      type: Boolean,
      default: false,
    },
    withdrawalAmount: {
      type: Number,
      default: 0,
    },
    withdrawalReference: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for order timeline
orderSchema.virtual('timeline').get(function () {
  const timeline = [];

  timeline.push({
    status: 'order_placed',
    date: this.createdAt,
    completed: true,
  });

  if (this.deliveryStatus === 'processing' || this.deliveryStatus === 'dispatched') {
    timeline.push({
      status: 'processing',
      date: this.updatedAt,
      completed: true,
    });
  }

  if (this.deliveryStatus === 'in_transit') {
    timeline.push({
      status: 'in_transit',
      date: this.updatedAt,
      completed: true,
    });
  }

  if (this.deliveryStatus === 'delivered') {
    timeline.push({
      status: 'delivered',
      date: this.deliveredAt,
      completed: this.isDelivered,
    });
  }

  return timeline;
});

// Method to check if order can be cancelled
orderSchema.methods.canCancel = function () {
  return this.deliveryStatus === 'pending' && !this.isPaid;
};

// Method to check if delivery can be confirmed
orderSchema.methods.canConfirmDelivery = function () {
  return this.deliveryStatus === 'delivered' && !this.buyerConfirmedDelivery;
};

// Method to check if payout is eligible
orderSchema.methods.isPayoutEligible = function () {
  return this.isPaid && this.buyerConfirmedDelivery && this.sellerPayoutStatus === 'pending';
};

const Order = mongoose.model('Order', orderSchema);

export default Order;