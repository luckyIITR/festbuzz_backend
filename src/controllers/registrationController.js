const FestRegistration = require('../models/FestRegistration');
const EventRegistration = require('../models/EventRegistration');
const User = require('../models/User');
const Event = require('../models/Event');
const Fest = require('../models/Fest');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { successResponse } = require('../utils/response');

// Helper to generate QR code data URL
const generateQRCode = async (text) => {
  return await QRCode.toDataURL(text);
};

// @desc    Register for a festival
// @route   POST /api/registration/fest
// @access  Private
const registerForFest = async (req, res, next) => {
  try {
    const { 
      festId, 
      answers, 
      phone, 
      dateOfBirth, 
      gender, 
      city, 
      state, 
      instituteName 
    } = req.body;
    
    // Validate required fields
    if (!festId || !phone || !dateOfBirth || !gender || !city || !state || !instituteName) {
      return next(new AppError('Missing required fields: festId, phone, dateOfBirth, gender, city, state, instituteName', 400));
    }
    
    // Validate gender enum
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return next(new AppError('Gender must be one of: Male, Female, Other', 400));
    }
    
    // Check if fest exists
    const fest = await Fest.findById(festId);
    if (!fest) {
      return next(new AppError('Festival not found', 404));
    }
    
    // Prevent duplicate registration
    const existing = await FestRegistration.findOne({ userId: req.user.id, festId });
    if (existing) {
      return next(new AppError('Already registered for this festival', 400));
    }
    
    // Update user profile with personal information
    await User.findByIdAndUpdate(req.user.id, {
      phone,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      city,
      state,
      instituteName
    });
    
    const ticketCode = `FEST-${new mongoose.Types.ObjectId()}`;
    const qrCode = await generateQRCode(ticketCode);
    
    const festReg = new FestRegistration({
      userId: req.user.id,
      festId,
      answers,
      status: 'confirmed',
      ticket: ticketCode,
      qrCode,
    });
    
    await festReg.save();
    
    logger.info(`User ${req.user.id} registered for fest ${festId}`);
    
    return successResponse(res, 201, 'Festival registration successful', {
        registration: {
          id: festReg._id,
          status: festReg.status,
          ticket: festReg.ticket,
          qrCode: festReg.qrCode,
          answers: festReg.answers,
          registeredAt: festReg.createdAt
        }
    });
  } catch (error) {
    logger.error('Fest registration error:', error);
    next(error);
  }
};

// @desc    Register for an event
// @route   POST /api/registration/event
// @access  Private
const registerForEvent = async (req, res, next) => {
  try {
    const { 
      eventId, 
      answers, 
      phone, 
      dateOfBirth, 
      gender, 
      city, 
      state, 
      instituteName,
      paymentMethod = 'card'
    } = req.body;
    
    // Validate required fields
    if (!eventId || !phone || !dateOfBirth || !gender || !city || !state || !instituteName) {
      return next(new AppError('Missing required fields: eventId, phone, dateOfBirth, gender, city, state, instituteName', 400));
    }
    
    // Validate gender enum
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return next(new AppError('Gender must be one of: Male, Female, Other', 400));
    }
    
    // Check if event exists and is published
    const event = await Event.findById(eventId);
    if (!event) {
      return next(new AppError('Event not found', 404));
    }
    
    if (event.status !== 'published') {
      return next(new AppError('Event is not available for registration', 400));
    }
    
    // Check capacity
    const registeredCount = await EventRegistration.countDocuments({ eventId, status: 'confirmed' });
    if (registeredCount >= event.capacity) {
      return next(new AppError('Event is full', 400));
    }
    
    // Prevent duplicate registration
    const existing = await EventRegistration.findOne({ userId: req.user.id, eventId });
    if (existing) {
      return next(new AppError('Already registered for this event', 400));
    }
    
    // Update user profile with personal information
    await User.findByIdAndUpdate(req.user.id, {
      phone,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      city,
      state,
      instituteName
    });
    
    const ticketCode = `EVENT-${new mongoose.Types.ObjectId()}`;
    const qrCode = await generateQRCode(ticketCode);
    
    const eventReg = new EventRegistration({
      userId: req.user.id,
      eventId,
      answers,
      status: 'confirmed',
      ticket: ticketCode,
      qrCode,
      paymentMethod
    });
    
    await eventReg.save();
    
    logger.info(`User ${req.user.id} registered for event ${eventId}`);
    
    return successResponse(res, 201, 'Event registration successful', {
        registration: {
          id: eventReg._id,
          status: eventReg.status,
          ticket: eventReg.ticket,
          qrCode: eventReg.qrCode,
          answers: eventReg.answers,
          paymentMethod: eventReg.paymentMethod,
          registeredAt: eventReg.createdAt
        }
    });
  } catch (error) {
    logger.error('Event registration error:', error);
    next(error);
  }
};

