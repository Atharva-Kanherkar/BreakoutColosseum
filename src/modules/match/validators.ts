import { Request, Response, NextFunction } from 'express';

export const validateMatchResult = (req: Request, res: Response, next: NextFunction) => {
  const { winnerId, score } = req.body;
  
  // Check required fields
  if (!winnerId) {
      res.status(400).json({ error: 'Winner ID is required' });
  }
  
  if (!score || typeof score !== 'object') {
      res.status(400).json({ error: 'Valid score object is required' });
  }
  
  // Validate score format (should be an object with participant IDs as keys and numbers as values)
  for (const [key, value] of Object.entries(score)) {
    if (typeof value !== 'number' || value < 0) {
        res.status(400).json({ 
        error: 'Score values must be non-negative numbers' 
      });
    }
  }
  
  next();
};

export const validateDispute = (req: Request, res: Response, next: NextFunction) => {
  const { reason } = req.body;
  
  if (!reason || reason.trim().length === 0) {
      res.status(400).json({ error: 'Dispute reason is required' });
  }
  
  if (reason.length > 500) {
      res.status(400).json({ error: 'Dispute reason cannot exceed 500 characters' });
  }
  
  next();
};

export const validateSchedule = (req: Request, res: Response, next: NextFunction) => {
  const { startTime } = req.body;
  
  if (!startTime) {
      res.status(400).json({ error: 'Start time is required' });
  }
  
  // Validate date format
  try {
    const startTimeDate = new Date(startTime);
    const now = new Date();
    
    if (isNaN(startTimeDate.getTime())) {
         res.status(400).json({ error: 'Invalid date format' });
    }
    
    if (startTimeDate < now) {
        res.status(400).json({ error: 'Start time cannot be in the past' });
    }
  } catch (error) {
      res.status(400).json({ error: 'Invalid date format' });
  }
  
  next();
};