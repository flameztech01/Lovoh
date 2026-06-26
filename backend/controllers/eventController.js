import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import Event from '../models/eventModel.js';
import EventForm from '../models/eventFormModel.js';
import EventRegistration from '../models/eventRegistrationModel.js';
import User from '../models/userModel.js';
import Transaction from '../models/transactionModel.js';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import {
  sendRegistrationConfirmation,
  sendNewRegistrationToCreator,
  sendPaymentConfirmation,
  sendPaymentToCreator,
  sendEventReportNotice,
  sendWithdrawalConfirmation,
  sendWalletSetupConfirmation,
  sendSettlementNotification,
  sendTicketToAttendee,
  sendEventReminder
} from '../utils/eventEmailService.js';
// Add these imports
import { generatePoster } from '../utils/generatePoster.js';
import { sendPosterEmail } from '../utils/eventEmailService.js';

// Paystack config
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const COMPANY_SHARE_PERCENTAGE = 6;
const CREATOR_SHARE_PERCENTAGE = 94;

// --------------------- QR HELPER ---------------------
/**
 * Generate a QR code as a data URL (PNG) containing the ticket ID.
 * @param {string} ticketId - Unique ticket identifier
 * @param {string} attendeeName - Name of the attendee (for logging)
 * @param {string} eventTitle - Title of the event (for logging)
 * @returns {Promise<string|null>} - Data URL of QR code or null on error
 */
const generateTicketQR = async (ticketId, attendeeName, eventTitle) => {
  try {
    // Encode only the ticket ID – scanners will read this and verify via backend
    const qrData = JSON.stringify({ ticketId });
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    return qrDataUrl;
  } catch (err) {
    console.error(`QR generation failed for ${attendeeName} (${eventTitle}):`, err);
    return null;
  }
};

// --------------------- HELPERS ---------------------

// Find event by slug (fallback to _id for legacy)
const findEvent = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await Event.findById(identifier);
    if (byId) return byId;
  }
  return await Event.findOne({ slug: identifier.toLowerCase() });
};

// Generate a unique seat number
const generateSeatNumber = async (eventId) => {
  const confirmedCount = await EventRegistration.countDocuments({
    event: eventId,
    status: 'confirmed',
  });
  return `A${String(confirmedCount + 1).padStart(3, '0')}`;
};

// Create or update the custom form linked to an event
const upsertEventForm = async (eventId, formData) => {
  if (!formData) return null;
  const { title, description, fields } = formData;
  if (!fields || !Array.isArray(fields) || fields.length === 0) return null;

  let form = await EventForm.findOne({ event: eventId });
  if (form) {
    form.title = title || form.title;
    form.description = description || form.description;
    form.fields = fields;
    await form.save();
    return form._id;
  }
  form = await EventForm.create({
    event: eventId,
    title: title || 'Additional Information',
    description: description || '',
    fields,
  });
  return form._id;
};

// Check if registration is still open
const isRegistrationOpen = (event) => {
  const now = new Date();
  const eventDate = new Date(event.date);
  const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : new Date(event.date);
  
  // Set times to end of day for comparison
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  
  const deadlineEnd = new Date(registrationDeadline);
  deadlineEnd.setHours(23, 59, 59, 999);
  
  const eventEnd = new Date(eventDate);
  eventEnd.setHours(23, 59, 59, 999);
  
  // Registration is open if:
  // 1. Event hasn't passed (current time <= event end of day)
  // 2. Registration deadline hasn't passed (current time <= deadline end of day)
  // 3. Event status is not passed/cancelled/postponed
  // 4. Event is not disabled
  
  const isEventPassed = now > eventEnd;
  const isDeadlinePassed = now > deadlineEnd;
  const isEventActive = event.status !== 'passed' && event.status !== 'cancelled' && event.status !== 'postponed';
  
  return !isEventPassed && !isDeadlinePassed && isEventActive && !event.isDisabled;
};

// Check if event has passed (for status updates)
const hasEventPassed = (event) => {
  const now = new Date();
  const eventDate = new Date(event.date);
  const eventEnd = new Date(eventDate);
  eventEnd.setHours(23, 59, 59, 999);
  return now > eventEnd;
};

// --------------------- EVENT CREATION ---------------------

const createEvent = asyncHandler(async (req, res) => {
  const {
    title, description, eventType, category, date, time, duration,
    location, venue, speakers, maxAttendees, isPaid, price,
    registrationDeadline, tags, isVirtual, meetingLink,
    ticketTypes, enableMultipleTickets, maxTicketsPerOrder,
    customForm, posterTemplate, // posterTemplate JSON from frontend
  } = req.body;

  if (!title || !description || !eventType || !category || !date || !time) {
    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      for (const file of files) await cloudinary.uploader.destroy(file.filename);
    }
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const isVirtualEvent = isVirtual === 'true' || isVirtual === true;
  const eventLocation = isVirtualEvent ? (location?.trim() || 'Online') : location;
  if (!eventLocation && !isVirtualEvent) {
    res.status(400);
    throw new Error('Location is required for in‑person events');
  }

  let parsedTicketTypes = [];
  if (ticketTypes) {
    try {
      parsedTicketTypes = typeof ticketTypes === 'string' ? JSON.parse(ticketTypes) : ticketTypes;
    } catch (error) {
      res.status(400);
      throw new Error('Invalid ticket types format');
    }
  }

  const isAdmin = req.user.role === 'admin';
  const hasTicketTypes = parsedTicketTypes.length > 0;

  if (!isAdmin && (isPaid === 'true' || isPaid === true)) {
    if (hasTicketTypes) {
      for (const tt of parsedTicketTypes) {
        if (!tt.name || !tt.name.trim()) {
          res.status(400);
          throw new Error('All ticket types must have a name');
        }
        if (!tt.price || Number(tt.price) <= 0) {
          res.status(400);
          throw new Error(`Price is required for "${tt.name}" ticket type`);
        }
      }
    } else {
      if (!price || Number(price) <= 0) {
        res.status(400);
        throw new Error('Price is required for paid events');
      }
    }

    const creator = await User.findById(req.user._id);
    if (!creator || !creator.paystackSubaccountCode || !creator.hasPaymentWallet) {
      res.status(400);
      throw new Error('You need to set up your payment wallet before creating paid events. Go to your Dashboard > Wallet to set up.');
    }
  }

  let parsedSpeakers = [];
  if (speakers) {
    try {
      parsedSpeakers = typeof speakers === 'string' ? JSON.parse(speakers) : speakers;
    } catch (error) {
      parsedSpeakers = [];
    }
  }

  let eventImages = [];
  let speakerImageFiles = [];
  let posterImageFile = null;
  if (req.files) {
    const allFiles = Array.isArray(req.files) ? req.files : [];
    eventImages = allFiles.filter(f => f.fieldname === 'images');
    speakerImageFiles = allFiles.filter(f => f.fieldname.startsWith('speakerImages'));
    posterImageFile = allFiles.find(f => f.fieldname === 'posterImage');
  }

  const eventImageUrls = eventImages.map(file => file.path);

  if (speakerImageFiles.length > 0 && parsedSpeakers.length > 0) {
    speakerImageFiles.forEach((file) => {
      const match = file.fieldname.match(/\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1]);
        if (parsedSpeakers[index]) {
          parsedSpeakers[index].image = file.path;
        }
      }
    });
  }

  const eventDate = new Date(date);
  const now = new Date();
  const eventPassed = hasEventPassed({ date: eventDate });

  // ---------- Process poster template ----------
  let posterTemplateData = null;
  if (posterTemplate) {
    try {
      posterTemplateData = typeof posterTemplate === 'string' ? JSON.parse(posterTemplate) : posterTemplate;
    } catch (e) {
      // invalid JSON, ignore
    }
  }

  let posterImageUrl = '';
  if (posterImageFile) {
    const result = await cloudinary.uploader.upload(posterImageFile.path, {
      folder: 'eventroom/posters',
      public_id: `poster_${Date.now()}`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    });
    posterImageUrl = result.secure_url;
  } else if (posterTemplateData?.image) {
    posterImageUrl = posterTemplateData.image;
  }

  const finalPosterTemplate = posterTemplateData ? {
    image: posterImageUrl,
    photoPlaceholder: {
      x: posterTemplateData.photoPlaceholder?.x || 100,
      y: posterTemplateData.photoPlaceholder?.y || 150,
      width: posterTemplateData.photoPlaceholder?.width || 200,
      height: posterTemplateData.photoPlaceholder?.height || 200,
      borderRadius: posterTemplateData.photoPlaceholder?.borderRadius || 0, // <-- borderRadius
    },
    namePlaceholder: {
      x: posterTemplateData.namePlaceholder?.x || 100,
      y: posterTemplateData.namePlaceholder?.y || 400,
      fontSize: posterTemplateData.namePlaceholder?.fontSize || 48,
      color: posterTemplateData.namePlaceholder?.color || '#FFFFFF',
      fontFamily: posterTemplateData.namePlaceholder?.fontFamily || 'Arial',
    },
  } : null;

  const event = await Event.create({
    title: title.trim(),
    description,
    eventType,
    category,
    date: eventDate,
    time,
    duration: duration || '',
    location: eventLocation,
    venue: venue || eventLocation,
    isVirtual: isVirtualEvent,
    meetingLink: meetingLink || '',
    images: eventImageUrls,
    speakers: parsedSpeakers,
    maxAttendees: maxAttendees ? Number(maxAttendees) : 0,
    currentAttendees: 0,
    isPaid: isPaid === 'true' || isPaid === true,
    price: price ? Number(price) : 0,
    ticketTypes: parsedTicketTypes,
    enableMultipleTickets: enableMultipleTickets === 'true' || enableMultipleTickets === true,
    maxTicketsPerOrder: maxTicketsPerOrder ? Number(maxTicketsPerOrder) : 10,
    registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : eventDate,
    status: eventPassed ? 'passed' : 'upcoming',
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean)) : [],
    createdBy: req.user._id,
    creatorType: isAdmin ? 'admin' : 'user',
    paymentSplit: isAdmin ? 'full' : 'split',
    posterTemplate: finalPosterTemplate,
  });

  if (customForm) {
    try {
      const formData = typeof customForm === 'string' ? JSON.parse(customForm) : customForm;
      const formId = await upsertEventForm(event._id, formData);
      if (formId) {
        event.customForm = formId;
        await event.save();
      }
    } catch (err) {
      throw new Error('Invalid custom form format');
    }
  }

  res.status(201).json({
    message: 'Event created successfully',
    event,
  });
});

