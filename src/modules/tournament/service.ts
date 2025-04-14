import prisma from '../../lib/db';
import { TournamentFormat, TournamentStatus, ParticipantType, Visibility, Prisma } from '@prisma/client';

interface CreateTournamentData {
  title: string;
  description?: string;
  format: TournamentFormat;
  startDate: Date;
  endDate?: Date;
  registrationEnd: Date;
  maxParticipants?: number;
  prizePool?: number | string;
  entryFee?: number | string;
  rules?: any;
  visibility: Visibility;
  participantType: ParticipantType;
  organizerId: string;
}

interface UpdateTournamentData {
  title?: string;
  description?: string | null;
  format?: TournamentFormat;
  status?: TournamentStatus;
  startDate?: Date;
  endDate?: Date | null;
  registrationEnd?: Date;
  maxParticipants?: number | null;
  prizePool?: number | string | null;
  entryFee?: number | string | null;
  rules?: any;
  visibility?: Visibility;
  participantType?: ParticipantType;
}

export const createTournament = async (data: CreateTournamentData) => {
  // Validate dates
  const now = new Date();
  
  if (data.startDate < now) {
    throw new Error('Tournament start date cannot be in the past');
  }
  
  if (data.registrationEnd > data.startDate) {
    throw new Error('Registration end date must be before tournament start date');
  }
  
  if (data.endDate && data.endDate < data.startDate) {
    throw new Error('Tournament end date must be after start date');
  }
  
  // Create tournament
  const tournament = await prisma.tournament.create({
    data: {
      title: data.title,
      description: data.description,
      format: data.format,
      startDate: data.startDate,
      endDate: data.endDate,
      registrationEnd: data.registrationEnd,
      maxParticipants: data.maxParticipants,
      prizePool: data.prizePool ? new Prisma.Decimal(data.prizePool.toString()) : null,
      entryFee: data.entryFee ? new Prisma.Decimal(data.entryFee.toString()) : null,
      rules: data.rules,
      visibility: data.visibility,
      participantType: data.participantType,
      organizerId: data.organizerId,
    },
    include: {
      organizer: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        }
      }
    }
  });
  
  return tournament;
};

export const getTournaments = async (page = 1, limit = 10, status?: string, search?: string) => {
  const skip = (page - 1) * limit;
  
  // Build where clause
  const whereClause: Prisma.TournamentWhereInput = {};
  
  // Filter by status if provided
  if (status) {
    if (Object.values(TournamentStatus).includes(status as TournamentStatus)) {
      whereClause.status = status as TournamentStatus;
    } else {
      throw new Error('Invalid tournament status');
    }
  } else {
    // By default, only show public tournaments
    whereClause.visibility = 'PUBLIC';
  }
  
  // Add search
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
      { description: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
    ];
  }
  
  const [tournaments, totalCount] = await Promise.all([
    prisma.tournament.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { startDate: 'asc' },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          }
        },
        _count: {
          select: {
            participations: true
          }
        }
      }
    }),
    prisma.tournament.count({ where: whereClause }),
  ]);
  
  return {
    tournaments,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
    }
  };
};

export const getTournamentById = async (id: string) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      organizer: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        }
      },
      _count: {
        select: {
          participations: true,
          matches: true
        }
      }
    }
  });
  
  return tournament;
};

export const updateTournament = async (id: string, data: UpdateTournamentData) => {
  // Get current tournament to check ownership and status
  const tournament = await prisma.tournament.findUnique({
    where: { id }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  // Don't allow certain updates if tournament has started
  if (tournament.status !== 'REGISTRATION' && tournament.status !== 'UPCOMING') {
    if (data.format || data.participantType) {
      throw new Error('Cannot change format or participant type after tournament has started');
    }
  }
  
  // Process decimal fields
  const updateData: any = { ...data };
  
  if (data.prizePool !== undefined) {
    updateData.prizePool = data.prizePool ? new Prisma.Decimal(data.prizePool.toString()) : null;
  }
  
  if (data.entryFee !== undefined) {
    updateData.entryFee = data.entryFee ? new Prisma.Decimal(data.entryFee.toString()) : null;
  }
  
  // Update tournament
  return prisma.tournament.update({
    where: { id },
    data: updateData,
    include: {
      organizer: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        }
      }
    }
  });
};

