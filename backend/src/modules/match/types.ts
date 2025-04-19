import { Match, MatchStatus, Team, Tournament, TournamentParticipant, User } from '@prisma/client';

export { MatchStatus } from '@prisma/client';

export interface CreateMatchData {
  tournamentId: string;
  round: number;
  matchNumber: number;
  scheduledTime?: Date | string | null;
  teamAId?: string | null;
  teamBId?: string | null;
  participantAId?: string | null;
  participantBId?: string | null;
  bracketSection?: string;
  judgeId?: string | null;
}

export interface UpdateMatchData {
  scheduledTime?: Date | string | null;
  status?: MatchStatus;
  teamAId?: string | null;
  teamBId?: string | null;
  participantAId?: string | null;
  participantBId?: string | null;
  judgeId?: string | null;
  nextMatchId?: string | null;
  startTime?: Date | string | null;
  endTime?: Date | string | null;
}

export interface MatchResult {
  winnerId: string;
  score: {
    [key: string]: number;  // Team/participant ID to score mapping
  };
  notes?: string;
}

export type MatchWithTeams = Match & {
  teamA?: Team | null;
  teamB?: Team | null;
  participantA?: TournamentParticipant & {
    user: {
      id: string;
      username: string | null;
      avatar: string | null;
    };
  } | null;
  participantB?: TournamentParticipant & {
    user: {
      id: string;
      username: string | null;
      avatar: string | null;
    };
  } | null;
  judge?: User | null;
  tournament: Tournament;
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