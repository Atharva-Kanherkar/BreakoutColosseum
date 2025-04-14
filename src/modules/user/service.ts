import prisma from '../../lib/db';
import { UserRole } from '@prisma/client';

interface UpdateUserData {
  username?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
}

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      // Exclude sensitive fields like supabaseId
    } as const,
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

export const updateUser = async (id: string, data: UpdateUserData) => {
  // Check if username is already taken if it's being updated
  if (data.username) {
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username }
    });
    
    if (existingUser && existingUser.id !== id) {
      throw new Error('Username is already taken');
    }
  }
  
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  });
};

export const getUsers = async (page = 1, limit = 10, search?: string) => {
  const skip = (page - 1) * limit;
  
  let whereClause = {};
  if (search) {
    whereClause = {
      OR: [
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    };
  }
  
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: whereClause }),
  ]);
  
  return {
    users,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
    }
  };
};

export const updateUserRole = async (id: string, role: UserRole) => {
  // Validate role is a valid enum value
  if (!Object.values(UserRole).includes(role)) {
    throw new Error('Invalid role');
  }
  
  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    }
  });
};