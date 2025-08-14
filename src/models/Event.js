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
  mobile: String,
  email: String
}, { _id: true });

const rewardSchema = new mongoose.Schema({
  rank: { type: String, required: true }, // e.g., "1st", "2nd", "3rd", "Runner Up"
  cash: { type: Number, default: 0 }, // Cash prize amount
  coupon: { type: String, default: null }, // Coupon code or description
  goodies: { type: String, default: null }, // Goodies description
  description: { type: String }, // Additional description for this rank
}, { _id: true });

const ticketSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Ticket Name
  eventFeeType: { type: String, required: true }, // Event fee type (e.g., "Early Bird", "Regular", "VIP")
  price: { type: Number, required: true }, // Price
  availableFrom: { type: Date, required: true }, // Ticket available from
  availableTill: { type: Date, required: true }, // Ticket available till
  availableTime: { type: String, required: true }, // Ticket available time (e.g., "09:00 AM")
  endTime: { type: String, required: true }, // Ticket end time (e.g., "06:00 PM")
  maxQuantity: { type: Number }, // Maximum number of tickets available
  currentQuantity: { type: Number, default: 0 }, // Current number of tickets sold
  description: { type: String }, // Additional description for this ticket type
}, { _id: true });

const eventSchema = new mongoose.Schema({
  festId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fest', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  name: { type: String, required: true },
  type: { type: String, required: true },
  visibility: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  mode: { type: String, required: true },
  location: { type: String, required: true },
  venue: { type: String, required: true },
  rulebookLink: { type: String },
  description: { type: String },
  imageUrls: { type: [String] },
  rewards: [rewardSchema], // New structured rewards field
  tickets: [ticketSchema], // Ticket pricing structure
  isTeamEvent: { type: Boolean, default: false },
  teamSize: { type: Number },
  maxParticipants: { type: Number },
  sponsors: [sponsorSchema],
  judges: [judgeSchema],
  // Draft functionality
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  publishedAt: { type: Date },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  draftVersion: { type: Number, default: 1 },
  lastSavedAsDraft: { type: Date },
}, { timestamps: true });

eventSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
eventSchema.set('toJSON', { virtuals: true });

eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema); 