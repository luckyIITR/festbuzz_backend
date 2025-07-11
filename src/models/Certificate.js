const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  festId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fest', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  logo1: String,
  logo2: String,
  name1: String,
  designation1: String,
  name2: String,
  designation2: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  template: String, // template file or type
  issuedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema); 