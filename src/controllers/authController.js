const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const { AppError } = require('../middlewares/errorHandler');
const { successResponse } = require('../utils/response');
const logger = require('../utils/logger');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
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
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User already exists', 400, 'USER_EXISTS', [
        { field: 'email', message: 'This email is already registered' }
      ]));
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Create user
    const user = new User({ 
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
    await sendEmail(
      email, 
      'Festbuz OTP Verification', 
      `Your OTP is: ${otp}`, 
      `<p>Your OTP is: <b>${otp}</b></p>`
    );
    
    logger.info(`New user registered: ${email}`);
    
    return successResponse(res, 201, 'Signup successful. OTP sent to email.');
  } catch (error) {
    logger.error('Signup error:', error);
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }
    
    if (user.isVerified) {
      return next(new AppError('Already verified', 400, 'ALREADY_VERIFIED'));
    }
    
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return next(new AppError('Invalid or expired OTP', 400, 'INVALID_OTP', [
        { field: 'otp', message: 'Invalid or expired OTP' }
      ]));
    }
    
    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    logger.info(`User verified: ${email}`);
    
    return successResponse(res, 200, 'OTP verified. Account activated.', {
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
  } catch (error) {
    logger.error('OTP verification error:', error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const user = await User.findOne({ email });
    // console.log(user);
    if (!user) {
      return next(new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS'));
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return next(new AppError('Please verify your email first', 401, 'EMAIL_NOT_VERIFIED'));
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS'));
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    logger.info(`User logged in: ${email}`);
    
    return successResponse(res, 200, 'Login successful', {
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
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { accessToken } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: accessToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const { name, email, picture } = ticket.getPayload();
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        googleId: ticket.getPayload().sub,
        isVerified: true,
        profilePicture: picture
      });
      await user.save();
      logger.info(`New Google user created: ${email}`);
    }
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    logger.info(`Google user logged in: ${email}`);
    
    return successResponse(res, 200, 'Google login successful', {
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
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    logger.error('Google login error:', error);
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }
    
    return successResponse(res, 200, 'User profile retrieved successfully', {
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      college: user.college,
      address: user.address,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    logger.error('Get me error:', error);
    next(error);
  }
};


// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    
    // Send reset email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    await sendEmail(
      email,
      'Password Reset Request',
      `Reset your password: ${resetUrl}`,
      `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    );
    
    logger.info(`Password reset requested for: ${email}`);
    
    return successResponse(res, 200, 'Password reset email sent');
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
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
    
    return successResponse(res, 200, 'Profile updated successfully', {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        college: updatedUser.college,
        address: updatedUser.address,
        profilePhoto: updatedUser.profilePhoto
    });
  } catch (err) {
    console.error('Profile update error:', err);
    next(err);
  }
};

module.exports = {
  signup,
  verifyOTP,
  login,
  googleLogin,
  getMe,
  forgotPassword,
  updateProfile
};
