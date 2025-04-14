import { Request, Response, NextFunction } from 'express';
import { TeamRole } from '@prisma/client';

export const validateCreateTeam = (req: Request, res: Response, next: NextFunction) => {
  const { name, tag, logo } = req.body;
  
  // Name validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Team name is required' });
  }
  
  if (name.length < 3 || name.length > 50) {
      res.status(400).json({ error: 'Team name must be between 3 and 50 characters' });
  }
  
  // Tag validation (optional)
  if (tag !== undefined && tag !== null) {
    if (typeof tag !== 'string') {
        res.status(400).json({ error: 'Team tag must be a string' });
    }
    
    if (tag && (tag.length < 2 || tag.length > 10)) {
        res.status(400).json({ error: 'Team tag must be between 2 and 10 characters' });
    }
  }
  
  // Logo validation (optional)
  if (logo !== undefined && logo !== null) {
    if (typeof logo !== 'string') {
        res.status(400).json({ error: 'Logo URL must be a string' });
    }
    
    if (logo && logo.length > 255) {
        res.status(400).json({ error: 'Logo URL cannot exceed 255 characters' });
    }
    
    // Optional: URL validation
    // if (logo && !isValidURL(logo)) {
    //   return res.status(400).json({ error: 'Logo must be a valid URL' });
    // }
  }
  
  next();
};

export const validateUpdateTeam = (req: Request, res: Response, next: NextFunction) => {
  const { name, tag, logo } = req.body;
  
  // All fields are optional for update, but validate them if provided
  
  // Name validation (if provided)
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Team name cannot be empty' });
    }
    
    if (name.length < 3 || name.length > 50) {
        res.status(400).json({ error: 'Team name must be between 3 and 50 characters' });
    }
  }
  
  // Tag validation (optional)
  if (tag !== undefined) {
    if (tag !== null && typeof tag !== 'string') {
        res.status(400).json({ error: 'Team tag must be a string or null' });
    }
    
    if (tag && (tag.length < 2 || tag.length > 10)) {
        res.status(400).json({ error: 'Team tag must be between 2 and 10 characters' });
    }
  }
  
  // Logo validation (optional)
  if (logo !== undefined) {
    if (logo !== null && typeof logo !== 'string') {
        res.status(400).json({ error: 'Logo URL must be a string or null' });
    }
    
    if (logo && logo.length > 255) {
        res.status(400).json({ error: 'Logo URL cannot exceed 255 characters' });
    }
  }
  
  next();
};

export const validateInviteMember = (req: Request, res: Response, next: NextFunction) => {
  const { email, role } = req.body;
  
  // Email validation
  if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Valid email is required' });
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Role validation (optional)
  if (role !== undefined) {
    if (!Object.values(TeamRole).includes(role)) {
        res.status(400).json({ 
        error: `Role must be one of: ${Object.values(TeamRole).join(', ')}` 
      });
    }
  }
  
  next();
};

export const validateMemberRole = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.body;
  
  if (!role) {
      res.status(400).json({ error: 'Role is required' });
  }
  
  if (!Object.values(TeamRole).includes(role)) {
      res.status(400).json({ 
      error: `Role must be one of: ${Object.values(TeamRole).join(', ')}` 
    });
  }
  
  next();
};