'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Anton } from 'next/font/google'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import ParticleBackground from '@/components/ParticleBackground'
import TournamentHeader from '@/components/tournament/TournamentHeader'
import ParticipantTable from '@/components/tournament/ParticipantTable'
import BracketManagement from '@/components/tournament/BracketManagement'
import MatchScheduler from '@/components/tournament/MatchScheduler'
import AnnouncementPanel from '@/components/tournament/AnnouncementPanel'
import TournamentSettings from '@/components/tournament/TournamentSettings'

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

// Status options for tournaments
const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'REGISTRATION_OPEN', label: 'Registration Open' },
  { value: 'REGISTRATION_CLOSED', label: 'Registration Closed' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
]

export default function TournamentHostDashboard() {
  const params = useParams()
  const router = useRouter()
  const { session } = useAuth()
  const tournamentId = params.id as string

  // Tab management
  const [activeTab, setActiveTab] = useState('overview')
  
  // Tournament state
  const [tournament, setTournament] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStatusUpdating, setIsStatusUpdating] = useState(false)

  // Fetch tournament data
  useEffect(() => {
    const fetchTournamentData = async () => {
      if (!session) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch tournament details
        const tournamentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }
        )
        
        if (!tournamentResponse.ok) {
          throw new Error('Failed to fetch tournament details')
        }
        
        const tournamentData = await tournamentResponse.json()
        setTournament(tournamentData)
        
        // Fetch participants
        const participantsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/participants`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }
        )
        
        if (!participantsResponse.ok) {
          throw new Error('Failed to fetch participants')
        }
        
        const participantsData = await participantsResponse.json()
        setParticipants(participantsData.participants || [])
        
        // Fetch matches
        const matchesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/matches`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }
        )
        
        if (!matchesResponse.ok) {
          throw new Error('Failed to fetch matches')
        }
        
        const matchesData = await matchesResponse.json()
        setMatches(matchesData.matches || [])
      } catch (err: any) {
        console.error('Error fetching tournament data:', err)
        setError(err.message || 'Failed to load tournament data')
        toast.error('Failed to load tournament data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTournamentData()
  }, [tournamentId, session])

  // Update tournament status
  const handleStatusChange = async (newStatus: string) => {
    if (!session || !tournament) return
    
    try {
      setIsStatusUpdating(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update tournament status')
      }
      
      const updatedTournament = await response.json()
      setTournament(updatedTournament)
      toast.success(`Tournament status updated to ${newStatus}`)
      
      // If moving to ONGOING, generate brackets
      if (newStatus === 'ONGOING' && tournament.status !== 'ONGOING') {
        toast.success('Generating tournament brackets...')
      }
    } catch (err: any) {
      console.error('Error updating tournament status:', err)
      toast.error(err.message || 'Failed to update status')
    } finally {
      setIsStatusUpdating(false)
    }
  }

  // Delete tournament
  const handleDeleteTournament = async () => {
    if (!session || !tournament) return
    
    if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete tournament')
      }
      
      toast.success('Tournament deleted successfully')
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error deleting tournament:', err)
      toast.error(err.message || 'Failed to delete tournament')
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Loading tournament data...</p>
      </div>
    )
  }
  
  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-500 text-red-500 p-4 rounded max-w-md mx-auto">
          <h2 className="text-xl mb-2">Error</h2>
          <p>{error || 'Failed to load tournament'}</p>
          <Link href="/dashboard" className="mt-4 block text-center bg-red-900/50 border border-red-600 p-2 hover:bg-red-800/50">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <ParticleBackground />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
      
      <div className="container mx-auto px-4 z-10 relative pt-6 pb-20">
        {/* Back link */}
        <div className="mb-4">
          <Link href={`/tournaments/${tournamentId}`} className="text-gray-400 hover:text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tournament
          </Link>
        </div>
        
        {/* Tournament header */}
        <TournamentHeader 
          tournament={tournament}
          isHost={true}
          statusOptions={statusOptions}
          onStatusChange={handleStatusChange}
          isStatusUpdating={isStatusUpdating}
        />
        
        {/* Tab navigation */}
        <div className="border-b border-red-900/50 mb-6">
          <nav className="flex overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'overview'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'participants'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Participants
            </button>
            <button
              onClick={() => setActiveTab('brackets')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'brackets'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Brackets
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'matches'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Matches
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'announcements'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'settings'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="py-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats cards */}
                <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-4">
                  <h3 className="text-sm text-gray-400 mb-1">Registered Teams</h3>
                  <p className="text-3xl font-bold">{participants.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Maximum: {tournament.maxParticipants}</p>
                </div>
                
                <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-4">
                  <h3 className="text-sm text-gray-400 mb-1">Total Matches</h3>
                  <p className="text-3xl font-bold">{matches.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Format: {tournament.format}</p>
                </div>
                
                <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-4">
                  <h3 className="text-sm text-gray-400 mb-1">Current Status</h3>
                  <p className="text-xl font-bold">
                    <span className={`inline-block px-2 py-1 text-sm rounded ${
                      tournament.status === 'REGISTRATION_OPEN' ? 'bg-green-900/30 text-green-400' :
                      tournament.status === 'ONGOING' ? 'bg-yellow-900/30 text-yellow-400' :
                      tournament.status === 'COMPLETED' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-gray-900/30 text-gray-400'
                    }`}>
                      {tournament.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {tournament.status === 'REGISTRATION_OPEN' 
                      ? 'Teams can register' 
                      : tournament.status === 'ONGOING'
                      ? 'Matches in progress'
                      : tournament.status === 'COMPLETED'
                      ? 'Tournament ended'
                      : 'Preparing tournament'}
                  </p>
                </div>
              </div>
              
              {/* Quick actions */}
              <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
                
                <h2 className={`${anton.className} text-2xl mb-4`}>
                  <span className="text-white">HOST</span> <span className="text-red-600">ACTIONS</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tournament.status === 'REGISTRATION_OPEN' && (
                    <button 
                      onClick={() => handleStatusChange('REGISTRATION_CLOSED')}
                      className="flex items-center justify-center px-4 py-2 bg-red-800/30 border border-red-900/50 hover:border-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Close Registration
                    </button>
                  )}
                  
                  {tournament.status === 'REGISTRATION_CLOSED' && (
                    <button 
                      onClick={() => handleStatusChange('ONGOING')}
                      className="flex items-center justify-center px-4 py-2 bg-red-800/30 border border-red-900/50 hover:border-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Tournament
                    </button>
                  )}
                  
                  {tournament.status === 'ONGOING' && (
                    <button 
                      onClick={() => handleStatusChange('COMPLETED')}
                      className="flex items-center justify-center px-4 py-2 bg-red-800/30 border border-red-900/50 hover:border-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Complete Tournament
                    </button>
                  )}
                  
                  <Link
                    href={`/tournaments/${tournamentId}/brackets`}
                    className="flex items-center justify-center px-4 py-2 bg-red-800/30 border border-red-900/50 hover:border-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    View Brackets
                  </Link>
                  
                  <button
                    onClick={() => setActiveTab('announcements')}
                    className="flex items-center justify-center px-4 py-2 bg-red-800/30 border border-red-900/50 hover:border-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    Make Announcement
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'participants' && (
            <ParticipantTable 
              tournamentId={tournamentId} 
              participants={participants}
              tournamentStatus={tournament.status}
              session={session}
              onParticipantsUpdate={(updated) => setParticipants(updated)}
            />
          )}
          
          {activeTab === 'brackets' && (
            <BracketManagement
              tournamentId={tournamentId}
              tournamentFormat={tournament.format}
              tournamentStatus={tournament.status}
              participants={participants}
              matches={matches}
              session={session}
              onMatchesUpdate={(updated) => setMatches(updated)}
            />
          )}
          
          {activeTab === 'matches' && (
            <MatchScheduler
              tournamentId={tournamentId}
              matches={matches}
              session={session}
              onMatchesUpdate={(updated) => setMatches(updated)}
            />
          )}
          
          {activeTab === 'announcements' && (
            <AnnouncementPanel
              tournamentId={tournamentId}
              session={session}
            />
          )}
          
          {activeTab === 'settings' && (
            <TournamentSettings
              tournament={tournament}
              session={session}
              onTournamentUpdate={(updated) => setTournament(updated)}
              onDeleteTournament={handleDeleteTournament}
            />
          )}
        </div>
      </div>
    </main>
  )
}