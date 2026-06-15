const express = require('express');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Experience = require('../models/Experience');
const Offer = require('../models/Offer');
const adminAuth = require('../middleware/adminAuth');
const { expirePendingBookings } = require('../controllers/operationsController');
const router = express.Router();

// GET /api/admin/dashboard - Admin dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalMovies,
      totalTheatres,
      totalShows,
      totalBookings,
      totalUsers,
      revenue,
      recentBookings
    ] = await Promise.all([
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]),
      Booking.find()
        .populate('movie', 'title')
        .populate('theatre', 'name')
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    res.json({
      stats: {
        totalMovies,
        totalTheatres,
        totalShows,
        totalBookings,
        totalUsers,
        totalRevenue: revenue[0]?.total || 0
      },
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MOVIE MANAGEMENT
router.post('/movies', adminAuth, async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/movies/:id', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/movies/:id', adminAuth, async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// THEATRE MANAGEMENT
router.post('/theatres', adminAuth, async (req, res) => {
  try {
    const theatre = new Theatre(req.body);
    await theatre.save();
    res.status(201).json(theatre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SHOW MANAGEMENT
router.post('/shows', adminAuth, async (req, res) => {
  try {
    const show = new Show(req.body);
    await show.save();
    res.status(201).json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/operations/expire-pending-bookings', adminAuth, expirePendingBookings);

// EXPERIENCE MANAGEMENT
router.post('/experiences', adminAuth, async (req, res) => {
  try {
    const experience = new Experience(req.body);
    await experience.save();
    res.status(201).json(experience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/experiences/:id', adminAuth, async (req, res) => {
  try {
    const experience = await Experience.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.json(experience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/experiences/:id', adminAuth, async (req, res) => {
  try {
    await Experience.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Experience disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// OFFER MANAGEMENT
router.post('/offers', adminAuth, async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/offers/:id', adminAuth, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// USER MANAGEMENT
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
