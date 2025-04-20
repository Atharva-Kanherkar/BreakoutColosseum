// filepath: /home/atharva/game-backend/frontend/app/tournaments/me/hosting/page.tsx
'use client'
import React from 'react'; 
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Anton } from 'next/font/google';
import ParticleBackground from '@/components/ParticleBackground';
import { toast } from 'react-hot-toast';

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' });

// Define the structure of a tournament object returned by the API
interface HostedTournament {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  format: string;
  isTeamBased: boolean;
  _count: {
    participants: number;
    teams: number;
  };
  // Add other relevant fields if needed
}

export default function MyHostingPage() {
  const { session, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [hostedTournaments, setHostedTournaments] = useState<HostedTournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in after auth check is complete
    if (!authLoading && !session) {
      toast.error("Please log in to view your hosted tournaments.");
      router.push('/signin?redirect=/tournaments/me/hosting');
      return;
    }

    // Fetch data only if logged in
    if (session) {
      const fetchHostedTournaments = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/me/hosting`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
               throw new Error("Authentication failed. Please log in again.");
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch hosted tournaments (${response.status})`);
          }

          const data = await response.json();
          console.log('API Response Data:', data);
          setHostedTournaments(data.items || []); 

        } catch (err: any) {
          console.error("Error fetching hosted tournaments:", err);
          setError(err.message);
          toast.error(err.message || "Could not load your tournaments.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchHostedTournaments();
    } else {
        // If session is null but auth isn't loading yet, wait for auth check
        setIsLoading(authLoading);
    }
  }, [session, authLoading, router]);

  // Helper to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Get status color helper
  const getStatusStyles = (status: string) => {
     switch (status) {
      case 'DRAFT': return 'bg-gray-700/30 text-gray-400 border-gray-600/50';
      case 'REGISTRATION_OPEN': return 'bg-green-900/30 text-green-400 border-green-600/50';
      case 'REGISTRATION_CLOSED': return 'bg-yellow-900/30 text-yellow-400 border-yellow-600/50';
      case 'ONGOING': return 'bg-blue-900/30 text-blue-400 border-blue-600/50';
      case 'COMPLETED': return 'bg-purple-900/30 text-purple-400 border-purple-600/50';
      case 'CANCELLED': return 'bg-red-900/30 text-red-400 border-red-600/50';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-600/50';
    }
  }

  const renderContent = () => {
    if (isLoading || authLoading) {
      return (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading Your Tournaments...</p>
        </div>
      );
    }

    if (error) {
      return <p className="text-center text-red-500 py-10">Error: {error}</p>;
    }

    if (hostedTournaments.length === 0) {
      return (
        <div className="text-center py-10 text-gray-400">
          <p className="mb-4">You haven't hosted any tournaments yet.</p>
          <Link href="/tournaments/create" className="font-mono text-sm uppercase tracking-wider px-6 py-3 text-white bg-red-800/50 border border-red-800 hover:bg-red-700/50 transition-all duration-300">
            Create Your First Tournament
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {hostedTournaments.map((tournament) => {
          const participantCount = tournament.isTeamBased ? tournament._count.teams : tournament._count.participants;
          return (
            <div key={tournament.id} className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-grow">
                <Link href={`/tournaments/${tournament.id}/host`} className={`${anton.className} text-xl text-white hover:text-red-500 transition-colors block mb-1`}>
                  {tournament.name}
                </Link>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                  <span className={`px-2 py-0.5 rounded border ${getStatusStyles(tournament.status)}`}>
                    {tournament.status.replace('_', ' ')}
                  </span>
                  <span>{tournament.format.replace('_', ' ')}</span>
                  <span>{formatDate(tournament.startDate)}</span>
                  <span>{participantCount} {tournament.isTeamBased ? 'Teams' : 'Players'}</span>
                </div>
              </div>
              <div className="flex-shrink-0 mt-2 md:mt-0">
                <Link href={`/tournaments/${tournament.id}/host`} className="font-mono text-xs uppercase tracking-wider px-4 py-2 text-white bg-blue-800/50 border border-blue-800 hover:bg-blue-700/50 transition-all duration-300">
                  Manage
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <ParticleBackground />
      <main className="min-h-screen text-white pt-10 pb-20 relative z-10">
        <div className="container mx-auto px-4">
          <h1 className={`${anton.className} text-4xl mb-8 text-center`}><span className="text-red-600">MY HOSTED</span> TOURNAMENTS</h1>
          {renderContent()}
        </div>
      </main>
    </>
  );
}