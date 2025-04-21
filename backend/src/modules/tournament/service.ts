import prisma from '../../lib/db';
import { 
  CreateTournamentData, 
  UpdateTournamentData, 
  TournamentStatus, 
  TournamentFormat,
  TournamentWithDetails,
  TournamentWithHost,
  PaginatedResult
} from './types';
import { Prisma, Tournament } from '@prisma/client';
import * as prizeService from '../prize/service';


function mapToTournamentWithDetails(tournament: any): TournamentWithDetails {
  return {
    ...tournament,
    host: tournament.host,
    _count: tournament._count,
    prize: tournament.prize // Make sure prize is included if it exists
  };
}
export const createTournament = async (
  userId: string, 
  data: CreateTournamentData
): Promise<TournamentWithDetails> => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Set default values
  const tournamentData = {
    name: data.name,
    description: data.description,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    hostId: userId,
    status: data.status || 'DRAFT',
    format: data.format || 'SINGLE_ELIMINATION',
    maxParticipants: data.maxParticipants || null,
    minParticipants: data.minParticipants || null,
    teamSize: data.teamSize || null,
    isTeamBased: data.isTeamBased ?? false,
    registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null
  };
  
  // Create tournament
  const tournament = await prisma.tournament.create({
    data: tournamentData,
    include: {
      host: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      _count: {
        select: {
          participants: true,
          teams: true,
          spectators: true
        }
      }
    }
  });
  
  return mapToTournamentWithDetails(tournament);
};

