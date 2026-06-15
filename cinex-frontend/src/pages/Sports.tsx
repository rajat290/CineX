import { MapPin, Trophy, Users } from 'lucide-react'
import DiscoveryRail from '../components/discovery/DiscoveryRail'

const sports = [
  { title: 'India vs Australia Screening', venue: 'Big Screen Arena', area: 'Lower Parel', fans: '2.1k', price: 'INR 299' },
  { title: 'Futsal Night League', venue: 'Urban Turf', area: 'Andheri', fans: '320', price: 'INR 799' },
  { title: 'Formula Weekend Watch Party', venue: 'Speed Lounge', area: 'BKC', fans: '850', price: 'INR 499' },
]

const Sports = () => {
  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-white">
      <section className="container py-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase text-emerald-200">
          <Trophy className="h-3.5 w-3.5" />
          Match mode
        </p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">Sports nights, booked like events.</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">Screenings, turf games and fan zones with food, friends and guaranteed seats.</p>
        <div className="mt-8">
          <DiscoveryRail />
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {sports.map((sport) => (
            <article key={sport.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-5 h-36 rounded-2xl bg-emerald-500 p-4">
                <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-bold uppercase">Live</span>
              </div>
              <h2 className="text-xl font-black">{sport.title}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400"><MapPin className="h-4 w-4" />{sport.venue}, {sport.area}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-sm text-zinc-300"><Users className="h-4 w-4" />{sport.fans} fans</span>
                <button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-950">{sport.price}</button>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}

export default Sports
