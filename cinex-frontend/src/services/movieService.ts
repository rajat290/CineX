import { api } from './api'

export interface Movie {
  _id: string
  title: string
  description: string
  genre: string[]
  language: string
  duration: number
  rating: string
  imdbRating: number
  releaseDate: string
  poster: string
  backdrop?: string
  trailer?: string
  cast: Array<{ name: string; role: string; image?: string }>
  crew: Array<{ name: string; role: string; image?: string }>
  formats: string[]
  status: 'upcoming' | 'running' | 'ended'
  isActive: boolean
}

interface MoviesResponse {
  movies: Movie[]
  total: number
  page: number
  totalPages: number
}

export const movieService = {
  getMovies: async (params?: any): Promise<MoviesResponse> => {
    const response = await api.get('/movies', { params })
    return response.data
  },

  getMovie: async (id: string): Promise<Movie> => {
    const response = await api.get(`/movies/${id}`)
    return response.data
  },

  searchMovies: async (query: string): Promise<MoviesResponse> => {
    const response = await api.get(`/movies/search?q=${query}`)
    return response.data
  },

  getTrending: async (): Promise<MoviesResponse> => {
    const response = await api.get('/movies/trending')
    return response.data
  },

  getUpcoming: async (): Promise<MoviesResponse> => {
    const response = await api.get('/movies/upcoming')
    return response.data
  }
}