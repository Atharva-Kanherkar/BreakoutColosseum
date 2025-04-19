import express from 'express';
import * as prizeController from './controller';
import { authenticate } from '../../middlewares/auth';

const router = express.Router();

// Get prize info for a tournament
router.get('/tournament/:tournamentId', prizeController.getTournamentPrize);

// Get prize payment history for a tournament
router.get('/tournament/:tournamentId/payments', authenticate, prizeController.getPrizePayments);

// Verify a payment transaction
router.post('/verify', authenticate, prizeController.verifyPayment);

export default router;