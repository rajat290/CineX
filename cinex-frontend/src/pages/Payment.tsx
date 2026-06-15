import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'
import { paymentService } from '../services/paymentService'

declare global {
  interface Window {
    Razorpay: any
  }
}

const paymentMethods = ['upi', 'card', 'netbanking']

const Payment = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [paymentVerified, setPaymentVerified] = useState(false)

  useEffect(() => {
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
            const verificationResponse = await paymentService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )

            if (verificationResponse.message === 'Payment verified successfully') {
              setPaymentVerified(true)
              localStorage.setItem('lastBooking', JSON.stringify(bookingData))
              localStorage.removeItem('currentBooking')
              setTimeout(() => navigate('/profile?tab=bookings'), 1200)
            } else {
              setError('Payment verification failed')
            }
          } catch {
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
        theme: { color: '#18181b' }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!bookingData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Preparing payment...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h1 className="text-2xl font-black">Complete payment</h1>
        <p className="mt-2 text-sm text-zinc-400">Confirm your seats and choose a payment method.</p>

        <div className="my-6 space-y-3 rounded-2xl bg-black/20 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500">Movie</span>
            <span className="text-right font-semibold">{bookingData.movie?.title}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500">Seats</span>
            <span className="text-right font-semibold">{bookingData.seats?.map((seat: any) => seat.seatNumber).join(', ')}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-white/10 pt-3 text-base">
            <span>Total</span>
            <span className="font-black">INR {bookingData.finalAmount}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {paymentMethods.map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`rounded-2xl border px-3 py-3 text-sm font-bold capitalize ${
                paymentMethod === method
                  ? 'border-white bg-white text-zinc-950'
                  : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]'
              }`}
            >
              {method === 'netbanking' ? 'Netbanking' : method}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-center text-sm text-rose-300">{error}</p>}
        {verifyingPayment && <p className="mt-4 text-center text-sm text-zinc-400">Verifying payment...</p>}
        {paymentVerified && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-300">
            <CheckCircle className="h-4 w-4" />
            Payment verified
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading || verifyingPayment}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Pay INR {bookingData.finalAmount}
        </button>
      </section>
    </main>
  )
}

export default Payment
