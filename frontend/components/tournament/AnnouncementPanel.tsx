import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Anton } from 'next/font/google'

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

interface AnnouncementPanelProps {
  tournamentId: string
  session: any
}

interface Announcement {
  id: string
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export default function AnnouncementPanel({
  tournamentId,
  session
}: AnnouncementPanelProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false
  })

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!session) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/announcements`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch announcements')
        }
        
        const data = await response.json()
        setAnnouncements(data.announcements || [])
      } catch (err: any) {
        console.error('Error fetching announcements:', err)
        setError(err.message || 'Failed to load announcements')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAnnouncements()
  }, [tournamentId, session])

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }
  
  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isPinned: e.target.checked })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) return
    
    try {
      if (isEditing) {
        await updateAnnouncement()
      } else {
        await createAnnouncement()
      }
    } catch (err: any) {
      console.error('Error submitting announcement:', err)
      toast.error(err.message || 'Failed to submit announcement')
    }
  }
  
  // Create new announcement
  const createAnnouncement = async () => {
    setIsCreating(true)
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/announcements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify(formData)
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create announcement')
      }
      
      const newAnnouncement = await response.json()
      
      // Update announcements list
      setAnnouncements([newAnnouncement, ...announcements])
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        isPinned: false
      })
      
      toast.success('Announcement created successfully')
    } finally {
      setIsCreating(false)
    }
  }
  
  // Update announcement
  const updateAnnouncement = async () => {
    setIsCreating(true)
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/announcements/${editingId}`,
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
        throw new Error(errorData.error || 'Failed to update announcement')
      }
      
      const updatedAnnouncement = await response.json()
      
      // Update announcements list
      setAnnouncements(announcements.map(a => 
        a.id === editingId ? updatedAnnouncement : a
      ))
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        isPinned: false
      })
      setIsEditing(false)
      setEditingId(null)
      
      toast.success('Announcement updated successfully')
    } finally {
      setIsCreating(false)
    }
  }
  
  // Delete announcement
  const handleDelete = async (id: string) => {
    if (!session) return
    
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/announcements/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete announcement')
      }
      
      // Update announcements list
      setAnnouncements(announcements.filter(a => a.id !== id))
      
      toast.success('Announcement deleted')
    } catch (err: any) {
      console.error('Error deleting announcement:', err)
      toast.error(err.message || 'Failed to delete announcement')
    }
  }
  
  // Edit announcement
  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isPinned: announcement.isPinned
    })
    setIsEditing(true)
    setEditingId(announcement.id)
  }
  
  // Cancel editing
  const handleCancel = () => {
    setFormData({
      title: '',
      content: '',
      isPinned: false
    })
    setIsEditing(false)
    setEditingId(null)
  }
  
  // Toggle pin status
  const handleTogglePin = async (announcement: Announcement) => {
    if (!session) return
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/announcements/${announcement.id}/pin`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ isPinned: !announcement.isPinned })
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update pin status')
      }
      
      const updatedAnnouncement = await response.json()
      
      // Update announcements list
      setAnnouncements(announcements.map(a => 
        a.id === announcement.id ? updatedAnnouncement : a
      ))
      
      toast.success(`Announcement ${updatedAnnouncement.isPinned ? 'pinned' : 'unpinned'}`)
    } catch (err: any) {
      console.error('Error toggling pin status:', err)
      toast.error(err.message || 'Failed to update pin status')
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
      {/* Announcement Form */}
      <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
        
        <h2 className={`${anton.className} text-2xl mb-4`}>
          {isEditing ? 'Edit Announcement' : 'Create Announcement'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm text-gray-400 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
              placeholder="Announcement title"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm text-gray-400 mb-1">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-black/80 border border-red-900/50 text-white px-4 py-2 focus:outline-none focus:border-red-600"
              placeholder="Write your announcement here..."
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPinned"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            <label htmlFor="isPinned" className="text-sm text-gray-400">
              Pin this announcement to the top
            </label>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-red-800/50 border border-red-600 hover:bg-red-700/50 transition-all disabled:opacity-50"
            >
              {isCreating ? 'Saving...' : isEditing ? 'Update Announcement' : 'Post Announcement'}
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-black/60 border border-gray-600 hover:border-gray-400 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Announcements List */}
      <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
        
        <h2 className={`${anton.className} text-2xl mb-4`}>Tournament Announcements</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 text-red-500 p-4">
            {error}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No announcements have been posted yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.sort((a, b) => {
              // Sort by pinned first, then by date
              if (a.isPinned && !b.isPinned) return -1
              if (!a.isPinned && b.isPinned) return 1
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }).map(announcement => (
              <div 
                key={announcement.id} 
                className={`bg-black/80 border p-4 ${
                  announcement.isPinned ? 'border-yellow-600' : 'border-red-900/30'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">
                    {announcement.isPinned && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                    {announcement.title}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTogglePin(announcement)}
                      className={`p-1 rounded-full ${announcement.isPinned ? 'text-yellow-500 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-500'}`}
                      title={announcement.isPinned ? 'Unpin announcement' : 'Pin announcement'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-1 rounded-full text-gray-400 hover:text-blue-500"
                      title="Edit announcement"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-1 rounded-full text-gray-400 hover:text-red-500"
                      title="Delete announcement"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="text-gray-300 whitespace-pre-wrap mb-3">
                  {announcement.content}
                </div>
                
                <div className="text-xs text-gray-500">
                  Posted: {formatDate(announcement.createdAt)}
                  {announcement.updatedAt !== announcement.createdAt && (
                    <span> · Updated: {formatDate(announcement.updatedAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}