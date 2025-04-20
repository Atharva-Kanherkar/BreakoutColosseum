// filepath: /home/atharva/game-backend/frontend/app/tournaments/[id]/brackets/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Anton } from 'next/font/google';
import ParticleBackground from '@/components/ParticleBackground';
import BracketManagement from '@/components/tournament/BracketManagement'; // Import the component
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' });

// Define types based on what BracketManagement expects and API returns
interface TournamentDetails {
  id: string;
  name: string;
  status: string;
  format: string;
  hostId: string; // Needed to check if user is host
  // Add other fields if needed by BracketManagement or for display
}

interface Participant {
  id: string;
  userId: string | null;
  teamId: string | null;
  status: string; // e.g., 'APPROVED', 'PENDING'
  user?: {
    id: string;
    username: string;
  } | null;
  team?: {
    id: string;
    name: string;
    tag: string;
    logo: string | null;
  } | null;
  // Add other fields if needed by BracketManagement
}

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  status: string;
  team1Id: string | null;
  team2Id: string | null;
  participant1Id: string | null;
  participant2Id: string | null;
  winnerId: string | null;
  team1Score: number | null;
  team2Score: number | null;
  scheduledTime: string | null;
  nextMatchId: string | null;
  bracketSection: string | null; // e.g., 'WINNERS', 'LOSERS', 'FINALS'
  // Include nested relations if needed by BracketManagement (though it seems to handle lookups via participants prop)
}

export default function TournamentBracketPage() {
  const params = useParams();
  const router = useRouter();
  const { session, user, isLoading: authLoading } = useAuth();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!tournamentId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch tournament details, participants, and matches in parallel
      const [tournamentRes, participantsRes, matchesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}`),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/participants?limit=1000`), // Fetch all participants
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/matches/tournament/${tournamentId}?limit=1000`) // Fetch all matches
      ]);

      // Check tournament response
      if (!tournamentRes.ok) {
        if (tournamentRes.status === 404) throw new Error('Tournament not found.');
        const errorData = await tournamentRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch tournament details (${tournamentRes.status})`);
      }
      const tournamentData = await tournamentRes.json();
      setTournament(tournamentData);

      // Check participants response
      if (!participantsRes.ok) {
         console.warn(`Failed to fetch participants (${participantsRes.status})`);
         // Decide if this is critical - maybe brackets can display without full participant details?
         // throw new Error(`Failed to fetch participants (${participantsRes.status})`);
         setParticipants([]); // Set empty if fetch fails but not critical
      } else {
         const participantsData = await participantsRes.json();
         setParticipants(participantsData.participants || []); // Adjust based on API structure
      }


      // Check matches response
      if (!matchesRes.ok) {
        // If matches fail, maybe bracket hasn't been generated yet? Don't throw fatal error.
        console.warn(`Failed to fetch matches (${matchesRes.status}). Bracket might not be generated.`);
        setMatches([]); // Set empty if fetch fails
      } else {
         const matchesData = await matchesRes.json();
         setMatches(matchesData.matches || []); // Adjust based on API structure
      }


    } catch (err: any) {
      console.error("Error fetching bracket data:", err);
      setError(err.message);
      // Avoid toast if just "Not Found"
      if (err.message !== 'Tournament not found.') {
        toast.error(err.message || "Could not load bracket data.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Callback for BracketManagement to update matches state after generation/update
  const handleMatchesUpdate = useCallback((updatedMatches: Match[]) => {
    setMatches(updatedMatches);
    // Optionally re-fetch all data if needed, though updating locally is faster
    // fetchData();
  }, []);


  const renderContent = () => {
    if (isLoading || authLoading) {
      return (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading Bracket...</p>
        </div>
      );
    }

    if (error === 'Tournament not found.') {
       return (
         <div className="text-center py-20 text-red-500">
           <h2 className={`${anton.className} text-2xl mb-4`}>Not Found</h2>
           <p className="mb-4">The requested tournament could not be found.</p>
           <Link href="/tournaments" className="text-red-500 hover:underline">
             Back to Tournaments
           </Link>
         </div>
       );
    }

    if (error) {
      return <p className="text-center text-red-500 py-20">Error loading bracket: {error}</p>;
    }

    if (!tournament) {
      return <p className="text-center text-gray-400 py-20">Tournament data could not be loaded.</p>;
    }

    // Pass necessary props to BracketManagement
    return (
      <BracketManagement
        tournamentId={tournament.id}
        tournamentFormat={tournament.format}
        tournamentStatus={tournament.status}
        participants={participants} // Pass fetched participants
        matches={matches} // Pass fetched matches
        session={session} // Pass session for auth checks within the component
        onMatchesUpdate={handleMatchesUpdate} // Pass callback to update state
      />
    );
  };

  return (
    <>
      <ParticleBackground />
      <main className="min-h-screen text-white pt-10 pb-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
             <h1 className={`${anton.className} text-4xl mb-2`}>
               <Link href={`/tournaments/${tournamentId}`} className="text-white hover:text-red-500 transition-colors">
                 {tournament?.name || 'Tournament'}
               </Link>
             </h1>
             <h2 className={`${anton.className} text-3xl text-red-600`}>BRACKETS</h2>
          </div>
          {renderContent()}
        </div>
      </main>
    </>
  );
}