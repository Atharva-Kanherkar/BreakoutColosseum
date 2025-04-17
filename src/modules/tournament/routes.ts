import { Router } from 'express';
import * as tournamentController from './controller';
import { authenticate } from '../../middlewares/auth';
import { 
  validateCreateTournament, 
  validateUpdateTournament,
  validateRegistration,
  validateTournamentStatus,
  validateTeamCreation,
  validateTeamUpdate,
  validateAnnouncement,
  validateBracketGeneration
} from './validators';
import { isTournamentHost, isTeamCaptain } from '../../middlewares/permissions';

const router = Router();

// Public routes
router.get('/', tournamentController.getTournaments);
router.get('/:id', tournamentController.getTournamentById);
router.get('/:id/participants', tournamentController.getTournamentParticipants);
router.get('/:id/teams', tournamentController.getTournamentTeams);
// router.get('/:id/matches/round/:round', tournamentController.getTournamentRoundMatches);
router.get('/:id/results', tournamentController.getTournamentResults);
router.get('/:id/announcements', tournamentController.getTournamentAnnouncements);
router.get('/:id/stats', tournamentController.getTournamentStatistics);

// Protected routes - require authentication
router.post('/', authenticate, validateCreateTournament, tournamentController.createTournament);
router.put('/:id', authenticate, isTournamentHost, validateUpdateTournament, tournamentController.updateTournament);
router.delete('/:id', authenticate, isTournamentHost, tournamentController.deleteTournament);

// Tournament status management
router.put('/:id/status', authenticate, isTournamentHost, validateTournamentStatus, tournamentController.updateTournamentStatus);

// Registration routes
router.post('/:id/register', authenticate, validateRegistration, tournamentController.registerParticipant);
router.delete('/:id/unregister', authenticate, tournamentController.unregisterParticipant);

// Spectator routes
router.post('/:id/spectate', authenticate, tournamentController.spectateTournament);
router.delete('/:id/spectate', authenticate, tournamentController.unspectateTournament);

 // Create bracket (POST)
router.post('/:id/brackets', authenticate, isTournamentHost, validateBracketGeneration, tournamentController.generateBracket);

// // Get brackets (GET)
// router.get('/:id/brackets', tournamentController.getBrackets);

// // Reset brackets (DELETE)
// router.delete('/:id/brackets', authenticate, isTournamentHost, tournamentController.resetBrackets);
// Participant management
router.put('/:id/participants/:participantId/seed', authenticate, isTournamentHost, tournamentController.updateParticipantSeed);
router.put('/:id/participants/:participantId/approve', authenticate, isTournamentHost, tournamentController.approveParticipant);
router.delete('/:id/participants/:participantId', authenticate, isTournamentHost, tournamentController.removeParticipant);

// Announcements
router.post('/:id/announcements', authenticate, isTournamentHost, validateAnnouncement, tournamentController.createAnnouncement);

// User-specific tournament routes
router.get('/me/hosting', authenticate, tournamentController.getHostedTournaments);
router.get('/me/participating', authenticate, tournamentController.getParticipatingTournaments);
router.get('/me/spectating', authenticate, tournamentController.getSpectatedTournaments);
 

export default router;