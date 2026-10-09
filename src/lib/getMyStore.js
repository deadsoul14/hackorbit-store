
import { supabase } from "./supabase";

export async function getMyStore() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { store: null, error: userError };
  }

  if (!user) {
    return { store: null, error: null };
  }

  const { data, error } = await supabase
    .from("stores")
    .select("id, owner_id, name, description, created_at")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    return { store: null, error };
  }

  return { store: data, error: null };
}
