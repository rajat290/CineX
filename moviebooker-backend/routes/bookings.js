const express = require('express');
const auth = require('../middleware/auth');
const { createBooking, getBookings, cancelBooking, downloadBookingPDF } = require('../controllers/bookingController');
const router = express.Router();

// POST /api/bookings - Create new booking
router.post('/', auth, createBooking);

// GET /api/bookings - Get user's bookings
router.get('/', auth, getBookings);

// PUT /api/bookings/:id/cancel - Cancel booking
router.put('/:id/cancel', auth, cancelBooking);

// GET /api/bookings/:id/download-pdf - Download booking ticket PDF
router.get('/:id/download-pdf', auth, downloadBookingPDF);

module.exports = router;
