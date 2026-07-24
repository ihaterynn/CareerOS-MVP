// ponytail: `import "server-only"` guard deferred — dep not installed and this module holds
// no secrets yet. Add it with the real Supabase server client (spec §0.1, PR #4).
import { trackerMock } from "./mock";
import type { TrackerData } from "./types";

// Typed server read. Returns mock now.
// TODO(backend): replace with RLS-scoped Supabase read of applications + status events.
export async function getTrackerData(): Promise<TrackerData> {
  return trackerMock;
}
