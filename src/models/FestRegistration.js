const mongoose = require('mongoose');

const festRegistrationSchema = new mongoose.Schema({
  festId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fest', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  answers: [String],
  ticket: String,
  qrCode: String,
  status: String,
}, { timestamps: true });

module.exports = mongoose.model('FestRegistration', festRegistrationSchema); 