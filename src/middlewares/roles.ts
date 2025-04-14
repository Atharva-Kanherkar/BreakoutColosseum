import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import prisma from '../lib/db';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Insufficient permissions: Admin role required' });
  }
  next();
};

export const requireOrganizer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== UserRole.ORGANIZER && req.user.role !== UserRole.ADMIN)) {
      res.status(403).json({ error: 'Insufficient permissions: Organizer role required' });
  }
  next();
};

export const requireJudgeOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
    }
    
    // Admin can always verify matches
    if (req.user.role === UserRole.ADMIN) {
        next();
    }
    
    const { id: matchId } = req.params;
    
    // Get the match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true
      }
    });
    
    if (!match) {
        res.status(404).json({ error: 'Match not found' });
    }
    
    // Check if user is tournament organizer
    if (match?.tournament.organizerId === req.user.id) {
        next();
    }
    
    // Check if user is assigned judge for this match
    if (match?.judgeId === req.user.id) {
        next();
    }
    
      res.status(403).json({ 
      error: 'Insufficient permissions: Only admins, tournament organizers, or assigned judges can perform this action' 
    });
  } catch (error) {
    console.error('Error in requireJudgeOrAdmin middleware:', error);
      res.status(500).json({ error: 'Server error' });
  }
};
