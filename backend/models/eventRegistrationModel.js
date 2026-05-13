import mongoose from 'mongoose';
import crypto from 'crypto';

const attendeeSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true, default: '' },
  phone: { type: String, default: '' },
  ticketId: { type: String, unique: true, sparse: true },
  seatNumber: { type: String, default: '' },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date },
});

const customFormResponseSchema = mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, required: true },
  label: { type: String },   // optional, but useful for displaying later
  value: { type: mongoose.Schema.Types.Mixed }, // string, number, array of strings, etc.
}, { _id: false });

const eventRegistrationSchema = mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Event' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },

    // Ticket details
    ticketType: { type: String, default: 'General' },
    ticketTypeIndex: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    seatsPerTicket: { type: Number, default: 1 },
    totalSeats: { type: Number, default: 1 },

    isPaidEvent: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    paymentReference: { type: String, default: '' },

    status: { type: String, enum: ['pending', 'confirmed', 'failed', 'cancelled'], default: 'pending' },
    paymentConfirmedAt: { type: Date },

    additionalAttendees: [attendeeSchema],
    sendIndividualTickets: { type: Boolean, default: false },

    ticketId: { type: String, unique: true, sparse: true },
    seatNumber: { type: String, default: '' },
    ticketCheckedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
    notes: { type: String, default: '' },

    // NEW: custom form answers
    customFormResponses: [customFormResponseSchema],
  },
  { timestamps: true }
);

// Generate ticket IDs
eventRegistrationSchema.pre('save', function (next) {
  if (this.status === 'confirmed' && !this.ticketId) {
    const r1 = crypto.randomBytes(3).toString('hex').toUpperCase();
    const r2 = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.ticketId = `TKT-${r1}-${r2}`;
  }
  if (this.status === 'confirmed' && this.additionalAttendees?.length > 0) {
    this.additionalAttendees.forEach(att => {
      if (!att.ticketId) {
        const r1 = crypto.randomBytes(3).toString('hex').toUpperCase();
        const r2 = crypto.randomBytes(2).toString('hex').toUpperCase();
        att.ticketId = `TKT-${r1}-${r2}`;
      }
    });
  }
  next();
});

eventRegistrationSchema.index({ event: 1, email: 1 });
eventRegistrationSchema.index({ event: 1, status: 1 });
eventRegistrationSchema.index({ email: 1 });
eventRegistrationSchema.index({ ticketId: 1 });
eventRegistrationSchema.index({ 'additionalAttendees.ticketId': 1 });

eventRegistrationSchema.set('toJSON', { virtuals: true });
eventRegistrationSchema.set('toObject', { virtuals: true });

const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);
export default EventRegistration;