const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { 
    type: String, 
    unique: true, 
    required: true 
  }, // Custom ID: CINEX001
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  show: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Show', 
    required: true 
  },
  movie: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie', 
    required: true 
  },
  theatre: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Theatre', 
    required: true 
  },
  seats: [{
    seatNumber: { type: String, required: true },
    seatType: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  seatHold: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SeatHold'
  },
  bookingType: {
    type: String,
    enum: ['movie', 'event', 'play', 'sport', 'activity'],
    default: 'movie'
  },
  totalAmount: { type: Number, required: true },
  convenienceFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  offerCode: { type: String },
  loyaltyPointsEarned: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  showDate: { type: Date, required: true },
  showTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'expired'], 
    default: 'pending' 
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  ticketToken: { type: String },
  qrCode: { type: String }, // QR code/token for ticket validation
  checkIn: {
    status: {
      type: String,
      enum: ['not_checked_in', 'checked_in'],
      default: 'not_checked_in'
    },
    checkedInAt: { type: Date },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  cancellationReason: { type: String },
  refundAmount: { type: Number }
}, {
  timestamps: true
});

// Booking ID is generated explicitly in the controller

module.exports = mongoose.model('Booking', bookingSchema);
