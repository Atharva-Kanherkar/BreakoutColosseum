import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import prisma from '../lib/db';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Find the user in our database
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user?.id },
    });

    if (!dbUser) {
       res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = dbUser;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}