// --------------------- GET EVENTS ---------------------

const getEvents = asyncHandler(async (req, res) => {
  const { status, category, eventType, upcoming, search, createdBy, creatorType, page = 1, limit = 12 } = req.query;

  let query = { isDisabled: { $ne: true } };

  if (status) query.status = status;
  if (upcoming === 'true') {
    query.date = { $gte: new Date() };
    query.status = { $ne: 'postponed' };
  }
  if (category) query.category = category;
  if (eventType) query.eventType = eventType;
  if (createdBy) query.createdBy = createdBy;
  if (creatorType) query.creatorType = creatorType;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const pipeline = [
    { $match: query },
    { $sort: { date: 1 } },
    { $skip: skip },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'userCreator',
      },
    },
    {
      $lookup: {
        from: 'admins',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'adminCreator',
      },
    },
    {
      $addFields: {
        createdBy: {
          $cond: {
            if: { $eq: ['$creatorType', 'admin'] },
            then: { $arrayElemAt: ['$adminCreator', 0] },
            else: { $arrayElemAt: ['$userCreator', 0] },
          },
        },
      },
    },
    {
      $addFields: {
        'createdBy.name': { $ifNull: ['$createdBy.name', 'Unknown'] },
        'createdBy.email': { $ifNull: ['$createdBy.email', ''] },
        'createdBy.profile': { $ifNull: ['$createdBy.profile', ''] },
      },
    },
    { $project: { userCreator: 0, adminCreator: 0 } },
  ];

  const events = await Event.aggregate(pipeline);
  const total = await Event.countDocuments(query);

  const now = new Date();
  for (const event of events) {
    if (hasEventPassed(event) && event.status === 'upcoming') {
      event.status = 'passed';
      await Event.findByIdAndUpdate(event._id, { status: 'passed' });
    }
  }

  res.json({
    events,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  res.json(events);
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await findEvent(req.params.id);
  if (!event || event.isDisabled) {
    res.status(404);
    throw new Error('Event not found');
  }

  const confirmedCount = await EventRegistration.countDocuments({
    event: event._id,
    status: 'confirmed',
  });

  // Populate custom form if exists
  if (event.customForm) {
    await event.populate('customForm');
  }

  const eventObj = event.toObject({ virtuals: true });
  eventObj.currentAttendees = confirmedCount;
  eventObj.registrationOpen = isRegistrationOpen(event);
  res.json(eventObj);
});

// --------------------- UPDATE & DELETE EVENTS ---------------------

