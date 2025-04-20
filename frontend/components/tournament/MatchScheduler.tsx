import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface MatchSchedulerProps {
  tournamentId: string
  matches: any[]
  session: any
  onMatchesUpdate: (matches: any[]) => void
}

export default function MatchScheduler({
  tournamentId,
  matches,
  session,
  onMatchesUpdate
}: MatchSchedulerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    scheduledTime: '',
    location: '',
    notes: ''
  })
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [participants, setParticipants] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch participants to get team names
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!session) return
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/participants`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch participants')
        }
        
        const data = await response.json()
        setParticipants(data.participants || [])
      } catch (error) {
        console.error('Error fetching participants:', error)
      }
    }
    
    fetchParticipants()
  }, [tournamentId, session])

  // Filter matches by status and search term
  const filteredMatches = matches.filter(match => {
    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'scheduled' && !match.scheduledTime) return false
      if (filterStatus === 'unscheduled' && match.scheduledTime) return false
      if (filterStatus === 'completed' && !match.winnerId) return false
      if (filterStatus === 'pending' && match.winnerId) return false
    }
    
    // Filter by search term
    if (searchTerm) {
      const team1Name = getTeamName(match.team1Id).toLowerCase()
      const team2Name = getTeamName(match.team2Id).toLowerCase()
      const matchSearchTerm = searchTerm.toLowerCase()
      
      return team1Name.includes(matchSearchTerm) || 
             team2Name.includes(matchSearchTerm) ||
             `round ${match.round}`.includes(matchSearchTerm) ||
             `match ${match.id}`.includes(matchSearchTerm)
    }
    
    return true
  })

  // Open schedule modal
  const openScheduleModal = (match: any) => {
    setSelectedMatch(match)
    setScheduleData({
      scheduledTime: match.scheduledTime ? new Date(match.scheduledTime).toISOString().slice(0, 16) : '',
      location: match.location || '',
      notes: match.notes || ''
    })
    setIsScheduleModalOpen(true)
  }

  // Update match schedule
  const handleUpdateSchedule = async () => {
    if (!session || !selectedMatch) return
    
    try {
      setIsLoading(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/matches/${selectedMatch.id}/schedule`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            scheduledTime: scheduleData.scheduledTime,
            location: scheduleData.location,
            notes: scheduleData.notes
          })
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update match schedule')
      }
      
      const updatedMatch = await response.json()
      
      // Update matches locally
      const updatedMatches = matches.map(m => 
        m.id === selectedMatch.id ? { ...m, ...updatedMatch } : m
      )
      onMatchesUpdate(updatedMatches)
      
      toast.success('Match schedule updated successfully')
      setIsScheduleModalOpen(false)
    } catch (error: any) {
      console.error('Error updating match schedule:', error)
      toast.error(error.message || 'Failed to update match schedule')
    } finally {
      setIsLoading(false)
    }
  }

  // Get team name from participants
  const getTeamName = (teamId: string) => {
    if (!teamId) return 'TBD'
    const participant = participants.find(p => p.teamId === teamId)
    return participant ? participant.team.name : 'Unknown Team'
  }

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled'
    return new Date(dateString).toLocaleString()
  }

  return (
    <>
      <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Match Scheduler</h2>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Search input */}
            <div className="relative md:w-64">
              <input
                type="text"
                placeholder="Search matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/80 border border-red-900/50 text-white pl-10 pr-4 py-2 focus:outline-none focus:border-red-600"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
            >
              <option value="all">All Matches</option>
              <option value="scheduled">Scheduled</option>
              <option value="unscheduled">Unscheduled</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        
        {matches.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <p>No matches have been created yet.</p>
            <p className="mt-2 text-sm">Generate the tournament bracket first to create matches.</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <p>No matches match your filters.</p>
            <button 
              onClick={() => {
                setFilterStatus('all')
                setSearchTerm('')
              }}
              className="mt-2 text-sm text-red-500 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-red-900/20">
                  <th className="text-left p-3">Round</th>
                  <th className="text-left p-3">Teams</th>
                  <th className="text-left p-3">Scheduled For</th>
                  <th className="text-left p-3">Location</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((match) => (
                  <tr key={match.id} className="border-t border-red-900/20 hover:bg-red-900/10">
                    <td className="p-3">
                      {match.round === 1 ? 'First Round' :
                       match.round === matches.reduce((max, m) => Math.max(max, m.round), 0) ? 'Finals' :
                       `Round ${match.round}`}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span>{getTeamName(match.team1Id)}</span>
                        <span className="text-gray-500">vs</span>
                        <span>{getTeamName(match.team2Id)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {formatDate(match.scheduledTime)}
                    </td>
                    <td className="p-3 text-sm max-w-[200px] truncate">
                      {match.location || 'Not specified'}
                    </td>
                    <td className="p-3">
                      {match.winnerId ? (
                        <span className="inline-block px-2 py-1 text-xs rounded bg-green-900/30 text-green-400 border border-green-500/30">
                          Completed
                        </span>
                      ) : match.scheduledTime ? (
                        <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-900/30 text-yellow-400 border border-yellow-500/30">
                          Scheduled
                        </span>
                      ) : (!match.team1Id || !match.team2Id) ? (
                        <span className="inline-block px-2 py-1 text-xs rounded bg-gray-900/30 text-gray-400 border border-gray-500/30">
                          Awaiting Teams
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs rounded bg-red-900/30 text-red-400 border border-red-500/30">
                          Not Scheduled
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => openScheduleModal(match)}
                        disabled={!match.team1Id || !match.team2Id || match.winnerId}
                        className="px-3 py-1 bg-red-900/30 border border-red-600/30 text-white text-sm hover:bg-red-800/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {match.scheduledTime ? 'Reschedule' : 'Schedule'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-400">
          {filteredMatches.length} of {matches.length} matches
        </div>
      </div>
      
      {/* Schedule Modal */}
      {isScheduleModalOpen && selectedMatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black/90 border border-red-600 p-6 max-w-md w-full">
            <h2 className="text-xl mb-4">
              {selectedMatch.scheduledTime ? 'Reschedule Match' : 'Schedule Match'}
            </h2>
            
            <div className="mb-4">
              <div className="text-gray-400 mb-2">Teams</div>
              <div className="bg-black/60 border border-red-900/30 p-3">
                <div className="flex items-center justify-center mb-2">
                  <span className="font-semibold">{getTeamName(selectedMatch.team1Id)}</span>
                  <span className="mx-3 text-gray-500">vs</span>
                  <span className="font-semibold">{getTeamName(selectedMatch.team2Id)}</span>
                </div>
                <div className="text-center text-sm text-gray-500">
                  {selectedMatch.round === 1 ? 'First Round' :
                   selectedMatch.round === matches.reduce((max, m) => Math.max(max, m.round), 0) ? 'Finals' :
                   `Round ${selectedMatch.round}`}
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="scheduledTime" className="block text-sm text-gray-400 mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="scheduledTime"
                  value={scheduleData.scheduledTime}
                  onChange={(e) => setScheduleData({...scheduleData, scheduledTime: e.target.value})}
                  required
                  className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm text-gray-400 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={scheduleData.location}
                  onChange={(e) => setScheduleData({...scheduleData, location: e.target.value})}
                  placeholder="e.g., Main Arena, Server #1, etc."
                  className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm text-gray-400 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                  rows={3}
                  placeholder="Any additional information for the teams"
                  className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 border border-gray-700 hover:border-red-600"
              >
                Cancel
              </button>
              
              <button
                type="button"
                disabled={!scheduleData.scheduledTime || isLoading}
                onClick={handleUpdateSchedule}
                className="px-4 py-2 bg-red-800/50 border border-red-600 hover:bg-red-700/50 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}