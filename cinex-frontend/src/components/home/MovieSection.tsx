import { ChevronRight } from 'lucide-react'
import MovieCard from './MovieCard'
import { Link } from 'react-router-dom'

interface MovieSectionProps {
  title: string
  movies: any[]
  viewAllLink?: string
}

const MovieSection = ({ title, movies, viewAllLink }: MovieSectionProps) => {
  if (movies.length === 0) return null

  return (
    <section className="mb-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
        </div>
        {viewAllLink && (
          <Link 
            to={viewAllLink}
            className="flex items-center gap-1 text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:px-0 lg:grid-cols-4 xl:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </section>
  )
}

export default MovieSection
