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
  

}, { timestamps: true });

module.exports = mongoose.model('Fest', festSchema); 