const updateEvent = asyncHandler(async (req, res) => {
  const event = await findEvent(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update this event');
  }

  const {
    title, description, eventType, category, date, time, duration,
    location, venue, speakers, maxAttendees, isPaid, price,
    registrationDeadline, tags, isVirtual, meetingLink, keepImages,
    ticketTypes, enableMultipleTickets, maxTicketsPerOrder,
    customForm,
    posterTemplate, // JSON string or object
  } = req.body;

  let allFiles = [];
  if (req.files && Array.isArray(req.files)) {
    allFiles = req.files;
  }
  const eventImageFiles = allFiles.filter(f => f.fieldname === 'images');
  const speakerImageFiles = allFiles.filter(f => f.fieldname.startsWith('speakerImages'));
  const posterImageFile = allFiles.find(f => f.fieldname === 'posterImage');

  // ---------- Handle poster template ----------
  let posterTemplateData = null;
  if (posterTemplate) {
    try {
      posterTemplateData = typeof posterTemplate === 'string' ? JSON.parse(posterTemplate) : posterTemplate;
    } catch (e) {
      // invalid JSON, ignore
    }
  }

  let removePoster = false;
  if (posterTemplateData && posterTemplateData.image === '' && !posterImageFile) {
    removePoster = true;
  }

  let posterImageUrl = '';
  if (posterImageFile) {
    if (event.posterTemplate && event.posterTemplate.image) {
      try {
        const publicId = event.posterTemplate.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`eventroom/posters/${publicId}`);
      } catch (err) {
        console.error('Error deleting old poster:', err);
      }
    }
    const result = await cloudinary.uploader.upload(posterImageFile.path, {
      folder: 'eventroom/posters',
      public_id: `poster_${Date.now()}`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    });
    posterImageUrl = result.secure_url;
  }

  let finalPosterTemplate = null;
  if (removePoster) {
    finalPosterTemplate = null;
  } else if (posterTemplateData) {
    const existingImage = event.posterTemplate && event.posterTemplate.image ? event.posterTemplate.image : '';
    finalPosterTemplate = {
      image: posterImageUrl || posterTemplateData.image || existingImage,
      photoPlaceholder: {
        x: posterTemplateData.photoPlaceholder?.x || event.posterTemplate?.photoPlaceholder?.x || 100,
        y: posterTemplateData.photoPlaceholder?.y || event.posterTemplate?.photoPlaceholder?.y || 150,
        width: posterTemplateData.photoPlaceholder?.width || event.posterTemplate?.photoPlaceholder?.width || 200,
        height: posterTemplateData.photoPlaceholder?.height || event.posterTemplate?.photoPlaceholder?.height || 200,
        borderRadius: posterTemplateData.photoPlaceholder?.borderRadius !== undefined ? posterTemplateData.photoPlaceholder.borderRadius : event.posterTemplate?.photoPlaceholder?.borderRadius || 0,
      },
      namePlaceholder: {
        x: posterTemplateData.namePlaceholder?.x || event.posterTemplate?.namePlaceholder?.x || 100,
        y: posterTemplateData.namePlaceholder?.y || event.posterTemplate?.namePlaceholder?.y || 400,
        fontSize: posterTemplateData.namePlaceholder?.fontSize || event.posterTemplate?.namePlaceholder?.fontSize || 48,
        color: posterTemplateData.namePlaceholder?.color || event.posterTemplate?.namePlaceholder?.color || '#FFFFFF',
        fontFamily: posterTemplateData.namePlaceholder?.fontFamily || event.posterTemplate?.namePlaceholder?.fontFamily || 'Arial',
      },
    };
  } else {
    finalPosterTemplate = event.posterTemplate;
  }

  // ---------- Handle speakers ----------
  if (speakers) {
    try {
      let parsedSpeakers = typeof speakers === 'string' ? JSON.parse(speakers) : speakers;
      if (speakerImageFiles.length > 0) {
        speakerImageFiles.forEach((file) => {
          const match = file.fieldname.match(/\[(\d+)\]/);
          if (match) {
            const index = parseInt(match[1]);
            if (parsedSpeakers[index]) {
              const oldSpeaker = event.speakers[index];
              if (oldSpeaker && oldSpeaker.image && oldSpeaker.image.includes('cloudinary')) {
                try {
                  const publicId = oldSpeaker.image.split('/').pop().split('.')[0];
                  cloudinary.uploader.destroy(`eventroom/speakers/${publicId}`);
                } catch (err) { console.error('Error deleting old speaker image:', err); }
              }
              parsedSpeakers[index].image = file.path;
            }
          }
        });
      }
      for (let i = 0; i < parsedSpeakers.length; i++) {
        const existingSpeaker = event.speakers[i];
        if (existingSpeaker && existingSpeaker.image) {
          if (!parsedSpeakers[i].image || parsedSpeakers[i].image === '') {
            parsedSpeakers[i].image = existingSpeaker.image;
          }
        }
      }
      for (const oldSpeaker of event.speakers) {
        if (oldSpeaker.image && oldSpeaker.image.includes('cloudinary')) {
          const stillExists = parsedSpeakers.some(s => s.image === oldSpeaker.image);
          if (!stillExists) {
            try {
              const publicId = oldSpeaker.image.split('/').pop().split('.')[0];
              await cloudinary.uploader.destroy(`eventroom/speakers/${publicId}`);
            } catch (err) { console.error('Error deleting old speaker image:', err); }
          }
        }
      }
      event.speakers = parsedSpeakers;
    } catch (error) { console.error('Speaker parsing error:', error); }
  }

  // ---------- Handle ticket types ----------
  if (ticketTypes) {
    try {
      event.ticketTypes = typeof ticketTypes === 'string' ? JSON.parse(ticketTypes) : ticketTypes;
    } catch (error) { console.error('Ticket types parsing error:', error); }
  }

  // ---------- Handle event images ----------
  const imagesToKeep = keepImages
    ? (Array.isArray(keepImages) ? keepImages : JSON.parse(keepImages))
    : [];
  for (const oldImage of event.images) {
    if (!imagesToKeep.includes(oldImage)) {
      try {
        const publicId = oldImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`eventroom/${publicId}`);
      } catch (err) { console.error('Error deleting old image:', err); }
    }
  }
  const newImages = eventImageFiles.map(file => file.path);
  event.images = [...imagesToKeep, ...newImages];

  // ---------- Update text fields ----------
  if (title) event.title = title.trim();
  if (description) event.description = description;
  if (eventType) event.eventType = eventType;
  if (category) event.category = category;
  if (date) {
    event.date = new Date(date);
    if (event.status !== 'postponed' && event.status !== 'cancelled') {
      event.status = hasEventPassed(event) ? 'passed' : 'upcoming';
    }
  }
  if (time) event.time = time;
  if (duration !== undefined) event.duration = duration;
  if (location) event.location = location;
  if (venue) event.venue = venue;
  if (isVirtual !== undefined) event.isVirtual = isVirtual === 'true' || isVirtual === true;
  if (meetingLink !== undefined) event.meetingLink = meetingLink;
  if (maxAttendees !== undefined) event.maxAttendees = Number(maxAttendees);
  if (isPaid !== undefined) event.isPaid = isPaid === 'true' || isPaid === true;
  if (price !== undefined) event.price = Number(price);
  if (enableMultipleTickets !== undefined) event.enableMultipleTickets = enableMultipleTickets === 'true' || enableMultipleTickets === true;
  if (maxTicketsPerOrder !== undefined) event.maxTicketsPerOrder = Number(maxTicketsPerOrder);
  if (registrationDeadline) event.registrationDeadline = new Date(registrationDeadline);
  if (tags) event.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);

  // ---------- Custom form ----------
  if (customForm !== undefined) {
    const formData = typeof customForm === 'string' ? JSON.parse(customForm) : customForm;
    if (formData && formData.fields && formData.fields.length > 0) {
      const formId = await upsertEventForm(event._id, formData);
      event.customForm = formId;
    } else if (customForm === null || (Array.isArray(formData?.fields) && formData.fields.length === 0)) {
      if (event.customForm) {
        await EventForm.findByIdAndDelete(event.customForm);
        event.customForm = undefined;
      }
    }
  }

  // ---------- Save poster template ----------
  event.posterTemplate = finalPosterTemplate;

  await event.save();
  res.json(event);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await findEvent(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this event');
  }

  // Delete event images
  for (const image of event.images) {
    try {
      const publicId = image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`eventroom/${publicId}`);
    } catch (err) {}
  }

  // Delete poster template image
  if (event.posterTemplate && event.posterTemplate.image) {
    try {
      const publicId = event.posterTemplate.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`eventroom/posters/${publicId}`);
    } catch (err) {}
  }

  await EventRegistration.deleteMany({ event: event._id });
  await EventForm.deleteOne({ event: event._id });
  await Event.deleteOne({ _id: event._id });
  res.json({ message: 'Event removed successfully' });
});

// --------------------- REPORT / DISABLE EVENT ---------------------

