import { Calendar, MapPin, Music2, SlidersHorizontal, Star, Users } from 'lucide-react'
import DiscoveryRail from '../components/discovery/DiscoveryRail'
import { quickFilters } from '../data/discovery'

const events = [
  { id: 'event-1', title: 'Skyline Indie Night', category: 'Music', date: 'Fri, 8:00 PM', venue: 'Warehouse 27', area: 'Bandra', price: 'INR 899', rating: 4.8, crowd: '1.2k' },
  { id: 'event-2', title: 'Laugh Riot Live', category: 'Comedy', date: 'Sat, 7:30 PM', venue: 'The Habitat', area: 'Khar', price: 'INR 499', rating: 4.7, crowd: '640' },
  { id: 'event-3', title: 'After Dark Food Fest', category: 'Food', date: 'Sun, 5:00 PM', venue: 'Jio Garden', area: 'BKC', price: 'INR 299', rating: 4.6, crowd: '3.4k' },
  { id: 'event-4', title: 'Design Weekend', category: 'Culture', date: 'Sat, 11:00 AM', venue: 'Art House', area: 'Kala Ghoda', price: 'INR 699', rating: 4.5, crowd: '820' },
]

const Events = () => {
  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-white">
      <section className="container py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase text-cyan-200">
              <Music2 className="h-3.5 w-3.5" />
              Live in your city
            </p>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">Events worth stepping out for.</h1>
            <p className="mt-4 max-w-2xl text-zinc-400">Concerts, comedy, food festivals and culture drops curated around your weekend.</p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-zinc-200 hover:bg-white/[0.06]">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        <DiscoveryRail />

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {quickFilters.map((filter) => (
            <button key={filter} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-white">
              {filter}
            </button>
          ))}
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {events.map((event, index) => (
            <article key={event.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
              <div className={`h-44 ${index % 2 === 0 ? 'bg-cyan-500' : 'bg-fuchsia-500'} p-5`}>
                <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-bold uppercase text-white">{event.category}</span>
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-center gap-3 text-sm text-zinc-400">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{event.date}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{event.area}</span>
                </div>
                <h2 className="text-2xl font-black">{event.title}</h2>
                <p className="mt-2 text-sm text-zinc-400">{event.venue}</p>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex gap-3 text-sm text-zinc-300">
                    <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-300 text-amber-300" />{event.rating}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{event.crowd}</span>
                  </div>
                  <button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-zinc-200">{event.price}</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}

export default Events
