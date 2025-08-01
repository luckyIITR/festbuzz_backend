const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: String,
  image: String,
  title: String,
});

// The 'Date' type in Mongoose stores both date and time information (ISODate).
// So availableFrom and availableTill will contain both date and time.
const ticketSchema = new mongoose.Schema({
  name: String,
  feeType: String,
  price: Number,
  availableFrom: { type: Date }, // contains both date and time
  availableTill: { type: Date }, // contains both date and time

  //  deprecated fields
  availableTime: String,
  endTime: String,
});

const festSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  visibility: { type: String, default: 'public' },
  state: { type: String, required: true },
  city: { type: String, required: true },
  venue: { type: String, required: true },
  college: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  festMode: { type: String, required: true },
  rulebook: { type: String },
  instagram: { type: String },
  website: { type: String },
  about: { type: String },
  contact: { type: String },
  email: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Superadmin who created this fest
  isRegistrationOpen: { type: Boolean, default: true },
  logo: { type: String },
  heroImage: { type: String },
  organizerLogo: { type: String },
  bannerImage: { type: String },
  galleryImages: [{ type: String }],
  sponsors: [sponsorSchema],
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  tickets: [ticketSchema],
  


  // deprecated fields
  description: { type: String },
  organizer: { type: String },
  location: { type: String },
  price: { type: Number },
  theme: { type: String },
  eligibility: { type: String },
  specialAttractions: { type: String },
  perks: { type: String },
  categories: [{ type: String }],
  maxParticipants: { type: Number },
  isTeamRegistration: { type: Boolean, default: false },
  teamSize: { type: Number },
  rules: { type: String },
  prizes: { type: String },
  // Legacy fields for backward compatibility
  cover_image: { type: String },
  gallery_images: [{ type: String }],
  trending: { type: Boolean, default: false },
  upcoming: { type: Boolean, default: false },
  start_date: { type: Date },
  end_date: { type: Date },
  type: String,
  instagram: String,
  linkedin: String,
  youtube: String,
}, { timestamps: true });

module.exports = mongoose.model('Fest', festSchema); 