const reportEvent = asyncHandler(async (req, res) => {
  const event = await findEvent(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  event.reportCount = (event.reportCount || 0) + 1;
  if (event.reportCount >= 5 && !event.isDisabled) {
    event.isDisabled = true;
    event.disabledAt = Date.now();
    event.disabledReason = 'Reported by multiple users';
    const creator = await User.findById(event.createdBy);
    if (creator) await sendEventReportNotice(creator.email, event.title, event.reportCount);
  }
  await event.save();
  res.json({ message: 'Event reported', reportCount: event.reportCount, isDisabled: event.isDisabled });
});

const toggleEventStatus = asyncHandler(async (req, res) => {
  const event = await findEvent(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  const { reason } = req.body;
  event.isDisabled = !event.isDisabled;
  if (event.isDisabled) {
    event.disabledAt = Date.now();
    event.disabledReason = reason || 'Disabled by admin';
  } else {
    event.disabledAt = null;
    event.disabledReason = '';
    event.reportCount = 0;
  }
  await event.save();
  const creator = await User.findById(event.createdBy);
  if (creator) {
    await sendEventReportNotice(creator.email, event.title, 0, event.isDisabled ? 'disabled' : 'enabled');
  }
  res.json({ message: event.isDisabled ? 'Event disabled' : 'Event enabled', event });
});

// --------------------- REGISTRATION (WITH QR & POSTER) ---------------------

const registerForEvent = asyncHandler(async (req, res) => {
  const {
    name, email, phone,
    ticketTypeIndex = 0,
    quantity = 1,
    additionalAttendees = [],
    sendIndividualTickets = false,
    customFormResponses = [],
  } = req.body;

  if (!name || !email) {
    res.status(400);
    throw new Error('Name and email are required');
  }

  const event = await findEvent(req.params.id);
  if (!event || event.isDisabled) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  // Check if registration is still open
  if (!isRegistrationOpen(event)) {
    res.status(400);
    throw new Error('Registration is closed for this event');
  }

  // Load custom form and validate required fields
  let customForm = null;
  if (event.customForm) {
    customForm = await EventForm.findById(event.customForm);
    if (customForm && customForm.isActive) {
      for (const field of customForm.fields) {
        if (field.required) {
          const response = customFormResponses.find(
            r => r.fieldId.toString() === field._id.toString()
          );
          const val = response?.value;
          if (
            response === undefined ||
            val === undefined ||
            val === '' ||
            (Array.isArray(val) && val.length === 0)
          ) {
            res.status(400);
            throw new Error(`"${field.label}" is required`);
          }
        }
      }
    }
  }

  let selectedTicketType = null;
  let ticketPrice = event.price || 0;
  let seatsPerTicket = 1;

  if (event.ticketTypes && event.ticketTypes.length > 0) {
    selectedTicketType = event.ticketTypes[ticketTypeIndex];
    if (!selectedTicketType) {
      res.status(400);
      throw new Error('Invalid ticket type');
    }
    ticketPrice = selectedTicketType.price;
    seatsPerTicket = selectedTicketType.seatsPerTicket || 1;

    if (selectedTicketType.capacity > 0 && (selectedTicketType.soldCount + quantity) > selectedTicketType.capacity) {
      res.status(400);
      throw new Error(`Only ${selectedTicketType.capacity - selectedTicketType.soldCount} ${selectedTicketType.name} tickets remaining`);
    }
  }

  const totalQuantity = quantity + (additionalAttendees?.length || 0);
  if (event.enableMultipleTickets && event.maxTicketsPerOrder && totalQuantity > event.maxTicketsPerOrder) {
    res.status(400);
    throw new Error(`Maximum ${event.maxTicketsPerOrder} tickets per order`);
  }

  const confirmedCount = await EventRegistration.countDocuments({ event: event._id, status: 'confirmed' });
  const totalSeats = quantity * seatsPerTicket + (additionalAttendees?.length || 0) * seatsPerTicket;
  if (event.maxAttendees > 0 && (confirmedCount + totalSeats) > event.maxAttendees) {
    res.status(400);
    throw new Error('Not enough seats available');
  }

  const existingRegistration = await EventRegistration.findOne({
    event: event._id,
    email: email.toLowerCase().trim(),
    status: { $in: ['confirmed', 'pending'] },
  });
  if (existingRegistration) {
    res.status(400);
    throw new Error('You are already registered for this event');
  }

  const totalAmount = ticketPrice * quantity;

  const registrationData = {
    event: event._id,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone || '',
    isPaidEvent: event.isPaid && totalAmount > 0,
    price: ticketPrice,
    totalAmount,
    quantity,
    ticketType: selectedTicketType?.name || 'General',
    ticketTypeIndex,
    seatsPerTicket,
    totalSeats,
    customFormResponses,
    additionalAttendees: additionalAttendees.map(att => ({
      ...att,
      email: att.email?.toLowerCase().trim(),
    })),
    sendIndividualTickets,
  };

  // --------------------- POSTER SUPPORT ---------------------
  const posterTemplate = (event.posterTemplate && event.posterTemplate.image) ? event.posterTemplate : null;
  const canGeneratePoster = !!posterTemplate;

  // Free event – direct confirmation
  if (!registrationData.isPaidEvent || totalAmount === 0) {
    const baseSeatNumber = await generateSeatNumber(event._id);
    registrationData.status = 'confirmed';
    registrationData.seatNumber = baseSeatNumber;
    registrationData.additionalAttendees = registrationData.additionalAttendees.map((att, idx) => ({
      ...att,
      seatNumber: `${baseSeatNumber}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
    }));

    // Set poster related fields
    if (canGeneratePoster) {
      registrationData.posterGenerated = false;
      registrationData.posterImage = '';
      registrationData.userPhoto = '';
      registrationData.posterName = '';
    }

    const registration = await EventRegistration.create(registrationData);

    event.currentAttendees = confirmedCount + totalSeats;
    if (selectedTicketType) {
      event.ticketTypes[ticketTypeIndex].soldCount += quantity;
    }
    await event.save();

    // --- Generate QR code for main ticket ---
    const mainQrDataUrl = await generateTicketQR(registration.ticketId, registration.name, event.title);

    // Send confirmation email with embedded QR
    await sendRegistrationConfirmation(
      registration.email,
      registration.name,
      event.title,
      event.date,
      event.time,
      event.venue || event.location,
      registration,
      event,
      mainQrDataUrl
    );

    // Send individual tickets for additional attendees (each with its own QR)
    if (registration.sendIndividualTickets && registration.additionalAttendees?.length > 0) {
      for (const att of registration.additionalAttendees) {
        if (att.email) {
          const attendeeQr = await generateTicketQR(att.ticketId, att.name, event.title);
          await sendTicketToAttendee(
            att.email, att.name, event.title, event.date, event.time,
            event.venue || event.location, att.ticketId, att.seatNumber, event, attendeeQr
          );
        }
      }
    }

    const creator = await User.findById(event.createdBy);
    if (creator) {
      await sendNewRegistrationToCreator(
        creator.email, event.title, name, email, 'free', registration.ticketId, registration.seatNumber, quantity
      );
    }

    return res.status(201).json({
      message: 'Registration successful! Check your email for your ticket(s) with QR code.',
      registration,
      canGeneratePoster,
      posterTemplate: canGeneratePoster ? posterTemplate : null,
    });
  }

  // Paid event – initiate payment
  const registration = await EventRegistration.create({
    ...registrationData,
    status: 'pending',
    // Set poster fields if available
    posterGenerated: canGeneratePoster ? false : undefined,
    posterImage: '',
    userPhoto: '',
    posterName: '',
  });

  try {
    const paymentPayload = {
      email: email.toLowerCase().trim(),
      amount: Math.round(totalAmount * 100),
      reference: `EVT-${registration._id}-${Date.now()}`,
      metadata: {
        registrationId: registration._id.toString(),
        eventId: event._id.toString(),
        eventTitle: event.title,
        quantity,
        ticketType: selectedTicketType?.name || 'General',
      },
      callback_url: `${process.env.FRONTEND_URL}/events/${event.slug}`,
    };

    const isUserEvent = event.creatorType !== 'admin' && event.paymentSplit !== 'full';
    if (isUserEvent) {
      const creator = await User.findById(event.createdBy);
      if (creator && creator.paystackSubaccountCode) {
        paymentPayload.subaccount = creator.paystackSubaccountCode;
      }
    }

    const paymentResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      paymentPayload,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }
    );

    registration.paymentReference = paymentResponse.data.data.reference;
    await registration.save();

    res.status(201).json({
      message: 'Please complete payment to confirm your registration. Your ticket with QR code will be sent after payment.',
      registration,
      paymentUrl: paymentResponse.data.data.authorization_url,
      canGeneratePoster,
      posterTemplate: canGeneratePoster ? posterTemplate : null,
    });
  } catch (error) {
    registration.status = 'failed';
    await registration.save();
    res.status(500);
    throw new Error('Payment initialization failed. Please try again.');
  }
});

// --------------------- VERIFY PAYMENT (WITH QR & POSTER) ---------------------

const verifyEventPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );

    const { status, metadata, amount, reference: paystackRef } = response.data.data;

    if (status === 'success') {
      let registration = await EventRegistration.findOne({ paymentReference: reference });
      if (!registration && metadata?.registrationId) {
        registration = await EventRegistration.findById(metadata.registrationId);
      }
      if (!registration) {
        res.status(404);
        throw new Error('Registration not found');
      }
      if (registration.status === 'confirmed') {
        return res.json({ message: 'Payment already confirmed', registration });
      }

      const totalTickets = registration.quantity || 1;
      const currentConfirmed = await EventRegistration.countDocuments({
        event: registration.event,
        status: 'confirmed',
      });

      const seatPrefix = 'A';
      const seats = [];
      for (let i = 0; i < totalTickets; i++) {
        seats.push(`${seatPrefix}${String(currentConfirmed + i + 1).padStart(3, '0')}`);
      }

      registration.status = 'confirmed';
      registration.paymentConfirmedAt = Date.now();
      registration.paymentReference = paystackRef || reference;
      registration.paidAmount = amount / 100;
      registration.seatNumber = seats[0];

      if (registration.additionalAttendees?.length > 0) {
        registration.additionalAttendees.forEach((att, idx) => {
          att.seatNumber = seats[idx + 1] || `${seatPrefix}${String(currentConfirmed + idx + 2).padStart(3, '0')}`;
        });
      }

      // --------------------- POSTER SUPPORT ---------------------
      const event = await Event.findById(registration.event);
      const posterTemplate = (event && event.posterTemplate && event.posterTemplate.image) ? event.posterTemplate : null;
      const canGeneratePoster = !!posterTemplate;

      if (canGeneratePoster) {
        registration.posterGenerated = false;
        registration.posterImage = '';
        registration.userPhoto = '';
        registration.posterName = '';
      }

      await registration.save();

      if (event) {
        const confirmedCount = await EventRegistration.countDocuments({ event: event._id, status: 'confirmed' });
        event.currentAttendees = confirmedCount;

        if (event.ticketTypes && event.ticketTypes[registration.ticketTypeIndex]) {
          event.ticketTypes[registration.ticketTypeIndex].soldCount += (registration.quantity || 1);
        }
        await event.save();

        const totalAmount = amount / 100;
        const isAdminEvent = event.creatorType === 'admin' || event.paymentSplit === 'full';

        if (isAdminEvent) {
          await Transaction.create({
            event: event._id,
            registration: registration._id,
            creator: event.createdBy,
            totalAmount,
            companyShare: totalAmount,
            creatorShare: 0,
            status: 'completed',
            paystackReference: paystackRef || reference,
          });
        } else {
          const companyShare = (totalAmount * COMPANY_SHARE_PERCENTAGE) / 100;
          const creatorShare = (totalAmount * CREATOR_SHARE_PERCENTAGE) / 100;
          await Transaction.create({
            event: event._id,
            registration: registration._id,
            creator: event.createdBy,
            totalAmount,
            companyShare,
            creatorShare,
            status: 'completed',
            paystackReference: paystackRef || reference,
          });
        }

        // --- Generate QR code for main ticket ---
        const mainQrDataUrl = await generateTicketQR(registration.ticketId, registration.name, event.title);

        // Send payment confirmation email with embedded QR
        await sendPaymentConfirmation(
          registration.email,
          registration.name,
          event.title,
          totalAmount,
          registration,
          event,
          mainQrDataUrl
        );

        // Send individual tickets for additional attendees (each with its own QR)
        if (registration.sendIndividualTickets && registration.additionalAttendees?.length > 0) {
          for (const att of registration.additionalAttendees) {
            if (att.email) {
              const attendeeQr = await generateTicketQR(att.ticketId, att.name, event.title);
              await sendTicketToAttendee(
                att.email, att.name, event.title, event.date, event.time,
                event.venue || event.location, att.ticketId, att.seatNumber, event, attendeeQr
              );
            }
          }
        }

        const creator = await User.findById(event.createdBy);
        if (creator) {
          await sendPaymentToCreator(
            creator.email,
            event.title,
            registration.name,
            totalAmount,
            isAdminEvent ? 0 : CREATOR_SHARE_PERCENTAGE
          );
        }
      }

      return res.json({
        message: 'Payment verified! Check your email for your ticket(s) with QR code.',
        registration,
        canGeneratePoster,
        posterTemplate: canGeneratePoster ? posterTemplate : null,
      });
    } else {
      const reg = await EventRegistration.findOne({ paymentReference: reference });
      if (reg && reg.status === 'pending') {
        reg.status = 'failed';
        await reg.save();
      }
      res.status(400);
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    if (error.response) {
      res.status(400);
      throw new Error(error.response.data.message || 'Payment verification failed');
    }
    throw error;
  }
});

// --------------------- CHECK-IN & VERIFY TICKET ---------------------

const checkInAttendee = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  let registration = await EventRegistration.findOne({ ticketId }).populate('event', 'title date createdBy');
  if (!registration) {
    registration = await EventRegistration.findOne({ 'additionalAttendees.ticketId': ticketId })
      .populate('event', 'title date createdBy');
    if (registration) {
      const attIndex = registration.additionalAttendees.findIndex(a => a.ticketId === ticketId);
      if (attIndex !== -1 && !registration.additionalAttendees[attIndex].checkedIn) {
        registration.additionalAttendees[attIndex].checkedIn = true;
        registration.additionalAttendees[attIndex].checkedInAt = Date.now();
        registration.markModified('additionalAttendees');
        await registration.save();
        return res.json({ message: 'Check-in successful', attendee: registration.additionalAttendees[attIndex] });
      }
      res.status(400);
      throw new Error('Already checked in');
    }
  }

  if (!registration) {
    res.status(404);
    throw new Error('Invalid ticket ID');
  }
  if (registration.status !== 'confirmed') {
    res.status(400);
    throw new Error('Registration is not confirmed');
  }
  if (registration.ticketCheckedIn) {
    res.status(400);
    throw new Error('Attendee already checked in');
  }

  const event = registration.event;
  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  registration.ticketCheckedIn = true;
  registration.checkedInAt = Date.now();
  await registration.save();

  res.json({
    message: 'Check-in successful',
    attendee: {
      name: registration.name,
      email: registration.email,
      ticketId: registration.ticketId,
      seatNumber: registration.seatNumber,
      checkedInAt: registration.checkedInAt,
    },
  });
});

const verifyTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  let registration = await EventRegistration.findOne({ ticketId }).populate('event', 'title date time venue location');
  if (!registration) {
    registration = await EventRegistration.findOne({ 'additionalAttendees.ticketId': ticketId })
      .populate('event', 'title date time venue location');
    if (registration) {
      const att = registration.additionalAttendees.find(a => a.ticketId === ticketId);
      return res.json({
        valid: registration.status === 'confirmed' && !att?.checkedIn,
        attendee: { name: att?.name, ticketId: att?.ticketId, seatNumber: att?.seatNumber, checkedIn: att?.checkedIn || false },
        event: { title: registration.event.title, date: registration.event.date, time: registration.event.time },
      });
    }
  }

  if (!registration) {
    res.status(404);
    throw new Error('Invalid ticket');
  }

  res.json({
    valid: registration.status === 'confirmed' && !registration.ticketCheckedIn,
    attendee: { name: registration.name, ticketId: registration.ticketId, seatNumber: registration.seatNumber, checkedIn: registration.ticketCheckedIn },
    event: { title: registration.event.title, date: registration.event.date, time: registration.event.time },
  });
});

// --------------------- CUSTOM FORM (dedicated endpoints) ---------------------

const getEventCustomForm = asyncHandler(async (req, res) => {
  const event = await findEvent(req.params.id);
  if (!event || event.isDisabled) {
    res.status(404);
    throw new Error('Event not found');
  }
  const form = await EventForm.findOne({ event: event._id });
  res.json(form || { message: 'No custom form' });
});

const updateEventCustomForm = asyncHandler(async (req, res) => {
  const event = await findEvent(req.params.id);
  if (!event || event.isDisabled) {
    res.status(404);
    throw new Error('Event not found');
  }
  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const formData = req.body; // { title, description, fields }
  const formId = await upsertEventForm(event._id, formData);

  if (formId) {
    event.customForm = formId;
    await event.save();
    const updatedForm = await EventForm.findById(formId);
    return res.json(updatedForm);
  } else if (req.body.fields && req.body.fields.length === 0) {
    // explicit removal
    if (event.customForm) {
      await EventForm.findByIdAndDelete(event.customForm);
      event.customForm = undefined;
      await event.save();
    }
    return res.json({ message: 'Custom form removed' });
  }
  res.json(event);
});

// --------------------- WALLET ---------------------

const setupPaystackWallet = asyncHandler(async (req, res) => {
  const { accountNumber, bankCode, businessName } = req.body;
  if (!accountNumber || !bankCode) {
    res.status(400);
    throw new Error('Account number and bank code are required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  try {
    const subaccountResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/subaccount`,
      {
        business_name: businessName || user.name || 'Event Creator',
        settlement_bank: bankCode,
        account_number: accountNumber,
        percentage_charge: COMPANY_SHARE_PERCENTAGE,
        description: `Event creator: ${user.email}`,
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }
    );

    user.paystackSubaccountCode = subaccountResponse.data.data.subaccount_code;
    user.paystackAccountDetails = {
      accountNumber,
      bankCode,
      businessName: businessName || user.name,
    };
    user.hasPaymentWallet = true;
    await user.save();
    await sendWalletSetupConfirmation(user.email, user.name);

    res.json({
      message: 'Payment wallet set up successfully!',
      subaccountCode: user.paystackSubaccountCode,
    });
  } catch (error) {
    console.error('Wallet setup error:', error.response?.data || error.message);
    res.status(500);
    throw new Error(error.response?.data?.message || 'Failed to set up payment wallet');
  }
});

const getWalletInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || !user.hasPaymentWallet) {
    return res.json({ hasWallet: false, message: 'Payment wallet not set up' });
  }

  const transactions = await Transaction.find({ creator: user._id })
    .populate('event', 'title date')
    .sort({ createdAt: -1 });

  const totalEarnings = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.creatorShare, 0);
  const totalWithdrawn = transactions
    .filter(t => t.withdrawn)
    .reduce((sum, t) => sum + t.creatorShare, 0);

  res.json({
    hasWallet: true,
    walletDetails: { accountDetails: user.paystackAccountDetails },
    totalEarnings,
    totalWithdrawn,
    availableBalance: totalEarnings - totalWithdrawn,
    transactions,
  });
});

