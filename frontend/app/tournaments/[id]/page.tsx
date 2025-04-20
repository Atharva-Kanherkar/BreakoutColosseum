'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback and useMemo
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Anton } from 'next/font/google';
import ParticleBackground from '@/components/ParticleBackground';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useConnection, useWallet } from '@solana/wallet-adapter-react'; // Import wallet hooks
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'; // Import web3.js classes
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token'; // Import spl-token functions
import BN from 'bn.js'; // Import BN for large number handling

const anton = Anton({ weight: '400', subsets: ['latin'], display: 'swap' });

// Define type for the detailed tournament data including prize info
interface TournamentPublicDetails {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  format: string;
  registrationDeadline: string;
  host: {
    id: string;
    username: string;
  };
  isTeamBased: boolean;
  teamSize: number | null;
  minParticipants: number | null;
  maxParticipants: number | null;
  _count: {
    participants: number;
    teams: number;
    spectators: number;
  };
  prize?: { // Added prize details structure
    entryFee: string | null;
    tokenType: string; // Should be 'SOL' or 'SPL'
    tokenAddress: string | null; // Mint address for SPL tokens
    platformFeePercent: number;
  } | null;
  // Add other fields like rulesLink, discordLink if returned by API
}

// Define type for participant list item (if shown publicly)
interface PublicParticipant {
  id: string;
  user?: { // May not always be included depending on API
    id: string;
    username: string;
    avatar: string | null;
  };
  team?: { // May not always be included depending on API
    id: string;
    name: string;
    tag: string;
  };
  seed: number | null;
  isApproved: boolean; // Useful to show pending/approved
  entryFeeTx: string | null; // Added to match backend schema
}


