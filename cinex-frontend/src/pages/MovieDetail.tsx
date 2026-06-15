import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Calendar, Clock, Play, Star, Ticket } from 'lucide-react'
import { movieService, type Movie } from '../services/movieService'

const MovieDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchMovie()
  }, [id])

  const fetchMovie = async () => {
    try {
      if (id) {
        const data = await movieService.getMovie(id)
        setMovie(data)
      }
    } catch (error) {
      console.error('Error fetching movie:', error)
    }
  }

  if (!movie) return <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 text-white">
      <div 
        className="relative h-[420px] bg-cover bg-center md:h-[520px]"
        style={{ backgroundImage: `url(${movie.backdrop})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20" />
      </div>

      <div className="container relative z-10 -mt-52">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-shrink-0">
            <img
              src={movie.poster}
              alt={movie.title}
              className="aspect-[2/3] w-60 rounded-3xl object-cover shadow-2xl shadow-black/40"
            />
          </div>

          <div className="flex-1">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase text-rose-100 backdrop-blur">
              <Ticket className="h-3.5 w-3.5" />
              Tickets available
            </div>
            <h1 className="mb-3 text-4xl font-black tracking-tight md:text-6xl">{movie.title}</h1>
            
            <div className="mb-7 flex flex-wrap items-center gap-4 text-sm text-zinc-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(movie.releaseDate).getFullYear()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                {movie.imdbRating}/10
              </div>
              <span>{movie.language}</span>
              <span>{movie.formats?.join(' / ')}</span>
            </div>

            <div className="mb-8 flex gap-3">
              <button
                onClick={() => navigate(`/theatres/${movie._id}`)}
                className="rounded-full bg-white px-8 py-3 font-bold text-zinc-950 hover:bg-zinc-200"
              >
                Book tickets
              </button>
              <button className="rounded-full border border-white/10 bg-white/10 px-6 py-3 hover:bg-white/15">
                <Play className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 border-b border-white/10">
              <div className="flex gap-8">
                {['overview', 'cast', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-1 capitalize ${
                      activeTab === tab
                        ? 'border-b-2 border-rose-400 text-white'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div>
                <p className="max-w-3xl leading-7 text-zinc-300">{movie.description}</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <h4 className="mb-2 text-sm text-zinc-500">Genre</h4>
                    <p>{movie.genre.join(', ')}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <h4 className="mb-2 text-sm text-zinc-500">Language</h4>
                    <p>{movie.language}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default MovieDetail