const withdrawEarnings = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || Number(amount) <= 0) {
    res.status(400);
    throw new Error('Valid withdrawal amount is required');
  }

  const user = await User.findById(req.user._id);
  if (!user || !user.hasPaymentWallet) {
    res.status(400);
    throw new Error('Payment wallet not set up');
  }

  const transactions = await Transaction.find({ creator: user._id, status: 'completed' });
  let remaining = Number(amount);
  for (const t of transactions) {
    if (remaining <= 0) break;
    if (!t.withdrawn) {
      t.withdrawn = true;
      t.withdrawnAt = Date.now();
      await t.save();
      remaining -= t.creatorShare;
    }
  }

  await sendWithdrawalConfirmation(user.email, user.name, Number(amount));
  res.json({ message: `₦${Number(amount).toLocaleString()} withdrawal recorded`, withdrawn: Number(amount) });
});

// --------------------- BANK LIST ---------------------

const getBankList = asyncHandler(async (req, res) => {
  try {
    if (!PAYSTACK_SECRET_KEY) return res.json(getFallbackBanks());
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      params: { country: 'nigeria', perPage: 100 },
    });
    if (response.data?.data) {
      const banks = response.data.data.filter(bank => bank.type === 'nuban' || !bank.type);
      return res.json(banks);
    }
    return res.json(getFallbackBanks());
  } catch (error) {
    console.error('Failed to fetch bank list:', error.response?.data || error.message);
    res.json(getFallbackBanks());
  }
});