export const getTournaments = async (
  page = 1, 
  limit = 10, 
  search?: string,
  status?: TournamentStatus
): Promise<PaginatedResult<TournamentWithDetails>> => {
  const skip = (page - 1) * limit;
  
  // Build where clause for filtering
  let whereClause: Prisma.TournamentWhereInput = {};
  
  if (search) {
    whereClause = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    };
  }
  
  if (status) {
    whereClause.status = status;
  }
  
  const [tournaments, totalCount] = await Promise.all([
    prisma.tournament.findMany({
      where: whereClause,
      include: {
        host: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        _count: {
          select: {
            participants: true,
            teams: true,
            spectators: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.tournament.count({ where: whereClause })
  ]);
  
  return {
    items: tournaments.map(mapToTournamentWithDetails),
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

export const getTournamentById = async (id: string): Promise<TournamentWithDetails | null> => {
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      host: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      _count: {
        select: {
          participants: true,
          teams: true,
          spectators: true
        }
      },
      prize: true
    }
  });
  
  return tournament ? mapToTournamentWithDetails(tournament) : null;
};

export const updateTournament = async (
  id: string, 
  userId: string, 
  data: UpdateTournamentData
): Promise<TournamentWithDetails> => {
  // Check if tournament exists and user is host
  const tournament = await prisma.tournament.findFirst({
    where: {
      id,
      hostId: userId
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found or you are not the host');
  }
  
  // Handle date conversions
  const updateData = {
    ...data,
    startDate: data.startDate !== undefined 
      ? (data.startDate ? new Date(data.startDate) : null) 
      : undefined,
    endDate: data.endDate !== undefined 
      ? (data.endDate ? new Date(data.endDate) : null) 
      : undefined,
    registrationDeadline: data.registrationDeadline !== undefined 
      ? (data.registrationDeadline ? new Date(data.registrationDeadline) : null) 
      : undefined
  };
  
  // Update tournament
  const updatedTournament = await prisma.tournament.update({
    where: { id },
    data: updateData,
    include: {
      host: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      _count: {
        select: {
          participants: true,
          teams: true,
          spectators: true
        }
      }
    }
  });
  
  return mapToTournamentWithDetails(updatedTournament);
};

export const deleteTournament = async (id: string, userId: string): Promise<void> => {
  // Check if tournament exists and user is host
  const tournament = await prisma.tournament.findFirst({
    where: {
      id,
      hostId: userId
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found or you are not the host');
  }
  
  // Check if tournament is in progress or completed (might want to prevent deletion)
  if (tournament.status === 'ONGOING' || tournament.status === 'COMPLETED') {
    throw new Error('Cannot delete a tournament that is in progress or completed');
  }
  
  // Delete tournament - this will cascade to participants, etc. based on your database setup
  await prisma.tournament.delete({
    where: { id }
  });
};

export const updateTournamentStatus = async (
  id: string, 
  userId: string, 
  status: TournamentStatus
): Promise<TournamentWithDetails> => {
  // Check if tournament exists and user is host
  const tournament = await prisma.tournament.findFirst({
    where: {
      id,
      hostId: userId
    },
    include: {
      _count: {
        select: {
          participants: true
        }
      }
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found or you are not the host');
  }
  
  // Validate status transitions
  switch (status) {
    case 'REGISTRATION_OPEN':
      // Can only open registration from draft
      if (tournament.status !== 'DRAFT' && tournament.status !== 'REGISTRATION_CLOSED') {
        throw new Error('Can only open registration from draft or closed registration state');
      }
      break;
      
    case 'REGISTRATION_CLOSED':
      // Can only close from open registration
      if (tournament.status !== 'REGISTRATION_OPEN') {
        throw new Error('Can only close registration from open registration state');
      }
      break;
      
    case 'ONGOING':
      // Check minimum participants
      if (tournament.minParticipants && tournament._count.participants < tournament.minParticipants) {
        throw new Error(`Not enough participants. Minimum required: ${tournament.minParticipants}`);
      }
      // Check status
      if (tournament.status !== 'REGISTRATION_CLOSED') {
        throw new Error('Tournament must have registration closed before starting');
      }
      break;
      
    case 'COMPLETED':
      // Can only complete from ongoing
      if (tournament.status !== 'ONGOING') {
        throw new Error('Can only complete tournaments that are ongoing');
      }
      break;
      
    case 'CANCELLED':
      // Can cancel from most states except completed
      if (tournament.status === 'COMPLETED') {
        throw new Error('Cannot cancel a completed tournament');
      }
      break;
  }
  
  // Update tournament status
  const updatedTournament = await prisma.tournament.update({
    where: { id },
    data: { status },
    include: {
      host: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      _count: {
        select: {
          participants: true,
          teams: true,
          spectators: true
        }
      }
    }
  });
  
  return mapToTournamentWithDetails(updatedTournament);
};
 
export const registerParticipant = async (
  tournamentId: string,
  userId: string,
  entryFeeTx?: string // Optional transaction signature
) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      prize: true, // Include prize info to check for entry fee
      participants: {
        select: { id: true }
      }
    }
  });

  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
    throw new Error('Tournament registration is not open');
  }
  
  if (tournament.maxParticipants && tournament.participants.length >= tournament.maxParticipants) {
    throw new Error('Tournament has reached maximum participants');
  }

  // Check if user is already registered
  const existingParticipant = await prisma.tournamentParticipant.findFirst({
    where: {
      userId,
      tournamentId
    }
  });
  
  if (existingParticipant) {
    throw new Error('You are already registered for this tournament');
  }

  // Check if entry fee is required
  let entryFeeVerified = false;
  if (tournament.prize?.entryFee && parseFloat(tournament.prize.entryFee) > 0) {
    if (!entryFeeTx) {
      throw new Error('Entry fee payment transaction is required for this tournament');
    }
    
    // Verify the transaction
    entryFeeVerified = await prizeService.verifyEntryFeePayment(
      entryFeeTx,
      tournament.prize.entryFee,
      tournament.prize.tokenType || 'SOL',
      tournament.prize.tokenAddress || undefined
    );
    
    if (!entryFeeVerified) {
      throw new Error('Entry fee payment verification failed');
    }
  } else {
    // No entry fee required
    entryFeeVerified = true;
  }

  // Create participant record
  const participant = await prisma.tournamentParticipant.create({
    data: {
      userId,
      tournamentId,
      entryFeeTx: entryFeeVerified ? entryFeeTx : null
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    }
  });

  return participant;
};

export const unregisterParticipant = async (
  tournamentId: string, 
  userId: string
): Promise<void> => {
  // Check if tournament exists and is still in registration phase
  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      OR: [
        { status: 'REGISTRATION_OPEN' },
        { status: 'REGISTRATION_CLOSED' }
      ]
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found or registration phase has ended');
  }
  
  // Check if participant exists
  const participant = await prisma.tournamentParticipant.findUnique({
    where: {
      userId_tournamentId: {
        userId,
        tournamentId
      }
    },
    include: {
      team: {
        include: {
          captain: true
        }
      }
    }
  });
  
  if (!participant) {
    throw new Error('You are not registered for this tournament');
  }
  
  // If participant is a team captain, prevent unregistration
  if (participant.team && participant.team.captain.userId === userId) {
    throw new Error('Team captains cannot unregister. Transfer captaincy first or delete the team.');
  }
  
  // Delete the participation record
  await prisma.tournamentParticipant.delete({
    where: {
      userId_tournamentId: {
        userId,
        tournamentId
      }
    }
  });
};

export const addSpectator = async (
  tournamentId: string, 
  userId: string
): Promise<void> => {
  // Check if tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  // Add spectator connection
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      spectators: {
        connect: { id: userId }
      }
    }
  });
};

