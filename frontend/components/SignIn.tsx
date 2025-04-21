 'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Anton } from 'next/font/google'
import { useAuth } from '@/contexts/AuthContext'
import ParticleBackground from './ParticleBackground'
import { useRouter } from 'next/navigation' // Correct import for App Router


// Anton font for headings
const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

export default function SignIn() {
  const { signIn } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [glitchEffect, setGlitchEffect] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  // Show success message if redirected from registration
  useEffect(() => {
    if (searchParams?.get('registered') === 'true') {
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [searchParams])
  
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchEffect(true)
      setTimeout(() => setGlitchEffect(false), 200)
    }, 3000)
    
    return () => clearInterval(glitchInterval)
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      await signIn(email, password)
      // Navigation is handled in the AuthContext
      const redirectPath = searchParams.get('redirect')
      if (redirectPath) {
        // Basic validation: ensure it's an internal path
        if (redirectPath.startsWith('/')) {
          console.log(`Redirecting to: ${redirectPath}`)
          router.push(redirectPath) // Use the path from the query parameter
        } else {
          console.warn(`Invalid redirect path ignored: ${redirectPath}`)
          router.push('/dashboard') // Fallback to default if path is invalid
        }
      } else {
        router.push('/dashboard') // Default redirect if no parameter
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
      setLoading(false)
    }
  }
  const handleGoBack = () => {
    router.back();
  }

  const handleGoHome = () => {
    router.push('/');
  }
 
     
   
  

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden pt-20">
                  <button
                onClick={handleGoBack}
                title="Go Back"
                className="absolute top-3 left-3 text-gray-500 hover:text-red-500 transition-colors duration-200 z-10 p-1" // Added padding
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              <button
                onClick={handleGoHome}
                title="Go to Homepage"
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors duration-200 z-10 p-1" // Added padding
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
      <ParticleBackground />
      
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute h-px w-64 bg-red-600/30 animate-float-slow top-1/4 left-1/3"></div>
        <div className="absolute h-64 w-px bg-red-600/20 animate-float-medium bottom-1/3 right-1/4"></div>
      </div>
      
      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-md mx-auto mt-12 mb-24">
          {/* Logo/Header */}
          {/* <div className="text-center mb-10">
            <h1 
              className={`${anton.className} text-4xl sm:text-5xl mb-4 ${glitchEffect ? 'glitch-text active' : ''}`}
              data-text="SIGN IN"
            >
              <span className="text-white">CHAIN</span>
              <span className="text-red-600">ARENA</span>
            </h1>
            <p className="text-gray-400 font-mono text-sm">
              Connect your wallet or use credentials
            </p>
          </div> */}
          
          {/* Sign In Card */}
          <div className="relative">
            {/* Decorative corner accents */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
            
            <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 sm:p-8">
              {/* Connection Options */}
              <div className="mb-8">
                {/* <button className="w-full bg-black/80 border border-red-900/50 hover:border-red-600 text-white font-mono text-sm uppercase py-3 px-4 mb-3 flex items-center justify-center transition-colors duration-300">
                  <div className="w-5 h-5 mr-2">
                    <img
                      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDM5Ny43IDMxMS43Ij48bGluZWFyR3JhZGllbnQgaWQ9ImEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMzYwLjg3OSIgeTE9IjM1MS40NTUiIHgyPSIxNDEuMjEzIiB5Mj0iLTY5LjI5NCIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDMxNCkiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzAwRkZBMyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0RDMUZGRiIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdGggZmlsbD0idXJsKCNhKSIgZD0iTTY0LjYgMjM3LjljMi40LTIuNCA1LjctMy44IDkuMi0zLjhoMzE3LjRjNS44IDAgOC43IDcgNC42IDExLjFsLTYyLjcgNjIuN2MtMi40IDIuNC01LjcgMy44LTkuMiAzLjhINi41Yy01LjggMC04LjctNy00LjYtMTEuMWw2Mi43LTYyLjd6TTY0LjYgMy44QzY3LjEgMS40IDcwLjQgMCA3My44IDBoMzE3LjRjNS44IDAgOC43IDcgNC42IDExLjFsLTYyLjcgNjIuN2MtMi40IDIuNC01LjcgMy44LTkuMiAzLjhINi41Yy01LjggMC04LjctNy00LjYtMTEuMUw2NC42IDMuOHpNMzMzLjEgMTIwLjljLTIuNC0yLjQtNS43LTMuOC05LjItMy44SDYuNWMtNS44IDAtOC43IDctNC42IDExLjFsNjIuNyA2Mi43YzIuNCAyLjQgNS43IDMuOCA5LjIgMy44aDMxNy40YzUuOCAwIDguNy03IDQuNi0xMS4xbC02Mi43LTYyLjd6Ii8+PC9zdmc+"
                      alt="Solana"
                      className="w-full h-full"
                    />
                  </div>
                  Connect Solana Wallet
                </button> */}
                
              
              </div>
              
              {/* Divider */}
              {/* <div className="flex items-center mb-8">
                <div className="h-px bg-red-900/30 flex-grow"></div>
                <span className="px-4 text-gray-500 text-sm font-mono">OR</span>
                <div className="h-px bg-red-900/30 flex-grow"></div>
              </div> */}
              
              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3 font-mono text-xs animate-pulse">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-mono text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-3 font-mono focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="your-email@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-mono text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-3 font-mono focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember_me"
                      type="checkbox"
                      className="h-4 w-4 bg-black border-red-900/50 focus:ring-red-500 checked:bg-red-600"
                    />
                    <label htmlFor="remember_me" className="ml-2 text-sm text-gray-400 font-mono">
                      Remember me
                    </label>
                  </div>
                  
                  <Link href="/forgot-password" className="text-red-500 hover:text-red-400 text-sm font-mono">
                    Forgot password?
                  </Link>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sign-in-btn relative overflow-hidden font-mono text-sm font-semibold uppercase tracking-wider
                    px-6 py-3 text-white bg-red-600 border border-red-600
                    hover:bg-red-500 hover:shadow-md hover:shadow-red-500/30 
                    transition-all duration-300 flex items-center justify-center disabled:opacity-70"
                  style={{ clipPath: "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)" }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AUTHENTICATING...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      SIGN IN
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm font-mono">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-red-500 hover:text-red-400">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}