const getFallbackBanks = () => [
  { name: 'Access Bank', code: '044', type: 'nuban' },
  { name: 'Ecobank Nigeria', code: '050', type: 'nuban' },
  { name: 'Fidelity Bank', code: '070', type: 'nuban' },
  { name: 'First Bank of Nigeria', code: '011', type: 'nuban' },
  { name: 'First City Monument Bank (FCMB)', code: '214', type: 'nuban' },
  { name: 'Guaranty Trust Bank (GTB)', code: '058', type: 'nuban' },
  { name: 'Keystone Bank', code: '082', type: 'nuban' },
  { name: 'Kuda Bank', code: '000013', type: 'nuban' },
  { name: 'Moniepoint MFB', code: '000026', type: 'nuban' },
  { name: 'Opay', code: '000008', type: 'nuban' },
  { name: 'Palmpay', code: '000010', type: 'nuban' },
  { name: 'Polaris Bank', code: '076', type: 'nuban' },
  { name: 'Providus Bank', code: '101', type: 'nuban' },
  { name: 'Stanbic IBTC Bank', code: '007', type: 'nuban' },
  { name: 'Standard Chartered Bank', code: '068', type: 'nuban' },
  { name: 'Sterling Bank', code: '232', type: 'nuban' },
  { name: 'Union Bank of Nigeria', code: '032', type: 'nuban' },
  { name: 'United Bank for Africa (UBA)', code: '033', type: 'nuban' },
  { name: 'Unity Bank', code: '215', type: 'nuban' },
  { name: 'Wema Bank', code: '035', type: 'nuban' },
  { name: 'Zenith Bank', code: '057', type: 'nuban' },
];

// --------------------- REGISTRATIONS ---------------------

