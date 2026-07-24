// ponytail: `import "server-only"` deferred with the real Supabase client (spec §0.1, PR #4).
import { studioMock } from "./mock";
import type { StudioData } from "./types";

// TODO(backend): use applicationId to load the linked résumé version + target JD +
// ATS analysis. Mock ignores it and returns a fixed dataset.
export async function getStudioData(applicationId?: string): Promise<StudioData> {
  void applicationId;
  return studioMock;
}
