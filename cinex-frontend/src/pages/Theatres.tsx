import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
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
      console.log('Fetching theatres for movie:', movieId, 'city:', location, 'date:', selectedDate.toISOString().split('T')[0])
      const data = await showService.getTheatresForMovie(movieId!, {
        date: selectedDate.toISOString().split('T')[0],
        city: location
      })
      console.log('API response:', data)
      setTheatres(data.theatres || [])

      // If no theatres found with city filter, try without city filter
      if ((!data.theatres || data.theatres.length === 0) && location) {
        console.log('No theatres found with city filter, trying without city filter...')
        const dataWithoutCity = await showService.getTheatresForMovie(movieId!, {
          date: selectedDate.toISOString().split('T')[0]
        })
        console.log('API response without city filter:', dataWithoutCity)
        setTheatres(dataWithoutCity.theatres || [])
      }
    } catch (error) {
      console.error('Error fetching theatres:', error)
      setTheatres([])
    }
  }

  const handleTheatreClick = (theatreData: any) => {
    const theatre = theatreData.theatre || theatreData;
    setSelectedTheatre(theatre)
  }

  const handleShowTimeClick = (show: any) => {
    navigate(`/seats/${show.id || show._id}`)
  }

  if (selectedTheatre) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedTheatre(null)}
            className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
          >
            ← Back to Theatres
          </button>

          {/* Theatre Header */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{selectedTheatre.name}</h1>
            <div className="flex items-center text-gray-300">
              <MapPin className="w-4 h-4 mr-2" />
              {selectedTheatre.address?.area || 'Area not available'}, {selectedTheatre.address?.city || 'City not available'}
            </div>
          </div>

          {/* Show Times */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Show Time</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {theatres.find(t => (t.theatre || t)._id === selectedTheatre._id)?.shows?.map((show: any) => (
                <button
                  key={show.id || show._id}
                  onClick={() => handleShowTimeClick(show)}
                  className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-colors"
                >
                  <div className="text-lg font-semibold">{show.showTime}</div>
                  <div className="text-sm text-gray-400 mt-1">{show.format}</div>
                  <div className="text-primary-400 font-medium mt-2">
                    ₹{show.pricing?.[0]?.price || 'N/A'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Select Theatre</h1>

        {/* Date Selector */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Select Date</h3>
          <div className="flex gap-2 overflow-x-auto">
            {[...Array(7)].map((_, i) => {
              const date = new Date()
              date.setDate(date.getDate() + i)
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-lg min-w-20 ${
                    date.toDateString() === selectedDate.toDateString()
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-sm">{date.toLocaleDateString('en', { weekday: 'short' })}</div>
                  <div className="font-semibold">{date.getDate()}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Theatres List */}
        <div className="space-y-4">
          {theatres.map((theatreData) => {
            const theatre = theatreData.theatre || theatreData;
            return (
              <div
                key={theatre._id}
                onClick={() => handleTheatreClick(theatreData)}
                className="bg-gray-800 rounded-lg p-4 shadow cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{theatre.name}</h3>
                    <div className="flex items-center text-gray-300 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {theatre.address?.area || 'Area not available'}, {theatre.address?.city || 'City not available'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {(theatreData.shows || []).length} shows available
                    </div>
                  </div>
                  <div className="text-primary-400">
                    →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default Theatres
