const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  title: { type: String, required: true },
  description: { type: String },
  discountType: { type: String, enum: ['flat', 'percentage'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscount: { type: Number },
  minAmount: { type: Number, default: 0 },
  categories: [{ type: String, enum: ['movie', 'event', 'play', 'sport', 'activity'] }],
  cities: [{ type: String }],
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number },
  perUserLimit: { type: Number, default: 1 },
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

offerSchema.methods.calculateDiscount = function(amount) {
  if (amount < this.minAmount) return 0;

  const discount = this.discountType === 'flat'
    ? this.discountValue
    : Math.round((amount * this.discountValue) / 100);

  return Math.min(discount, this.maxDiscount || discount, amount);
};

module.exports = mongoose.model('Offer', offerSchema);
