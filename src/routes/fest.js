const express = require('express');
const router = express.Router();
const Fest = require('../models/Fest');
const Event = require('../models/Event');
const { authMiddleware } = require('../middlewares/auth');
const { 
  canCreateFests, 
  canManageFests, 
} = require('../middlewares/rolePermissions');

// Create Fest (superadmin and admin can create festivals)
router.post('/', authMiddleware, canCreateFests, async (req, res) => {
  try {
    const festData = { ...req.body, createdBy: req.user.id };
    const fest = new Fest(festData);
    await fest.save();
    res.status(201).json(fest);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all Fests with optional filters: trending, upcoming
router.get('/', async (req, res) => {
  try {
    const { trending, upcoming } = req.query;
    let filter = {};
    if (trending === 'true') filter.trending = true;
    if (upcoming === 'true') filter.upcoming = true;
    const fests = await Fest.find(filter);
    res.json(fests);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get Fest by ID and populate events
router.get('/:id', async (req, res) => {
  try {
    const fest = await Fest.findById(req.params.id).populate('events');
    if (!fest) return res.status(404).json({ msg: 'Fest not found' });
    res.json(fest);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update Fest (superadmin, admin, and festival head can update)
router.put('/:id', authMiddleware, canManageFests, async (req, res) => {
  try {
    const fest = await Fest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fest) return res.status(404).json({ msg: 'Fest not found' });
    res.json(fest);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete Fest (superadmin and admin can delete)
router.delete('/:id', authMiddleware, canManageFests, async (req, res) => {
  try {
    const fest = await Fest.findByIdAndDelete(req.params.id);
    if (!fest) return res.status(404).json({ msg: 'Fest not found' });
    res.json({ msg: 'Fest deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Register for a fest
const Registration = require('../models/Registration');


// Get all events for a specific fest
router.get('/:festId/events', async (req, res) => {
  try {
    const events = await Event.find({ festId: req.params.festId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/fests/filters
router.get('/filters', async (req, res) => {
  try {
    const types = await Fest.distinct('type');
    const locations = await Fest.distinct('location');
    const prices = await Fest.find({}, { individualPrice: 1, teamPrice: 1, _id: 0 });
    const allPrices = prices.flatMap(p => [p.individualPrice, p.teamPrice].filter(Number.isFinite));
    const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;
    const dates = await Fest.find({}, { startDate: 1, endDate: 1, _id: 0 });
    const allDates = dates.flatMap(d => [d.startDate, d.endDate].filter(Boolean));
    const minDate = allDates.length ? new Date(Math.min(...allDates.map(d => new Date(d)))) : null;
    const maxDate = allDates.length ? new Date(Math.max(...allDates.map(d => new Date(d)))) : null;
    res.json({
      types,
      locations,
      price: { min: minPrice, max: maxPrice },
      date: { min: minDate, max: maxDate },
      ratings: [] // Placeholder
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 