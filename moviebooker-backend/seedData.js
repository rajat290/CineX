const mongoose = require('mongoose');
require('dotenv').config();

// Models
const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');
const Show = require('./models/Show');
const User = require('./models/User');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moviebooker');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const TrendingItem = require('./models/TrendingItem');
const RecentSearch = require('./models/RecentSearch');
const Category = require('./models/Category');

// Sample data
const sampleMovies = [
  {
    title: "Fighter",
    description: "An action-packed aerial drama about Indian Air Force pilots fighting against terrorism.",
    genre: ["Action", "Drama", "Patriotic"],
    language: "Hindi",
    duration: 160,
    rating: "UA",
    imdbRating: 8.2,
    releaseDate: new Date("2024-01-25"),
    poster: "https://example.com/posters/fighter.jpg",
    backdrop: "https://example.com/backdrops/fighter.jpg",
    trailer: "https://youtube.com/watch?v=fg6TUzR1EWA",
    cast: [
      { name: "Hrithik Roshan", role: "Group Captain Shamsher Pathania", image: "https://example.com/actors/hrithik.jpg" },
      { name: "Deepika Padukone", role: "Squadron Leader Minal Rathore", image: "https://example.com/actors/deepika.jpg" },
      { name: "Anil Kapoor", role: "Air Chief Marshal Rakesh Jai Singh", image: "https://example.com/actors/anil.jpg" }
    ],
    crew: [
      { name: "Siddharth Anand", role: "Director", image: "https://example.com/crew/siddharth.jpg" },
      { name: "Ramon Chibb", role: "Cinematographer", image: "https://example.com/crew/ramon.jpg" }
    ],
    formats: ["2D", "3D", "IMAX"],
    status: "running",
    isActive: true
  },
  {
    title: "Teri Baaton Mein Aisa Uljha Jiya",
    description: "A romantic comedy about a man who falls in love with a humanoid robot.",
    genre: ["Romance", "Comedy", "Sci-Fi"],
    language: "Hindi",
    duration: 135,
    rating: "UA",
    imdbRating: 7.1,
    releaseDate: new Date("2024-02-09"),
    poster: "https://example.com/posters/teribaaton.jpg",
    cast: [
      { name: "Shahid Kapoor", role: "Aryan", image: "https://example.com/actors/shahid.jpg" },
      { name: "Kriti Sanon", role: "Sifra", image: "https://example.com/actors/kriti.jpg" },
      { name: "Dhairya Karwa", role: "Rohan", image: "https://example.com/actors/dhairya.jpg" }
    ],
    crew: [
      { name: "Amit Joshi", role: "Director", image: "https://example.com/crew/amit.jpg" },
      { name: "Aradhana Sah", role: "Writer", image: "https://example.com/crew/aradhana.jpg" }
    ],
    formats: ["2D", "3D"],
    status: "running",
    isActive: true
  },
  {
    title: "Article 370",
    description: "A political action thriller based on the revocation of Article 370 in Jammu and Kashmir.",
    genre: ["Action", "Thriller", "Political"],
    language: "Hindi",
    duration: 140,
    rating: "UA",
    imdbRating: 7.8,
    releaseDate: new Date("2024-02-23"),
    poster: "https://example.com/posters/article370.jpg",
    cast: [
      { name: "Yami Gautam", role: "Zooni Haksar", image: "https://example.com/actors/yami.jpg" },
      { name: "Priyamani", role: "Rajeshwari Swaminathan", image: "https://example.com/actors/priyamani.jpg" }
    ],
    crew: [
      { name: "Aditya Suhas Jambhale", role: "Director", image: "https://example.com/crew/aditya.jpg" }
    ],
    formats: ["2D"],
    status: "running",
    isActive: true
  }
];

// New sample data for search page features
const sampleTrendingItems = [
  { title: "IPL 2024", rank: 1, type: "event" },
  { title: "Stand-up Comedy", rank: 2, type: "event" },
  { title: "Bollywood Movies", rank: 3, type: "movie" },
  { title: "Hollywood Action", rank: 4, type: "movie" },
  { title: "Concert Tickets", rank: 5, type: "event" },
  { title: "Theatre Shows", rank: 6, type: "event" },
  { title: "Kids Movies", rank: 7, type: "movie" },
  { title: "Documentary Films", rank: 8, type: "movie" }
];

const sampleRecentSearches = [
  { userId: null, searchTerm: "Interstellar Odyssey" },
  { userId: null, searchTerm: "Comedy Night" },
  { userId: null, searchTerm: "Rock Concert" },
  { userId: null, searchTerm: "IPL Match" }
];

const sampleCategories = [
  { name: "Movies", type: "movie" },
  { name: "Events", type: "event" },
  { name: "Sports", type: "sport" },
  { name: "Theatre", type: "theatre" }
];

