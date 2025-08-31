import { Link, useLocation } from 'react-router-dom'
import { Film, Calendar, Search, User, Play } from 'lucide-react'

const CategoryNav = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Film, label: 'Movies' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/stream', icon: Play, label: 'Stream' },
    { path: '/profile/live', icon: User, label: 'Live' },
    { path: '/profile/concerts', icon: User, label: 'Concerts' },
    { path: '/profile/plays', icon: User, label: 'Plays' },
    { path: '/profile/sports', icon: User, label: 'Sports' },

  ]

  return (
    <nav className="bg-gray-800 rounded-lg p-4 mb-8">
      <div className="flex flex-wrap gap-4 justify-center">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default CategoryNav
