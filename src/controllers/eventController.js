const Event = require('../models/Event');
const Fest = require('../models/Fest');
const { AppError } = require('../middlewares/errorHandler');
const { successResponse, createPaginationMeta } = require('../utils/response');
const logger = require('../utils/logger');

// @desc    Create a new event (as draft by default)
// @route   POST /api/events
// @access  Private (Admin, Organizer)
const createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      status: 'draft',
      lastSavedAsDraft: new Date(),
      createdBy: req.user.id
    };
    
    const event = new Event(eventData);
    await event.save();
    
    logger.info(`Event created: ${event.name} by user: ${req.user.id}`);
    
    return successResponse(res, 201, 'Event created as draft successfully', event);
  } catch (error) {
    logger.error('Create event error:', error);
    next(error);
  }
};

// @desc    Save event as draft
// @route   POST /api/events/draft
// @access  Private (Admin, Organizer)
const saveEventAsDraft = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      status: 'draft',
      lastSavedAsDraft: new Date(),
      createdBy: req.user.id
    };
    
    if (req.body._id) {
      // Update existing draft
      const event = await Event.findById(req.body._id);
      if (!event) {
        return next(new AppError('Event not found', 404, 'EVENT_NOT_FOUND'));
      }
      
      // Increment draft version
      eventData.draftVersion = (event.draftVersion || 0) + 1;
      
      const updatedEvent = await Event.findByIdAndUpdate(
        req.body._id, 
        eventData, 
        { new: true }
      );
      
      logger.info(`Event draft updated: ${updatedEvent.name} by user: ${req.user.id}`);
      
      return successResponse(res, 200, 'Draft saved successfully', updatedEvent);
    } else {
      // Create new draft
      const event = new Event(eventData);
      await event.save();
      
      logger.info(`Event draft created: ${event.name} by user: ${req.user.id}`);
      
      return successResponse(res, 201, 'Draft created successfully', event);
    }
  } catch (error) {
    logger.error('Save event draft error:', error);
    next(error);
  }
};

// @desc    Publish event
// @route   POST /api/events/:id/publish
// @access  Private (Admin, Organizer)
const publishEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new AppError('Event not found', 404, 'EVENT_NOT_FOUND'));
    }

    // Validate required fields for publishing
    const requiredFields = ['name', 'description', 'startDate', 'endDate', 'venue', 'maxParticipants'];
    const missingFields = requiredFields.filter(field => !event[field]);
    
    if (missingFields.length > 0) {
      return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }

    event.status = 'published';
    event.publishedAt = new Date();
    await event.save();
    
    logger.info(`Event published: ${event.name} by user: ${req.user.id}`);
    
    return successResponse(res, 200, 'Event published successfully', event);
  } catch (error) {
    logger.error('Publish event error:', error);
    next(error);
  }
};

// @desc    Get all events with filters
// @route   GET /api/events
// @access  Public
const getAllEvents = async (req, res, next) => {
  try {
    const { 
      status, 
      category, 
      festId, 
      organizer, 
      page = 1, 
      limit = 10,
      sort = 'startTime'
    } = req.query;
    
    let filter = {};
    
    // Apply filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (festId) filter.festId = festId;
    if (organizer) filter.organizer = organizer;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const events = await Event.find(filter)
      .sort({ [sort]: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('festId', 'name')
      // .populate('organizer', 'name email');
    
    const total = await Event.countDocuments(filter);
    
    return successResponse(
      res, 
      200, 
      'Events retrieved successfully', 
      events, 
      createPaginationMeta(page, limit, total)
    );
  } catch (error) {
    logger.error('Get all events error:', error);
    next(error);
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('festId', 'name description startDate endDate')
      .populate('createdBy', 'name email');
    
    if (!event) {
      return next(new AppError('Event not found', 404, 'EVENT_NOT_FOUND'));
    }
    
    return successResponse(res, 200, 'Event retrieved successfully', event);
  } catch (error) {
    logger.error('Get event by ID error:', error);
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin, Organizer)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return next(new AppError('Event not found', 404, 'EVENT_NOT_FOUND'));
    }
    
    logger.info(`Event updated: ${event.name} by user: ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    logger.error('Update event error:', error);
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin, Organizer)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return next(new AppError('Event not found', 404, 'EVENT_NOT_FOUND'));
    }
    
    logger.info(`Event deleted: ${event.name} by user: ${req.user.id}`);
    
    return successResponse(res, 200, 'Event deleted successfully');
  } catch (error) {
    logger.error('Delete event error:', error);
    next(error);
  }
};

// @desc    Search events
// @route   GET /api/events/search
// @access  Public
const searchEvents = async (req, res, next) => {
  try {
    const { q, category, festId, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    // Text search
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { venue: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Apply other filters
    if (category) filter.category = category;
    if (festId) filter.festId = festId;
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const events = await Event.find(filter)
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('festId', 'name')
      // .populate('organizer', 'name email');
    
    const total = await Event.countDocuments(filter);
    
    return successResponse(
      res, 
      200, 
      'Events search completed successfully', 
      events, 
      createPaginationMeta(page, limit, total)
    );
  } catch (error) {
    logger.error('Search events error:', error);
    next(error);
  }
};

// @desc    Get event statistics
// @route   GET /api/events/stats
// @access  Private (Admin, Organizer)
const getEventStats = async (req, res, next) => {
  try {
    const stats = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: 'published' });
    const draftEvents = await Event.countDocuments({ status: 'draft' });
    
    return successResponse(res, 200, 'Event statistics retrieved successfully', {
      total: totalEvents,
      published: publishedEvents,
      draft: draftEvents,
      byStatus: stats
    });
  } catch (error) {
    logger.error('Get event stats error:', error);
    next(error);
  }
};

// @desc    Unpublish event
// @route   POST /api/events/:id/unpublish
// @access  Private (Admin, Organizer)
const unpublishEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    event.status = 'draft';
    event.publishedAt = null;
    event.publishedBy = null;
    event.lastSavedAsDraft = new Date();
    await event.save();

    return successResponse(res, 200, 'Event unpublished successfully', event);
  } catch (err) {
    console.log(err);
    next(err);
  }
}

module.exports = {
  createEvent,
  saveEventAsDraft,
  publishEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  searchEvents,
  getEventStats,
  unpublishEvent
};
