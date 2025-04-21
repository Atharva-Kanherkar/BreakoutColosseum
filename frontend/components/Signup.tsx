'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Anton } from 'next/font/google'
import { useAuth } from '@/contexts/AuthContext'
import ParticleBackground from './ParticleBackground'
 
import { useRouter } from 'next/navigation' // Import the correct hook

// Anton font for headings
const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

export default function SignUp() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [glitchEffect, setGlitchEffect] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  // ... existing glitch effect and password strength code
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }
    
    if (!agreeTerms) {
      setError("You must agree to the terms and conditions")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await signUp(email, password, username)
      // Navigation is handled in the AuthContext
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      setLoading(false)
    }
  }
  const handleGoBack = () => {
    router.back();
  }

  const handleGoHome = () => {
    router.push('/');
  }
  const handleWalletConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Phantom wallet is installed
      if (!window.phantom?.solana) {
        throw new Error('Phantom wallet not found. Please install the Phantom extension.');
      }
      
      // Connect to wallet
      const provider = window.phantom.solana;
      const { publicKey } = await provider.connect();
      const walletAddress = publicKey.toString();
      
      // Generate nonce for signing
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = `Sign this message to authenticate with ChainArena: ${nonce}`;
      
      // Encode the message for signing
      const encodedMessage = new TextEncoder().encode(message);
      
      // Request the wallet to sign the message
      const signature = await provider.signMessage(encodedMessage, 'utf8');
      
      // Convert Uint8Array to Base64
      const signatureBase64 = btoa(
        Array.from(new Uint8Array(signature))
          .map(val => String.fromCharCode(val))
          .join('')
      );
      
      // Now authenticate with your backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/wallet-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          signature: signatureBase64,
          message,
          nonce
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Wallet authentication failed');
      }
      
      const data = await response.json();
      
      // Handle the response appropriately
      if (data.token) {
        router.push(`/connect-email?token=${data.token}`);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden pt-20 pb-20">
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
          <div className="text-center mb-10">
            <h1 
              className={`${anton.className} text-4xl sm:text-5xl mb-4 ${glitchEffect ? 'glitch-text active' : ''}`}
              data-text="SIGN UP"
            >
              <span className="text-white">CREATE</span>
              <span className="text-red-600">ACCOUNT</span>
            </h1>
            <p className="text-gray-400 font-mono text-sm">
              Join the arena and start competing
            </p>
          </div>
          
          {/* Sign Up Card */}
          <div className="relative">
            {/* Decorative corner accents */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
            
            <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 sm:p-8">
              {/* Connection Options */}
              {/* <div className="mb-8">
                <button 
                  onClick={handleWalletConnect} 
                  className="w-full bg-black/80 border border-red-900/50 hover:border-red-600 text-white font-mono text-sm uppercase py-3 px-4 mb-3 flex items-center justify-center transition-colors duration-300"
                >
                  <div className="w-5 h-5 mr-2">
                    <img
                      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDM5Ny43IDMxMS43Ij48bGluZWFyR3JhZGllbnQgaWQ9ImEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMzYwLjg3OSIgeTE9IjM1MS40NTUiIHgyPSIxNDEuMjEzIiB5Mj0iLTY5LjI5NCIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDMxNCkiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzAwRkZBMyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0RDMUZGRiIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdGggZmlsbD0idXJsKCNhKSIgZD0iTTY0LjYgMjM3LjljMi40LTIuNCA1LjctMy44IDkuMi0zLjhoMzE3LjRjNS44IDAgOC43IDcgNC42IDExLjFsLTYyLjcgNjIuN2MtMi40IDIuNC01LjcgMy44LTkuMiAzLjhINi41Yy01LjggMC04LjctNy00LjYtMTEuMWw2Mi43LTYyLjd6TTY0LjYgMy44QzY3LjEgMS40IDcwLjQgMCA3My44IDBoMzE3LjRjNS44IDAgOC43IDcgNC42IDExLjFsLTYyLjcgNjIuN2MtMi40IDIuNC01LjcgMy44LTkuMiAzLjhINi41Yy01LjggMC04LjctNy00LjYtMTEuMUw2NC42IDMuOHpNMzMzLjEgMTIwLjljLTIuNC0yLjQtNS43LTMuOC05LjItMy44SDYuNWMtNS44IDAtOC43IDctNC42IDExLjFsNjIuNyA2Mi43YzIuNCAyLjQgNS43IDMuOCA5LjIgMy44aDMxNy40YzUuOCAwIDguNy03IDQuNi0xMS4xbC02Mi43LTYyLjd6Ii8+PC9zdmc+"
                      alt="Solana"
                      className="w-full h-full"
                    />
                  </div>
                  Connect Solana Wallet
                </button>
              </div> */}
              
              {/* Divider */}
              <div className="flex items-center mb-8">
                <div className="h-px bg-red-900/30 flex-grow"></div>
                <span className="px-4 text-gray-500 text-sm font-mono"> CREATE ACCOUNT</span>
                <div className="h-px bg-red-900/30 flex-grow"></div>
              </div>
              
              {/* Sign Up Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3 font-mono text-xs animate-pulse">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-mono text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    USERNAME
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-3 font-mono focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="gamertag"
                    minLength={3}
                    maxLength={30}
                    pattern="[a-zA-Z0-9_-]+"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-mono text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
                    minLength={6}
                  />
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex space-x-1">
                        <div className={`h-1 flex-1 ${passwordStrength >= 1 ? 'bg-red-500' : 'bg-gray-700'}`}></div>
                        <div className={`h-1 flex-1 ${passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
                        <div className={`h-1 flex-1 ${passwordStrength >= 3 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                      </div>
                      <p className="text-xs font-mono mt-1 text-gray-500">
                        {passwordStrength === 0 && 'Weak password'}
                        {passwordStrength === 1 && 'Consider adding numbers'}
                        {passwordStrength === 2 && 'Consider adding uppercase letters'}
                        {passwordStrength === 3 && 'Strong password'}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-mono text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    CONFIRM PASSWORD
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-3 font-mono focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="••••••••••••"
                    required
                  />
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 font-mono mt-1">Passwords don't match</p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    id="agree_terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 bg-black border-red-900/50 focus:ring-red-500 checked:bg-red-600"
                  />
                  <label htmlFor="agree_terms" className="ml-2 text-sm text-gray-400 font-mono">
                    I agree to the <a href="/terms" className="text-red-500 hover:text-red-400">Terms of Service</a> and <a href="/privacy" className="text-red-500 hover:text-red-400">Privacy Policy</a>
                  </label>
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
                      CREATING ACCOUNT...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      CREATE ACCOUNT
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm font-mono">
                  Already have an account?{' '}
                  <Link href="/signin" className="text-red-500 hover:text-red-400">
                    Sign in
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