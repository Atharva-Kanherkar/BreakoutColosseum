import { Tournament, TournamentStatus, User, Prisma } from '@prisma/client';

// Use Prisma's enum directly
export { TournamentStatus } from '@prisma/client';

// Define tournament formats as a proper enum
export enum TournamentFormat {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  ROUND_ROBIN = 'ROUND_ROBIN',
  SWISS = 'SWISS',
  CUSTOM = 'CUSTOM'
}

export interface CreateTournamentData {
  name: string;
  description?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  format?: string;
  maxParticipants?: number;
  minParticipants?: number;
  teamSize?: number;
  isTeamBased?: boolean;
  registrationDeadline?: Date | string | null;
  status?: TournamentStatus;
}

export interface UpdateTournamentData {
  name?: string;
  description?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  format?: string;
  maxParticipants?: number;
  minParticipants?: number; 
  teamSize?: number;
  isTeamBased?: boolean;
  registrationDeadline?: Date | string | null;
}

// Use Prisma's generated types for safety
export type TournamentWithHost = Tournament & {
  host: {
    id: string;
    username: string | null;
    avatar: string | null;
  };
};

export type TournamentWithDetails = TournamentWithHost & {
  _count: {
    participants: number;
    teams: number;
    spectators: number;
  };
};

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}