const getEventRegistrations = asyncHandler(async (req, res) => {
  const event = await findEvent(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const isOwner = event.createdBy?.toString() === req.user?._id?.toString();
  const isAdmin = req.user?.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view registrations');
  }

  const { status, page = 1, limit = 50 } = req.query;
  let query = { event: event._id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const registrations = await EventRegistration.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await EventRegistration.countDocuments(query);

  res.json({
    event: event.title,
    totalRegistrations: total,
    confirmedCount: await EventRegistration.countDocuments({ event: event._id, status: 'confirmed' }),
    pendingCount: await EventRegistration.countDocuments({ event: event._id, status: 'pending' }),
    registrations,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await EventRegistration.find({ email: req.user.email.toLowerCase() })
    .populate('event', 'title slug date time location status registrationDeadline')
    .sort({ createdAt: -1 });
  
  // Add registration open status for each event
  const registrationsWithStatus = registrations.map(reg => {
    const regObj = reg.toObject();
    if (regObj.event) {
      regObj.event.registrationOpen = isRegistrationOpen(regObj.event);
    }
    return regObj;
  });
  
  res.json(registrationsWithStatus);
});

// --------------------- ADMIN DASHBOARD ---------------------

const getAdminDashboard = asyncHandler(async (req, res) => {
  res.json({
    totalEvents: await Event.countDocuments(),
    activeEvents: await Event.countDocuments({ status: 'upcoming', isDisabled: false }),
    totalRegistrations: await EventRegistration.countDocuments({ status: 'confirmed' }),
    totalCreators: (await Event.distinct('createdBy')).length,
    events: await Event.find().populate('createdBy', 'name email'),
  });
});

const getEventFilters = asyncHandler(async (req, res) => {
  res.json({
    categories: await Event.distinct('category'),
    eventTypes: await Event.distinct('eventType'),
  });
});

// --------------------- PAYSTACK WEBHOOK ---------------------

const handlePaystackWebhook = asyncHandler(async (req, res) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');
  if (hash !== req.headers['x-paystack-signature']) {
    res.status(400);
    throw new Error('Invalid webhook signature');
  }

  const { event, data } = req.body;
  console.log(`Webhook received: ${event}`);

  switch (event) {
    case 'charge.success':
      console.log('Charge success:', data.reference);
      break;
    case 'transfer.success':
      await handleTransferSuccess(data);
      break;
    case 'transfer.failed':
      console.log('Transfer failed:', data.reference);
      break;
    case 'subaccount.created':
      console.log('Subaccount created:', data.subaccount_code);
      break;
    case 'settlement.success':
      await handleSettlementSuccess(data);
      break;
    default:
      console.log(`Unhandled webhook event: ${event}`);
  }

  res.status(200).json({ status: 'ok' });
});

const handleTransferSuccess = async (data) => {
  try {
    const transaction = await Transaction.findOne({ paystackReference: data.reference });
    if (transaction && !transaction.withdrawn) {
      transaction.withdrawn = true;
      transaction.withdrawnAt = Date.now();
      transaction.transferStatus = 'success';
      await transaction.save();
      const creator = await User.findById(transaction.creator);
      if (creator) {
        await sendWithdrawalConfirmation(creator.email, creator.name, data.amount / 100);
      }
    }
  } catch (error) {
    console.error('Error handling transfer success:', error);
  }
};

const handleSettlementSuccess = async (data) => {
  try {
    if (data.status !== 'success') return;
    const user = await User.findOne({
      paystackSubaccountCode: data.subaccount?.subaccount_code || data.subaccount,
    });
    if (!user) return;

    const pendingTransactions = await Transaction.find({
      creator: user._id,
      status: 'completed',
      withdrawn: false,
    });
    let totalMarked = 0;
    for (const t of pendingTransactions) {
      t.withdrawn = true;
      t.withdrawnAt = Date.now();
      t.settlementStatus = 'success';
      await t.save();
      totalMarked += t.creatorShare;
    }

    if (totalMarked > 0) {
      await sendSettlementNotification(user.email, user.name, totalMarked, pendingTransactions.length);
    }
  } catch (error) {
    console.error('Error handling settlement success:', error);
  }
};

// --------------------- REMINDERS ---------------------

const sendReminder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const event = await findEvent(id);
  if (!event || event.isDisabled) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : new Date(event.date);
  registrationDeadline.setHours(23, 59, 59, 999);
  
  const eventDate = new Date(event.date);
  eventDate.setHours(23, 59, 59, 999);
  
  const now = new Date();
  const daysUntilDeadline = Math.ceil((registrationDeadline - now) / (1000 * 60 * 60 * 24));
  const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
  
  let reminderType = null;
  let daysRemaining = null;
  
  // Check if registration is still open (deadline not passed)
  const isDeadlinePassed = now > registrationDeadline;
  const isEventPassed = now > eventDate;
  
  // Check registration deadline reminders (only if not passed)
  if (!isDeadlinePassed && daysUntilDeadline === 1) {
    reminderType = 'registration_tomorrow';
    daysRemaining = 1;
  } else if (!isDeadlinePassed && daysUntilDeadline === 0) {
    reminderType = 'registration_today';
    daysRemaining = 0;
  } 
  // Check event reminders (only if event hasn't passed and registration deadline may have passed)
  else if (!isEventPassed && daysUntilEvent === 3) {
    reminderType = '3_days';
    daysRemaining = 3;
  } else if (!isEventPassed && daysUntilEvent === 2) {
    reminderType = '2_days';
    daysRemaining = 2;
  } else if (!isEventPassed && daysUntilEvent === 1) {
    reminderType = '1_day';
    daysRemaining = 1;
  } else if (!isEventPassed && daysUntilEvent === 0) {
    reminderType = 'event_today';
    daysRemaining = 0;
  }
  
  // If no reminder needed today
  if (!reminderType) {
    let message = '';
    if (isEventPassed) {
      message = 'Event has already passed';
    } else if (daysUntilDeadline > 1 && daysUntilEvent > 3) {
      message = `No reminders to send today. Next reminder will be ${daysUntilDeadline === 1 ? 'tomorrow (registration deadline)' : daysUntilEvent === 3 ? 'in 3 days (event)' : 'closer to event'}`;
    } else {
      message = 'No reminders scheduled for today';
    }
    return res.json({ 
      message,
      daysUntilDeadline,
      daysUntilEvent,
      registrationDeadline: registrationDeadline.toISOString().split('T')[0],
      eventDate: eventDate.toISOString().split('T')[0],
      isRegistrationOpen: !isDeadlinePassed,
      isEventPassed
    });
  }
  
  // Get all confirmed registrations for this event
  const registrations = await EventRegistration.find({
    event: event._id,
    status: 'confirmed'
  });
  
  if (registrations.length === 0) {
    return res.json({ 
      message: 'No confirmed registrations to send reminders to', 
      sentCount: 0,
      reminderType,
      daysRemaining
    });
  }
  
  let sentCount = 0;
  const failedEmails = [];
  
  for (const registration of registrations) {
    try {
      await sendEventReminder(
        registration.email,
        registration.name,
        event,
        daysRemaining,
        reminderType,
        registration
      );
      sentCount++;
    } catch (error) {
      console.error(`Failed to send reminder to ${registration.email}:`, error);
      failedEmails.push(registration.email);
    }
  }
  
  res.json({
    success: true,
    message: `${reminderType === 'registration_today' || reminderType === 'registration_tomorrow' 
      ? 'Registration deadline reminder' 
      : 'Event reminder'} sent to ${sentCount} registrant${sentCount !== 1 ? 's' : ''}`,
    sentCount,
    failedCount: failedEmails.length,
    failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
    reminderType,
    daysRemaining,
    daysUntilEvent,
    daysUntilDeadline,
    isRegistrationOpen: !isDeadlinePassed
  });
});

