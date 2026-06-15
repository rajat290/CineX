const express = require('express');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { verifyTicket, checkInTicket } = require('../controllers/ticketController');

const router = express.Router();

router.post('/verify', auth, verifyTicket);
router.post('/check-in', adminAuth, checkInTicket);

module.exports = router;
