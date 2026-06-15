const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Experience = require('../models/Experience');

const buildDateQuery = (date) => {
  if (!date) return {};

  const selectedDate = new Date(date);
  const nextDate = new Date(selectedDate);
  nextDate.setDate(nextDate.getDate() + 1);

  return {
    startDate: {
      $gte: selectedDate,
      $lt: nextDate
    }
  };
};

const getDiscoveryHome = async (req, res) => {
  try {
    const { city = 'Delhi' } = req.query;

    const [movies, featuredExperiences, trendingExperiences, venues] = await Promise.all([
      Movie.find({ isActive: true, status: 'running' })
        .sort({ releaseDate: -1, createdAt: -1 })
        .limit(10),
      Experience.find({
        city: new RegExp(city, 'i'),
        isActive: true,
        status: 'published',
        isFeatured: true
      })
        .sort({ startDate: 1 })
        .limit(8),
      Experience.find({
        city: new RegExp(city, 'i'),
        isActive: true,
        status: 'published'
      })
        .sort({ 'stats.trendingScore': -1, startDate: 1 })
        .limit(8),
      Theatre.find({
        'address.city': new RegExp(city, 'i'),
        isActive: true
      })
        .select('name address amenities')
        .limit(6)
    ]);

    res.json({
      city,
      rails: [
        { key: 'movies_now_showing', title: 'Now showing', type: 'movie', items: movies },
        { key: 'featured_experiences', title: 'Featured experiences', type: 'experience', items: featuredExperiences },
        { key: 'trending_experiences', title: 'Trending near you', type: 'experience', items: trendingExperiences },
        { key: 'venues', title: 'Popular venues', type: 'venue', items: venues }
      ]
    });
  } catch (error) {
    console.error('Discovery home error:', error);
    res.status(500).json({ message: error.message });
  }
};

const listExperiences = async (req, res) => {
  try {
    const {
      type,
      city,
      date,
      minPrice,
      maxPrice,
      tag,
      page = 1,
      limit = 20
    } = req.query;

    const query = {
      isActive: true,
      status: 'published',
      ...buildDateQuery(date)
    };

    if (type) query.type = type;
    if (city) query.city = new RegExp(city, 'i');
    if (tag) query.tags = { $in: tag.split(',') };
    if (minPrice || maxPrice) {
      query['pricing.minPrice'] = {};
      if (minPrice) query['pricing.minPrice'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.minPrice'].$lte = Number(maxPrice);
    }

    const [items, total] = await Promise.all([
      Experience.find(query)
        .sort({ startDate: 1, 'stats.trendingScore': -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Experience.countDocuments(query)
    ]);

    res.json({
      experiences: items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('List experiences error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      { $inc: { 'stats.views': 1 } },
      { new: true }
    );

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    res.json(experience);
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({ message: error.message });
  }
};

const unifiedSearch = async (req, res) => {
  try {
    const { query, city, type, limit = 8 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const regex = new RegExp(query, 'i');
    const includeMovies = !type || type === 'movie';
    const includeExperiences = !type || ['event', 'play', 'sport', 'activity', 'experience'].includes(type);
    const includeVenues = !type || type === 'venue';

    const [movies, experiences, venues] = await Promise.all([
      includeMovies
        ? Movie.find({ title: regex, isActive: true }).limit(Number(limit))
        : [],
      includeExperiences
        ? Experience.find({
            title: regex,
            ...(type && type !== 'experience' ? { type } : {}),
            ...(city ? { city: new RegExp(city, 'i') } : {}),
            isActive: true,
            status: 'published'
          }).limit(Number(limit))
        : [],
      includeVenues
        ? Theatre.find({
            name: regex,
            ...(city ? { 'address.city': new RegExp(city, 'i') } : {}),
            isActive: true
          })
            .select('name address amenities')
            .limit(Number(limit))
        : []
    ]);

    res.json({
      results: [
        ...movies.map(item => ({ type: 'movie', item })),
        ...experiences.map(item => ({ type: item.type, item })),
        ...venues.map(item => ({ type: 'venue', item }))
      ]
    });
  } catch (error) {
    console.error('Unified search error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDiscoveryHome,
  listExperiences,
  getExperienceById,
  unifiedSearch
};
