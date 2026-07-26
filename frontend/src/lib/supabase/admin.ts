import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";
import { requiredEnv } from "./server";

/**
 * RLS-BYPASSING client. Service-role key — never import this from a client component, and never
 * use it for candidate-scoped reads: the request client plus RLS is the correct path for those.
 *
 * Legitimate uses are only where a policy cannot express the need:
 *  - the public DNA share-token lookup (revamp spec §7.2)
 *  - the backend company-promotion job
 *  - seeding / maintenance scripts
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
