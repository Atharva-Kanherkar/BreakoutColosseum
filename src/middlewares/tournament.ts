import { Request, Response, NextFunction } from 'express';
import prisma from "../lib/db";

export const requireTournamentOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: { organizerId: true }
    });
    
    if (!tournament) {
        res.status(404).json({ error: 'Tournament not found' });
    }
    
    if (tournament?.organizerId !== userId && req.user!.role !== 'ADMIN') {
        res.status(403).json({ error: 'You do not have permission to modify this tournament' });
    }
    
    next();
  } catch (error) {
    console.error('Error in requireTournamentOwner middleware:', error);
    res.status(500).json({ error: 'Server error' });
  }
};