const Wishlist = require('../models/Wishlist');
const Fest = require('../models/Fest');

class WishlistService {
  // Add fest to user's wishlist
  static async addToWishlist(userId, festId) {
    try {
      // Check if fest exists
      const fest = await Fest.findById(festId);
      if (!fest) {
        throw new Error('Fest not found');
      }

      // Add to wishlist (unique constraint will prevent duplicates)
      const wishlistItem = new Wishlist({
        userId,
        festId
      });

      await wishlistItem.save();
      return wishlistItem;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error - item already in wishlist
        throw new Error('Fest already in wishlist');
      }
      throw error;
    }
  }

  // Remove fest from user's wishlist
  static async removeFromWishlist(userId, festId) {
    try {
      const result = await Wishlist.findOneAndDelete({ userId, festId });
      if (!result) {
        throw new Error('Fest not found in wishlist');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get user's wishlist with populated fest details
  static async getUserWishlist(userId, limit = 50, page = 1) {
    try {
      const skip = (page - 1) * limit;
      
      const wishlist = await Wishlist.find({ userId })
        .populate('festId', 'name type state city venue college startDate endDate logo heroImage')
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Wishlist.countDocuments({ userId });

      return {
        wishlist,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if fest is in user's wishlist
  static async isInWishlist(userId, festId) {
    try {
      const wishlistItem = await Wishlist.findOne({ userId, festId });
      return !!wishlistItem;
    } catch (error) {
      throw error;
    }
  }

  // Get wishlist count for user
  static async getWishlistCount(userId) {
    try {
      return await Wishlist.countDocuments({ userId });
    } catch (error) {
      throw error;
    }
  }

  // Clear user's entire wishlist
  static async clearWishlist(userId) {
    try {
      const result = await Wishlist.deleteMany({ userId });
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = WishlistService; 