// @desc    Get user's registrations
// @route   GET /api/registration/my-registrations
// @access  Private
const getMyRegistrations = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    
    let festRegistrations = [];
    let eventRegistrations = [];
    
    if (!type || type === 'fest') {
      festRegistrations = await FestRegistration.find({ userId: req.user.id })
        .populate('festId')
        .sort({ createdAt: -1 });
    }
    
    if (!type || type === 'event') {
      eventRegistrations = await EventRegistration.find({ userId: req.user.id })
        .populate('eventId')
        .populate('festId')
        .sort({ createdAt: -1 });
    }
    
    return successResponse(res, 200, 'My registrations retrieved successfully', {
        festRegistrations,
        eventRegistrations
    });
  } catch (error) {
    logger.error('Get my registrations error:', error);
    next(error);
  }
};

// @desc    Get registration by ID
// @route   GET /api/registration/:id
// @access  Private
const getRegistrationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Try to find in both fest and event registrations
    let registration = await FestRegistration.findById(id)
      .populate('festId', 'name description startDate endDate venue')
      .populate('userId', 'name email');
    
    if (!registration) {
      registration = await EventRegistration.findById(id)
        .populate('eventId', 'name description startTime endTime venue')
        .populate('festId', 'name')
        .populate('userId', 'name email');
    }
    
    if (!registration) {
      return next(new AppError('Registration not found', 404));
    }
    
    // Check if user owns this registration or is admin
    if (registration.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to view this registration', 403));
    }
    
    return successResponse(res, 200, 'Registration retrieved successfully', registration);
  } catch (error) {
    logger.error('Get registration by ID error:', error);
    next(error);
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registration/:id
// @access  Private
const cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Try to find in both fest and event registrations
    let registration = await FestRegistration.findById(id);
    
    if (!registration) {
      registration = await EventRegistration.findById(id);
    }
    
    if (!registration) {
      return next(new AppError('Registration not found', 404));
    }
    
    // Check if user owns this registration or is admin
    if (registration.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to cancel this registration', 403));
    }
    
    // Check if registration can be cancelled (e.g., not too close to event)
    const now = new Date();
    const eventDate = registration.eventId ? 
      (await Event.findById(registration.eventId)).startTime :
      (await Fest.findById(registration.festId)).startDate;
    
    const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent <= 1) {
      return next(new AppError('Cannot cancel registration within 24 hours of the event', 400));
    }
    
    // Delete the registration
    if (registration.eventId) {
      await EventRegistration.findByIdAndDelete(id);
    } else {
      await FestRegistration.findByIdAndDelete(id);
    }
    
    logger.info(`Registration ${id} cancelled by user ${req.user.id}`);
    
    return successResponse(res, 200, 'Registration cancelled successfully');
  } catch (error) {
    logger.error('Cancel registration error:', error);
    next(error);
  }
};

// @desc    Get participants for an event (admin/organizer only)
// @route   GET /api/registration/event/:eventId/participants
// @access  Private (Admin, Organizer)
const getEventParticipants = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    let filter = { eventId };
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const participants = await EventRegistration.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await EventRegistration.countDocuments(filter);
    
    return successResponse(res, 200, 'Event participants retrieved successfully', participants, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get event participants error:', error);
    next(error);
  }
};

// @desc    Get participants for a festival (admin/organizer only)
// @route   GET /api/registration/fest/:festId/participants
// @access  Private (Admin, Organizer)
const getFestParticipants = async (req, res, next) => {
  try {
    const { festId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    let filter = { festId };
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const participants = await FestRegistration.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await FestRegistration.countDocuments(filter);
    
    return successResponse(res, 200, 'Fest participants retrieved successfully', participants, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get fest participants error:', error);
    next(error);
  }
};

// @desc    Get registration status for a user for a specific fest
// @route   GET /api/registration/fest/:festId/status
// @access  Private
const getFestRegistrationStatus = async (req, res, next) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;
    
    // Validate festId
    if (!festId || !mongoose.Types.ObjectId.isValid(festId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid fest ID' 
      });
    }
    
    const registration = await FestRegistration.findOne({ 
      userId, 
      festId 
    }).populate('festId', 'name startDate endDate location');
    
    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: 'Not registered for this fest',
        data: { isRegistered: false }
      });
    }
    
    // Get user's personal information
    const user = await User.findById(userId);
    
    return successResponse(res, 200, 'Registration found', {
        isRegistered: true,
        registration: {
          id: registration._id,
          status: registration.status,
          ticket: registration.ticket,
          answers: registration.answers,
          fest: registration.festId,
          createdAt: registration.createdAt,
          updatedAt: registration.updatedAt
        }
    });
  } catch (err) {
    console.error('Fest registration status error:', err);
    next(err);
  }
};

