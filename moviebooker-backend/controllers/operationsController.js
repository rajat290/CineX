const Booking = require('../models/Booking');
const SeatHold = require('../models/SeatHold');
const Show = require('../models/Show');

const expirePendingBookings = async (req, res) => {
  try {
    const cutoffMinutes = Number(req.query.cutoffMinutes || 15);
    const cutoff = new Date(Date.now() - cutoffMinutes * 60000);

    const pendingBookings = await Booking.find({
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $lte: cutoff }
    }).limit(100);

    let expiredCount = 0;

    for (const booking of pendingBookings) {
      const seatNumbers = booking.seats.map(seat => seat.seatNumber);
      const show = await Show.findById(booking.show);

      if (show) {
        show.releaseSeats(seatNumbers);
        await show.save();
      }

      booking.status = 'expired';
      await booking.save();

      if (booking.seatHold) {
        await SeatHold.findByIdAndUpdate(booking.seatHold, { status: 'expired' });
      }

      expiredCount += 1;
    }

    res.json({
      message: 'Pending booking expiry completed',
      expiredCount
    });
  } catch (error) {
    console.error('Expire pending bookings error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  expirePendingBookings
};
