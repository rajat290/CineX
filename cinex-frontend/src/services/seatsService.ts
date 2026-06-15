import { api } from './api'

export interface Seat {
  seatNumber: string
  seatType: string
  price: number
  status: 'available' | 'booked' | 'blocked'
  row: string
  number: number
}

export interface SeatSelectionRequest {
  seatNumber: string
  seatType?: string
}

export const seatsService = {
  getSeatLayout: async (showId: string) => {
    const response = await api.get(`/seats/${showId}/seats`)
    return response.data
  },

  blockSeats: async (showId: string, seats: Array<string | SeatSelectionRequest>) => {
    const response = await api.post(`/seats/${showId}/block-seats`, { seats })
    return response.data
  },

  releaseSeats: async (showId: string, seats: Array<string | SeatSelectionRequest>, holdId?: string) => {
    const response = await api.post(`/seats/${showId}/release-seats`, { seats, holdId })
    return response.data
  }
}
