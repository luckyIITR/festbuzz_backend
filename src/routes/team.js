const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team_name: { type: string }
 *               event_id: { type: string }
 *               member_ids: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Team created }
 */
// Create a team
router.post('/api/teams', authMiddleware, async (req, res) => {
  try {
    const { team_name, event_id, member_ids } = req.body;
    const leader_id = req.user.id;
    if (!team_name || !event_id || !Array.isArray(member_ids) || member_ids.length === 0) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }
    const team = new Team({
      team_name,
      event_id,
      leader_id,
      members: member_ids,
    });
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/teams/{teamId}:
 *   get:
 *     summary: Get team details
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Team details }
 *       404: { description: Team not found }
 */
// Get team details
router.get('/api/teams/:teamId', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId).populate('members leader_id event_id');
    if (!team) return res.status(404).json({ msg: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/teams/{teamId}/add-member:
 *   post:
 *     summary: Add member to team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id: { type: string }
 *     responses:
 *       200: { description: Member added }
 *       400: { description: User already in team }
 *       404: { description: Team not found }
 */
// Add member to team
router.post('/api/teams/:teamId/add-member', authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.body;
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ msg: 'Team not found' });
    if (!user_id) return res.status(400).json({ msg: 'user_id required' });
    if (team.members.includes(user_id)) {
      return res.status(400).json({ msg: 'User already in team' });
    }
    team.members.push(user_id);
    await team.save();
    res.json(team);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 