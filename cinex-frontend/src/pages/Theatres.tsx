import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { showService } from '../services/showService'
import { useLocationStore } from '../stores/locationStore'

const Theatres = () => {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const location = useLocationStore(state => state.location)
  const [theatres, setTheatres] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTheatre, setSelectedTheatre] = useState<any>(null)

  useEffect(() => {
    fetchTheatres()
  }, [movieId, selectedDate, location])

  const fetchTheatres = async () => {
    try {
      const data = await showService.getTheatresForMovie(movieId!, {
        date: selectedDate.toISOString().split('T')[0],
        city: location
      })
      setTheatres(data.theatres || [])

      if ((!data.theatres || data.theatres.length === 0) && location) {
        const dataWithoutCity = await showService.getTheatresForMovie(movieId!, {
          date: selectedDate.toISOString().split('T')[0]
        })
        setTheatres(dataWithoutCity.theatres || [])
      }
    } catch {
      setTheatres([])
    }
  }

  const handleTheatreClick = (theatreData: any) => {
    setSelectedTheatre(theatreData.theatre || theatreData)
  }

  const handleShowTimeClick = (show: any) => {
    navigate(`/seats/${show.id || show._id}`)
  }

  if (selectedTheatre) {
    const theatreShows = theatres.find(t => (t.theatre || t)._id === selectedTheatre._id)?.shows || []

    return (
      <main className="min-h-screen bg-zinc-950 pb-24 text-white">
        <div className="container py-8">
          <button
            onClick={() => setSelectedTheatre(null)}
            className="mb-6 inline-flex items-center gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to theatres
          </button>

          <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h1 className="mb-2 text-3xl font-black tracking-tight">{selectedTheatre.name}</h1>
            <div className="flex items-center text-zinc-300">
              <MapPin className="mr-2 h-4 w-4 text-rose-300" />
              {selectedTheatre.address?.area || 'Area not available'}, {selectedTheatre.address?.city || 'City not available'}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-black">Select show time</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {theatreShows.map((show: any) => (
                <button
                  key={show.id || show._id}
                  onClick={() => handleShowTimeClick(show)}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center transition-colors hover:bg-white/[0.08]"
                >
                  <div className="text-lg font-black">{show.showTime}</div>
                  <div className="mt-1 text-sm text-zinc-400">{show.format}</div>
                  <div className="mt-2 font-semibold text-rose-300">
                    INR {show.pricing?.[0]?.price || 'N/A'}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-white">
      <div className="container py-8">
        <h1 className="mb-2 text-4xl font-black tracking-tight">Select theatre</h1>
        <p className="mb-6 text-zinc-400">Choose a date, venue and showtime for your plan.</p>

        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="mb-3 font-semibold">Select date</h3>
          <div className="flex gap-2 overflow-x-auto">
            {[...Array(7)].map((_, index) => {
              const date = new Date()
              date.setDate(date.getDate() + index)
              const active = date.toDateString() === selectedDate.toDateString()

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`min-w-20 rounded-2xl px-4 py-3 ${
                    active
                      ? 'bg-white text-zinc-950'
                      : 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]'
                  }`}
                >
                  <div className="text-sm">{date.toLocaleDateString('en', { weekday: 'short' })}</div>
                  <div className="font-black">{date.getDate()}</div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="space-y-4">
          {theatres.map((theatreData) => {
            const theatre = theatreData.theatre || theatreData
            return (
              <article
                key={theatre._id}
                onClick={() => handleTheatreClick(theatreData)}
                className="cursor-pointer rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:bg-white/[0.08]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="mb-2 text-lg font-black">{theatre.name}</h3>
                    <div className="mb-3 flex items-center text-zinc-300">
                      <MapPin className="mr-1 h-4 w-4 text-rose-300" />
                      {theatre.address?.area || 'Area not available'}, {theatre.address?.city || 'City not available'}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {(theatreData.shows || []).length} shows available
                    </div>
                  </div>
                  <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-950">
                    Select
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </main>
  )
}

export default Theatres
