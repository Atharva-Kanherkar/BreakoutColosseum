'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Anton } from 'next/font/google'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ParticleBackground from '@/components/ParticleBackground'
import { toast } from 'react-hot-toast'

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

interface TeamFormData {
  name: string
  tag: string
  logo: string
  tournamentId: string
}

export default function CreateTeam() {
  const { session } = useAuth()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isTournamentLoading, setIsTournamentLoading] = useState(false)
  const [tournaments, setTournaments] = useState<any[]>([])
  
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    tag: '',
    logo: '',
    tournamentId: ''
  })

  // Fetch available tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      if (!session) return
      
      setIsTournamentLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments?status=REGISTRATION`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch tournaments')
        }
        
        const data = await response.json()
        setTournaments(data.tournaments || [])
      } catch (error) {
        console.error('Error fetching tournaments:', error)
        toast.error('Failed to load available tournaments')
      } finally {
        setIsTournamentLoading(false)
      }
    }
    
    fetchTournaments()
}, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create team')
      }
      
      const data = await response.json()
      toast.success('Team created successfully!')
      router.push(`/teams/${data.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team')
      console.error('Error creating team:', error)
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
            <span className="text-white">CREATE</span> <span className="text-red-600">TEAM</span>
          </h1>
          <p className="text-gray-400">Form a new team to compete in tournaments</p>
        </div>
        
        <div className="max-w-2xl mx-auto bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Team Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                placeholder="Enter team name"
              />
            </div>
            
            <div>
              <label htmlFor="tag" className="block text-sm font-medium text-gray-300 mb-1">
                Team Tag * <span className="text-xs text-gray-500">(2-5 characters)</span>
              </label>
              <input
                type="text"
                id="tag"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={5}
                className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                placeholder="TAG"
              />
            </div>
            
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-1">
                Logo URL <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <input
                type="url"
                id="logo"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div>
              <label htmlFor="tournamentId" className="block text-sm font-medium text-gray-300 mb-1">
                Tournament *
              </label>
              <select
                id="tournamentId"
                name="tournamentId"
                value={formData.tournamentId}
                onChange={handleChange}
                required
                className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
              >
                <option value="">Select a tournament</option>
                {isTournamentLoading ? (
                  <option disabled>Loading tournaments...</option>
                ) : (
                  tournaments.map(tournament => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </option>
                  ))
                )}
              </select>
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
                {isLoading ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}