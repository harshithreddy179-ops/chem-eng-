import "server-only";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getServerClient } from "@/lib/supabase/server";

export interface AdminContext {
  user: User;
  supabase: SupabaseClient;
}

/**
 * Server-side admin check: a valid Supabase session AND a row in
 * public.admins (via the SECURITY DEFINER is_admin() function).
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) return null;
  return { user, supabase };
}

/** For admin pages: redirects to the login screen when not an admin. */
export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) {
    const supabase = await getServerClient();
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;
    redirect(user ? "/admin/login?error=unauthorized" : "/admin/login");
  }
  return ctx;
}
