import prisma from '../../lib/db';
import { MatchStatus, Prisma, ParticipantStatus, TournamentStatus } from '@prisma/client';

interface MatchResultData {
  winnerId: string;
  score: Record<string, number>;
  evidence?: string;
  reportedBy: string;
  adminNotes?: string;
  verifiedBy?: string;
}

// interface DisputeData {
//   reason: string;
//   evidence?: string;
//   disputedBy: string;
// }

export const getMatchById = async (id: string) => {
  return prisma.match.findUnique({
    where: { id },
    include: {
      tournament: {
        select: {
          id: true,
          title: true,
          format: true,
          status: true,
        }
      },
      participantA: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
              tag: true,
              logo: true,
            }
          }
        }
      },
      participantB: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
              tag: true,
              logo: true,
            }
          }
        }
      },
      judge: {
        select: {
          id: true,
          username: true,
          displayName: true,
        }
      }
    }
  });
};

export const getTournamentMatches = async (tournamentId: string, round?: number, status?: string) => {
  const whereClause: Prisma.MatchWhereInput = { tournamentId };
  
  if (round !== undefined) {
    whereClause.round = round;
  }
  
  if (status && Object.values(MatchStatus).includes(status as MatchStatus)) {
    whereClause.status = status as MatchStatus;
  }
  
  return prisma.match.findMany({
    where: whereClause,
    include: {
      participantA: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
              tag: true,
              logo: true,
            }
          }
        }
      },
      participantB: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
              tag: true,
              logo: true,
            }
          }
        }
      }
    },
    orderBy: [
      { round: 'asc' },
      { matchNumber: 'asc' }
    ]
  });
};

export const reportMatchResult = async (matchId: string, reportingUserId: string, resultData: MatchResultData) => {
  // Get match with participant details to verify permissions
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: true,
      participantA: {
        include: {
          user: true,
          team: {
            include: {
              members: true
            }
          }
        }
      },
      participantB: {
        include: {
          user: true,
          team: {
            include: {
              members: true
            }
          }
        }
      }
    }
  });
  
  if (!match) {
    throw new Error('Match not found');
  }
  
  // Check if tournament is ongoing
  if (match.tournament.status !== TournamentStatus.ONGOING) {
    throw new Error('Tournament is not in progress');
  }
  
  // Check if match is in a reportable state
  if (match.status !== MatchStatus.SCHEDULED && match.status !== MatchStatus.IN_PROGRESS) {
    throw new Error('Match results can no longer be reported');
  }
  
  // Verify user is a participant in the match
  const isParticipant = await verifyMatchParticipant(match, reportingUserId);
  if (!isParticipant) {
    throw new Error('Only match participants can report results');
  }
  
  // Create the result object
  const result = {
    winnerId: resultData.winnerId,
    score: resultData.score,
    evidence: resultData.evidence,
    reportedAt: new Date(),
    reportedBy: resultData.reportedBy,
    status: 'REPORTED'
  };
  
  // Update the match
  return prisma.match.update({
    where: { id: matchId },
    data: {
      status: MatchStatus.COMPLETED, // Could use a pending verification status
      result: result as any, // Type casting as Prisma doesn't fully type JSON fields
      endTime: new Date()
    },
    include: {
      tournament: {
        select: {
          id: true,
          title: true,
        }
      },
      participantA: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      },
      participantB: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }
    }
  });
};

export const verifyMatchResult = async (matchId: string, verifyingUserId: string, resultData: MatchResultData) => {
  // Get match
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: true
    }
  });
  
  if (!match) {
    throw new Error('Match not found');
  }
  
  // Verify match status
  if (match.status !== MatchStatus.COMPLETED && match.status !== MatchStatus.DISPUTED) {
    throw new Error('Can only verify completed or disputed matches');
  }
  
  // Create verification data
  const verificationData = {
    winnerId: resultData.winnerId,
    score: resultData.score,
    verifiedAt: new Date(),
    verifiedBy: resultData.verifiedBy,
    adminNotes: resultData.adminNotes,
    status: 'VERIFIED'
  };
  
  // Update match with verification
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      result: verificationData as any,
      status: MatchStatus.COMPLETED
    },
    include: {
      tournament: true,
      participantA: {
        include: {
          user: true,
          team: true
        }
      },
      participantB: {
        include: {
          user: true,
          team: true
        }
      }
    }
  });
  
  // Update participant statuses based on the match result
  await updateParticipantStatuses(updatedMatch);
  
  // Check if we need to create next round matches
  await maybeCreateNextRoundMatches(updatedMatch);
  
  return updatedMatch;
};

