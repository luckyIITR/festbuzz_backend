const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// Helper to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Signup successful }
 *       400: { description: User already exists }
 */
// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, mobile, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user = new User({ name, email, password: hashedPassword, mobile, role, otp, otpExpires, isVerified: false });
    await user.save();
    // Send OTP email
    await sendEmail(email, 'Festbuz OTP Verification', `Your OTP is: ${otp}`, `<p>Your OTP is: <b>${otp}</b></p>`);
    res.status(201).json({ msg: 'Signup successful. OTP sent to email.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });
    if (user.isVerified) return res.status(400).json({ msg: 'Already verified' });
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    // Sign in user after verification
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      msg: 'OTP verified. Account activated.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       400: { description: Invalid credentials }
 */
// Login (add isVerified check)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ msg: 'Account not verified. Please verify OTP.' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Google OAuth login/signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200: { description: Google login/signup successful }
 *       500: { description: Google OAuth error }
 */
// Google OAuth login/signup
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body; // Google ID token from frontend
    // TODO: Replace with actual Google token verification
    // For now, mock verification and user info extraction
    // In production, use: const ticket = await googleClient.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    // const payload = ticket.getPayload();
    // Mock payload:
    const payload = {
      sub: 'mock-google-id',
      email: 'mockuser@gmail.com',
      name: 'Mock User',
      picture: 'https://mockurl.com/avatar.png',
    };
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        googleEmail: payload.email,
        googleAvatar: payload.picture,
        isVerified: true,
        role: 'user',
      });
      await user.save();
    }
    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ msg: 'Google OAuth error' });
  }
});

// Middleware to verify JWT and attach user to req
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
 * /api/auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: User info }
 *       401: { description: Unauthorized }
 */
// Get current user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logged out }
 */
// Logout (for JWT, just instruct client to delete token)
router.post('/logout', (req, res) => {
  // No server-side action needed for JWT logout
  res.json({ msg: 'Logged out' });
});

/**
 * @swagger
 * /api/auth/users/{userId}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User profile }
 *       404: { description: User not found }
 */
// Get user profile by ID
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 