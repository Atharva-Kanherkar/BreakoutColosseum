import { supabase } from  "../../lib/supabase";
import prisma from "../../lib/db"

export async function registerUser(email: string, password: string, name?: string) {
  // Create user in Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Failed to create user in authentication system');
  }

  // Create user in our database - note no role field
  const user = await prisma.user.create({
    data: {
      email,
      username: name || email.split('@')[0], 
      passwordHash: "[PLACEHOLDER]", // In reality, you'd store a hash from bcrypt
      supabaseId: authData.user.id,
    },
  });

  return { message: 'User registered successfully', userId: user.id };
}
export async function loginUser(email: string, password: string) {
  // Sign in with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }

  return true;
}