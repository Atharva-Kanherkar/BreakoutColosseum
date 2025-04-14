// // src/utils/bracketGenerator.ts

// import prisma from '../lib/db';
// import { MatchStatus, TournamentFormat, Tournament, Participation } from '@prisma/client';

// /**
//  * Generates the initial bracket for a tournament based on its format and participants
//  */
// export async function generateInitialBracket(tournamentId: string) {
//   // Get tournament with participants
//   const tournament = await prisma.tournament.findUnique({
//     where: { id: tournamentId },
//     include: {
//       participations: {
//         where: { status: 'CHECKED_IN' }, // Only include checked-in participants
//         orderBy: { seed: 'asc' }
//       }
//     }
//   });

//   if (!tournament) {
//     throw new Error('Tournament not found');
//   }

//   if (tournament.participations.length < 2) {
//     throw new Error('Tournament needs at least 2 participants');
//   }

//   // Create matches based on tournament format
//   switch (tournament.format) {
//     case 'SINGLE_ELIMINATION':
//       return await generateSingleEliminationBracket(tournament, tournament.participations);
//     case 'DOUBLE_ELIMINATION':
//       return await generateDoubleEliminationBracket(tournament, tournament.participations);
//     case 'ROUND_ROBIN':
//       return await generateRoundRobinBracket(tournament, tournament.participations);
//     case 'SWISS':
//       return await generateSwissBracket(tournament, tournament.participations);
//     default:
//       throw new Error('Unsupported tournament format');
//   }
// }

// /**
//  * Generates a single elimination bracket
//  */
// async function generateSingleEliminationBracket(
//   tournament: Tournament & { participations: Participation[] },
//   participants: Participation[]
// ) {
//   const participantCount = participants.length;
  
//   // Calculate total rounds needed
//   const totalRounds = Math.ceil(Math.log2(participantCount));
  
//   // Calculate byes needed to make a power-of-2 bracket
//   const perfectBracketSize = Math.pow(2, totalRounds);
//   const byes = perfectBracketSize - participantCount;
  
//   // First round match count (some participants might get a bye)
//   const firstRoundMatches = participantCount - byes;
  
//   // Create matches for first round
//   const matchesCreated = [];
  
//   // Helper function to seed the bracket
//   // This uses standard tournament seeding to ensure top seeds are spread out
//   function getSeedPosition(seed: number, roundSize: number): number {
//     if (roundSize <= 1) return 0;
//     if (seed % 2 === 1) {
//       return Math.floor(getSeedPosition((seed + 1) / 2, roundSize / 2));
//     } else {
//       return roundSize - 1 - Math.floor(getSeedPosition(seed / 2, roundSize / 2));
//     }
//   }
  
//   // Create a seeded ordering of participants
//   const seededParticipants = [...participants].sort((a, b) => {
//     return (a.seed || 99999) - (b.seed || 99999);
//   });
  
//   // Reorder based on seeding algorithm
//   const orderedParticipants = new Array(perfectBracketSize);
//   for (let i = 0; i < seededParticipants.length; i++) {
//     const position = getSeedPosition(i + 1, perfectBracketSize);
//     orderedParticipants[position] = seededParticipants[i];
//   }
  
//   // Create first round matches
//   for (let i = 0; i < Math.floor(firstRoundMatches / 2); i++) {
//     const participantA = orderedParticipants[i * 2];
//     const participantB = orderedParticipants[i * 2 + 1];
    
//     if (participantA && participantB) {
//       const match = await prisma.match.create({
//         data: {
//           tournamentId: tournament.id,
//           round: 1,
//           matchNumber: i + 1,
//           participantAId: participantA.id,
//           participantBId: participantB.id,
//           status: MatchStatus.PENDING,
//           bracketSection: 'MAIN'
//         }
//       });
//       matchesCreated.push(match);
//     }
//   }
  
//   // Create placeholder matches for later rounds
//   // These will be filled in as earlier matches are completed
//   for (let round = 2; round <= totalRounds; round++) {
//     const matchesInRound = Math.pow(2, totalRounds - round);
    
