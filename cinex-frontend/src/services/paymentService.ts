 import { api } from './api'

export interface PaymentOrder {
  orderId: string
  amount: number
  currency: string
  key: string
  booking: {
    id: string
    bookingId: string
    movie: string
    theatre: string
    seats: Array<{ seatNumber: string; seatType: string; price: number }>
    finalAmount: number
  }
}

export const paymentService = {
  createOrder: async (bookingId: string, paymentMethod: string = 'upi'): Promise<PaymentOrder> => {
    const response = await api.post('/payments/create-order', {
      bookingId,
      paymentMethod
    })
    return response.data
  },

  verifyPayment: async (orderId: string, paymentId: string, signature: string) => {
    const response = await api.post('/payments/verify', {
      orderId,
      paymentId,
      signature
    })
    return response.data
  }
}
