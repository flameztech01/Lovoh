// controllers/formController.js
import asyncHandler from 'express-async-handler';
import FormSubmission from '../models/formSubmissionModel.js';
import { sendFormNotification, sendFormConfirmation } from '../utils/formEmailService.js';

// @desc    Submit a form (generic endpoint for all forms)
// @route   POST /api/forms/submit
// @access  Public
const submitForm = asyncHandler(async (req, res) => {
  const {
    formType,
    formName,
    submittedFrom,
    pageUrl,
    contactInfo,
    formData,
    metadata
  } = req.body;

  // Validate required fields
  if (!formType) {
    res.status(400);
    throw new Error('Form type is required');
  }

  // Ensure contact info exists
  const contact = contactInfo || {};
  
  // Basic validation for contact info
  if (!contact.email && !contact.name) {
    console.warn('Form submitted without email or name');
  }

  // Create form submission
  const submission = await FormSubmission.create({
    formType: formType || 'general',
    formName: formName || `${formType} Form`,
    submittedFrom: submittedFrom || 'Website',
    pageUrl: pageUrl || req.headers.referer || '',
    contactInfo: {
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || ''
    },
    formData: formData || req.body,
    metadata: {
      ipAddress: req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '',
      userAgent: req.headers['user-agent'] || '',
      referrer: req.headers.referer || '',
      submittedAt: new Date()
    },
    status: 'new',
    read: false
  });

  // Send email notifications (don't block submission if email fails)
  try {
    // Send notification to admin
    await sendFormNotification({
      formType: submission.formType,
      formName: submission.formName,
      contactInfo: submission.contactInfo,
      formData: submission.formData,
      metadata: submission.metadata
    });

    // Send confirmation email to user if email is provided
    if (submission.contactInfo?.email) {
      await sendFormConfirmation({
        email: submission.contactInfo.email,
        name: submission.contactInfo.name,
        formType: submission.formType
      });
    }
  } catch (emailError) {
    console.error('Failed to send form notification email:', emailError.message);
    // Don't fail the submission if email fails
  }

  res.status(201).json({
    success: true,
    message: 'Form submitted successfully',
    submissionId: submission._id
  });
});

// @desc    Get all form submissions (Admin only)
// @route   GET /api/forms
// @access  Private/Admin
const getAllFormSubmissions = asyncHandler(async (req, res) => {
  const { 
    formType, 
    status, 
    read, 
    search,
    page = 1, 
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  let query = {};

  // Filter by form type
  if (formType) {
    query.formType = formType;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by read status
  if (read !== undefined) {
    query.read = read === 'true';
  }

  // Search by name, email, or company
  if (search) {
    query.$or = [
      { 'contactInfo.name': { $regex: search, $options: 'i' } },
      { 'contactInfo.email': { $regex: search, $options: 'i' } },
      { 'contactInfo.company': { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const submissions = await FormSubmission.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await FormSubmission.countDocuments(query);

  // Get form type statistics
  const formTypeStats = await FormSubmission.aggregate([
    { $group: { _id: '$formType', count: { $sum: 1 } } }
  ]);

  res.json({
    submissions,
    page: Number(page),
    pages: Math.ceil(count / limit),
    total: count,
    stats: {
      byFormType: formTypeStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      unread: await FormSubmission.countDocuments({ read: false }),
      new: await FormSubmission.countDocuments({ status: 'new' })
    }
  });
});

// @desc    Get single form submission (Admin only)
// @route   GET /api/forms/:id
// @access  Private/Admin
const getFormSubmissionById = asyncHandler(async (req, res) => {
  const submission = await FormSubmission.findById(req.params.id);

  if (!submission) {
    res.status(404);
    throw new Error('Form submission not found');
  }

  // Mark as read when viewed
  if (!submission.read) {
    submission.read = true;
    await submission.save();
  }

  res.json(submission);
});

// @desc    Update form submission status (Admin only)
// @route   PUT /api/forms/:id/status
// @access  Private/Admin
const updateFormStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  const submission = await FormSubmission.findById(req.params.id);

  if (!submission) {
    res.status(404);
    throw new Error('Form submission not found');
  }

  if (status) {
    submission.status = status;
  }

  if (adminNotes !== undefined) {
    submission.adminNotes = adminNotes;
  }

  const updatedSubmission = await submission.save();

  res.json({
    success: true,
    message: 'Form status updated',
    submission: updatedSubmission
  });
});

// @desc    Mark form as read/unread (Admin only)
// @route   PUT /api/forms/:id/read
// @access  Private/Admin
const markAsRead = asyncHandler(async (req, res) => {
  const { read } = req.body;

  const submission = await FormSubmission.findById(req.params.id);

  if (!submission) {
    res.status(404);
    throw new Error('Form submission not found');
  }

  submission.read = read !== undefined ? read : true;
  
  if (read === true && submission.status === 'new') {
    submission.status = 'read';
  }

  const updatedSubmission = await submission.save();

  res.json({
    success: true,
    message: `Form marked as ${submission.read ? 'read' : 'unread'}`,
    submission: updatedSubmission
  });
});

// @desc    Delete form submission (Admin only)
// @route   DELETE /api/forms/:id
// @access  Private/Admin
const deleteFormSubmission = asyncHandler(async (req, res) => {
  const submission = await FormSubmission.findById(req.params.id);

  if (!submission) {
    res.status(404);
    throw new Error('Form submission not found');
  }

  await FormSubmission.deleteOne({ _id: req.params.id });

  res.json({
    success: true,
    message: 'Form submission deleted'
  });
});

// @desc    Get form statistics (Admin only)
// @route   GET /api/forms/stats
// @access  Private/Admin
const getFormStats = asyncHandler(async (req, res) => {
  const stats = await FormSubmission.aggregate([
    {
      $group: {
        _id: '$formType',
        total: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
        },
        new: {
          $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
        },
        contacted: {
          $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] }
        },
        archived: {
          $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);

  const recentSubmissions = await FormSubmission.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('formType formName contactInfo status read createdAt');

  const totalSubmissions = await FormSubmission.countDocuments();

  res.json({
    totalSubmissions,
    byFormType: stats,
    recentSubmissions
  });
});

// @desc    Bulk delete form submissions (Admin only)
// @route   POST /api/forms/bulk-delete
// @access  Private/Admin
const bulkDeleteFormSubmissions = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of submission IDs');
  }

  const result = await FormSubmission.deleteMany({ _id: { $in: ids } });

  res.json({
    success: true,
    message: `${result.deletedCount} form submissions deleted`,
    deletedCount: result.deletedCount
  });
});

// @desc    Bulk update status (Admin only)
// @route   POST /api/forms/bulk-status
// @access  Private/Admin
const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of submission IDs');
  }

  if (!status) {
    res.status(400);
    throw new Error('Please provide a status');
  }

  const result = await FormSubmission.updateMany(
    { _id: { $in: ids } },
    { $set: { status } }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} form submissions updated`,
    modifiedCount: result.modifiedCount
  });
});

export {
  submitForm,
  getAllFormSubmissions,
  getFormSubmissionById,
  updateFormStatus,
  markAsRead,
  deleteFormSubmission,
  getFormStats,
  bulkDeleteFormSubmissions,
  bulkUpdateStatus
};