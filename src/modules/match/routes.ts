import { Router } from 'express';
import * as matchController from './controller';
import { authenticate } from '../../middlewares/auth';
import { 
  validateCreateMatch, 
  validateUpdateMatch,
  validateMatchResult,
  validateDisputeReason,
  validateJudgeAssignment,
  validateReschedule
} from './validators';
import { isTournamentHost } from '../../middlewares/permissions';

const router = Router();

// Public routes
router.get('/', matchController.getMatches);
router.get('/:id', matchController.getMatchById);
router.get('/tournament/:tournamentId', matchController.getTournamentMatches);

// Protected routes - require authentication
router.post('/', authenticate, isTournamentHost, validateCreateMatch, matchController.createMatch);
router.put('/:id', authenticate, isTournamentHost, validateUpdateMatch, matchController.updateMatch);

// Match flow management
router.post('/:id/start', authenticate, matchController.startMatch);
router.post('/:id/cancel', authenticate, matchController.cancelMatch);
router.post('/:id/result', authenticate, validateMatchResult, matchController.submitMatchResult);
router.post('/:id/dispute', authenticate, validateDisputeReason, matchController.disputeMatchResult);
router.post('/:id/resolve-dispute', authenticate, validateMatchResult, matchController.resolveDispute);
router.post('/:id/judge', authenticate, validateJudgeAssignment, matchController.assignJudge);
router.post('/:id/reschedule', authenticate, validateReschedule, matchController.rescheduleMatch);

// Bracket generation
router.post('/tournament/:tournamentId/generate-bracket', authenticate, isTournamentHost, matchController.generateBracket);

// User-specific match routes
router.get('/me/matches', authenticate, matchController.getUserMatches);

export default router;