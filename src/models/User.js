const mongoose = require('mongoose');

// User roles for festival management system
const roles = ['superadmin', 'admin', 'participant', 'festival head', 'event manager', 'event coordinator', 'event volunteer'];

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
  role: { type: String, enum: roles, default: 'participant' },
  profileInfo: { type: profileInfoSchema }, // Optional
  // Personal Information
  phone: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  // Academic Information
  college: { type: String },
  // Location Information
  address: { type: String },
  // Wishlist and Recently Viewed Fests
  wishlistFests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fest' }],
  recentlyViewedFests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fest' }],
  // Google OAuth fields
  googleId: { type: String },
  googleEmail: { type: String },
  googleAvatar: { type: String },
  // Other fields
  profilePhoto: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 