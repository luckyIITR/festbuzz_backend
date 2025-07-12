const mongoose = require('mongoose');

const festRegistrationSchema = new mongoose.Schema({
  festId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fest', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Personal Information
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  // Location Information
  city: { type: String, required: true },
  state: { type: String, required: true },
  // Academic Information
  instituteName: { type: String, required: true },
  // Registration Details
  answers: [String],
  ticket: String,
  qrCode: String,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('FestRegistration', festRegistrationSchema); 