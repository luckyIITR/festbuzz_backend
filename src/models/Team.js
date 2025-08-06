const mongoose = require('mongoose');
const crypto = require('crypto');

const teamSchema = new mongoose.Schema({
  // Team name
  team_name: { type: String, required: true },
  // Event reference
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  // Fest reference
  fest_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Fest', required: true },
  // Team leader
  leader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Team members (array of user IDs)
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Unique team code for joining
  team_code: { 
    type: String, 
    unique: true, 
    required: true,
    default: function() {
      return 'TEAM-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    }
  },
  // Team status
  status: { 
    type: String, 
    enum: ['active', 'full', 'disbanded'], 
    default: 'active' 
  },
  // Maximum team size (from event)
  max_size: { type: Number, required: true },
  // Team description
  description: { type: String },
  // Team avatar/logo
  avatar: { type: String },
  // Team creation reason/notes
  notes: { type: String },
}, { timestamps: true });

// Index for efficient queries
teamSchema.index({ event_id: 1, status: 1 });
teamSchema.index({ team_code: 1 });
teamSchema.index({ leader_id: 1 });
teamSchema.index({ members: 1 });

// Virtual for current team size
teamSchema.virtual('current_size').get(function() {
  return this.members.length;
});

// Virtual for available slots
teamSchema.virtual('available_slots').get(function() {
  return this.max_size - this.members.length;
});

// Method to check if team is full
teamSchema.methods.isFull = function() {
  return this.members.length >= this.max_size;
};

// Method to check if user is in team
teamSchema.methods.hasMember = function(userId) {
  return this.members.some(member => member.toString() === userId.toString());
};

// Method to add member
teamSchema.methods.addMember = function(userId) {
  if (this.isFull()) {
    throw new Error('Team is full');
  }
  if (this.hasMember(userId)) {
    throw new Error('User is already in team');
  }
  this.members.push(userId);
  if (this.isFull()) {
    this.status = 'full';
  }
  return this.save();
};

// Method to remove member
teamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.toString() !== userId.toString());
  if (this.status === 'full') {
    this.status = 'active';
  }
  return this.save();
};

// Pre-save middleware to ensure leader is in members
teamSchema.pre('save', function(next) {
  if (this.leader_id && !this.members.includes(this.leader_id)) {
    this.members.push(this.leader_id);
  }
  next();
});

// Ensure team_code is unique
teamSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('team_code')) {
    const existingTeam = await this.constructor.findOne({ team_code: this.team_code });
    if (existingTeam && existingTeam._id.toString() !== this._id.toString()) {
      this.team_code = 'TEAM-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    }
  }
  next();
});

module.exports = mongoose.model('Team', teamSchema); 