//     for (let i = 0; i < matchesInRound; i++) {
//       const match = await prisma.match.create({
//         data: {
//           tournamentId: tournament.id,
//           round,
//           matchNumber: i + 1,
//           status: MatchStatus.PENDING,
//           bracketSection: 'MAIN'
//         }
//       });
//       matchesCreated.push(match);
//     }
//   }
  
//   return matchesCreated;
// }

// /**
//  * Generates a double elimination bracket
//  */
// async function generateDoubleEliminationBracket(
//   tournament: Tournament & { participations: Participation[] },
//   participants: Participation[]
// ) {
//   const participantCount = participants.length;
//   const matches = [];
  
//   // Generate winner's bracket
//   const winnerBracketMatches = await generateSingleEliminationBracketStructure(tournament, participants, 'WINNERS');
//   matches.push(...winnerBracketMatches);
  
//   // Calculate loser's bracket structure
//   const totalRounds = Math.ceil(Math.log2(participantCount));
//   const loserRounds = totalRounds * 2 - 1;
  
//   // Create initial loser's bracket matches (placeholder matches)
//   for (let round = 1; round <= loserRounds; round++) {
//     const matchesInRound = round % 2 === 1
//       ? Math.pow(2, Math.floor((totalRounds - Math.floor(round / 2) - 1)))
//       : Math.pow(2, Math.floor((totalRounds - Math.floor(round / 2) - 0.5)));
    
//     for (let i = 0; i < matchesInRound; i++) {
//       const match = await prisma.match.create({
//         data: {
//           tournamentId: tournament.id,
//           round: round,
//           matchNumber: i + 1,
//           status: MatchStatus.PENDING,
//           bracketSection: 'LOSERS'
//         }
//       });
//       matches.push(match);
//     }
//   }
  
//   // Create grand finals match
//   const grandFinals = await prisma.match.create({
//     data: {
//       tournamentId: tournament.id,
//       round: totalRounds + 1,
//       matchNumber: 1,
//       status: MatchStatus.PENDING,
//       bracketSection: 'GRAND_FINALS'
//     }
//   });
//   matches.push(grandFinals);
  
//   // Potential bracket reset match
//   const bracketReset = await prisma.match.create({
//     data: {
//       tournamentId: tournament.id,
//       round: totalRounds + 2,
//       matchNumber: 1,
//       status: MatchStatus.PENDING,
//       bracketSection: 'BRACKET_RESET'
//     }
//   });
//   matches.push(bracketReset);
  
//   return matches;
// }

// async function generateSingleEliminationBracketStructure(
//   tournament: Tournament & { participations: Participation[] },
//   participants: Participation[],
//   bracketSection: string
// ) {
//   const participantCount = participants.length;
  
//   // Calculate total rounds needed
//   const totalRounds = Math.ceil(Math.log2(participantCount));
  
//   // Calculate byes needed to make a power-of-2 bracket
//   const perfectBracketSize = Math.pow(2, totalRounds);
//   const byes = perfectBracketSize - participantCount;
  
//   // First round match count (some participants might get a bye)
//   const firstRoundMatches = participantCount - byes;
  
//   // Create matches for first round
//   const matchesCreated = [];
  
//   // Helper function to seed the bracket
//   function getSeedPosition(seed: number, roundSize: number): number {
//     if (roundSize <= 1) return 0;
//     if (seed % 2 === 1) {
//       return Math.floor(getSeedPosition((seed + 1) / 2, roundSize / 2));
//     } else {
//       return roundSize - 1 - Math.floor(getSeedPosition(seed / 2, roundSize / 2));
//     }
//   }
  
//   // Create a seeded ordering of participants
//   const seededParticipants = [...participants].sort((a, b) => {
//     return (a.seed || 99999) - (b.seed || 99999);
//   });
  
//   // Reorder based on seeding algorithm
//   const orderedParticipants = new Array(perfectBracketSize);
//   for (let i = 0; i < seededParticipants.length; i++) {
//     const position = getSeedPosition(i + 1, perfectBracketSize);
//     orderedParticipants[position] = seededParticipants[i];
//   }
  
