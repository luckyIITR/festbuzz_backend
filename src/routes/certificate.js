const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const { authMiddleware, permitRoles } = require('../middlewares/auth');
const { canSendCertificates } = require('../middlewares/rolePermissions');
const mongoose = require('mongoose');

/**
 * @swagger
 * /api/certificates/template:
 *   post:
 *     summary: Create or update certificate template for an event
 *     tags: [Certificates]
 *     responses:
 *       201: { description: Certificate template created/updated }
 */
// Create or update certificate template for an event
router.post('/template', authMiddleware, canSendCertificates, async (req, res) => {
  try {
    const { festId, eventId, logo1, logo2, name1, designation1, name2, designation2, template } = req.body;
    let cert = await Certificate.findOne({ festId, eventId });
    if (!cert) {
      cert = new Certificate({ festId, eventId, logo1, logo2, name1, designation1, name2, designation2, template });
    } else {
      cert.logo1 = logo1;
      cert.logo2 = logo2;
      cert.name1 = name1;
      cert.designation1 = designation1;
      cert.name2 = name2;
      cert.designation2 = designation2;
      cert.template = template;
    }
    await cert.save();
    res.status(201).json(cert);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/certificates/issue:
 *   post:
 *     summary: Assign winners and issue certificates
 *     tags: [Certificates]
 *     responses:
 *       200: { description: Certificates issued }
 */
// Assign winners and issue certificates
router.post('/issue', authMiddleware, canSendCertificates, async (req, res) => {
  try {
    const { festId, eventId, participants, winners } = req.body;
    let cert = await Certificate.findOne({ festId, eventId });
    if (!cert) return res.status(404).json({ msg: 'Certificate template not found' });
    cert.participants = participants;
    cert.winners = winners;
    cert.issuedAt = new Date();
    await cert.save();
    // Update event winners
    await Event.findByIdAndUpdate(eventId, { winners });
    res.json(cert);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/certificates/user/{eventId}:
 *   get:
 *     summary: Get certificate for a user in an event
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Certificate details }
 *       404: { description: Certificate not found }
 */
// Get certificate for a user in an event
router.get('/user/:eventId', authMiddleware, async (req, res) => {
  try {
    const cert = await Certificate.findOne({ eventId: req.params.eventId });
    if (!cert) return res.status(404).json({ msg: 'Certificate not found' });
    // Check if user is a participant or winner
    const isParticipant = cert.participants.some(id => id.toString() === req.user.id);
    const isWinner = cert.winners.some(id => id.toString() === req.user.id);
    if (!isParticipant && !isWinner) return res.status(403).json({ msg: 'Not authorized' });
    // Placeholder: return cert details (PDF/image generation can be added later)
    res.json({ cert, isWinner });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/certificates/my:
 *   get:
 *     summary: Get all certificates for a user
 *     tags: [Certificates]
 *     responses:
 *       200: { description: List of certificates }
 */
// Get all certificates for a user
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const certs = await Certificate.find({ $or: [ { participants: req.user.id }, { winners: req.user.id } ] });
    res.json(certs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 