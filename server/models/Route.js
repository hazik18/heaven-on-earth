const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['highway', 'lake_valley', 'offbeat'],
    default: 'highway'
  },
  from_location: { type: String, required: true, trim: true },
  to_location: { type: String, required: true, trim: true },
  approx_distance: { type: String, required: true, trim: true },
  approx_duration: { type: String, required: true, trim: true },
  approx_cost: { type: String, default: 'approx. ₹12,000–25,000' },
  mode: { type: String, required: true, default: 'Car / Bike / 4x4' },
  key_passes: [{
    name: { type: String, required: true },
    altitude: { type: String, required: true }
  }],
  permits_required: {
    type: mongoose.Schema.Types.Mixed,
    default: false
  },
  permit_details: {
    indian: {
      type: String,
      default: 'Environment Development Fee (EDF) online via lahdclehpermit.in (approx. ₹400–600 per person).'
    },
    foreigner: {
      type: String,
      default: 'Protected Area Permit (PAP) required; must be booked via a registered local operator like Kashmir Offbeat.'
    }
  },
  best_season: { type: String, required: true },
  highlights: [{ type: String }],
  itinerary_summary: { type: String, required: true },
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    distance: String,
    altitude: String,
    duration: String
  }],
  images: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      return ret;
    }
  }
});

routeSchema.index({ slug: 1 });
routeSchema.index({ category: 1, isActive: 1 });
routeSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Route', routeSchema);

