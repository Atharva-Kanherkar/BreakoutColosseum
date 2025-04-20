import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Anton } from 'next/font/google'

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

interface TournamentSettingsProps {
  tournament: any
  session: any
  onTournamentUpdate: (tournament: any) => void
  onDeleteTournament: () => void
}

// Tournament format options
const formatOptions = [
  { value: 'SINGLE_ELIMINATION', label: 'Single Elimination' },
  { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
  { value: 'ROUND_ROBIN', label: 'Round Robin' },
  { value: 'SWISS', label: 'Swiss' }
]

export default function TournamentSettings({
  tournament,
  session,
  onTournamentUpdate,
  onDeleteTournament
}: TournamentSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDeleteText, setConfirmDeleteText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    name: tournament?.name || '',
    description: tournament?.description || '',
    startDate: tournament?.startDate ? new Date(tournament.startDate).toISOString().slice(0, 16) : '',
    endDate: tournament?.endDate ? new Date(tournament.endDate).toISOString().slice(0, 16) : '',
    maxParticipants: tournament?.maxParticipants || 16,
    format: tournament?.format || 'SINGLE_ELIMINATION',
    entryFee: tournament?.entryFee || 0,
    rulesUrl: tournament?.rulesUrl || '',
    discordUrl: tournament?.discordUrl || '',
    streamUrl: tournament?.streamUrl || ''
  })

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: parseInt(value) || 0 })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session || !tournament) return
    
    try {
      setIsLoading(true)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournament.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify(formData)
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update tournament')
      }
      
      const updatedTournament = await response.json()
      onTournamentUpdate(updatedTournament)
      
      toast.success('Tournament settings updated successfully')
    } catch (error: any) {
      console.error('Error updating tournament:', error)
      toast.error(error.message || 'Failed to update tournament settings')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tournament deletion
  const handleDelete = async () => {
    if (confirmDeleteText !== tournament.name) {
      toast.error('Tournament name does not match')
      return
    }
    
    setIsDeleting(true)
    onDeleteTournament()
    // The actual deletion is handled in the parent component
  }

  // Check if tournament can be updated based on its status
  const canUpdate = 
    tournament?.status === 'DRAFT' || 
    tournament?.status === 'REGISTRATION_OPEN'

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <>
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
          
          <h2 className={`${anton.className} text-2xl mb-6`}>Tournament Settings</h2>
          
          {!canUpdate && (
            <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-500 p-4 mb-6">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>Limited editing is available because the tournament is in progress or completed.</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-400 mb-1">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!canUpdate}
                    required
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600 disabled:opacity-70"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm text-gray-400 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={!canUpdate}
                    required
                    rows={3}
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600 disabled:opacity-70"
                  />
                </div>
                
                <div>
                  <label htmlFor="format" className="block text-sm text-gray-400 mb-1">
                    Tournament Format *
                  </label>
                  <select
                    id="format"
                    name="format"
                    value={formData.format}
                    onChange={handleChange}
                    disabled={!canUpdate || tournament?.status !== 'DRAFT'}
                    required
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600 disabled:opacity-70"
                  >
                    {formatOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {tournament?.status !== 'DRAFT' && (
                    <p className="text-xs text-yellow-500 mt-1">
                      Tournament format cannot be changed after the draft stage.
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="maxParticipants" className="block text-sm text-gray-400 mb-1">
                    Maximum Participants *
                  </label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleNumberChange}
                    disabled={!canUpdate || tournament?.status !== 'DRAFT'}
                    min={2}
                    max={128}
                    required
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600 disabled:opacity-70"
                  />
                  {tournament?.status !== 'DRAFT' && (
                    <p className="text-xs text-yellow-500 mt-1">
                      Maximum participants cannot be changed after the draft stage.
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="entryFee" className="block text-sm text-gray-400 mb-1">
                    Entry Fee (tokens)
                  </label>
                  <input
                    type="number"
                    id="entryFee"
                    name="entryFee"
                    value={formData.entryFee}
                    onChange={handleNumberChange}
                    disabled={!canUpdate || tournament?.status !== 'DRAFT'}
                    min={0}
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600 disabled:opacity-70"
                  />
                  {tournament?.status !== 'DRAFT' && (
                    <p className="text-xs text-yellow-500 mt-1">
                      Entry fee cannot be changed after the draft stage.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm text-gray-400 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    disabled={!canUpdate}
                    required
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600 disabled:opacity-70"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm text-gray-400 mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    disabled={!canUpdate}
                    required
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600 disabled:opacity-70"
                  />
                </div>
                
                <div>
                  <label htmlFor="rulesUrl" className="block text-sm text-gray-400 mb-1">
                    Rules URL
                  </label>
                  <input
                    type="url"
                    id="rulesUrl"
                    name="rulesUrl"
                    value={formData.rulesUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/rules"
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                  />
                </div>
                
                <div>
                  <label htmlFor="discordUrl" className="block text-sm text-gray-400 mb-1">
                    Discord Invite URL
                  </label>
                  <input
                    type="url"
                    id="discordUrl"
                    name="discordUrl"
                    value={formData.discordUrl}
                    onChange={handleChange}
                    placeholder="https://discord.gg/example"
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                  />
                </div>
                
                <div>
                  <label htmlFor="streamUrl" className="block text-sm text-gray-400 mb-1">
                    Stream URL
                  </label>
                  <input
                    type="url"
                    id="streamUrl"
                    name="streamUrl"
                    value={formData.streamUrl}
                    onChange={handleChange}
                    placeholder="https://twitch.tv/example"
                    className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-red-800/50 border border-red-600 hover:bg-red-700/50 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Danger Zone */}
        <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
          
          <h2 className={`${anton.className} text-2xl text-red-500 mb-6`}>Danger Zone</h2>
          
          <div className="border border-red-900/50 p-4 bg-red-900/10">
            <h3 className="text-lg font-bold mb-2">Delete Tournament</h3>
            <p className="text-gray-400 mb-4">
              Permanently delete this tournament along with all registered teams, matches, and related data.
              This action cannot be undone.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-900/30 border border-red-700 text-red-400 hover:bg-red-800/40 transition-colors"
              >
                Delete Tournament
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-500 text-sm">
                  Please type <strong>{tournament.name}</strong> to confirm deletion:
                </p>
                <input
                  type="text"
                  value={confirmDeleteText}
                  onChange={(e) => setConfirmDeleteText(e.target.value)}
                  className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                  placeholder="Type tournament name to confirm"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting || confirmDeleteText !== tournament.name}
                    className="px-4 py-2 bg-red-900/30 border border-red-700 text-red-400 hover:bg-red-800/40 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setConfirmDeleteText('')
                    }}
                    className="px-4 py-2 bg-black/40 border border-gray-700 hover:border-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Tournament Info */}
        <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
          
          <h2 className={`${anton.className} text-2xl mb-6`}>Tournament Information</h2>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/80 border border-red-900/30 p-3">
                <div className="text-sm text-gray-500 mb-1">Tournament ID</div>
                <div className="font-mono text-sm">{tournament.id}</div>
              </div>
              
              <div className="bg-black/80 border border-red-900/30 p-3">
                <div className="text-sm text-gray-500 mb-1">Created At</div>
                <div>{formatDate(tournament.createdAt)}</div>
              </div>
              
              <div className="bg-black/80 border border-red-900/30 p-3">
                <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                <div>{formatDate(tournament.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}