// export const disputeMatchResult = async (matchId: string, disputingUserId: string, disputeData: DisputeData) => {
//   // Get match with participant details to verify permissions
//   const match = await prisma.match.findUnique({
//     where: { id: matchId },
//     include: {
//       tournament: true,
//       participantA: {
//         include: {
//           user: true,
//           team: {
//             include: {
//               members: true
//             }
//           }
//         }
//       },
//       participantB: {
//         include: {
//           user: true,
//           team: {
//             include: {
//               members: true
//             }
//           }
//         }
//       }
//     }
//   });
  
//   if (!match) {
//     throw new Error('Match not found');
//   }
  
//   // Check if match is in a disputeEnable state
//   if (match.status !== MatchStatus.COMPLETED) {
//     throw new Error('Only completed matches can be disputed');
//   }
  
//   // Verify user is a participant in the match
//   const isParticipant = await verifyMatchParticipant(match, disputingUserId);
//   if (!isParticipant) {
//     throw new Error('Only match participants can dispute results');
//   }
  
//   // Create dispute object
//   const dispute = {
//     reason: disputeData.reason,
//     evidence: disputeData.evidence,
//     disputedAt: new Date(),
//     disputedBy: disputeData.disputedBy,
//     originalResult: match.result
//   };
  
//   // Add dispute information to the match
//   return prisma.match.update({
//     where: { id: matchId },
//     data: {
//       status: MatchStatus.DISPUTED,
//       dispute: dispute as any
//     },
//     include: {
//       tournament: {
//         select: {
//           id: true,
//           title: true,
//         }
//       },
//       participantA: {
//         include: {
//           user: {
//             select: {
//               id: true,
//               username: true,
//             }
//           },
//           team: {
//             select: {
//               id: true,
//               name: true,
//             }
//           }
//         }
//       },
//       participantB: {
//         include: {
//           user: {
//             select: {
//               id: true,
//               username: true,
//             }
//           },
//           team: {
//             select: {
//               id: true,
//               name: true,
//             }
//           }
//         }
//       }
//     }
//   });
// };

