import { Request, Response, NextFunction } from 'express';
import prisma from "../lib/db";

 

export const requireTournamentHost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: tournamentId } = req.params;
    const userId = req.user!.id;
    
    const tournament = await prisma.tournament.findUnique({
      where: { 
        id: tournamentId,
        hostId: userId // Check if user is the host
      }
    });
    
    if (!tournament) {
      return res.status(403).json({ error: 'You are not authorized to manage this tournament' });
    }
    
    next();
  } catch (error) {
    console.error('Error in requireTournamentHost middleware:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// For admin functionality, you could add a separate isAdmin flag to the User model