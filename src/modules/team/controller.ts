import { Request, Response } from 'express';
import * as teamService from './service';
import { TeamRole } from '@prisma/client';

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, tag, logo } = req.body;
    const creatorId = req.user!.id;
    
    const team = await teamService.createTeam({
      name,
      tag,
      logo,
      creatorId
    });
    
    res.status(201).json(team);
  } catch (error: any) {
    console.error('Error creating team:', error);
    res.status(400).json({ error: error.message || 'Failed to create team' });
  }
};

export const getTeams = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    const teams = await teamService.getTeams(page, limit, search);
    res.json(teams);
  } catch (error: any) {
    console.error('Error getting teams:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch teams' });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const team = await teamService.getTeamById(id);
    
    if (!team) {
        res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(team);
  } catch (error: any) {
    console.error('Error getting team by ID:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch team' });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, tag, logo } = req.body;
    const userId = req.user!.id;
    
    const team = await teamService.updateTeam(id, userId, {
      name,
      tag,
      logo
    });
    
    res.json(team);
  } catch (error: any) {
    console.error('Error updating team:', error);
    res.status(400).json({ error: error.message || 'Failed to update team' });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    await teamService.deleteTeam(id, userId);
    res.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting team:', error);
    res.status(400).json({ error: error.message || 'Failed to delete team' });
  }
};

export const inviteMember = async (req: Request, res: Response) => {
  try {
    const { id: teamId } = req.params;
    const { email, role } = req.body;
    const inviterId = req.user!.id;
    
    const invitation = await teamService.inviteMember(teamId, inviterId, email, role as TeamRole);
    res.status(201).json(invitation);
  } catch (error: any) {
    console.error('Error inviting team member:', error);
    res.status(400).json({ error: error.message || 'Failed to invite team member' });
  }
};

export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.user!.id;
    
    const membership = await teamService.acceptInvitation(teamId, userId);
    res.json(membership);
  } catch (error: any) {
    console.error('Error accepting team invitation:', error);
    res.status(400).json({ error: error.message || 'Failed to accept team invitation' });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    const requesterId = req.user!.id;
    
    await teamService.removeMember(teamId, memberId, requesterId);
    res.json({ message: 'Team member removed successfully' });
  } catch (error: any) {
    console.error('Error removing team member:', error);
    res.status(400).json({ error: error.message || 'Failed to remove team member' });
  }
};

export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    const { role } = req.body;
    const requesterId = req.user!.id;
    
    const membership = await teamService.updateMemberRole(
      teamId, 
      memberId, 
      requesterId, 
      role as TeamRole
    );
    
    res.json(membership);
  } catch (error: any) {
    console.error('Error updating team member role:', error);
    res.status(400).json({ error: error.message || 'Failed to update team member role' });
  }
};

export const getMyTeams = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const teams = await teamService.getUserTeams(userId);
    res.json(teams);
  } catch (error: any) {
    console.error('Error getting user teams:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user teams' });
  }
};

export const leaveTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.user!.id;
    
    await teamService.leaveTeam(teamId, userId);
    res.json({ message: 'Successfully left team' });
  } catch (error: any) {
    console.error('Error leaving team:', error);
    res.status(400).json({ error: error.message || 'Failed to leave team' });
  }
};