export const updateMatchSchedule = async (matchId: string, updatingUserId: string, startTime: Date) => {
  // Get match to verify permissions
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: true
    }
  });
  
  if (!match) {
    throw new Error('Match not found');
  }
  
  // Verify user has permission (tournament organizer or admin)
  const tournament = await prisma.tournament.findUnique({
    where: { id: match.tournamentId }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  // Check user is tournament organizer or admin
  const user = await prisma.user.findUnique({
    where: { id: updatingUserId }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const isOrganizer = tournament.organizerId === updatingUserId;
  const isAdmin = user.role === 'ADMIN';
  
  if (!isOrganizer && !isAdmin) {
    throw new Error('Only tournament organizers or admins can update match schedule');
  }
  
  // Check if match status allows rescheduling
  if (match.status !== MatchStatus.PENDING && match.status !== MatchStatus.SCHEDULED) {
    throw new Error('Only pending or scheduled matches can be rescheduled');
  }
  
  // Validate start time
  const now = new Date();
  if (startTime < now) {
    throw new Error('Start time cannot be in the past');
  }
  
  // Update match schedule
  return prisma.match.update({
    where: { id: matchId },
    data: {
      startTime,
      status: MatchStatus.SCHEDULED
    },
    include: {
      tournament: {
        select: {
          id: true,
          title: true,
        }
      },
      participantA: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      },
      participantB: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }
    }
  });
};

export const getTournamentBracket = async (tournamentId: string) => {
  // Get tournament to verify it exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  // Get all matches for the tournament, ordered by round and match number
  const matches = await prisma.match.findMany({
    where: {
      tournamentId
    },
    include: {
      participantA: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
              tag: true,
              logo: true,
            }
          }
        }
      },
      participantB: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
              tag: true,
              logo: true,
            }
          }
        }
      }
    },
    orderBy: [
      { round: 'asc' },
      { matchNumber: 'asc' }
    ]
  });
  
  // Group matches by round
  const rounds = matches.reduce((acc, match) => {
    const round = match.round.toString();
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Format the bracket
  return {
    tournamentId,
    format: tournament.format,
    rounds
  };
};

// Helper functions

// Verify that a user is a participant in a match
async function verifyMatchParticipant(match: any, userId: string): Promise<boolean> {
  // Check if user is directly participating
  if (match.participantA?.userId === userId || match.participantB?.userId === userId) {
    return true;
  }
  
  // Check if user is on one of the teams
  const isOnTeamA = match.participantA?.team?.members?.some((member: any) => member.userId === userId);
  const isOnTeamB = match.participantB?.team?.members?.some((member: any) => member.userId === userId);
  
  return isOnTeamA || isOnTeamB;
}

// Update participant statuses based on match result
async function updateParticipantStatuses(match: any) {
  if (!match.result?.winnerId) {
    return; // No winner determined yet
  }
  
  const tournamentFormat = match.tournament.format;
  
  // For single elimination, mark loser as eliminated
  if (tournamentFormat === 'SINGLE_ELIMINATION') {
    const loserId = match.participantA.id === match.result.winnerId 
      ? match.participantB.id 
      : match.participantA.id;
    
    await prisma.participation.update({
      where: { id: loserId },
      data: { status: ParticipantStatus.ELIMINATED }
    });
  }
  
  // If this is the final match, mark winner as WINNER
  if (match.round === getTotalRounds(match.tournament)) {
    await prisma.participation.update({
      where: { id: match.result.winnerId },
      data: { status: ParticipantStatus.WINNER }
    });
    
    // Also mark the tournament as completed
    await prisma.tournament.update({
      where: { id: match.tournament.id },
      data: { status: TournamentStatus.COMPLETED }
    });
  }
}

// Calculate next round matches based on results
async function maybeCreateNextRoundMatches(match: any) {
  // Check if all matches in the current round are completed
  const currentRoundMatches = await prisma.match.findMany({
    where: {
      tournamentId: match.tournament.id,
      round: match.round
    }
  });
  
  const allCompleted = currentRoundMatches.every(m => m.status === MatchStatus.COMPLETED);
  
  if (!allCompleted) {
    return; // Not all matches in this round are completed
  }
  
  // Check if we already have next round matches
  const nextRoundMatches = await prisma.match.findMany({
    where: {
      tournamentId: match.tournament.id,
      round: match.round + 1
    }
  });
  
  if (nextRoundMatches.length > 0) {
    return; // Next round already created
  }
  
  // Get all winners from current round
  const winners = currentRoundMatches.map(m => {
    const result = m.result as any;
    return result?.winnerId;
  }).filter(Boolean);
  
  // Create next round matches
  const nextRound = match.round + 1;
  const totalRounds = getTotalRounds(match.tournament);
  
  // If we've reached the end of the tournament, don't create more matches
  if (nextRound > totalRounds) {
    return;
  }
  
  // Create matches for the next round
  const matchesForNextRound = Math.floor(winners.length / 2);
  
  for (let i = 0; i < matchesForNextRound; i++) {
    const participantAId = winners[i * 2];
    const participantBId = winners[i * 2 + 1];
    
    await prisma.match.create({
      data: {
        tournamentId: match.tournament.id,
        round: nextRound,
        matchNumber: i + 1,
        participantAId,
        participantBId,
        status: MatchStatus.PENDING
      }
    });
  }
}

// Calculate total rounds needed for a tournament
function getTotalRounds(tournament: any): number {
  // For a single elimination tournament with N participants, we need log2(N) rounds
  // Round up to handle non-power-of-2 participant counts
  const participantCount = tournament._count?.participations || 0;
  return Math.ceil(Math.log2(participantCount));
}