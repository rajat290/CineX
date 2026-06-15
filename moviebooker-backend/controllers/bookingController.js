const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Payment = require('../models/Payment');
const SeatHold = require('../models/SeatHold');
const Offer = require('../models/Offer');
const Wallet = require('../models/Wallet');
const { sendCancellationEmail } = require('../utils/emailService');
const withTransaction = require('../utils/withTransaction');

// Create new booking
const createBooking = async (req, res) => {
  try {
    const { showId, seats, holdId, offerCode } = req.body;

    // Validate input
    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'Show ID and seats are required' });
    }

    // Validate showId format (should be a valid MongoDB ObjectId)
    if (!showId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid Show ID format. Please provide a valid 24-character hexadecimal MongoDB ObjectId.',
        details: {
          expectedFormat: '24-character hexadecimal string (0-9, a-f, A-F)',
          example: '507f1f77bcf86cd799439011',
          received: showId,
          length: showId.length,
          isValidHex: /^[0-9a-fA-F]+$/.test(showId)
        }
      });
    }

    const result = await withTransaction(async (session) => {
      // Get show details
      const show = await Show.findById(showId)
        .populate('movie')
        .populate('theatre')
        .session(session);

      if (!show) {
        return { statusCode: 404, body: { message: 'Show not found' } };
      }

      let seatHold = null;
      let requestedSeats = seats.map(seat => seat.seatNumber);

      if (holdId) {
        seatHold = await SeatHold.findOne({
          _id: holdId,
          user: req.user._id,
          show: show._id,
          status: 'active',
          expiresAt: { $gt: new Date() }
        }).session(session);

        if (!seatHold) {
          return { statusCode: 400, body: { message: 'Seat hold is invalid or expired' } };
        }

        requestedSeats = seatHold.seats.map(seat => seat.seatNumber);
      }

      // Check seat availability
      const availableSeats = show.getAvailableSeats();

      const unavailableSeats = holdId
        ? []
        : requestedSeats.filter(seat => !availableSeats.includes(seat));

      if (unavailableSeats.length > 0) {
        return {
          statusCode: 400,
          body: {
            message: 'Some seats are not available',
            unavailableSeats
          }
        };
      }

      // Calculate pricing
      let totalAmount = 0;
      const seatDetails = (seatHold?.seats || seats).map(seat => {
        const seatPrice = show.pricing.find(p => p.seatType === seat.seatType)?.price || 0;
        totalAmount += seatPrice;
        return {
          seatNumber: seat.seatNumber,
          seatType: seat.seatType,
          price: seatPrice
        };
      });

      // Add convenience fee and tax (example: 10% convenience fee + 18% GST)
      const convenienceFee = Math.round(totalAmount * 0.10);
      const tax = Math.round((totalAmount + convenienceFee) * 0.18);
      let discount = 0;
      let appliedOffer = null;

      if (offerCode) {
        appliedOffer = await Offer.findOne({
          code: offerCode.toUpperCase(),
          isActive: true,
          validFrom: { $lte: new Date() },
          validUntil: { $gte: new Date() }
        }).session(session);

        if (!appliedOffer) {
          return { statusCode: 400, body: { message: 'Offer is invalid or expired' } };
        }

        discount = appliedOffer.calculateDiscount(totalAmount + convenienceFee + tax);
      }

      const finalAmount = totalAmount + convenienceFee + tax - discount;
      const loyaltyPointsEarned = Math.floor(finalAmount / 100);

      // Generate bookingId explicitly
      const count = await Booking.countDocuments().session(session);
      const bookingId = `CINEX${(count + 1).toString().padStart(4, '0')}`;

      // Create booking
      const booking = new Booking({
        bookingId,
        user: req.user._id,
        show: showId,
        movie: show.movie._id,
        theatre: show.theatre._id,
        seatHold: seatHold?._id,
        bookingType: 'movie',
        seats: seatDetails,
        totalAmount,
        convenienceFee,
        tax,
        discount,
        offer: appliedOffer?._id,
        offerCode: appliedOffer?.code,
        loyaltyPointsEarned,
        finalAmount,
        showDate: show.date,
        showTime: show.showTime,
        status: 'pending',
        paymentStatus: 'pending'
      });

      if (!seatHold) {
        show.blockSeats(requestedSeats, 10);
        await show.save({ session });
      }

      await booking.save({ session });

      if (seatHold) {
        seatHold.status = 'converted';
        seatHold.convertedBooking = booking._id;
        await seatHold.save({ session });
      }

      if (appliedOffer) {
        appliedOffer.usageCount += 1;
        await appliedOffer.save({ session });
      }

      return {
        statusCode: 201,
        body: {
          message: 'Booking created successfully',
          booking,
          paymentRequired: true
        }
      };
    });

    res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error('Create booking error:', error);
    if (error instanceof SyntaxError) {
        return res.status(400).json({ message: 'Invalid JSON format' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get user's bookings
const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = { user: req.user._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('movie', 'title poster')
      .populate('theatre', 'name address')
      .populate('show', 'date showTime language format')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single user booking
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie', 'title poster')
      .populate('theatre', 'name address')
      .populate('show', 'date showTime language format')
      .populate('user', 'firstName lastName email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('show')
      .populate('movie')
      .populate('theatre')
      .populate('user');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Check if show has already started
    const showDateTime = new Date(booking.showDate);
    const [hours, minutes] = booking.showTime.split(':');
    showDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const currentTime = new Date();
    const timeDifference = showDateTime - currentTime;
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    // 3 hours se pehle cancel allow nahi
    if (hoursDifference < 3) {
      return res.status(400).json({ 
        message: 'Cancellation not allowed within 3 hours of show time' 
      });
    }

    await withTransaction(async (session) => {
      // Release seats back to available
      const show = await Show.findById(booking.show).session(session);
      const seatNumbers = booking.seats.map(seat => seat.seatNumber);
      if (show) {
        show.releaseSeats(seatNumbers);
        show.bookedSeats = show.bookedSeats.filter(seat => !seatNumbers.includes(seat));
        await show.save({ session });
      }

      // Update booking status
      booking.status = 'cancelled';
      booking.cancellationReason = reason;
      booking.paymentStatus = 'refunded';
      booking.refundAmount = booking.finalAmount * 0.8; // 80% refund
      await booking.save({ session });

      await Wallet.findOneAndUpdate(
        { user: req.user._id },
        {
          $inc: { balance: booking.refundAmount },
          $push: {
            transactions: {
              type: 'refund',
              amount: booking.refundAmount,
              reason: reason || 'Booking cancellation refund',
              referenceType: 'booking',
              referenceId: booking._id
            }
          }
        },
        { upsert: true, new: true, session }
      );

      if (booking.seatHold) {
        await SeatHold.findByIdAndUpdate(booking.seatHold, { status: 'released' }, { session });
      }

      // Update payment record
      await Payment.findOneAndUpdate(
        { booking: booking._id },
        {
          status: 'refunded',
          refundDetails: {
            refundAmount: booking.refundAmount,
            refundDate: new Date(),
            reason: reason || 'User requested cancellation'
          }
        },
        { session }
      );
    });

    // Send cancellation email
    try {
      await sendCancellationEmail(
        booking.user,
        booking,
        booking.movie,
        booking.theatre
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({
      message: 'Booking cancelled successfully',
      refundAmount: booking.refundAmount,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        refundAmount: booking.refundAmount
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: error.message });
  }
};

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Download booking PDF
const downloadBookingPDF = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie', 'title poster')
      .populate('theatre', 'name address')
      .populate('show', 'date showTime language format')
      .populate('user', 'firstName lastName email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=CineX-Ticket-${booking.bookingId}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add header
    doc.fillColor('#dc2626')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('CineX', 50, 50);

    doc.fillColor('#6b7280')
       .fontSize(12)
       .font('Helvetica')
       .text('Movie Ticket', 50, 75);

    // Booking ID
    doc.fillColor('#000000')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(`Booking ID: ${booking.bookingId}`, 400, 50);

    // Add a line separator
    doc.moveTo(50, 100)
       .lineTo(550, 100)
       .stroke('#e5e7eb');

    // Movie details
    doc.fillColor('#000000')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(booking.movie.title, 50, 120);

    doc.fillColor('#6b7280')
       .fontSize(12)
       .font('Helvetica')
       .text(`${booking.theatre.name} - ${booking.theatre.address}`, 50, 145);

    // Show details
    const showDate = new Date(booking.showDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const [hours, minutes] = booking.showTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const formattedTime = `${displayHour}:${minutes} ${ampm}`;

    doc.fillColor('#000000')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(`${showDate} at ${formattedTime}`, 50, 170);

    if (booking.show.language) {
      doc.fillColor('#6b7280')
         .fontSize(12)
         .font('Helvetica')
         .text(`Language: ${booking.show.language}${booking.show.format ? ` | Format: ${booking.show.format}` : ''}`, 50, 190);
    }

    // Seats section
    doc.fillColor('#000000')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Seats', 50, 220);

    let yPosition = 245;
    booking.seats.forEach((seat, index) => {
      doc.fillColor('#000000')
         .fontSize(12)
         .font('Helvetica')
         .text(`Seat ${seat.seatNumber} (${seat.seatType})`, 70, yPosition);

      doc.fillColor('#000000')
         .fontSize(12)
         .font('Helvetica')
         .text(`₹${seat.price}`, 400, yPosition);

      yPosition += 20;
    });

    // Payment details
    yPosition += 20;
    doc.fillColor('#000000')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Payment Details', 50, yPosition);

    yPosition += 25;
    doc.fillColor('#6b7280')
       .fontSize(12)
       .font('Helvetica')
       .text('Ticket Amount:', 70, yPosition);
    doc.text(`₹${booking.totalAmount}`, 400, yPosition);

    yPosition += 20;
    doc.fillColor('#6b7280')
       .fontSize(12)
       .font('Helvetica')
       .text('Convenience Fee:', 70, yPosition);
    doc.text(`₹${booking.convenienceFee}`, 400, yPosition);

    yPosition += 20;
    doc.fillColor('#6b7280')
       .fontSize(12)
       .font('Helvetica')
       .text('Tax:', 70, yPosition);
    doc.text(`₹${booking.tax}`, 400, yPosition);

    yPosition += 25;
    doc.moveTo(50, yPosition)
       .lineTo(550, yPosition)
       .stroke('#e5e7eb');

    yPosition += 15;
    doc.fillColor('#000000')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Total Amount:', 70, yPosition);
    doc.text(`₹${booking.finalAmount}`, 400, yPosition);

    // QR Code placeholder
    yPosition += 50;
    doc.fillColor('#6b7280')
       .fontSize(10)
       .font('Helvetica')
       .text('Scan QR code at theatre entrance', 50, yPosition);

    // Draw QR code placeholder
    doc.rect(400, yPosition - 10, 80, 80)
       .stroke('#6b7280');

    doc.fillColor('#6b7280')
       .fontSize(8)
       .font('Helvetica')
       .text('QR CODE', 420, yPosition + 30);

    // Footer
    yPosition += 100;
    doc.fillColor('#6b7280')
       .fontSize(10)
       .font('Helvetica')
       .text('Important Information:', 50, yPosition);

    yPosition += 20;
    doc.fillColor('#6b7280')
       .fontSize(9)
       .font('Helvetica')
       .text('• Please arrive at the theatre 30 minutes before show time', 50, yPosition);

    yPosition += 15;
    doc.fillColor('#6b7280')
       .fontSize(9)
       .font('Helvetica')
       .text('• Carry a valid ID proof along with this ticket', 50, yPosition);

    yPosition += 15;
    doc.fillColor('#6b7280')
       .fontSize(9)
       .font('Helvetica')
       .text('• No outside food or beverages allowed', 50, yPosition);

    yPosition += 15;
    doc.fillColor('#6b7280')
       .fontSize(9)
       .font('Helvetica')
       .text('• Tickets are non-transferable and non-refundable', 50, yPosition);

    // Contact info
    yPosition += 30;
    doc.fillColor('#6b7280')
       .fontSize(9)
       .font('Helvetica')
       .text('For support, contact us at support@cinemabooker.com', 50, yPosition);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  downloadBookingPDF
};
