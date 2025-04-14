import { Request, Response } from 'express';
import * as matchService from './service';

export const getMatchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const match = await matchService.getMatchById(id);
    
    if (!match) {
        res.status(404).json({ error: 'Match not found' });
    }
    
    res.json(match);
  } catch (error: any) {
    console.error('Error getting match:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch match' });
  }
};

export const getTournamentMatches = async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const round = req.query.round ? parseInt(req.query.round as string) : undefined;
    const status = req.query.status as string;
    
    const matches = await matchService.getTournamentMatches(tournamentId, round, status);
    res.json(matches);
  } catch (error: any) {
    console.error('Error getting tournament matches:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch matches' });
  }
};

export const reportMatchResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { winnerId, score, evidence } = req.body;
    
    const match = await matchService.reportMatchResult(id, userId, {
      winnerId,
      score,
      evidence,
      reportedBy: userId
    });
    
    res.json(match);
  } catch (error: any) {
    console.error('Error reporting match result:', error);
    res.status(400).json({ error: error.message || 'Failed to report match result' });
  }
};

export const verifyMatchResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { winnerId, score, adminNotes } = req.body;
    
    const match = await matchService.verifyMatchResult(id, userId, {
      winnerId,
      score,
      adminNotes,
      verifiedBy: userId,
      reportedBy : userId,
    });
    
    res.json(match);
  } catch (error: any) {
    console.error('Error verifying match result:', error);
    res.status(400).json({ error: error.message || 'Failed to verify match result' });
  }
};

// export const disputeMatchResult = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user!.id;
//     const { reason, evidence } = req.body;
    
//     const match = await matchService.disputeMatchResult(id, userId, {
//       reason,
//       evidence,
//       disputedBy: userId
//     });
    
//     res.json(match);
//   } catch (error: any) {
//     console.error('Error disputing match result:', error);
//     res.status(400).json({ error: error.message || 'Failed to dispute match result' });
//   }
// };

export const updateMatchSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { startTime } = req.body;
    
    const match = await matchService.updateMatchSchedule(id, userId, new Date(startTime));
    
    res.json(match);
  } catch (error: any) {
    console.error('Error scheduling match:', error);
    res.status(400).json({ error: error.message || 'Failed to schedule match' });
  }
};

export const getTournamentBracket = async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    
    const bracket = await matchService.getTournamentBracket(tournamentId);
    res.json(bracket);
  } catch (error: any) {
    console.error('Error getting tournament bracket:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tournament bracket' });
  }
};