const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  festId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fest', required: true },
  addedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add compound index for efficient queries and ensure uniqueness
wishlistSchema.index({ userId: 1, festId: 1 }, { unique: true });

// Add index for sorting by addedAt
wishlistSchema.index({ userId: 1, addedAt: -1 });

module.exports = mongoose.model('Wishlist', wishlistSchema); 