export const removeSpectator = async (
  tournamentId: string, 
  userId: string
): Promise<void> => {
  // Check if tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  // Remove spectator connection
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      spectators: {
        disconnect: { id: userId }
      }
    }
  });
};

export const getTournamentParticipants = async (
  tournamentId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResult<any>> => {
  const skip = (page - 1) * limit;
  
  // Check if tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  const [participants, totalCount] = await Promise.all([
    prisma.tournamentParticipant.findMany({
      where: { tournamentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.tournamentParticipant.count({ where: { tournamentId } })
  ]);
  
  return {
    items: participants,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

export const getTournamentTeams = async (
  tournamentId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResult<any>> => {
  const skip = (page - 1) * limit;
  
  // Check if tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  const [teams, totalCount] = await Promise.all([
    prisma.team.findMany({
      where: { tournamentId },
      include: {
        captain: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.team.count({ where: { tournamentId } })
  ]);
  
  return {
    items: teams,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

export const getUserHostedTournaments = async (
  userId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResult<TournamentWithDetails>> => {
  const skip = (page - 1) * limit;
  
  const [tournaments, totalCount] = await Promise.all([
    prisma.tournament.findMany({
      where: { hostId: userId },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        _count: {
          select: {
            participants: true,
            teams: true,
            spectators: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.tournament.count({ where: { hostId: userId } })
  ]);
  
  return {
    items: tournaments.map(mapToTournamentWithDetails),
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

export const getUserParticipatingTournaments = async (
  userId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResult<any>> => {
  const skip = (page - 1) * limit;
  
  const [participations, totalCount] = await Promise.all([
    prisma.tournamentParticipant.findMany({
      where: { userId },
      include: {
        tournament: {
          include: {
            host: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            },
            _count: {
              select: {
                participants: true,
                teams: true
              }
            }
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.tournamentParticipant.count({ where: { userId } })
  ]);
  
  return {
    items: participations.map(p => ({
      ...p.tournament,
      team: p.team,
      joinedAt: p.createdAt
    })),
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

export const getUserSpectatedTournaments = async (
  userId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResult<TournamentWithDetails>> => {
  const skip = (page - 1) * limit;
  
  // Find user to get spectated tournaments
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      spectatedTournaments: {
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          host: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          _count: {
            select: {
              participants: true,
              teams: true,
              spectators: true
            }
          }
        }
      },
      _count: {
        select: {
          spectatedTournaments: true
        }
      }
    }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    items: user.spectatedTournaments.map(mapToTournamentWithDetails),
    pagination: {
      total: user._count.spectatedTournaments,
      page,
      limit,
      pages: Math.ceil(user._count.spectatedTournaments / limit)
    }
  };
};

/**
 * Generate tournament bracket
 */
export const generateTournamentBracket = async (
  tournamentId: string,
  userId: string,
  seedMethod: 'random' | 'manual' | 'ranking' = 'random'
): Promise<any> => {
  // Check if tournament exists and user is host
  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      hostId: userId
    },
    include: {
      participants: true,
      teams: {
        include: {
          members: true
        }
      }
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found or you are not the host');
  }
  
  // Check if tournament is in the right state
  if (tournament.status !== 'REGISTRATION_CLOSED') {
    throw new Error('Tournament registration must be closed before generating brackets');
  }
  
  // Check if there are enough participants
  const participantCount = tournament.isTeamBased 
    ? tournament.teams.length
    : tournament.participants.length;
    
  if (tournament.minParticipants && participantCount < tournament.minParticipants) {
    throw new Error(`Not enough participants. Minimum required: ${tournament.minParticipants}`);
  }
  
  // Check if brackets already exist
  const existingMatches = await prisma.match.findFirst({
    where: { tournamentId }
  });
  
  if (existingMatches) {
    throw new Error('Tournament bracket has already been generated');
  }
  
  // Import from brackets utility
  const { generateInitialBracket } = await import('../../utils/brackets');
  
  // Generate brackets based on tournament format
  const matches = await generateInitialBracket(tournamentId);
  
  // Update tournament status to ONGOING
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: 'ONGOING' }
  });
  
  return matches;
};

/**
 * Create a new team for a tournament
 */
 /**
 * Create a new team for a tournament
 */
export const createTeam = async (
  tournamentId: string,
  captainId: string,
  data: { name: string; description?: string; logo?: string }
): Promise<any> => {
  // Check if tournament exists and is open for registration
  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      status: 'REGISTRATION_OPEN'
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found or registration is not open');
  }
  
  // Check if the tournament is team-based
  if (!tournament.isTeamBased) {
    throw new Error('This tournament does not support teams');
  }
  
  // Check if user is already registered
  const existingParticipant = await prisma.tournamentParticipant.findUnique({
    where: {
      userId_tournamentId: {
        userId: captainId,
        tournamentId
      }
    }
  });
  
  if (existingParticipant) {
    throw new Error('You are already registered for this tournament');
  }
  
  // Check max participants if set
  if (tournament.maxParticipants) {
    const teamCount = await prisma.team.count({
      where: { tournamentId }
    });
    
    if (teamCount >= tournament.maxParticipants) {
      throw new Error('Tournament has reached maximum number of teams');
    }
  }
  
  // Execute in a transaction to ensure consistency
  return prisma.$transaction(async (tx) => {
    // Step 1: Create captain as participant first
    const captain = await tx.tournamentParticipant.create({
      data: {
        userId: captainId,
        tournamentId,
        entryFeeTx: null,
      }
    });
    
    // Step 2: Create the team with the captain
    const team = await tx.team.create({
      data: {
        name: data.name,
        description: data.description,
        logo: data.logo,
        tournamentId,
        captainId: captain.id
      }
    });
    
    // Step 3: Update the participant to be linked with the team
    const updatedCaptain = await tx.tournamentParticipant.update({
      where: { id: captain.id },
      data: { teamId: team.id }
    });
    
    // Return the team with all relationships
    return tx.team.findUnique({
      where: { id: team.id },
      include: {
        captain: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });
  });
};/**
 * Update team details
 */
export const updateTeam = async (
  tournamentId: string,
  teamId: string,
  captainId: string,
  data: { name?: string; description?: string; logo?: string }
): Promise<any> => {
  // Check if team exists and user is captain
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      tournamentId,
      captain: {
        userId: captainId
      }
    }
  });
  
  if (!team) {
    throw new Error('Team not found or you are not the captain');
  }
  
  // Update team
  const updatedTeam = await prisma.team.update({
    where: { id: teamId },
    data,
    include: {
      captain: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      }
    }
  });
  
  return updatedTeam;
};

/**
 * Add member to team
 */
export const addTeamMember = async (
  tournamentId: string,
  teamId: string,
  captainId: string,
  userId: string
): Promise<any> => {
  // Check if team exists and user is captain
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      tournamentId,
      captain: {
        userId: captainId,
        entryFeeTx : null,
      }
    },
    include: {
      _count: {
        select: { members: true }
      }
    }
  });
  
  if (!team) {
    throw new Error('Team not found or you are not the captain');
  }
  
  // Check if user is already in the team
  const existingMember = await prisma.tournamentParticipant.findFirst({
    where: {
      userId,
      teamId,
      entryFeeTx : null, 
    }
  });
  
  if (existingMember) {
    throw new Error('User is already a member of this team');
  }
  
  // Check if user is already participating in this tournament
  const existingParticipant = await prisma.tournamentParticipant.findUnique({
    where: {
      userId_tournamentId: {
        userId,
        tournamentId
      }
    }
  });
  
  if (existingParticipant) {
    throw new Error('User is already participating in this tournament');
  }
  
  // Check team size limit
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });
  
  if (tournament?.teamSize && team._count.members >= tournament.teamSize) {
    throw new Error(`Team has reached maximum size of ${tournament.teamSize} members`);
  }
  
  // Add member to team
  await prisma.tournamentParticipant.create({
    data: {
      userId,
      tournamentId,
      teamId
    }
  });
  
  // Return updated team
  return prisma.team.findUnique({
    where: { id: teamId },
    include: {
      captain: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      }
    }
  });
};

/**
 * Remove member from team
 */
export const removeTeamMember = async (
  tournamentId: string,
  teamId: string,
  captainId: string,
  memberId: string
): Promise<any> => {
  // Check if team exists and user is captain
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      tournamentId,
      captain: {
        userId: captainId
      }
    }
  });
  
  if (!team) {
    throw new Error('Team not found or you are not the captain');
  }
  
  // Can't remove captain
  if (memberId === captainId) {
    throw new Error('Team captain cannot be removed');
  }
  
  // Check if member exists in team
  const member = await prisma.tournamentParticipant.findFirst({
    where: {
      userId: memberId,
      teamId
    }
  });
  
  if (!member) {
    throw new Error('User is not a member of this team');
  }
  
  // Remove member from team
  await prisma.tournamentParticipant.delete({
    where: {
      userId_tournamentId: {
        userId: memberId,
        tournamentId
      }
    }
  });
  
  // Return updated team
  return prisma.team.findUnique({
    where: { id: teamId },
    include: {
      captain: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      }
    }
  });
};

/**
 * Get all matches for a tournament
 */
export const getTournamentMatches = async (
  tournamentId: string,
  page = 1,
  limit = 20,
  status?: string,
  bracketSection?: string
): Promise<PaginatedResult<any>> => {
  const skip = (page - 1) * limit;
  
  // Build where clause
  let whereClause: Prisma.MatchWhereInput = { tournamentId };
  
  if (status) {
    whereClause.status = status as any;
  }
  
  if (bracketSection) {
    whereClause.bracketSection = bracketSection;
  }
  
  // Execute queries
  const [matches, totalCount] = await Promise.all([
    prisma.match.findMany({
      where: whereClause,
      include: {
        teamA: true,
        teamB: true,
        participantA: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
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
                avatar: true
              }
            }
          }
        },
        judge: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        tournament: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: [
        { round: 'asc' },
        { matchNumber: 'asc' }
      ]
    }),
    prisma.match.count({ where: whereClause })
  ]);
  
  return {
    items: matches,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * Get matches for a specific round in a tournament
 */
export const getTournamentRoundMatches = async (
  tournamentId: string,
  round: number
): Promise<any[]> => {
  const matches = await prisma.match.findMany({
    where: {
      tournamentId,
      round
    },
    include: {
      teamA: true,
      teamB: true,
      participantA: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
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
              avatar: true
            }
          }
        }
      },
      judge: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    },
    orderBy: { matchNumber: 'asc' }
  });
  
  return matches;
};

