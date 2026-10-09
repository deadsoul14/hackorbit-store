
import { supabase } from "./supabase";

export async function signUp(email, password) {
  return await supabase.auth.signUp({
    email,
    password,
  });
}

export async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error };
  }

  return { user: data.user, error: null };
}

export async function signOut() {
  return await supabase.auth.signOut();
}
