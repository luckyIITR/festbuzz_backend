const express = require('express');
const router = express.Router();
const Fest = require('../models/Fest');
const Event = require('../models/Event');
const { verifyToken, permitRoles } = require('../middlewares/auth');

/**
 * @swagger
 * /api/fests:
 *   get:
 *     summary: List all fests (with optional trending/upcoming filters)
 *     tags: [Fests]
 *     parameters:
 *       - in: query
 *         name: trending
 *         schema: { type: boolean }
 *       - in: query
 *         name: upcoming
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: List of fests }
 */
// Create Fest
router.post('/', verifyToken, permitRoles('Admin', 'FestivalHead'), async (req, res) => {
  try {
    const fest = new Fest(req.body);
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

/**
 * @swagger
 * /api/fests/{id}:
 *   get:
 *     summary: Get single fest details (with events)
 *     tags: [Fests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Fest details }
 *       404: { description: Fest not found }
 */
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

// Update Fest
router.put('/:id', verifyToken, permitRoles('Admin', 'FestivalHead'), async (req, res) => {
  try {
    const fest = await Fest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fest) return res.status(404).json({ msg: 'Fest not found' });
    res.json(fest);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete Fest
router.delete('/:id', verifyToken, permitRoles('Admin', 'FestivalHead'), async (req, res) => {
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
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

/**
 * @swagger
 * /api/fests/{festId}/register:
 *   post:
 *     summary: Register for a fest
 *     tags: [Fests]
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Registration successful }
 *       400: { description: Already registered }
 */
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

/**
 * @swagger
 * /api/fests/{festId}/events:
 *   get:
 *     summary: Get all events for a specific fest
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of events }
 */
// Get all events for a specific fest
router.get('/:festId/events', async (req, res) => {
  try {
    const events = await Event.find({ festId: req.params.festId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/fests/{festId}/events/{eventId}:
 *   get:
 *     summary: Get specific event details
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event details }
 *       404: { description: Event not found }
 */
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

/**
 * @swagger
 * /api/fests/{festId}/events:
 *   post:
 *     summary: Create new event (requires authentication)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *               location: { type: string }
 *               category: { type: string }
 *               maxParticipants: { type: number }
 *               isTeamEvent: { type: boolean }
 *               teamSize: { type: number }
 *               rules: { type: string }
 *               prizes: { type: string }
 *               image: { type: string }
 *               bannerImage: { type: string }
 *     responses:
 *       201: { description: Event created }
 *       400: { description: Invalid data }
 */
// Create new event
router.post('/:festId/events', verifyToken, permitRoles('Admin', 'FestivalHead', 'EventManager'), async (req, res) => {
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

/**
 * @swagger
 * /api/fests/{festId}/events/{eventId}:
 *   put:
 *     summary: Update event (requires authentication)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event updated }
 *       404: { description: Event not found }
 */
// Update event
router.put('/:festId/events/:eventId', verifyToken, permitRoles('Admin', 'FestivalHead', 'EventManager'), async (req, res) => {
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

/**
 * @swagger
 * /api/fests/{festId}/events/{eventId}:
 *   delete:
 *     summary: Delete event (requires authentication)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event deleted }
 *       404: { description: Event not found }
 */
// Delete event
router.delete('/:festId/events/:eventId', verifyToken, permitRoles('Admin', 'FestivalHead', 'EventManager'), async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.eventId, festId: req.params.festId });
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json({ msg: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/sponsors:
 *   get:
 *     summary: List sponsors (global)
 *     tags: [Misc]
 *     responses:
 *       200: { description: List of sponsors }
 */
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

module.exports = router; 