import prisma from '../lib/db';
import { MatchStatus, Tournament, Participation } from '@prisma/client';

export async function generateInitialBracket(tournamentId: string) {
  // Get tournament with participants
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participations: {
        where: { status: 'CHECKED_IN' }, // Only include checked-in participants
        orderBy: { seed: 'asc' }
      }
    }
  });

  if (!tournament) {
    throw new Error('Tournament not found');
  }

  if (tournament.participations.length < 2) {
    throw new Error('Tournament needs at least 2 participants');
  }

  // Create matches based on tournament format
  switch (tournament.format) {
    case 'SINGLE_ELIMINATION':
      return await generateSingleEliminationBracket(tournament, tournament.participations);
    case 'DOUBLE_ELIMINATION':
      throw new Error('Double elimination not implemented yet');
    case 'ROUND_ROBIN':
      return await generateRoundRobinBracket(tournament, tournament.participations);
    case 'SWISS':
      throw new Error('Swiss format not implemented yet');
    default:
      throw new Error('Unsupported tournament format');
  }
}

async function generateSingleEliminationBracket(
  tournament: Tournament & { participations: Participation[] },
  participants: Participation[]
) {
  const participantCount = participants.length;
  
  // Calculate total rounds needed
  const totalRounds = Math.ceil(Math.log2(participantCount));
  
  // Calculate number of matches in first round
  // In single elimination, if there are N participants, we need N-1 matches in total
  const totalMatches = participantCount - 1;
  
  // Calculate byes needed to make a power-of-2 bracket
  const perfectBracketSize = Math.pow(2, totalRounds);
  const byes = perfectBracketSize - participantCount;
  
  // First round match count (some participants might get a bye)
  const firstRoundMatches = participantCount - byes;
  
  // Create matches for first round
  const matchesCreated = [];
  
  // Helper function to seed the bracket
  // This uses standard tournament seeding to ensure top seeds are spread out
  function getSeedPosition(seed: number, roundSize: number): number {
    if (roundSize <= 1) return 0;
    if (seed % 2 === 1) {
      return Math.floor(getSeedPosition((seed + 1) / 2, roundSize / 2));
    } else {
      return roundSize - 1 - Math.floor(getSeedPosition(seed / 2, roundSize / 2));
    }
  }
  
  // Create a seeded ordering of participants
  const seededParticipants = [...participants].sort((a, b) => {
    return (a.seed || 99999) - (b.seed || 99999);
  });
  
  // Reorder based on seeding algorithm
  const orderedParticipants = new Array(perfectBracketSize);
  for (let i = 0; i < seededParticipants.length; i++) {
    const position = getSeedPosition(i + 1, perfectBracketSize);
    orderedParticipants[position] = seededParticipants[i];
  }
  
  // Create first round matches
  for (let i = 0; i < Math.floor(firstRoundMatches / 2); i++) {
    const participantA = orderedParticipants[i * 2];
    const participantB = orderedParticipants[i * 2 + 1];
    
    if (participantA && participantB) {
      const match = await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          round: 1,
          matchNumber: i + 1,
          participantAId: participantA.id,
          participantBId: participantB.id,
          status: MatchStatus.PENDING
        }
      });
      matchesCreated.push(match);
    }
  }
  
  // Create placeholder matches for later rounds
  // These will be filled in as earlier matches are completed
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = Math.pow(2, totalRounds - round);
    
    for (let i = 0; i < matchesInRound; i++) {
      const match = await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          round,
          matchNumber: i + 1,
          status: MatchStatus.PENDING
        }
      });
      matchesCreated.push(match);
    }
  }
  
  return matchesCreated;
}

async function generateRoundRobinBracket(
  tournament: Tournament & { participations: Participation[] },
  participants: Participation[]
) {
  const participantCount = participants.length;
  
  // In round-robin, each participant plays against every other participant
  // If there are N participants, each plays N-1 matches, for a total of N*(N-1)/2 matches
  const matchesCreated = [];
  let matchNumber = 1;
  
  // Create matches between all participants
  for (let i = 0; i < participantCount; i++) {
    for (let j = i + 1; j < participantCount; j++) {
      const match = await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          round: 1, // All matches are in "round 1" for round robin
          matchNumber: matchNumber++,
          participantAId: participants[i].id,
          participantBId: participants[j].id,
          status: MatchStatus.PENDING
        }
      });
      
      matchesCreated.push(match);
    }
  }
  
  return matchesCreated;
}