'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Anton } from 'next/font/google'

// Anton font for the logo
const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

const navItems = [
  { name: 'HOME', href: '/' },
  { name: 'TOURNAMENTS', href: '/tournaments' },
  { name: 'TEAMS', href: '/teams' },
  { name: 'LEADERBOARDS', href: '/leaderboards' },
  { name: 'SUPPORT', href: '/support' },
]

export default function Navbar() {
  const [active, setActive] = useState('HOME')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [logoHover, setLogoHover] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const logoRef = useRef<HTMLDivElement>(null)
  
  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mobileMenuOpen])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    setLoaded(true)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (mobileMenuOpen && !target.closest('#mobile-menu') && !target.closest('#mobile-menu-button')) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-gradient-to-r from-black/80 via-black/75 to-black/80'
    }`}>
      {/* FIXED: Improved container spacing */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Logo and nav items container - FIXED: Better spacing */}
        <div className="flex items-center space-x-6 sm:space-x-10">
          {/* Logo with improved spacing */}
          <div
            ref={logoRef}
            className="relative cursor-pointer" 
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
          >
            <div className={`${anton.className} text-xl xs:text-2xl sm:text-3xl tracking-widest flex items-center`}>
              <span className="text-white">CHAIN</span>
              <span className={`ml-1 transition-all duration-300 ${
                logoHover ? 'text-red-400 shadow-red-400/50 shadow-glow' : 'text-red-600'
              }`}>ARENA</span>
            </div>
          </div>

          {/* Desktop Navigation - FIXED: Better spacing and alignment */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-4 lg:space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setActive(item.name)}
                  className={`
                    font-mono text-xs lg:text-sm font-semibold uppercase tracking-wider
                    px-3 lg:px-4 py-2 relative whitespace-nowrap
                    ${active === item.name 
                      ? 'text-white bg-red-600/20 border border-red-600/60' 
                      : 'text-red-500 hover:text-white hover:border-red-500 border border-transparent'}
                    transition-all duration-300
                  `}
                >
                  {item.name}
                  {active === item.name && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons - FIXED: Equal styling for both buttons */}
        <div className="flex items-center space-x-4">
          {/* Connect Wallet button - Desktop and tablets */}
          <div className="hidden sm:block">
            <button className="cyber-glitch-btn relative overflow-hidden font-mono text-xs lg:text-sm font-semibold uppercase tracking-wider">
              <span className="cyber-glitch-btn-text flex items-center">
                <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="hidden xs:inline">CONNECT_WALLET</span>
                <span className="xs:hidden">WALLET</span>
              </span>
              <span className="cyber-glitch-btn-glitch"></span>
              <span className="cyber-glitch-btn-label">CONNECT_WALLET</span>
            </button>
          </div>

          {/* FIXED: Sign In Button - Now visible with proper styling */}
          <div className="hidden sm:block">
            {!isLoggedIn ? (
              <button 
                className="sign-in-btn relative overflow-hidden font-mono text-xs lg:text-sm font-semibold uppercase tracking-wider
                  px-4 py-2 text-white bg-red-600 border border-red-600
                  hover:bg-red-500 hover:shadow-md hover:shadow-red-500/30 
                  transition-all duration-300"
                style={{ clipPath: "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)" }}
              >
                <span className="flex items-center">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  SIGN_IN
                </span>
              </button>
            ) : (
              <Link 
                href="/dashboard" 
                className="sign-in-btn relative overflow-hidden font-mono text-xs lg:text-sm font-semibold uppercase tracking-wider
                  px-4 py-2 text-white bg-red-600 border border-red-600
                  hover:bg-red-500 hover:shadow-md hover:shadow-red-500/30 
                  transition-all duration-300"
                style={{ clipPath: "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)" }}
              >
                <span className="flex items-center">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  DASHBOARD
                </span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            id="mobile-menu-button"
            className="md:hidden p-2 text-red-500 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="relative w-6 h-5">
              <span className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ${
                mobileMenuOpen ? 'rotate-45 top-2.5' : 'top-0'
              }`}></span>
              <span className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0' : 'top-2'
              }`}></span>
              <span className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ${
                mobileMenuOpen ? '-rotate-45 top-2.5' : 'top-4'
              }`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <div 
        id="mobile-menu"
        className={`fixed md:hidden top-0 right-0 h-full w-64 max-w-[80vw] bg-black/95 border-l border-red-900/30 transform transition-transform duration-300 ease-in-out z-50 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile menu content */}
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-end">
            <button 
              className="p-2 text-red-500 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close mobile menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col space-y-4 mt-8">
            {navItems.map((item) => (
              <Link
                key={`mobile-${item.name}`}
                href={item.href}
                onClick={() => {
                  setActive(item.name);
                  setMobileMenuOpen(false);
                }}
                className={`
                  font-mono text-sm font-semibold uppercase tracking-wider
                  px-4 py-3 relative
                  ${active === item.name 
                    ? 'text-white bg-red-600/20 border border-red-600/60' 
                    : 'text-red-500 hover:text-white border border-transparent'}
                  transition-all duration-300
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Mobile action buttons */}
          <div className="mt-auto space-y-4 mb-6">
            <button className="w-full cyber-glitch-btn relative overflow-hidden font-mono text-sm font-semibold uppercase tracking-wider">
              <span className="cyber-glitch-btn-text flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                CONNECT_WALLET
              </span>
              <span className="cyber-glitch-btn-glitch"></span>
            </button>
            
            {!isLoggedIn ? (
              <button 
                className="w-full sign-in-btn font-mono text-sm font-semibold uppercase tracking-wider 
                  px-4 py-3 text-white bg-red-600 border border-red-600 
                  hover:bg-red-500 transition-colors duration-300 flex justify-center items-center"
                style={{ clipPath: "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)" }}
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                SIGN_IN
              </button>
            ) : (
              <Link 
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)} 
                className="block w-full sign-in-btn font-mono text-sm font-semibold uppercase tracking-wider 
                  px-4 py-3 text-white bg-red-600 border border-red-600 
                  hover:bg-red-500 transition-colors duration-300 text-center"
                style={{ clipPath: "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)" }}
              >
                <span className="flex justify-center items-center">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  DASHBOARD
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-40"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </nav>
  )
}


