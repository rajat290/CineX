const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movie: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie', 
    required: true 
  },
  theatre: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Theatre', 
    required: true 
  },
  screen: { 
    type: String, 
    required: true 
  }, // Screen number or name
  date: { 
    type: Date, 
    required: true 
  }, // Show date
  showTime: { 
    type: String, 
    required: true 
  }, // '09:30', '13:15', '18:45'
  language: { 
    type: String, 
    required: true 
  }, // 'Hindi', 'English'
  format: { 
    type: String, 
    enum: ['2D', '3D', 'IMAX', '4DX'], 
    required: true 
  },
  pricing: [{
    seatType: { 
      type: String, 
      enum: ['regular', 'premium', 'recliner'], 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    }
  }],
  availableSeats: [{ 
    type: String 
  }], // ['A1', 'A2', 'B1', 'B2']
  bookedSeats: [{ 
    type: String 
  }],
  blockedSeats: [{
    seat: { type: String },
    blockedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date } // 5-10 minutes for booking completion
  }],
  totalSeats: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'cancelled', 'completed'], 
    default: 'active' 
  }
}, {
  timestamps: true
});

// Method to get available seats
showSchema.methods.getAvailableSeats = function() {
  const now = new Date();
  this.blockedSeats = (this.blockedSeats || []).filter(bs => !bs.expiresAt || bs.expiresAt > now);

  const allSeats = this.availableSeats || [];
  const booked = this.bookedSeats || [];
  const blocked = this.blockedSeats.map(bs => bs.seat);
  
  return allSeats.filter(seat => 
    !booked.includes(seat) && !blocked.includes(seat)
  );
};

// Method to block seats temporarily
showSchema.methods.blockSeats = function(seats, timeoutMinutes = 5) {
  const availableSeats = this.getAvailableSeats();
  const seatsToBlock = seats.filter(seat => availableSeats.includes(seat));
  
  if (seatsToBlock.length !== seats.length) {
    throw new Error('Some seats are not available to block');
  }
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + timeoutMinutes * 60000);
  
  seatsToBlock.forEach(seat => {
    this.blockedSeats.push({
      seat,
      blockedAt: now,
      expiresAt: expiresAt
    });
  });
   return seatsToBlock;
};

// Method to release blocked seats
showSchema.methods.releaseSeats = function(seats) {
  this.blockedSeats = this.blockedSeats.filter(bs => !seats.includes(bs.seat));
};

// Method to book seats (convert blocked to booked)
showSchema.methods.bookSeats = function(seats) {
  this.getAvailableSeats();
  const blockedSeats = this.blockedSeats.map(bs => bs.seat);
  const seatsToBook = seats.filter(seat => blockedSeats.includes(seat));
  
  if (seatsToBook.length !== seats.length) {
    throw new Error('Some seats are not blocked or already booked');
  }
  
  const existingBookedSeats = new Set(this.bookedSeats || []);
  seatsToBook.forEach(seat => existingBookedSeats.add(seat));
  this.bookedSeats = Array.from(existingBookedSeats);
  this.releaseSeats(seatsToBook);
  return seatsToBook;
};

// Indexes for fast querying
showSchema.index({ movie: 1, theatre: 1 });
showSchema.index({ date: 1, showTime: 1 });
showSchema.index({ theatre: 1, date: 1 });
showSchema.index({ status: 1 });

module.exports = mongoose.model('Show', showSchema);
