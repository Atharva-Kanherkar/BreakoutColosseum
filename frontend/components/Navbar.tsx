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
      {/* CHANGED: Using justify-between instead of justify-evenly to push logo to extreme left */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* CHANGED: Added a flex container for logo and nav items */}
        <div className="flex items-center">
        
          <div
            ref={logoRef}
            className="relative cursor-pointer mr-8" 
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

          {/* CHANGED: Navigation - Moved next to logo with proper spacing */}
          {/* Removed justify-center to position properly next to logo */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setActive(item.name)}
                  className={`
                    font-mono text-sm font-semibold uppercase tracking-wider
                    px-5 py-2 relative
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

        {/* CHANGED: Action buttons remain at far right - no change needed here as justify-between handles it */}
        <div className="flex items-center space-x-4">
        <button 
  className="cyber-glitch-btn relative overflow-hidden font-mono text-sm font-semibold uppercase tracking-wider"
>
  <span className="cyber-glitch-btn-text flex items-center">
    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
    CONNECT_WALLET
  </span>
  <span className="cyber-glitch-btn-glitch"></span>
  <span className="cyber-glitch-btn-label">CONNECT_WALLET</span>
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
                SIGN_IN
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
                DASHBOARD
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
 

 
<style jsx>{`
  .cyber-glitch-btn {
    --primary:rgb(131, 0, 41);
    --secondary: #05d9e8;
    --primary-dark:rgb(116, 0, 33);
    --secondary-dark: #01a2a9;
    --glitch-height: 0.2em;
    --gap-horizontal: 10px;
    --gap-vertical: 5px;
    --time-anim: 4s;
    
    padding: 0.55em 1.5em;
    color: var(--primary);
    background: transparent;
    border: 2px solid var(--primary);
    position: relative;
    transition: all 0.3s;
    cursor: pointer;
    clip-path: polygon(92% 0, 100% 25%, 100% 100%, 8% 100%, 0% 75%, 0 0);
  }

  .cyber-glitch-btn:hover {
    color: white;
    background: var(--primary-dark);
    border-color: var(--primary);
    box-shadow: 0 0 10px var(--primary), 0 0 20px var(--primary-dark);
  }

  .cyber-glitch-btn-text {
    position: relative;
    z-index: 10;
  }

  .cyber-glitch-btn-label {
    display: none;
  }

  .cyber-glitch-btn-glitch {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--primary);
    transform: translateX(-100%);
    opacity: 0;
    z-index: 1;
  }

  .cyber-glitch-btn:hover .cyber-glitch-btn-glitch {
    animation: glitch-animation 1s infinite;
  }

  .cyber-glitch-btn::before, .cyber-glitch-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 0;
  }

  .cyber-glitch-btn::before {
    background: repeating-linear-gradient(
      to right,
      transparent 0%,
      var(--primary) 0.5%,
      transparent 1%
    );
  }

  .cyber-glitch-btn::after {
    background: repeating-linear-gradient(
      to bottom,
      transparent 0%,
      var(--primary) 0.5%,
      transparent 1%
    );
  }

  .cyber-glitch-btn:hover::before {
    animation: glitch-horizontal 2s infinite alternate;
  }

  .cyber-glitch-btn:hover::after {
    animation: glitch-vertical 2s infinite alternate;
  }

  @keyframes glitch-animation {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    10%, 90% {
      transform: translateX(0);
      opacity: 0.1;
    }
    20% {
      transform: translateX(5px) skewX(10deg);
      opacity: 0.2;
    }
    30% {
      transform: translateX(-5px) skewX(-10deg);
      opacity: 0.3;
    }
    40% {
      transform: translateX(0);
      opacity: 0;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes glitch-horizontal {
    0% {
      opacity: 0;
    }
    2% {
      opacity: 0.3;
    }
    4% {
      opacity: 0;
    }
    25% {
      opacity: 0;
    }
    30% {
      opacity: 0.3;
    }
    35% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes glitch-vertical {
    0% {
      opacity: 0;
    }
    5% {
      opacity: 0.3;
    }
    10% {
      opacity: 0;
    }
    35% {
      opacity: 0;
    }
    40% {
      opacity: 0.3;
    }
    45% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }
`}</style>
    </nav>
  )
}