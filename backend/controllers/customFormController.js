// controllers/customFormController.js
import asyncHandler from 'express-async-handler';
import { Form, Submission } from '../models/formModel.js';
import User from '../models/userModel.js';
import { v2 as cloudinary } from 'cloudinary';

// ==================== FORM CRUD ====================

// @desc    Create new form
// @route   POST /api/forms
// @access  Private
// In customFormController.js - createForm function
const createForm = asyncHandler(async (req, res) => {
  const {
    title, description, type, fields, quizSettings,
    formSettings, theme, tags, category, status,
  } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Form title is required');
  }

  // Parse fields if string
  let parsedFields = fields;
  if (typeof fields === 'string') {
    try { parsedFields = JSON.parse(fields); } catch {}
  }

  // Generate slug manually
  const baseSlug = title.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  while (await Form.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const form = await Form.create({
    title: title.trim(),
    slug, // Explicitly set slug
    description: description || '',
    type: type || 'form',
    fields: parsedFields || [],
    quizSettings: quizSettings || {},
    formSettings: formSettings || {},
    theme: theme || {},
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
    category: category || '',
    status: status || 'draft',
    createdBy: req.user._id,
    publishedAt: status === 'published' ? new Date() : null,
  });

  res.status(201).json(form);
});

// @desc    Get all forms (user's own or admin sees all)
// @route   GET /api/forms
// @access  Private
const getForms = asyncHandler(async (req, res) => {
  const { 
    type, status, search, category, tags,
    page = 1, limit = 20, sort = '-createdAt'
  } = req.query;

  let query = {};

  // Admin sees all, users see their own
  if (req.user.role !== 'admin') {
    query.$or = [
      { createdBy: req.user._id },
      { managers: req.user._id },
    ];
  }

  if (type) query.type = type;
  if (status) query.status = status;
  if (category) query.category = category;
  if (tags) query.tags = { $in: Array.isArray(tags) ? tags : tags.split(',') };
  if (search) {
    query.$or = [
      ...(query.$or || []),
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const forms = await Form.find(query)
    .populate('createdBy', 'name username profile')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await Form.countDocuments(query);

  res.json({
    forms,
    page: Number(page),
    pages: Math.ceil(count / limit),
    total: count,
  });
});

// @desc    Get single form by ID
// @route   GET /api/forms/:id
// @access  Private (Owner, Manager, or Admin)
const getFormById = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id)
    .populate('createdBy', 'name username profile')
    .populate('managers', 'name username profile');

  if (!form) {
    res.status(404);
    throw new Error('Form not found');
  }

  // Check access
  const isOwner = form.createdBy._id.toString() === req.user._id.toString();
  const isManager = form.managers.some(m => m._id.toString() === req.user._id.toString());
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isManager && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json(form);
});

// @desc    Get public form by slug (for filling)
// @route   GET /api/forms/public/:slug
// @access  Public
const getPublicForm = asyncHandler(async (req, res) => {
  const form = await Form.findOne({ 
    slug: req.params.slug,
    status: 'published',
  }).select('-submissions -createdBy -managers');

  if (!form) {
    res.status(404);
    throw new Error('Form not found or not published');
  }

  // Increment views
  await Form.findByIdAndUpdate(form._id, { $inc: { views: 1 } });

  res.json(form);
});

// @desc    Update form
// @route   PUT /api/forms/:id
// @access  Private (Owner, Manager, or Admin)
// controllers/customFormController.js - Updated updateForm

const updateForm = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id);

  if (!form) {
    res.status(404);
    throw new Error('Form not found');
  }

  const isOwner = form.createdBy.toString() === req.user._id.toString();
  const isManager = form.managers.includes(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isManager && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const {
    title, description, type, fields, quizSettings,
    formSettings, theme, tags, category, status, managers,
  } = req.body;

  // Regenerate slug if title changed
  if (title && title.trim() !== form.title) {
    const baseSlug = title.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let newSlug = baseSlug;
    let counter = 1;
    
    while (await Form.findOne({ slug: newSlug, _id: { $ne: form._id } })) {
      newSlug = `${baseSlug}-${counter++}`;
    }
    
    form.slug = newSlug;
    form.title = title.trim();
  } else if (title) {
    form.title = title.trim();
  }

  if (description !== undefined) form.description = description;
  if (type) form.type = type;

  if (fields) {
    try {
      form.fields = typeof fields === 'string' ? JSON.parse(fields) : fields;
    } catch {
      form.fields = fields;
    }
  }

  if (quizSettings) form.quizSettings = { ...form.quizSettings, ...quizSettings };
  if (formSettings) form.formSettings = { ...form.formSettings, ...formSettings };
  if (theme) form.theme = { ...form.theme, ...theme };
  if (tags) form.tags = Array.isArray(tags) ? tags : tags.split(',');
  if (category) form.category = category;
  if (managers) form.managers = managers;
  
  if (status) {
    const oldStatus = form.status;
    form.status = status;
    if (oldStatus !== 'published' && status === 'published') {
      form.publishedAt = new Date();
    }
    if (status === 'closed') {
      form.closedAt = new Date();
    }
  }

  const updatedForm = await form.save();
  res.json(updatedForm);
});

