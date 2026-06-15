const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, trim: true, unique: true, sparse: true },
  type: {
    type: String,
    enum: ['event', 'play', 'sport', 'activity'],
    required: true
  },
  description: { type: String, required: true },
  city: { type: String, required: true, index: true },
  venue: {
    name: { type: String, required: true },
    area: { type: String },
    address: { type: String },
    coordinates: { type: [Number] }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  startTime: { type: String, required: true },
  language: { type: String },
  categories: [{ type: String }],
  tags: [{ type: String }],
  artists: [{
    name: { type: String, required: true },
    role: { type: String },
    image: { type: String }
  }],
  images: {
    poster: { type: String },
    banner: { type: String }
  },
  pricing: {
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number },
    currency: { type: String, default: 'INR' }
  },
  inventory: {
    totalCapacity: { type: Number, default: 0 },
    bookedCount: { type: Number, default: 0 },
    holdCount: { type: Number, default: 0 }
  },
  stats: {
    views: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'sold_out', 'cancelled', 'completed'],
    default: 'published',
    index: true
  },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

experienceSchema.index({ title: 'text', description: 'text', tags: 'text', categories: 'text' });
experienceSchema.index({ type: 1, city: 1, startDate: 1, status: 1 });
experienceSchema.index({ 'stats.trendingScore': -1, startDate: 1 });

module.exports = mongoose.model('Experience', experienceSchema);