//   // Create first round matches
//   for (let i = 0; i < Math.floor(firstRoundMatches / 2); i++) {
//     const participantA = orderedParticipants[i * 2];
//     const participantB = orderedParticipants[i * 2 + 1];
    
//     if (participantA && participantB) {
//       const match = await prisma.match.create({
//         data: {
//           tournamentId: tournament.id,
//           round: 1,
//           matchNumber: i + 1,
//           participantAId: participantA.id,
//           participantBId: participantB.id,
//           status: MatchStatus.PENDING,
//           bracketSection
//         }
//       });
//       matchesCreated.push(match);
//     }
//   }
  
//   // Create placeholder matches for later rounds
//   for (let round = 2; round <= totalRounds; round++) {
//     const matchesInRound = Math.pow(2, totalRounds - round);
    
//     for (let i = 0; i < matchesInRound; i++) {
//       const match = await prisma.match.create({
//         data: {
//           tournamentId: tournament.id,
//           round,
//           matchNumber: i + 1,
//           status: MatchStatus.PENDING,
//           bracketSection
//         }
//       });
//       matchesCreated.push(match);
//     }
//   }
  
//   return matchesCreated;
// }

// /**
//  * Generates a round-robin bracket
//  */
// async function generateRoundRobinBracket(
//   tournament: Tournament & { participations: Participation[] },
//   participants: Participation[]
// ) {
//   const participantCount = participants.length;
//   const matches = [];
//   let matchNumber = 1;
  
//   // In round-robin, each participant plays against every other participant
//   for (let i = 0; i < participantCount; i++) {
//     for (let j = i + 1; j < participantCount; j++) {
//       const match = await prisma.match.create({
//         data: {
//           tournamentId: tournament.id,
//           round: 1, // All matches are in "round 1" for round robin
//           matchNumber: matchNumber++,
//           participantAId: participants[i].id,
//           participantBId: participants[j].id,
//           status: MatchStatus.PENDING,
//           bracketSection: 'ROUND_ROBIN'
//         }
//       });
      
//       matches.push(match);
//     }
//   }
  
//   return matches;
// }

// /**
//  * Generates a Swiss-system bracket
//  * This is a simplified implementation that only creates the first round
//  * Subsequent rounds are created dynamically based on results
//  */
// async function generateSwissBracket(
//   tournament: Tournament & { participations: Participation[] },
//   participants: Participation[]
// ) {
//   const participantCount = participants.length;
//   const matches = [];
//   let matchNumber = 1;
  
//   // Sort participants by seed
//   const sortedParticipants = [...participants].sort((a, b) => {
//     return (a.seed || 99999) - (b.seed || 99999);
//   });
  
//   // Determine number of rounds (typically log2 of participant count, rounded up)
//   const totalRounds = Math.ceil(Math.log2(participantCount));
  
//   // Create first round matches by pairing participants (1 vs n/2+1, 2 vs n/2+2, etc.)
//   const midPoint = Math.ceil(participantCount / 2);
//   for (let i = 0; i < midPoint; i++) {
//     const participantA = sortedParticipants[i];
//     const participantBIndex = i + midPoint;
    
//     // Make sure we have a valid opponent
//     if (participantBIndex < participantCount) {
//       const participantB = sortedParticipants[participantBIndex];
      
//       const match = await prisma.match.create({
//         data: {
//           tournamentId: tournament.id,
//           round: 1,
//           matchNumber: matchNumber++,
//           participantAId: participantA.id,
//           participantBId: participantB.id,
//           status: MatchStatus.PENDING,
//           bracketSection: 'SWISS'
//         }
//       });
      
//       matches.push(match);
//     }
//   }
  
//   // Store the total number of rounds in tournament metadata
//   await prisma.tournament.update({
//     where: { id: tournament.id },
//     data: {
//       metadata: {
//         swissRounds: totalRounds
//       }
//     }
//   });
  
//   return matches;
// }

// /**
//  * Generates the next round of a Swiss tournament based on current standings
//  */
// export async function generateNextSwissRound(tournamentId: string, currentRound: number) {
//   // Get tournament
//   const tournament = await prisma.tournament.findUnique({
//     where: { id: tournamentId },
//     include: {
//       participations: {
//         include: {
//           matches: {
//             where: {
//               round: { lte: currentRound }
//             }
//           }
//         }
//       }
//     }
//   });
  
