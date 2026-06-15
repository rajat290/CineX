const TrendingItem = require('../models/TrendingItem');
const RecentSearch = require('../models/RecentSearch');
const Category = require('../models/Category');
const Movie = require('../models/Movie');
const Experience = require('../models/Experience');

// Get trending items
exports.getTrendingItems = async (req, res) => {
  try {
    const trendingItems = await TrendingItem.find().sort({ rank: 1 });
    res.json(trendingItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending items' });
  }
};

// Get recent searches for a user
exports.getRecentSearches = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.json([]); // No user, return empty
    }
    const recentSearches = await RecentSearch.find({ userId }).sort({ searchedAt: -1 }).limit(10);
    if (!Array.isArray(recentSearches)) {
      return res.json([]);
    }
    res.json(recentSearches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent searches' });
  }
};

// Add a recent search
exports.addRecentSearch = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const { searchTerm } = req.body;
    if (!userId || !searchTerm) {
      return res.status(400).json({ error: 'User and search term required' });
    }
    const recentSearch = new RecentSearch({ userId, searchTerm });
    await recentSearch.save();
    res.json({ message: 'Recent search added' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add recent search' });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Search across movies and other types
exports.search = async (req, res) => {
  try {
    const { query, type } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    let results = [];

    if (!type || type === 'movie') {
      const movies = await Movie.find({
        title: { $regex: query, $options: 'i' },
        isActive: true
      }).limit(20);
      results = results.concat(movies.map(m => ({ type: 'movie', data: m })));
    }

    if (!type || ['event', 'play', 'sport', 'activity', 'experience'].includes(type)) {
      const experienceQuery = {
        title: { $regex: query, $options: 'i' },
        isActive: true,
        status: 'published'
      };

      if (type && type !== 'experience') {
        experienceQuery.type = type;
      }

      const experiences = await Experience.find(experienceQuery).limit(20);
      results = results.concat(experiences.map(experience => ({
        type: experience.type,
        data: experience
      })));
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};