// @desc    Unregister from a festival
// @route   DELETE /api/registration/fest/:festId/unregister
// @access  Private
const unregisterForFest = async (req, res, next) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;
    
    // Validate festId
    if (!festId || !mongoose.Types.ObjectId.isValid(festId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid fest ID' 
      });
    }

    // Check if fest exists
    const fest = await Fest.findById(festId);
    if (!fest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Fest not found' 
      });
    }

    // Check if user is registered for this fest
    const festRegistration = await FestRegistration.findOne({ 
      userId, 
      festId 
    });
    
    if (!festRegistration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Not registered for this fest' 
      });
    }

    // Get all events in this fest
    const events = await Event.find({ festId });
    const eventIds = events.map(event => event._id);

    // Start a transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Delete fest registration
      await FestRegistration.findByIdAndDelete(festRegistration._id, { session });

      // 2. Delete all event registrations for this user in this fest
      const eventRegistrations = await EventRegistration.find({
        userId,
        eventId: { $in: eventIds }
      });

      // Delete event registrations
      if (eventRegistrations.length > 0) {
        await EventRegistration.deleteMany({
          userId,
          eventId: { $in: eventIds }
        }, { session });
      }

      // // 3. Remove user from teams in this fest's events
      // const teamsToUpdate = await Team.find({
      //   event_id: { $in: eventIds },
      //   members: userId
      // });

      // for (const team of teamsToUpdate) {
      //   team.members = team.members.filter(memberId => memberId.toString() !== userId);
        
      //   // If team becomes empty, delete it
      //   if (team.members.length === 0) {
      //     await Team.findByIdAndDelete(team._id, { session });
      //   } else {
      //     await team.save({ session });
      //   }
      // }

      await session.commitTransaction();

      return successResponse(res, 200, 'Successfully unregistered from fest and all events', {
          festId,
          festName: fest.name,
          deletedFestRegistration: true,
          deletedEventRegistrations: eventRegistrations.length,
          // updatedTeams: teamsToUpdate.length,
          // deletedTeams: teamsToUpdate.filter(team => team.members.length === 0).length
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (err) {
    console.error('Fest unregistration error:', err);
      next(err);
  }
};

// @desc    Get registration count for a fest
// @route   GET /api/registration/fest/:festId/count
// @access  Private
const getFestRegistrationCount = async (req, res, next) => {
  try {
    const { festId } = req.params;
    
    // Validate festId
    if (!festId || !mongoose.Types.ObjectId.isValid(festId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid fest ID' 
      });
    }

    // Check if fest exists
    const Fest = require('../models/Fest');
    const fest = await Fest.findById(festId);
    if (!fest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Fest not found' 
      });
    }

    // Get total registration count
    const totalRegistrations = await FestRegistration.countDocuments({ 
      festId: festId,
      status: { $in: ['pending', 'confirmed'] } // Only count active registrations
    });

    // Get count by status
    const confirmedCount = await FestRegistration.countDocuments({ 
      festId: festId,
      status: 'confirmed'
    });

    const pendingCount = await FestRegistration.countDocuments({ 
      festId: festId,
      status: 'pending'
    });

    const cancelledCount = await FestRegistration.countDocuments({ 
      festId: festId,
      status: 'cancelled'
    });

    return successResponse(res, 200, 'Fest registration count retrieved successfully', {
        festId: festId,
        festName: fest.name,
        totalRegistrations,
        confirmedCount,
        pendingCount,
        cancelledCount,
        breakdown: {
          confirmed: confirmedCount,
          pending: pendingCount,
          cancelled: cancelledCount
        }
    });
  } catch (err) {
    console.error('Fest registration count error:', err);
    next(err);
  }
};

