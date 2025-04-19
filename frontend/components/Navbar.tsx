'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Anton } from 'next/font/google'

// Anton font for the logo
const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Tournaments', href: '/tournaments' },
  { name: 'Teams', href: '/teams' },
  { name: 'Leaderboards', href: '/leaderboards' },
  { name: 'Support', href: '/support' },
]

export default function Navbar() {
  const [active, setActive] = useState('Home')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [logoHover, setLogoHover] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    setLoaded(true)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-gradient-to-r from-black/80 via-black/75 to-black/80'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div
          ref={logoRef}
          className="relative px-4 py-2 cursor-pointer"
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
        >
          <div className={`${anton.className} text-3xl tracking-widest flex items-center`}>
            <span className="text-white">CHAIN</span>
            <span className={`ml-1 transition-all duration-300 ${
              logoHover ? 'text-red-400 shadow-red-400/50 shadow-glow' : 'text-red-600'
            }`}>ARENA</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center space-x-6 mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setActive(item.name)}
              className={`
                font-mono text-sm font-semibold uppercase tracking-wider
                px-4 py-2 relative
                ${active === item.name 
                  ? 'text-white bg-red-600/20 border border-red-600/60' 
                  : 'text-red-500 hover:text-white hover:border-red-500 border border-transparent'}
                transition-all duration-300
              `}
            >
              {item.name}_
              {active === item.name && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></span>
              )}
            </Link>
          ))}
        </div>

        {/* Connect Wallet Button */}
        <div className="flex items-center space-x-4">
          <button 
            className={`
              relative overflow-hidden font-mono text-sm font-semibold uppercase tracking-wider
              px-4 py-2 text-red-500 border border-red-500/60
              hover:text-white hover:bg-red-500/20 hover:shadow-md hover:shadow-red-500/30
              transition-all duration-300
            `}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Connect_Wallet
            </span>
          </button>

          {/* Sign In/Dashboard Button */}
          {!isLoggedIn ? (
            <button 
              className={`
                relative overflow-hidden font-mono text-sm font-semibold uppercase tracking-wider
                px-4 py-2 text-white bg-red-600 border border-red-600
                hover:bg-red-500 hover:shadow-md hover:shadow-red-500/30
                transition-all duration-300
              `}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign_In
              </span>
            </button>
          ) : (
            <Link 
              href="/dashboard" 
              className={`
                relative overflow-hidden font-mono text-sm font-semibold uppercase tracking-wider
                px-4 py-2 text-white bg-red-600 border border-red-600
                hover:bg-red-500 hover:shadow-md hover:shadow-red-500/30
                transition-all duration-300
              `}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Dashboard_
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden absolute right-6 top-4">
        <button className="p-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Add this to globals.css for the glow effect */}
      <style jsx global>{`
        .shadow-glow {
          text-shadow: 0 0 5px currentColor, 0 0 15px currentColor;
        }
      `}</style>
    </nav>
  )
}