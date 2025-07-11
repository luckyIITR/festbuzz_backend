const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  festId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fest' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  type: String,
  registration_mode: String,
  status: String,
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema); 