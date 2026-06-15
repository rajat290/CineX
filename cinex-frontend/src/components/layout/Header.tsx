import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useLocationStore } from '../../stores/locationStore'
import LocationGate from '../location/LocationGate'
import { MapPin, Search, UserCircle } from 'lucide-react'

const Header = () => {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocationStore(state => state.location)
  const [showLocationGate, setShowLocationGate] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/85 text-white backdrop-blur-xl">
      <div className="container flex items-center justify-between gap-3 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-lg font-black">
            X
          </span>
          <span className="text-xl font-black tracking-tight">CineX</span>
        </Link>

        <Link
          to="/search"
          className="hidden max-w-xl flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-zinc-500 transition hover:border-white/20 hover:text-white md:flex"
        >
          <Search className="h-4 w-4" />
          Search movies and experiences
        </Link>

        <nav className="flex items-center gap-2">
          <button
            onClick={() => setShowLocationGate(true)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold hover:bg-white/[0.1]"
            aria-label="Select Location"
          >
            <MapPin className="h-4 w-4 text-rose-300" />
            <span className="hidden sm:inline">{location || 'Select City'}</span>
          </button>

          {isAuthenticated && user ? (
            <>
              <Link to="/profile" aria-label={`Open ${user.firstName}'s profile`}>
                <UserCircle className="h-8 w-8 text-zinc-300 hover:text-white" />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/[0.08]"
              >
                Sign in
              </Link>
            </>
          )}
        </nav>
      </div>

      {showLocationGate && <LocationGate />}
    </header>
  )
}

export default Header
