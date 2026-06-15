const express = require('express');
const {
  getDiscoveryHome,
  listExperiences,
  getExperienceById,
  unifiedSearch
} = require('../controllers/discoveryController');

const router = express.Router();

router.get('/home', getDiscoveryHome);
router.get('/experiences', listExperiences);
router.get('/experiences/:id', getExperienceById);
router.get('/search', unifiedSearch);

module.exports = router;
