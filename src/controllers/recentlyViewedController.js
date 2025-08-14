const RecentlyViewedService = require('../services/recentlyViewedService');
const { AppError } = require('../middlewares/errorHandler');
const { successResponse, createPaginationMeta } = require('../utils/response');
const logger = require('../utils/logger');

// @desc    Add fest to recently viewed
// @route   POST /api/recently-viewed/add/:festId
// @access  Private
const addToRecentlyViewed = async (req, res, next) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;

    const recentlyViewed = await RecentlyViewedService.addToRecentlyViewed(userId, festId);
    
    logger.info(`User ${userId} added fest ${festId} to recently viewed`);
    
    return successResponse(res, 201, 'Fest added to recently viewed successfully', recentlyViewed);
  } catch (error) {
    if (error.message === 'Fest not found') {
      return next(new AppError('Festival not found', 404, 'FEST_NOT_FOUND'));
    }
    logger.error('Add to recently viewed error:', error);
    next(error);
  }
};

// @desc    Get user's recently viewed fests
// @route   GET /api/recently-viewed
// @access  Private
const getUserRecentlyViewed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await RecentlyViewedService.getUserRecentlyViewed(userId, parseInt(limit), parseInt(page));
    
    // Extract fest data from recently viewed items
    const fests = result.recentlyViewed.map(item => ({
      ...item.festId.toObject(),
      viewedAt: item.viewedAt,
      viewCount: item.viewCount
    }));

    return successResponse(
      res, 
      200, 
      'Recently viewed fests retrieved successfully', 
      fests, 
      result.pagination
    );
  } catch (error) {
    logger.error('Get user recently viewed error:', error);
    next(error);
  }
};

// @desc    Get user's most viewed fests
// @route   GET /api/recently-viewed/most-viewed
// @access  Private
const getMostViewedFests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const mostViewed = await RecentlyViewedService.getMostViewedFests(userId, parseInt(limit));
    
    // Extract fest data from most viewed items
    const fests = mostViewed.map(item => ({
      ...item.festId.toObject(),
      viewedAt: item.viewedAt,
      viewCount: item.viewCount
    }));

    return successResponse(res, 200, 'Most viewed fests retrieved successfully', fests);
  } catch (error) {
    logger.error('Get most viewed fests error:', error);
    next(error);
  }
};

// @desc    Remove fest from recently viewed
// @route   DELETE /api/recently-viewed/remove/:festId
// @access  Private
const removeFromRecentlyViewed = async (req, res, next) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;

    await RecentlyViewedService.removeFromRecentlyViewed(userId, festId);
    
    logger.info(`User ${userId} removed fest ${festId} from recently viewed`);
    
    return successResponse(res, 200, 'Fest removed from recently viewed successfully');
  } catch (error) {
    if (error.message === 'Fest not found in recently viewed') {
      return next(new AppError('Festival not found in recently viewed', 404, 'RECENTLY_VIEWED_ITEM_NOT_FOUND'));
    }
    logger.error('Remove from recently viewed error:', error);
    next(error);
  }
};

// @desc    Clear entire recently viewed history
// @route   DELETE /api/recently-viewed/clear
// @access  Private
const clearRecentlyViewed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await RecentlyViewedService.clearRecentlyViewed(userId);
    
    logger.info(`User ${userId} cleared their recently viewed history`);
    
    return successResponse(res, 200, 'Recently viewed history cleared successfully');
  } catch (error) {
    logger.error('Clear recently viewed error:', error);
    next(error);
  }
};

// @desc    Get recently viewed statistics
// @route   GET /api/recently-viewed/stats
// @access  Private
const getRecentlyViewedStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const stats = await RecentlyViewedService.getRecentlyViewedStats(userId);
    
    return successResponse(res, 200, 'Recently viewed statistics retrieved successfully', stats);
  } catch (error) {
    logger.error('Get recently viewed stats error:', error);
    next(error);
  }
};

module.exports = {
  addToRecentlyViewed,
  getUserRecentlyViewed,
  getMostViewedFests,
  removeFromRecentlyViewed,
  clearRecentlyViewed,
  getRecentlyViewedStats
};
