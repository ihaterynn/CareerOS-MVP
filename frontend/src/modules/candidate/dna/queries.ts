// ponytail: `import "server-only"` deferred with the real Supabase client (spec §0.1, PR #4).
import { dnaMock } from "./mock";
import type { DnaData } from "./types";

// TODO(backend): RLS-scoped read of dna_profiles + assessments.
export async function getDnaData(): Promise<DnaData> {
  return dnaMock;
}
