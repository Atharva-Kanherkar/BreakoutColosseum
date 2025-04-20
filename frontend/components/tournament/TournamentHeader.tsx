import { useState } from 'react'
import { Anton } from 'next/font/google'

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' })

interface TournamentHeaderProps {
  tournament: any
  isHost: boolean
  statusOptions?: { value: string, label: string }[]
  onStatusChange?: (status: string) => void
  isStatusUpdating?: boolean
}

export default function TournamentHeader({
  tournament,
  isHost,
  statusOptions,
  onStatusChange,
  isStatusUpdating = false
}: TournamentHeaderProps) {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="mb-8 bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
      <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
      
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={`${anton.className} text-4xl mb-2`}>
            <span className="text-white">{tournament.name}</span>
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Start: {formatDate(tournament.startDate)}</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>End: {formatDate(tournament.endDate)}</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Max Teams: {tournament.maxParticipants}</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>Format: {tournament.format.replace(/_/g, ' ')}</span>
            </div>
            {tournament.entryFee > 0 && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Entry Fee: {tournament.entryFee} tokens</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-300 max-w-3xl">{tournament.description}</p>
        </div>
        
        <div>
          {isHost && statusOptions ? (
            <div className="relative">
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                disabled={isStatusUpdating}
                className="flex items-center justify-between w-48 px-4 py-2 border border-red-600 text-white font-medium"
              >
                <span className={`flex items-center text-sm ${isStatusUpdating ? 'opacity-50' : ''}`}>
                  {isStatusUpdating ? 'Updating...' : `Status: ${tournament.status.replace(/_/g, ' ')}`}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isStatusDropdownOpen && (
                <div className="absolute z-10 mt-1 w-48 bg-black border border-red-900/50 shadow-lg">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      disabled={option.value === tournament.status}
                      onClick={() => {
                        onStatusChange?.(option.value)
                        setIsStatusDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        option.value === tournament.status
                          ? 'bg-red-900/30 text-red-400 cursor-default'
                          : 'hover:bg-red-900/20 text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={`inline-block px-3 py-1 rounded text-sm ${
              tournament.status === 'REGISTRATION_OPEN' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
              tournament.status === 'ONGOING' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
              tournament.status === 'COMPLETED' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
              'bg-gray-900/30 text-gray-400 border border-gray-500/30'
            }`}>
              {tournament.status.replace(/_/g, ' ')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}