const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const Fest = require('../models/Fest');
const User = require('../models/User');
const FestRegistration = require('../models/FestRegistration');
const mongoose = require('mongoose');

// GET /api/myfests - All fests user is associated with (upcoming, ongoing, past)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const regs = await FestRegistration.find({ userId: req.user.id });
    const festIds = regs.map(r => r.festId);
    const fests = await Fest.find({ _id: { $in: festIds } });
    const upcoming = fests.filter(f => f.startDate && f.startDate > now);
    const ongoing = fests.filter(f => f.startDate && f.endDate && f.startDate <= now && f.endDate >= now);
    const past = fests.filter(f => f.endDate && f.endDate < now);
    res.json({ upcoming, ongoing, past });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/myfests/recently-viewed
router.get('/recently-viewed', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const festIds = user.recentlyViewedFests || [];
    const fests = await Fest.find({ _id: { $in: festIds } });
    res.json(fests);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/myfests/wishlist
router.get('/wishlist', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const festIds = user.wishlistFests || [];
    const fests = await Fest.find({ _id: { $in: festIds } });
    res.json(fests);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/myfests/registered
router.get('/registered', authMiddleware, async (req, res) => {
  try {
    const regs = await FestRegistration.find({ userId: req.user.id });
    const festIds = regs.map(r => r.festId);
    const fests = await Fest.find({ _id: { $in: festIds } });
    res.json(fests);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/myfests/recommended
router.get('/recommended', authMiddleware, async (req, res) => {
  try {
    // Simple recommendation: return 5 random fests
    const count = await Fest.countDocuments();
    const random = Math.max(0, Math.floor(Math.random() * (count - 5)));
    const fests = await Fest.find().skip(random).limit(5);
    res.json(fests);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/myfests/wishlist/:festId
router.post('/wishlist/:festId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.wishlistFests) user.wishlistFests = [];
    const festId = req.params.festId;
    if (!user.wishlistFests.includes(festId)) {
      user.wishlistFests.push(festId);
      await user.save();
    }
    res.json({ msg: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/myfests/wishlist/:festId
router.delete('/wishlist/:festId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.wishlistFests) user.wishlistFests = [];
    const festId = req.params.festId;
    user.wishlistFests = user.wishlistFests.filter(id => id.toString() !== festId);
    await user.save();
    res.json({ msg: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/myfests/recently-viewed/:festId
router.post('/recently-viewed/:festId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.recentlyViewedFests) user.recentlyViewedFests = [];
    const festId = req.params.festId;
    // Remove if already exists
    user.recentlyViewedFests = user.recentlyViewedFests.filter(id => id.toString() !== festId);
    // Add to front
    user.recentlyViewedFests.unshift(festId);
    // Keep only last 10
    user.recentlyViewedFests = user.recentlyViewedFests.slice(0, 10);
    await user.save();
    res.json({ msg: 'Added to recently viewed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 