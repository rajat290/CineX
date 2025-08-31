import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { paymentService } from '../services/paymentService'

declare global {
  interface Window {
    Razorpay: any
  }
}

const Payment = () => {
  const { showId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<any>(null)

  useEffect(() => {
    // Get booking data from localStorage or state management
    const booking = localStorage.getItem('currentBooking')
    if (booking) {
      setBookingData(JSON.parse(booking))
    }
  }, [])

  const handlePayment = async () => {
    if (!bookingData) {
      setError('No booking data found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create Razorpay order
      const orderResponse = await paymentService.createOrder(bookingData._id)

      const options = {
        key: orderResponse.key,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'CineX',
        description: 'Movie Ticket Booking',
        order_id: orderResponse.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verificationResponse = await paymentService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )

            if (verificationResponse.success) {
              // Store booking data for confirmation page
              localStorage.setItem('lastBooking', JSON.stringify(bookingData))
              // Clear current booking data
              localStorage.removeItem('currentBooking')
              navigate('/confirmation')
            } else {
              setError('Payment verification failed')
            }
          } catch (err) {
            setError('Payment verification failed')
          }
        },
        prefill: {
          name: bookingData.user?.name || '',
          email: bookingData.user?.email || '',
          contact: bookingData.user?.phone || ''
        },
        theme: {
          color: '#1f2937'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>Please wait while we prepare your payment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl mb-6 text-center">Payment Details</h1>

        {/* Booking Summary */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Movie:</span>
              <span>{bookingData.movie?.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Theatre:</span>
              <span>{bookingData.theatre?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Seats:</span>
              <span>{bookingData.seats?.map((s: any) => s.seatNumber).join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span>{bookingData.showDate} {bookingData.showTime}</span>
            </div>
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="border-t border-gray-600 pt-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Ticket Amount:</span>
              <span>₹{bookingData.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Convenience Fee:</span>
              <span>₹{bookingData.convenienceFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>₹{bookingData.tax}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-gray-600 pt-2">
              <span>Total:</span>
              <span>₹{bookingData.finalAmount}</span>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-600 text-center"
        >
          {loading ? 'Processing...' : `Pay ₹${bookingData.finalAmount}`}
        </button>
      </div>
    </div>
  )
}

export default Payment