// @desc    Get registration count for an event
// @route   GET /api/registration/event/:eventId/count
// @access  Private
const getEventRegistrationCount = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    // Validate eventId
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid event ID' 
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Get total registration count
    const totalRegistrations = await EventRegistration.countDocuments({ 
      eventId: eventId,
      status: { $in: ['pending', 'confirmed'] } // Only count active registrations
    });

    // Get count by status
    const confirmedCount = await EventRegistration.countDocuments({ 
      eventId: eventId,
      status: 'confirmed'
    });

    const pendingCount = await EventRegistration.countDocuments({ 
      eventId: eventId,
      status: 'pending'
    });

    const cancelledCount = await EventRegistration.countDocuments({ 
      eventId: eventId,
      status: 'cancelled'
    });

    // Get solo vs team registrations
    const soloCount = await EventRegistration.countDocuments({ 
      eventId: eventId,
      type: 'solo',
      status: { $in: ['pending', 'confirmed'] }
    });

    const teamCount = await EventRegistration.countDocuments({ 
      eventId: eventId,
      type: 'team',
      status: { $in: ['pending', 'confirmed'] }
    });

    return successResponse(res, 200, 'Event registration count retrieved successfully', {
        eventId: eventId,
        eventName: event.name,
        festId: event.festId,
        totalRegistrations,
        confirmedCount,
        pendingCount,
        cancelledCount,
        soloCount,
        teamCount,
        breakdown: {
          confirmed: confirmedCount,
          pending: pendingCount,
          cancelled: cancelledCount,
          solo: soloCount,
          team: teamCount
        }
    });
  } catch (err) {
    console.error('Event registration count error:', err);
    next(err);
  }
  };

// @desc    Get candidates for a fest
// @route   GET /api/registration/fest/:festId/candidates
// @access  Private
const getFestCandidates = async (req, res, next) => {
  try {
    const { festId } = req.params;
    const { page = 1, limit = 50, status, search } = req.query;
    
    // Validate festId
    if (!festId || !mongoose.Types.ObjectId.isValid(festId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid fest ID' 
      });
    }

    // Check if fest exists
    const Fest = require('../models/Fest');
    const fest = await Fest.findById(festId);
    if (!fest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Fest not found' 
      });
    }

    // Check if user has permission (admin, superadmin, or festival head)
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      // Check if user is festival head for this specific fest
      const FestivalUserRole = require('../models/FestivalUserRole');
      const festivalRole = await FestivalUserRole.findOne({
        userId: req.user.id,
        festId: festId,
        isActive: true,
        role: { $in: ['admin', 'festival head'] }
      });

      if (!festivalRole) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin privileges required.' 
        });
      }
    }

    // Build query
    const query = { festId };
    
    // Add status filter if provided
    if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    // Get registrations with user details
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let registrations = await FestRegistration.find(query)
      .populate('userId', 'name email phone college instituteName city state gender dateOfBirth')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Apply search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      registrations = registrations.filter(reg => {
        const user = reg.userId;
        return (
          user.name?.match(searchRegex) ||
          user.email?.match(searchRegex) ||
          user.phone?.match(searchRegex) ||
          user.college?.match(searchRegex) ||
          user.instituteName?.match(searchRegex) ||
          user.city?.match(searchRegex)
        );
      });
    }

    // Get total count for pagination
    const totalRegistrations = await FestRegistration.countDocuments(query);
    
    // Format response data
    const candidates = registrations.map(reg => ({
      registrationId: reg._id,
      userId: reg.userId._id,
      name: reg.userId.name,
      email: reg.userId.email,
      phone: reg.userId.phone,
      college: reg.userId.college,
      instituteName: reg.userId.instituteName,
      city: reg.userId.city,
      state: reg.userId.state,
      gender: reg.userId.gender,
      dateOfBirth: reg.userId.dateOfBirth,
      registrationStatus: reg.status,
      ticket: reg.ticket,
      answers: reg.answers,
      registeredAt: reg.createdAt,
      updatedAt: reg.updatedAt
    }));

    return successResponse(res, 200, 'Fest candidates retrieved successfully', {
        festId: festId,
        festName: fest.name,
        candidates,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRegistrations / parseInt(limit)),
          totalItems: totalRegistrations,
          hasNext: parseInt(page) * parseInt(limit) < totalRegistrations,
          hasPrev: parseInt(page) > 1
        },
        filters: {
          status: status || 'all',
          search: search || ''
        }
    });
  } catch (err) {
    console.error('Get fest candidates error:', err);
    next(err);
  }
};

module.exports = {
  registerForFest,
  registerForEvent,
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration,
  getEventParticipants,
  getFestParticipants,
  getFestRegistrationStatus,
  unregisterForFest,
  getFestRegistrationCount,
  getEventRegistrationCount,
  getFestCandidates
};