//   if (!tournament) {
//     throw new Error('Tournament not found');
//   }
  
//   // Calculate standings and points
//   const standings = tournament.participations.map(participant => {
//     let wins = 0;
//     let draws = 0;
//     let losses = 0;
    
//     // Count results from previous rounds
//     participant.matches.forEach(match => {
//       if (match.result && typeof match.result === 'object') {
//         const result = match.result as any;
//         if (result.winnerId === participant.id) {
//           wins++;
//         } else if (result.winnerId === null) {
//           draws++;
//         } else {
//           losses++;
//         }
//       }
//     });
    
//     // Calculate points (3 for win, 1 for draw, 0 for loss is common)
//     const points = (wins * 3) + draws;
    
//     return {
//       participant,
//       points,
//       wins,
//       draws,
//       losses,
//       matches: participant.matches
//     };
//   });
  
//   // Sort by points
//   standings.sort((a, b) => b.points - a.points);
  
//   // Group participants by points
//   const pointGroups: Record<number, typeof standings> = {};
//   standings.forEach(standing => {
//     if (!pointGroups[standing.points]) {
//       pointGroups[standing.points] = [];
//     }
//     pointGroups[standing.points].push(standing);
//   });
  
//   // Create matches for next round by pairing within point groups
//   const matches = [];
//   let matchNumber = 1;
//   const paired = new Set<string>();
  
//   // Pair within each point group
//   Object.values(pointGroups).forEach(group => {
//     // Randomize within group to avoid same pairings
//     group.sort(() => Math.random() - 0.5);
    
//     for (let i = 0; i < group.length; i += 2) {
//       if (i + 1 < group.length) {
//         const participantA = group[i].participant;
//         const participantB = group[i + 1].participant;
        
//         // Skip if already paired
//         if (paired.has(participantA.id) || paired.has(participantB.id)) {
//           continue;
//         }
        
//         // Check if they've played before
//         const hasPlayedBefore = participantA.matches.some(match => {
//           return match.participantAId === participantB.id || match.participantBId === participantB.id;
//         });
        
//         if (!hasPlayedBefore) {
//           paired.add(participantA.id);
//           paired.add(participantB.id);
          
//           // Create the match
//           prisma.match.create({
//             data: {
//               tournamentId,
//               round: currentRound + 1,
//               matchNumber: matchNumber++,
//               participantAId: participantA.id,
//               participantBId: participantB.id,
//               status: MatchStatus.PENDING,
//               bracketSection: 'SWISS'
//             }
//           }).then(match => {
//             matches.push(match);
//           });
//         }
//       }
//     }
//   });
  
//   // Handle unpaired participants (if any)
//   const unpaired = standings.filter(s => !paired.has(s.participant.id));
  
//   for (let i = 0; i < unpaired.length; i += 2) {
//     if (i + 1 < unpaired.length) {
//       const participantA = unpaired[i].participant;
//       const participantB = unpaired[i + 1].participant;
      
//       prisma.match.create({
//         data: {
//           tournamentId,
//           round: currentRound + 1,
//           matchNumber: matchNumber++,
//           participantAId: participantA.id,
//           participantBId: participantB.id,
//           status: MatchStatus.PENDING,
//           bracketSection: 'SWISS'
//         }
//       }).then(match => {
//         matches.push(match);
//       });
//     } else {
//       // Handle bye (odd number of participants)
//       const participant = unpaired[i].participant;
      
//       // For bye, create a "bye" match with no opponent
//       prisma.match.create({
//         data: {
//           tournamentId,
//           round: currentRound + 1,
//           matchNumber: matchNumber++,
//           participantAId: participant.id,
//           status: MatchStatus.COMPLETED, // Auto-complete bye matches
//           result: { 
//             winnerId: participant.id,
//             score: { [participant.id]: 1, bye: 0 },
//             bye: true
//           },
//           bracketSection: 'SWISS'
//         }
//       }).then(match => {
//         matches.push(match);
//       });
//     }
//   }
  
//   return matches;
// }