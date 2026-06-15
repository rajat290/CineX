import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronRight, LogOut, Ticket, UserCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import BookingList from '../components/booking/BookingList'
import BookingDetail from '../components/booking/BookingDetail'

const Profile = () => {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile')
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  useEffect(() => {
    if (searchParams.get('tab') === 'bookings') {
      setActiveTab('bookings')
    }
  }, [searchParams])

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Loading profile...</p>
      </main>
    )
  }

  if (activeTab === 'bookings') {
    return (
      <main className="min-h-screen bg-zinc-950 pb-24 text-white">
        <section className="container max-w-4xl py-8">
          <button
            onClick={() => {
              setActiveTab('profile')
              setSearchParams({})
              setSelectedBooking(null)
            }}
            className="mb-6 text-sm font-semibold text-zinc-400 hover:text-white"
          >
            Back to profile
          </button>

          {selectedBooking ? (
            <BookingDetail booking={selectedBooking} onBack={() => setSelectedBooking(null)} />
          ) : (
            <>
              <h1 className="mb-2 text-3xl font-black tracking-tight">Your tickets</h1>
              <p className="mb-6 text-zinc-400">All bookings, confirmations and ticket downloads live here.</p>
              <BookingList onBookingClick={setSelectedBooking} />
            </>
          )}
        </section>
      </main>
    )
  }

  const menuItems = [
    { label: 'My bookings', desc: 'View tickets and download passes', action: () => { setActiveTab('bookings'); setSearchParams({ tab: 'bookings' }) }, icon: Ticket },
    { label: 'Account details', desc: 'Name, phone and city preferences', action: undefined, icon: UserCircle },
  ]

  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-white">
      <section className="container max-w-4xl py-8">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-zinc-950">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black">{user.firstName} {user.lastName}</h1>
              <p className="truncate text-sm text-zinc-400">{user.email}</p>
              <p className="text-sm text-zinc-500">{user.city}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left hover:bg-white/[0.07]"
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-zinc-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-bold">{item.label}</span>
                    <span className="text-sm text-zinc-500">{item.desc}</span>
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 text-zinc-600" />
              </button>
            )
          })}
        </div>

        <button
          onClick={logout}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/[0.06]"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </section>
    </main>
  )
}

export default Profile
