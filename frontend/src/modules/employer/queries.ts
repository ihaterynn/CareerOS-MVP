import { mapCvIngestionRecord, type SupabaseCvIngestionRow } from "../backend-data";
import { fetchSupabaseRows, isUuid, optionalServerEnv } from "../supabase-server";
import type { ExtractedCv } from "./ingestion-data";

export async function getCvIngestionRecords(): Promise<ExtractedCv[]> {
  const employerId = optionalServerEnv("CAREEROS_EMPLOYER_ID");
  if (!employerId || !isUuid(employerId)) return [];

  const rows = await fetchSupabaseRows<SupabaseCvIngestionRow>(
    `cv_ingestion_records?employer_id=eq.${encodeURIComponent(employerId)}&select=id,name,source,role,location,years,skills,confidence,status&order=created_at.asc`
  );
  return rows.map(mapCvIngestionRecord);
}