export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  // Destructure isLoading and rename it to authLoading
  const { session, user, isLoading: authLoading } = useAuth(); // Get session and user info
  const tournamentId = params.id as string;

  // Wallet Adapter Hooks
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet(); // Ensure sendTransaction is available

  const [tournament, setTournament] = useState<TournamentPublicDetails | null>(null);
  const [participants, setParticipants] = useState<PublicParticipant[]>([]); // State for participants
  const [isLoading, setIsLoading] = useState(true); // This is for data fetching
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false); // Added state for unregistering

  // Platform Fee Address from environment
  const platformFeeAddress = useMemo(() => {
      try {
          // Ensure this environment variable is set in .env.local and Vercel/Render
          return process.env.NEXT_PUBLIC_PLATFORM_FEE_ADDRESS ? new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_FEE_ADDRESS) : null;
      } catch (e) {
          console.error("Invalid Platform Fee Address in env:", process.env.NEXT_PUBLIC_PLATFORM_FEE_ADDRESS, e);
          // Show toast only once if address is invalid
          // Avoid repeated toasts on re-renders by checking if it was already null
          // if (!platformFeeAddress) { // This check inside useMemo might not work as expected
             toast.error("Platform configuration error. Cannot process payments.");
          // }
          return null;
      }
  }, []); // Dependency array is empty as env var doesn't change at runtime


  // --- Fetch Data ---
  const fetchData = useCallback(async () => { // Wrap fetch logic in useCallback
      if (!tournamentId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch main tournament details and participants in parallel
        const [tournamentRes, participantsRes] = await Promise.all([
             fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}`),
             fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/participants?limit=1000`) // Fetch all participants
        ]);


        if (!tournamentRes.ok) {
          if (tournamentRes.status === 404) {
            throw new Error('Tournament not found.'); // Specific error for UI
          }
          const errorData = await tournamentRes.json().catch(() => ({})); // Try to get error details
          throw new Error(errorData.error || `Failed to fetch tournament details (${tournamentRes.status})`);
        }
        const tournamentData = await tournamentRes.json();
        setTournament(tournamentData);

        // Fetch participants
        if (participantsRes.ok) {
            const participantsData = await participantsRes.json();
            // Ensure participantsData.participants is an array before setting
            setParticipants(Array.isArray(participantsData.participants) ? participantsData.participants : []);
        } else {
            console.warn("Could not fetch participant list for public view.");
            setParticipants([]); // Set empty array on failure
            // Don't throw error, just show empty list or message
        }

      } catch (err: any) {
        console.error("Error fetching tournament details:", err);
        setError(err.message || 'Could not load tournament details.');
        // Don't toast error here if it's just "Not Found", let the UI handle it
        if (err.message !== 'Tournament not found.') {
            toast.error(err.message || 'Could not load tournament details.');
        }
      } finally {
        setIsLoading(false);
      }
    }, [tournamentId]); // Dependency for useCallback

  useEffect(() => {
    fetchData(); // Call the memoized fetch function
  }, [fetchData]); // useEffect depends on the memoized function


  // --- Registration Logic ---
  const handleRegister = async () => {
    // Add null check for tournament early
    if (!tournament) {
      toast.error("Tournament data not loaded yet.");
      return;
    }
    // Initial checks
    if (!session || !user) {
      toast.error("You must be logged in to register.");
      return;
    }
     if (!publicKey || !sendTransaction) {
      toast.error("Please connect your Solana wallet first.");
      return;
    }
     if (!platformFeeAddress) {
      toast.error("Platform payment address is not configured. Cannot register.");
      return;
    }
    if (tournament.status !== 'REGISTRATION_OPEN') {
      toast.error("Registration is not open.");
      return;
    }
    if (tournament.host?.id === user.id) {
      toast.error("Hosts cannot register for their own tournaments.");
      return;
    }
    // Client-side check if already registered
    if (participants.some(p => p.user?.id === user.id)) {
        toast.error("You are already registered for this tournament.");
        return;
    }
    // Check capacity client-side using participants.length for immediate feedback
    const currentParticipantCount = participants.length;
    if (tournament.maxParticipants && currentParticipantCount >= tournament.maxParticipants) {
        toast.error("Tournament has reached maximum capacity.");
        return;
    }


    setIsRegistering(true);
    let signature: string | undefined = undefined; // Variable to hold the transaction signature

    try {
      // --- Handle Entry Fee Payment ---
      // tournament is guaranteed non-null here
      const entryFeeRequired = tournament.prize?.entryFee && parseFloat(tournament.prize.entryFee) > 0;

      if (entryFeeRequired) {
        const paymentToastId = toast.loading('Preparing entry fee transaction...');

        const { entryFee, tokenType, tokenAddress } = tournament.prize!;
        const feeAmount = parseFloat(entryFee!);

        const transaction = new Transaction();
        let blockhashResult = await connection.getLatestBlockhash('finalized');
        transaction.recentBlockhash = blockhashResult.blockhash;
        transaction.feePayer = publicKey;

        if (tokenType === 'SOL') {
          const lamports = new BN(feeAmount * LAMPORTS_PER_SOL);
          if (lamports.isZero()) throw new Error("Entry fee amount is zero."); // Sanity check
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: platformFeeAddress,
              lamports: BigInt(lamports.toString()), // Use string for BigInt compatibility if needed later
            })
          );
          toast.loading('Please approve SOL transfer...', { id: paymentToastId });
        } else if (tokenAddress && tokenType === 'SPL') { // Explicitly check for SPL
          const mintPublicKey = new PublicKey(tokenAddress);
          // Fetch decimals robustly
          const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);
          // @ts-ignore - accessing parsed data safely
          const decimals = mintInfo?.value?.data?.parsed?.info?.decimals;

          if (typeof decimals !== 'number') {
              throw new Error(`Could not determine token decimals for ${tokenAddress}.`);
          }

          const amountInSmallestUnit = new BN(feeAmount * Math.pow(10, decimals));
          if (amountInSmallestUnit.isZero()) throw new Error("Entry fee amount is zero."); // Sanity check

          const fromAta = await getAssociatedTokenAddress(mintPublicKey, publicKey);
          const toAta = await getAssociatedTokenAddress(mintPublicKey, platformFeeAddress);

          transaction.add(
            createTransferInstruction(
              fromAta,
              toAta,
              publicKey, // User is the owner/signer
              BigInt(amountInSmallestUnit.toString()), // Use BigInt for createTransferInstruction v0.2.0+
              [],
              TOKEN_PROGRAM_ID
            )
          );
           toast.loading('Please approve token transfer...', { id: paymentToastId });
        } else {
          throw new Error("Invalid entry fee configuration (Type must be SOL or SPL with address).");
        }

        // Send transaction using Wallet Adapter
        signature = await sendTransaction(transaction, connection);
        console.log("Entry fee transaction sent:", signature);
        toast.dismiss(paymentToastId);
        const confirmToastId = toast.loading('Confirming payment...');

        // Confirm transaction
        const confirmation = await connection.confirmTransaction({
            signature,
            blockhash: blockhashResult.blockhash,
            lastValidBlockHeight: blockhashResult.lastValidBlockHeight
        }, 'confirmed');

        toast.dismiss(confirmToastId);
        if (confirmation.value.err) {
            console.error("Transaction Confirmation Error:", confirmation.value.err);
            throw new Error(`Payment transaction failed confirmation. Check explorer for details.`);
        }
        toast.success('Payment confirmed!');
      }
      // --- End Entry Fee Payment ---

      // --- Call Backend Register Endpoint ---
      const registerToastId = toast.loading('Finalizing registration...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        // Send signature using the backend's expected key: 'entryFeeTx'
        body: JSON.stringify(signature ? { entryFeeTx: signature } : {})
      });

      toast.dismiss(registerToastId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed after payment. Please contact support.' }));
        // Attempt to reverse payment if registration fails? (Very Complex - requires backend support)
        console.error("Backend registration failed:", errorData);
        throw new Error(errorData.error || 'Registration failed after payment.');
      }

      toast.success('Successfully registered! Your registration may require host approval.');
      // Re-fetch data to update participant list and count accurately from server
      fetchData();
      // router.push(`/tournaments/${tournamentId}/participant`); // Optional redirect

    } catch (err: any) {
      toast.dismiss(); // Dismiss any active loading toasts
      console.error("Registration Process Error:", err);
      // Provide more specific feedback for common Solana errors
      if (err.message.includes('User rejected the request')) {
          toast.error('Transaction rejected in wallet.');
      } else if (err.message.includes('insufficient lamports') || err.message.includes('insufficient funds')) {
          toast.error('Insufficient balance for transaction.');
      } else if (err.message.includes('Payment transaction failed confirmation')) {
          toast.error(err.message); // Show the specific confirmation error
      } else if (err.message.includes('Could not determine token decimals')) {
          toast.error('Error fetching token details. Check token address.');
      } else if (err.message.includes('Invalid entry fee configuration')) {
          toast.error(err.message);
      } else {
          toast.error(err.message || 'Registration failed.');
      }
    } finally {
      setIsRegistering(false);
    }
  };
  // --- End Registration Logic ---


  // --- Unregistration Logic ---
  const handleUnregister = async () => {
    // Add null check for tournament early
    if (!tournament) {
      toast.error("Tournament data not loaded yet.");
      return;
    }
    if (!session || !user) {
      toast.error("Cannot unregister at this time.");
      return;
    }
    // Optional: Add confirmation dialog
    if (!window.confirm("Are you sure you want to unregister from this tournament? Entry fees are typically non-refundable.")) {
        return;
    }

    setIsUnregistering(true);
    const unregisterToastId = toast.loading('Processing unregistration...');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tournaments/${tournamentId}/unregister`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      toast.dismiss(unregisterToastId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to unregister (${response.status})`);
      }

      toast.success('Successfully unregistered.');
      // Update participants list locally for immediate feedback
      setParticipants(prev => prev.filter(p => p.user?.id !== user.id));
      // Re-fetch data to update participant list and count accurately from server
      fetchData();

    } catch (err: any) {
      toast.dismiss(unregisterToastId); // Ensure loading toast is dismissed on error
      console.error("Unregistration error:", err);
      toast.error(err.message || 'Unregistration failed.');
    } finally {
      setIsUnregistering(false);
    }
  };
  // --- End Unregistration Logic ---


  // Helper to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
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

  // --- Render Logic ---

  // Use authLoading from useAuth hook here
  if (isLoading || authLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <ParticleBackground />
        <div className="z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl">Loading Tournament...</p>
        </div>
      </main>
    )
  }

  // Handle specific "Not Found" error after loading
   if (error === 'Tournament not found.') {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <ParticleBackground />
        <div className="z-10 text-center bg-black/60 backdrop-blur-lg border border-red-900/30 p-8">
          <h2 className={`${anton.className} text-2xl text-red-600 mb-4`}>Not Found</h2>
          <p className="text-gray-300 mb-4">The requested tournament could not be found.</p>
          <Link href="/tournaments" className="text-red-500 hover:underline">
            Back to Tournaments
          </Link>
        </div>
      </main>
    )
  }

  // Handle other errors after loading
  if (error) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <ParticleBackground />
        <div className="z-10 text-center bg-black/60 backdrop-blur-lg border border-red-900/30 p-8">
          <h2 className={`${anton.className} text-2xl text-red-600 mb-4`}>Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Link href="/tournaments" className="text-red-500 hover:underline">
            Back to Tournaments
          </Link>
        </div>
      </main>
    )
  }

  // Type guard: If we reach here, tournament is NOT null
  if (!tournament) {
     return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <ParticleBackground />
        <div className="z-10 text-center">
          <p className="text-xl">Could not load tournament data.</p>
           <Link href="/tournaments" className="text-red-500 hover:underline mt-4 block">
            Back to Tournaments
          </Link>
        </div>
      </main>
    )
  }

  // --- Derived states can now safely access tournament ---
  // Use participants.length for client-side count reflecting local updates
  const participantCount = participants.length;
  const maxCapacity = tournament.maxParticipants;
  const isFull = maxCapacity !== null && participantCount >= maxCapacity;
  const isUserRegistered = session && user && participants.some(p => p.user?.id === user.id);
  const isUserHost = session && user && tournament.host?.id === user.id; // Safe access
  const canRegister = session && !isUserRegistered && !isUserHost && tournament.status === 'REGISTRATION_OPEN' && !isFull; // Safe access
  const canUnregister = session && isUserRegistered && !isUserHost && tournament.status === 'REGISTRATION_OPEN'; // Condition for unregister button
  const entryFeeText = tournament.prize?.entryFee && parseFloat(tournament.prize.entryFee) > 0 // Safe access
    ? `(${tournament.prize.entryFee} ${tournament.prize.tokenType})`
    : '';


  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <ParticleBackground />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>

      <div className="container mx-auto px-4 z-10 relative pt-10">
        {/* Header - Safe to access tournament.name etc. here */}
        <div className="mb-6 text-center">
          <h1 className={`${anton.className} text-5xl mb-2`}>
            <span className="text-white">{tournament.name}</span>
          </h1>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-400">
            <span>Hosted by <span className="text-red-500">{tournament.host?.username || 'N/A'}</span></span>
            <span>|</span>
            <span>{tournament.format.replace('_', ' ')}</span>
            <span>|</span>
            <span className={`px-2 py-0.5 rounded border text-xs ${getStatusStyles(tournament.status)}`}>
              {tournament.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Action Buttons - Derived states are calculated correctly now */}
        <div className="flex flex-wrap justify-center items-center gap-4 mb-8"> {/* Use flex-wrap and gap */}
          {session && isUserHost && (
             <Link href={`/tournaments/${tournament.id}/host`} className="font-mono text-sm uppercase tracking-wider px-6 py-3 text-white bg-blue-800/50 border border-blue-800 hover:bg-blue-700/50 transition-all duration-300">
               Manage Tournament
             </Link>
          )}
          {session && isUserRegistered && !isUserHost && (
             <Link href={`/tournaments/${tournament.id}/participant`} className="font-mono text-sm uppercase tracking-wider px-6 py-3 text-white bg-purple-800/50 border border-purple-800 hover:bg-purple-700/50 transition-all duration-300">
               View as Participant
             </Link>
          )}

          {/* Unregister Button */}
          {canUnregister && (
            <button
              onClick={handleUnregister}
              disabled={isUnregistering}
              className="font-mono text-sm uppercase tracking-wider px-6 py-3 text-white bg-gray-700/50 border border-gray-700 hover:bg-gray-600/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUnregistering ? 'Processing...' : 'Unregister'}
            </button>
          )}

          {/* Register Button Logic */}
          {canRegister && (
            <button
              onClick={handleRegister}
              // Disable if registering, wallet not connected, or platform address missing
              disabled={isRegistering || !publicKey || !platformFeeAddress}
              className="font-mono text-sm uppercase tracking-wider px-6 py-3 text-white bg-red-800/50 border border-red-800 hover:bg-red-700/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!publicKey ? "Connect your wallet to register" : (!platformFeeAddress ? "Platform payment address not configured" : "")}
            >
              {isRegistering ? 'Processing...' : `Register Now ${entryFeeText}`}
            </button>
          )}

          {!session && tournament.status === 'REGISTRATION_OPEN' && !isFull && (
             <Link href={`/login?redirect=/tournaments/${tournament.id}`} className="font-mono text-sm uppercase tracking-wider px-6 py-3 text-white bg-gray-700/50 border border-gray-700 hover:bg-gray-600/50 transition-all duration-300">
               Login to Register {entryFeeText}
             </Link>
          )}
           {tournament.status === 'REGISTRATION_OPEN' && isFull && (
             <span className="font-mono text-sm uppercase tracking-wider px-6 py-3 text-gray-500 bg-gray-800/50 border border-gray-800 cursor-not-allowed">
               Registration Full
             </span>
          )}
           {tournament.status !== 'REGISTRATION_OPEN' && tournament.status !== 'DRAFT' && (
             <span className="font-mono text-sm uppercase tracking-wider px-6 py-3 text-gray-500 bg-gray-800/50 border border-gray-800 cursor-not-allowed">
               Registration Closed
             </span>
          )}
        </div>


        {/* Main Content Grid - Safe to access tournament properties */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Details) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
              <h2 className={`${anton.className} text-2xl mb-4`}><span className="text-red-600">INFO</span></h2>
              <div className="space-y-2 text-sm">
                <p><strong className="text-gray-400 w-32 inline-block">Starts:</strong> {formatDate(tournament.startDate)}</p>
                <p><strong className="text-gray-400 w-32 inline-block">Ends:</strong> {formatDate(tournament.endDate)}</p>
                <p><strong className="text-gray-400 w-32 inline-block">Reg. Deadline:</strong> {formatDateTime(tournament.registrationDeadline)}</p>
                <p><strong className="text-gray-400 w-32 inline-block">Type:</strong> {tournament.isTeamBased ? `Team (${tournament.teamSize}v${tournament.teamSize})` : 'Individual'}</p>
                {/* Use participantCount (derived from participants.length) for display */}
                <p><strong className="text-gray-400 w-32 inline-block">Participants:</strong> {participantCount} {maxCapacity ? `/ ${maxCapacity}` : ''}</p>
                {tournament.minParticipants && <p><strong className="text-gray-400 w-32 inline-block">Min Players:</strong> {tournament.minParticipants}</p>}
                {/* Display Entry Fee Info */}
                {tournament.prize?.entryFee && parseFloat(tournament.prize.entryFee) > 0 && (
                   <p><strong className="text-gray-400 w-32 inline-block">Entry Fee:</strong> {tournament.prize.entryFee} {tournament.prize.tokenType}</p>
                )}
                {/* Add other fields like prize pool, rules link etc. */}
                {/* <p><strong className="text-gray-400 w-32 inline-block">Prize Pool:</strong> {tournament.prizePool || 'N/A'}</p> */}
                {/* <p><strong className="text-gray-400 w-32 inline-block">Rules:</strong> <a href={tournament.rulesLink} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">View Rules</a></p> */}
              </div>
              {tournament.description && (
                <>
                  <hr className="border-red-900/30 my-4" />
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{tournament.description}</p> {/* Added whitespace-pre-wrap */}
                </>
              )}
            </div>
          </div>

          {/* Right Column (Participants) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black/60 backdrop-blur-lg border border-red-900/30 p-6 relative">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t border-l border-red-600"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b border-r border-red-600"></div>
              {/* Use participants.length for accurate count */}
              <h2 className={`${anton.className} text-2xl mb-4`}><span className="text-red-600">REGISTERED</span> ({participants.length})</h2>
              {participants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
                  {participants.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-sm bg-black/40 p-2 border border-red-900/20">
                      {/* Basic display, enhance with avatars if available */}
                      <span className="truncate flex-grow mr-2">{p.team ? `${p.team.name} [${p.team.tag}]` : p.user?.username || 'Registered Player'}</span>
                      <div className="flex-shrink-0 flex items-center">
                        {p.seed && <span className="text-xs text-gray-500 mr-2">#{p.seed}</span>}
                        {!p.isApproved && <span className="text-xs text-yellow-500">(Pending)</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                 <p className="text-gray-400">No one has registered yet.</p>
              )}
            </div>
            {/* Could add a section for Matches/Bracket preview if applicable and public */}
          </div>
        </div>
      </div>
    </main>
  )
}