// @desc    Delete form
// @route   DELETE /api/forms/:id
// @access  Private (Owner or Admin)
const deleteForm = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id);

  if (!form) {
    res.status(404);
    throw new Error('Form not found');
  }

  // Only owner or admin can delete
  if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Delete all submissions
  await Submission.deleteMany({ form: form._id });

  await Form.deleteOne({ _id: req.params.id });
  res.json({ message: 'Form and all submissions removed' });
});

// @desc    Duplicate form
// @route   POST /api/forms/:id/duplicate
// @access  Private (Owner, Manager, or Admin)
const duplicateForm = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id);

  if (!form) {
    res.status(404);
    throw new Error('Form not found');
  }

  const newForm = await Form.create({
    title: `${form.title} (Copy)`,
    description: form.description,
    type: form.type,
    fields: form.fields,
    quizSettings: form.quizSettings,
    formSettings: form.formSettings,
    theme: form.theme,
    tags: form.tags,
    category: form.category,
    status: 'draft',
    createdBy: req.user._id,
  });

  res.status(201).json(newForm);
});

// ==================== SUBMISSIONS ====================

// @desc    Submit form response
// @route   POST /api/forms/public/:slug/submit
// @access  Public
const submitForm = asyncHandler(async (req, res) => {
  const { responses, timeTaken, respondentEmail, respondentName } = req.body;

  const form = await Form.findOne({ 
    slug: req.params.slug,
    status: 'published',
  });

  if (!form) {
    res.status(404);
    throw new Error('Form not found or not accepting submissions');
  }

  // Check if form is closed
  if (form.formSettings.closeDate && new Date(form.formSettings.closeDate) < new Date()) {
    res.status(400);
    throw new Error('Form is closed for submissions');
  }

  // Check max submissions
  if (form.formSettings.maxSubmissions && form.submissions >= form.formSettings.maxSubmissions) {
    res.status(400);
    throw new Error('Maximum submissions reached');
  }

  // Check required login
  if (form.formSettings.requireLogin && !req.user) {
    res.status(401);
    throw new Error('Login required to submit this form');
  }

  // Calculate score for quizzes
  let score = 0;
  let totalPoints = 0;

  if (form.type === 'quiz') {
    form.fields.forEach(field => {
      if (field.options && field.options.some(o => o.isCorrect)) {
        totalPoints++;
        const response = responses?.find(r => r.fieldId === field.id);
        if (response) {
          const selectedOptions = Array.isArray(response.value) ? response.value : [response.value];
          const correctOptions = field.options.filter(o => o.isCorrect).map(o => o.value);
          const isCorrect = correctOptions.every(c => selectedOptions.includes(c)) && 
                           selectedOptions.every(s => correctOptions.includes(s));
          if (isCorrect) score++;
        }
      }
    });
  }

  const submission = await Submission.create({
    form: form._id,
    respondent: req.user?._id || null,
    respondentEmail: respondentEmail || (req.user?.email || ''),
    respondentName: respondentName || (req.user?.name || 'Anonymous'),
    responses: responses || [],
    score,
    totalPoints,
    percentage: totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0,
    passed: form.type === 'quiz' ? 
      (totalPoints > 0 ? Math.round((score / totalPoints) * 100) >= (form.quizSettings.passingScore || 70) : false) 
      : true,
    timeTaken,
    metadata: {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  // Update form stats
  form.submissions += 1;
  form.conversionRate = form.views > 0 ? Math.round((form.submissions / form.views) * 100) : 0;

  // Update quiz stats
  if (form.type === 'quiz') {
    const allSubmissions = await Submission.find({ form: form._id, status: 'completed' });
    const totalScore = allSubmissions.reduce((sum, s) => sum + s.score, 0) + score;
    const totalMax = (allSubmissions.length + 1) * totalPoints;
    form.averageScore = totalMax > 0 ? Math.round((totalScore / (allSubmissions.length + 1)) * 100) / 100 : 0;
    
    const passedCount = allSubmissions.filter(s => s.passed).length + (submission.passed ? 1 : 0);
    form.passRate = Math.round((passedCount / (allSubmissions.length + 1)) * 100);
  }

  await form.save();

  res.status(201).json({
    message: form.formSettings.confirmationMessage || 'Thank you for your submission!',
    submission,
    score: form.type === 'quiz' ? { score, totalPoints, percentage: submission.percentage } : undefined,
  });
});

// @desc    Get form submissions with field labels
// @route   GET /api/custom-forms/:id/submissions
// @access  Private
const getSubmissions = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id);

  if (!form) {
    res.status(404);
    throw new Error('Form not found');
  }

  // Check access
  const isOwner = form.createdBy.toString() === req.user._id.toString();
  const isManager = form.managers.some(m => m.toString() === req.user._id.toString());
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isManager && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { page = 1, limit = 50, sort = '-createdAt', status, search } = req.query;

  let query = { form: form._id };
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { respondentName: { $regex: search, $options: 'i' } },
      { respondentEmail: { $regex: search, $options: 'i' } },
    ];
  }

  const submissions = await Submission.find(query)
    .populate('respondent', 'name username email profile')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  // Add field labels to each submission
  const submissionsWithLabels = submissions.map(sub => ({
    ...sub,
    responses: sub.responses?.map(response => {
      const field = form.fields.find(f => f.id === response.fieldId);
      return {
        ...response,
        fieldLabel: field?.label || response.fieldId,
        fieldType: field?.type || 'text',
      };
    }) || [],
  }));

  const count = await Submission.countDocuments(query);

  res.json({
    submissions: submissionsWithLabels,
    form: {
      title: form.title,
      type: form.type,
      fields: form.fields.map(f => ({ id: f.id, label: f.label, type: f.type })),
      submissions: form.submissions,
      averageScore: form.averageScore,
      passRate: form.passRate,
    },
    page: Number(page),
    pages: Math.ceil(count / limit),
    total: count,
  });
});

