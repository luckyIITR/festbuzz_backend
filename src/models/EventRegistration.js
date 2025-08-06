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
  // Additional fields for better tracking
  registrationDate: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentAmount: { type: Number, default: 0 },
  // For team events - role in team
  teamRole: { type: String, enum: ['leader', 'member'], default: 'member' },
  // Additional metadata
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// Indexes for efficient queries
eventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
eventRegistrationSchema.index({ teamId: 1, eventId: 1 });
eventRegistrationSchema.index({ eventId: 1, status: 1 });
eventRegistrationSchema.index({ festRegistrationId: 1 });

// Validation middleware
eventRegistrationSchema.pre('save', function(next) {
  // Ensure either userId (solo) or teamId (team) is present, but not both
  if (this.type === 'solo' && !this.userId) {
    return next(new Error('Solo registration requires userId'));
  }
  if (this.type === 'team' && !this.teamId) {
    return next(new Error('Team registration requires teamId'));
  }
  if (this.type === 'solo' && this.teamId) {
    return next(new Error('Solo registration cannot have teamId'));
  }
  if (this.type === 'team' && this.userId) {
    return next(new Error('Team registration should not have userId directly'));
  }
  next();
});

// Virtual for registration type
eventRegistrationSchema.virtual('registrationType').get(function() {
  return this.type;
});

// Method to check if registration is active
eventRegistrationSchema.methods.isActive = function() {
  return this.status === 'confirmed' || this.status === 'pending';
};

// Method to cancel registration
eventRegistrationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Static method to get user's active registrations for an event
eventRegistrationSchema.statics.getUserActiveRegistration = function(userId, eventId) {
  return this.findOne({
    userId,
    eventId,
    status: { $in: ['pending', 'confirmed'] }
  });
};

// Static method to get team's active registrations for an event
eventRegistrationSchema.statics.getTeamActiveRegistration = function(teamId, eventId) {
  return this.findOne({
    teamId,
    eventId,
    status: { $in: ['pending', 'confirmed'] }
  });
};

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema); 