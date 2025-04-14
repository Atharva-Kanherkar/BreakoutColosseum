import { Router } from 'express';
import * as matchController from './controller';
import { authenticate } from '../../middlewares/auth';
import { requireJudgeOrAdmin } from '../../middlewares/roles';
import { validateMatchResult, validateDispute, validateSchedule } from "./validators";

const router = Router();

// Public routes
router.get('/matches/:id', matchController.getMatchById);
router.get('/tournaments/:tournamentId/matches', matchController.getTournamentMatches);
router.get('/tournaments/:tournamentId/bracket', matchController.getTournamentBracket);

// Protected routes - require authentication
router.post('/matches/:id/report', authenticate, validateMatchResult, matchController.reportMatchResult);
// router.post('/matches/:id/dispute', authenticate, validateDispute, matchController.disputeMatchResult);

// Admin/judge routes
router.put('/matches/:id/verify', authenticate, requireJudgeOrAdmin, validateMatchResult, matchController.verifyMatchResult);
router.put('/matches/:id/schedule', authenticate, requireJudgeOrAdmin, validateSchedule, matchController.updateMatchSchedule);

export default router;