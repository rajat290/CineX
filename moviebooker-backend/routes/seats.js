const express = require('express');
const { getSeats, blockSeats, getMySeatHolds, releaseSeats } = require('../controllers/seatController');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/shows/:showId/seats - Get seat availability for a show
router.get('/:showId/seats', getSeats);

// POST /api/shows/:showId/block-seats - Temporarily block seats
router.post('/:showId/block-seats', auth, blockSeats);

// GET /api/seats/holds/me - Current user's active holds
router.get('/holds/me', auth, getMySeatHolds);

// POST /api/shows/:showId/release-seats - Release blocked seats
router.post('/:showId/release-seats', auth, releaseSeats);

module.exports = router;
