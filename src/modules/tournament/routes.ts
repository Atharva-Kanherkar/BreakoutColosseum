import { Router } from 'express';
import * as tournamentController from './controller';
import { authenticate } from '../../middlewares/auth';
import { requireOrganizer } from '../../middlewares/roles';
import { validateCreateTournament, validateUpdateTournament, validateRegistration } from "./validators";
import { requireTournamentOwner } from '../../middlewares/tournament';

const router = Router();

// Public routes
router.get('/tournaments', tournamentController.getTournaments);
router.get('/tournaments/:id', tournamentController.getTournamentById);
router.get('/tournaments/:id/participants', tournamentController.getTournamentParticipants);

// Protected routes - require authentication
router.post('/tournaments', authenticate, requireOrganizer, validateCreateTournament, tournamentController.createTournament);
router.put('/tournaments/:id', authenticate, requireTournamentOwner, validateUpdateTournament, tournamentController.updateTournament);
router.delete('/tournaments/:id', authenticate, requireTournamentOwner, tournamentController.deleteTournament);
router.post('/tournaments/:id/start', authenticate, requireTournamentOwner, tournamentController.startTournament);
router.post('/tournaments/:id/register', authenticate, validateRegistration, tournamentController.registerParticipant);
router.post('/tournaments/:id/register/team', authenticate, validateRegistration, tournamentController.registerTeam);

export default router;