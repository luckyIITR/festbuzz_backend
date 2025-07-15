const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const { 
      name, 
      email, 
      password, 
      phone, 
      dateOfBirth, 
      gender, 
      college, 
      address, 
      role 
    } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    
    user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      phone, 
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender, 
      college, 
      address, 
      role, 
      otp, 
      otpExpires, 
      isVerified: false 
    });
    
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
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        college: user.college,
        address: user.address
      }
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
    // res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        college: user.college,
        address: user.address
      } 
    });
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
 *       400: { description: Invalid Google token }
 *       500: { description: Google OAuth error }
 */
// Google OAuth login/signup
router.post('/google', async (req, res) => {
  try {
    // console.log(req);
    const { accessToken } = req.body; // Google ID token from frontend
    
    if (!accessToken) {
      return res.status(400).json({ msg: 'Google accessToken is required' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: accessToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({ msg: 'Invalid Google accessToken' });
    }

    // Check if user exists by Google ID
    let user = await User.findOne({ googleId: payload.sub });
    
    if (!user) {
      // Check if user exists by email (for users who signed up with email but want to link Google)
      user = await User.findOne({ email: payload.email });
      
      if (user) {
        // Link existing account with Google
        user.googleId = payload.sub;
        user.googleEmail = payload.email;
        user.googleAvatar = payload.picture;
        await user.save();
      } else {
        // Create new user with Google info
        user = new User({
          name: payload.name,
          email: payload.email,
          googleId: payload.sub,
          googleEmail: payload.email,
          googleAvatar: payload.picture,
          isVerified: true, // Google accounts are pre-verified
          role: 'Participant', // Default role
        });
        await user.save();
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token: jwtToken, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        college: user.college,
        address: user.address,
        googleAvatar: user.googleAvatar 
      } 
    });
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(500).json({ msg: 'Google OAuth error' });
  }
});

// Middleware to verify JWT and attach user to req
const authMiddleware = (req, res, next) => {
  // console.log(`authMiddleware`);
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

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      dateOfBirth, 
      gender, 
      college, 
      address, 
      profilePhoto 
    } = req.body;
    
    // Validate gender if provided
    if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ 
        msg: 'Gender must be one of: Male, Female, Other' 
      });
    }
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Only update fields that are provided in the request
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender !== undefined) updateData.gender = gender;
    if (college !== undefined) updateData.college = college;
    if (address !== undefined) updateData.address = address;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    
    // Update user with only the provided fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      msg: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        college: updatedUser.college,
        address: updatedUser.address,
        profilePhoto: updatedUser.profilePhoto,
        googleAvatar: updatedUser.googleAvatar
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Unauthorized }
 */
// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
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