const sampleTheatres = [
  // Delhi Theatres
  {
    name: "PVR Select City Walk",
    address: {
      street: "Select Citywalk Mall, A-3",
      area: "Saket",
      city: "Delhi NCR",
      state: "Delhi",
      pincode: "110017"
    },
    location: {
      type: "Point",
      coordinates: [77.2090, 28.5275]
    },
    contact: {
      phone: "011-33105607",
      email: "saket@pvr.com"
    },
    amenities: ["Parking", "Food Court", "3D", "IMAX", "Dolby Atmos", "Wheelchair Accessible"],
    screens: [
      {
        screenNumber: 1,
        screenName: "PVR IMAX",
        totalSeats: 250,
        seatLayout: {
          rows: 10,
          columns: 25,
          seatConfiguration: [
            { row: "A", startSeat: 1, endSeat: 25, seatType: "regular" },
            { row: "B", startSeat: 1, endSeat: 25, seatType: "regular" },
            { row: "C", startSeat: 1, endSeat: 25, seatType: "premium" },
            { row: "D", startSeat: 1, endSeat: 25, seatType: "premium" },
            { row: "E", startSeat: 1, endSeat: 25, seatType: "recliner" }
          ]
        },
        formats: ["2D", "3D", "IMAX"],
        isActive: true
      },
      {
        screenNumber: 2,
        screenName: "PVR 4DX",
        totalSeats: 180,
        seatLayout: {
          rows: 8,
          columns: 22,
          seatConfiguration: [
            { row: "A", startSeat: 1, endSeat: 22, seatType: "regular" },
            { row: "B", startSeat: 1, endSeat: 22, seatType: "regular" },
            { row: "C", startSeat: 1, endSeat: 22, seatType: "premium" },
            { row: "D", startSeat: 1, endSeat: 22, seatType: "recliner" }
          ]
        },
        formats: ["2D", "3D", "4DX"],
        isActive: true
      }
    ],
    isActive: true
  },
  {
    name: "INOX Nehru Place",
    address: {
      street: "Nehru Place Metro Station",
      area: "Nehru Place",
      city: "Delhi NCR",
      state: "Delhi",
      pincode: "110019"
    },
    location: {
      type: "Point",
      coordinates: [77.2532, 28.5484]
    },
    contact: {
      phone: "011-26210607",
      email: "nehruplace@inox.com"
    },
    amenities: ["Parking", "Dolby Atmos", "4K Projection", "Food Court"],
    screens: [
      {
        screenNumber: 1,
        screenName: "INOX Screen 1",
        totalSeats: 200,
        seatLayout: {
          rows: 8,
          columns: 25,
          seatConfiguration: [
            { row: "A", startSeat: 1, endSeat: 25, seatType: "regular" },
            { row: "B", startSeat: 1, endSeat: 25, seatType: "regular" },
            { row: "C", startSeat: 1, endSeat: 25, seatType: "regular" },
            { row: "D", startSeat: 1, endSeat: 25, seatType: "premium" }
          ]
        },
        formats: ["2D", "3D"],
        isActive: true
      }
    ],
    isActive: true
  },
  {
    name: "Cinepolis Pacific Mall",
    address: {
      street: "Pacific Mall, Tagore Garden",
      area: "Subhash Nagar",
      city: "Delhi NCR",
      state: "Delhi",
      pincode: "110018"
    },
    location: {
      type: "Point",
      coordinates: [77.3054, 28.6432]
    },
    contact: {
      phone: "011-45678901",
      email: "pacific@cinepolis.com"
    },
    amenities: ["Parking", "IMAX", "Dolby Vision", "Recliner Seats"],
    screens: [
      {
        screenNumber: 1,
        screenName: "Cinepolis IMAX",
        totalSeats: 220,
        seatLayout: {
          rows: 10,
          columns: 22,
          seatConfiguration: [
            { row: "A", startSeat: 1, endSeat: 22, seatType: "regular" },
            { row: "B", startSeat: 1, endSeat: 22, seatType: "regular" },
            { row: "C", startSeat: 1, endSeat: 22, seatType: "premium" },
            { row: "D", startSeat: 1, endSeat: 22, seatType: "recliner" }
          ]
        },
        formats: ["2D", "3D", "IMAX"],
        isActive: true
      }
    ],
    isActive: true
  },

  // Mumbai Theatres
  {
    name: "PVR ICON, Oberoi Mall",
    address: {
      street: "Oberoi Mall, Western Express Highway",
      area: "Goregaon East",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400063"
    },
    location: {
      type: "Point",
      coordinates: [72.8697, 19.1334]
    },
    contact: {
      phone: "022-28456789",
      email: "oberoi@pvr.com"
    },
    amenities: ["Parking", "Food Court", "IMAX", "Dolby Atmos", "Wheelchair Accessible"],
    screens: [
      {
        screenNumber: 1,
        screenName: "PVR IMAX",
        totalSeats: 280,
        seatLayout: {
          rows: 12,
          columns: 24,
          seatConfiguration: [
            { row: "A", startSeat: 1, endSeat: 24, seatType: "regular" },
            { row: "B", startSeat: 1, endSeat: 24, seatType: "regular" },
            { row: "C", startSeat: 1, endSeat: 24, seatType: "premium" },
            { row: "D", startSeat: 1, endSeat: 24, seatType: "premium" },
            { row: "E", startSeat: 1, endSeat: 24, seatType: "recliner" }
          ]
        },
        formats: ["2D", "3D", "IMAX"],
        isActive: true
      },
      {
        screenNumber: 2,
        screenName: "PVR 4DX",
        totalSeats: 160,
        seatLayout: {
          rows: 8,
          columns: 20,
          seatConfiguration: [
            { row: "A", startSeat: 1, endSeat: 20, seatType: "regular" },
            { row: "B", startSeat: 1, endSeat: 20, seatType: "regular" },
            { row: "C", startSeat: 1, endSeat: 20, seatType: "premium" },
            { row: "D", startSeat: 1, endSeat: 20, seatType: "recliner" }
          ]
        },
        formats: ["2D", "3D", "4DX"],
        isActive: true
      }
    ],
    isActive: true
  },
  {
    name: "INOX R-City Mall",
    address: {
      street: "R-City Mall, LBS Marg",
      area: "Ghatkopar West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400086"
    },
    location: {
      type: "Point",
      coordinates: [72.9089, 19.0790]
    },
    contact: {
      phone: "022-25012345",
      email: "rcity@inox.com"
    },
    amenities: ["Parking", "Dolby Atmos", "Food Court", "Wheelchair Accessible"],
    screens: [
      {
        screenNumber: 1,
        screenName: "INOX Screen 1",
        totalSeats: 220,
        seatLayout: {
          rows: 10,
          columns: 22,
          seatConfiguration: [
            { row: "A", startSeat: 1, endSeat: 22, seatType: "regular" },
            { row: "B", startSeat: 1, endSeat: 22, seatType: "regular" },
            { row: "C", startSeat: 1, endSeat: 22, seatType: "regular" },
            { row: "D", startSeat: 1, endSeat: 22, seatType: "premium" }
          ]
        },
        formats: ["2D", "3D"],
        isActive: true
      }
    ],
    isActive: true
  },
  {
    name: "Cinepolis Viviana Mall",
    address: {
      street: "Viviana Mall, Eastern Express Highway",
      area: "Thane West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400607"
    },
    location: {
      type: "Point",
      coordinates: [72.9769, 19.2183]
    },
    contact: {
      phone: "022-25467890",
      email: "viviana@cinepolis.com"
    },
    amenities: ["Parking", "IMAX", "Dolby Vision", "Recliner Seats", "Food Court"],
    screens: [
      {
        screenNumber: 1,
        screenName: "Cinepolis IMAX",
        totalSeats: 240,
        seatLayout: {
          rows: 10,
          columns: 24,
          seatConfiguration: [
            { row: "A", startSeat: 1, endSeat: 24, seatType: "regular" },
            { row: "B", startSeat: 1, endSeat: 24, seatType: "regular" },
            { row: "C", startSeat: 1, endSeat: 24, seatType: "premium" },
            { row: "D", startSeat: 1, endSeat: 24, seatType: "recliner" }
          ]
        },
        formats: ["2D", "3D", "IMAX"],
        isActive: true
      }
    ],
    isActive: true
  },
  {
    name: "PVR Phoenix Marketcity",
    address: {
      street: "Phoenix Marketcity, LBS Marg",
      area: "Kurla West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400070"
    },
    location: {
      type: "Point",
      coordinates: [72.8897, 19.0654]
    },
    contact: {
      phone: "022-26543210",
      email: "phoenix@pvr.com"
    },
    amenities: ["Parking", "Food Court", "IMAX", "Dolby Atmos", "Wheelchair Accessible"],
    screens: [
      {
        screenNumber: 1,
        screenName: "PVR IMAX",
        totalSeats: 260,
        seatLayout: {
          rows: 11,
          columns: 24,
          seatConfiguration: [
            { row: "A", startSeat: 1, endSeat: 24, seatType: "regular" },
            { row: "B", startSeat: 1, endSeat: 24, seatType: "regular" },
            { row: "C", startSeat: 1, endSeat: 24, seatType: "premium" },
            { row: "D", startSeat: 1, endSeat: 24, seatType: "premium" },
            { row: "E", startSeat: 1, endSeat: 24, seatType: "recliner" }
          ]
        },
        formats: ["2D", "3D", "IMAX"],
        isActive: true
      }
    ],
    isActive: true
  },
  {
    name: "INOX Nakshatra Mall",
    address: {
      street: "Nakshatra Mall, S.V. Road",
      area: "Dadar West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400028"
    },
    location: {
      type: "Point",
      coordinates: [72.8426, 19.0176]
    },
    contact: {
      phone: "022-24345678",
      email: "nakshatra@inox.com"
    },
    amenities: ["Parking", "Dolby Atmos", "Food Court", "Wheelchair Accessible"],
    screens: [
      {
        screenNumber: 1,
        screenName: "INOX Screen 1",
        totalSeats: 200,
        seatLayout: {
          rows: 8,
          columns: 25,
          seatConfiguration: [
            { row: "A", startSeat: 1, endSeat: 25, seatType: "regular" },
            { row: "B", startSeat: 1, endSeat: 25, seatType: "regular" },
            { row: "C", startSeat: 1, endSeat: 25, seatType: "regular" },
            { row: "D", startSeat: 1, endSeat: 25, seatType: "premium" }
          ]
        },
        formats: ["2D", "3D"],
        isActive: true
      }
    ],
    isActive: true
  }
];

