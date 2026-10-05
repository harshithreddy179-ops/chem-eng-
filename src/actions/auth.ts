"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerClient } from "@/lib/supabase/server";
import type { ActionState } from "./types";

const credentials = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  next: z.string().optional(),
});

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid credentials." };
  }
  const supabase = await getServerClient();
  if (!supabase) return { ok: false, message: "Supabase is not configured. Add the environment variables first." };

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { ok: false, message: "Those credentials were not recognised." };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { ok: false, message: "This account is not authorised to administer the archive." };
  }

  const next = parsed.data.next && parsed.data.next.startsWith("/admin") && !parsed.data.next.startsWith("//") ? parsed.data.next : "/admin";
  redirect(next);
}

export async function signOut() {
  const supabase = await getServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
