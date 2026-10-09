
import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Supabase connection test failed:", error.message);
      return false;
    }

    console.log("Supabase client initialized successfully.");
    console.log(
      "Session status:",
      data.session ? "Signed in" : "Not signed in"
    );

    return true;
  } catch (error) {
    console.error("Supabase test error:", error.message);
    return false;
  }
}