// controllers/customFormController.js

const getSubmissionById = asyncHandler(async (req, res) => {
  // Get submission
  const submission = await Submission.findById(req.params.submissionId)
    .populate('respondent', 'name username email profile')
    .lean(); // Use lean() for plain JavaScript object

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // Get the form to access field labels
  const form = await Form.findById(req.params.id).lean();

  if (!form) {
    res.status(404);
    throw new Error('Form not found');
  }

  // Create a field map for quick lookup
  const fieldMap = {};
  form.fields?.forEach(field => {
    fieldMap[field.id] = { label: field.label, type: field.type };
  });

  // Map field labels to responses
  const responsesWithLabels = (submission.responses || []).map(response => ({
    fieldId: response.fieldId,
    value: response.value,
    fileUrl: response.fileUrl || '',
    fileName: response.fileName || '',
    fieldLabel: fieldMap[response.fieldId]?.label || response.fieldId,
    fieldType: fieldMap[response.fieldId]?.type || 'text',
  }));

  // Build result
  const result = {
    ...submission,
    responses: responsesWithLabels,
    formTitle: form.title,
    formType: form.type,
  };

  res.json(result);
});

// @desc    Delete submission
// @route   DELETE /api/forms/:id/submissions/:submissionId
// @access  Private
const deleteSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.submissionId);

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  await Submission.deleteOne({ _id: req.params.submissionId });

  // Update form submission count
  await Form.findByIdAndUpdate(req.params.id, { $inc: { submissions: -1 } });

  res.json({ message: 'Submission removed' });
});

