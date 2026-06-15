import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [showHeader, setShowHeader] = useState(true)
  const [showBottomNav, setShowBottomNav] = useState(true)
  const location = useLocation()

  // Hide header/bottom nav on specific pages
  useEffect(() => {
    const hideOnPages = ['/payment', '/confirmation', '/seats/']
    const shouldHide = hideOnPages.some(path => location.pathname.includes(path))
    
    setShowHeader(!shouldHide)
    setShowBottomNav(!shouldHide)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {showHeader && <Header />}
      
      <main className={showBottomNav ? 'pb-16 md:pb-0' : ''}>
        {children}
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  )
}

export default Layout
