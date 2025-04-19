import { Router } from 'express';
import * as userController from './controller';
import { authenticate } from '../../middlewares/auth';
import { isSystemAdmin } from '../../middlewares/permissions';
import { validateUpdateProfile } from './validators';

const router = Router();

// Public routes - none for users module

// Protected routes - require authentication
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validateUpdateProfile, userController.updateProfile);
// Get tournaments a user is involved with (combined view)
// router.get('/me/tournaments', authenticate, userController.getUserTournaments);
 

// Admin routes - system admins only (special flag in user model)
router.get('/users', authenticate, isSystemAdmin, userController.getUsers);
router.get('/users/:id', authenticate, isSystemAdmin, userController.getUserById);
  
export default router;