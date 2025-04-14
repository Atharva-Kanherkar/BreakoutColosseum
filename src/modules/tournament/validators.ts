import { Request, Response, NextFunction } from 'express';
import { TournamentFormat, ParticipantType, Visibility } from '@prisma/client';

export const validateCreateTournament = (req: Request, res: Response, next: NextFunction) => {
  const { 
    title, format, startDate, registrationEnd, visibility, participantType
  } = req.body;
  
  // Required fields
  if (!title) {
     res.status(400).json({ error: 'Title is required' });
  }
  
  if (!format) {
     res.status(400).json({ error: 'Tournament format is required' });
  }
  
  if (!Object.values(TournamentFormat).includes(format)) {
     res.status(400).json({ 
      error: `Format must be one of: ${Object.values(TournamentFormat).join(', ')}` 
    });
  }
  
  if (!startDate) {
     res.status(400).json({ error: 'Start date is required' });
  }
  
  if (!registrationEnd) {
     res.status(400).json({ error: 'Registration end date is required' });
  }
  
  // Optional fields with validation
  if (visibility && !Object.values(Visibility).includes(visibility)) {
     res.status(400).json({ 
      error: `Visibility must be one of: ${Object.values(Visibility).join(', ')}` 
    });
  }
  
  if (participantType && !Object.values(ParticipantType).includes(participantType)) {
     res.status(400).json({ 
      error: `Participant type must be one of: ${Object.values(ParticipantType).join(', ')}` 
    });
  }
  
  // Date validation
  try {
    const startDateObj = new Date(startDate);
    const registrationEndObj = new Date(registrationEnd);
    const now = new Date();
    
    if (startDateObj < now) {
       res.status(400).json({ error: 'Start date must be in the future' });
    }
    
    if (registrationEndObj < now) {
       res.status(400).json({ error: 'Registration end date must be in the future' });
    }
    
    if (registrationEndObj > startDateObj) {
       res.status(400).json({ error: 'Registration must end before tournament starts' });
    }
  } catch (error) {
     res.status(400).json({ error: 'Invalid date format' });
  }
  
  next();
};

export const validateUpdateTournament = (req: Request, res: Response, next: NextFunction) => {
  const { 
    format, startDate, registrationEnd, visibility, participantType, status, endDate
  } = req.body;
  
  // Optional fields with validation
  if (format && !Object.values(TournamentFormat).includes(format)) {
     res.status(400).json({ 
      error: `Format must be one of: ${Object.values(TournamentFormat).join(', ')}` 
    });
  }
  
  if (visibility && !Object.values(Visibility).includes(visibility)) {
     res.status(400).json({ 
      error: `Visibility must be one of: ${Object.values(Visibility).join(', ')}` 
    });
  }
  
  if (participantType && !Object.values(ParticipantType).includes(participantType)) {
     res.status(400).json({ 
      error: `Participant type must be one of: ${Object.values(ParticipantType).join(', ')}` 
    });
  }
  
  // Date validation
  try {
    if (startDate) {
      const startDateObj = new Date(startDate);
      const now = new Date();
      
      if (startDateObj < now) {
         res.status(400).json({ error: 'Start date must be in the future' });
      }
      
      if (registrationEnd) {
        const registrationEndObj = new Date(registrationEnd);
        
        if (registrationEndObj > startDateObj) {
           res.status(400).json({ error: 'Registration must end before tournament starts' });
        }
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        
        if (endDateObj < startDateObj) {
           res.status(400).json({ error: 'End date must be after start date' });
        }
      }
    }
  } catch (error) {
     res.status(400).json({ error: 'Invalid date format' });
  }
  
  next();
};

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { teamId } = req.body;
  
  // If it's a team registration, validate teamId
  if (req.path.endsWith('/team')) {
    if (!teamId) {
       res.status(400).json({ error: 'Team ID is required' });
    }
  }
  
  next();
};