import { Request, Response } from 'express';
import * as service from './service';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await service.registerUser(email, password);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await service.loginUser(email, password);
    res.json(result);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message || 'Login failed' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    await service.logoutUser();
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message || 'Logout failed' });
  }
};