/**
 * Get tournament results/standings
 */
export const getTournamentResults = async (tournamentId: string): Promise<any> => {
  // Check if tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  // Get all completed matches
  const matches = await prisma.match.findMany({
    where: {
      tournamentId,
      status: 'COMPLETED'
    },
    include: {
      teamA: true,
      teamB: true,
      participantA: {
        include: { 
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
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
              avatar: true
            }
          } 
        }
      }
    }
  });
  
  // For completed tournaments, get winner
  let winner = null;
  if (tournament.status === 'COMPLETED') {
    // Find final match
    const finalMatch = matches.find(match => {
      // Final match is typically the one with highest round number and no next match
      return !match.nextMatchId && match.status === 'COMPLETED';
    });
    
    if (finalMatch && finalMatch.result) {
      const result = finalMatch.result as any;
      
      // Determine winner entity
      if (finalMatch.teamAId && finalMatch.teamAId === result.winnerId) {
        winner = finalMatch.teamA;
      } else if (finalMatch.teamBId && finalMatch.teamBId === result.winnerId) {
        winner = finalMatch.teamB;
      } else if (finalMatch.participantAId && finalMatch.participantAId === result.winnerId) {
        winner = finalMatch.participantA;
      } else if (finalMatch.participantBId && finalMatch.participantBId === result.winnerId) {
        winner = finalMatch.participantB;
      }
    }
  }
  
  // Calculate standings
  const standings = calculateStandings(tournament, matches);
  
  return {
    tournamentId,
    tournamentName: tournament.name,
    status: tournament.status,
    winner,
    standings,
    completedMatches: matches.length
  };
};

