import { Request, Response, NextFunction } from 'express';

export function validateRegister(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  if (!email || !password) {
     res.status(400).json({ error: 'Email and password are required' });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
  }

  // Password strength validation
  if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
  }

  next();
}