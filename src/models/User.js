const mongoose = require('mongoose');

// Only user/admin roles as per requirements
const roles = ['user', 'admin'];

// Optional profile info subdocument
const profileInfoSchema = new mongoose.Schema({
  bio: { type: String },
  avatar: { type: String },
  // Add more profile fields as needed
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Not required for OAuth users
  role: { type: String, enum: roles, default: 'user' },
  profileInfo: { type: profileInfoSchema }, // Optional
  // Google OAuth fields
  googleId: { type: String },
  googleEmail: { type: String },
  googleAvatar: { type: String },
  // Other fields
  mobile: { type: String },
  profilePhoto: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 