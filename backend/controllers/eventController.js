import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Event from '../models/eventModel.js';
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
} from '../utils/eventEmailService.js';

// Paystack config
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const COMPANY_SHARE_PERCENTAGE = 6;
const CREATOR_SHARE_PERCENTAGE = 94;

// Generate seat number helper
const generateSeatNumber = async (eventId) => {
  const confirmedCount = await EventRegistration.countDocuments({
    event: eventId,
    status: 'confirmed',
  });
  return `A${String(confirmedCount + 1).padStart(3, '0')}`;
};

// ==================== EVENT CREATION ====================

const createEvent = asyncHandler(async (req, res) => {
  const {
    title, description, eventType, category, date, time, duration,
    location, venue, speakers, maxAttendees, isPaid, price,
    registrationDeadline, tags, isVirtual, meetingLink,
    ticketTypes, enableMultipleTickets, maxTicketsPerOrder,
  } = req.body;

  // Basic validation – location is only required for in‑person events
  if (!title || !description || !eventType || !category || !date || !time) {
    // Clean up uploaded files on error
    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      for (const file of files) {
        await cloudinary.uploader.destroy(file.filename);
      }
    }
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Virtual event check – location is optional
  const isVirtualEvent = isVirtual === 'true' || isVirtual === true;
  const eventLocation = isVirtualEvent ? (location?.trim() || 'Online') : location;

  if (!eventLocation && !isVirtualEvent) {
    res.status(400);
    throw new Error('Location is required for in‑person events');
  }

  // Parse ticket types
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

  // Price validation for paid events
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

  // Parse speakers
  let parsedSpeakers = [];
  if (speakers) {
    try {
      parsedSpeakers = typeof speakers === 'string' ? JSON.parse(speakers) : speakers;
    } catch (error) {
      parsedSpeakers = [];
    }
  }

  // Separate event images from speaker images
  let eventImages = [];
  let speakerImageFiles = [];

  if (req.files) {
    const allFiles = Array.isArray(req.files) ? req.files : [];
    eventImages = allFiles.filter(f => f.fieldname === 'images');
    speakerImageFiles = allFiles.filter(f => f.fieldname.startsWith('speakerImages'));
  }

  // Get event image URLs
  const eventImageUrls = eventImages.map(file => file.path);

  // Assign speaker images to speakers based on fieldname index
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
    status: eventDate < now ? 'passed' : 'upcoming',
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean)) : [],
    createdBy: req.user._id,
    creatorType: isAdmin ? 'admin' : 'user',
    paymentSplit: isAdmin ? 'full' : 'split',
  });

  res.status(201).json({
    message: 'Event created successfully',
    event,
  });
});

// ==================== GET EVENTS ====================

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
        as: 'userCreator'
      }
    },
    {
      $lookup: {
        from: 'admins',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'adminCreator'
      }
    },
    {
      $addFields: {
        createdBy: {
          $cond: {
            if: { $eq: ['$creatorType', 'admin'] },
            then: { $arrayElemAt: ['$adminCreator', 0] },
            else: { $arrayElemAt: ['$userCreator', 0] }
          }
        }
      }
    },
    {
      $addFields: {
        'createdBy.name': { $ifNull: ['$createdBy.name', 'Unknown'] },
        'createdBy.email': { $ifNull: ['$createdBy.email', ''] },
        'createdBy.profile': { $ifNull: ['$createdBy.profile', ''] }
      }
    },
    {
      $project: {
        userCreator: 0,
        adminCreator: 0
      }
    }
  ];

  const events = await Event.aggregate(pipeline);
  const total = await Event.countDocuments(query);

  const now = new Date();
  for (const event of events) {
    if (event.date < now && event.status === 'upcoming') {
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
  const event = await Event.findById(req.params.id).lean();
  if (!event || event.isDisabled) {
    res.status(404);
    throw new Error('Event not found');
  }
  const confirmedCount = await EventRegistration.countDocuments({
    event: event._id,
    status: 'confirmed',
  });
  res.json({ ...event, currentAttendees: confirmedCount });
});

// ==================== UPDATE & DELETE EVENTS ====================

