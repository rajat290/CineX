const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  transactions: [{
    type: {
      type: String,
      enum: ['credit', 'debit', 'loyalty_credit', 'loyalty_debit', 'refund', 'cashback'],
      required: true
    },
    amount: { type: Number, required: true },
    points: { type: Number, default: 0 },
    reason: { type: String },
    referenceType: { type: String, enum: ['booking', 'offer', 'refund', 'manual'] },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Wallet', walletSchema);
