import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
  const { username, displayName, bio, avatar } = req.body;
  
  // Username validation
  if (username !== undefined) {
    if (typeof username !== 'string') {
        res.status(400).json({ error: 'Username must be a string' });
    }
    
    if (username && (username.length < 3 || username.length > 30)) {
        res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
    }
    
    // Check for valid characters (alphanumeric, underscore, hyphen)
    if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
        res.status(400).json({ 
        error: 'Username may only contain letters, numbers, underscores, and hyphens' 
      });
    }
  }
  
  // Display name validation
  if (displayName !== undefined && displayName !== null) {
    if (typeof displayName !== 'string') {
        res.status(400).json({ error: 'Display name must be a string' });
    }
    
    if (displayName && displayName.length > 50) {
        res.status(400).json({ error: 'Display name cannot exceed 50 characters' });
    }
  }
  
  // Bio validation
  if (bio !== undefined && bio !== null) {
    if (typeof bio !== 'string') {
        res.status(400).json({ error: 'Bio must be a string' });
    }
    
    if (bio && bio.length > 500) {
        res.status(400).json({ error: 'Bio cannot exceed 500 characters' });
    }
  }
  
  // Avatar URL validation
  if (avatar !== undefined && avatar !== null) {
    if (typeof avatar !== 'string') {
        res.status(400).json({ error: 'Avatar must be a URL string' });
    }
    
    if (avatar && avatar.length > 255) {
        res.status(400).json({ error: 'Avatar URL cannot exceed 255 characters' });
    }
    
    // Optional: URL validation
    // if (avatar && !isValidURL(avatar)) {
    //   return res.status(400).json({ error: 'Avatar must be a valid URL' });
    // }
  }
  
  next();
};

export const validateUserRole = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.body;
  
  if (!role) {
      res.status(400).json({ error: 'Role is required' });
  }
  
  if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ 
      error: `Role must be one of: ${Object.values(UserRole).join(', ')}` 
    });
  }
  
  next();
};