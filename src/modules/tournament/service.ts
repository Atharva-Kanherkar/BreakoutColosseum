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

// Helper function to map Prisma result to TournamentWithDetails
function mapToTournamentWithDetails(tournament: any): TournamentWithDetails {
  return {
    ...tournament,
    host: tournament.host,
    _count: tournament._count
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
      }
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
  teamId?: string
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

  const isHost = tournament.hostId === userId;
  if (isHost) {
    throw new Error('Hosts cannot register as participants');
  }
  
  // Check if user is already registered
  const existingRegistration = await prisma.tournamentParticipant.findUnique({
    where: {
      userId_tournamentId: {
        userId,
        tournamentId
      }
    }
  });
  
  if (existingRegistration) {
    throw new Error('You are already registered for this tournament');
  }
  
  // Check max participants if set
  if (tournament.maxParticipants) {
    const participantCount = await prisma.tournamentParticipant.count({
      where: { tournamentId }
    });
    
    if (participantCount >= tournament.maxParticipants) {
      throw new Error('Tournament has reached maximum number of participants');
    }
  }
  
  // For team registration, verify team exists and user is captain
  if (teamId) {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        captain: {
          userId
        }
      }
    });
    
    if (!team) {
      throw new Error('Team not found or you are not the captain');
    }
    
    if (team.tournamentId !== tournamentId) {
      throw new Error('Team is not registered for this tournament');
    }
  }
  
  // Register participant
  const participant = await prisma.tournamentParticipant.create({
    data: {
      userId,
      tournamentId,
      teamId
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      },
      team: teamId ? true : false
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