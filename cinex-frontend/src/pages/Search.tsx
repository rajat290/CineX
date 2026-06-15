import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, TrendingUp } from 'lucide-react'
import { api } from '../services/api'
import DiscoveryRail from '../components/discovery/DiscoveryRail'
import ExperienceCard from '../components/discovery/ExperienceCard'
import { experienceCollections, quickFilters } from '../data/discovery'

interface TrendingItem {
  _id: string
  title: string
  rank: number
}

interface Category {
  _id: string
  name: string
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([])
  const [browseCategories, setBrowseCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchTrending()
    fetchCategories()
  }, [])

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return experienceCollections
    const query = searchQuery.toLowerCase()
    return experienceCollections.filter((item) =>
      [item.title, item.type, item.venue].some((value) => value.toLowerCase().includes(query))
    )
  }, [searchQuery])

  const fetchTrending = async () => {
    try {
      const res = await api.get('/search/trending')
      setTrendingItems(Array.isArray(res.data) ? res.data : [])
    } catch {
      setTrendingItems([])
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/search/categories')
      setBrowseCategories(Array.isArray(res.data) ? res.data : [])
    } catch {
      setBrowseCategories([])
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-white">
      <section className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">Find your next plan</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">Search movies, live shows, plays and sports from one calm place.</p>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
          <div className="flex items-center gap-3 rounded-2xl bg-zinc-950 px-4 py-4">
            <SearchIcon className="h-5 w-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search movies, events, sports, plays"
              className="w-full border-0 bg-transparent p-0 text-base text-white placeholder:text-zinc-500 focus:ring-0"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <DiscoveryRail />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSearchQuery(filter)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white"
            >
              {filter}
            </button>
          ))}
        </div>

        <section className="mt-8">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-rose-300" />
            <h2 className="text-xl font-black">Trending now</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {(trendingItems.length > 0 ? trendingItems : experienceCollections.slice(0, 4).map((item, index) => ({ _id: item.id, title: item.title, rank: index + 1 }))).map((item) => (
              <button key={item._id} onClick={() => setSearchQuery(item.title)} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left hover:bg-white/[0.07]">
                <span className="font-semibold">{item.title}</span>
                <span className="text-sm font-bold text-zinc-500">#{item.rank}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-xl font-black">{searchQuery ? 'Matching experiences' : 'Recommended experiences'}</h2>
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {filteredCollections.map((item) => (
              <ExperienceCard key={item.id} {...item} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-xl font-black">Browse by category</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {(browseCategories.length > 0 ? browseCategories : experienceCollections.map((item) => ({ _id: item.id, name: item.type })).slice(0, 4)).map((cat) => (
              <Link key={cat._id} to="/events" className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center font-bold text-zinc-200 hover:bg-white/[0.07]">
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default Search
