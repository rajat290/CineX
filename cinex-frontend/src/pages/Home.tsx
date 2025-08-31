import { useEffect, useState } from 'react'
import { useLocationStore } from '../stores/locationStore'
import { useAuthStore } from '../stores/authStore'
import { movieService } from '../services/movieService'
import Header from '../components/layout/Header'
import HeroCarousel from '../components/home/HeroCarousel'
import MovieSection from '../components/home/MovieSection'
import CategoryNav from '../components/home/CategoryNav'
import LocationGate from '../components/location/LocationGate'
import { Loader2 } from 'lucide-react'
import { type Movie } from '../services/movieService'


const Home = () => {
  const location = useLocationStore(state => state.location)
  const detectedLocationName = useLocationStore(state => state.detectedLocationName)
  const { user, isAuthenticated } = useAuthStore()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noCinemaNearby, setNoCinemaNearby] = useState(false)

  useEffect(() => {
    console.log('Location changed:', location)
    if (location) {
      console.log('Fetching movies for location:', location)
      fetchMovies()
    } else {
      console.log('No location set, cannot fetch movies')
    }
  }, [location])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      setError(null)
      setNoCinemaNearby(false)
      console.log('Making API call to fetch movies...')
      const data = await movieService.getMovies({
        city: location,
        status: 'running'
      })
      console.log('Movies fetched successfully:', data.movies?.length || 0, 'movies')
      if (!data.movies || data.movies.length === 0) {
        setNoCinemaNearby(true)
        // Fetch movies from other locations as fallback
        const fallbackData = await movieService.getMovies({
          status: 'running'
        })
        setMovies(fallbackData.movies || [])
      } else {
        setMovies(data.movies || [])
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load movies'
      console.error('Error fetching movies:', error)
      console.error('Error details:', error.response?.data)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!location) {
    return <LocationGate />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading amazing movies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
          <button
            onClick={fetchMovies}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    // <div className="min-h-screen bg-gray-900 text-white">
    //   <Header />

      <main>
        {/* Welcome Message for logged-in users */}
        {isAuthenticated && user && (
          <div className="bg-primary-600">
            <div className="container mx-auto px-4 py-3">
              <p className="text-center text-white">
                Welcome back, <strong>{user.firstName}</strong>! 🎬
              </p>
            </div>
          </div>
        )}

        {noCinemaNearby && (
          <div className="container mx-auto px-4 py-4 bg-yellow-600 text-black rounded mb-6">
            No cinema nearby for <strong>{detectedLocationName}</strong>. Showing movies from other locations.
          </div>
        )}

        <HeroCarousel movies={movies.slice(0, 5)} />

        <div className="container mx-auto px-4 py-8">
          <CategoryNav />

          {/* Now Showing */}
          <MovieSection
            title="Now Showing in Theaters"
            movies={movies.filter(m => m.status === 'running')}
            viewAllLink="/movies?status=running"
          />

          {/* Coming Soon */}
          <MovieSection
            title="Coming Soon"
            movies={movies.filter(m => m.status === 'upcoming')}
            viewAllLink="/movies?status=upcoming"
          />

          {/* Trending */}
          <MovieSection
            title="Trending This Week"
            movies={movies.sort(() => 0.5 - Math.random()).slice(0, 5)}
            viewAllLink="/movies?sort=trending"
          />

          {/* Recommended based on user preferences */}
          {user?.preferences?.genres && user.preferences.genres.length > 0 ? (
            <MovieSection
              title="Recommended For You"
              movies={movies
                .filter(movie =>
                  movie.genre?.some((genre: string) =>
                    user.preferences!.genres.includes(genre)
                  )
                )
                .slice(0, 5)
              }
              viewAllLink="/movies?recommended=true"
            />
          ) : (
            <MovieSection
              title="Popular Movies"
              movies={movies.slice(0, 5)}
              viewAllLink="/movies"
            />
          )}
        </div>
      </main>
    // </div>
  )
}

export default Home
