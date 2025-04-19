import prisma from '../../lib/db';

interface UpdateUserData {
  username?: string;
  avatar?: string;   // Note: add this to your schema
}

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,        // Note: add this to your schema
      createdAt: true,
      updatedAt: true,
      // Get hosted tournaments
      hostedTournaments: {
        select: { id: true },
        take: 3
      },
      // Get participations
      participation: {
        select: { id: true, tournamentId: true },
        take: 3
      },
      // Get spectated tournaments through the many-to-many relation
      spectatedTournaments: {
        select: { id: true },
        take: 3
      }
    }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Transform the result to include role indicators
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // Add role indicators
    isHost: user.hostedTournaments.length > 0,
    isParticipant: user.participation.length > 0,
    isSpectator: user.spectatedTournaments.length > 0,
    // Include some recent tournament data (optional)
    recentTournaments: {
      hosted: user.hostedTournaments.map(t => t.id),
      participating: user.participation.map(p => p.tournamentId),
      spectating: user.spectatedTournaments.map(t => t.id)
    }
  };
};

export const updateUser = async (id: string, data: UpdateUserData) => {
  // Check if username is already taken if it's being updated
  if (data.username) {
    const existingUser = await prisma.user.findFirst({
      where: { 
        username: data.username,
        id: { not: id } 
      }
    });
    
    if (existingUser) {
      throw new Error('Username is already taken');
    }
  }
  
  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      // Get hosted tournaments
      hostedTournaments: {
        select: { id: true },
        take: 3
      },
      // Get participations
      participation: {
        select: { id: true, tournamentId: true },
        take: 3
      },
      // Get spectated tournaments
      spectatedTournaments: {
        select: { id: true },
        take: 3
      }
    }
  });
  
  // Transform the result to include role indicators
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // Add role indicators
    isHost: user.hostedTournaments.length > 0,
    isParticipant: user.participation.length > 0,
    isSpectator: user.spectatedTournaments.length > 0,
    // Include some recent tournament data (optional)
    recentTournaments: {
      hosted: user.hostedTournaments.map(t => t.id),
      participating: user.participation.map(p => p.tournamentId),
      spectating: user.spectatedTournaments.map(t => t.id)
    }
  };
};

export const getUsers = async (page = 1, limit = 10, search?: string) => {
  const skip = (page - 1) * limit;
  
  let whereClause = {};
  if (search) {
    whereClause = {
      OR: [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    };
  }
  
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
        // Include counts to determine roles
        _count: {
          select: {
            hostedTournaments: true,
            participation: true,
            spectatedTournaments: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: whereClause }),
  ]);
  
  // Transform users to include role indicators
  const transformedUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    // Add role indicators based on relationship counts
    isHost: user._count.hostedTournaments > 0,
    isParticipant: user._count.participation > 0,
    isSpectator: user._count.spectatedTournaments > 0
  }));
  
  return {
    users: transformedUsers,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
    }
  };
};

 