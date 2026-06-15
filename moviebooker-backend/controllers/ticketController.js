const Booking = require('../models/Booking');
const { verifyTicketToken } = require('../utils/ticketToken');

const verifyTicket = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = verifyTicketToken(token);

    if (!payload) {
      return res.status(400).json({ message: 'Invalid ticket token' });
    }

    const booking = await Booking.findById(payload.bookingId)
      .populate('movie', 'title')
      .populate('theatre', 'name address')
      .populate('show', 'date showTime language format');

    if (!booking || booking.status !== 'confirmed') {
      return res.status(404).json({ message: 'Valid confirmed booking not found' });
    }

    res.json({
      valid: true,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        movie: booking.movie,
        theatre: booking.theatre,
        show: booking.show,
        seats: booking.seats,
        checkIn: booking.checkIn
      }
    });
  } catch (error) {
    console.error('Verify ticket error:', error);
    res.status(500).json({ message: error.message });
  }
};

const checkInTicket = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = verifyTicketToken(token);

    if (!payload) {
      return res.status(400).json({ message: 'Invalid ticket token' });
    }

    const booking = await Booking.findById(payload.bookingId);
    if (!booking || booking.status !== 'confirmed') {
      return res.status(404).json({ message: 'Valid confirmed booking not found' });
    }

    if (booking.checkIn.status === 'checked_in') {
      return res.status(400).json({
        message: 'Ticket already checked in',
        checkedInAt: booking.checkIn.checkedInAt
      });
    }

    booking.checkIn = {
      status: 'checked_in',
      checkedInAt: new Date(),
      checkedInBy: req.user._id
    };
    await booking.save();

    res.json({
      message: 'Ticket checked in successfully',
      bookingId: booking.bookingId,
      checkIn: booking.checkIn
    });
  } catch (error) {
    console.error('Check-in ticket error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  verifyTicket,
  checkInTicket
};
