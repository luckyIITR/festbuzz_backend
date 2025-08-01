const mongoose = require('mongoose');

const festivalUserRoleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  festId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fest', required: true },
  role: { 
    type: String, 
    enum: ['admin', 'festival head', 'event manager', 'event coordinator', 'event volunteer'],
    required: true 
  },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  assignedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Optional expiration date
}, { timestamps: true });

// Compound index to ensure unique user-festival combinations
festivalUserRoleSchema.index({ userId: 1, festId: 1 }, { unique: true });

module.exports = mongoose.model('FestivalUserRole', festivalUserRoleSchema); 