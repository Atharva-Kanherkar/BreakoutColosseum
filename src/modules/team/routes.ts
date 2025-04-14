import { Router } from 'express';
import * as teamController from './controller';
import { authenticate } from '../../middlewares/auth';
import { validateCreateTeam, validateUpdateTeam, validateInviteMember, validateMemberRole } from './validators';
import { requireTeamPermission } from '../../middlewares/team';

const router = Router();

// Public routes
router.get('/teams', teamController.getTeams);
router.get('/teams/:id', teamController.getTeamById);

// Protected routes - require authentication
router.post('/teams', authenticate, validateCreateTeam, teamController.createTeam);
router.put('/teams/:id', authenticate, validateUpdateTeam, teamController.updateTeam);
router.delete('/teams/:id', authenticate, teamController.deleteTeam);

router.post('/teams/:id/members', authenticate, validateInviteMember, teamController.inviteMember);
router.put('/teams/:teamId/accept', authenticate, teamController.acceptInvitation);
router.delete('/teams/:teamId/members/:memberId', authenticate, teamController.removeMember);
router.put('/teams/:teamId/members/:memberId/role', authenticate, validateMemberRole, teamController.updateMemberRole);

router.get('/me/teams', authenticate, teamController.getMyTeams);
router.delete('/teams/:teamId/leave', authenticate, teamController.leaveTeam);

export default router;