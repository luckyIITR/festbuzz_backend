const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const WishlistService = require('../services/wishlistService');

// Add fest to wishlist
router.post('/add/:festId', authMiddleware, async (req, res) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;

    const wishlistItem = await WishlistService.addToWishlist(userId, festId);
    res.status(201).json({
      success: true,
      message: 'Fest added to wishlist successfully',
      data: wishlistItem
    });
  } catch (error) {
    if (error.message === 'Fest not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Fest already in wishlist') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove fest from wishlist
router.delete('/remove/:festId', authMiddleware, async (req, res) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;

    await WishlistService.removeFromWishlist(userId, festId);
    res.json({
      success: true,
      message: 'Fest removed from wishlist successfully'
    });
  } catch (error) {
    if (error.message === 'Fest not found in wishlist') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's wishlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    const result = await WishlistService.getUserWishlist(userId, parseInt(limit), parseInt(page));
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check if fest is in wishlist
router.get('/check/:festId', authMiddleware, async (req, res) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;

    const isInWishlist = await WishlistService.isInWishlist(userId, festId);
    res.json({
      success: true,
      data: { isInWishlist }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get wishlist count
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await WishlistService.getWishlistCount(userId);
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Clear entire wishlist
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await WishlistService.clearWishlist(userId);
    res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 