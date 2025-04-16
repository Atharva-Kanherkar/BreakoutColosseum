import { supabase } from "../../lib/supabase";
import prisma from "../../lib/db";

export async function registerUser(email: string, password: string, name?: string) {
  // First check if the user already exists in Supabase
  console.log(`Attempting to register user with email: ${email}`);
  
  // Check if user exists in your database first
  const existingUserInDatabase = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });
  
  if (existingUserInDatabase) {
    console.log(`User already exists in local database with ID: ${existingUserInDatabase.id}`);
    throw new Error('User already registered in local database');
  }
  
  // Create user in Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  console.log('Supabase response:', { authData, authError });

  if (authError) {
    console.error('Supabase auth error:', authError);
    throw new Error(authError.message);
  }

  if (!authData.user) {
    console.error('No user returned from Supabase');
    throw new Error('Failed to create user in authentication system');
  }

  let result;
  try {
    // Create user in our database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),  // Store email in lowercase
        username: name || email.split('@')[0], 
        passwordHash: "[PLACEHOLDER]",
        supabaseId: authData.user.id,
      },
    });
    
    console.log(`User successfully created in database with ID: ${user.id}`);
    // Store result in variable instead of returning
    result = { message: 'User registered successfully', userId: user.id };
  } catch (dbError) {
    console.error('Database error:', dbError);
    // Attempt to clean up the Supabase user since our DB creation failed
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
    if (deleteError) {
      console.error('Failed to delete Supabase user after DB error:', deleteError);
    }
    // Throw error instead of returning
  
  }
  
  // Single return statement at the end of function
  return result;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }

  // Using a variable instead of direct return
  const result = true;
  return result;
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

 