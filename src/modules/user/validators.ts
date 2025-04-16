import { Request, Response, NextFunction } from 'express';

export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
  const { username, bio, avatar } = req.body;
  
  // Username validation
  if (username !== undefined) {
    if (typeof username !== 'string') {
       res.status(400).json({ error: 'Username must be a string' });
    }
    
    if (username && (username.length < 3 || username.length > 30)) {
       res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
    }
    
    // Check for valid characters (alphanumeric, underscore, hyphen)
    if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
       res.status(400).json({ 
        error: 'Username may only contain letters, numbers, underscores, and hyphens' 
      });
    }
  }
  
  // Bio validation
  if (bio !== undefined && bio !== null) {
    if (typeof bio !== 'string') {
       res.status(400).json({ error: 'Bio must be a string' });
    }
    
    if (bio && bio.length > 500) {
       res.status(400).json({ error: 'Bio cannot exceed 500 characters' });
    }
  }
  
  // Avatar URL validation
  if (avatar !== undefined && avatar !== null) {
    if (typeof avatar !== 'string') {
       res.status(400).json({ error: 'Avatar must be a URL string' });
    }
    
    if (avatar && avatar.length > 255) {
       res.status(400).json({ error: 'Avatar URL cannot exceed 255 characters' });
    }
    
    // Optional: URL validation
    // if (avatar && !isValidURL(avatar)) {
    //    res.status(400).json({ error: 'Avatar must be a valid URL' });
    // }
  }
  
  next();
};

// Replace the role validator with tournament relationship validators

export const validateTournamentRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { tournamentId } = req.params;
  
  if (!tournamentId || typeof tournamentId !== 'string') {
     res.status(400).json({ error: 'Valid tournament ID is required' });
  }
  
  next();
};

export const validateTeamCreation = (req: Request, res: Response, next: NextFunction) => {
  const { name, tournamentId } = req.body;
  
  if (!name || typeof name !== 'string') {
     res.status(400).json({ error: 'Team name is required' });
  }
  
  if (name.length < 2 || name.length > 50) {
     res.status(400).json({ error: 'Team name must be between 2 and 50 characters' });
  }
  
  if (!tournamentId || typeof tournamentId !== 'string') {
     res.status(400).json({ error: 'Valid tournament ID is required' });
  }
  
  next();
};

export const validateTeamMemberAddition = (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  const { teamId } = req.params;
  
  if (!teamId || typeof teamId !== 'string') {
     res.status(400).json({ error: 'Valid team ID is required' });
  }
  
  if (!userId || typeof userId !== 'string') {
     res.status(400).json({ error: 'Valid user ID is required' });
  }
  
  next();
};

// Validate tournament creation parameters
export const validateTournamentCreation = (req: Request, res: Response, next: NextFunction) => {
  const { 
    name, 
    description, 
    startDate, 
    endDate, 
    maxParticipants, 
    format,
    gameId
  } = req.body;
  
  if (!name || typeof name !== 'string') {
     res.status(400).json({ error: 'Tournament name is required' });
  }
  
  if (name.length < 3 || name.length > 100) {
     res.status(400).json({ error: 'Tournament name must be between 3 and 100 characters' });
  }
  
  if (description && typeof description !== 'string') {
     res.status(400).json({ error: 'Tournament description must be a string' });
  }
  
  // Validate dates
  try {
    if (startDate) new Date(startDate);
    if (endDate) new Date(endDate);
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
       res.status(400).json({ error: 'Start date must be before end date' });
    }
  } catch (error) {
     res.status(400).json({ error: 'Invalid date format' });
  }
  
  // Validate max participants
  if (maxParticipants !== undefined) {
    const max = Number(maxParticipants);
    if (isNaN(max) || max < 2) {
       res.status(400).json({ error: 'Maximum participants must be at least 2' });
    }
  }
  
  // Validate tournament format
  if (format && !['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS'].includes(format)) {
     res.status(400).json({ 
      error: 'Tournament format must be one of: SINGLE_ELIMINATION, DOUBLE_ELIMINATION, ROUND_ROBIN, SWISS' 
    });
  }
  
  // Validate game ID
  if (gameId && typeof gameId !== 'string') {
     res.status(400).json({ error: 'Game ID must be a string' });
  }
  
  next();
};

// New validator to check if user-provided parameters match the schema
export const validateMatchReporting = (req: Request, res: Response, next: NextFunction) => {
  const { winnerId, score, matchDate } = req.body;
  
  if (!winnerId || typeof winnerId !== 'string') {
     res.status(400).json({ error: 'Valid winner ID is required' });
  }
  
  if (!score || typeof score !== 'object') {
     res.status(400).json({ error: 'Valid score object is required' });
  }
  
  // Check if score contains numeric values
  for (const [key, value] of Object.entries(score)) {
    if (typeof value !== 'number') {
       res.status(400).json({ error: 'Score values must be numbers' });
    }
  }
  
  // Optional matchDate validation
  if (matchDate) {
    try {
      new Date(matchDate);
    } catch (error) {
       res.status(400).json({ error: 'Invalid match date format' });
    }
  }
  
  next();
};