export const deleteTournament = async (id: string) => {
  // Check if tournament has participants or matches before deletion
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          participations: true,
          matches: true
        }
      }
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  if (tournament._count.participations > 0 || tournament._count.matches > 0) {
    throw new Error('Cannot delete tournament with existing participants or matches');
  }
  
  return prisma.tournament.delete({
    where: { id }
  });
};

export const startTournament = async (id: string) => {
  // Get tournament
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      participations: true
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  // Check tournament status
  if (tournament.status !== 'REGISTRATION' && tournament.status !== 'UPCOMING') {
    throw new Error('Tournament has already started');
  }
  
  // Check if registration period has ended
  const now = new Date();
  if (now < tournament.registrationEnd) {
    throw new Error('Registration period has not ended yet');
  }
  
  // Check if there are enough participants
  if (tournament.participations.length < 2) {
    throw new Error('Tournament needs at least 2 participants to start');
  }
  
  // Update tournament status
  const updatedTournament = await prisma.tournament.update({
    where: { id },
    data: { status: 'ONGOING' },
    include: {
      organizer: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        }
      }
    }
  });
  
  // TODO: Generate first round matches based on tournament format
  // This would be done in a separate function that would create the bracket
  
  return updatedTournament;
};

export const registerParticipant = async (tournamentId: string, userId: string, additionalInfo?: any) => {
  // Get tournament
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      _count: {
        select: {
          participations: true
        }
      }
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  // Check tournament status
  if (tournament.status !== 'REGISTRATION') {
    throw new Error('Tournament registration is closed');
  }
  
  // Check registration deadline
  const now = new Date();
  if (now > tournament.registrationEnd) {
    throw new Error('Registration deadline has passed');
  }
  
  // Check participant type
  if (tournament.participantType !== 'INDIVIDUAL') {
    throw new Error('This tournament requires team registration');
  }
  
  // Check max participants
  if (tournament.maxParticipants && tournament._count.participations >= tournament.maxParticipants) {
    throw new Error('Tournament has reached maximum number of participants');
  }
  
  // Check if already registered
  const existingRegistration = await prisma.participation.findFirst({
    where: {
      tournamentId,
      userId,
    }
  });
  
  if (existingRegistration) {
    throw new Error('Already registered for this tournament');
  }
  
  // Create participation
  return prisma.participation.create({
    data: {
      tournamentId,
      userId,
      seed: tournament._count.participations + 1,
      status: 'REGISTERED',
 
    },
    include: {
      tournament: {
        select: {
          id: true,
          title: true,
          startDate: true,
          format: true
        }
      },
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true
        }
      }
    }
  });
};

export const registerTeam = async (tournamentId: string, teamId: string, userId: string, additionalInfo?: any) => {
  // Get tournament
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      _count: {
        select: {
          participations: true
        }
      }
    }
  });
  
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  
  // Check tournament status
  if (tournament.status !== 'REGISTRATION') {
    throw new Error('Tournament registration is closed');
  }
  
  // Check registration deadline
  const now = new Date();
  if (now > tournament.registrationEnd) {
    throw new Error('Registration deadline has passed');
  }
  
  // Check participant type
  if (tournament.participantType !== 'TEAM') {
    throw new Error('This tournament requires individual registration');
  }
  
  // Check max participants
  if (tournament.maxParticipants && tournament._count.participations >= tournament.maxParticipants) {
    throw new Error('Tournament has reached maximum number of participants');
  }
  
  // Check if team exists and user is captain or owner
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      OR: [
        { creatorId: userId },
        {
          members: {
            some: {
              userId,
              role: 'CAPTAIN'
            }
          }
        }
      ]
    }
  });
  
  if (!team) {
    throw new Error('Team not found or you do not have permission to register this team');
  }
  
  // Check if team is already registered
  const existingRegistration = await prisma.participation.findFirst({
    where: {
      tournamentId,
      teamId,
    }
  });
  
  if (existingRegistration) {
    throw new Error('Team already registered for this tournament');
  }
  
  // Create participation
  return prisma.participation.create({
    data: {
      tournamentId,
      teamId,
      seed: tournament._count.participations + 1,
      status: 'REGISTERED',
       
    },
    include: {
      tournament: {
        select: {
          id: true,
          title: true,
          startDate: true,
          format: true
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          tag: true,
          logo: true
        }
      }
    }
  });
};

export const getTournamentParticipants = async (tournamentId: string) => {
  const participants = await prisma.participation.findMany({
    where: {
      tournamentId
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          tag: true,
          logo: true
        }
      }
    },
    orderBy: {
      seed: 'asc'
    }
  });
  
  return participants;
};