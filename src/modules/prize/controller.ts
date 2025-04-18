import { Request, Response } from 'express';
import * as prizeService from './service';
import prisma from '../../lib/db';

/**
 * Get prize information for a tournament
 */
export const getTournamentPrize = async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    
    const prizeInfo = await prisma.tournamentPrize.findUnique({
      where: { tournamentId },
      include: {
        payouts: {
          orderBy: { createdAt: 'desc' },
        }
      }
    });
    
    if (!prizeInfo) {
        res.status(404).json({ error: 'No prize information found for this tournament' });
    }
    
    res.json(prizeInfo);
  } catch (error: any) {
    console.error('Error fetching tournament prize info:', error);
    res.status(500).json({ error: 'Failed to fetch prize information' });
  }
};

/**
 * Get prize payment history for a tournament
 */
export const getPrizePayments = async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    
    // Validate tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    });
    
    if (!tournament) {
        res.status(404).json({ error: 'Tournament not found' });
    }
    
    // Get prize for tournament
    const prize = await prisma.tournamentPrize.findUnique({
      where: { tournamentId }
    });
    
    if (!prize) {
        res.status(404).json({ error: 'No prize information found for this tournament' });
    }
    
    // Get payments
    const payments = await prisma.prizePayment.findMany({
      where: { tournamentPrizeId: prize?.id },
      orderBy: { createdAt: 'desc' },
      include: {
        team: {
          select: { id: true, name: true }
        },
        participant: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true }
            }
          }
        }
      }
    });
    
    res.json(payments);
  } catch (error: any) {
    console.error('Error fetching prize payments:', error);
    res.status(500).json({ error: 'Failed to fetch prize payments' });
  }
};

/**
 * Verify a Solana payment transaction
 * This endpoint can be used by frontend to confirm if a transaction is valid
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { transactionSignature, expectedAmount, tokenType, tokenAddress } = req.body;
    
    if (!transactionSignature) {
        res.status(400).json({ error: 'Transaction signature is required' });
    }
    
    if (!expectedAmount) {
        res.status(400).json({ error: 'Expected amount is required' });
    }
    
    const isValid = await prizeService.verifyEntryFeePayment(
      transactionSignature,
      expectedAmount,
      tokenType || 'SOL',
      tokenAddress
    );
    
    res.json({ isValid });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};