"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "./supabase/server";

export type AuthResult = { ok: true } | { ok: false; error: string };

/**
 * Signs the candidate in and routes on their real onboarding state. The destination is decided
 * here, on the server, from the database — never from a client-held flag.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Deliberately generic: distinguishing "no such user" from "wrong password" is an
    // account-enumeration oracle.
    return { ok: false, error: "That email and password combination didn't work." };
  }

  const { data: session } = await supabase
    .from("candidate_onboarding_sessions")
    .select("completed_at, skipped_at")
    .maybeSingle();

  const done = Boolean(session?.completed_at) || Boolean(session?.skipped_at);
  revalidatePath("/", "layout");
  redirect(done ? "/candidate/tracker" : "/onboarding");
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
