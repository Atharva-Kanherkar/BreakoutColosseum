import { supabase } from "../../lib/supabase";
import prisma from "../../lib/db";

export async function registerUser(email: string, name: string, supabaseUid: string) {
  // Check if user exists in your database first
  const existingUserInDatabase = await prisma.user.findFirst({
    where: { 
      OR: [
        { email: email.toLowerCase() },
        { supabaseId: supabaseUid }
      ]
    }
  });
  
  if (existingUserInDatabase) {
    if (existingUserInDatabase.supabaseId === supabaseUid) {
      return { message: 'User already registered', userId: existingUserInDatabase.id };
    }
    throw new Error('User already registered with this email');
  }

  try {
    // Create user in our database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: name || email.split('@')[0],
        supabaseId: supabaseUid,
      },
    });
    
    console.log(`User successfully created in database with ID: ${user.id}`);
    return { message: 'User registered successfully', userId: user.id };
  } catch (dbError) {
    console.error('Database error:', dbError);
    throw dbError;
  }
}

export async function syncUser(supabaseUid: string, email: string) {
  // Find user by Supabase ID
  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUid },
  });
  
  if (user) {
    // User exists, update email if it changed
    if (user.email !== email.toLowerCase()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { email: email.toLowerCase() }
      });
    }
    return { userId: user.id };
  }
  
  // User doesn't exist in our DB, create them
  const newUser = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      username: email.split('@')[0],
      supabaseId: supabaseUid,
    },
  });
  
  return { userId: newUser.id };
}

export async function loginUser(email: string, password: string) {
  // We'll use Supabase directly from the frontend, this is just a stub
  throw new Error('Method not implemented - use Supabase client directly');
}

export async function logoutUser() {
  // We'll use Supabase directly from the frontend, this is just a stub
  throw new Error('Method not implemented - use Supabase client directly');
}

// Add this function to your service file
export async function linkWalletToUser(userId: string, walletAddress: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress }
    });
    
    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Error linking wallet:', error);
    throw new Error('Failed to link wallet to user');
  }
}