// controllers/eventTeamController.js
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Event from '../models/eventModel.js';
import EventRegistration from '../models/eventRegistrationModel.js';
import User from '../models/userModel.js';

// Helper: find event by slug or id
const findEvent = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await Event.findById(identifier);
    if (byId) return byId;
  }
  return await Event.findOne({ slug: identifier.toLowerCase() });
};

// Helper: check if user is a team member with at least the required role level
const checkTeamMemberPermission = (event, userId, requiredRole) => {
  const roles = ['viewer', 'checker', 'manager'];
  const requiredLevel = roles.indexOf(requiredRole);
  if (requiredLevel === -1) return false;

  const member = event.teamMembers?.find(
    (tm) => tm.userId.toString() === userId.toString()
  );
  if (!member) return false;

  const memberLevel = roles.indexOf(member.role);
  return memberLevel >= requiredLevel;
};

// ---------- TEAM MANAGEMENT ----------

// @desc    Add a team member to an event
// @route   POST /api/events/:id/team
// @access  Private (creator or admin)
const addTeamMember = asyncHandler(async (req, res) => {
  const { email, role = 'viewer' } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const event = await findEvent(req.params.id);
  if (!event || event.isDisabled) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Only creator or admin can add team members
  const isCreator = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isCreator && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to manage team members');
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    res.status(404);
    throw new Error('User not found with that email');
  }

  // Prevent adding self if not admin (already creator has full access)
  if (user._id.toString() === event.createdBy.toString()) {
    res.status(400);
    throw new Error('Event creator already has full access');
  }

  // Check if already a team member
  if (event.teamMembers?.some((tm) => tm.userId.toString() === user._id.toString())) {
    res.status(400);
    throw new Error('User is already a team member');
  }

  // Validate role
  const validRoles = ['viewer', 'checker', 'manager'];
  if (!validRoles.includes(role)) {
    res.status(400);
    throw new Error('Invalid role. Allowed: viewer, checker, manager');
  }

  // Add team member
  if (!event.teamMembers) event.teamMembers = [];
  event.teamMembers.push({
    userId: user._id,
    role,
    addedBy: req.user._id,
    addedAt: new Date(),
  });
  await event.save();

  res.status(201).json({
    message: `Team member added with role: ${role}`,
    teamMember: {
      userId: user._id,
      name: user.name,
      email: user.email,
      role,
      addedAt: new Date(),
    },
  });
});

// @desc    Remove a team member from an event
// @route   DELETE /api/events/:id/team/:userId
// @access  Private (creator or admin)
const removeTeamMember = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;

  const event = await findEvent(id);
  if (!event || event.isDisabled) {
    res.status(404);
    throw new Error('Event not found');
  }

  const isCreator = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isCreator && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to manage team members');
  }

  if (!event.teamMembers) {
    res.status(404);
    throw new Error('No team members found');
  }

  const memberIndex = event.teamMembers.findIndex(
    (tm) => tm.userId.toString() === userId
  );
  if (memberIndex === -1) {
    res.status(404);
    throw new Error('Team member not found');
  }

  // Prevent removing self if creator (they have full access anyway)
  if (userId === event.createdBy.toString()) {
    res.status(400);
    throw new Error('Cannot remove the event creator');
  }

  event.teamMembers.splice(memberIndex, 1);
  await event.save();

  res.json({ message: 'Team member removed successfully' });
});

// @desc    Get all team members of an event
// @route   GET /api/events/:id/team
// @access  Private (creator, admin, or team member with at least viewer role)
const getEventTeam = asyncHandler(async (req, res) => {
  const event = await findEvent(req.params.id);
  if (!event || event.isDisabled) {
    res.status(404);
    throw new Error('Event not found');
  }

  const userId = req.user._id;
  const isCreator = event.createdBy.toString() === userId.toString();
  const isAdmin = req.user.role === 'admin';
  const isTeamMember = event.teamMembers?.some(
    (tm) => tm.userId.toString() === userId.toString()
  );

  if (!isCreator && !isAdmin && !isTeamMember) {
    res.status(403);
    throw new Error('Not authorized to view team members');
  }

  // Populate user details for response
  const populatedMembers = await Promise.all(
    (event.teamMembers || []).map(async (tm) => {
      const user = await User.findById(tm.userId).select('name email profile');
      return {
        userId: tm.userId,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        role: tm.role,
        addedBy: tm.addedBy,
        addedAt: tm.addedAt,
      };
    })
  );

  res.json({
    event: event.title,
    creator: event.createdBy,
    teamMembers: populatedMembers,
  });
});

// ---------- TEAM MEMBER ACCESS ----------

// @desc    Get events where the current user is a team member (or creator)
// @route   GET /api/events/team/my-events
// @access  Private
// controllers/eventTeamController.js

const getMyTeamEvents = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Query events
  const events = await Event.find({
    isDisabled: { $ne: true },
    $or: [
      { createdBy: userId },
      { 'teamMembers.userId': userId },
    ],
  })
    .select('title slug date time location status isDisabled teamMembers createdBy')
    .sort({ date: 1 })
    .lean();

  // 2. Map safely
  const enriched = events.map((event) => {
    let role = null;

    // Check if user is the creator
    if (event.createdBy && event.createdBy.equals(userId)) {
      role = 'creator';
    } else if (Array.isArray(event.teamMembers) && event.teamMembers.length > 0) {
      // Find team member entry
      const member = event.teamMembers.find(
        (tm) => tm.userId && tm.userId.equals(userId)
      );
      if (member) role = member.role;
    }

    // Remove teamMembers from response (optional)
    delete event.teamMembers;
    return { ...event, role };
  });

  res.json(enriched);
});

