import { Request, Response, NextFunction } from 'express';
import { MatchStatus } from '@prisma/client';

export const validateCreateMatch = (req: Request, res: Response, next: NextFunction) => {
  const { 
    tournamentId,
    round,
    matchNumber,
    scheduledTime,
    teamAId,
    teamBId,
    participantAId,
    participantBId,
    bracketSection
  } = req.body;

  // Required fields
  if (!tournamentId || typeof tournamentId !== 'string') {
    res.status(400).json({ error: 'Tournament ID is required' });
    return;
  }

  if (round === undefined || typeof round !== 'number' || round < 1) {
    res.status(400).json({ error: 'Valid round number is required' });
    return;
  }

  if (matchNumber === undefined || typeof matchNumber !== 'number' || matchNumber < 1) {
    res.status(400).json({ error: 'Valid match number is required' });
    return;
  }

  // At least one participant or team must be provided
  if (!teamAId && !teamBId && !participantAId && !participantBId) {
    res.status(400).json({ error: 'At least one participant or team is required' });
    return;
  }

  // Validate participants and teams are provided correctly
  if ((teamAId && participantAId) || (teamBId && participantBId)) {
    res.status(400).json({ error: 'Cannot provide both team and individual participant for the same position' });
    return;
  }

  // Validate scheduled time if provided
  if (scheduledTime) {
    try {
      new Date(scheduledTime);
    } catch (error) {
      res.status(400).json({ error: 'Invalid scheduled time format' });
      return;
    }
  }

  next();
};

export const validateUpdateMatch = (req: Request, res: Response, next: NextFunction) => {
  const { 
    scheduledTime,
    status,
    teamAId,
    teamBId,
    participantAId,
    participantBId,
    judgeId,
    nextMatchId,
    startTime,
    endTime
  } = req.body;

  // Validate status if provided
  const validStatuses = Object.values(MatchStatus);
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ 
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    });
    return;
  }

  // Validate participants and teams are provided correctly
  if ((teamAId && participantAId) || (teamBId && participantBId)) {
    res.status(400).json({ error: 'Cannot provide both team and individual participant for the same position' });
    return;
  }

  // Validate dates if provided
  const dateFields = { scheduledTime, startTime, endTime };
  for (const [field, value] of Object.entries(dateFields)) {
    if (value) {
      try {
        new Date(value);
      } catch (error) {
        res.status(400).json({ error: `Invalid ${field} format` });
        return;
      }
    }
  }

  // Validate IDs are strings if provided
  const idFields = { teamAId, teamBId, participantAId, participantBId, judgeId, nextMatchId };
  for (const [field, value] of Object.entries(idFields)) {
    if (value !== undefined && value !== null && typeof value !== 'string') {
      res.status(400).json({ error: `${field} must be a string` });
      return;
    }
  }

  next();
};

export const validateMatchResult = (req: Request, res: Response, next: NextFunction) => {
  const { winnerId, score, notes } = req.body;

  // Validate winner ID
  if (!winnerId || typeof winnerId !== 'string') {
    res.status(400).json({ error: 'Winner ID is required' });
    return;
  }

  // Validate score
  if (!score || typeof score !== 'object') {
    res.status(400).json({ error: 'Score object is required' });
    return;
  }

  // Check that score has at least one entry
  if (Object.keys(score).length === 0) {
    res.status(400).json({ error: 'Score must include at least one entry' });
    return;
  }

  // Verify all score values are numbers
  for (const [key, value] of Object.entries(score)) {
    if (typeof value !== 'number') {
      res.status(400).json({ error: 'All score values must be numbers' });
      return;
    }
  }

  // Validate notes if provided
  if (notes !== undefined && notes !== null && typeof notes !== 'string') {
    res.status(400).json({ error: 'Notes must be a string' });
    return;
  }

  next();
};

export const validateDisputeReason = (req: Request, res: Response, next: NextFunction) => {
  const { reason } = req.body;

  if (!reason || typeof reason !== 'string') {
    res.status(400).json({ error: 'Dispute reason is required' });
    return;
  }

  if (reason.length < 10 || reason.length > 500) {
    res.status(400).json({ error: 'Dispute reason must be between 10 and 500 characters' });
    return;
  }

  next();
};

export const validateJudgeAssignment = (req: Request, res: Response, next: NextFunction) => {
  const { judgeId } = req.body;

  if (!judgeId || typeof judgeId !== 'string') {
    res.status(400).json({ error: 'Judge ID is required' });
    return;
  }

  next();
};

export const validateReschedule = (req: Request, res: Response, next: NextFunction) => {
  const { scheduledTime } = req.body;

  if (!scheduledTime) {
    res.status(400).json({ error: 'Scheduled time is required' });
    return;
  }

  try {
    new Date(scheduledTime);
  } catch (error) {
    res.status(400).json({ error: 'Invalid scheduled time format' });
    return;
  }

  next();
};