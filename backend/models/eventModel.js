import mongoose from 'mongoose';

const speakerSchema = mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, default: '' },
  company: { type: String, default: '' },
  bio: { type: String, default: '' },
  image: { type: String, default: '' },
});

const ticketTypeSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, default: 0 },
  description: { type: String, default: '' },
  seatsPerTicket: { type: Number, default: 1 },
  soldCount: { type: Number, default: 0 },
});

// Team member sub-document
const teamMemberSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['viewer', 'checker', 'manager'],
      required: true,
      default: 'viewer',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Poster template placeholders
const photoPlaceholderSchema = mongoose.Schema(
  {
    x: { type: Number, default: 100 },
    y: { type: Number, default: 150 },
    width: { type: Number, default: 200 },
    height: { type: Number, default: 200 },
    borderRadius: { type: Number, default: 0 }, // <-- ADDED
  },
  { _id: false }
);

const namePlaceholderSchema = mongoose.Schema(
  {
    x: { type: Number, default: 100 },
    y: { type: Number, default: 400 },
    fontSize: { type: Number, default: 48 },
    color: { type: String, default: '#FFFFFF' },
    fontFamily: { type: String, default: 'Arial' },
  },
  { _id: false }
);

const posterTemplateSchema = mongoose.Schema(
  {
    image: { type: String, default: '' },
    photoPlaceholder: { type: photoPlaceholderSchema, default: () => ({}) },
    namePlaceholder: { type: namePlaceholderSchema, default: () => ({}) },
  },
  { _id: false }
);

const eventSchema = mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    eventType: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    originalDate: { type: Date },
    time: { type: String, required: true },
    duration: { type: String, default: '' },
    location: { type: String, required: true },
    venue: { type: String, default: '' },
    isVirtual: { type: Boolean, default: false },
    meetingLink: { type: String, default: '' },
    images: [{ type: String }],
    speakers: [speakerSchema],
    maxAttendees: { type: Number, default: 0 },
    currentAttendees: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },

    // Ticket Types
    ticketTypes: [ticketTypeSchema],
    enableMultipleTickets: { type: Boolean, default: false },
    maxTicketsPerOrder: { type: Number, default: 10 },

    registrationDeadline: { type: Date },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'passed', 'postponed', 'cancelled'],
      default: 'upcoming',
    },
    postponementReason: { type: String, default: '' },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },

    // Reports & Admin
    reportCount: { type: Number, default: 0 },
    isDisabled: { type: Boolean, default: false },
    disabledAt: Date,
    disabledReason: String,

    // Payment split
    paymentSplit: { type: String, enum: ['full', 'split'], default: 'split' },
    creatorType: { type: String, enum: ['admin', 'user'], default: 'user' },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'creatorType',
      required: true,
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    customForm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventForm',
      default: null,
    },

    teamMembers: [teamMemberSchema],

    posterTemplate: { type: posterTemplateSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Slugs generation
eventSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let base = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let slug = base;
    let counter = 1;
    while (await mongoose.model('Event').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${counter++}`;
    }
    this.slug = slug;
  }
  next();
});

// Virtuals
eventSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  return (
    this.status === 'upcoming' &&
    (!this.registrationDeadline || this.registrationDeadline > now) &&
    (this.maxAttendees === 0 || this.currentAttendees < this.maxAttendees)
  );
});

eventSchema.virtual('isFullyBooked').get(function () {
  return this.maxAttendees > 0 && this.currentAttendees >= this.maxAttendees;
});

eventSchema.virtual('totalSeatsSold').get(function () {
  if (this.ticketTypes && this.ticketTypes.length > 0) {
    return this.ticketTypes.reduce((sum, t) => sum + (t.soldCount * t.seatsPerTicket), 0);
  }
  return this.currentAttendees;
});

eventSchema.methods.updateStatus = function () {
  const now = new Date();
  if (this.status === 'postponed' || this.status === 'cancelled') return this.status;
  const eventDate = new Date(this.date);
  const isToday = eventDate.toDateString() === now.toDateString();
  if (eventDate < now && !isToday) this.status = 'passed';
  else if (isToday) this.status = 'ongoing';
  else this.status = 'upcoming';
  return this.status;
};

// Indexes
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ isDisabled: 1 });
eventSchema.index({ slug: 1 });
eventSchema.index({ 'teamMembers.userId': 1 });

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;