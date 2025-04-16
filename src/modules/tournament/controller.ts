import { Request, Response } from 'express';
import * as tournamentService from './service';
import { TournamentStatus } from '@prisma/client';

export const createTournament = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const tournamentData = req.body;
    
    const tournament = await tournamentService.createTournament(userId, tournamentData);
    
    res.status(201).json(tournament);
  } catch (error: any) {
    console.error('Error creating tournament:', error);
    res.status(400).json({ error: error.message || 'Failed to create tournament' });
  }
};

export const getTournaments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as TournamentStatus;
    
    const tournaments = await tournamentService.getTournaments(page, limit, search, status);
    
    res.json(tournaments);
  } catch (error: any) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tournaments' });
  }
};

export const getTournamentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tournament = await tournamentService.getTournamentById(id);
    
    if (!tournament) {
        res.status(404).json({ error: 'Tournament not found' });
    }
    
    res.json(tournament);
  } catch (error: any) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tournament' });
  }
};

export const updateTournament = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const tournamentData = req.body;
    
    const tournament = await tournamentService.updateTournament(id, userId, tournamentData);
    
    res.json(tournament);
  } catch (error: any) {
    console.error('Error updating tournament:', error);
    res.status(400).json({ error: error.message || 'Failed to update tournament' });
  }
};

export const deleteTournament = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    await tournamentService.deleteTournament(id, userId);
    
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting tournament:', error);
    res.status(400).json({ error: error.message || 'Failed to delete tournament' });
  }
};

export const updateTournamentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;
    
    const tournament = await tournamentService.updateTournamentStatus(id, userId, status);
    
    res.json(tournament);
  } catch (error: any) {
    console.error('Error updating tournament status:', error);
    res.status(400).json({ error: error.message || 'Failed to update tournament status' });
  }
};

export const registerParticipant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { teamId } = req.body; // Optional: If registering as a team
    
    const registration = await tournamentService.registerParticipant(id, userId, teamId);
    
    res.status(201).json(registration);
  } catch (error: any) {
    console.error('Error registering for tournament:', error);
    res.status(400).json({ error: error.message || 'Failed to register for tournament' });
  }
};

export const unregisterParticipant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    await tournamentService.unregisterParticipant(id, userId);
    
    res.json({ message: 'Successfully unregistered from tournament' });
  } catch (error: any) {
    console.error('Error unregistering from tournament:', error);
    res.status(400).json({ error: error.message || 'Failed to unregister from tournament' });
  }
};

export const spectateTournament = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    await tournamentService.addSpectator(id, userId);
    
    res.json({ message: 'Now spectating tournament' });
  } catch (error: any) {
    console.error('Error spectating tournament:', error);
    res.status(400).json({ error: error.message || 'Failed to spectate tournament' });
  }
};

export const unspectateTournament = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    await tournamentService.removeSpectator(id, userId);
    
    res.json({ message: 'No longer spectating tournament' });
  } catch (error: any) {
    console.error('Error unspectating tournament:', error);
    res.status(400).json({ error: error.message || 'Failed to unspectate tournament' });
  }
};

export const getTournamentParticipants = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const participants = await tournamentService.getTournamentParticipants(id, page, limit);
    
    res.json(participants);
  } catch (error: any) {
    console.error('Error fetching tournament participants:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tournament participants' });
  }
};

export const getTournamentTeams = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const teams = await tournamentService.getTournamentTeams(id, page, limit);
    
    res.json(teams);
  } catch (error: any) {
    console.error('Error fetching tournament teams:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tournament teams' });
  }
};

export const getHostedTournaments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const tournaments = await tournamentService.getUserHostedTournaments(userId, page, limit);
    
    res.json(tournaments);
  } catch (error: any) {
    console.error('Error fetching hosted tournaments:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch hosted tournaments' });
  }
};

export const getParticipatingTournaments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const tournaments = await tournamentService.getUserParticipatingTournaments(userId, page, limit);
    
    res.json(tournaments);
  } catch (error: any) {
    console.error('Error fetching participating tournaments:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch participating tournaments' });
  }
};

export const getSpectatedTournaments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const tournaments = await tournamentService.getUserSpectatedTournaments(userId, page, limit);
    
    res.json(tournaments);
  } catch (error: any) {
    console.error('Error fetching spectated tournaments:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch spectated tournaments' });
  }
};