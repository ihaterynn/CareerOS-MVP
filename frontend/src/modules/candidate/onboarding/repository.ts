import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { AnswerValue, Fact, FactSource, DimensionId, IntakeSourceKind } from "./types";

type Db = SupabaseClient<Database>;
type FactRow = Database["public"]["Tables"]["candidate_profile_facts"]["Row"];

/**
 * Every read and write here goes through the request-scoped client, so RLS decides what is
 * visible. No function takes a candidate id — the database resolves it from the session via
 * current_candidate_id(). A candidate id crossing this boundary would be a bug.
 */

export function rowToFact(row: FactRow): Fact {
  return {
    id: row.id,
    dimension: row.dimension as DimensionId,
    key: row.key,
    label: row.label,
    value: row.value as AnswerValue,
    source: row.source as FactSource,
    confidence: Number(row.confidence),
    evidence: row.evidence ?? undefined,
    edited: row.edited || undefined,
    unit: row.unit ?? undefined
  };
}

/** Live facts only — superseded rows are history, not state. */
export async function loadFacts(db: Db): Promise<Fact[]> {
  const { data, error } = await db
    .from("candidate_profile_facts")
    .select("*")
    .is("superseded_by", null)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to load facts: ${error.message}`);
  return (data ?? []).map(rowToFact);
}

export type SessionRow = Database["public"]["Tables"]["candidate_onboarding_sessions"]["Row"];

export async function loadSession(db: Db): Promise<SessionRow | null> {
  const { data, error } = await db.from("candidate_onboarding_sessions").select("*").maybeSingle();
  if (error) throw new Error(`Failed to load onboarding session: ${error.message}`);
  return data;
}

/** Resolves the caller's candidate_profiles.id. Null when the user has no candidate profile. */
export async function currentCandidateId(db: Db): Promise<string | null> {
  const { data, error } = await db.rpc("current_candidate_id");
  if (error) throw new Error(`Failed to resolve candidate: ${error.message}`);
  return (data as string | null) ?? null;
}

export async function ensureSession(db: Db, sourceKind?: IntakeSourceKind): Promise<SessionRow> {
  const existing = await loadSession(db);
  if (existing) {
    if (sourceKind && existing.source_kind !== sourceKind) {
      const { data, error } = await db
        .from("candidate_onboarding_sessions")
        .update({ source_kind: sourceKind, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error) throw new Error(`Failed to update session: ${error.message}`);
      return data;
    }
    return existing;
  }

  const candidateId = await currentCandidateId(db);
  if (!candidateId) throw new Error("No candidate profile for the current user");

  const { data, error } = await db
    .from("candidate_onboarding_sessions")
    .insert({ candidate_id: candidateId, source_kind: sourceKind ?? null })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return data;
}

export type FactInput = {
  dimension: DimensionId;
  key: string;
  label: string;
  value: AnswerValue;
  source: FactSource;
  confidence?: number;
  evidence?: string;
  edited?: boolean;
  unit?: string;
};

/**
 * Append-only upsert. Superseding the previous live row and inserting its replacement has to be
 * one atomic step (see upsert_candidate_facts in the migration), so this delegates to the RPC
 * and gets the full live ledger back.
 */
export async function writeFacts(db: Db, inputs: FactInput[]): Promise<Fact[]> {
  if (inputs.length === 0) return loadFacts(db);

  const payload = inputs.map((input) => ({
    dimension: input.dimension,
    key: input.key,
    label: input.label,
    value: input.value,
    source: input.source,
    confidence: input.confidence ?? 1,
    evidence: input.evidence ?? null,
    edited: input.edited ?? false,
    unit: input.unit ?? null
  }));

  const { data, error } = await db.rpc("upsert_candidate_facts", { p_facts: payload as never });
  if (error) throw new Error(`Failed to write facts: ${error.message}`);
  return ((data ?? []) as FactRow[]).map(rowToFact);
}
