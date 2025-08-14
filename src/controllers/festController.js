const Fest = require('../models/Fest');
const Event = require('../models/Event');
const { AppError } = require('../middlewares/errorHandler');
const { successResponse, createPaginationMeta } = require('../utils/response');
const logger = require('../utils/logger');

// @desc    Create a new festival
// @route   POST /api/fests
// @access  Private (Admin, Organizer)
const createFest = async (req, res, next) => {
  try {
    const festData = { ...req.body, createdBy: req.user.id };
    const fest = new Fest(festData);
    await fest.save();
    
    logger.info(`Fest created: ${fest.name} by user: ${req.user.id}`);
    
    return successResponse(res, 201, 'Festival created successfully', fest);
  } catch (error) {
    logger.error('Create fest error:', error);
    next(error);
  }
};

// @desc    Get all festivals with optional filters
// @route   GET /api/fests
// @access  Public
const getAllFests = async (req, res, next) => {
  try {
    const { trending, upcoming, category, location, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    // Apply filters
    if (trending === 'true') filter.trending = true;
    if (upcoming === 'true') {
      filter.startDate = { $gte: new Date() };
    }
    if (category) filter.category = category;
    if (location) filter.location = location;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const fests = await Fest.find(filter)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');
    
    const total = await Fest.countDocuments(filter);
    
    return successResponse(
      res, 
      200, 
      'Festivals retrieved successfully', 
      fests, 
      createPaginationMeta(page, limit, total)
    );
  } catch (error) {
    logger.error('Get all fests error:', error);
    next(error);
  }
};

// @desc    Get festival by ID with populated events
// @route   GET /api/fests/:id
// @access  Public
const getFestById = async (req, res, next) => {
  try {
    const fest = await Fest.findById(req.params.id)
      .populate('events')
      .populate('createdBy', 'name email');
    
    if (!fest) {
      return next(new AppError('Festival not found', 404, 'FEST_NOT_FOUND'));
    }
    
    return successResponse(res, 200, 'Festival retrieved successfully', fest);
  } catch (error) {
    logger.error('Get fest by ID error:', error);
    next(error);
  }
};

// @desc    Update festival
// @route   PUT /api/fests/:id
// @access  Private (Admin, Organizer)
const updateFest = async (req, res, next) => {
  try {
    const fest = await Fest.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!fest) {
      return next(new AppError('Festival not found', 404));
    }
    
    logger.info(`Fest updated: ${fest.name} by user: ${req.user.id}`);
    
    return successResponse(res, 200, 'Festival updated successfully', fest);
  } catch (error) {
    logger.error('Update fest error:', error);
    next(error);
  }
};

// @desc    Delete festival
// @route   DELETE /api/fests/:id
// @access  Private (Admin, Organizer)
const deleteFest = async (req, res, next) => {
  try {
    const fest = await Fest.findByIdAndDelete(req.params.id);
    
    if (!fest) {
      return next(new AppError('Festival not found', 404, 'FEST_NOT_FOUND'));
    }
    
    // Also delete associated events
    await Event.deleteMany({ festId: req.params.id });
    
    logger.info(`Fest deleted: ${fest.name} by user: ${req.user.id}`);
    
    return successResponse(res, 200, 'Festival deleted successfully');
  } catch (error) {
    logger.error('Delete fest error:', error);
    next(error);
  }
};

// @desc    Get all events for a specific festival
// @route   GET /api/fests/:festId/events
// @access  Public
const getFestEvents = async (req, res, next) => {
  try {
    const { festId } = req.params;
    const { status, category, page = 1, limit = 10 } = req.query;
    
    let filter = { festId };
    
    // Apply filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const events = await Event.find(filter)
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('organizer', 'name email');
    
    const total = await Event.countDocuments(filter);
    
    return successResponse(
      res, 
      200, 
      'Festival events retrieved successfully', 
      events, 
      createPaginationMeta(page, limit, total)
    );
  } catch (error) {
    logger.error('Get fest events error:', error);
    next(error);
  }
};

// @desc    Get festival filters
// @route   GET /api/fests/filters
// @access  Public
const getFestFilters = async (req, res, next) => {
  try {
    const types = await Fest.distinct('type');
    const locations = await Fest.distinct('location');
    const categories = await Fest.distinct('category');
    
    // Get price range
    const prices = await Fest.find({}, { individualPrice: 1, teamPrice: 1, entryFee: 1, _id: 0 });
    const allPrices = prices.flatMap(p => [
      p.individualPrice, 
      p.teamPrice, 
      p.entryFee
    ].filter(Number.isFinite));
    
    const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;
    
    // Get date range
    const dates = await Fest.find({}, { startDate: 1, endDate: 1, _id: 0 });
    const allDates = dates.flatMap(d => [d.startDate, d.endDate].filter(Boolean));
    const minDate = allDates.length ? new Date(Math.min(...allDates.map(d => new Date(d)))) : null;
    const maxDate = allDates.length ? new Date(Math.max(...allDates.map(d => new Date(d)))) : null;
    
    return successResponse(res, 200, 'Festival filters retrieved successfully', {
      types,
      locations,
      categories,
      price: { min: minPrice, max: maxPrice },
      date: { min: minDate, max: maxDate }
    });
  } catch (error) {
    logger.error('Get fest filters error:', error);
    next(error);
  }
};

// @desc    Search festivals
// @route   GET /api/fests/search
// @access  Public
const searchFests = async (req, res, next) => {
  try {
    const { q, category, location, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    // Text search
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { organizer: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Apply other filters
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const fests = await Fest.find(filter)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');
    
    const total = await Fest.countDocuments(filter);
    
    return successResponse(
      res, 
      200, 
      'Festivals search completed successfully', 
      fests, 
      createPaginationMeta(page, limit, total)
    );
  } catch (error) {
    logger.error('Search fests error:', error);
    next(error);
  }
};

module.exports = {
  createFest,
  getAllFests,
  getFestById,
  updateFest,
  deleteFest,
  getFestEvents,
  getFestFilters,
  searchFests
};
