"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "./supabase/server";

export type AuthResult = { ok: true; redirectTo: string } | { ok: false; error: string };

/**
 * Signs the candidate in and decides where they land, on the server, from the database — never
 * from a client-held flag.
 *
 * It returns the destination rather than calling redirect(): redirect() throws NEXT_REDIRECT, and
 * a caller awaiting the return value sees that as "an unexpected response was received from the
 * server". The caller navigates instead. The gate itself is middleware, so returning a path here
 * grants nothing.
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
  return { ok: true, redirectTo: done ? "/candidate/tracker" : "/onboarding" };
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
