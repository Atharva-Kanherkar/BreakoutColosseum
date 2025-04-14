import { Request, Response } from 'express';
import * as userService from './service';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await userService.getUserById(userId);
    res.json(user);
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { username, displayName, bio, avatar } = req.body;
    const updatedUser = await userService.updateUser(userId, {
      username,
      displayName,
      bio,
      avatar
    });
    res.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(400).json({ error: error.message || 'Failed to update profile' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    const users = await userService.getUsers(page, limit, search);
    res.json(users);
  } catch (error: any) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
        res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error: any) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const updatedUser = await userService.updateUserRole(id, role);
    res.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user role:', error);
    res.status(400).json({ error: error.message || 'Failed to update user role' });
  }
};