
import { supabase } from "./supabase";

/**
 * Creates a store for the authenticated user.
 * The database trigger should add the owner membership.
 */
export async function createStore(storeName, description = "") {
  const name = storeName?.trim();

  if (!name) {
    return {
      store: null,
      error: new Error("Please enter a store name."),
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { store: null, error: userError };
  }

  if (!user) {
    return {
      store: null,
      error: new Error("Please sign in before creating a store."),
    };
  }

  const { data: store, error } = await supabase
    .from("stores")
    .insert({
      owner_id: user.id,
      name,
      description: description.trim(),
    })
    .select("id, owner_id, name, description, created_at")
    .single();

  if (error) {
    return { store: null, error };
  }

  return { store, error: null };
}
