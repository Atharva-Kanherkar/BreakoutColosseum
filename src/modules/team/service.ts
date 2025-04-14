import prisma from '../../lib/db';
import { TeamRole, TeamMember, Prisma } from '@prisma/client';

interface CreateTeamData {
  name: string;
  tag?: string;
  logo?: string;
  creatorId: string;
}

interface UpdateTeamData {
  name?: string;
  tag?: string | null;
  logo?: string | null;
}

export const createTeam = async (data: CreateTeamData) => {
  // Validate team name is unique
  const existingTeam = await prisma.team.findFirst({
    where: { name: data.name }
  });
  
  if (existingTeam) {
    throw new Error('Team name is already taken');
  }
  
  // Validate team tag is unique if provided
  if (data.tag) {
    const existingTeamTag = await prisma.team.findFirst({
      where: { tag: data.tag }
    });
    
    if (existingTeamTag) {
      throw new Error('Team tag is already taken');
    }
  }
  
  // Create team in transaction to ensure both team and owner membership are created
  return prisma.$transaction(async (tx) => {
    // Create the team
    const team = await tx.team.create({
      data: {
        name: data.name,
        tag: data.tag,
        logo: data.logo,
        creatorId: data.creatorId,
      }
    });
    
    // Add creator as team owner
    await tx.teamMember.create({
      data: {
        teamId: team.id,
        userId: data.creatorId,
        role: TeamRole.OWNER
      }
    });
    
    return team;
  });
};

export const getTeams = async (page = 1, limit = 10, search?: string) => {
  const skip = (page - 1) * limit;
  
  // Build where clause for search
  let whereClause: Prisma.TeamWhereInput = {};
  
  if (search) {
    whereClause = {
      OR: [
        { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        { tag: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
      ]
    };
  }
  
  const [teams, totalCount] = await Promise.all([
    prisma.team.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.team.count({ where: whereClause })
  ]);
  
  return {
    teams,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

export const getTeamById = async (id: string) => {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true
            }
          }
        }
      },
      participations: {
        include: {
          tournament: {
            select: {
              id: true,
              title: true,
              startDate: true,
              status: true
            }
          }
        },
        orderBy: { tournament: { startDate: 'desc' } },
        take: 10
      }
    }
  });
  
  return team;
};

export const updateTeam = async (id: string, userId: string, data: UpdateTeamData) => {
  // Check if team exists
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        where: {
          userId,
          role: {
            in: [TeamRole.OWNER, TeamRole.CAPTAIN]
          }
        }
      }
    }
  });
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  // Check if user has permissions (owner or captain)
  if (team.members.length === 0) {
    throw new Error('You do not have permission to update this team');
  }
  
  // Validate team name is unique if changing
  if (data.name && data.name !== team.name) {
    const existingTeam = await prisma.team.findFirst({
      where: {
        name: data.name,
        id: { not: id }
      }
    });
    
    if (existingTeam) {
      throw new Error('Team name is already taken');
    }
  }
  
  // Validate team tag is unique if changing
  if (data.tag && data.tag !== team.tag) {
    const existingTeamTag = await prisma.team.findFirst({
      where: {
        tag: data.tag,
        id: { not: id }
      }
    });
    
    if (existingTeamTag) {
      throw new Error('Team tag is already taken');
    }
  }
  
  // Update team
  return prisma.team.update({
    where: { id },
    data,
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true
        }
      }
    }
  });
};

export const deleteTeam = async (id: string, userId: string) => {
  // Check if team exists and user is owner
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        where: {
          userId,
          role: TeamRole.OWNER
        }
      },
      participations: {
        where: {
          tournament: {
            status: {
              in: ['ONGOING', 'UPCOMING']
            }
          }
        }
      }
    }
  });
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  // Check if user is team owner
  if (team.members.length === 0) {
    throw new Error('Only the team owner can delete the team');
  }
  
  // Check if team is in any active tournaments
  if (team.participations.length > 0) {
    throw new Error('Cannot delete team that is registered in active tournaments');
  }
  
  // Delete team (cascade will handle members)
  return prisma.team.delete({
    where: { id }
  });
};

