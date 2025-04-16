import { Router } from 'express';
import * as teamController from './controller';
import { authenticate } from '../../middlewares/auth';
import { 
  validateCreateTeam, 
  validateUpdateTeam, 
  validateInviteMember, 
  validateMemberRole 
} from './validators';
import { isTeamCaptain, isTeamMember } from '../../middlewares/permissions';

const router = Router();

// Public routes
router.get('/teams', teamController.getTeams);
router.get('/teams/:id', teamController.getTeamById);

// Protected routes - require authentication
router.post('/teams', authenticate, validateCreateTeam, teamController.createTeam);

// Team management (require team captain or above)
router.put('/teams/:id', authenticate, isTeamCaptain, validateUpdateTeam, teamController.updateTeam);
router.delete('/teams/:id', authenticate, isTeamCaptain, teamController.deleteTeam);

// Member management
router.post('/teams/:id/members', authenticate, isTeamCaptain, validateInviteMember, teamController.inviteMember);
router.delete('/teams/:id/members/:memberId', authenticate, isTeamCaptain, teamController.removeMember);
router.put('/teams/:id/members/:memberId/role', authenticate, isTeamCaptain, validateMemberRole, teamController.updateMemberRole);

// Team membership operations
router.post('/teams/:id/join', authenticate, teamController.joinTeam);
router.delete('/teams/:id/leave', authenticate, isTeamMember, teamController.leaveTeam);

// User specific team routes
router.get('/me/teams', authenticate, teamController.getMyTeams);

export default router;