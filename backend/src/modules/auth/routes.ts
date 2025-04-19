import { Router } from 'express';
import * as controller from './controller';
import { validateRegister } from './validators';
import { authenticateSupabase } from '../../middlewares/auth';

const router = Router();

router.post('/register', validateRegister, controller.register);
router.post('/sync', authenticateSupabase, controller.sync);

// These routes are kept for backward compatibility but should be deprecated
router.post('/login', controller.login);
router.post('/logout', controller.logout);
// Add this route
router.post('/wallet-auth', controller.walletAuth);
router.post('/link-wallet', controller.linkWallet);
export default router;