const express = require('express');
const router = express.Router();
const FestRegistration = require('../models/FestRegistration');
const EventRegistration = require('../models/EventRegistration');
const Team = require('../models/Team');
const User = require('../models/User');
const Event = require('../models/Event');
const { authMiddleware } = require('../middlewares/auth');
const mongoose = require('mongoose');
const QRCode = require('qrcode');

// Helper to generate QR code data URL
async function generateQRCode(text) {
  return await QRCode.toDataURL(text);
}

// Register for a fest (solo)
router.post('/fest', authMiddleware, async (req, res) => {
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
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: festId, phone, dateOfBirth, gender, city, state, instituteName' 
      });
    }
    
    // Validate gender enum
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ 
        success: false,
        message: 'Gender must be one of: Male, Female, Other' 
      });
    }
    
    // Prevent duplicate registration
    const existing = await FestRegistration.findOne({ userId: req.user.id, festId });
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'Already registered for this fest' 
      });
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
    
    const ticketCode = `TICKET-${new mongoose.Types.ObjectId()}`;
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
    
    res.status(201).json({
      success: true,
      message: 'Fest registration successful',
      data: {
        registration: {
          id: festReg._id,
          status: festReg.status,
          ticket: festReg.ticket,
          qrCode: festReg.qrCode,
          answers: festReg.answers,
          registeredAt: festReg.createdAt
        }
      }
    });
  } catch (err) {
    console.error('Fest registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Register for an event (solo)
router.post('/event/solo', authMiddleware, async (req, res) => {
  try {
    const { festId, eventId, answers } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!festId || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'festId and eventId are required'
      });
    }

    // Check if event exists and is not a team event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.isTeamEvent) {
      return res.status(400).json({
        success: false,
        message: 'This is a team event. Use team registration instead.'
      });
    }

    // Check fest registration
    const festReg = await FestRegistration.findOne({ userId, festId });
    if (!festReg) {
      return res.status(400).json({
        success: false,
        message: 'Register for the fest first'
      });
    }

    // Check if user is already in a team for this event
    const existingTeam = await Team.findOne({
      event_id: eventId,
      members: userId,
      status: { $in: ['active', 'full'] }
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: 'You are already in a team for this event'
      });
    }

    // Prevent duplicate event registration
    const existing = await EventRegistration.findOne({ 
      userId, 
      eventId,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event'
      });
    }

    const ticketCode = `TICKET-${new mongoose.Types.ObjectId()}`;
    const qrCode = await generateQRCode(ticketCode);
    
    const eventReg = new EventRegistration({
      userId,
      eventId,
      festRegistrationId: festReg._id,
      answers,
      status: 'confirmed',
      ticket: ticketCode,
      qrCode,
      type: 'solo',
    });
    
    await eventReg.save();
    
    res.status(201).json({
      success: true,
      message: 'Event registration successful',
      data: {
        registration: {
          id: eventReg._id,
          type: eventReg.type,
          status: eventReg.status,
          ticket: eventReg.ticket,
          qrCode: eventReg.qrCode,
          answers: eventReg.answers,
          registeredAt: eventReg.createdAt
        },
        event: {
          id: event._id,
          name: event.name,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          mode: event.mode,
          venue: event.venue
        }
      }
    });
  } catch (err) {
    console.error('Solo event registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get my fest registrations
router.get('/fest/me', authMiddleware, async (req, res) => {
  try {
    const regs = await FestRegistration.find({ userId: req.user.id })
      .populate('festId', 'name description startDate endDate location image banner status');
    
    // Format the response with fest details
    const formattedRegs = regs.map(reg => ({
      registrationId: reg._id,
      status: reg.status,
      ticket: reg.ticket,
      qrCode: reg.qrCode,
      answers: reg.answers,
      registeredAt: reg.createdAt,
      updatedAt: reg.updatedAt,
      fest: reg.festId
    }));

    res.json({
      success: true,
      data: formattedRegs
    });
  } catch (err) {
    console.error('Get fest registrations error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get my event registrations
router.get('/event/me', authMiddleware, async (req, res) => {
  try {
    const regs = await EventRegistration.find({ userId: req.user.id })
      .populate('eventId', 'name description startDate endDate location image type maxParticipants isTeamEvent')
      .populate('teamId', 'team_name team_code members')
      .populate('festRegistrationId', 'festId')
      .populate({
        path: 'festRegistrationId',
        populate: {
          path: 'festId',
          select: 'name'
        }
      });
    
    // Format the response with event details
    const formattedRegs = regs.map(reg => ({
      registrationId: reg._id,
      status: reg.status,
      ticket: reg.ticket,
      qrCode: reg.qrCode,
      type: reg.type, // solo or team
      answers: reg.answers,
      registeredAt: reg.createdAt,
      updatedAt: reg.updatedAt,
      event: reg.eventId,
      team: reg.teamId ? {
        id: reg.teamId._id,
        teamName: reg.teamId.team_name,
        teamCode: reg.teamId.team_code,
        members: reg.teamId.members
      } : null,
      fest: reg.festRegistrationId?.festId
    }));

    res.json({
      success: true,
      data: formattedRegs
    });
  } catch (err) {
    console.error('Get event registrations error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Check fest registration status
router.get('/fest/:festId/status', authMiddleware, async (req, res) => {
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
    
    res.json({
      success: true,
      message: 'Registration found',
      data: {
        isRegistered: true,
        registration: {
          id: registration._id,
          status: registration.status,
          ticket: registration.ticket,
          qrCode: registration.qrCode,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          city: user.city,
          state: user.state,
          instituteName: user.instituteName,
          answers: registration.answers,
          fest: registration.festId,
          createdAt: registration.createdAt,
          updatedAt: registration.updatedAt
        }
      }
    });
  } catch (err) {
    console.error('Fest registration status error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get QR code for a fest registration
router.get('/fest/qrcode/:id', authMiddleware, async (req, res) => {
  try {
    const reg = await FestRegistration.findById(req.params.id);
    if (!reg || reg.userId.toString() !== req.user.id) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }
    res.json({
      success: true,
      data: { qrCode: reg.qrCode }
    });
  } catch (err) {
    console.error('Get fest QR code error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get QR code for an event registration
router.get('/event/qrcode/:id', authMiddleware, async (req, res) => {
  try {
    const reg = await EventRegistration.findById(req.params.id);
    if (!reg || reg.userId.toString() !== req.user.id) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }
    res.json({
      success: true,
      data: { qrCode: reg.qrCode }
    });
  } catch (err) {
    console.error('Get event QR code error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get total registration count for a fest
router.get('/fest/:festId/count', authMiddleware, async (req, res) => {
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

    res.json({
      success: true,
      data: {
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
      }
    });
  } catch (err) {
    console.error('Fest registration count error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get detailed registration statistics for a fest (admin only)
router.get('/fest/:festId/stats', authMiddleware, async (req, res) => {
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

    // Get registration statistics
    const totalRegistrations = await FestRegistration.countDocuments({ festId });
    const confirmedCount = await FestRegistration.countDocuments({ 
      festId, 
      status: 'confirmed' 
    });
    const pendingCount = await FestRegistration.countDocuments({ 
      festId, 
      status: 'pending' 
    });
    const cancelledCount = await FestRegistration.countDocuments({ 
      festId, 
      status: 'cancelled' 
    });

    // Get registrations by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await FestRegistration.countDocuments({
      festId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get gender distribution
    const registrations = await FestRegistration.find({ festId }).populate('userId', 'gender');
    const genderStats = registrations.reduce((acc, reg) => {
      const gender = reg.userId?.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    // Get institute distribution (top 10)
    const instituteStats = await FestRegistration.aggregate([
      { $match: { festId: new mongoose.Types.ObjectId(festId) } },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $group: { _id: '$user.instituteName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        festId: festId,
        festName: fest.name,
        totalRegistrations,
        confirmedCount,
        pendingCount,
        cancelledCount,
        recentRegistrations,
        genderDistribution: genderStats,
        topInstitutes: instituteStats,
        breakdown: {
          confirmed: confirmedCount,
          pending: pendingCount,
          cancelled: cancelledCount,
          recent: recentRegistrations
        }
      }
    });
  } catch (err) {
    console.error('Fest registration stats error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get total registration count for an event
router.get('/event/:eventId/count', authMiddleware, async (req, res) => {
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

    res.json({
      success: true,
      data: {
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
      }
    });
  } catch (err) {
    console.error('Event registration count error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get detailed registration statistics for an event (admin only)
router.get('/event/:eventId/stats', authMiddleware, async (req, res) => {
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

    // Check if user has permission (admin, superadmin, or festival head)
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      // Check if user is festival head for this specific fest
      const FestivalUserRole = require('../models/FestivalUserRole');
      const festivalRole = await FestivalUserRole.findOne({
        userId: req.user.id,
        festId: event.festId,
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

    // Get registration statistics
    const totalRegistrations = await EventRegistration.countDocuments({ eventId });
    const confirmedCount = await EventRegistration.countDocuments({ 
      eventId, 
      status: 'confirmed' 
    });
    const pendingCount = await EventRegistration.countDocuments({ 
      eventId, 
      status: 'pending' 
    });
    const cancelledCount = await EventRegistration.countDocuments({ 
      eventId, 
      status: 'cancelled' 
    });

    // Get registrations by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await EventRegistration.countDocuments({
      eventId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get solo vs team breakdown
    const soloCount = await EventRegistration.countDocuments({ 
      eventId, 
      type: 'solo',
      status: { $in: ['pending', 'confirmed'] }
    });

    const teamCount = await EventRegistration.countDocuments({ 
      eventId, 
      type: 'team',
      status: { $in: ['pending', 'confirmed'] }
    });

    // Get gender distribution
    const registrations = await EventRegistration.find({ eventId }).populate('userId', 'gender');
    const genderStats = registrations.reduce((acc, reg) => {
      const gender = reg.userId?.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    // Get institute distribution (top 10)
    const instituteStats = await EventRegistration.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $group: { _id: '$user.instituteName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get team statistics
    const teamStats = await Team.aggregate([
      { $match: { event_id: new mongoose.Types.ObjectId(eventId) } },
      { $group: { 
        _id: null, 
        totalTeams: { $sum: 1 },
        avgTeamSize: { $avg: { $size: '$members' } }
      } }
    ]);

    res.json({
      success: true,
      data: {
        eventId: eventId,
        eventName: event.name,
        festId: event.festId,
        totalRegistrations,
        confirmedCount,
        pendingCount,
        cancelledCount,
        recentRegistrations,
        soloCount,
        teamCount,
        genderDistribution: genderStats,
        topInstitutes: instituteStats,
        teamStats: teamStats[0] || { totalTeams: 0, avgTeamSize: 0 },
        breakdown: {
          confirmed: confirmedCount,
          pending: pendingCount,
          cancelled: cancelledCount,
          recent: recentRegistrations,
          solo: soloCount,
          team: teamCount
        }
      }
    });
  } catch (err) {
    console.error('Event registration stats error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get registered candidates for a fest
router.get('/fest/:festId/candidates', authMiddleware, async (req, res) => {
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

    res.json({
      success: true,
      data: {
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
      }
    });
  } catch (err) {
    console.error('Get fest candidates error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get registered candidates for an event
router.get('/event/:eventId/candidates', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50, status, type, search } = req.query;
    
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

    // Check if user has permission (admin, superadmin, or festival head)
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      // Check if user is festival head for this specific fest
      const FestivalUserRole = require('../models/FestivalUserRole');
      const festivalRole = await FestivalUserRole.findOne({
        userId: req.user.id,
        festId: event.festId,
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
    const query = { eventId };
    
    // Add status filter if provided
    if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    // Add type filter if provided
    if (type && ['solo', 'team'].includes(type)) {
      query.type = type;
    }

    // Get registrations with user details
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let registrations = await EventRegistration.find(query)
      .populate('userId', 'name email phone college instituteName city state gender dateOfBirth')
      .populate('teamId', 'team_name team_code members')
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
          user.city?.match(searchRegex) ||
          (reg.teamId && reg.teamId.team_name?.match(searchRegex))
        );
      });
    }

    // Get total count for pagination
    const totalRegistrations = await EventRegistration.countDocuments(query);
    
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
      registrationType: reg.type,
      registrationStatus: reg.status,
      ticket: reg.ticket,
      answers: reg.answers,
      teamInfo: reg.teamId ? {
        teamId: reg.teamId._id,
        teamName: reg.teamId.team_name,
        teamCode: reg.teamId.team_code,
        isTeamMember: reg.teamId.members.includes(reg.userId._id)
      } : null,
      registeredAt: reg.createdAt,
      updatedAt: reg.updatedAt
    }));

    res.json({
      success: true,
      data: {
        eventId: eventId,
        eventName: event.name,
        festId: event.festId,
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
          type: type || 'all',
          search: search || ''
        }
      }
    });
  } catch (err) {
    console.error('Get event candidates error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Unregister from a fest (cascades to all events)
router.delete('/fest/:festId/unregister', authMiddleware, async (req, res) => {
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
    const Fest = require('../models/Fest');
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

      // 3. Remove user from teams in this fest's events
      const teamsToUpdate = await Team.find({
        event_id: { $in: eventIds },
        members: userId
      });

      for (const team of teamsToUpdate) {
        team.members = team.members.filter(memberId => memberId.toString() !== userId);
        
        // If team becomes empty, delete it
        if (team.members.length === 0) {
          await Team.findByIdAndDelete(team._id, { session });
        } else {
          await team.save({ session });
        }
      }

      await session.commitTransaction();

      res.json({
        success: true,
        message: 'Successfully unregistered from fest and all events',
        data: {
          festId,
          festName: fest.name,
          deletedFestRegistration: true,
          deletedEventRegistrations: eventRegistrations.length,
          updatedTeams: teamsToUpdate.length,
          deletedTeams: teamsToUpdate.filter(team => team.members.length === 0).length
        }
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (err) {
    console.error('Fest unregistration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Unregister from a specific event
router.delete('/event/:eventId/unregister', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
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

    // Check if user is registered for this event
    const eventRegistration = await EventRegistration.findOne({ 
      userId, 
      eventId 
    });
    
    if (!eventRegistration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Not registered for this event' 
      });
    }

    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete event registration
      await EventRegistration.findByIdAndDelete(eventRegistration._id, { session });

      // If user was part of a team, remove them from team
      let teamUpdated = false;
      if (eventRegistration.teamId) {
        const team = await Team.findById(eventRegistration.teamId);
        if (team) {
          team.members = team.members.filter(memberId => memberId.toString() !== userId);
          
          // If team becomes empty, delete it
          if (team.members.length === 0) {
            await Team.findByIdAndDelete(team._id, { session });
          } else {
            await team.save({ session });
          }
          teamUpdated = true;
        }
      }

      await session.commitTransaction();

      res.json({
        success: true,
        message: 'Successfully unregistered from event',
        data: {
          eventId,
          eventName: event.name,
          deletedRegistration: true,
          teamUpdated
        }
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (err) {
    console.error('Event unregistration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router; 