const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
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
  } = req.body;

  // FIXED: Handle files from .any() - req.files is a flat array
  let allFiles = [];
  if (req.files && Array.isArray(req.files)) {
    allFiles = req.files;
  }

  const eventImageFiles = allFiles.filter(f => f.fieldname === 'images');
  const speakerImageFiles = allFiles.filter(f => f.fieldname.startsWith('speakerImages'));

  // Handle speakers
  if (speakers) {
    try {
      let parsedSpeakers = typeof speakers === 'string' ? JSON.parse(speakers) : speakers;
      
      // Handle new speaker image uploads
      if (speakerImageFiles.length > 0) {
        speakerImageFiles.forEach((file) => {
          const match = file.fieldname.match(/\[(\d+)\]/);
          if (match) {
            const index = parseInt(match[1]);
            if (parsedSpeakers[index]) {
              // Delete old speaker image from cloudinary
              const oldSpeaker = event.speakers[index];
              if (oldSpeaker && oldSpeaker.image && oldSpeaker.image.includes('cloudinary')) {
                try {
                  const publicId = oldSpeaker.image.split('/').pop().split('.')[0];
                  cloudinary.uploader.destroy(`The_Brave_Events/speakers/${publicId}`);
                } catch (err) { console.error('Error deleting old speaker image:', err); }
              }
              parsedSpeakers[index].image = file.path;
            }
          }
        });
      }
      
      // Preserve existing speaker images for speakers not being updated
      for (let i = 0; i < parsedSpeakers.length; i++) {
        const existingSpeaker = event.speakers[i];
        if (existingSpeaker && existingSpeaker.image) {
          if (!parsedSpeakers[i].image || parsedSpeakers[i].image === '') {
            parsedSpeakers[i].image = existingSpeaker.image;
          }
        }
      }
      
      // Delete removed speaker images from cloudinary
      for (const oldSpeaker of event.speakers) {
        if (oldSpeaker.image && oldSpeaker.image.includes('cloudinary')) {
          const stillExists = parsedSpeakers.some(s => s.image === oldSpeaker.image);
          if (!stillExists) {
            try {
              const publicId = oldSpeaker.image.split('/').pop().split('.')[0];
              await cloudinary.uploader.destroy(`The_Brave_Events/speakers/${publicId}`);
            } catch (err) { console.error('Error deleting old speaker image:', err); }
          }
        }
      }
      event.speakers = parsedSpeakers;
    } catch (error) { console.error('Speaker parsing error:', error); }
  }

  // Handle ticket types
  if (ticketTypes) {
    try {
      event.ticketTypes = typeof ticketTypes === 'string' ? JSON.parse(ticketTypes) : ticketTypes;
    } catch (error) { console.error('Ticket types parsing error:', error); }
  }

  // FIXED: Handle event images - always process keepImages, even if no new uploads
  const imagesToKeep = keepImages
    ? (Array.isArray(keepImages) ? keepImages : JSON.parse(keepImages))
    : [];

  // Delete old images not in keepImages
  for (const oldImage of event.images) {
    if (!imagesToKeep.includes(oldImage)) {
      try {
        const publicId = oldImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`The_Brave_Events/${publicId}`);
      } catch (err) { console.error('Error deleting old image:', err); }
    }
  }

  // Add new event images
  const newImages = eventImageFiles.map(file => file.path);
  event.images = [...imagesToKeep, ...newImages];

  // Update other fields
  if (title) event.title = title.trim();
  if (description) event.description = description;
  if (eventType) event.eventType = eventType;
  if (category) event.category = category;
  if (date) { 
    event.date = new Date(date); 
    if (event.status !== 'postponed' && event.status !== 'cancelled') {
      event.status = event.date < new Date() ? 'passed' : 'upcoming';
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

  const updatedEvent = await event.save();
  res.json(updatedEvent);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) { res.status(403); throw new Error('Not authorized to delete this event'); }

  for (const image of event.images) {
    try {
      const publicId = image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`The_Brave_Events/${publicId}`);
    } catch (error) {}
  }
  await EventRegistration.deleteMany({ event: event._id });
  await Event.deleteOne({ _id: req.params.id });
  res.json({ message: 'Event removed successfully' });
});

// ==================== REPORT / DISABLE EVENT ====================

const reportEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  event.reportCount = (event.reportCount || 0) + 1;
  if (event.reportCount >= 5 && !event.isDisabled) {
    event.isDisabled = true;
    event.disabledAt = Date.now();
    event.disabledReason = 'Reported by multiple users';
    const creator = await User.findById(event.createdBy);
    if (creator) { await sendEventReportNotice(creator.email, event.title, event.reportCount); }
  }
  await event.save();
  res.json({ message: 'Event reported', reportCount: event.reportCount, isDisabled: event.isDisabled });
});

