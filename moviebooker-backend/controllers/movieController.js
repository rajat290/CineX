const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');

// Get all movies with filters
const getMovies = async (req, res) => {
  try {
    const { 
      city, 
      language, 
      genre, 
      format, 
      status = 'running',
      page = 1, 
      limit = 20,
      search,
      q
    } = req.query;

    // Build query
    let query = { isActive: true };

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Language filter
    if (language) {
      query.language = { $in: language.split(',') };
    }

    // Genre filter
    if (genre) {
      query.genre = { $in: genre.split(',') };
    }

    // Format filter
    if (format) {
      query.formats = { $in: format.split(',') };
    }

    // Search filter
    const searchTerm = search || q;
    if (searchTerm) {
      query.title = { $regex: searchTerm, $options: 'i' };
    }

    let movies;
    let total;

    // If city is provided, filter movies by available shows in that city
    if (city) {
      // Normalize city name for better matching
      let normalizedCity = city.toLowerCase().trim();

      // Handle common city variations
      const cityMappings = {
        'delhi ncr': 'delhi',
        'new delhi': 'delhi',
        'ncr': 'delhi',
        'mumbai': 'mumbai',
        'bombay': 'mumbai',
        'pune': 'pune',
        'poona': 'pune',
        'bangalore': 'bangalore',
        'bengaluru': 'bangalore',
        'chennai': 'chennai',
        'madras': 'chennai',
        'kolkata': 'kolkata',
        'calcutta': 'kolkata',
        'hyderabad': 'hyderabad',
        'ahmedabad': 'ahmedabad',
        'jaipur': 'jaipur',
        'surat': 'surat',
        'lucknow': 'lucknow',
        'kanpur': 'kanpur',
        'nagpur': 'nagpur',
        'indore': 'indore',
        'thane': 'thane',
        'bhopal': 'bhopal',
        'visakhapatnam': 'visakhapatnam',
        'pimpri-chinchwad': 'pune',
        'vadodara': 'vadodara',
        'ghaziabad': 'delhi',
        'noida': 'delhi',
        'gurugram': 'delhi',
        'gurgaon': 'delhi',
        'faridabad': 'delhi'
      };

      // Apply mapping if exists
      if (cityMappings[normalizedCity]) {
        normalizedCity = cityMappings[normalizedCity];
      }

      // Find theatres in the specified city (case-insensitive search)
      const theatres = await Theatre.find({
        'address.city': { $regex: new RegExp(normalizedCity, 'i') },
        isActive: true
      }).select('_id');

      if (theatres.length > 0) {
        const theatreIds = theatres.map(t => t._id);

        // Find shows in those theatres
        const shows = await Show.find({
          theatre: { $in: theatreIds },
          status: 'active'
        }).select('movie').distinct('movie');

        if (shows.length > 0) {
          // Add movie IDs to the query
          query._id = { $in: shows };
        } else {
          // No shows found for this city, return empty result
          return res.json({
            movies: [],
            pagination: {
              total: 0,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: 0
            }
          });
        }
      } else {
        // No theatres found for this city, return empty result
        return res.json({
          movies: [],
          pagination: {
            total: 0,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: 0
          }
        });
      }
    }

    movies = await Movie.find(query)
      .select('-__v')
      .sort({ releaseDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    total = await Movie.countDocuments(query);

    res.json({
      movies,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single movie by ID
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all available genres
const getGenres = async (req, res) => {
  try {
    const genres = await Movie.distinct('genre');
    res.json({ genres: genres.sort() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all available languages
const getLanguages = async (req, res) => {
  try {
    const languages = await Movie.distinct('language');
    res.json({ languages: languages.sort() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  getGenres,
  getLanguages
};