export const inviteMember = async (teamId: string, inviterId: string, email: string, role: TeamRole = TeamRole.MEMBER) => {
  // Check if team exists and user has permissions
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        where: {
          userId: inviterId,
          role: {
            in: [TeamRole.OWNER, TeamRole.CAPTAIN]
          }
        }
      }
    }
  });
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  // Check if inviter has permissions
  if (team.members.length === 0) {
    throw new Error('You do not have permission to invite members to this team');
  }
  
  // Check if inviter has permissions to assign the requested role
  if (role === TeamRole.OWNER && team.members[0].role !== TeamRole.OWNER) {
    throw new Error('Only team owners can assign owner role');
  }
  
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    throw new Error('User not found with this email');
  }
  
  // Check if user is already a member
  const existingMembership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: user.id
      }
    }
  });
  
  if (existingMembership) {
    throw new Error('User is already a team member');
  }
  
  // Create team member record (in real app, might want to add invitation workflow)
  const teamMember = await prisma.teamMember.create({
    data: {
      teamId,
      userId: user.id,
      role
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          email: true
        }
      },
      team: {
        select: {
          id: true,
          name: true,
          tag: true
        }
      }
    }
  });
  
  // TODO: Send email notification to invited user
  
  return teamMember;
};

// This simulates accepting an invitation, but we're not tracking invitation state
// In a real app, you might have a TeamInvitation model to track pending invitations
export const acceptInvitation = async (teamId: string, userId: string) => {
  // In a real implementation, we would verify an invitation token or record
  // For now, just check if the membership exists
  
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId
      }
    }
  });
  
  if (!membership) {
    throw new Error('Team invitation not found or has expired');
  }
  
  // In a real app, would update invitation status here
  // For now, just return the membership
  
  return prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId
      }
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          tag: true,
          logo: true
        }
      },
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true
        }
      }
    }
  });
};

export const removeMember = async (teamId: string, memberId: string, requesterId: string) => {
  // Check if team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        where: {
          userId: requesterId,
          role: {
            in: [TeamRole.OWNER, TeamRole.CAPTAIN]
          }
        }
      }
    }
  });
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  // Check if requester has permissions
  if (team.members.length === 0) {
    throw new Error('You do not have permission to remove members from this team');
  }
  
  // Get member to remove
  const memberToRemove = await prisma.teamMember.findUnique({
    where: {
      id: memberId
    }
  });
  
  if (!memberToRemove) {
    throw new Error('Team member not found');
  }
  
  // Cannot remove owner unless requester is owner
  if (memberToRemove.role === TeamRole.OWNER && team.members[0].role !== TeamRole.OWNER) {
    throw new Error('Only team owners can remove other owners');
  }
  
  // Cannot remove self through this method (use leaveTeam instead)
  if (memberToRemove.userId === requesterId) {
    throw new Error('Cannot remove yourself. Use the leave team function instead.');
  }
  
  // Remove the member
  return prisma.teamMember.delete({
    where: { id: memberId }
  });
};

export const updateMemberRole = async (teamId: string, memberId: string, requesterId: string, role: TeamRole) => {
  // Check if team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: true
    }
  });
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  // Check if requester is team owner
  const requester = team.members.find(m => m.userId === requesterId);
  if (!requester || requester.role !== TeamRole.OWNER) {
    throw new Error('Only team owners can change member roles');
  }
  
  // Check if member exists
  const member = await prisma.teamMember.findUnique({
    where: { id: memberId }
  });
  
  if (!member) {
    throw new Error('Team member not found');
  }
  
  // Don't allow changing own role
  if (member.userId === requesterId) {
    throw new Error('Cannot change your own role');
  }
  
  // Update member role
  return prisma.teamMember.update({
    where: { id: memberId },
    data: { role },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true
        }
      }
    }
  });
};

export const getUserTeams = async (userId: string) => {
  const memberships = await prisma.teamMember.findMany({
    where: {
      userId
    },
    include: {
      team: {
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true
            }
          },
          _count: {
            select: {
              members: true
            }
          }
        }
      }
    },
    orderBy: {
      joinedAt: 'desc'
    }
  });
  
  return memberships.map(m => ({
    ...m.team,
    role: m.role,
    joinedAt: m.joinedAt
  }));
};

export const leaveTeam = async (teamId: string, userId: string) => {
  // Get team membership
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId
      }
    }
  });
  
  if (!membership) {
    throw new Error('You are not a member of this team');
  }
  
  // Check if user is owner
  if (membership.role === TeamRole.OWNER) {
    // Count other members
    const otherMembersCount = await prisma.teamMember.count({
      where: {
        teamId,
        userId: { not: userId }
      }
    });
    
    if (otherMembersCount > 0) {
      throw new Error('Team owners cannot leave while other members exist. Transfer ownership first or delete the team.');
    }
    
    // If owner is the last member, delete the team
    return prisma.team.delete({
      where: { id: teamId }
    });
  }
  
  // Otherwise just remove the membership
  return prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId
      }
    }
  });
};