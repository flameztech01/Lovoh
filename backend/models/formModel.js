// models/formModel.js - Complete Rewrite
import mongoose from 'mongoose';

const optionSchema = mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const fieldSchema = mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'text', 'textarea', 'number', 'email', 'phone',
      'date', 'time', 'datetime', 'url',
      'select', 'multiSelect', 'radio', 'checkbox',
      'file', 'image', 'signature',
      'heading', 'paragraph', 'divider',
      'rating', 'scale', 'matrix',
    ],
  },
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  description: { type: String, default: '' },
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  options: [optionSchema],
  maxFileSize: { type: Number, default: 10 },
  allowedFileTypes: [{ type: String }],
  min: { type: Number },
  max: { type: Number },
  step: { type: Number, default: 1 },
  rows: [{ type: String }],
  columns: [{ type: String }],
  icon: { type: String, default: '' },
  width: { type: String, enum: ['full', 'half', 'third', 'quarter'], default: 'full' },
});

const responseSchema = mongoose.Schema({
  fieldId: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
  fileUrl: { type: String },
  fileName: { type: String },
});

const submissionSchema = mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  respondent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  respondentEmail: { type: String },
  respondentName: { type: String },
  responses: [responseSchema],
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  timeTaken: { type: Number },
  metadata: {
    ip: String,
    userAgent: String,
    browser: String,
    device: String,
    os: String,
  },
  status: {
    type: String,
    enum: ['started', 'completed', 'abandoned'],
    default: 'completed',
  },
}, { timestamps: true });

const formSchema = mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['form', 'quiz', 'survey', 'registration'],
    default: 'form',
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'archived'],
    default: 'draft',
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  managers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  fields: [fieldSchema],
  
  quizSettings: {
    passingScore: { type: Number, default: 70 },
    maxAttempts: { type: Number, default: 1 },
    timeLimit: { type: Number },
    shuffleQuestions: { type: Boolean, default: false },
    showResults: { type: Boolean, default: true },
    showCorrectAnswers: { type: Boolean, default: true },
    allowRetake: { type: Boolean, default: false },
  },
  
  formSettings: {
    allowAnonymous: { type: Boolean, default: true },
    requireLogin: { type: Boolean, default: false },
    collectEmail: { type: Boolean, default: true },
    sendConfirmation: { type: Boolean, default: false },
    confirmationMessage: { type: String, default: 'Thank you for your submission!' },
    redirectUrl: { type: String },
    closeDate: { type: Date },
    maxSubmissions: { type: Number },
    allowFileUploads: { type: Boolean, default: true },
    maxFileSize: { type: Number, default: 10 },
    notifyOnSubmission: { type: Boolean, default: false },
    notificationEmail: { type: String },
  },
  
  theme: {
    primaryColor: { type: String, default: '#1B3766' },
    backgroundColor: { type: String, default: '#FFFFFF' },
    fontFamily: { type: String, default: 'Inter, sans-serif' },
    logo: { type: String },
    headerImage: { type: String },
  },
  
  views: { type: Number, default: 0 },
  submissions: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  passRate: { type: Number, default: 0 },
  
  tags: [{ type: String }],
  category: { type: String },
  
  publishedAt: { type: Date },
  closedAt: { type: Date },
}, { timestamps: true });

// Indexes
formSchema.index({ createdBy: 1, status: 1 });
formSchema.index({ slug: 1 });
formSchema.index({ type: 1 });
formSchema.index({ tags: 1 });
formSchema.index({ submissions: -1 });

// Generate slug pre-save
formSchema.pre('save', async function(next) {
  // Generate slug if not set or title changed
  if (!this.slug || this.isModified('title')) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .replace(/-+/g, '-'); // Replace multiple hyphens with single
    
    let slug = baseSlug || 'untitled-form';
    let counter = 1;
    
    // Ensure unique slug
    while (await mongoose.model('Form').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug || 'untitled-form'}-${counter++}`;
    }
    
    this.slug = slug;
  }
  next();
});

// Update timestamps on submission change
submissionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.form = this.form; // Ensure form reference is set
  }
  next();
});

const Form = mongoose.model('Form', formSchema);
const Submission = mongoose.model('Submission', submissionSchema);

export { Form, Submission };