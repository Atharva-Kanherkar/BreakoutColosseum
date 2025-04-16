import { Request, Response } from 'express';
import * as matchService from './service';
import { MatchStatus } from '@prisma/client';

export const getMatches = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const tournamentId = req.query.tournamentId as string;
    const status = req.query.status as MatchStatus;
    const round = req.query.round ? parseInt(req.query.round as string) : undefined;

    const matches = await matchService.getMatches(
      page,
      limit,
      tournamentId,
      status,
      round
    );

    res.json(matches);
  } catch (error: any) {
    console.error('Error getting matches:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch matches' });
  }
};

export const getMatchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const match = await matchService.getMatchById(id);

    if (!match) {
        res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error: any) {
    console.error('Error getting match by ID:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch match' });
  }
};

export const createMatch = async (req: Request, res: Response) => {
  try {
    const matchData = req.body;
    const match = await matchService.createMatch(matchData);

    res.status(201).json(match);
  } catch (error: any) {
    console.error('Error creating match:', error);
    res.status(400).json({ error: error.message || 'Failed to create match' });
  }
};

export const updateMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const match = await matchService.updateMatch(id, updateData);

    res.json(match);
  } catch (error: any) {
    console.error('Error updating match:', error);
    res.status(400).json({ error: error.message || 'Failed to update match' });
  }
};

export const submitMatchResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = req.body;

    const match = await matchService.submitMatchResult(id, userId, result);
    res.json(match);
  } catch (error: any) {
    console.error('Error submitting match result:', error);
    res.status(400).json({ error: error.message || 'Failed to submit match result' });
  }
};

export const startMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const match = await matchService.startMatch(id, userId);
    res.json(match);
  } catch (error: any) {
    console.error('Error starting match:', error);
    res.status(400).json({ error: error.message || 'Failed to start match' });
  }
};

export const cancelMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const match = await matchService.cancelMatch(id, userId);
    res.json(match);
  } catch (error: any) {
    console.error('Error cancelling match:', error);
    res.status(400).json({ error: error.message || 'Failed to cancel match' });
  }
};

export const disputeMatchResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { reason } = req.body;

    const match = await matchService.disputeMatchResult(id, userId, reason);
    res.json(match);
  } catch (error: any) {
    console.error('Error disputing match result:', error);
    res.status(400).json({ error: error.message || 'Failed to dispute match result' });
  }
};

export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = req.body;

    const match = await matchService.resolveDispute(id, userId, result);
    res.json(match);
  } catch (error: any) {
    console.error('Error resolving dispute:', error);
    res.status(400).json({ error: error.message || 'Failed to resolve dispute' });
  }
};

export const getTournamentMatches = async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const round = req.query.round ? parseInt(req.query.round as string) : undefined;

    const matches = await matchService.getTournamentMatches(
      tournamentId,
      page,
      limit,
      round
    );

    res.json(matches);
  } catch (error: any) {
    console.error('Error getting tournament matches:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tournament matches' });
  }
};

export const getUserMatches = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as MatchStatus;

    const matches = await matchService.getUserMatches(
      userId,
      page,
      limit,
      status
    );

    res.json(matches);
  } catch (error: any) {
    console.error('Error getting user matches:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user matches' });
  }
};

export const assignJudge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { judgeId } = req.body;
    const requesterId = req.user!.id;

    const match = await matchService.assignJudge(id, judgeId, requesterId);
    res.json(match);
  } catch (error: any) {
    console.error('Error assigning judge:', error);
    res.status(400).json({ error: error.message || 'Failed to assign judge' });
  }
};

export const generateBracket = async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const userId = req.user!.id;

    const matches = await matchService.generateBracket(tournamentId, userId);
    res.json(matches);
  } catch (error: any) {
    console.error('Error generating bracket:', error);
    res.status(400).json({ error: error.message || 'Failed to generate bracket' });
  }
};

export const rescheduleMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduledTime } = req.body;
    const userId = req.user!.id;

    const match = await matchService.rescheduleMatch(id, scheduledTime, userId);
    res.json(match);
  } catch (error: any) {
    console.error('Error rescheduling match:', error);
    res.status(400).json({ error: error.message || 'Failed to reschedule match' });
  }
};