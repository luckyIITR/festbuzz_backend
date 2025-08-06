const RecentlyViewed = require('../models/RecentlyViewed');
const Fest = require('../models/Fest');

class RecentlyViewedService {
  // Add fest to user's recently viewed
  static async addToRecentlyViewed(userId, festId) {
    try {
      // Check if fest exists
      const fest = await Fest.findById(festId);
      if (!fest) {
        throw new Error('Fest not found');
      }

      // Check if already exists and update view count and timestamp
      const existing = await RecentlyViewed.findOne({ userId, festId });
      
      if (existing) {
        // Update existing record
        existing.viewCount += 1;
        existing.viewedAt = new Date();
        await existing.save();
        return existing;
      } else {
        // Create new record
        const recentlyViewed = new RecentlyViewed({
          userId,
          festId
        });
        await recentlyViewed.save();
        return recentlyViewed;
      }
    } catch (error) {
      throw error;
    }
  }

  // Get user's recently viewed fests with populated fest details
  static async getUserRecentlyViewed(userId, limit = 20, page = 1) {
    try {
      const skip = (page - 1) * limit;
      
      const recentlyViewed = await RecentlyViewed.find({ userId })
        .populate('festId', 'name type state city venue college startDate endDate logo heroImage festMode about contact email instagram website isRegistrationOpen organizerLogo bannerImage galleryImages sponsors visibility tickets')
        .sort({ viewedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await RecentlyViewed.countDocuments({ userId });

      return {
        recentlyViewed,
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

  // Get most viewed fests by user
  static async getMostViewedFests(userId, limit = 10) {
    try {
      const mostViewed = await RecentlyViewed.find({ userId })
        .populate('festId', 'name type state city venue college startDate endDate logo heroImage festMode about contact email instagram website isRegistrationOpen organizerLogo bannerImage galleryImages sponsors visibility')
        .sort({ viewCount: -1, viewedAt: -1 })
        .limit(limit);

      return mostViewed;
    } catch (error) {
      throw error;
    }
  }

  // Remove fest from recently viewed
  static async removeFromRecentlyViewed(userId, festId) {
    try {
      const result = await RecentlyViewed.findOneAndDelete({ userId, festId });
      if (!result) {
        throw new Error('Fest not found in recently viewed');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Clear user's entire recently viewed history
  static async clearRecentlyViewed(userId) {
    try {
      const result = await RecentlyViewed.deleteMany({ userId });
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get recently viewed count for user
  static async getRecentlyViewedCount(userId) {
    try {
      return await RecentlyViewed.countDocuments({ userId });
    } catch (error) {
      throw error;
    }
  }

  // Clean up old recently viewed entries (older than X days)
  static async cleanupOldEntries(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await RecentlyViewed.deleteMany({
        viewedAt: { $lt: cutoffDate }
      });
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get viewing statistics for analytics
  static async getViewingStats(userId) {
    try {
      const stats = await RecentlyViewed.aggregate([
        { $match: { userId: new require('mongoose').Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$viewCount' },
            uniqueFests: { $sum: 1 },
            avgViewsPerFest: { $avg: '$viewCount' }
          }
        }
      ]);

      return stats[0] || { totalViews: 0, uniqueFests: 0, avgViewsPerFest: 0 };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RecentlyViewedService; 