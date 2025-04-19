import { Request, Response } from 'express';
import * as service from './service';
import prisma from '../../lib/db';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import jwt, { JwtPayload } from 'jsonwebtoken'; // Add JwtPayload here
import dotenv from 'dotenv';
import { supabase } from '../../lib/supabase';

// Define your custom payload interface
interface WalletAuthPayload extends JwtPayload {
  walletAddress: string;
  temp?: boolean;
  userId?: string;
}

dotenv.config();

dotenv.config();
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, supabase_uid } = req.body;
    
    if (!email || !supabase_uid) {
      res.status(400).json({ error: 'Email and Supabase ID are required' });
      return;
    }
    
    const result = await service.registerUser(email, name, supabase_uid);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

export const sync = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, email } = req.body;
    
    if (!user_id || !email) {
      res.status(400).json({ error: 'User ID and email are required' });
      return;
    }
    
    const result = await service.syncUser(user_id, email);
    res.json(result);
  } catch (error: any) {
    console.error('User sync error:', error);
    res.status(500).json({ error: error.message || 'User sync failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  res.status(400).json({ error: 'Use Supabase client directly for authentication' });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(400).json({ error: 'Use Supabase client directly for authentication' });
};

export const walletAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { wallet_address, signature, message, nonce } = req.body;
    
    if (!wallet_address || !signature || !message) {
      res.status(400).json({ error: 'Wallet address, signature and message are required' });
      return;
    }
    
    // Verify signature here (this requires Solana web3.js)
    // This is pseudo-code - implement the actual verification
    const isSignatureValid = await verifySignature(wallet_address, signature, message);
    
    if (!isSignatureValid) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }
    
    // Check if wallet already exists in your database
    const existingUser = await prisma.user.findFirst({
      where: { walletAddress: wallet_address }
    });
    
    if (existingUser) {
      // Generate a session for existing user
      // This is where you would create a Supabase session or JWT
      const token = generateToken(existingUser);
      res.status(200).json({ token, userId: existingUser.id });
      return;
    }
    
    // For new wallets, generate a temporary token for email connection
    const tempToken = generateTempToken(wallet_address);
    res.status(200).json({ 
      token: tempToken,
      isNewUser: true 
    });
    
  } catch (error: any) {
    console.error('Wallet authentication error:', error);
    res.status(500).json({ error: error.message || 'Wallet authentication failed' });
  }
};
// Verify Solana wallet signature
async function verifySignature(
  walletAddress: string, 
  signature: string, 
  message: string
): Promise<boolean> {
  try {
    const publicKey = new PublicKey(walletAddress);
    
    // Convert base64 signature to Uint8Array
    const signatureUint8 = Uint8Array.from(
      atob(signature), c => c.charCodeAt(0)
    );
    
    // Convert message to Uint8Array
    const messageUint8 = new TextEncoder().encode(message);
    
    // Verify the signature
    return nacl.sign.detached.verify(
      messageUint8,
      signatureUint8,
      publicKey.toBytes()
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Generate JWT for authenticated user
function generateToken(user: any): string {
  const payload: WalletAuthPayload = { 
    walletAddress: user.walletAddress,
    userId: user.id
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
}

// Generate temporary token for wallet connection flow
function generateTempToken(walletAddress: string): string {
  const payload: WalletAuthPayload = {
    walletAddress,
    temp: true 
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
}
// Add this function to link wallet to existing email account
export const linkWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tempToken, email, password } = req.body;
    
    if (!tempToken || !email || !password) {
      res.status(400).json({ error: 'Token, email and password are required' });
      return;
    }
    
    // Verify the temporary token
    let decodedToken: WalletAuthPayload;
    try {
      const verifiedToken = jwt.verify(tempToken, process.env.JWT_SECRET || 'your-secret-key');
      
      // Type guard to ensure it's an object with walletAddress
      if (typeof verifiedToken === 'string' || !('walletAddress' in verifiedToken)) {
        res.status(401).json({ error: 'Invalid token format' });
        return;
      }
      
      decodedToken = verifiedToken as WalletAuthPayload;
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    
    if (!decodedToken.walletAddress || !decodedToken.temp) {
      res.status(401).json({ error: 'Invalid token type' });
      return;
    }
    
    // Authenticate user with Supabase
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error || !user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    
    // Find the user in our database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    });
    
    if (!dbUser) {
      res.status(401).json({ error: 'User not found in system' });
      return;
    }
    
    // Link wallet to user
    await service.linkWalletToUser(dbUser.id, decodedToken.walletAddress);
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Wallet linking error:', error);
    res.status(500).json({ error: error.message || 'Failed to link wallet' });
  }
};