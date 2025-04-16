import { Request, Response, NextFunction } from 'express';
import { TournamentStatus } from '@prisma/client';
import { TournamentFormat } from './types';

const validTournamentStatuses: TournamentStatus[] = [
  'DRAFT', 
  'REGISTRATION_OPEN', 
  'REGISTRATION_CLOSED', 
  'ONGOING', 
  'COMPLETED', 
  'CANCELLED'
];

const validTournamentFormats: string[] = [
  'SINGLE_ELIMINATION', 
  'DOUBLE_ELIMINATION', 
  'ROUND_ROBIN', 
  'SWISS', 
  'CUSTOM'
];

export const validateCreateTournament = (req: Request, res: Response, next: NextFunction) => {
  const { 
    name, 
    description, 
    startDate, 
    endDate, 
    format, 
    maxParticipants, 
    minParticipants,
    teamSize,
    isTeamBased,
    registrationDeadline,
    status
  } = req.body;
  
  // Required fields
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Tournament name is required' });
    return;
  }
  
  if (name.length < 3 || name.length > 100) {
    res.status(400).json({ error: 'Tournament name must be between 3 and 100 characters' });
    return;
  }
  
  // Optional description
  if (description !== undefined && description !== null && typeof description !== 'string') {
    res.status(400).json({ error: 'Tournament description must be a string' });
    return;
  }
  
  // Date validations
  if (startDate) {
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      res.status(400).json({ error: 'Invalid start date format' });
      return;
    }
  }
  
  if (endDate) {
    const endDateObj = new Date(endDate);
    if (isNaN(endDateObj.getTime())) {
      res.status(400).json({ error: 'Invalid end date format' });
      return;
    }
  }
  
  if (registrationDeadline) {
    const deadlineObj = new Date(registrationDeadline);
    if (isNaN(deadlineObj.getTime())) {
      res.status(400).json({ error: 'Invalid registration deadline format' });
      return;
    }
  }
  
  // Check date relationships
  if (startDate && endDate) {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (startDateObj > endDateObj) {
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }
  }
  
  if (startDate && registrationDeadline) {
    const startDateObj = new Date(startDate);
    const deadlineObj = new Date(registrationDeadline);
    
    if (deadlineObj > startDateObj) {
      res.status(400).json({ error: 'Registration deadline must be before start date' });
      return;
    }
  }
  
  // Format validation
  if (format && !validTournamentFormats.includes(format)) {
    res.status(400).json({ 
      error: `Invalid tournament format. Must be one of: ${validTournamentFormats.join(', ')}` 
    });
    return;
  }
  
  // Status validation
  if (status && !validTournamentStatuses.includes(status as TournamentStatus)) {
    res.status(400).json({ 
      error: `Invalid tournament status. Must be one of: ${validTournamentStatuses.join(', ')}` 
    });
    return;
  }
  
  // Participant counts
  if (maxParticipants !== undefined) {
    const max = Number(maxParticipants);
    if (isNaN(max) || max < 2) {
      res.status(400).json({ error: 'Max participants must be at least 2' });
      return;
    }
  }
  
  if (minParticipants !== undefined) {
    const min = Number(minParticipants);
    if (isNaN(min) || min < 2) {
      res.status(400).json({ error: 'Min participants must be at least 2' });
      return;
    }
  }
  
  if (minParticipants !== undefined && maxParticipants !== undefined) {
    const min = Number(minParticipants);
    const max = Number(maxParticipants);
    
    if (min > max) {
      res.status(400).json({ error: 'Min participants cannot be greater than max participants' });
      return;
    }
  }
  
  // Team size validation
  if (teamSize !== undefined) {
    const size = Number(teamSize);
    if (isNaN(size) || size < 1) {
      res.status(400).json({ error: 'Team size must be at least 1' });
      return;
    }
  }
  
  // IsTeamBased validation
  if (isTeamBased !== undefined && typeof isTeamBased !== 'boolean') {
    res.status(400).json({ error: 'isTeamBased must be a boolean' });
    return;
  }
  
  next();
};

