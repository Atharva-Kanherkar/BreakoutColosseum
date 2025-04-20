'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Anton } from 'next/font/google'
import Link from 'next/link'
import ParticleBackground from '@/components/ParticleBackground'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

// Define types for our API responses
interface UserProfile {
  id: string
  email: string
  username: string
  avatar: string
  createdAt: string
  isHost: boolean
  isParticipant: boolean
  isSpectator: boolean
  recentTournaments: {
    hosted: string[]
    participating: string[]
    spectating: string[]
  }
}

interface TournamentSummary {
  id: string
  name: string
  startDate: string
  status: string
}

interface TeamSummary {
  id: string
  name: string
  tag: string
  memberCount: number
}

interface MatchSummary {
  id: string
  tournamentName: string
  opponent: string
  scheduledTime: string
  status: string
}

export default function Dashboard() {
  const { user, session, signOut } = useAuth()
  const router = useRouter()
  
  // State for data from API
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [hostedTournaments, setHostedTournaments] = useState<TournamentSummary[]>([])
  const [participatingTournaments, setParticipatingTournaments] = useState<TournamentSummary[]>([])
  const [myTeams, setMyTeams] = useState<TeamSummary[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<MatchSummary[]>([])
  
  // Loading states
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [areTournamentsLoading, setAreTournamentsLoading] = useState(true)
  const [areTeamsLoading, setAreTeamsLoading] = useState(true)
  const [areMatchesLoading, setAreMatchesLoading] = useState(true)

  // Error states
  const [profileError, setProfileError] = useState<string | null>(null)
  const [tournamentsError, setTournamentsError] = useState<string | null>(null)
  const [teamsError, setTeamsError] = useState<string | null>(null)
  const [matchesError, setMatchesError] = useState<string | null>(null)

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) return
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data')
        }
        
        const data = await response.json()
        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setProfileError('Could not load your profile. Please try again later.')
      } finally {
        setIsProfileLoading(false)
      }
    }
    
    fetchProfile()
  }, [session])
  
  // Fetch tournament data
  useEffect(() => {
    const fetchTournaments = async () => {
      if (!session) return
      
      try {
        // Fetch hosted tournaments
        const hostedResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/me/hosting?limit=3`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
        
        // Fetch participating tournaments
        const participatingResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/me/participating?limit=3`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
        
        if (!hostedResponse.ok || !participatingResponse.ok) {
          throw new Error('Failed to fetch tournament data')
        }
        
        const hostedData = await hostedResponse.json()
        const participatingData = await participatingResponse.json()
        
        setHostedTournaments(hostedData.tournaments || [])
        setParticipatingTournaments(participatingData.tournaments || [])
      } catch (error) {
        console.error('Error fetching tournaments:', error)
        setTournamentsError('Could not load tournament data')
      } finally {
        setAreTournamentsLoading(false)
      }
    }
    
    fetchTournaments()
  }, [session])
  
  // Fetch teams data
  useEffect(() => {
    const fetchTeams = async () => {
      if (!session) return
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/teams/me/teams`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch teams data')
        }
        
        const data = await response.json()
        setMyTeams(data.teams || [])
      } catch (error) {
        console.error('Error fetching teams:', error)
        setTeamsError('Could not load your teams')
      } finally {
        setAreTeamsLoading(false)
      }
    }
    
    fetchTeams()
  }, [session])
  
  // Fetch matches data
  useEffect(() => {
    const fetchMatches = async () => {
      if (!session) return
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/matches/me/matches?limit=3&status=SCHEDULED`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch matches data')
        }
        
        const data = await response.json()
        setUpcomingMatches(data.matches || [])
      } catch (error) {
        console.error('Error fetching matches:', error)
        setMatchesError('Could not load your upcoming matches')
      } finally {
        setAreMatchesLoading(false)
      }
    }
    
    fetchMatches()
  }, [session])

  // Create tournament handler
  const handleCreateTournament = () => {
    router.push('/tournaments/create')
  }
  
  // Create team handler
  const handleCreateTeam = () => {
    router.push('/teams/create')
  }

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <ParticleBackground />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
      
      <div className="container mx-auto px-4 z-10 relative pt-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className={`${anton.className} text-4xl mb-2`}>
            <span className="text-white">PLAYER</span> <span className="text-red-600">DASHBOARD</span>
          </h1>
          <p className="text-gray-400">Manage your tournaments, teams, and matches</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Profile Section */}
          <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
            
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-red-900/30 border border-red-600 rounded-full flex items-center justify-center mr-4">
                <span className={`${anton.className} text-2xl`}>
                  {profile?.username?.[0] || user?.email?.[0] || '?'}
                </span>
              </div>
              
              <div>
                <h2 className="text-xl font-bold">
                  {isProfileLoading ? 'Loading...' : profile?.username || 'Player'}
                </h2>
                <p className="text-gray-400 text-sm">{user?.email}</p>
                <div className="flex space-x-2 mt-2">
                  {profile?.isHost && (
                    <span className="px-2 py-1 bg-red-900/30 border border-red-600 text-xs rounded">
                      Host
                    </span>
                  )}
                  {profile?.isParticipant && (
                    <span className="px-2 py-1 bg-purple-900/30 border border-purple-600 text-xs rounded">
                      Player
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {profileError ? (
              <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3 mb-4">
                {profileError}
              </div>
            ) : (
              <div className="space-y-4">
                <Link href="/profile" className="block w-full px-4 py-2 bg-red-900/20 border border-red-900/30 hover:border-red-600 transition-colors">
                  Edit Profile
                </Link>
                <Link href="/settings/security" className="block w-full px-4 py-2 bg-red-900/20 border border-red-900/30 hover:border-red-600 transition-colors">
                  Security Settings
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="w-full mt-4 font-mono text-sm uppercase tracking-wider px-6 py-3 
                    text-white bg-red-800/50 border border-red-800 hover:bg-red-700/50 
                    transition-all duration-300 flex items-center justify-center"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
          
          {/* Main Content Col */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Section */}
            <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
              
              <h2 className={`${anton.className} text-2xl mb-4`}>
                <span className="text-white">YOUR</span>
                <span className="text-red-600">STATS</span>
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/40 p-3 border border-red-900/30">
                  <p className="text-gray-400 text-xs mb-1">HOSTED</p>
                  <p className="text-lg font-mono">{isProfileLoading ? '...' : hostedTournaments.length}</p>
                </div>
                <div className="bg-black/40 p-3 border border-red-900/30">
                  <p className="text-gray-400 text-xs mb-1">COMPETING</p>
                  <p className="text-lg font-mono">{isProfileLoading ? '...' : participatingTournaments.length}</p>
                </div>
                <div className="bg-black/40 p-3 border border-red-900/30">
                  <p className="text-gray-400 text-xs mb-1">TEAMS</p>
                  <p className="text-lg font-mono">{areTeamsLoading ? '...' : myTeams.length}</p>
                </div>
                <div className="bg-black/40 p-3 border border-red-900/30">
                  <p className="text-gray-400 text-xs mb-1">UPCOMING</p>
                  <p className="text-lg font-mono">{areMatchesLoading ? '...' : upcomingMatches.length}</p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
              
              <h2 className={`${anton.className} text-2xl mb-4`}>
                <span className="text-white">QUICK</span>
                <span className="text-red-600">ACTIONS</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleCreateTournament}
                  className="flex items-center px-4 py-3 bg-red-800/30 border border-red-900/50 hover:border-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Create Tournament
                </button>
                
                <button
                  onClick={handleCreateTeam}
                  className="flex items-center px-4 py-3 bg-red-800/30 border border-red-900/50 hover:border-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Create Team
                </button>
                
                <Link href="/tournaments" className="flex items-center px-4 py-3 bg-red-800/30 border border-red-900/50 hover:border-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Browse Tournaments
                </Link>
                
                <Link href="/matches/me" className="flex items-center px-4 py-3 bg-red-800/30 border border-red-900/50 hover:border-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  My Matches
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sections Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Your Tournaments */}
          <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
            
            <div className="flex justify-between items-center mb-4">
              <h2 className={`${anton.className} text-2xl`}>
                <span className="text-white">YOUR</span>
                <span className="text-red-600">TOURNAMENTS</span>
              </h2>
              <Link href="/tournaments/me/hosting" className="text-sm text-red-600 hover:underline">
                View All
              </Link>
            </div>
            
            {tournamentsError ? (
              <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3">
                {tournamentsError}
              </div>
            ) : areTournamentsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-12 bg-red-900/20 rounded"></div>
                <div className="h-12 bg-red-900/20 rounded"></div>
              </div>
            ) : hostedTournaments.length === 0 ? (
              <div className="text-center py-6 bg-black/40 border border-red-900/30">
                <p className="text-gray-400 mb-2">You haven't hosted any tournaments yet</p>
                <button
                  onClick={handleCreateTournament}
                  className="text-red-600 underline text-sm hover:text-red-500"
                >
                  Create Your First Tournament
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {hostedTournaments.map((tournament) => (
                  <Link
                    key={tournament.id}
                    href={`/tournaments/${tournament.id}`}
                    className="block bg-black/40 border border-red-900/30 hover:border-red-600 p-3 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{tournament.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        tournament.status === 'REGISTRATION' ? 'bg-blue-900/30 text-blue-400' :
                        tournament.status === 'ONGOING' ? 'bg-green-900/30 text-green-400' :
                        tournament.status === 'COMPLETED' ? 'bg-purple-900/30 text-purple-400' :
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {tournament.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Starts: {new Date(tournament.startDate).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Your Teams */}
          <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
            
            <div className="flex justify-between items-center mb-4">
              <h2 className={`${anton.className} text-2xl`}>
                <span className="text-white">YOUR</span>
                <span className="text-red-600">TEAMS</span>
              </h2>
              <Link href="/teams/me" className="text-sm text-red-600 hover:underline">
                View All
              </Link>
            </div>
            
            {teamsError ? (
              <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3">
                {teamsError}
              </div>
            ) : areTeamsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-12 bg-red-900/20 rounded"></div>
                <div className="h-12 bg-red-900/20 rounded"></div>
              </div>
            ) : myTeams.length === 0 ? (
              <div className="text-center py-6 bg-black/40 border border-red-900/30">
                <p className="text-gray-400 mb-2">You haven't created any teams yet</p>
                <button
                  onClick={handleCreateTeam}
                  className="text-red-600 underline text-sm hover:text-red-500"
                >
                  Create Your First Team
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myTeams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className="block bg-black/40 border border-red-900/30 hover:border-red-600 p-3 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{team.name}</h3>
                      <span className="text-xs text-gray-400">
                        [{team.tag}]
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {team.memberCount} members
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Upcoming Matches */}
          <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
            
            <div className="flex justify-between items-center mb-4">
              <h2 className={`${anton.className} text-2xl`}>
                <span className="text-white">UPCOMING</span>
                <span className="text-red-600">MATCHES</span>
              </h2>
              <Link href="/matches/me" className="text-sm text-red-600 hover:underline">
                View All
              </Link>
            </div>
            
            {matchesError ? (
              <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3">
                {matchesError}
              </div>
            ) : areMatchesLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-12 bg-red-900/20 rounded"></div>
                <div className="h-12 bg-red-900/20 rounded"></div>
              </div>
            ) : upcomingMatches.length === 0 ? (
              <div className="text-center py-6 bg-black/40 border border-red-900/30">
                <p className="text-gray-400 mb-2">No upcoming matches</p>
                <Link
                  href="/tournaments"
                  className="text-red-600 underline text-sm hover:text-red-500"
                >
                  Join a Tournament
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <Link
                    key={match.id}
                    href={`/matches/${match.id}`}
                    className="block bg-black/40 border border-red-900/30 hover:border-red-600 p-3 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">vs. {match.opponent}</h3>
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded">
                        {match.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(match.scheduledTime).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {match.tournamentName}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}