// @desc    Export submissions as CSV
// @route   GET /api/forms/:id/submissions/export
// @access  Private
const exportSubmissions = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id);

  if (!form) {
    res.status(404);
    throw new Error('Form not found');
  }

  const submissions = await Submission.find({ form: form._id })
    .sort('-createdAt')
    .lean();

  // Build CSV
  const headers = ['Submission ID', 'Name', 'Email', 'Date', 'Score', 'Percentage', 'Passed'];
  form.fields.forEach(field => {
    headers.push(field.label);
  });

  const rows = submissions.map(sub => {
    const row = [
      sub._id,
      sub.respondentName,
      sub.respondentEmail,
      sub.createdAt,
      sub.score,
      sub.percentage + '%',
      sub.passed ? 'Yes' : 'No',
    ];
    form.fields.forEach(field => {
      const response = sub.responses.find(r => r.fieldId === field.id);
      row.push(response ? (Array.isArray(response.value) ? response.value.join(', ') : response.value) : '');
    });
    return row;
  });

  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${form.title}-submissions.csv"`);
  res.send(csv);
});

// ==================== MANAGERS ====================

// @desc    Add manager to form
// @route   POST /api/forms/:id/managers
// @access  Private (Owner or Admin)
const addManager = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const form = await Form.findById(req.params.id);
  if (!form) {
    res.status(404);
    throw new Error('Form not found');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(404);
    throw new Error('User not found with that email');
  }

  if (form.managers.includes(user._id)) {
    res.status(400);
    throw new Error('User is already a manager');
  }

  form.managers.push(user._id);
  await form.save();

  res.json({ message: `${user.name} added as manager`, managers: form.managers });
});

// @desc    Remove manager from form
// @route   DELETE /api/forms/:id/managers/:userId
// @access  Private (Owner or Admin)
const removeManager = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id);
  if (!form) {
    res.status(404);
    throw new Error('Form not found');
  }

  form.managers.pull(req.params.userId);
  await form.save();

  res.json({ message: 'Manager removed', managers: form.managers });
});

// ==================== STATS ====================

// @desc    Get form analytics
// @route   GET /api/forms/:id/analytics
// @access  Private
const getFormAnalytics = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id);
  if (!form) {
    res.status(404);
    throw new Error('Form not found');
  }

  const submissions = await Submission.find({ form: form._id }).sort('-createdAt').lean();

  // Daily submissions
  const dailySubmissions = {};
  submissions.forEach(s => {
    const date = new Date(s.createdAt).toISOString().split('T')[0];
    dailySubmissions[date] = (dailySubmissions[date] || 0) + 1;
  });

  // Device breakdown
  const devices = { desktop: 0, mobile: 0, tablet: 0, other: 0 };
  submissions.forEach(s => {
    const ua = s.metadata?.userAgent || '';
    if (/mobile/i.test(ua)) devices.mobile++;
    else if (/tablet|ipad/i.test(ua)) devices.tablet++;
    else if (/windows|mac|linux/i.test(ua)) devices.desktop++;
    else devices.other++;
  });

  // Completion rate
  const completed = submissions.filter(s => s.status === 'completed').length;
  const started = submissions.filter(s => s.status === 'started').length;
  const abandoned = submissions.filter(s => s.status === 'abandoned').length;

  res.json({
    form: {
      title: form.title,
      views: form.views,
      submissions: form.submissions,
      conversionRate: form.conversionRate,
    },
    analytics: {
      dailySubmissions,
      devices,
      completionRate: {
        completed,
        started,
        abandoned,
        rate: submissions.length > 0 ? Math.round((completed / submissions.length) * 100) : 0,
      },
      averageTimeTaken: submissions.reduce((sum, s) => sum + (s.timeTaken || 0), 0) / (submissions.length || 1),
    },
  });
});

// ==================== ADMIN ====================

// @desc    Admin - Get all forms across all users
// @route   GET /api/forms/admin/all
// @access  Admin
const adminGetAllForms = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search, type, status } = req.query;

  let query = {};
  if (type) query.type = type;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
    ];
  }

  const forms = await Form.find(query)
    .populate('createdBy', 'name username email')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await Form.countDocuments(query);

  // Get total submissions count
  const totalSubmissions = await Submission.countDocuments();

  // Get active users count
  const activeUsers = await Form.distinct('createdBy');

  res.json({
    forms,
    stats: {
      totalForms: count,
      totalSubmissions,
      activeUsers: activeUsers.length,
    },
    page: Number(page),
    pages: Math.ceil(count / limit),
    total: count,
  });
});

export {
  createForm,
  getForms,
  getFormById,
  getPublicForm,
  updateForm,
  deleteForm,
  duplicateForm,
  submitForm,
  getSubmissions,
  getSubmissionById,
  deleteSubmission,
  exportSubmissions,
  addManager,
  removeManager,
  getFormAnalytics,
  adminGetAllForms,
};