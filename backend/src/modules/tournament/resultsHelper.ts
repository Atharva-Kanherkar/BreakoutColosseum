import { Tournament, Match, TournamentParticipant, Team, User, MatchStatus } from '@prisma/client';
 

// Define structure for standings entries - adapted from service.ts logic
export interface Standing {
    id: string; // Participant or Team ID
    name: string;
    isTeam: boolean;
    avatar?: string | null; // Added from service logic
    wins: number;
    losses: number;
    score: number; // Added from service logic (points)
    // Add draws or other stats if needed in the future
}

// Define the expected structure of the included relations for the tournament object
// Ensure this includes everything needed by the calculation logic below
export type TournamentWithResultsData = Tournament & {
    matches: (Match & {
        teamA: (Team & { logo?: string | null }) | null; // Include logo if available
        teamB: (Team & { logo?: string | null }) | null; // Include logo if available
        participantA: (TournamentParticipant & { user: User & { avatar?: string | null } }) | null; // Include avatar
        participantB: (TournamentParticipant & { user: User & { avatar?: string | null } }) | null; // Include avatar
    })[];
    participants: (TournamentParticipant & { user: User & { avatar?: string | null } })[]; // Include avatar
    teams: (Team & {
        logo?: string | null; // Include logo if available
        captain: (TournamentParticipant & { user: User }) | null
    })[];
};

const POINTS_WIN = 3;
// const POINTS_DRAW = 1; // Add if draws are implemented

/**
 * Calculates standings based on completed matches using a points system (3 for win).
 * Adapted from the logic previously in tournament/service.ts.
 */
export function calculateStandings(tournament: TournamentWithResultsData): Standing[] {
    console.log(`Calculating standings (Points Based) for tournament: ${tournament.name} (${tournament.id})`);

    // Create record of participant/team stats
    const statsMap = new Map<string, Standing>();

    // Helper to initialize or get stats
    const getStats = (id: string, name: string, isTeam: boolean, avatar?: string | null): Standing => {
        if (!statsMap.has(id)) {
            statsMap.set(id, {
                id,
                name,
                isTeam,
                avatar: avatar || null,
                wins: 0,
                losses: 0,
                score: 0
            });
        }
        return statsMap.get(id)!;
    };

    // Initialize from participants/teams list to include those with 0 matches played
    if (tournament.isTeamBased) {
        tournament.teams.forEach(team => {
            const name = team.name || `Team ${team.id.substring(0, 6)}`;
            getStats(team.id, name, true, team.logo);
        });
    } else {
        tournament.participants.forEach(p => {
            const name = p.user.username || p.user.email;
            getStats(p.id, name, false, p.user.avatar);
        });
    }


    // Process each completed match
    tournament.matches.forEach(match => {
        if (match.status !== MatchStatus.COMPLETED || !match.result) return;

        const result = match.result as any; // Cast to access winnerId
        const winnerId = result.winnerId as string | null;
        // const isDraw = result.isDraw === true; // Uncomment if draws are handled

        // --- Simplified Logic: Only process if there's a winner ---
        if (!winnerId) {
            // Handle draws here if needed - award points, increment draw count
            // console.log(`Match ${match.id} is a draw or has no winner.`);
            return;
        }

        let loserId: string | null = null;
        let winnerEntity: Standing | null = null;
        let loserEntity: Standing | null = null;

        // Identify winner and loser entities (Team or Participant)
        if (tournament.isTeamBased) {
            if (match.teamAId) {
                const teamA = getStats(match.teamAId, match.teamA?.name || `Team ${match.teamAId.substring(0,6)}`, true, match.teamA?.logo);
                if (match.teamAId === winnerId) winnerEntity = teamA; else loserEntity = teamA;
            }
            if (match.teamBId) {
                const teamB = getStats(match.teamBId, match.teamB?.name || `Team ${match.teamBId.substring(0,6)}`, true, match.teamB?.logo);
                if (match.teamBId === winnerId) winnerEntity = teamB; else loserEntity = teamB;
            }
        } else {
             if (match.participantAId) {
                const participantA = getStats(match.participantAId, match.participantA?.user?.username || `User ${match.participantAId.substring(0,6)}`, false, match.participantA?.user?.avatar);
                if (match.participantAId === winnerId) winnerEntity = participantA; else loserEntity = participantA;
            }
            if (match.participantBId) {
                const participantB = getStats(match.participantBId, match.participantB?.user?.username || `User ${match.participantBId.substring(0,6)}`, false, match.participantB?.user?.avatar);
                if (match.participantBId === winnerId) winnerEntity = participantB; else loserEntity = participantB;
            }
        }

        // Update stats
        if (winnerEntity) {
            winnerEntity.wins += 1;
            winnerEntity.score += POINTS_WIN;
        } else {
             console.warn(`Match ${match.id}: Could not find winner entity for ID ${winnerId}`);
        }

        if (loserEntity) {
            loserEntity.losses += 1;
            // Loser gets 0 points
        } else {
            // This can happen if only one participant was set for the match, log warning
             if (winnerEntity) { // Only warn if we found a winner but no loser
                 console.warn(`Match ${match.id}: Could not find loser entity (Winner: ${winnerId})`);
             }
        }
    });

    // Convert map to array and sort
    const sortedStandings = Array.from(statsMap.values()).sort((a, b) => {
        // 1. Sort by Score (Descending)
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        // 2. Tiebreaker: Wins (Descending)
        if (b.wins !== a.wins) {
            return b.wins - a.wins;
        }
        // 3. Tiebreaker: Losses (Ascending)
         if (a.losses !== b.losses) {
            return a.losses - b.losses;
        }
        // 4. Tiebreaker: Name (Ascending) - Fallback
        return a.name.localeCompare(b.name);
    });

    console.log("Calculated Standings (Top 5):", sortedStandings.slice(0, 5));
    return sortedStandings;
}
