const express = require('express');
const router = express.Router({ mergeParams: true });
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Team = require('../models/Team');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { verifyToken, permitRoles } = require('../middlewares/auth');

// Auth middleware (reuse from auth.js if possible)
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

// Create Event
router.post('/', verifyToken, permitRoles('Admin', 'FestivalHead', 'EventManager'), async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all Events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get Event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update Event
router.put('/:id', verifyToken, permitRoles('FestivalHead', 'EventManager'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete Event
router.delete('/:id', verifyToken, permitRoles('FestivalHead', 'EventManager'), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json({ msg: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add judge to event
router.post('/:id/judges', verifyToken, permitRoles('FestivalHead', 'EventManager'), async (req, res) => {
  try {
    const { name, mobile, about, email, photo } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    event.judges.push({ name, mobile, about, email, photo });
    await event.save();
    res.json(event.judges);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Remove judge from event
router.delete('/:id/judges/:judgeIndex', verifyToken, permitRoles('FestivalHead', 'EventManager'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    event.judges.splice(req.params.judgeIndex, 1);
    await event.save();
    res.json(event.judges);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// List judges for event
router.get('/:id/judges', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event.judges);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Assign event role
router.post('/:id/roles', verifyToken, permitRoles('FestivalHead', 'EventManager'), async (req, res) => {
  try {
    const { type, name, email } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    event.roles.push({ type, name, email });
    await event.save();
    res.json(event.roles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Remove event role
router.delete('/:id/roles/:roleIndex', verifyToken, permitRoles('FestivalHead', 'EventManager'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    event.roles.splice(req.params.roleIndex, 1);
    await event.save();
    res.json(event.roles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// List event roles
router.get('/:id/roles', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event.roles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/fests/{festId}/events:
 *   get:
 *     summary: List all events for a fest
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of events }
 */
// List all events for a fest
router.get('/fests/:festId/events', async (req, res) => {
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
 *     summary: Get single event details
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
// Get single event details
router.get('/fests/:festId/events/:eventId', async (req, res) => {
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
 * /api/fests/{festId}/events/{eventId}/register:
 *   post:
 *     summary: Register for an event (individual/team)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registration_mode: { type: string, enum: [individual, team] }
 *               team_id: { type: string }
 *               team_name: { type: string }
 *               member_ids: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Registration successful }
 *       400: { description: Already registered }
 */
// Register for an event (individual or team)
router.post('/fests/:festId/events/:eventId/register', authMiddleware, async (req, res) => {
  try {
    const { registration_mode, team_id, team_name, member_ids } = req.body;
    const userId = req.user.id;
    if (registration_mode === 'team') {
      // Team registration
      if (!team_id && (!team_name || !Array.isArray(member_ids) || member_ids.length === 0)) {
        return res.status(400).json({ msg: 'Team info required' });
      }
      let team;
      if (team_id) {
        team = await Team.findById(team_id);
        if (!team) return res.status(404).json({ msg: 'Team not found' });
      } else {
        team = new Team({
          team_name,
          event_id: req.params.eventId,
          leader_id: userId,
          members: member_ids,
        });
        await team.save();
      }
      // Register all team members
      const registrations = await Promise.all(team.members.map(async (memberId) => {
        const existing = await Registration.findOne({ user_id: memberId, event_id: req.params.eventId, festId: req.params.festId, type: 'event' });
        if (existing) return existing;
        const reg = new Registration({
          user_id: memberId,
          event_id: req.params.eventId,
          festId: req.params.festId,
          type: 'event',
          registration_mode: 'team',
          team_id: team._id,
          team_leader_id: team.leader_id,
          team_members: team.members,
          status: 'pending',
        });
        await reg.save();
        return reg;
      }));
      res.status(201).json({ team, registrations });
    } else {
      // Individual registration
      const existing = await Registration.findOne({ user_id: userId, event_id: req.params.eventId, festId: req.params.festId, type: 'event' });
      if (existing) return res.status(400).json({ msg: 'Already registered for this event' });
      const reg = new Registration({
        user_id: userId,
        event_id: req.params.eventId,
        festId: req.params.festId,
        type: 'event',
        registration_mode: 'individual',
        status: 'pending',
      });
      await reg.save();
      res.status(201).json(reg);
    }
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/fests/{festId}/events/{eventId}/register/team:
 *   post:
 *     summary: Register a team for an event
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team_name: { type: string }
 *               member_ids: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Team registration successful }
 */
// Register a team for an event
router.post('/fests/:festId/events/:eventId/register/team', authMiddleware, async (req, res) => {
  try {
    const { team_name, member_ids } = req.body;
    const userId = req.user.id;
    if (!team_name || !Array.isArray(member_ids) || member_ids.length === 0) {
      return res.status(400).json({ msg: 'Team info required' });
    }
    const team = new Team({
      team_name,
      event_id: req.params.eventId,
      leader_id: userId,
      members: member_ids,
    });
    await team.save();
    // Register all team members
    const registrations = await Promise.all(member_ids.map(async (memberId) => {
      const existing = await Registration.findOne({ user_id: memberId, event_id: req.params.eventId, festId: req.params.festId, type: 'event' });
      if (existing) return existing;
      const reg = new Registration({
        user_id: memberId,
        event_id: req.params.eventId,
        festId: req.params.festId,
        type: 'event',
        registration_mode: 'team',
        team_id: team._id,
        team_leader_id: userId,
        team_members: member_ids,
        status: 'pending',
      });
      await reg.save();
      return reg;
    }));
    res.status(201).json({ team, registrations });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/fests/{festId}/events/{eventId}/register/individual:
 *   post:
 *     summary: Register individually for an event
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
 *       201: { description: Registration successful }
 *       400: { description: Already registered }
 */
// Register individually for an event
router.post('/fests/:festId/events/:eventId/register/individual', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const existing = await Registration.findOne({ user_id: userId, event_id: req.params.eventId, festId: req.params.festId, type: 'event' });
    if (existing) return res.status(400).json({ msg: 'Already registered for this event' });
    const reg = new Registration({
      user_id: userId,
      event_id: req.params.eventId,
      festId: req.params.festId,
      type: 'event',
      registration_mode: 'individual',
      status: 'pending',
    });
    await reg.save();
    res.status(201).json(reg);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/judges:
 *   get:
 *     summary: List judges (global)
 *     tags: [Misc]
 *     responses:
 *       200: { description: List of judges }
 */
// List all judges globally
router.get('/api/judges', async (req, res) => {
  try {
    const events = await Event.find({}, 'judges');
    const judges = events.flatMap(event => event.judges || []);
    res.json(judges);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 