/**
 * Calculate standings for tournament results
 */
function calculateStandings(tournament: any, matches: any[]): any[] {
  // Create record of participant stats
  const statsByParticipant: Record<string, {
    id: string,
    name: string,
    isTeam: boolean,
    avatar?: string,
    wins: number,
    losses: number,
    score: number
  }> = {};
  
  // Process each match
  matches.forEach(match => {
    if (!match.result) return;
    
    const result = match.result as any;
    const winnerId = result.winnerId;
    
    // Track team A stats
    if (match.teamAId) {
      const team = match.teamA;
      if (!statsByParticipant[team.id]) {
        statsByParticipant[team.id] = {
          id: team.id,
          name: team.name,
          isTeam: true,
          avatar: team.logo,
          wins: 0,
          losses: 0,
          score: 0
        };
      }
      
      if (team.id === winnerId) {
        statsByParticipant[team.id].wins += 1;
        statsByParticipant[team.id].score += 3; // 3 points for win
      } else {
        statsByParticipant[team.id].losses += 1;
      }
    }
    
    // Track team B stats
    if (match.teamBId) {
      const team = match.teamB;
      if (!statsByParticipant[team.id]) {
        statsByParticipant[team.id] = {
          id: team.id,
          name: team.name,
          isTeam: true,
          avatar: team.logo,
          wins: 0,
          losses: 0,
          score: 0
        };
      }
      
      if (team.id === winnerId) {
        statsByParticipant[team.id].wins += 1;
        statsByParticipant[team.id].score += 3; // 3 points for win
      } else {
        statsByParticipant[team.id].losses += 1;
      }
    }
    
    // Track participant A stats
    if (match.participantAId) {
      const participant = match.participantA;
      const user = participant.user;
      if (!statsByParticipant[participant.id]) {
        statsByParticipant[participant.id] = {
          id: participant.id,
          name: user.username,
          isTeam: false,
          avatar: user.avatar,
          wins: 0,
          losses: 0,
          score: 0
        };
      }
      
      if (participant.id === winnerId) {
        statsByParticipant[participant.id].wins += 1;
        statsByParticipant[participant.id].score += 3; // 3 points for win
      } else {
        statsByParticipant[participant.id].losses += 1;
      }
    }
    
    // Track participant B stats
    if (match.participantBId) {
      const participant = match.participantB;
      const user = participant.user;
      if (!statsByParticipant[participant.id]) {
        statsByParticipant[participant.id] = {
          id: participant.id,
          name: user.username,
          isTeam: false,
          avatar: user.avatar,
          wins: 0,
          losses: 0,
          score: 0
        };
      }
      
      if (participant.id === winnerId) {
        statsByParticipant[participant.id].wins += 1;
        statsByParticipant[participant.id].score += 3; // 3 points for win
      } else {
        statsByParticipant[participant.id].losses += 1;
      }
    }
  });
  
  // Convert to array and sort by score (descending)
  return Object.values(statsByParticipant).sort((a, b) => {
    // Sort by score first
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // If tied on score, sort by win ratio
    const aRatio = a.wins / (a.wins + a.losses) || 0;
    const bRatio = b.wins / (b.wins + b.losses) || 0;
    return bRatio - aRatio;
  });
}

