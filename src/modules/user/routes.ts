import { Router } from 'express';
import * as userController from './controller';
import { authenticate } from '../../middlewares/auth';
import { requireAdmin } from '../../middlewares/roles';
import { validateUpdateProfile, validateUserRole } from './validators';

const router = Router();

// Public routes - none for users module

// Protected routes - require authentication
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validateUpdateProfile, userController.updateProfile);

// Admin routes - require admin role
router.get('/users', authenticate, requireAdmin, userController.getUsers);
router.get('/users/:id', authenticate, requireAdmin, userController.getUserById);
router.put('/users/:id/role', authenticate, requireAdmin, validateUserRole, userController.updateUserRole);

export default router;