import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  const [paymentMethod, setPaymentMethod] = useState<string>('upi')
  const [showPaymentOptions, setShowPaymentOptions] = useState<boolean>(true)
  const [verifyingPayment, setVerifyingPayment] = useState<boolean>(false)
  const [paymentVerified, setPaymentVerified] = useState<boolean>(false)

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
      // Create Razorpay order with selected payment method
      const orderResponse = await paymentService.createOrder(bookingData._id, paymentMethod)

      const options = {
        key: orderResponse.key,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'CineX',
        description: 'Movie Ticket Booking',
        order_id: orderResponse.orderId,
            handler: async (response: any) => {
              try {
                setVerifyingPayment(true)
                setError(null)
                // Verify payment
                const verificationResponse = await paymentService.verifyPayment(
                  response.razorpay_order_id,
                  response.razorpay_payment_id,
                  response.razorpay_signature
                )

                if (verificationResponse.success) {
                  setPaymentVerified(true)
                  // Store booking data for confirmation page
                  localStorage.setItem('lastBooking', JSON.stringify(bookingData))
                  // Clear current booking data
                  localStorage.removeItem('currentBooking')
                  // Wait 2 seconds before redirecting
                  setTimeout(() => {
                    navigate('/profile?tab=bookings')
                  }, 2000)
                } else {
                  setError('Payment verification failed')
                }
              } catch (err) {
                setError('Payment verification failed')
              } finally {
                setVerifyingPayment(false)
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

  const paymentOptionsUI = () => {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
          <h1 className="text-3xl mb-6 text-center">Select Payment Method</h1>
          <div className="space-y-4">
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`w-full py-3 rounded-lg font-semibold ${paymentMethod === 'upi' ? 'bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              UPI
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full py-3 rounded-lg font-semibold ${paymentMethod === 'card' ? 'bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Card
            </button>
            <button
              onClick={() => setPaymentMethod('netbanking')}
              className={`w-full py-3 rounded-lg font-semibold ${paymentMethod === 'netbanking' ? 'bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Net Banking
            </button>
          </div>
          <button
            onClick={() => setShowPaymentOptions(false)}
            className="mt-6 w-full bg-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-700"
          >
            Continue to Pay
          </button>
        </div>
      </div>
    )
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

  if (showPaymentOptions) {
    return paymentOptionsUI()
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

        {verifyingPayment && (
          <div className="flex items-center justify-center mb-4 space-x-2">
            <svg
              className="animate-spin h-6 w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span>Verifying payment...</span>
          </div>
        )}

        {paymentVerified && (
          <div className="flex items-center justify-center mb-4 space-x-2 text-green-400 font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Payment verified successfully!</span>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading || verifyingPayment}
          className="w-full bg-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-600 text-center"
        >
          {loading ? 'Processing...' : `Pay ₹${bookingData.finalAmount}`}
        </button>
      </div>

export default Payment
