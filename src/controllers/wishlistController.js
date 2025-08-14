const WishlistService = require('../services/wishlistService');
const { AppError } = require('../middlewares/errorHandler');
const { successResponse, createPaginationMeta } = require('../utils/response');
const logger = require('../utils/logger');

// @desc    Add fest to wishlist
// @route   POST /api/wishlist/add/:festId
// @access  Private
const addToWishlist = async (req, res, next) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;

    const wishlistItem = await WishlistService.addToWishlist(userId, festId);
    
    logger.info(`User ${userId} added fest ${festId} to wishlist`);
    
    return successResponse(res, 201, 'Fest added to wishlist successfully', wishlistItem);
  } catch (error) {
    if (error.message === 'Fest not found') {
      return next(new AppError('Festival not found', 404, 'FEST_NOT_FOUND'));
    }
    if (error.message === 'Fest already in wishlist') {
      return next(new AppError('Festival already in wishlist', 400, 'ALREADY_IN_WISHLIST'));
    }
    logger.error('Add to wishlist error:', error);
    next(error);
  }
};

// @desc    Remove fest from wishlist
// @route   DELETE /api/wishlist/remove/:festId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;

    await WishlistService.removeFromWishlist(userId, festId);
    
    logger.info(`User ${userId} removed fest ${festId} from wishlist`);
    
    return successResponse(res, 200, 'Fest removed from wishlist successfully');
  } catch (error) {
    if (error.message === 'Fest not found in wishlist') {
      return next(new AppError('Festival not found in wishlist', 404, 'WISHLIST_ITEM_NOT_FOUND'));
    }
    logger.error('Remove from wishlist error:', error);
    next(error);
  }
};

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getUserWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    const result = await WishlistService.getUserWishlist(userId, parseInt(limit), parseInt(page));
    // console.log(result.wishlist);
    return successResponse(
      res, 
      200, 
      'Wishlist retrieved successfully', 
      result.wishlist, 
      createPaginationMeta(page, limit, result.total)
    );
  } catch (error) {
    logger.error('Get user wishlist error:', error);
    next(error);
  }
};

// @desc    Check if fest is in wishlist
// @route   GET /api/wishlist/check/:festId
// @access  Private
const checkWishlistStatus = async (req, res, next) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;

    const isInWishlist = await WishlistService.isInWishlist(userId, festId);
    
    return successResponse(res, 200, 'Wishlist status checked successfully', { isInWishlist });
  } catch (error) {
    logger.error('Check wishlist status error:', error);
    next(error);
  }
};

// @desc    Get wishlist count
// @route   GET /api/wishlist/count
// @access  Private
const getWishlistCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await WishlistService.getWishlistCount(userId);
    
    return successResponse(res, 200, 'Wishlist count retrieved successfully', { count });
  } catch (error) {
    logger.error('Get wishlist count error:', error);
    next(error);
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
const clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await WishlistService.clearWishlist(userId);
    
    logger.info(`User ${userId} cleared their wishlist`);
    
    return successResponse(res, 200, 'Wishlist cleared successfully');
  } catch (error) {
    logger.error('Clear wishlist error:', error);
    next(error);
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  checkWishlistStatus,
  getWishlistCount,
  clearWishlist
};
