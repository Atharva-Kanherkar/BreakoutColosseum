'use client'

import Link from 'next/link'
import { Anton } from 'next/font/google'
import ParticleBackground from '@/components/ParticleBackground'

// Anton font for headings
const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

export default function EmailVerification() {
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
              <span className="text-white">CHECK YOUR</span>
              <span className="text-red-600">EMAIL</span>
            </h1>
          </div>
          
          <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-8 relative">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
            
            <p className="text-gray-300 mb-8 text-center">
              We've sent a confirmation link to your email address. Please check your inbox and click the confirmation link to activate your account.
            </p>
            
            <div className="flex flex-col space-y-4 items-center">
              <Link
                href="/signin"
                className="sign-in-btn relative overflow-hidden font-mono text-sm font-semibold uppercase tracking-wider
                  px-6 py-3 text-white bg-red-600 border border-red-600
                  hover:bg-red-500 hover:shadow-md hover:shadow-red-500/30 
                  transition-all duration-300 flex items-center justify-center"
                style={{ clipPath: "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)" }}
              >
                RETURN TO LOGIN
              </Link>
              
              <p className="text-sm text-gray-500">
                Didn't receive an email? Check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}