const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for solo
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // for team
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  festRegistrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'FestRegistration', required: true },
  answers: [String],
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
  ticket: { type: String },
  qrCode: { type: String },
  type: { type: String, enum: ['solo', 'team'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema); 