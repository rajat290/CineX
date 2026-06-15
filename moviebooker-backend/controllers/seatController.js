const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const SeatHold = require('../models/SeatHold');

const buildSeatDetails = (show, seats) => {
  return seats.map(seat => {
    const seatNumber = typeof seat === 'string' ? seat : seat.seatNumber;
    const seatType = typeof seat === 'string' ? 'regular' : seat.seatType;
    const price = show.pricing.find(item => item.seatType === seatType)?.price || 0;

    return { seatNumber, seatType, price };
  });
};

// Get seat availability for a show
const getSeats = async (req, res) => {
  try {
    const show = await Show.findById(req.params.showId)
      .populate('theatre', 'name screens');
    
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    const availableSeats = show.getAvailableSeats();
    const bookedSeats = show.bookedSeats || [];
    const blockedSeats = show.blockedSeats.map(bs => bs.seat);

    // Get seat pricing and types
    const seatPricing = {};
    show.pricing.forEach(price => {
      seatPricing[price.seatType] = price.price;
    });

    // Get seat layout from theatre
    const theatre = await Theatre.findById(show.theatre._id);
    const screen = theatre.screens.find(s => s.screenName === show.screen);
    const allSeats = theatre.generateSeatsForScreen(screen.screenNumber);

    const seatMap = allSeats.map(seat => ({
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      price: seatPricing[seat.seatType] || 0,
      status: bookedSeats.includes(seat.seatNumber) ? 'booked' : 
              blockedSeats.includes(seat.seatNumber) ? 'blocked' : 'available',
      row: seat.row,
      number: seat.number
    }));

    res.json({
      show: {
        id: show._id,
        movie: show.movie,
        theatre: show.theatre.name,
        screen: show.screen,
        date: show.date,
        time: show.showTime,
        language: show.language,
        format: show.format
      },
      seatMap,
      availableSeats,
      bookedSeats,
      blockedSeats,
      pricing: show.pricing
    });
  } catch (error) {
    console.error('Get seats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Temporarily block seats
const blockSeats = async (req, res) => {
  try {
    const { seats, timeoutMinutes = 5 } = req.body;
    
    const show = await Show.findById(req.params.showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    const seatNumbers = seats.map(seat => typeof seat === 'string' ? seat : seat.seatNumber);
    const blockedSeats = show.blockSeats(seatNumbers, timeoutMinutes);
    await show.save();

    const hold = await SeatHold.create({
      user: req.user._id,
      show: show._id,
      seats: buildSeatDetails(show, seats),
      expiresAt: new Date(Date.now() + timeoutMinutes * 60000)
    });

    res.json({
      message: 'Seats blocked successfully',
      holdId: hold._id,
      blockedSeats,
      expiresIn: timeoutMinutes * 60 // seconds
    });
  } catch (error) {
    console.error('Block seats error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get active holds for current user
const getMySeatHolds = async (req, res) => {
  try {
    const holds = await SeatHold.find({
      user: req.user._id,
      status: 'active',
      expiresAt: { $gt: new Date() }
    })
      .populate('show', 'date showTime language format')
      .sort({ expiresAt: 1 });

    res.json({ holds });
  } catch (error) {
    console.error('Get seat holds error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Release blocked seats
const releaseSeats = async (req, res) => {
  try {
    const { seats, holdId } = req.body;
    
    const show = await Show.findById(req.params.showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    show.releaseSeats(seats);
    await show.save();

    if (holdId) {
      await SeatHold.findOneAndUpdate(
        { _id: holdId, user: req.user._id, show: show._id, status: 'active' },
        { status: 'released' }
      );
    }

    res.json({ message: 'Seats released successfully', releasedSeats: seats });
  } catch (error) {
    console.error('Release seats error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getSeats,
  blockSeats,
  getMySeatHolds,
  releaseSeats
};