const toggleEventStatus = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  const { reason } = req.body;
  event.isDisabled = !event.isDisabled;
  if (event.isDisabled) { event.disabledAt = Date.now(); event.disabledReason = reason || 'Disabled by admin'; }
  else { event.disabledAt = null; event.disabledReason = ''; event.reportCount = 0; }
  await event.save();
  const creator = await User.findById(event.createdBy);
  if (creator) { await sendEventReportNotice(creator.email, event.title, 0, event.isDisabled ? 'disabled' : 'enabled'); }
  res.json({ message: event.isDisabled ? 'Event disabled' : 'Event enabled', event });
});

// ==================== REGISTRATION ====================

const registerForEvent = asyncHandler(async (req, res) => {
  const { 
    name, email, phone, 
    ticketTypeIndex = 0, 
    quantity = 1,
    additionalAttendees = [],
    sendIndividualTickets = false,
  } = req.body;

  if (!name || !email) {
    res.status(400);
    throw new Error('Name and email are required');
  }

  const event = await Event.findById(req.params.id);
  if (!event || event.isDisabled) { res.status(404); throw new Error('Event not found'); }
  if (event.status === 'passed' || new Date(event.date) < new Date()) { res.status(400); throw new Error('Event has already passed'); }
  if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) { res.status(400); throw new Error('Registration deadline has passed'); }

  let selectedTicketType = null;
  let ticketPrice = event.price || 0;
  let seatsPerTicket = 1;

  if (event.ticketTypes && event.ticketTypes.length > 0) {
    selectedTicketType = event.ticketTypes[ticketTypeIndex];
    if (!selectedTicketType) { res.status(400); throw new Error('Invalid ticket type'); }
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
  if (existingRegistration) { res.status(400); throw new Error('You are already registered for this event'); }

  const totalAmount = ticketPrice * quantity;

  // FREE EVENT
  if (!event.isPaid || totalAmount === 0) {
    const baseSeatNumber = await generateSeatNumber(event._id);
    
    const registration = await EventRegistration.create({
      event: event._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      isPaidEvent: false,
      price: ticketPrice,
      totalAmount: 0,
      quantity,
      ticketType: selectedTicketType?.name || 'General',
      ticketTypeIndex,
      seatsPerTicket,
      totalSeats,
      status: 'confirmed',
      seatNumber: baseSeatNumber,
      additionalAttendees: additionalAttendees.map(att => ({
        ...att,
        email: att.email?.toLowerCase().trim(),
        seatNumber: `${baseSeatNumber}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
      })),
      sendIndividualTickets,
    });

    event.currentAttendees = confirmedCount + totalSeats;
    if (selectedTicketType) {
      event.ticketTypes[ticketTypeIndex].soldCount += quantity;
    }
    await event.save();

    // Send confirmation email(s)
    await sendRegistrationConfirmation(email, name, event.title, event.date, event.time, event.venue || event.location, registration, event);

    // Send individual tickets – CHANGED: added `event` as last argument
    if (sendIndividualTickets && registration.additionalAttendees?.length > 0) {
      for (const att of registration.additionalAttendees) {
        if (att.email) {
          await sendTicketToAttendee(att.email, att.name, event.title, event.date, event.time, event.venue || event.location, att.ticketId, att.seatNumber, event);
        }
      }
    }

    const creator = await User.findById(event.createdBy);
    if (creator) {
      await sendNewRegistrationToCreator(creator.email, event.title, name, email, 'free', registration.ticketId, registration.seatNumber, quantity);
    }

    return res.status(201).json({ message: 'Registration successful! Check your email for your ticket(s).', registration });
  }

  // PAID EVENT
  const registration = await EventRegistration.create({
    event: event._id,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone || '',
    isPaidEvent: true,
    price: ticketPrice,
    totalAmount,
    quantity,
    ticketType: selectedTicketType?.name || 'General',
    ticketTypeIndex,
    seatsPerTicket,
    totalSeats,
    status: 'pending',
    additionalAttendees: additionalAttendees.map(att => ({
      ...att,
      email: att.email?.toLowerCase().trim(),
    })),
    sendIndividualTickets,
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
      callback_url: `${process.env.FRONTEND_URL}/events/${event._id}`,
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
      message: 'Please complete payment to confirm your registration.',
      registration,
      paymentUrl: paymentResponse.data.data.authorization_url,
    });
  } catch (error) {
    registration.status = 'failed';
    await registration.save();
    res.status(500);
    throw new Error('Payment initialization failed. Please try again.');
  }
});

// ==================== VERIFY PAYMENT ====================

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
      if (!registration) { res.status(404); throw new Error('Registration not found'); }
      if (registration.status === 'confirmed') { return res.json({ message: 'Payment already confirmed', registration }); }

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
      await registration.save();

      const event = await Event.findById(registration.event);
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
            event: event._id, registration: registration._id, creator: event.createdBy,
            totalAmount, companyShare: totalAmount, creatorShare: 0,
            status: 'completed', paystackReference: paystackRef || reference,
          });
        } else {
          const companyShare = (totalAmount * COMPANY_SHARE_PERCENTAGE) / 100;
          const creatorShare = (totalAmount * CREATOR_SHARE_PERCENTAGE) / 100;
          await Transaction.create({
            event: event._id, registration: registration._id, creator: event.createdBy,
            totalAmount, companyShare, creatorShare,
            status: 'completed', paystackReference: paystackRef || reference,
          });
        }

        // Send confirmation email(s)
        await sendPaymentConfirmation(registration.email, registration.name, event.title, totalAmount, registration, event);

        // Send individual tickets – CHANGED: added `event` as last argument
        if (registration.sendIndividualTickets && registration.additionalAttendees?.length > 0) {
          for (const att of registration.additionalAttendees) {
            if (att.email) {
              await sendTicketToAttendee(att.email, att.name, event.title, event.date, event.time, event.venue || event.location, att.ticketId, att.seatNumber, event);
            }
          }
        }

        const creator = await User.findById(event.createdBy);
        if (creator) {
          await sendPaymentToCreator(creator.email, event.title, registration.name, totalAmount, isAdminEvent ? 0 : CREATOR_SHARE_PERCENTAGE);
        }
      }

      return res.json({ message: 'Payment verified! Check your email for your ticket(s).', registration });
    } else {
      const reg = await EventRegistration.findOne({ paymentReference: reference });
      if (reg && reg.status === 'pending') { reg.status = 'failed'; await reg.save(); }
      res.status(400); throw new Error('Payment verification failed');
    }
  } catch (error) {
    if (error.response) { res.status(400); throw new Error(error.response.data.message || 'Payment verification failed'); }
    throw error;
  }
});

// ==================== CHECK-IN & VERIFY TICKET ====================

const checkInAttendee = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  let registration = await EventRegistration.findOne({ ticketId }).populate('event', 'title date createdBy');
  if (!registration) {
    registration = await EventRegistration.findOne({ 'additionalAttendees.ticketId': ticketId }).populate('event', 'title date createdBy');
    if (registration) {
      const attIndex = registration.additionalAttendees.findIndex(a => a.ticketId === ticketId);
      if (attIndex !== -1 && !registration.additionalAttendees[attIndex].checkedIn) {
        registration.additionalAttendees[attIndex].checkedIn = true;
        registration.additionalAttendees[attIndex].checkedInAt = Date.now();
        registration.markModified('additionalAttendees');
        await registration.save();
        return res.json({ message: 'Check-in successful', attendee: registration.additionalAttendees[attIndex] });
      }
      res.status(400); throw new Error('Already checked in');
    }
  }

  if (!registration) { res.status(404); throw new Error('Invalid ticket ID'); }
  if (registration.status !== 'confirmed') { res.status(400); throw new Error('Registration is not confirmed'); }
  if (registration.ticketCheckedIn) { res.status(400); throw new Error('Attendee already checked in'); }

  const event = registration.event;
  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) { res.status(403); throw new Error('Not authorized'); }

  registration.ticketCheckedIn = true;
  registration.checkedInAt = Date.now();
  await registration.save();

  res.json({ message: 'Check-in successful', attendee: { name: registration.name, email: registration.email, ticketId: registration.ticketId, seatNumber: registration.seatNumber, checkedInAt: registration.checkedInAt } });
});

const verifyTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  let registration = await EventRegistration.findOne({ ticketId }).populate('event', 'title date time venue location');
  if (!registration) {
    registration = await EventRegistration.findOne({ 'additionalAttendees.ticketId': ticketId }).populate('event', 'title date time venue location');
    if (registration) {
      const att = registration.additionalAttendees.find(a => a.ticketId === ticketId);
      return res.json({
        valid: registration.status === 'confirmed' && !att?.checkedIn,
        attendee: { name: att?.name, ticketId: att?.ticketId, seatNumber: att?.seatNumber, checkedIn: att?.checkedIn || false },
        event: { title: registration.event.title, date: registration.event.date, time: registration.event.time },
      });
    }
  }

  if (!registration) { res.status(404); throw new Error('Invalid ticket'); }

  res.json({
    valid: registration.status === 'confirmed' && !registration.ticketCheckedIn,
    attendee: { name: registration.name, ticketId: registration.ticketId, seatNumber: registration.seatNumber, checkedIn: registration.ticketCheckedIn },
    event: { title: registration.event.title, date: registration.event.date, time: registration.event.time },
  });
});

// ==================== WALLET ====================

const setupPaystackWallet = asyncHandler(async (req, res) => {
  const { accountNumber, bankCode, businessName } = req.body;
  if (!accountNumber || !bankCode) { res.status(400); throw new Error('Account number and bank code are required'); }

  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  try {
    const subaccountResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/subaccount`,
      { business_name: businessName || user.name || 'Event Creator', settlement_bank: bankCode, account_number: accountNumber, percentage_charge: COMPANY_SHARE_PERCENTAGE, description: `Event creator: ${user.email}` },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }
    );

    user.paystackSubaccountCode = subaccountResponse.data.data.subaccount_code;
    user.paystackAccountDetails = { accountNumber, bankCode, businessName: businessName || user.name };
    user.hasPaymentWallet = true;
    await user.save();
    await sendWalletSetupConfirmation(user.email, user.name);

    res.json({ message: 'Payment wallet set up successfully!', subaccountCode: user.paystackSubaccountCode });
  } catch (error) {
    console.error('Wallet setup error:', error.response?.data || error.message);
    res.status(500);
    throw new Error(error.response?.data?.message || 'Failed to set up payment wallet');
  }
});

const getWalletInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || !user.hasPaymentWallet) { return res.json({ hasWallet: false, message: 'Payment wallet not set up' }); }

  const transactions = await Transaction.find({ creator: user._id }).populate('event', 'title date').sort({ createdAt: -1 });
  const totalEarnings = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.creatorShare, 0);
  const totalWithdrawn = transactions.filter(t => t.withdrawn).reduce((sum, t) => sum + t.creatorShare, 0);

  res.json({ hasWallet: true, walletDetails: { accountDetails: user.paystackAccountDetails }, totalEarnings, totalWithdrawn, availableBalance: totalEarnings - totalWithdrawn, transactions });
});

