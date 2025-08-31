import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { seatsService } from '../services/seatsService'
import { api } from '../services/api'

interface Seat {
  seatNumber: string
  seatType: string
  status: 'available' | 'booked' | 'blocked'
  price: number
  row: string
  number: number
}

const SeatSelection = () => {
  const { showId } = useParams()
  const navigate = useNavigate()
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSeats()
  }, [showId])

  const fetchSeats = async () => {
    try {
      if (showId) {
        const data = await seatsService.getSeatLayout(showId)
        setSeats(data.seatMap)
      }
    } catch (error) {
      console.error('Error fetching seats:', error)
    }
  }

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'available') return

    setSelectedSeats(prev =>
      prev.includes(seat.seatNumber)
        ? prev.filter(s => s !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    )
  }

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatNumber) => {
      const seat = seats.find(s => s.seatNumber === seatNumber)
      return total + (seat?.price || 0)
    }, 0)
  }

  const handleProceedToPay = async () => {
    if (selectedSeats.length === 0 || !showId) return

    setLoading(true)
    try {
      // Prepare seat data for booking
      const seatDetails = selectedSeats.map(seatNumber => {
        const seat = seats.find(s => s.seatNumber === seatNumber)
        return {
          seatNumber,
          seatType: seat?.seatType || 'regular'
        }
      })

      // Create booking
      const response = await api.post('/bookings', {
        showId,
        seats: seatDetails
      })

      const booking = response.data.booking
      console.log('Booking created:', booking)

      // Store booking data in localStorage for payment page
      localStorage.setItem('currentBooking', JSON.stringify(booking))

      // Navigate to payment page
      navigate('/payment')
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Screen */}
        <div className="text-center mb-8">
          <div className="bg-gray-400 h-2 w-3/4 mx-auto rounded-t-lg" />
          <div className="text-gray-600 font-medium mt-2">SCREEN</div>
        </div>

        {/* Seat Map */}
        <div className="grid grid-cols-8 gap-2 mb-8 mx-auto max-w-2xl">
          {seats.map((seat) => (
            <button
              key={seat.seatNumber}
              onClick={() => toggleSeat(seat)}
              disabled={seat.status !== 'available'}
              className={`
                w-8 h-8 rounded text-xs font-medium flex items-center justify-center
                ${seat.status === 'available'
                  ? selectedSeats.includes(seat.seatNumber)
                    ? 'bg-green-500 text-white'
                    : 'bg-white border border-gray-300 hover:border-primary-500'
                  : seat.status === 'booked'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {seat.seatNumber}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded" />
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded" />
            <span className="text-sm">Booked</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-6 shadow-lg fixed bottom-0 left-0 right-0">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Selected Seats</h3>
                <p className="text-gray-600">
                  {selectedSeats.join(', ') || 'No seats selected'}
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold">₹{calculateTotal()}</div>
                <button
                  disabled={selectedSeats.length === 0 || loading}
                  onClick={handleProceedToPay}
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300"
                >
                  {loading ? 'Creating Booking...' : 'Proceed to Pay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeatSelection
