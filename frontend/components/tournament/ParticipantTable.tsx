import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface ParticipantTableProps {
  tournamentId: string
  participants: any[]
  tournamentStatus: string
  session: any
  onParticipantsUpdate: (participants: any[]) => void
}

export default function ParticipantTable({
  tournamentId,
  participants,
  tournamentStatus,
  session,
  onParticipantsUpdate
}: ParticipantTableProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<string>('registeredAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  const handleApproveParticipant = async (participantId: string) => {
    if (!session) return
    
    try {
      setPendingAction(participantId)
      setIsLoading(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/participants/${participantId}/approve`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve participant')
      }
      
      // Update participant status locally
      const updatedParticipants = participants.map(p => 
        p.id === participantId ? { ...p, status: 'APPROVED' } : p
      )
      
      onParticipantsUpdate(updatedParticipants)
      toast.success('Participant approved successfully')
    } catch (err: any) {
      console.error('Error approving participant:', err)
      toast.error(err.message || 'Failed to approve participant')
    } finally {
      setIsLoading(false)
      setPendingAction(null)
    }
  }
  
  const handleRemoveParticipant = async (participantId: string) => {
    if (!session) return
    
    if (!confirm('Are you sure you want to remove this participant from the tournament?')) {
      return
    }
    
    try {
      setPendingAction(participantId)
      setIsLoading(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/participants/${participantId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove participant')
      }
      
      // Remove participant locally
      const updatedParticipants = participants.filter(p => p.id !== participantId)
      
      onParticipantsUpdate(updatedParticipants)
      toast.success('Participant removed successfully')
    } catch (err: any) {
      console.error('Error removing participant:', err)
      toast.error(err.message || 'Failed to remove participant')
    } finally {
      setIsLoading(false)
      setPendingAction(null)
    }
  }
  
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }
  
  // Filter and sort participants
  const filteredAndSortedParticipants = [...participants]
    .filter(p => 
      p.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.team.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.captain?.username?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let valueA, valueB
      
      switch(sortKey) {
        case 'teamName':
          valueA = a.team.name.toLowerCase()
          valueB = b.team.name.toLowerCase()
          break
        case 'teamTag':
          valueA = a.team.tag.toLowerCase()
          valueB = b.team.tag.toLowerCase()
          break
        case 'captain':
          valueA = a.captain?.username?.toLowerCase() || ''
          valueB = b.captain?.username?.toLowerCase() || ''
          break
        case 'status':
          valueA = a.status.toLowerCase()
          valueB = b.status.toLowerCase()
          break
        case 'registeredAt':
        default:
          valueA = new Date(a.registeredAt).getTime()
          valueB = new Date(b.registeredAt).getTime()
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  
  const canManageParticipants = tournamentStatus === 'REGISTRATION_OPEN' || tournamentStatus === 'DRAFT'
  
  return (
    <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
      <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold">Tournament Participants</h2>
        
        <div className="w-full md:w-64">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teams..."
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
        </div>
      </div>
      
      {participants.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          <p>No participants have registered for this tournament yet.</p>
        </div>
      ) : filteredAndSortedParticipants.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          <p>No participants match your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-red-900/20">
                <th 
                  className="text-left p-3 cursor-pointer hover:bg-red-900/30"
                  onClick={() => handleSort('teamName')}
                >
                  <div className="flex items-center">
                    Team Name
                    {sortKey === 'teamName' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left p-3 cursor-pointer hover:bg-red-900/30"
                  onClick={() => handleSort('teamTag')}
                >
                  <div className="flex items-center">
                    Tag
                    {sortKey === 'teamTag' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left p-3 cursor-pointer hover:bg-red-900/30"
                  onClick={() => handleSort('captain')}
                >
                  <div className="flex items-center">
                    Captain
                    {sortKey === 'captain' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left p-3 cursor-pointer hover:bg-red-900/30"
                  onClick={() => handleSort('registeredAt')}
                >
                  <div className="flex items-center">
                    Registered
                    {sortKey === 'registeredAt' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left p-3 cursor-pointer hover:bg-red-900/30"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortKey === 'status' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                {canManageParticipants && (
                  <th className="text-left p-3">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedParticipants.map((participant) => (
                <tr key={participant.id} className="border-t border-red-900/20 hover:bg-red-900/10">
                  <td className="p-3">
                    <div className="flex items-center">
                      {participant.team.logo ? (
                        <img 
                          src={participant.team.logo} 
                          alt={`${participant.team.name} logo`}
                          className="w-6 h-6 mr-2 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 mr-2 rounded-full bg-red-900/30 flex items-center justify-center text-xs">
                          {participant.team.name.charAt(0)}
                        </div>
                      )}
                      {participant.team.name}
                    </div>
                  </td>
                  <td className="p-3">[{participant.team.tag}]</td>
                  <td className="p-3">{participant.captain?.username || 'Unknown'}</td>
                  <td className="p-3 text-sm">{new Date(participant.registeredAt).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      participant.status === 'PENDING' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                      participant.status === 'APPROVED' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                      participant.status === 'REJECTED' ? 'bg-red-900/30 text-red-400 border border-red-500/30' :
                      'bg-gray-900/30 text-gray-400 border border-gray-500/30'
                    }`}>
                      {participant.status}
                    </span>
                  </td>
                  {canManageParticipants && (
                    <td className="p-3">
                      <div className="flex space-x-2">
                        {participant.status === 'PENDING' && (
                          <button
                            onClick={() => handleApproveParticipant(participant.id)}
                            disabled={isLoading && pendingAction === participant.id}
                            className="px-2 py-1 bg-green-900/30 text-green-400 border border-green-600/30 text-xs hover:bg-green-800/30 transition-colors disabled:opacity-50"
                          >
                            {isLoading && pendingAction === participant.id ? 'Approving...' : 'Approve'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          disabled={isLoading && pendingAction === participant.id}
                          className="px-2 py-1 bg-red-900/30 text-red-400 border border-red-600/30 text-xs hover:bg-red-800/30 transition-colors disabled:opacity-50"
                        >
                          {isLoading && pendingAction === participant.id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-400">
        {participants.length} total {participants.length === 1 ? 'participant' : 'participants'}
      </div>
    </div>
  )
}