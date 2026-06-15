import type { LucideIcon } from 'lucide-react'

interface ExperienceCardProps {
  title: string
  type: string
  price: string
  venue: string
  icon: LucideIcon
  tone: string
}

const ExperienceCard = ({ title, type, price, venue, icon: Icon, tone }: ExperienceCardProps) => {
  return (
    <article className="group min-w-[240px] rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/20 hover:bg-white/[0.07]">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${tone} text-white`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="mb-1 text-xs font-semibold uppercase text-zinc-500">{type}</div>
          <h3 className="line-clamp-1 text-base font-bold text-white">{title}</h3>
          <p className="mt-1 text-sm text-zinc-400">{venue}</p>
          <div className="mt-3 text-sm font-semibold text-zinc-200">{price}</div>
        </div>
      </div>
    </article>
  )
}

export default ExperienceCard
