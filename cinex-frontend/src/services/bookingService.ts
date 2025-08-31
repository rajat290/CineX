import { api } from './api'

export const bookingService = {
  // Get user's bookings
  getUserBookings: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    if (status) params.append('status', status)

    const response = await api.get(`/bookings?${params}`)
    return response.data
  },

  // Get booking by ID
  getBookingById: async (bookingId: string) => {
    const response = await api.get(`/bookings/${bookingId}`)
    return response.data
  },

  // Cancel booking
  cancelBooking: async (bookingId: string, reason: string) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`, { reason })
    return response.data
  },

  // Download booking PDF
  downloadBookingPDF: async (bookingId: string) => {
    const response = await api.get(`/bookings/${bookingId}/download-pdf`, {
      responseType: 'blob'
    })
    return response.data
  }
}

export default bookingService
