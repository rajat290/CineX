import { Drama, MapPin, Star } from 'lucide-react'
import DiscoveryRail from '../components/discovery/DiscoveryRail'

const plays = [
  { title: 'Letters From The Moon', language: 'English', venue: 'Prithvi Theatre', time: 'Today, 7:00 PM', price: 'INR 450', rating: 4.8 },
  { title: 'Do Raaste', language: 'Hindi', venue: 'NCPA Experimental', time: 'Sat, 6:30 PM', price: 'INR 350', rating: 4.6 },
  { title: 'The Last Rehearsal', language: 'English', venue: 'St Andrews Auditorium', time: 'Sun, 5:00 PM', price: 'INR 599', rating: 4.7 },
]

const Plays = () => {
  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-white">
      <section className="container py-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase text-amber-200">
          <Drama className="h-3.5 w-3.5" />
          Stage picks
        </p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">Plays with a front-row feeling.</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">Handpicked theatre shows across language, mood and venue size.</p>
        <div className="mt-8">
          <DiscoveryRail />
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {plays.map((play) => (
            <article key={play.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-5 h-36 rounded-2xl bg-amber-500 p-4">
                <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-bold uppercase">{play.language}</span>
              </div>
              <h2 className="text-xl font-black">{play.title}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400"><MapPin className="h-4 w-4" />{play.venue}</p>
              <p className="mt-1 text-sm text-zinc-400">{play.time}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-sm text-zinc-300"><Star className="h-4 w-4 fill-amber-300 text-amber-300" />{play.rating}</span>
                <button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-950">{play.price}</button>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}

export default Plays
