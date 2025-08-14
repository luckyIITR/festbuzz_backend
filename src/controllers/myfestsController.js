const Fest = require('../models/Fest');
const User = require('../models/User');
const FestRegistration = require('../models/FestRegistration');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');
const { successResponse } = require('../utils/response');

// @desc    Get all fests user is associated with
// @route   GET /api/myfests
// @access  Private
const getMyFests = async (req, res, next) => {
  try {
    const now = new Date();
    const regs = await FestRegistration.find({ userId: req.user.id });
    const festIds = regs.map(r => r.festId);
    const fests = await Fest.find({ _id: { $in: festIds } });
    
    const upcoming = fests.filter(f => f.startDate && f.startDate > now);
    const ongoing = fests.filter(f => f.startDate && f.endDate && f.startDate <= now && f.endDate >= now);
    const past = fests.filter(f => f.endDate && f.endDate < now);
    
    return successResponse(res, 200, 'My fests retrieved successfully', { upcoming, ongoing, past });
  } catch (error) {
    logger.error('Get my fests error:', error);
    next(error);
  }
};

// @desc    Get user's recently viewed fests
// @route   GET /api/myfests/recently-viewed
// @access  Private
const getRecentlyViewedFests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const festIds = user.recentlyViewedFests || [];
    const fests = await Fest.find({ _id: { $in: festIds } });
    
    return successResponse(res, 200, 'Recently viewed fests retrieved successfully', fests);
  } catch (error) {
    logger.error('Get recently viewed fests error:', error);
    next(error);
  }
};

// @desc    Get user's wishlist fests
// @route   GET /api/myfests/wishlist
// @access  Private
const getWishlistFests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const festIds = user.wishlistFests || [];
    const fests = await Fest.find({ _id: { $in: festIds } });
    
    return successResponse(res, 200, 'Wishlist fests retrieved successfully', fests);
  } catch (error) {
    logger.error('Get wishlist fests error:', error);
    next(error);
  }
};

// @desc    Get user's registered fests
// @route   GET /api/myfests/registered
// @access  Private
const getRegisteredFests = async (req, res, next) => {
  try {
    const regs = await FestRegistration.find({ userId: req.user.id });
    const festIds = regs.map(r => r.festId);
    const fests = await Fest.find({ _id: { $in: festIds } });
    
    return successResponse(res, 200, 'Registered fests retrieved successfully', fests);
  } catch (error) {
    logger.error('Get registered fests error:', error);
    next(error);
  }
};

// @desc    Get recommended fests
// @route   GET /api/myfests/recommended
// @access  Private
const getRecommendedFests = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    
    // Get user's preferences from their registration history
    const userRegs = await FestRegistration.find({ userId: req.user.id });
    const userFestIds = userRegs.map(r => r.festId);
    
    // Get categories the user has shown interest in
    const userFests = await Fest.find({ _id: { $in: userFestIds } });
    const userCategories = [...new Set(userFests.map(f => f.category))];
    
    // Find fests in similar categories that user hasn't registered for
    let recommendedFests = [];
    
    if (userCategories.length > 0) {
      recommendedFests = await Fest.find({
        _id: { $nin: userFestIds },
        category: { $in: userCategories },
        startDate: { $gte: new Date() }
      }).limit(parseInt(limit));
    }
    
    // If not enough recommendations, add random upcoming fests
    if (recommendedFests.length < parseInt(limit)) {
      const remainingLimit = parseInt(limit) - recommendedFests.length;
      const randomFests = await Fest.find({
        _id: { $nin: [...userFestIds, ...recommendedFests.map(f => f._id)] },
        startDate: { $gte: new Date() }
      }).limit(remainingLimit);
      
      recommendedFests = [...recommendedFests, ...randomFests];
    }
    
    return successResponse(res, 200, 'Recommended fests retrieved successfully', recommendedFests);
  } catch (error) {
    logger.error('Get recommended fests error:', error);
    next(error);
  }
};

// @desc    Add fest to wishlist
// @route   POST /api/myfests/wishlist/:festId
// @access  Private
const addToWishlist = async (req, res, next) => {
  try {
    const { festId } = req.params;
    
    // Check if fest exists
    const fest = await Fest.findById(festId);
    if (!fest) {
      return next(new AppError('Festival not found', 404));
    }
    
    const user = await User.findById(req.user.id);
    if (!user.wishlistFests) user.wishlistFests = [];
    
    if (!user.wishlistFests.includes(festId)) {
      user.wishlistFests.push(festId);
      await user.save();
      
      logger.info(`User ${req.user.id} added fest ${festId} to wishlist`);
    }
    
    return successResponse(res, 200, 'Added to wishlist');
  } catch (error) {
    logger.error('Add to wishlist error:', error);
    next(error);
  }
};

// @desc    Remove fest from wishlist
// @route   DELETE /api/myfests/wishlist/:festId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const { festId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user.wishlistFests) user.wishlistFests = [];
    
    user.wishlistFests = user.wishlistFests.filter(id => id.toString() !== festId);
    await user.save();
    
    logger.info(`User ${req.user.id} removed fest ${festId} from wishlist`);
    
    return successResponse(res, 200, 'Removed from wishlist');
  } catch (error) {
    logger.error('Remove from wishlist error:', error);
    next(error);
  }
};

// @desc    Get user's fest statistics
// @route   GET /api/myfests/stats
// @access  Private
const getMyFestsStats = async (req, res, next) => {
  try {
    const now = new Date();
    
    // Get user's registrations
    const regs = await FestRegistration.find({ userId: req.user.id });
    const festIds = regs.map(r => r.festId);
    const fests = await Fest.find({ _id: { $in: festIds } });
    
    // Get user's wishlist
    const user = await User.findById(req.user.id);
    const wishlistCount = user.wishlistFests ? user.wishlistFests.length : 0;
    
    // Calculate stats
    const totalRegistered = fests.length;
    const upcomingCount = fests.filter(f => f.startDate && f.startDate > now).length;
    const ongoingCount = fests.filter(f => f.startDate && f.endDate && f.startDate <= now && f.endDate >= now).length;
    const pastCount = fests.filter(f => f.endDate && f.endDate < now).length;
    
    // Get categories user is interested in
    const categories = [...new Set(fests.map(f => f.category))];
    
    return successResponse(res, 200, 'My fests stats retrieved successfully', {
        totalRegistered,
        upcomingCount,
        ongoingCount,
        pastCount,
        wishlistCount,
        categories,
        totalFests: fests.length
        
    });
  } catch (error) {
    logger.error('Get my fests stats error:', error);
    next(error);
  }
};

module.exports = {
  getMyFests,
  getRecentlyViewedFests,
  getWishlistFests,
  getRegisteredFests,
  getRecommendedFests,
  addToWishlist,
  removeFromWishlist,
  getMyFestsStats
};
