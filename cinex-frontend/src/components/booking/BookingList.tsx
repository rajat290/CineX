import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Users, ChevronRight, AlertCircle } from 'lucide-react'
import { bookingService } from '../../services/bookingService'

interface Booking {
  _id: string
  bookingId: string
  movie: {
    title: string
    poster: string
  }
  theatre: {
    name: string
    address: string
  }
  show: {
    date: string
    showTime: string
    language: string
    format: string
  }
  seats: Array<{
    seatNumber: string
    seatType: string
    price: number
  }>
  finalAmount: number
  status: string
  showDate: string
  showTime: string
  createdAt: string
}

interface BookingListProps {
  onBookingClick: (booking: Booking) => void
}

const BookingList: React.FC<BookingListProps> = ({ onBookingClick }) => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [page])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingService.getUserBookings(page, 10)
      if (page === 1) {
        setBookings(response.bookings)
      } else {
        setBookings(prev => [...prev, ...response.bookings])
      }
      setHasMore(response.bookings.length === 10)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-500 bg-green-500/10'
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'cancelled':
        return 'text-red-500 bg-red-500/10'
      case 'expired':
        return 'text-gray-500 bg-gray-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Bookings</h3>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (loading && bookings.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-24 bg-gray-700 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
        <p className="text-gray-600 text-center">You haven't made any bookings yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking._id}
          onClick={() => onBookingClick(booking)}
          className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-center space-x-4">
            {/* Movie Poster */}
            <div className="w-16 h-24 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
              {booking.movie?.poster ? (
                <img
                  src={booking.movie.poster}
                  alt={booking.movie.title}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-gray-400 text-xs text-center">No Image</div>
              )}
            </div>

            {/* Booking Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-white truncate">
                  {booking.movie?.title}
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{booking.theatre?.name}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(booking.showDate)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{booking.showTime}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{booking.seats.map(seat => seat.seatNumber).join(', ')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-lg font-bold text-white">
                  ₹{booking.finalAmount}
                </div>
                <div className="text-sm text-gray-400">
                  {booking.bookingId}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        </div>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}

export default BookingList
