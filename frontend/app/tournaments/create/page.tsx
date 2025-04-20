'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Anton } from 'next/font/google'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ParticleBackground from '@/components/ParticleBackground'
import { toast } from 'react-hot-toast'

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

interface TournamentFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  maxParticipants: number
  format: string
  entryFee: number
  gameId: string
}

export default function CreateTournament() {
  const { session } = useAuth()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    maxParticipants: 32,
    format: 'SINGLE_ELIMINATION',
    entryFee: 0,
    gameId: 'game1' // Default game ID
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxParticipants' || name === 'entryFee' 
        ? parseFloat(value) 
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create tournament')
      }
      
      const data = await response.json()
      toast.success('Tournament created successfully!')
      router.push(`/tournaments/${data.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tournament')
      console.error('Error creating tournament:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <ParticleBackground />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
      
      <div className="container mx-auto px-4 z-10 relative pt-10 pb-20">
        <div className="mb-8">
          <h1 className={`${anton.className} text-4xl mb-2`}>
            <span className="text-white">CREATE</span> <span className="text-red-600">TOURNAMENT</span>
          </h1>
          <p className="text-gray-400">Set up a new tournament for players to join</p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Tournament Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                placeholder="Enter tournament name"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                placeholder="Describe your tournament"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-300 mb-1">
                  Max Participants *
                </label>
                <select
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                >
                  <option value="8">8 Participants</option>
                  <option value="16">16 Participants</option>
                  <option value="32">32 Participants</option>
                  <option value="64">64 Participants</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="format" className="block text-sm font-medium text-gray-300 mb-1">
                  Tournament Format *
                </label>
                <select
                  id="format"
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                >
                  <option value="SINGLE_ELIMINATION">Single Elimination</option>
                  <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                  <option value="ROUND_ROBIN">Round Robin</option>
                  <option value="SWISS">Swiss System</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="entryFee" className="block text-sm font-medium text-gray-300 mb-1">
                  Entry Fee (in tokens)
                </label>
                <input
                  type="number"
                  id="entryFee"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label htmlFor="gameId" className="block text-sm font-medium text-gray-300 mb-1">
                  Game *
                </label>
                <select
                  id="gameId"
                  name="gameId"
                  value={formData.gameId}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                >
                  <option value="game1">ChainArena Battle</option>
                  <option value="game2">Crypto Clash</option>
                  <option value="game3">NFT Warriors</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Link 
                href="/dashboard" 
                className="px-6 py-2 bg-black/80 border border-red-900/50 hover:border-red-600 transition-colors"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-red-800/50 border border-red-600 hover:bg-red-700/50 transition-all"
              >
                {isLoading ? 'Creating...' : 'Create Tournament'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}