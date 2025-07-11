const express = require('express');
const router = express.Router();
const FestRegistration = require('../models/FestRegistration');
const EventRegistration = require('../models/EventRegistration');
const Team = require('../models/Team');
const { verifyToken } = require('../middlewares/auth');
const mongoose = require('mongoose');
const QRCode = require('qrcode');

// Helper to generate QR code data URL
async function generateQRCode(text) {
  return await QRCode.toDataURL(text);
}

// Register for a fest (solo)
router.post('/fest', verifyToken, async (req, res) => {
  try {
    const { festId, answers } = req.body;
    // Prevent duplicate registration
    const existing = await FestRegistration.findOne({ userId: req.user.id, festId });
    if (existing) return res.status(400).json({ msg: 'Already registered for this fest' });
    const ticketCode = `TICKET-${new mongoose.Types.ObjectId()}`;
    const qrCode = await generateQRCode(ticketCode);
    const festReg = new FestRegistration({
      userId: req.user.id,
      festId,
      answers,
      status: 'confirmed',
      ticket: ticketCode,
      qrCode,
    });
    await festReg.save();
    res.status(201).json(festReg);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Register for an event (solo)
router.post('/event/solo', verifyToken, async (req, res) => {
  try {
    const { festId, eventId, answers } = req.body;
    // Check fest registration
    const festReg = await FestRegistration.findOne({ userId: req.user.id, festId });
    if (!festReg) return res.status(400).json({ msg: 'Register for the fest first' });
    // Prevent duplicate event registration
    const existing = await EventRegistration.findOne({ userId: req.user.id, eventId });
    if (existing) return res.status(400).json({ msg: 'Already registered for this event' });
    const ticketCode = `TICKET-${new mongoose.Types.ObjectId()}`;
    const qrCode = await generateQRCode(ticketCode);
    const eventReg = new EventRegistration({
      userId: req.user.id,
      eventId,
      festRegistrationId: festReg._id,
      answers,
      status: 'confirmed',
      ticket: ticketCode,
      qrCode,
      type: 'solo',
    });
    await eventReg.save();
    res.status(201).json(eventReg);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Register for an event (team)
router.post('/event/team', verifyToken, async (req, res) => {
  try {
    const { festId, eventId, teamName, passcode, memberIds, answers } = req.body;
    // Check fest registration for all members
    const festRegs = await FestRegistration.find({ userId: { $in: memberIds }, festId });
    if (festRegs.length !== memberIds.length) {
      return res.status(400).json({ msg: 'All team members must register for the fest first' });
    }
    // Create team
    const team = new Team({
      teamName,
      passcode,
      members: memberIds,
      eventId,
      festId,
      createdBy: req.user.id,
    });
    await team.save();
    // Register each member for the event
    const registrations = await Promise.all(memberIds.map(async (userId) => {
      // Prevent duplicate event registration
      const existing = await EventRegistration.findOne({ userId, eventId });
      if (existing) return existing;
      const festReg = festRegs.find(fr => fr.userId.toString() === userId);
      const ticketCode = `TICKET-${new mongoose.Types.ObjectId()}`;
      const qrCode = await generateQRCode(ticketCode);
      const reg = new EventRegistration({
        userId,
        teamId: team._id,
        eventId,
        festRegistrationId: festReg._id,
        answers,
        status: 'confirmed',
        ticket: ticketCode,
        qrCode,
        type: 'team',
      });
      await reg.save();
      return reg;
    }));
    res.status(201).json({ team, registrations });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get my fest registrations
router.get('/fest/me', verifyToken, async (req, res) => {
  try {
    const regs = await FestRegistration.find({ userId: req.user.id });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get my event registrations
router.get('/event/me', verifyToken, async (req, res) => {
  try {
    const regs = await EventRegistration.find({ userId: req.user.id });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get QR code for a fest registration
router.get('/fest/qrcode/:id', verifyToken, async (req, res) => {
  try {
    const reg = await FestRegistration.findById(req.params.id);
    if (!reg || reg.userId.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Registration not found' });
    }
    res.json({ qrCode: reg.qrCode });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get QR code for an event registration
router.get('/event/qrcode/:id', verifyToken, async (req, res) => {
  try {
    const reg = await EventRegistration.findById(req.params.id);
    if (!reg || reg.userId.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Registration not found' });
    }
    res.json({ qrCode: reg.qrCode });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 