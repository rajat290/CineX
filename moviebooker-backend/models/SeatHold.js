const mongoose = require('mongoose');

const seatHoldSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true,
    index: true
  },
  seats: [{
    seatNumber: { type: String, required: true },
    seatType: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  status: {
    type: String,
    enum: ['active', 'converted', 'released', 'expired'],
    default: 'active',
    index: true
  },
  expiresAt: { type: Date, required: true, index: true },
  convertedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }
}, {
  timestamps: true
});

seatHoldSchema.index({ show: 1, status: 1, expiresAt: 1 });

module.exports = mongoose.model('SeatHold', seatHoldSchema);
