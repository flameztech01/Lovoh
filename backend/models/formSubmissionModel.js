// models/formSubmissionModel.js
import mongoose from 'mongoose';

const formSubmissionSchema = new mongoose.Schema(
  {
    formType: {
      type: String,
      required: true,
      enum: [
        'contact',
        'getintouch',
        'startproject',
        'clarity',
        'servicequote',
        'newsletter',
        'general'
      ],
      default: 'general'
    },
    formName: {
      type: String,
      required: true,
      default: 'Contact Form'
    },
    submittedFrom: {
      type: String,
      required: true,
      default: 'Website'
    },
    pageUrl: {
      type: String,
      default: ''
    },
    contactInfo: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      company: { type: String, default: '' }
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    metadata: {
      ipAddress: { type: String, default: '' },
      userAgent: { type: String, default: '' },
      referrer: { type: String, default: '' },
      submittedAt: { type: Date, default: Date.now }
    },
    status: {
      type: String,
      enum: ['new', 'read', 'contacted', 'archived'],
      default: 'new'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
formSubmissionSchema.index({ formType: 1, createdAt: -1 });
formSubmissionSchema.index({ status: 1 });
formSubmissionSchema.index({ 'contactInfo.email': 1 });
formSubmissionSchema.index({ read: 1 });

const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);

export default FormSubmission;