const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  festId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fest', required: true },
  viewedAt: { type: Date, default: Date.now },
  viewCount: { type: Number, default: 1 }
}, { timestamps: true });

// Add compound index for efficient queries
recentlyViewedSchema.index({ userId: 1, festId: 1 });

// Add index for sorting by viewedAt (most recent first)
recentlyViewedSchema.index({ userId: 1, viewedAt: -1 });

// Add index for viewCount queries
recentlyViewedSchema.index({ userId: 1, viewCount: -1 });

module.exports = mongoose.model('RecentlyViewed', recentlyViewedSchema); 