const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: String,
  image: String,
  title: String,
});

const ticketSchema = new mongoose.Schema({
  name: String,
  feeType: String,
  price: Number,
  availableFrom: Date,
  availableTill: Date,
  availableTime: String,
  endTime: String,
});

const festSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  organizer: { type: String },
  location: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  price: { type: Number },
  theme: { type: String },
  eligibility: { type: String },
  specialAttractions: { type: String },
  perks: { type: String },
  categories: [{ type: String }],
  maxParticipants: { type: Number },
  isRegistrationOpen: { type: Boolean, default: true },
  isTeamRegistration: { type: Boolean, default: false },
  teamSize: { type: Number },
  rules: { type: String },
  prizes: { type: String },
  logo: { type: String },
  organizerLogo: { type: String },
  heroImage: { type: String },
  bannerImage: { type: String },
  galleryImages: [{ type: String }],
  // Legacy fields for backward compatibility
  cover_image: { type: String },
  gallery_images: [{ type: String }],
  sponsors: [sponsorSchema],
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  trending: { type: Boolean, default: false },
  upcoming: { type: Boolean, default: false },
  start_date: { type: Date },
  end_date: { type: Date },
  type: String,
  visibility: { type: String, default: 'public' },
  website: String,
  venue: String,
  state: String,
  city: String,
  college: String,
  instagram: String,
  linkedin: String,
  youtube: String,
  tickets: [ticketSchema],
}, { timestamps: true });

module.exports = mongoose.model('Fest', festSchema); 