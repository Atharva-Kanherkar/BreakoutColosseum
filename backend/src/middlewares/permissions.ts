import { Request, Response, NextFunction } from 'express';
import * as userService from '../modules/user/service';
import prisma from '../lib/db';

// Check if user is a system administrator
export const isSystemAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true } // Assuming you add an isAdmin flag to your schema
    });
    
    if (!user || !user.isAdmin) {
      res.status(403).json({ error: 'Admin privileges required' });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
// Check if user is host of a tournament
export const isTournamentHost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: 'Tournament ID is required' });
      return;
    }
    
    const tournament = await prisma.tournament.findFirst({
      where: {
        id,
        hostId: req.user.id
      }
    });
    
    if (!tournament) {
      res.status(403).json({ error: 'Only the tournament host can perform this action' });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Error checking tournament host:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Check if user is participant in a tournament
export const isTournamentParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: 'Tournament ID is required' });
      return;
    }
    
    const participant = await prisma.tournamentParticipant.findFirst({
      where: {
        tournamentId: id,
        userId: req.user.id
      }
    });
    
    if (!participant) {
      res.status(403).json({ error: 'Only tournament participants can perform this action' });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Error checking tournament participant:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Additional export of existing middleware functions...
  export const isTeamCaptain = async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }
        
        const { id: teamId } = req.params;
        
        if (!teamId) {
          res.status(400).json({ error: 'Team ID is required' });
          return;
        }
        
        const team = await prisma.team.findUnique({
          where: { id: teamId },
          include: {
            captain: true
          }
        });
        
        if (!team) {
          res.status(404).json({ error: 'Team not found' });
          return;
        }
        
        if (team.captain.userId !== req.user.id) {
          res.status(403).json({ error: 'Only the team captain can perform this action' });
          return;
        }
        
        next();
      } catch (error) {
        console.error('Error checking team captain:', error);
        res.status(500).json({ error: 'Server error' });
      }
    };
    
    // Check if user is team member
    export const isTeamMember = async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }
        
        const { id: teamId } = req.params;
        
        if (!teamId) {
          res.status(400).json({ error: 'Team ID is required' });
          return;
        }
        
        // Find if user is a team member
        const participant = await prisma.tournamentParticipant.findFirst({
          where: {
            userId: req.user.id,
            teamId
          }
        });
        
        if (!participant) {
          res.status(403).json({ error: 'Only team members can perform this action' });
          return;
        }
        
        next();
      } catch (error) {
        console.error('Error checking team membership:', error);
        res.status(500).json({ error: 'Server error' });
      }
    };
