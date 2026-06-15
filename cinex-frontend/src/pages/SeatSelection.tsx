import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
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
      const seatDetails = selectedSeats.map(seatNumber => {
        const seat = seats.find(s => s.seatNumber === seatNumber)
        return {
          seatNumber,
          seatType: seat?.seatType || 'regular'
        }
      })

      const hold = await seatsService.blockSeats(showId, seatDetails)

      const response = await api.post('/bookings', {
        showId,
        seats: seatDetails,
        holdId: hold.holdId
      })

      localStorage.setItem('currentBooking', JSON.stringify(response.data.booking))
      localStorage.setItem('currentHold', JSON.stringify({ holdId: hold.holdId, showId, seats: seatDetails }))
      navigate('/payment')
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
      fetchSeats()
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 pb-40 text-white">
      <div className="container py-8">
        <div className="mb-8 text-center">
          <div className="mx-auto h-2 w-3/4 rounded-t-lg bg-white/30" />
          <div className="mt-2 text-sm font-bold uppercase text-zinc-500">Screen</div>
        </div>

        <div className="mx-auto mb-8 grid max-w-2xl grid-cols-8 gap-2 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          {seats.map((seat) => {
            const selected = selectedSeats.includes(seat.seatNumber)
            return (
              <button
                key={seat.seatNumber}
                onClick={() => toggleSeat(seat)}
                disabled={seat.status !== 'available'}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                  seat.status === 'available'
                    ? selected
                      ? 'bg-emerald-500 text-white'
                      : 'border border-white/10 bg-white/[0.08] text-zinc-200 hover:border-rose-300'
                    : seat.status === 'booked'
                      ? 'cursor-not-allowed bg-zinc-800 text-zinc-600'
                      : 'cursor-not-allowed bg-zinc-900 text-zinc-600'
                }`}
              >
                {seat.seatNumber}
              </button>
            )
          })}
        </div>

        <div className="mb-8 flex justify-center gap-6 text-zinc-300">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-white/10 bg-white/[0.08]" />
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-emerald-500" />
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-zinc-800" />
            <span className="text-sm">Booked</span>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur">
          <div className="container max-w-4xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Selected seats</h3>
                <p className="text-sm text-zinc-400">
                  {selectedSeats.join(', ') || 'No seats selected'}
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black">INR {calculateTotal()}</div>
                <button
                  disabled={selectedSeats.length === 0 || loading}
                  onClick={handleProceedToPay}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Creating booking' : 'Proceed to pay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default SeatSelection
