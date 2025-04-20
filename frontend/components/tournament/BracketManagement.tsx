import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Anton } from 'next/font/google'

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

interface BracketManagementProps {
  tournamentId: string
  tournamentFormat: string
  tournamentStatus: string
  participants: any[]
  matches: any[]
  session: any
  onMatchesUpdate: (matches: any[]) => void
}

export default function BracketManagement({
  tournamentId,
  tournamentFormat,
  tournamentStatus,
  participants,
  matches,
  session,
  onMatchesUpdate
}: BracketManagementProps) {
  const [isGeneratingBracket, setIsGeneratingBracket] = useState(false)
  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null)
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
  const [scores, setScores] = useState({
    team1Score: 0,
    team2Score: 0
  })

  // Process matches into rounds for display
  const rounds = processMatchesIntoRounds(matches)
  
  // Generate bracket 
  const handleGenerateBracket = async () => {
    if (!session) return
    
    try {
      setIsGeneratingBracket(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/brackets/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate bracket')
      }
      
      const data = await response.json()
      onMatchesUpdate(data.matches || [])
      toast.success('Tournament bracket generated successfully')
    } catch (err: any) {
      console.error('Error generating bracket:', err)
      toast.error(err.message || 'Failed to generate bracket')
    } finally {
      setIsGeneratingBracket(false)
    }
  }
  
  // Update match result
  const handleUpdateMatchResult = async () => {
    if (!session || !selectedMatch) return
    
    try {
      setIsUpdatingMatch(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/matches/${selectedMatch}/result`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            winnerId: selectedWinner,
            scores: {
              [selectedMatch.split('-')[0]]: scores.team1Score,
              [selectedMatch.split('-')[1]]: scores.team2Score
            }
          })
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update match result')
      }
      
      // Get updated matches after result submission
      const matchesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/matches`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )
      
      if (!matchesResponse.ok) {
        throw new Error('Failed to fetch updated matches')
      }
      
      const matchesData = await matchesResponse.json()
      onMatchesUpdate(matchesData.matches || [])
      
      toast.success('Match result recorded successfully')
      
      // Close modal and reset form
      setIsScoreModalOpen(false)
      setSelectedMatch(null)
      setSelectedWinner(null)
      setScores({
        team1Score: 0,
        team2Score: 0
      })
    } catch (err: any) {
      console.error('Error updating match result:', err)
      toast.error(err.message || 'Failed to update match result')
    } finally {
      setIsUpdatingMatch(false)
    }
  }
  
  // Handle opening the score modal
  const openScoreModal = (match: any) => {
    setSelectedMatch(match.id)
    setSelectedWinner(null)
    setScores({
      team1Score: match.team1Score || 0,
      team2Score: match.team2Score || 0
    })
    setIsScoreModalOpen(true)
  }
  
  // Process matches into rounds for bracket display
  function processMatchesIntoRounds(matches: any[]) {
    if (!matches || matches.length === 0) return []
    
    const roundsObj: { [key: number]: any[] } = {}
    
    matches.forEach(match => {
      if (!roundsObj[match.round]) {
        roundsObj[match.round] = []
      }
      roundsObj[match.round].push(match)
    })
    
    // Convert object to array sorted by round number
    return Object.keys(roundsObj)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(roundNum => ({
        round: parseInt(roundNum),
        matches: roundsObj[parseInt(roundNum)]
          .sort((a, b) => a.position - b.position)
      }))
  }
  
  // Get team name by ID from participants
  const getTeamName = (teamId: string) => {
    const participant = participants.find(p => p.teamId === teamId)
    return participant ? participant.team.name : 'TBD'
  }
  
  // Check if brackets can be generated
  const canGenerateBrackets = 
    tournamentStatus === 'REGISTRATION_CLOSED' && 
    participants.length > 0 &&
    (!matches || matches.length === 0)
  
  // Check if all approved participants
  const approvedParticipants = participants.filter(p => p.status === 'APPROVED')
  const hasEnoughParticipants = approvedParticipants.length >= 
    (tournamentFormat === 'SINGLE_ELIMINATION' || tournamentFormat === 'DOUBLE_ELIMINATION' ? 4 : 2)
  
  return (
    <>
      <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold">Tournament Brackets</h2>
            <p className="text-sm text-gray-400">Format: {tournamentFormat.replace(/_/g, ' ')}</p>
          </div>
          
          {canGenerateBrackets && (
            <button
              onClick={handleGenerateBracket}
              disabled={isGeneratingBracket || !hasEnoughParticipants}
              className="px-4 py-2 bg-red-800/30 border border-red-900/50 hover:border-red-600 transition-colors disabled:opacity-50"
            >
              {isGeneratingBracket 
                ? 'Generating...' 
                : !hasEnoughParticipants 
                ? `Need ${tournamentFormat === 'SINGLE_ELIMINATION' || tournamentFormat === 'DOUBLE_ELIMINATION' ? 4 : 2} Approved Teams` 
                : 'Generate Brackets'}
            </button>
          )}
        </div>
        
        {matches.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-gray-400">
              {tournamentStatus === 'DRAFT' || tournamentStatus === 'REGISTRATION_OPEN' ? (
                <p>Brackets will be generated after registration closes.</p>
              ) : tournamentStatus === 'REGISTRATION_CLOSED' ? (
                <p>Ready to generate tournament brackets.</p>
              ) : (
                <p>No bracket information available.</p>
              )}
            </div>
            
            {tournamentStatus === 'REGISTRATION_CLOSED' && (
              <button
                onClick={handleGenerateBracket}
                disabled={isGeneratingBracket || !hasEnoughParticipants}
                className="px-6 py-2 mt-4 bg-red-800/50 border border-red-600 hover:bg-red-700/50 transition-all disabled:opacity-50"
              >
                {isGeneratingBracket 
                  ? 'Generating...' 
                  : !hasEnoughParticipants 
                  ? `Need at Least ${tournamentFormat === 'SINGLE_ELIMINATION' || tournamentFormat === 'DOUBLE_ELIMINATION' ? 4 : 2} Approved Teams` 
                  : 'Generate Tournament Brackets'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto pb-6">
            <div className="min-w-max">
              <div className="flex space-x-8">
                {rounds.map((round, roundIndex) => (
                  <div key={round.round} className="flex flex-col">
                    <div className={`text-center mb-4 ${anton.className}`}>
                      {round.round === 1 ? 'Round 1' : 
                       round.round === rounds.length ? 'Finals' :
                       `Round ${round.round}`}
                    </div>
                    <div className="flex flex-col space-y-8">
                      {round.matches.map((match, matchIndex) => {
                        const team1 = participants.find(p => p.teamId === match.team1Id)
                        const team2 = participants.find(p => p.teamId === match.team2Id)
                        
                        const matchComplete = match.winnerId !== null
                        const matchReady = match.team1Id && match.team2Id
                        
                        return (
                          <div
                            key={match.id}
                            className={`relative w-64 border ${
                              matchComplete 
                                ? 'border-green-600/50' 
                                : matchReady
                                ? 'border-yellow-600/50'
                                : 'border-gray-700'
                            } ${
                              tournamentStatus === 'ONGOING' && matchReady && !matchComplete
                                ? 'hover:border-red-500 cursor-pointer'
                                : ''
                            }`}
                            onClick={() => {
                              if (tournamentStatus === 'ONGOING' && matchReady && !matchComplete) {
                                openScoreModal(match)
                              }
                            }}
                          >
                            {/* Match time and status */}
                            <div className="absolute -top-6 left-0 text-xs text-gray-500">
                              {match.scheduledTime 
                                ? new Date(match.scheduledTime).toLocaleString()
                                : 'TBD'
                              }
                            </div>
                            
                            {/* Team 1 */}
                            <div className={`p-3 border-b ${
                              match.winnerId === match.team1Id 
                                ? 'bg-green-900/20 border-green-600/50' 
                                : match.winnerId === match.team2Id
                                ? 'bg-red-900/20'
                                : ''
                            }`}>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  {team1?.team.logo ? (
                                    <img 
                                      src={team1.team.logo} 
                                      alt={`${team1.team.name} logo`}
                                      className="w-5 h-5 mr-2 rounded-full"
                                    />
                                  ) : match.team1Id ? (
                                    <div className="w-5 h-5 mr-2 rounded-full bg-red-900/30 flex items-center justify-center text-xs">
                                      {getTeamName(match.team1Id).charAt(0)}
                                    </div>
                                  ) : null}
                                  <span>{match.team1Id ? getTeamName(match.team1Id) : 'TBD'}</span>
                                </div>
                                <span className="text-lg font-mono">
                                  {matchComplete ? match.team1Score || 0 : ''}
                                </span>
                              </div>
                            </div>
                            
                            {/* Team 2 */}
                            <div className={`p-3 ${
                              match.winnerId === match.team2Id 
                                ? 'bg-green-900/20 border-green-600/50' 
                                : match.winnerId === match.team1Id
                                ? 'bg-red-900/20'
                                : ''
                            }`}>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  {team2?.team.logo ? (
                                    <img 
                                      src={team2.team.logo} 
                                      alt={`${team2.team.name} logo`}
                                      className="w-5 h-5 mr-2 rounded-full"
                                    />
                                  ) : match.team2Id ? (
                                    <div className="w-5 h-5 mr-2 rounded-full bg-red-900/30 flex items-center justify-center text-xs">
                                      {getTeamName(match.team2Id).charAt(0)}
                                    </div>
                                  ) : null}
                                  <span>{match.team2Id ? getTeamName(match.team2Id) : 'TBD'}</span>
                                </div>
                                <span className="text-lg font-mono">
                                  {matchComplete ? match.team2Score || 0 : ''}
                                </span>
                              </div>
                            </div>
                            
                            {/* Match status indicator */}
                            <div className="absolute -bottom-6 left-0 right-0 text-center text-xs">
                              {matchComplete ? (
                                <span className="text-green-500">Complete</span>
                              ) : matchReady ? (
                                <span className="text-yellow-500">Ready</span>
                              ) : (
                                <span className="text-gray-500">Waiting</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Score Modal */}
      {isScoreModalOpen && selectedMatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black/90 border border-red-600 p-6 max-w-md w-full">
            <h2 className="text-xl mb-4">Enter Match Result</h2>
            
            <div className="mb-6">
              <div className="grid grid-cols-1 gap-4">
                {/* Team 1 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-300">
                      {getTeamName(selectedMatch.split('-')[0])}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={scores.team1Score}
                      onChange={(e) => setScores({...scores, team1Score: parseInt(e.target.value) || 0})}
                      className="w-16 bg-black/80 border border-red-900/50 text-white px-3 py-1 text-center"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedWinner(selectedMatch.split('-')[0])}
                    className={`w-full py-2 px-3 border ${
                      selectedWinner === selectedMatch.split('-')[0]
                        ? 'border-green-600 bg-green-900/30 text-green-400'
                        : 'border-gray-700 hover:border-red-600'
                    }`}
                  >
                    Select as Winner
                  </button>
                </div>
                
                <div className="text-center text-gray-500">VS</div>
                
                {/* Team 2 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-300">
                      {getTeamName(selectedMatch.split('-')[1])}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={scores.team2Score}
                      onChange={(e) => setScores({...scores, team2Score: parseInt(e.target.value) || 0})}
                      className="w-16 bg-black/80 border border-red-900/50 text-white px-3 py-1 text-center"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedWinner(selectedMatch.split('-')[1])}
                    className={`w-full py-2 px-3 border ${
                      selectedWinner === selectedMatch.split('-')[1]
                        ? 'border-green-600 bg-green-900/30 text-green-400'
                        : 'border-gray-700 hover:border-red-600'
                    }`}
                  >
                    Select as Winner
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setIsScoreModalOpen(false)}
                className="px-4 py-2 border border-gray-700 hover:border-red-600"
              >
                Cancel
              </button>
              
              <button
                type="button"
                disabled={!selectedWinner || isUpdatingMatch}
                onClick={handleUpdateMatchResult}
                className="px-4 py-2 bg-red-800/50 border border-red-600 hover:bg-red-700/50 transition-all disabled:opacity-50"
              >
                {isUpdatingMatch ? 'Submitting...' : 'Submit Result'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}