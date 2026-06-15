import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play, Star, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'

interface HeroCarouselProps {
  movies: any[]
}

const HeroCarousel = ({ movies }: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (movies.length <= 1) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % movies.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [movies.length])

  if (movies.length === 0) return null

  return (
    <div className="relative overflow-hidden rounded-none bg-zinc-950 md:rounded-[2rem]">
      {movies.map((movie, index) => (
        <div
          key={movie._id}
          aria-hidden={index !== currentSlide}
          className={`transition-opacity duration-500 ${
            index === currentSlide ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'
          }`}
        >
          <div
            className="min-h-[460px] bg-cover bg-center md:min-h-[520px]"
            style={{ backgroundImage: `url(${movie.backdrop})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent p-6 pt-24 text-white md:p-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-rose-100 backdrop-blur">
                <Ticket className="h-3.5 w-3.5" />
                Now booking
              </div>
              <h2 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">{movie.title}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 md:text-base">{movie.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                  {movie.imdbRating || 'New'}
                </span>
                <span>{movie.language}</span>
                <span>{movie.formats?.join(' / ')}</span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to={`/theatres/${movie._id}`} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200">
                  Book tickets
                </Link>
                <Link to={`/movie/${movie._id}`} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur hover:bg-white/15">
                  <Play className="w-4 h-4" />
                  Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + movies.length) % movies.length)}
        className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-2 backdrop-blur hover:bg-black/60 md:block"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % movies.length)}
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-2 backdrop-blur hover:bg-black/60 md:block"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 right-6 flex gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroCarousel
