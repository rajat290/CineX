const express = require('express');
const connectDB = require('./config/database');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Import middleware
const { authLimiter, apiLimiter, corsOptions, securityHeaders } = require('./middleware/security');
const { requestLogger, errorLogger } = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const theatreRoutes = require('./routes/theatres');
const showRoutes = require('./routes/shows');
const seatRoutes = require('./routes/seats');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/searchRoutes');
const discoveryRoutes = require('./routes/discovery');
const offerRoutes = require('./routes/offers');
const ticketRoutes = require('./routes/tickets');

const app = express();

// Database connection
connectDB();

// Security middleware
app.use(securityHeaders);
app.use(require('cors')(corsOptions));
app.use(require('helmet')());

// Body parsing
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(requestLogger);

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/tickets', ticketRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use(errorLogger);
app.use((error, req, res, next) => {
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// 404 handler (catch-all without wildcard path)
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
});