export const validateUpdateTournament = (req: Request, res: Response, next: NextFunction) => {
  const { 
    name, 
    description, 
    startDate, 
    endDate, 
    format, 
    maxParticipants, 
    minParticipants,
    teamSize,
    isTeamBased,
    registrationDeadline
  } = req.body;
  
  // Optional name
  if (name !== undefined) {
    if (typeof name !== 'string') {
      res.status(400).json({ error: 'Tournament name must be a string' });
      return;
    }
    
    if (name.length < 3 || name.length > 100) {
      res.status(400).json({ error: 'Tournament name must be between 3 and 100 characters' });
      return;
    }
  }
  
  // Optional description
  if (description !== undefined && description !== null && typeof description !== 'string') {
    res.status(400).json({ error: 'Tournament description must be a string or null' });
    return;
  }
  
  // Date validations
  if (startDate !== undefined && startDate !== null) {
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      res.status(400).json({ error: 'Invalid start date format' });
      return;
    }
  }
  
  if (endDate !== undefined && endDate !== null) {
    const endDateObj = new Date(endDate);
    if (isNaN(endDateObj.getTime())) {
      res.status(400).json({ error: 'Invalid end date format' });
      return;
    }
  }
  
  if (registrationDeadline !== undefined && registrationDeadline !== null) {
    const deadlineObj = new Date(registrationDeadline);
    if (isNaN(deadlineObj.getTime())) {
      res.status(400).json({ error: 'Invalid registration deadline format' });
      return;
    }
  }
  
  // Check date relationships
  if (startDate && endDate) {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (startDateObj > endDateObj) {
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }
  }
  
  if (startDate && registrationDeadline) {
    const startDateObj = new Date(startDate);
    const deadlineObj = new Date(registrationDeadline);
    
    if (deadlineObj > startDateObj) {
      res.status(400).json({ error: 'Registration deadline must be before start date' });
      return;
    }
  }
  
  // Format validation
  if (format !== undefined && !validTournamentFormats.includes(format)) {
    res.status(400).json({ 
      error: `Invalid tournament format. Must be one of: ${validTournamentFormats.join(', ')}` 
    });
    return;
  }
  
  // Participant counts
  if (maxParticipants !== undefined) {
    const max = Number(maxParticipants);
    if (isNaN(max) || max < 2) {
      res.status(400).json({ error: 'Max participants must be at least 2' });
      return;
    }
  }
  
  if (minParticipants !== undefined) {
    const min = Number(minParticipants);
    if (isNaN(min) || min < 2) {
      res.status(400).json({ error: 'Min participants must be at least 2' });
      return;
    }
  }
  
  if (minParticipants !== undefined && maxParticipants !== undefined) {
    const min = Number(minParticipants);
    const max = Number(maxParticipants);
    
    if (min > max) {
      res.status(400).json({ error: 'Min participants cannot be greater than max participants' });
      return;
    }
  }
  
  // Team size validation
  if (teamSize !== undefined) {
    const size = Number(teamSize);
    if (isNaN(size) || size < 1) {
      res.status(400).json({ error: 'Team size must be at least 1' });
      return;
    }
  }
  
  // IsTeamBased validation
  if (isTeamBased !== undefined && typeof isTeamBased !== 'boolean') {
    res.status(400).json({ error: 'isTeamBased must be a boolean' });
    return;
  }
  
  next();
};

export const validateTournamentStatus = (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.body;
  
  if (!status) {
    res.status(400).json({ error: 'Tournament status is required' });
    return;
  }
  
  if (!validTournamentStatuses.includes(status as TournamentStatus)) {
    res.status(400).json({ 
      error: `Invalid tournament status. Must be one of: ${validTournamentStatuses.join(', ')}` 
    });
    return;
  }
  
  next();
};

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { teamId } = req.body;
  
  // TeamId is optional, but if provided must be a string
  if (teamId !== undefined && typeof teamId !== 'string') {
    res.status(400).json({ error: 'Team ID must be a string' });
    return;
  }
  
  next();
};