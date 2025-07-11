const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: String,
  logo: String, // URL
  website: String,
}, { _id: true });

const judgeSchema = new mongoose.Schema({
  name: String,
  photo: String, // URL
  bio: String,
}, { _id: true });

const eventSchema = new mongoose.Schema({
  festId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fest', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
  location: { type: String },
  image: { type: String },
  bannerImage: { type: String },
  category: { type: String },
  maxParticipants: { type: Number },
  currentParticipants: { type: Number, default: 0 },
  isTeamEvent: { type: Boolean, default: false },
  teamSize: { type: Number },
  rules: { type: String },
  prizes: { type: String },
  organizer: { type: String },
  sponsors: [sponsorSchema],
  judges: [judgeSchema],
}, { timestamps: true });

eventSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
eventSchema.set('toJSON', { virtuals: true });

eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema); 