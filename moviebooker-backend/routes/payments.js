const express = require('express');
const { createOrder, verifyPayment, webhook } = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/payments/create-order - Create Razorpay order
router.post('/create-order', auth, createOrder);

// POST /api/payments/verify - Verify payment
router.post('/verify', auth, verifyPayment);

// POST /api/payments/webhook - Razorpay webhook
router.post('/webhook', webhook);

module.exports = router;
