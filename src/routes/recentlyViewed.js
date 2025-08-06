const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const RecentlyViewedService = require('../services/recentlyViewedService');

// Add fest to recently viewed
router.post('/add/:festId', authMiddleware, async (req, res) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;

    const recentlyViewed = await RecentlyViewedService.addToRecentlyViewed(userId, festId);
    res.status(201).json({
      success: true,
      message: 'Fest added to recently viewed successfully',
      data: recentlyViewed
    });
  } catch (error) {
    if (error.message === 'Fest not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's recently viewed fests
router.get('/', authMiddleware, async (req, res) => {
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

    res.json({
      success: true,
      data: fests,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's most viewed fests
router.get('/most-viewed', authMiddleware, async (req, res) => {
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

    res.json({
      success: true,
      data: fests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove fest from recently viewed
router.delete('/remove/:festId', authMiddleware, async (req, res) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;

    await RecentlyViewedService.removeFromRecentlyViewed(userId, festId);
    res.json({
      success: true,
      message: 'Fest removed from recently viewed successfully'
    });
  } catch (error) {
    if (error.message === 'Fest not found in recently viewed') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Clear entire recently viewed history
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await RecentlyViewedService.clearRecentlyViewed(userId);
    res.json({
      success: true,
      message: 'Recently viewed history cleared successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get recently viewed count
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await RecentlyViewedService.getRecentlyViewedCount(userId);
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get viewing statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await RecentlyViewedService.getViewingStats(userId);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cleanup old entries (admin only)
router.delete('/cleanup', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { daysOld = 90 } = req.query;
    const result = await RecentlyViewedService.cleanupOldEntries(parseInt(daysOld));
    
    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} old entries`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 