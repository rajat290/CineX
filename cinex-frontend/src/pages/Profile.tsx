import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
    const tab = searchParams.get('tab')
    if (tab === 'bookings') {
      setActiveTab('bookings')
    }
  }, [searchParams])

  const handleBookingClick = (booking: any) => {
    setSelectedBooking(booking)
  }

  const handleBackToBookings = () => {
    setSelectedBooking(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading user data...</p>
      </div>
    )
  }

  // Render different content based on active tab
  if (activeTab === 'bookings') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 max-w-4xl mx-auto">
        {/* Back to Profile Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setActiveTab('profile')
              setSearchParams({})
            }}
            className="flex items-center space-x-2 text-gray-300 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Profile</span>
          </button>
        </div>

        {/* Bookings Content */}
        {selectedBooking ? (
          <BookingDetail booking={selectedBooking} onBack={handleBackToBookings} />
        ) : (
          <div>
            <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
            <BookingList onBookingClick={handleBookingClick} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 max-w-md mx-auto md:max-w-4xl md:p-10">
      {/* Profile Header */}
      <div className="bg-gray-800 rounded-lg p-6 flex flex-col md:flex-row md:items-center md:space-x-6 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-400 mb-4 md:mb-0">
          {user.firstName.charAt(0)}
          {user.lastName.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
          <p className="text-gray-300">{user.email}</p>
          <p className="text-gray-300">{user.phone}</p>
          <div className="inline-flex items-center mt-2 px-2 py-1 bg-yellow-700 rounded text-sm font-semibold text-yellow-300">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.922-.755 1.688-1.54 1.118l-3.388-2.462a1 1 0 00-1.175 0l-3.388 2.462c-.784.57-1.838-.196-1.539-1.118l1.287-3.974a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
            </svg>
            Gold Member
          </div>
        </div>
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded self-start md:self-auto">
          Edit Profile
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-red-500 font-bold text-xl">24</p>
          <p className="text-gray-300 text-sm">Movies Watched</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-green-500 font-bold text-xl">8</p>
          <p className="text-gray-300 text-sm">Events Attended</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-yellow-400 font-bold text-xl">1,250</p>
          <p className="text-gray-300 text-sm">Reward Points</p>
        </div>
      </div>

      {/* Membership Benefits */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-red-900">
        <h3 className="text-lg font-semibold mb-2">Gold Membership</h3>
        <p className="text-gray-400 mb-4">
          Enjoy exclusive benefits and early access
        </p>
        <ul className="text-gray-300 mb-4 space-y-1 list-disc list-inside">
          <li>Priority booking</li>
          <li>15% cashback</li>
          <li>Free cancellation</li>
        </ul>
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded float-right">
          Upgrade
        </button>
      </div>

      {/* Quick Settings */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Quick Settings</h3>
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4 mb-3">
          <div>
            <p className="font-semibold">Push Notifications</p>
            <p className="text-gray-400 text-sm">Get notified about bookings and offers</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-red-600 transition-colors"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-5 transition-transform"></div>
          </label>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3 mb-6">
        {[
          { label: 'My Bookings', desc: 'View and manage your tickets', icon: '🎟️', badge: '3' },
          { label: 'Watchlist', desc: 'Your saved movies and events', icon: '❤️', badge: '12' },
          { label: 'Payment Methods', desc: 'Manage your saved cards and wallets', icon: '💳' },
          { label: 'Saved Addresses', desc: 'Home, work and other locations', icon: '📍' },
          { label: 'Rewards & Offers', desc: 'Your points and exclusive deals', icon: '🎁', badgeNew: true },
          { label: 'Notifications', desc: 'Manage your notification preferences', icon: '🔔' },
          { label: 'Account Settings', desc: 'Privacy, security and preferences', icon: '⚙️' },
          { label: 'Help & Support', desc: 'FAQs, contact us and feedback', icon: '❓' },
        ].map(({ label, desc, icon, badge, badgeNew }) => (
          <div
            key={label}
            onClick={() => {
              if (label === 'My Bookings') {
                setActiveTab('bookings')
                setSearchParams({ tab: 'bookings' })
              }
            }}
            className="flex items-center justify-between bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{icon}</div>
              <div>
                <p className="font-semibold">{label}</p>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {badge && (
                <span className="bg-gray-700 text-gray-300 text-xs font-semibold px-2 py-0.5 rounded">
                  {badge}
                </span>
              )}
              {badgeNew && (
                <span className="bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                  New
                </span>
              )}
              <button className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out Button */}
      <button
        onClick={logout}
        className="w-full text-red-600 border border-red-600 rounded-lg py-3 font-semibold hover:bg-red-600 hover:text-white transition"
      >
        Sign Out
      </button>

      {/* Footer */}
      <footer className="mt-10 text-center text-gray-500 text-xs space-x-2">
        <p>MovieSeat Booker Pro v2.1.0</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <span>·</span>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <span>·</span>
          <a href="#" className="hover:underline">
            Rate Us
          </a>
        </div>
      </footer>
    </div>
  )
}

export default Profile
