import { useEffect, useState } from 'react';
import { api } from '../services/api';

const categories = ['Movies', 'Stream', 'Events', 'Plays', 'Sports', 'Activities'];

const quickFilters = [
  'Interstellar', 'Avengers', 'Spider-Man', 'Batman', 'Superman',
  'Comedy Shows', 'Horror Movies', 'Action Thriller', 'Romantic Comedy'
];

interface TrendingItem {
  _id: string;
  title: string;
  rank: number;
}

interface RecentSearch {
  _id?: string;
  searchTerm: string;
}

interface Category {
  _id: string;
  name: string;
}

const Search = () => {
  const [location] = useState<string>('Mumbai');
  const [area] = useState<string>('Select Area');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Movies');
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [browseCategories, setBrowseCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchTrending();
    fetchRecentSearches();
    fetchCategories();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await api.get('/search/trending');
      if (Array.isArray(res.data)) {
        setTrendingItems(res.data);
      } else {
        console.error('Trending items response is not an array:', res.data);
        setTrendingItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch trending items', error);
      setTrendingItems([]);
    }
  };

  const fetchRecentSearches = async () => {
    try {
      const res = await api.get('/search/recent');
      if (Array.isArray(res.data)) {
        setRecentSearches(res.data);
      } else {
        console.error('Recent searches response is not an array:', res.data);
        setRecentSearches([]);
      }
    } catch (error) {
      console.error('Failed to fetch recent searches', error);
      setRecentSearches([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/search/categories');
      if (Array.isArray(res.data)) {
        setBrowseCategories(res.data);
      } else {
        console.error('Categories response is not an array:', res.data);
        setBrowseCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
      setBrowseCategories([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-5xl mx-auto">
      {/* Location Selector */}
      <div className="flex items-center space-x-2 mb-4">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-4-8-8-8-12a8 8 0 1116 0c0 4-4 8-8 12z" />
        </svg>
        <div>
          <div className="font-semibold">{location} <span className="text-gray-400">▼</span></div>
          <div className="text-xs text-gray-500">{area}</div>
        </div>
        <div className="flex-grow" />
        <div className="w-8 h-8 rounded-full bg-gray-700" />
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search for Movies, Events, Plays, Sports and Activities"
        className="w-full p-3 rounded bg-gray-800 placeholder-gray-500 mb-4"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Category Tabs */}
      <div className="flex space-x-4 mb-4 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-1 rounded-full text-sm font-semibold ${
              selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quick Filters */}
      <div className="flex space-x-2 overflow-x-auto mb-6">
        {quickFilters.map((filter) => (
          <button
            key={filter}
            className="bg-gray-800 px-3 py-1 rounded-full text-xs whitespace-nowrap"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Trending Now */}
      <div className="mb-6">
        <h2 className="text-red-600 font-semibold mb-2 flex items-center space-x-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
          </svg>
          <span>Trending Now</span>
        </h2>
        <ul>
          {Array.isArray(trendingItems) && trendingItems.length > 0 ? (
            trendingItems.map((item) => (
              <li key={item._id} className="flex justify-between p-3 bg-gray-800 rounded mb-1 cursor-pointer hover:bg-gray-700">
                <span>{item.title}</span>
                <span className="text-gray-500">#{item.rank}</span>
              </li>
            ))
          ) : (
            <li className="p-3 bg-gray-800 rounded mb-1 text-gray-400">No trending items found</li>
          )}
        </ul>
      </div>

      {/* Recent Searches */}
      <div className="mb-6">
        <h2 className="text-red-600 font-semibold mb-2 flex items-center space-x-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" />
          </svg>
          <span>Recent Searches</span>
        </h2>
        <ul>
          {Array.isArray(recentSearches) && recentSearches.length > 0 ? (
            recentSearches.map((search) => (
              <li key={search._id || search.searchTerm} className="flex items-center p-3 bg-gray-800 rounded mb-1 cursor-pointer hover:bg-gray-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" />
                </svg>
                <span>{search.searchTerm}</span>
              </li>
            ))
          ) : (
            <li className="p-3 bg-gray-800 rounded mb-1 text-gray-400">No recent searches</li>
          )}
        </ul>
      </div>

      {/* Browse by Category */}
      <div>
        <h3 className="font-semibold mb-3">Browse by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.isArray(browseCategories) && browseCategories.length > 0 ? (
            browseCategories.map((cat) => (
              <button
                key={cat._id}
                className="bg-gray-800 py-4 rounded text-center font-semibold hover:bg-gray-700"
              >
                {cat.name}
              </button>
            ))
          ) : (
            <div className="col-span-2 md:col-span-4 p-4 bg-gray-800 rounded text-center text-gray-400">
              No categories found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
