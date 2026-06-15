const express = require('express');
const { getMovies, getMovieById, getGenres, getLanguages } = require('../controllers/movieController');
const router = express.Router();

// GET /api/movies - Get all movies with filters
router.get('/', getMovies);

// GET /api/movies/genres/list - Get all available genres
router.get('/genres/list', getGenres);

// GET /api/movies/languages/list - Get all available languages
router.get('/languages/list', getLanguages);

// GET /api/movies/:id - Get single movie by ID
router.get('/:id', getMovieById);

module.exports = router;
