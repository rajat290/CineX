const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Show = require('../models/Show');
const Wallet = require('../models/Wallet');
const razorpay = require('../config/razorpay');
const { sendBookingConfirmation, sendPaymentFailedEmail } = require('../utils/emailService');
const { signTicketPayload } = require('../utils/ticketToken');

const finalizeConfirmedBooking = async (booking, userId) => {
  booking.paymentStatus = 'completed';
  booking.status = 'confirmed';
  booking.ticketToken = signTicketPayload({
    bookingId: booking._id.toString(),
    bookingCode: booking.bookingId,
    userId: booking.user.toString(),
    showId: booking.show.toString()
  });
  booking.qrCode = booking.ticketToken;
  await booking.save();

  if (booking.loyaltyPointsEarned > 0) {
    await Wallet.findOneAndUpdate(
      { user: userId || booking.user },
      {
        $inc: { loyaltyPoints: booking.loyaltyPointsEarned },
        $push: {
          transactions: {
            type: 'loyalty_credit',
            amount: 0,
            points: booking.loyaltyPointsEarned,
            reason: 'Booking reward',
            referenceType: 'booking',
            referenceId: booking._id
          }
        }
      },
      { upsert: true, new: true }
    );
  }
};

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { bookingId, paymentMethod = 'upi' } = req.body;

    // Validate bookingId format
    if (!bookingId || bookingId === 'BOOKING_ID_HERE') {
      return res.status(400).json({ 
        message: 'Invalid booking ID provided. Please provide a valid booking ID.',
        error: 'BOOKING_ID_PLACEHOLDER_USED'
      });
    }

    // Check if bookingId is a valid MongoDB ObjectId
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid booking ID format. Please provide a valid MongoDB ObjectId.',
        error: 'INVALID_BOOKING_ID_FORMAT'
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate('movie')
      .populate('theatre');
    
    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found',
        error: 'BOOKING_NOT_FOUND'
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    // Create Razorpay order
    const options = {
      amount: booking.finalAmount * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `receipt_${booking.bookingId}`,
      notes: {
        bookingId: booking.bookingId,
        movie: booking.movie.title,
        theatre: booking.theatre.name,
        showDate: booking.showDate.toISOString(),
        showTime: booking.showTime
      },
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpay.orders.create(options);

    // Update booking with Razorpay order ID
    booking.razorpayOrderId = order.id;
    await booking.save();

    // Create payment record
    const payment = new Payment({
      booking: booking._id,
      user: req.user._id,
      amount: booking.finalAmount,
      currency: 'INR',
      paymentMethod,
      orderId: order.id,
      status: 'created'
    });
    await payment.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        movie: booking.movie.title,
        theatre: booking.theatre.name,
        seats: booking.seats,
        finalAmount: booking.finalAmount
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: 'Order ID, payment ID and signature are required' });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update booking and payment status
    const booking = await Booking.findOne({ razorpayOrderId: orderId })
      .populate('movie')
      .populate('theatre');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.paymentStatus === 'completed') {
      return res.json({
        message: 'Payment verified successfully',
        booking: {
          id: booking._id,
          bookingId: booking.bookingId,
          status: booking.status,
          paymentStatus: booking.paymentStatus
        }
      });
    }

    // Confirm seat booking
    const show = await Show.findById(booking.show);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }
    const seatNumbers = booking.seats.map(seat => seat.seatNumber);
    show.bookSeats(seatNumbers);
    await show.save();

    booking.razorpayPaymentId = paymentId;
    booking.razorpaySignature = signature;
    await finalizeConfirmedBooking(booking, req.user._id);

    // Update payment record
    await Payment.findOneAndUpdate(
      { orderId },
      {
        paymentId,
        status: 'paid',
        gatewayResponse: req.body
      }
    );

    try {
      await sendBookingConfirmation(req.user, booking, show, booking.movie, booking.theatre);
    } catch (emailError) {
      console.error('Booking confirmation email failed:', emailError);
    }

    res.json({ 
      message: 'Payment verified successfully', 
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Razorpay webhook
const webhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // Verify webhook signature
    if (!webhookSecret) {
      return res.status(500).json({ message: 'Webhook secret is not configured' });
    }

    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    
    switch (event.event) {
      case 'payment.captured':
        // Payment successful
        await handleSuccessfulPayment(event);
        break;
      
      case 'payment.failed':
        // Payment failed
        await handleFailedPayment(event);
        break;
      
      case 'refund.processed':
        // Refund completed
        await handleRefund(event);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper functions for webhook
async function handleSuccessfulPayment(event) {
  const { order_id, payment_id } = event.payload.payment.entity;
  
  const booking = await Booking.findOne({ razorpayOrderId: order_id })
    .populate('user')
    .populate('movie')
    .populate('theatre');
  if (booking) {
    if (booking.paymentStatus === 'completed') {
      return;
    }

    const show = await Show.findById(booking.show);
    if (show) {
      const seatNumbers = booking.seats.map(seat => seat.seatNumber);
      show.bookSeats(seatNumbers);
      await show.save();
    }

    booking.razorpayPaymentId = payment_id;
    await finalizeConfirmedBooking(booking, booking.user._id);

    await Payment.findOneAndUpdate(
      { orderId: order_id },
      { paymentId: payment_id, status: 'paid', gatewayResponse: event.payload.payment.entity }
    );

    if (show) {
      try {
        await sendBookingConfirmation(booking.user, booking, show, booking.movie, booking.theatre);
      } catch (emailError) {
        console.error('Booking confirmation email failed:', emailError);
      }
    }
  }
}

async function handleFailedPayment(event) {
  const { order_id } = event.payload.payment.entity;
  
  const booking = await Booking.findOne({ razorpayOrderId: order_id })
    .populate('user')
    .populate('movie')
    .populate('theatre');
  if (booking) {
    booking.paymentStatus = 'failed';
    booking.status = 'cancelled';
    
    // Release seats
    const show = await Show.findById(booking.show);
    const seatNumbers = booking.seats.map(seat => seat.seatNumber);
    if (show) {
      show.releaseSeats(seatNumbers);
      await show.save();
    }
    await booking.save();

    // Send payment failed email
    await sendPaymentFailedEmail(
      booking.user,
      booking,
      booking.movie,
      booking.theatre
    );
  }
}

async function handleRefund(event) {
  // Handle refund logic here
  console.log('Refund processed:', event);
}

module.exports = {
  createOrder,
  verifyPayment,
  webhook,
  handleSuccessfulPayment,
  handleFailedPayment,
  handleRefund
};