// @desc    Get registrations for an event (team members with view/checker/manager)
// @route   GET /api/events/:id/registrations/team
// @access  Private (creator, admin, or team member with role >= viewer)
const getEventRegistrationsTeam = asyncHandler(async (req, res) => {
  const event = await findEvent(req.params.id);
  if (!event || event.isDisabled) {
    res.status(404);
    throw new Error('Event not found');
  }

  const userId = req.user._id;
  const isCreator = event.createdBy.toString() === userId.toString();
  const isAdmin = req.user.role === 'admin';
  const hasAccess = isCreator || isAdmin || checkTeamMemberPermission(event, userId, 'viewer');

  if (!hasAccess) {
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

// @desc    Verify (check-in) a ticket – team members with checker or manager role
// @route   POST /api/events/:id/team/checkin/:ticketId
// @access  Private (creator, admin, or team member with role >= checker)
const verifyTicketTeam = asyncHandler(async (req, res) => {
  const { id, ticketId } = req.params;

  const event = await findEvent(id);
  if (!event || event.isDisabled) {
    res.status(404);
    throw new Error('Event not found');
  }

  const userId = req.user._id;
  const isCreator = event.createdBy.toString() === userId.toString();
  const isAdmin = req.user.role === 'admin';
  const hasAccess = isCreator || isAdmin || checkTeamMemberPermission(event, userId, 'checker');

  if (!hasAccess) {
    res.status(403);
    throw new Error('Not authorized to check in attendees');
  }

  // Find registration by ticketId (main or additional)
  let registration = await EventRegistration.findOne({ ticketId }).populate('event', 'title date createdBy');
  if (!registration) {
    registration = await EventRegistration.findOne({ 'additionalAttendees.ticketId': ticketId })
      .populate('event', 'title date createdBy');
    if (registration) {
      const attIndex = registration.additionalAttendees.findIndex(a => a.ticketId === ticketId);
      if (attIndex !== -1) {
        if (registration.additionalAttendees[attIndex].checkedIn) {
          res.status(400);
          throw new Error('Attendee already checked in');
        }
        registration.additionalAttendees[attIndex].checkedIn = true;
        registration.additionalAttendees[attIndex].checkedInAt = Date.now();
        registration.markModified('additionalAttendees');
        await registration.save();
        return res.json({
          message: 'Check-in successful',
          attendee: registration.additionalAttendees[attIndex],
        });
      }
    }
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Ensure this registration belongs to the event
  if (registration.event._id.toString() !== event._id.toString()) {
    res.status(400);
    throw new Error('Ticket does not belong to this event');
  }

  if (registration.status !== 'confirmed') {
    res.status(400);
    throw new Error('Registration is not confirmed');
  }

  if (registration.ticketCheckedIn) {
    res.status(400);
    throw new Error('Attendee already checked in');
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

// @desc    Verify ticket validity (without checking in) – team members with viewer or higher
// @route   GET /api/events/:id/team/verify/:ticketId
// @access  Private (creator, admin, or team member with role >= viewer)
const verifyTicketValidityTeam = asyncHandler(async (req, res) => {
  const { id, ticketId } = req.params;

  const event = await findEvent(id);
  if (!event || event.isDisabled) {
    res.status(404);
    throw new Error('Event not found');
  }

  const userId = req.user._id;
  const isCreator = event.createdBy.toString() === userId.toString();
  const isAdmin = req.user.role === 'admin';
  const hasAccess = isCreator || isAdmin || checkTeamMemberPermission(event, userId, 'viewer');

  if (!hasAccess) {
    res.status(403);
    throw new Error('Not authorized to verify tickets');
  }

  let registration = await EventRegistration.findOne({ ticketId }).populate('event', 'title date time venue location');
  if (!registration) {
    registration = await EventRegistration.findOne({ 'additionalAttendees.ticketId': ticketId })
      .populate('event', 'title date time venue location');
    if (registration) {
      const att = registration.additionalAttendees.find(a => a.ticketId === ticketId);
      // Ensure this registration belongs to the requested event
      if (registration.event._id.toString() !== event._id.toString()) {
        res.status(400);
        throw new Error('Ticket does not belong to this event');
      }
      return res.json({
        valid: registration.status === 'confirmed' && !att?.checkedIn,
        attendee: {
          name: att?.name,
          ticketId: att?.ticketId,
          seatNumber: att?.seatNumber,
          checkedIn: att?.checkedIn || false,
        },
        event: {
          title: registration.event.title,
          date: registration.event.date,
          time: registration.event.time,
        },
      });
    }
    res.status(404);
    throw new Error('Ticket not found');
  }

  if (registration.event._id.toString() !== event._id.toString()) {
    res.status(400);
    throw new Error('Ticket does not belong to this event');
  }

  res.json({
    valid: registration.status === 'confirmed' && !registration.ticketCheckedIn,
    attendee: {
      name: registration.name,
      ticketId: registration.ticketId,
      seatNumber: registration.seatNumber,
      checkedIn: registration.ticketCheckedIn,
    },
    event: {
      title: registration.event.title,
      date: registration.event.date,
      time: registration.event.time,
    },
  });
});

export {
  addTeamMember,
  removeTeamMember,
  getEventTeam,
  getMyTeamEvents,
  getEventRegistrationsTeam,
  verifyTicketTeam,
  verifyTicketValidityTeam,
};