const generateSeats = (theatre, screenNumber) => {
  const screen = theatre.screens.find(s => s.screenNumber === screenNumber);
  if (!screen) return [];

  const seats = [];
  screen.seatLayout.seatConfiguration.forEach(config => {
    for (let seatNum = config.startSeat; seatNum <= config.endSeat; seatNum++) {
      seats.push(`${config.row}${seatNum}`);
    }
  });

  return seats;
};

const seedData = async () => {
  try {
    await connectDB();

    // Drop all text indexes to avoid language field issues
    console.log('🗑️ Dropping text indexes...');
    try {
      const indexes = await Movie.collection.indexes();
      const textIndexes = indexes.filter(index => Object.values(index.key).some(value => value === 'text'));

      for (const index of textIndexes) {
        await Movie.collection.dropIndex(index.name);
        console.log(`✅ Dropped index: ${index.name}`);
      }
    } catch (e) {
      console.log('No text indexes found or error dropping indexes, continuing...');
    }

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Show.deleteMany({});

    // Insert movies one by one to avoid bulk write issues
    console.log('🎬 Adding movies...');
    const movies = [];
    for (const movieData of sampleMovies) {
      const movie = new Movie(movieData);
      await movie.save();
      movies.push(movie);
    }
    console.log(`✅ ${movies.length} movies added`);

    // Insert theatres one by one
    console.log('🏪 Adding theatres...');
    const theatres = [];
    for (const theatreData of sampleTheatres) {
      const theatre = new Theatre(theatreData);
      await theatre.save();
      theatres.push(theatre);
    }
    console.log(`✅ ${theatres.length} theatres added`);

    // Generate shows for next 30 days
    console.log('⏰ Generating shows...');
    const shows = [];
    const showTimes = ['09:30', '13:15', '16:45', '20:00'];
    const languages = ['Hindi', 'English'];
    const formats = ['2D', '3D'];

    for (let i = 0; i < 30; i++) { // Increased to 30 days for testing
      const showDate = new Date();
      showDate.setDate(showDate.getDate() + i);

      for (const theatre of theatres) {
        for (const screen of theatre.screens) {
          for (const movie of movies) {
            for (const time of showTimes) {
              for (const language of languages) {
                for (const format of formats) {
                  if (movie.formats.includes(format)) {
                    const allSeats = generateSeats(theatre, screen.screenNumber);

                    const show = new Show({
                      movie: movie._id,
                      theatre: theatre._id,
                      screen: screen.screenName,
                      date: showDate,
                      showTime: time,
                      language: language,
                      format: format,
                      pricing: [
                        { seatType: "regular", price: 250 + (i * 10) },
                        { seatType: "premium", price: 350 + (i * 10) },
                        { seatType: "recliner", price: 500 + (i * 15) }
                      ],
                      availableSeats: allSeats,
                      bookedSeats: [],
                      blockedSeats: [],
                      totalSeats: allSeats.length,
                      status: "active"
                    });

                    await show.save();
                    shows.push(show);
                  }
                }
              }
            }
          }
        }
      }
    }

    console.log(`✅ ${shows.length} shows generated`);

    console.log('🎉 Seed data completed successfully!');
    console.log('\n📊 SUMMARY:');
    console.log(`   Movies: ${movies.length}`);
    console.log(`   Theatres: ${theatres.length}`);
    console.log(`   Shows: ${shows.length}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Seed data error:', error);
    process.exit(1);
  }
};

// Run seed data
seedData();
