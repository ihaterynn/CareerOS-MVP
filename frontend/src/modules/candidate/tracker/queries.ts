import { mapCandidateApplication, type SupabaseApplicationRow } from "../../backend-data";
import { fetchSupabaseRows, isUuid, optionalServerEnv } from "../../supabase-server";
import { trackerDataOrMock } from "./mock";
import type { TrackerData } from "./types";

export async function getTrackerData(): Promise<TrackerData> {
  const candidateId = optionalServerEnv("CAREEROS_CANDIDATE_ID");
  if (!candidateId || !isUuid(candidateId)) return trackerDataOrMock([]);

  const rows = await fetchSupabaseRows<SupabaseApplicationRow>(
    `candidate_applications?candidate_id=eq.${encodeURIComponent(candidateId)}&select=id,status,submitted_at,resume_version,next_step,job:job_listings(title,company,location,salary,mode,match_overall)&order=submitted_at.desc`
  );
  return trackerDataOrMock(rows.map(mapCandidateApplication));
}
