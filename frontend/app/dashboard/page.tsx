'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Anton } from 'next/font/google'
import Link from 'next/link'
import ParticleBackground from '@/components/ParticleBackground'

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [playerStats, setPlayerStats] = useState({
    wins: 0,
    losses: 0,
    rank: 'Rookie',
    tokens: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading player stats
    const timer = setTimeout(() => {
      setPlayerStats({
        wins: Math.floor(Math.random() * 10),
        losses: Math.floor(Math.random() * 5),
        rank: ['Rookie', 'Contender', 'Challenger', 'Champion'][Math.floor(Math.random() * 4)],
        tokens: Math.floor(Math.random() * 1000)
      })
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      <ParticleBackground />
      
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
      
      <div className="container mx-auto px-4 z-10 relative pt-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Player Profile Card */}
          <div className="lg:w-1/3 bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
            
            <h2 className={`${anton.className} text-2xl mb-4`}>
              <span className="text-white">PLAYER</span>
              <span className="text-red-600">PROFILE</span>
            </h2>
            
            <div className="w-24 h-24 bg-red-900/30 border border-red-600 mx-auto mb-4 rounded-full flex items-center justify-center">
              <span className={`${anton.className} text-3xl`}>
                {user?.user_metadata?.username?.[0] || user?.email?.[0] || '?'}
              </span>
            </div>
            
            <h3 className="text-xl text-center font-bold mb-1">
              {user?.user_metadata?.username || 'Player'}
            </h3>
            <p className="text-gray-400 text-center text-sm mb-6">
              {user?.email}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/40 p-3 border border-red-900/30">
                <p className="text-gray-400 text-xs mb-1">RANK</p>
                <p className="text-lg font-mono">{isLoading ? '...' : playerStats.rank}</p>
              </div>
              <div className="bg-black/40 p-3 border border-red-900/30">
                <p className="text-gray-400 text-xs mb-1">TOKENS</p>
                <p className="text-lg font-mono">{isLoading ? '...' : playerStats.tokens}</p>
              </div>
              <div className="bg-black/40 p-3 border border-red-900/30">
                <p className="text-gray-400 text-xs mb-1">WINS</p>
                <p className="text-lg font-mono">{isLoading ? '...' : playerStats.wins}</p>
              </div>
              <div className="bg-black/40 p-3 border border-red-900/30">
                <p className="text-gray-400 text-xs mb-1">LOSSES</p>
                <p className="text-lg font-mono">{isLoading ? '...' : playerStats.losses}</p>
              </div>
            </div>
            
            <button 
              onClick={() => signOut()}
              className="w-full mt-4 font-mono text-sm uppercase tracking-wider px-6 py-3 
                text-white bg-red-800/50 border border-red-800 hover:bg-red-700/50 
                transition-all duration-300 flex items-center justify-center"
            >
              Sign Out
            </button>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:flex-1">
            {/* Welcome Message */}
            <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 mb-6 relative">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
              
              <h1 className={`${anton.className} text-4xl mb-4`}>
                <span className="text-white">WELCOME TO</span> <span className="text-red-600">CHAINARENA</span>
              </h1>
              
              <p className="text-gray-300 mb-4">
                Your authentication is working correctly! This is your personal dashboard where you can access
                tournaments, manage your team, and track your progress in the arena.
              </p>
              
              <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Successfully authenticated as {user?.email}
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/tournaments" className="group">
                <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 h-full relative
                  group-hover:border-red-600 transition-colors duration-300">
                  <h3 className={`${anton.className} text-xl mb-2`}>TOURNAMENTS</h3>
                  <p className="text-gray-400 text-sm">
                    Browse active tournaments and register your team to compete.
                  </p>
                </div>
              </Link>
              
              <Link href="/team" className="group">
                <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 h-full relative
                  group-hover:border-red-600 transition-colors duration-300">
                  <h3 className={`${anton.className} text-xl mb-2`}>MY TEAM</h3>
                  <p className="text-gray-400 text-sm">
                    Manage your team, invite players, and prepare for battle.
                  </p>
                </div>
              </Link>
              
              <Link href="/matches" className="group">
                <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 h-full relative
                  group-hover:border-red-600 transition-colors duration-300">
                  <h3 className={`${anton.className} text-xl mb-2`}>MATCHES</h3>
                  <p className="text-gray-400 text-sm">
                    View your upcoming matches and past results.
                  </p>
                </div>
              </Link>
              
              <Link href="/marketplace" className="group">
                <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 h-full relative
                  group-hover:border-red-600 transition-colors duration-300">
                  <h3 className={`${anton.className} text-xl mb-2`}>MARKETPLACE</h3>
                  <p className="text-gray-400 text-sm">
                    Spend your tokens on exclusive items and upgrades.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}