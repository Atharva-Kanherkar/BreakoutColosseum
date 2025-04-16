import { Router } from 'express';
import * as tournamentController from './controller';
import { authenticate } from '../../middlewares/auth';
import { 
  validateCreateTournament, 
  validateUpdateTournament,
  validateRegistration,
  validateTournamentStatus
} from './validators';
import { isTournamentHost } from '../../middlewares/permissions';

const router = Router();

// Public routes
router.get('/', tournamentController.getTournaments);
router.get('/:id', tournamentController.getTournamentById);
router.get('/:id/participants', tournamentController.getTournamentParticipants);
router.get('/:id/teams', tournamentController.getTournamentTeams);

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

// User-specific tournament routes
router.get('/me/hosting', authenticate, tournamentController.getHostedTournaments);
router.get('/me/participating', authenticate, tournamentController.getParticipatingTournaments);
router.get('/me/spectating', authenticate, tournamentController.getSpectatedTournaments);

export default router;