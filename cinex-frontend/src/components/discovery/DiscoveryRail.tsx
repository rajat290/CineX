import { Link, useLocation } from 'react-router-dom'
import { discoveryCategories } from '../../data/discovery'

const DiscoveryRail = () => {
  const location = useLocation()

  return (
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0" aria-label="Discovery categories">
      {discoveryCategories.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.path

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`inline-flex min-w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? 'border-white bg-white text-zinc-950'
                : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.08]'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default DiscoveryRail
