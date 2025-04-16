// import prisma from '../lib/db';
// import { mat}
 

// export async function canManageTournament(userId: string, tournamentId: string) {
//     const tournament = await prisma.tournament.findUnique({
//       where: { id: tournamentId }
//     });
    
//     return tournament?.hostId === userId;
//   }
  
//   export async function canReportMatchResult(userId: string, matchId: string) {
//     // Check if user is a participant in this match
//     const match = await prisma.match.findUnique({
//       where: { id: matchId },
//       include: {
//         participants: true
//       }
//     });
    
//     if (!match) return false;
    
//     return match.participants.some(p => p.userId === userId);
//   }