/**
 * Create an announcement for a tournament
 */
export const createAnnouncement = async (
  tournamentId: string,
  userId: string,
  data: { title: string; content: string; importance?: string }
): Promise<any> => {
  // Check if tournament exists and user is host
  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      hostId: userId
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found or you are not the host');
  }
  
  // Create announcement
  const announcement = await prisma.tournamentAnnouncement.create({
    data: {
      title: data.title,
      content: data.content,
      importance: data.importance || 'medium',
      tournamentId,
      authorId: userId
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    }
  });
  
  return announcement;
};

/**
 * Get announcements for a tournament
 */
export const getTournamentAnnouncements = async (
  tournamentId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResult<any>> => {
  const skip = (page - 1) * limit;
  
  // Check if tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  // Get announcements
  const [announcements, totalCount] = await Promise.all([
    prisma.tournamentAnnouncement.findMany({
      where: { tournamentId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.tournamentAnnouncement.count({ where: { tournamentId } })
  ]);
  
  return {
    items: announcements,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

/**
 * Update a participant's seed
 */
export const updateParticipantSeed = async (
  tournamentId: string,
  participantId: string,
  hostId: string,
  seed: number
): Promise<any> => {
  // Check if tournament exists and user is host
  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      hostId
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found or you are not the host');
  }
  
  // Check if participant exists
  const participant = await prisma.tournamentParticipant.findUnique({
    where: {
      id: participantId
    }
  });
  
  if (!participant || participant.tournamentId !== tournamentId) {
    throw new Error('Participant not found in this tournament');
  }
  
  // Update seed
  const updatedParticipant = await prisma.tournamentParticipant.update({
    where: { id: participantId },
    data: { seed },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      team: true
    }
  });
  
  return updatedParticipant;
};

/**
 * Approve a participant for a tournament
 */
export const approveParticipant = async (
  tournamentId: string,
  participantId: string,
  hostId: string
): Promise<any> => {
  // Check if tournament exists and user is host
  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      hostId
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found or you are not the host');
  }
  
  // Check if participant exists
  const participant = await prisma.tournamentParticipant.findUnique({
    where: {
      id: participantId
    }
  });
  
  if (!participant || participant.tournamentId !== tournamentId) {
    throw new Error('Participant not found in this tournament');
  }
  
  // Update approval status
  const updatedParticipant = await prisma.tournamentParticipant.update({
    where: { id: participantId },
    data: { isApproved: true },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      team: true
    }
  });
  
  return updatedParticipant;
};

/**
 * Remove a participant from a tournament
 */
export const removeParticipant = async (
  tournamentId: string,
  participantId: string,
  hostId: string
): Promise<void> => {
  // Check if tournament exists and user is host
  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId,
      hostId
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found or you are not the host');
  }
  
  // Check if participant exists
  const participant = await prisma.tournamentParticipant.findUnique({
    where: {
      id: participantId
    }
  });
  
  if (!participant || participant.tournamentId !== tournamentId) {
    throw new Error('Participant not found in this tournament');
  }
  
  // If participant is a team captain, prevent removal
  if (participant.teamId) {
    const team = await prisma.team.findFirst({
      where: {
        id: participant.teamId,
        captain: {
          id: participantId
        }
      }
    });
    
    if (team) {
      throw new Error('Cannot remove team captain. Delete the team instead.');
    }
  }
  
  // Delete participant
  await prisma.tournamentParticipant.delete({
    where: { id: participantId }
  });
};

/**
 * Get tournament statistics
 */
export const getTournamentStatistics = async (tournamentId: string): Promise<any> => {
  // Check if tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      _count: {
        select: {
          participants: true,
          teams: true,
          spectators: true
        }
      }
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  // Get match statistics
  const matchStats = await prisma.match.groupBy({
    by: ['status'],
    where: { tournamentId },
    _count: true
  });
  
  // Build match status counts
  const matchCounts: Record<string, number> = {
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    DISPUTED: 0
  };
  
  matchStats.forEach(stat => {
    matchCounts[stat.status] = stat._count;
  });
  
  // Total matches
  const totalMatches = Object.values(matchCounts).reduce((a, b) => a + b, 0);
  
  // Get average match duration
  const completedMatches = await prisma.match.findMany({
    where: { 
      tournamentId,
      status: 'COMPLETED',
      startTime: { not: null },
      endTime: { not: null }
    },
    select: {
      startTime: true,
      endTime: true
    }
  });
  
  let averageDurationMs = 0;
  if (completedMatches.length > 0) {
    const totalDurationMs = completedMatches.reduce((sum, match) => {
      const duration = match.endTime!.getTime() - match.startTime!.getTime();
      return sum + duration;
    }, 0);
    averageDurationMs = totalDurationMs / completedMatches.length;
  }
  
  // Calculate completion percentage
  const completionPercentage = totalMatches > 0 
    ? (matchCounts.COMPLETED / totalMatches) * 100 
    : 0;
  
  return {
    tournamentId,
    tournamentName: tournament.name,
    status: tournament.status,
    participantCount: tournament._count.participants,
    teamCount: tournament._count.teams,
    spectatorCount: tournament._count.spectators,
    matchStatistics: {
      total: totalMatches,
      ...matchCounts,
      averageDurationMinutes: Math.round(averageDurationMs / 60000),
      completionPercentage: Math.round(completionPercentage)
    },
    startDate: tournament.startDate,
    endDate: tournament.endDate,
    duration: tournament.startDate && tournament.endDate 
      ? Math.ceil((tournament.endDate.getTime() - tournament.startDate.getTime()) / (1000 * 3600 * 24))
      : null
  };
};