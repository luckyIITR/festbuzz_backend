const express = require('express');
const router = express.Router();
const Fest = require('../models/Fest');
const Event = require('../models/Event');
const { authMiddleware, permitRoles } = require('../middlewares/auth');

// Create Fest (only superadmin can create festivals)
router.post('/', authMiddleware, permitRoles('superadmin','admin'), async (req, res) => {
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
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update Fest (only superadmin or festival admin can update)
router.put('/:id', authMiddleware, permitRoles('superadmin', 'admin'), async (req, res) => {
  try {
    const fest = await Fest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fest) return res.status(404).json({ msg: 'Fest not found' });
    res.json(fest);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete Fest (only superadmin can delete)
router.delete('/:id', authMiddleware, permitRoles('superadmin', 'admin'), async (req, res) => {
  try {
    const fest = await Fest.findByIdAndDelete(req.params.id);
    if (!fest) return res.status(404).json({ msg: 'Fest not found' });
    res.json({ msg: 'Fest deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Register for a fest
const jwt = require('jsonwebtoken');
const Registration = require('../models/Registration');
const User = require('../models/User');

router.post('/:festId/register', authMiddleware, async (req, res) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;
    // Prevent duplicate registration
    const existing = await Registration.findOne({ user_id: userId, fest_id: festId, type: 'fest' });
    if (existing) return res.status(400).json({ msg: 'Already registered for this fest' });
    const registration = new Registration({
      user_id: userId,
      fest_id: festId,
      type: 'fest',
      registration_mode: 'individual',
      status: 'pending',
    });
    await registration.save();
    res.status(201).json(registration);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all events for a specific fest
router.get('/:festId/events', async (req, res) => {
  try {
    const events = await Event.find({ festId: req.params.festId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get specific event details
router.get('/:festId/events/:eventId', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId, festId: req.params.festId });
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create new event
router.post('/:festId/events', authMiddleware, permitRoles('Admin', 'FestivalHead', 'EventManager'), async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      festId: req.params.festId
    };
    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update event
router.put('/:festId/events/:eventId', authMiddleware, permitRoles('Admin', 'FestivalHead', 'EventManager'), async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.eventId, festId: req.params.festId },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete event
router.delete('/:festId/events/:eventId', authMiddleware, permitRoles('Admin', 'FestivalHead', 'EventManager'), async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.eventId, festId: req.params.festId });
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json({ msg: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// List all sponsors globally
router.get('/api/sponsors', async (req, res) => {
  try {
    const fests = await Fest.find({}, 'sponsors');
    const sponsors = fests.flatMap(fest => fest.sponsors || []);
    res.json(sponsors);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get sponsors for an event
router.get('/:festId/events/:eventId/sponsors', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId, festId: req.params.festId });
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event.sponsors || []);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get judges for an event
router.get('/:festId/events/:eventId/judges', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId, festId: req.params.festId });
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event.judges || []);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Register individual for event
router.post('/:festId/events/:eventId/register/individual', authMiddleware, async (req, res) => {
  try {
    const { festId, eventId } = req.params;
    const userId = req.user.id;
    // Prevent duplicate registration
    const existing = await Registration.findOne({ user_id: userId, event_id: eventId, festId, type: 'event', registration_mode: 'individual' });
    if (existing) return res.status(400).json({ msg: 'Already registered for this event' });
    const registration = new Registration({
      user_id: userId,
      event_id: eventId,
      festId,
      type: 'event',
      registration_mode: 'individual',
      status: 'pending',
    });
    await registration.save();
    res.status(201).json(registration);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Register team for event
router.post('/:festId/events/:eventId/register/team', authMiddleware, async (req, res) => {
  try {
    const { festId, eventId } = req.params;
    const { team_id } = req.body;
    const userId = req.user.id;
    if (!team_id) return res.status(400).json({ msg: 'team_id is required' });
    // Prevent duplicate registration
    const existing = await Registration.findOne({ team_id, event_id: eventId, festId, type: 'event', registration_mode: 'team' });
    if (existing) return res.status(400).json({ msg: 'Team already registered for this event' });
    const registration = new Registration({
      team_id,
      event_id: eventId,
      festId,
      user_id: userId, // the user who is registering the team
      type: 'event',
      registration_mode: 'team',
      status: 'pending',
    });
    await registration.save();
    res.status(201).json(registration);
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