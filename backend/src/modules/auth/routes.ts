import { Router } from 'express';
import * as controller from './controller';
import { validateLogin, validateRegister } from './validators';

const router = Router();

router.post('/register', validateRegister, controller.register);
router.post('/login', validateLogin, controller.login);
router.post('/logout', controller.logout);

export default router;