// Send reminders for ALL events that need them (for cron jobs)
const sendAllReminders = asyncHandler(async (req, res) => {
  const now = new Date();
  
  const events = await Event.find({ 
    isDisabled: { $ne: true },
    status: { $ne: 'passed' }
  });
  
  let totalSent = 0;
  const results = [];
  
  for (const event of events) {
    const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : new Date(event.date);
    registrationDeadline.setHours(23, 59, 59, 999);
    
    const eventDate = new Date(event.date);
    eventDate.setHours(23, 59, 59, 999);
    
    const daysUntilDeadline = Math.ceil((registrationDeadline - now) / (1000 * 60 * 60 * 24));
    const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    
    const isDeadlinePassed = now > registrationDeadline;
    const isEventPassed = now > eventDate;
    
    let reminderType = null;
    
    // Registration deadline reminders (only if not passed)
    if (!isDeadlinePassed && daysUntilDeadline === 1) {
      reminderType = 'registration_tomorrow';
    } else if (!isDeadlinePassed && daysUntilDeadline === 0) {
      reminderType = 'registration_today';
    } 
    // Event day reminders (only if event hasn't passed)
    else if (!isEventPassed && daysUntilEvent === 3) {
      reminderType = '3_days';
    } else if (!isEventPassed && daysUntilEvent === 2) {
      reminderType = '2_days';
    } else if (!isEventPassed && daysUntilEvent === 1) {
      reminderType = '1_day';
    } else if (!isEventPassed && daysUntilEvent === 0) {
      reminderType = 'event_today';
    }
    
    if (reminderType) {
      const registrations = await EventRegistration.find({
        event: event._id,
        status: 'confirmed'
      });
      
      if (registrations.length === 0) {
        results.push({
          eventId: event._id,
          eventTitle: event.title,
          reminderType,
          sentCount: 0,
          message: 'No confirmed registrations'
        });
        continue;
      }
      
      let eventSent = 0;
      for (const registration of registrations) {
        try {
          await sendEventReminder(
            registration.email,
            registration.name,
            event,
            reminderType === 'registration_today' || reminderType === 'registration_tomorrow' ? daysUntilDeadline : daysUntilEvent,
            reminderType,
            registration
          );
          eventSent++;
          totalSent++;
        } catch (error) {
          console.error(`Failed to send reminder for event ${event.title} to ${registration.email}:`, error);
        }
      }
      
      results.push({
        eventId: event._id,
        eventTitle: event.title,
        reminderType,
        daysUntilDeadline: reminderType.includes('registration') ? daysUntilDeadline : null,
        daysUntilEvent: reminderType.includes('registration') ? null : daysUntilEvent,
        sentCount: eventSent,
        totalRegistrations: registrations.length
      });
    }
  }
  
  res.json({
    success: true,
    message: `Sent reminders for ${results.length} events`,
    totalSent,
    results,
    timestamp: new Date().toISOString()
  });
});

// --------------------- POSTER GENERATION ---------------------

// --------------------- POSTER GENERATION (PUBLIC) ---------------------

// @desc    Generate personalised "I'm attending" poster
// @route   POST /api/events/:id/registrations/:registrationId/generate-poster
// @access  Public (registration ID acts as token; also supports authenticated users)
const generatePosterForRegistration = asyncHandler(async (req, res) => {
  const { id, registrationId } = req.params;
  const { name } = req.body;
  const photoFile = req.file;

  console.log('📸 Poster generation request:', {
    eventId: id,
    registrationId,
    name,
    hasFile: !!photoFile,
    fileInfo: photoFile ? { originalname: photoFile.originalname, size: photoFile.size } : null,
  });

  try {
    const event = await findEvent(id);
    if (!event || event.isDisabled) {
      res.status(404);
      throw new Error('Event not found');
    }

    const registration = await EventRegistration.findById(registrationId);
    if (!registration || registration.event.toString() !== event._id.toString()) {
      res.status(404);
      throw new Error('Registration not found');
    }

    // Authorization: allow if registrant, event creator, admin, or anonymous (trust registration ID)
    let authorized = false;
    if (req.user) {
      const isOwner = registration.email.toLowerCase() === req.user.email.toLowerCase();
      const isEventCreator = event.createdBy.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      if (isOwner || isEventCreator || isAdmin) authorized = true;
    } else {
      authorized = true;
    }

    if (!authorized) {
      res.status(403);
      throw new Error('Not authorized to generate poster');
    }

    if (!event.posterTemplate || !event.posterTemplate.image) {
      res.status(400);
      throw new Error('This event does not support poster generation');
    }

    // Handle photo upload (if provided)
    let photoUrl = registration.userPhoto || '';
    if (photoFile) {
      const result = await cloudinary.uploader.upload(photoFile.path, {
        folder: 'poster_photos',
        public_id: `photo_${registrationId}_${Date.now()}`,
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      });
      photoUrl = result.secure_url;
      registration.userPhoto = photoUrl;
    } else {
      console.log('No photo provided, using existing userPhoto:', photoUrl);
    }

    const posterName = name || registration.name;

    console.log('Generating poster with:', {
      template: event.posterTemplate.image,
      photoUrl,
      posterName,
      placeholders: event.posterTemplate.photoPlaceholder,
      namePlaceholder: event.posterTemplate.namePlaceholder,
    });

    const posterUrl = await generatePoster(
      event.posterTemplate.image,
      photoUrl,
      posterName,
      {
        photo: {
          x: event.posterTemplate.photoPlaceholder?.x || 100,
          y: event.posterTemplate.photoPlaceholder?.y || 150,
          width: event.posterTemplate.photoPlaceholder?.width || 200,
          height: event.posterTemplate.photoPlaceholder?.height || 200,
          borderRadius: event.posterTemplate.photoPlaceholder?.borderRadius || 0, // <-- borderRadius passed to generator
        },
        name: {
          x: event.posterTemplate.namePlaceholder?.x || 100,
          y: event.posterTemplate.namePlaceholder?.y || 400,
          fontSize: event.posterTemplate.namePlaceholder?.fontSize || 48,
          color: event.posterTemplate.namePlaceholder?.color || '#FFFFFF',
          fontFamily: event.posterTemplate.namePlaceholder?.fontFamily || 'Arial',
        },
      }
    );

    registration.posterImage = posterUrl;
    registration.posterGenerated = true;
    registration.posterName = posterName;
    await registration.save();

    await sendPosterEmail(registration.email, registration.name, event.title, posterUrl, registration);

    res.json({
      message: 'Poster generated successfully',
      posterImage: posterUrl,
      registration,
    });
  } catch (error) {
    console.error('❌ Poster generation error:', error);
    throw error;
  }
});

// @desc    Get poster status for a registration
// @route   GET /api/events/:id/registrations/:registrationId/poster
// @access  Private (registrant or admin)
const getPosterStatus = asyncHandler(async (req, res) => {
  const { id, registrationId } = req.params;
  const registration = await EventRegistration.findById(registrationId);
  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }

  // Authorization check (optional, but good practice)
  const isOwner = registration.email === req.user.email;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({
    posterGenerated: registration.posterGenerated || false,
    posterImage: registration.posterImage || null,
  });
});

// --------------------- PUBLIC REGISTRATION INFO (for poster) ---------------------

// @desc    Get public registration info for poster generator
// @route   GET /api/registrations/:registrationId/public
// @access  Public
const getPublicRegistration = asyncHandler(async (req, res) => {
  const { registrationId } = req.params;

  const registration = await EventRegistration.findById(registrationId).populate('event', 'title posterTemplate');
  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }

  // Return safe fields
  res.json({
    name: registration.name,
    email: registration.email,
    posterGenerated: registration.posterGenerated || false,
    posterImage: registration.posterImage || null,
    event: {
      _id: registration.event._id,
      title: registration.event.title,
      posterTemplate: registration.event.posterTemplate || null,
    },
  });
});

// --------------------- EXPORT ---------------------

export {
  createEvent,
  getEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  reportEvent,
  toggleEventStatus,
  registerForEvent,
  verifyEventPayment,
  checkInAttendee,
  verifyTicket,
  getEventCustomForm,
  updateEventCustomForm,
  setupPaystackWallet,
  getWalletInfo,
  withdrawEarnings,
  getBankList,
  getEventRegistrations,
  getMyRegistrations,
  getAdminDashboard,
  getEventFilters,
  handlePaystackWebhook,
  sendReminder,
  sendAllReminders,
  generatePosterForRegistration,   // new
  getPosterStatus,  
  getPublicRegistration,
};