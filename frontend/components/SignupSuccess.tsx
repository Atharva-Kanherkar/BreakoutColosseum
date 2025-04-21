'use client'

import Link from 'next/link'
import ParticleBackground from './ParticleBackground'
import { Anton } from 'next/font/google'
import { useRouter } from 'next/navigation'

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

export default function SignupSuccess() {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push('/dashboard'); // Navigate to the dashboard route
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden pt-20 pb-20 flex items-center justify-center">
      <ParticleBackground />

      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute h-px w-64 bg-red-600/30 animate-float-slow top-1/4 left-1/3"></div>
        <div className="absolute h-64 w-px bg-red-600/20 animate-float-medium bottom-1/3 right-1/4"></div>
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-md mx-auto">
          <div className="relative">
            {/* Decorative corner accents */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>

            <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-8 sm:p-10 text-center">
              <h1 className={`${anton.className} text-3xl sm:text-4xl mb-6 text-red-500`}>
                ACCOUNT CREATED!
              </h1>

              <p className="text-gray-300 mb-8">
                You have successfully signed up for ChainArena. Welcome aboard!
              </p>

              <div className="flex flex-col space-y-4 items-center">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full sign-in-btn relative overflow-hidden font-mono text-sm font-semibold uppercase tracking-wider
                    px-6 py-3 text-white bg-red-600 border border-red-600
                    hover:bg-red-500 hover:shadow-md hover:shadow-red-500/30
                    transition-all duration-300 flex items-center justify-center"
                  style={{ clipPath: "polygon(8% 0, 100% 0, 100% 75%, 92% 100%, 0 100%, 0 25%)" }}
                >
                  TAKE ME TO DASHBOARD
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}