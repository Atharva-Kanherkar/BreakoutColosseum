'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Anton } from 'next/font/google'
import ParticleBackground from '@/components/ParticleBackground'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext' // Needed for potential actions later

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

// Define the type for a single tournament in the list
interface TournamentListItem {
  id: string
  name: string
  status: string
  format: string
  startDate: string
  host: {
    username: string
  }
  _count: {
    participants: number
    teams: number
  }
  maxParticipants: number | null
  isTeamBased: boolean
}

export default function BrowseTournaments() {
  const { session } = useAuth() // Get session info
  const [tournaments, setTournaments] = useState<TournamentListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Add state for pagination later if needed
  // const [page, setPage] = useState(1)
  // const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchAllTournaments = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Use the GET /tournaments endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments?limit=20`) // Fetch first 20, add pagination later

        if (!response.ok) {
          throw new Error('Failed to fetch tournaments')
        }

        const data = await response.json()
        setTournaments(data.items || []) // Data is in the 'items' array
        // setTotalPages(data.pagination?.pages || 1) // For pagination
      } catch (err: any) {
        console.error("Error fetching tournaments:", err)
        setError(err.message || 'Could not load tournaments.')
        toast.error(err.message || 'Could not load tournaments.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllTournaments()
  }, [/* page */]) // Add page to dependency array if using pagination

  // Helper to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'TBA'
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Get status color helper (similar to dashboard)
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'REGISTRATION_OPEN': return 'bg-green-900/30 text-green-400 border-green-600/50';
      case 'REGISTRATION_CLOSED': return 'bg-yellow-900/30 text-yellow-400 border-yellow-600/50';
      case 'ONGOING': return 'bg-blue-900/30 text-blue-400 border-blue-600/50';
      case 'COMPLETED': return 'bg-purple-900/30 text-purple-400 border-purple-600/50';
      case 'CANCELLED': return 'bg-red-900/30 text-red-400 border-red-600/50';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-600/50';
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <ParticleBackground />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>

      <div className="container mx-auto px-4 z-10 relative pt-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`${anton.className} text-4xl mb-2`}>
            <span className="text-white">BROWSE</span> <span className="text-red-600">TOURNAMENTS</span>
          </h1>
          <p className="text-gray-400">Find and join ongoing or upcoming competitions</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-black/60 border border-red-900/30 p-4 h-36 rounded">
                <div className="h-5 bg-red-900/20 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-red-900/20 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-red-900/20 rounded w-1/3 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-red-900/20 rounded w-1/4"></div>
                  <div className="h-4 bg-red-900/20 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3 text-center">
            {error}
          </div>
        )}

        {/* Tournament List */}
        {!isLoading && !error && (
          tournaments.length === 0 ? (
            <div className="text-center py-10 bg-black/60 border border-red-900/30">
              <p className="text-gray-400">No tournaments found.</p>
              {/* Optional: Link to create tournament if user is logged in? */}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.id}`} // Link to public detail page
                  className="block bg-black/60 backdrop-blur-lg border border-red-900/30 hover:border-red-600 transition-colors p-4 relative group"
                >
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-red-500 transition-colors">{tournament.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded border ${getStatusStyles(tournament.status)}`}>
                      {tournament.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">Format: {tournament.format.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-400 mb-3">Starts: {formatDate(tournament.startDate)}</p>

                  <div className="flex justify-between items-center text-sm border-t border-red-900/20 pt-2">
                    <span className="text-gray-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {tournament.isTeamBased ? tournament._count.teams : tournament._count.participants}
                      {tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ''}
                      {tournament.isTeamBased ? ' Teams' : ' Players'}
                    </span>
                    <span className="text-gray-500 text-xs">Host: {tournament.host?.username || 'N/A'}</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Pagination Controls (Add later if needed) */}
        {/* {!isLoading && totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            // Pagination buttons here
          </div>
        )} */}
      </div>
    </main>
  )
}