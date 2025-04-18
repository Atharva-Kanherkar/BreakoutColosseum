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
    const { entryFeeTx } = req.body; // Get transaction signature
    
    const registration = await tournamentService.registerParticipant(
      id, 
      userId,
      entryFeeTx // Pass payment transaction signature
    );
    
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

/**
 * Generate tournament bracket
 */
export const generateBracket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { seedMethod = 'random' } = req.body;
    
    const matches = await tournamentService.generateTournamentBracket(id, userId, seedMethod);
    
    res.status(201).json({
      message: 'Tournament bracket generated successfully',
      matches
    });
  } catch (error: any) {
    console.error('Error generating tournament bracket:', error);
    res.status(400).json({ error: error.message || 'Failed to generate tournament bracket' });
  }
};
 

// /**
//  * Get tournament matches for a specific round
//  */
// export const getTournamentRoundMatches = async (req: Request, res: Response) => {
//   try {
//     const { id, round } = req.params;
//     const roundNumber = parseInt(round);
    
//     if (isNaN(roundNumber)) {
//       return res.status(400).json({ error: 'Round must be a number' });
//     }
    
//     const matches = await tournamentService.getTournamentRoundMatches(id, roundNumber);
    
//     res.json(matches);
//   } catch (error: any) {
//     console.error('Error fetching tournament round matches:', error);
//     res.status(500).json({ error: error.message || 'Failed to fetch tournament round matches' });
//   }
// };

/**
 * Get tournament results
 */
export const getTournamentResults = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const results = await tournamentService.getTournamentResults(id);
    
    res.json(results);
  } catch (error: any) {
    console.error('Error fetching tournament results:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tournament results' });
  }
};

/**
 * Create tournament announcement
 */
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const announcementData = req.body;
    
    const announcement = await tournamentService.createAnnouncement(id, userId, announcementData);
    
    res.status(201).json(announcement);
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    res.status(400).json({ error: error.message || 'Failed to create announcement' });
  }
};

/**
 * Get tournament announcements
 */
export const getTournamentAnnouncements = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const announcements = await tournamentService.getTournamentAnnouncements(id, page, limit);
    
    res.json(announcements);
  } catch (error: any) {
    console.error('Error fetching tournament announcements:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tournament announcements' });
  }
};

/**
 * Update participant seed
 */
export const updateParticipantSeed = async (req: Request, res: Response) => {
  try {
    const { id, participantId } = req.params;
    const userId = req.user!.id;
    const { seed } = req.body;
    
    const participant = await tournamentService.updateParticipantSeed(id, participantId, userId, seed);
    
    res.json(participant);
  } catch (error: any) {
    console.error('Error updating participant seed:', error);
    res.status(400).json({ error: error.message || 'Failed to update participant seed' });
  }
};

/**
 * Approve participant
 */
export const approveParticipant = async (req: Request, res: Response) => {
  try {
    const { id, participantId } = req.params;
    const userId = req.user!.id;
    
    const participant = await tournamentService.approveParticipant(id, participantId, userId);
    
    res.json(participant);
  } catch (error: any) {
    console.error('Error approving participant:', error);
    res.status(400).json({ error: error.message || 'Failed to approve participant' });
  }
};

/**
 * Remove participant
 */
export const removeParticipant = async (req: Request, res: Response) => {
  try {
    const { id, participantId } = req.params;
    const userId = req.user!.id;
    
    await tournamentService.removeParticipant(id, participantId, userId);
    
    res.json({ message: 'Participant removed successfully' });
  } catch (error: any) {
    console.error('Error removing participant:', error);
    res.status(400).json({ error: error.message || 'Failed to remove participant' });
  }
};

/**
 * Get tournament statistics
 */
export const getTournamentStatistics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const stats = await tournamentService.getTournamentStatistics(id);
    
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching tournament statistics:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tournament statistics' });
  }
};