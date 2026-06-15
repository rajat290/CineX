const express = require('express');
const auth = require('../middleware/auth');
const { listOffers, validateOffer, getWallet } = require('../controllers/offerController');

const router = express.Router();

router.get('/', listOffers);
router.post('/validate', auth, validateOffer);
router.get('/wallet/me', auth, getWallet);

module.exports = router;
