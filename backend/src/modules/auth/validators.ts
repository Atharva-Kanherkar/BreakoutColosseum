import { Request, Response, NextFunction } from 'express';

 

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { email, supabase_uid } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  if (!supabase_uid) {
    res.status(400).json({ error: 'Supabase ID is required' });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  next();
};

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
  }

  next();
}