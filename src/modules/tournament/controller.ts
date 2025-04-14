import { Request, Response } from 'express';
import * as tournamentService from "./service"
import { TournamentFormat, ParticipantType, Visibility } from '@prisma/client';

export const createTournament = async (req: Request, res: Response) => {
  try {
    const { 
      title, description, format, startDate, endDate, registrationEnd,
      maxParticipants, prizePool, entryFee, rules, visibility, participantType
    } = req.body;
    
    const organizerId = req.user!.id;
    
    const tournament = await tournamentService.createTournament({
      title,
      description,
      format: format as TournamentFormat,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      registrationEnd: new Date(registrationEnd),
      maxParticipants,
      prizePool,
      entryFee,
      rules,
      visibility: visibility as Visibility,
      participantType: participantType as ParticipantType,
      organizerId
    });
    
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
    const status = req.query.status as string;
    const search = req.query.search as string;
    
    const tournaments = await tournamentService.getTournaments(page, limit, status, search);
    res.json(tournaments);
  } catch (error: any) {
    console.error('Error getting tournaments:', error);
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
    console.error('Error getting tournament by ID:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tournament' });
  }
};

export const updateTournament = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, description, format, startDate, endDate, registrationEnd,
      maxParticipants, prizePool, entryFee, rules, visibility, participantType, status
    } = req.body;
    
    const tournament = await tournamentService.updateTournament(
      id, 
      {
        title,
        description,
        format,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        registrationEnd: registrationEnd ? new Date(registrationEnd) : undefined,
        maxParticipants,
        prizePool,
        entryFee,
        rules,
        visibility,
        participantType,
        status
      }
    );
    
    res.json(tournament);
  } catch (error: any) {
    console.error('Error updating tournament:', error);
    res.status(400).json({ error: error.message || 'Failed to update tournament' });
  }
};

export const deleteTournament = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await tournamentService.deleteTournament(id);
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting tournament:', error);
    res.status(400).json({ error: error.message || 'Failed to delete tournament' });
  }
};

export const startTournament = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tournament = await tournamentService.startTournament(id);
    res.json(tournament);
  } catch (error: any) {
    console.error('Error starting tournament:', error);
    res.status(400).json({ error: error.message || 'Failed to start tournament' });
  }
};

export const registerParticipant = async (req: Request, res: Response) => {
  try {
    const { id: tournamentId } = req.params;
    const userId = req.user!.id;
    const { additionalInfo } = req.body;
    
    const registration = await tournamentService.registerParticipant(tournamentId, userId, additionalInfo);
    res.status(201).json(registration);
  } catch (error: any) {
    console.error('Error registering for tournament:', error);
    res.status(400).json({ error: error.message || 'Failed to register for tournament' });
  }
};

export const registerTeam = async (req: Request, res: Response) => {
  try {
    const { id: tournamentId } = req.params;
    const userId = req.user!.id;
    const { teamId, additionalInfo } = req.body;
    
    const registration = await tournamentService.registerTeam(tournamentId, teamId, userId, additionalInfo);
    res.status(201).json(registration);
  } catch (error: any) {
    console.error('Error registering team for tournament:', error);
    res.status(400).json({ error: error.message || 'Failed to register team for tournament' });
  }
};

export const getTournamentParticipants = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const participants = await tournamentService.getTournamentParticipants(id);
    res.json(participants);
  } catch (error: any) {
    console.error('Error getting tournament participants:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tournament participants' });
  }
};