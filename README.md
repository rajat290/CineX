# 🎬 CineX - Movie Ticket Booking System

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green.svg)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue.svg)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)](https://expressjs.com/)

A modern, full-stack movie ticket booking platform built with React, Node.js, Express, and MongoDB. Experience seamless movie browsing, real-time seat selection, and secure payments with CineX.

![CineX Banner](https://via.placeholder.com/800x200/1a1a2e/00d4ff?text=CineX+Movie+Booking+System)

## 🌟 Features

### 🎭 Core Functionality
- **🔐 User Authentication** - Secure JWT-based login and registration
- **🎬 Movie Catalog** - Browse movies with advanced filtering and search
- **🏢 Theater Selection** - Location-based theater discovery
- **💺 Real-time Seat Selection** - Interactive seat map with live availability
- **💳 Secure Payments** - Razorpay integration for safe transactions
- **📱 Responsive Design** - Works perfectly on all devices

### 🚀 Advanced Features
- **⏰ Real-time Seat Locking** - Temporary seat reservation system
- **📧 Email Notifications** - Automated booking confirmations
- **📄 Digital Tickets** - PDF ticket generation and download
- **🔍 Advanced Search** - Find movies by title, genre, or language
- **📊 Booking History** - Complete booking management
- **🎫 Cancellation System** - Flexible booking cancellation with refunds

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling and validation
- **Lucide React** - Beautiful icons
- **Date-fns** - Date manipulation library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Razorpay** - Payment gateway
- **Nodemailer** - Email service
- **Winston** - Logging library
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### DevOps & Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vite** - Build tool
- **Nodemon** - Development auto-restart

## 📋 Prerequisites

Before running this application, make sure you have:
- **Node.js** (v18 or higher)
- **MongoDB** (local installation or Atlas)
- **Git** for version control
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/cinex-movie-booking.git
cd cinex-movie-booking
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd moviebooker-backend
npm install
```

#### Environment Configuration
Create a `.env` file in the `moviebooker-backend` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cinex

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Logging
LOG_LEVEL=info
```

#### Database Setup
Make sure MongoDB is running locally or update the `MONGODB_URI` for MongoDB Atlas.

#### Seed Database (Optional)
```bash
npm run seed
```

#### Start Backend Server
```bash
npm run dev
```
The backend will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../cinex-frontend
npm install
```

#### Environment Configuration
Create a `.env` file in the `cinex-frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=CineX
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG=true
```

#### Start Frontend Development Server
```bash
npm run dev
```
The frontend will start on `http://localhost:5173`

## 📖 Usage

### For Users
1. **Register/Login** - Create an account or sign in
2. **Set Location** - Choose your city for local theaters
3. **Browse Movies** - Explore movies by category or search
4. **Select Theater & Show** - Pick your preferred theater and showtime
5. **Choose Seats** - Interactive seat selection
6. **Make Payment** - Secure payment via Razorpay
7. **Get Tickets** - Download digital tickets via email

### For Developers
- **API Documentation** - Available at `/api/docs` (if Swagger is implemented)
- **Database Models** - Check `moviebooker-backend/models/` for schema details
- **Component Library** - Reusable components in `cinex-frontend/src/components/`

## 🏗️ Project Structure

```
cinex-movie-booking/
├── moviebooker-backend/          # Backend application
│   ├── config/                   # Configuration files
│   ├── controllers/              # Business logic
│   ├── middleware/               # Custom middleware
│   ├── models/                   # Database schemas
│   ├── routes/                   # API endpoints
│   ├── utils/                    # Helper utilities
│   ├── app.js                    # Express app setup
│   ├── server.js                 # Server entry point
│   └── package.json
├── cinex-frontend/               # Frontend application
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services
│   │   ├── stores/               # State management
│   │   ├── types/                # TypeScript types
│   │   ├── utils/                # Helper functions
│   │   ├── App.tsx               # Main app component
│   │   └── main.tsx              # App entry point
│   ├── index.html                # HTML template
│   └── package.json
├── CineX_Project_Analysis.md     # Detailed project analysis
├── Project_Submission.md         # College submission format
├── Interview_Preparation_Guide.md # Interview prep guide
└── README.md                     # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Movies
- `GET /api/movies` - Get movies with filters
- `GET /api/movies/:id` - Get single movie
- `GET /api/movies/search` - Search movies

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user bookings
- `DELETE /api/bookings/:id` - Cancel booking

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment

## 🎨 Screenshots

### Homepage
![Homepage](https://via.placeholder.com/600x300/1a1a2e/00d4ff?text=Homepage+Screenshot)

### Movie Details
![Movie Details](https://via.placeholder.com/600x300/1a1a2e/00d4ff?text=Movie+Details+Screenshot)

### Seat Selection
![Seat Selection](https://via.placeholder.com/600x300/1a1a2e/00d4ff?text=Seat+Selection+Screenshot)

### Payment Page
![Payment](https://via.placeholder.com/600x300/1a1a2e/00d4ff?text=Payment+Screenshot)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing frontend library
- **Node.js Community** for the robust runtime
- **MongoDB** for the flexible database
- **Razorpay** for payment processing
- **Tailwind CSS** for the utility-first styling approach

## 📞 Support

For support, email support@cinemabooker.com or create an issue in this repository.

## 🔄 Future Enhancements

- [ ] Mobile app development (React Native)
- [ ] Advanced analytics dashboard
- [ ] Social features (reviews, ratings)
- [ ] Multi-language support
- [ ] Advanced search with AI recommendations
- [ ] Integration with external movie APIs
- [ ] Loyalty program and rewards system

---

## 📊 Project Status

![GitHub issues](https://img.shields.io/github/issues/your-username/cinex-movie-booking)
![GitHub stars](https://img.shields.io/github/stars/your-username/cinex-movie-booking)
![GitHub license](https://img.shields.io/github/license/your-username/cinex-movie-booking)

**Status:** 🚧 In Development
**Version:** 1.0.0
**Last Updated:** 31-08-2025

---

**Made with ❤️ by Rajat Singh Tomar**

⭐ Star this repo if you find it helpful!
