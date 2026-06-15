import { Clock, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

interface MovieCardProps {
  movie: any
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <Link to={`/movie/${movie._id}`} className="group block min-w-[170px]">
      <div className="relative mb-3 overflow-hidden rounded-2xl bg-zinc-900 shadow-lg shadow-black/20">
        <img
          src={movie.poster}
          alt={movie.title}
          className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white backdrop-blur">
          {movie.rating}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
          <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
            <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
            {movie.imdbRating || 'New'}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="mb-1 line-clamp-1 font-semibold text-white transition-colors group-hover:text-rose-300">
          {movie.title}
        </h3>
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
          </div>
          <span className="line-clamp-1">{movie.language}</span>
        </div>
      </div>
    </Link>
  )
}

export default MovieCard
