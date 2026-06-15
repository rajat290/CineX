import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, MapPin, Search } from 'lucide-react'
import { useLocationStore } from '../stores/locationStore'
import { useAuthStore } from '../stores/authStore'
import { movieService, type Movie } from '../services/movieService'
import HeroCarousel from '../components/home/HeroCarousel'
import MovieSection from '../components/home/MovieSection'
import CategoryNav from '../components/home/CategoryNav'
import LocationGate from '../components/location/LocationGate'
import ExperienceCard from '../components/discovery/ExperienceCard'
import { experienceCollections, fallbackMovies } from '../data/discovery'

const Home = () => {
  const location = useLocationStore(state => state.location)
  const detectedLocationName = useLocationStore(state => state.detectedLocationName)
  const { user, isAuthenticated } = useAuthStore()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noCinemaNearby, setNoCinemaNearby] = useState(false)

  useEffect(() => {
    if (location) {
      fetchMovies()
    }
  }, [location])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      setError(null)
      setNoCinemaNearby(false)
      const data = await movieService.getMovies({
        city: location,
        status: 'running'
      })

      if (!data.movies || data.movies.length === 0) {
        setNoCinemaNearby(true)
        const fallbackData = await movieService.getMovies({ status: 'running' })
        setMovies(fallbackData.movies || [])
      } else {
        setMovies(data.movies || [])
      }
    } catch (error: any) {
      setMovies(fallbackMovies)
      setError(error.response?.data?.message || 'Live movie data is unavailable. Showing demo picks.')
    } finally {
      setLoading(false)
    }
  }

  if (!location) {
    return <LocationGate />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-rose-400" />
          <p className="text-zinc-300">Loading your city guide...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-zinc-950 text-white">
      {isAuthenticated && user && (
        <div className="border-b border-white/10 bg-white/[0.04]">
          <div className="container py-3">
            <p className="text-sm text-zinc-300">
              Welcome back, <strong className="text-white">{user.firstName}</strong>. Fresh picks are ready for {location}.
            </p>
          </div>
        </div>
      )}

      {noCinemaNearby && (
        <div className="container my-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-4 text-amber-100">
          No cinema nearby for <strong>{detectedLocationName || location}</strong>. Showing movies from other locations.
        </div>
      )}

      <section className="container py-6 md:py-8">
        {error && (
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-400">
            <span>Showing sample picks while live listings reconnect.</span>
            <button onClick={fetchMovies} className="font-semibold text-white">
              Retry
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase text-zinc-300">
              <MapPin className="h-3.5 w-3.5 text-rose-300" />
              {location}
            </div>
            <h1 className="max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
              Movies and city experiences, booked without the chaos.
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Start with what is playing near you, then add live events, plays or sports if the evening needs more.
            </p>
          </div>
          <Link to="/search" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white hover:bg-white/[0.1]">
            <Search className="h-4 w-4" />
            Search
          </Link>
        </div>
        <CategoryNav />
      </section>

      <section className="container">
        <HeroCarousel movies={movies.slice(0, 5)} />
      </section>

      <div className="container py-10">
        <MovieSection
          title="Now showing"
          movies={movies.filter(m => m.status === 'running')}
          viewAllLink="/search"
        />

        <section className="mb-12 border-t border-white/10 pt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Add something live</h2>
              <p className="mt-1 text-sm text-zinc-500">Comedy, music, plays and sports when a movie is not enough.</p>
            </div>
            <Link to="/events" className="text-sm font-semibold text-zinc-300 hover:text-white">View events</Link>
          </div>
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {experienceCollections.slice(0, 4).map((item) => (
              <ExperienceCard key={item.id} {...item} />
            ))}
          </div>
        </section>

        <MovieSection
          title="Coming soon"
          movies={movies.filter(m => m.status === 'upcoming')}
          viewAllLink="/search"
        />

        {user?.preferences?.genres && user.preferences.genres.length > 0 && (
          <MovieSection
            title="Recommended for you"
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
        )}
      </div>
    </main>
  )
}

export default Home
