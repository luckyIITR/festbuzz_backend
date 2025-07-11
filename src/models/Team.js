const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  // Team name
  team_name: { type: String, required: true },
  // Event reference
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  // Team leader
  leader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Team members (array of user IDs)
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema); 