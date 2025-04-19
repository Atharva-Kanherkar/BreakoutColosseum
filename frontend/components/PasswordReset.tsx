'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Anton } from 'next/font/google'
import { supabase } from '@/lib/supabase'
import ParticleBackground from '@/components/ParticleBackground'

// Anton font for headings
const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      
      if (error) throw error
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden pt-20">
      <ParticleBackground />
      
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
      
      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-md mx-auto mt-20">
          <div className="text-center mb-10">
            <h1 
              className={`${anton.className} text-4xl sm:text-5xl mb-4`}
            >
              <span className="text-white">RESET</span>
              <span className="text-red-600">PASSWORD</span>
            </h1>
          </div>
          
          <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-8 relative">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
            
            {success ? (
              <>
                <p className="text-green-500 mb-6 text-center font-mono">
                  Password reset instructions have been sent to your email.
                </p>
                
                <Link
                  href="/signin"
                  className="w-full sign-in-btn relative overflow-hidden font-mono text-sm font-semibold uppercase tracking-wider
                    px-6 py-3 text-white bg-red-600 border border-red-600
                    hover:bg-red-500 hover:shadow-md hover:shadow-red-500/30 
                    transition-all duration-300 flex items-center justify-center"
                  style={{ clipPath: "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)" }}
                >
                  RETURN TO LOGIN
                </Link>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3 font-mono text-xs animate-pulse mb-6">
                    {error}
                  </div>
                )}
                
                <p className="text-gray-300 mb-6">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                
                <div className="mb-6">
                  <label htmlFor="email" className="text-sm font-mono text-gray-400 mb-2 block">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-3 font-mono focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    required
                  />
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
                  {loading ? 'SENDING...' : 'SEND RESET INSTRUCTIONS'}
                </button>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <Link href="/signin" className="text-red-500 hover:text-red-400 text-sm">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}