const withdrawEarnings = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || Number(amount) <= 0) { res.status(400); throw new Error('Valid withdrawal amount is required'); }

  const user = await User.findById(req.user._id);
  if (!user || !user.hasPaymentWallet) { res.status(400); throw new Error('Payment wallet not set up'); }

  const transactions = await Transaction.find({ creator: user._id, status: 'completed' });
  let remaining = Number(amount);
  for (const t of transactions) {
    if (remaining <= 0) break;
    if (!t.withdrawn) { t.withdrawn = true; t.withdrawnAt = Date.now(); await t.save(); remaining -= t.creatorShare; }
  }

  await sendWithdrawalConfirmation(user.email, user.name, Number(amount));
  res.json({ message: `₦${Number(amount).toLocaleString()} withdrawal recorded`, withdrawn: Number(amount) });
});

// ==================== BANKS ====================

const getBankList = asyncHandler(async (req, res) => {
  try {
    if (!PAYSTACK_SECRET_KEY) return res.json(getFallbackBanks());
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank`, { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }, params: { country: 'nigeria', perPage: 100 } });
    if (response.data?.data) { const banks = response.data.data.filter(bank => bank.type === 'nuban' || !bank.type); return res.json(banks); }
    return res.json(getFallbackBanks());
  } catch (error) { console.error('Failed to fetch bank list:', error.response?.data || error.message); res.json(getFallbackBanks()); }
});

const getFallbackBanks = () => [
  { name: 'Access Bank', code: '044', type: 'nuban' }, { name: 'Ecobank Nigeria', code: '050', type: 'nuban' }, { name: 'Fidelity Bank', code: '070', type: 'nuban' }, { name: 'First Bank of Nigeria', code: '011', type: 'nuban' }, { name: 'First City Monument Bank (FCMB)', code: '214', type: 'nuban' }, { name: 'Guaranty Trust Bank (GTB)', code: '058', type: 'nuban' }, { name: 'Keystone Bank', code: '082', type: 'nuban' }, { name: 'Kuda Bank', code: '000013', type: 'nuban' }, { name: 'Moniepoint MFB', code: '000026', type: 'nuban' }, { name: 'Opay', code: '000008', type: 'nuban' }, { name: 'Palmpay', code: '000010', type: 'nuban' }, { name: 'Polaris Bank', code: '076', type: 'nuban' }, { name: 'Providus Bank', code: '101', type: 'nuban' }, { name: 'Stanbic IBTC Bank', code: '007', type: 'nuban' }, { name: 'Standard Chartered Bank', code: '068', type: 'nuban' }, { name: 'Sterling Bank', code: '232', type: 'nuban' }, { name: 'Union Bank of Nigeria', code: '032', type: 'nuban' }, { name: 'United Bank for Africa (UBA)', code: '033', type: 'nuban' }, { name: 'Unity Bank', code: '215', type: 'nuban' }, { name: 'Wema Bank', code: '035', type: 'nuban' }, { name: 'Zenith Bank', code: '057', type: 'nuban' },
];

// ==================== REGISTRATIONS ====================

const getEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }

  const isOwner = event.createdBy?.toString() === req.user?._id?.toString();
  const isAdmin = req.user?.role === 'admin';
  if (!isOwner && !isAdmin) { res.status(403); throw new Error('Not authorized to view registrations'); }

  const { status, page = 1, limit = 50 } = req.query;
  let query = { event: event._id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const registrations = await EventRegistration.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  const total = await EventRegistration.countDocuments(query);

  res.json({
    event: event.title, totalRegistrations: total,
    confirmedCount: await EventRegistration.countDocuments({ event: event._id, status: 'confirmed' }),
    pendingCount: await EventRegistration.countDocuments({ event: event._id, status: 'pending' }),
    registrations, page: Number(page), pages: Math.ceil(total / Number(limit)),
  });
});

const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await EventRegistration.find({ email: req.user.email.toLowerCase() }).populate('event', 'title date time location status').sort({ createdAt: -1 });
  res.json(registrations);
});

// ==================== ADMIN DASHBOARD ====================

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
  res.json({ categories: await Event.distinct('category'), eventTypes: await Event.distinct('eventType') });
});

// ==================== PAYSTACK WEBHOOK ====================

const handlePaystackWebhook = asyncHandler(async (req, res) => {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) { res.status(400); throw new Error('Invalid webhook signature'); }

  const { event, data } = req.body;
  console.log(`Webhook received: ${event}`);

  switch (event) {
    case 'charge.success': console.log('Charge success:', data.reference); break;
    case 'transfer.success': await handleTransferSuccess(data); break;
    case 'transfer.failed': console.log('Transfer failed:', data.reference); break;
    case 'subaccount.created': console.log('Subaccount created:', data.subaccount_code); break;
    case 'settlement.success': await handleSettlementSuccess(data); break;
    default: console.log(`Unhandled webhook event: ${event}`);
  }

  res.status(200).json({ status: 'ok' });
});

const handleTransferSuccess = async (data) => {
  try {
    const transaction = await Transaction.findOne({ paystackReference: data.reference });
    if (transaction && !transaction.withdrawn) {
      transaction.withdrawn = true; transaction.withdrawnAt = Date.now(); transaction.transferStatus = 'success'; await transaction.save();
      const creator = await User.findById(transaction.creator);
      if (creator) { await sendWithdrawalConfirmation(creator.email, creator.name, data.amount / 100); }
    }
  } catch (error) { console.error('Error handling transfer success:', error); }
};

const handleSettlementSuccess = async (data) => {
  try {
    if (data.status !== 'success') return;
    const user = await User.findOne({ paystackSubaccountCode: data.subaccount?.subaccount_code || data.subaccount });
    if (!user) return;

    const pendingTransactions = await Transaction.find({ creator: user._id, status: 'completed', withdrawn: false });
    let totalMarked = 0;
    for (const t of pendingTransactions) { t.withdrawn = true; t.withdrawnAt = Date.now(); t.settlementStatus = 'success'; await t.save(); totalMarked += t.creatorShare; }

    if (totalMarked > 0) {
      await sendSettlementNotification(user.email, user.name, totalMarked, pendingTransactions.length);
    }
  } catch (error) { console.error('Error handling settlement success:', error); }
};

// ==================== EXPORT ====================

export {
  createEvent, getEvents, getMyEvents, getEventById, updateEvent, deleteEvent,
  reportEvent, toggleEventStatus, registerForEvent, verifyEventPayment,
  checkInAttendee, verifyTicket, setupPaystackWallet, getWalletInfo,
  withdrawEarnings, getBankList, getEventRegistrations, getMyRegistrations,
  getAdminDashboard, getEventFilters, handlePaystackWebhook,
};