"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeCoverage, factFromAnswer } from "./engine";
import { GAP_BANK } from "./mock";
import { ensureSession, loadFacts, loadSession, writeFacts } from "./repository";
import {
  answerFitsControl,
  parseFactRef,
  parseSetVisibility,
  parseSubmitAnswer,
  type Result
} from "./schema";
import type { Fact, SessionPatch, TurnRecord } from "./types";

/**
 * Mutations for the onboarding flow. Every one of them:
 *  - runs as the signed-in candidate through RLS (no candidate id crosses the wire),
 *  - validates its input before touching the database,
 *  - returns the full live ledger + recomputed coverage so the client reconciles without refetching.
 */

async function patchFrom(facts: Fact[]): Promise<SessionPatch> {
  return { facts, coverage: computeCoverage(facts), nextTurn: null };
}

function fail(error: string): Result<SessionPatch> {
  return { ok: false, error };
}

export async function submitAnswer(input: unknown): Promise<Result<SessionPatch>> {
  const parsed = parseSubmitAnswer(input);
  if (!parsed.ok) return parsed;

  // The turn must exist in the server-side bank — a client cannot invent a question and thereby
  // write an arbitrary fact key.
  const turn = GAP_BANK.find((entry) => entry.id === parsed.data.turnId);
  if (!turn) return fail("Unknown question");

  const fits = answerFitsControl(turn.control, parsed.data.value);
  if (!fits.ok) return fits;

  const db = await createSupabaseServerClient();
  const fact = factFromAnswer(turn, fits.data);

  try {
    const facts = await writeFacts(db, [
      {
        dimension: fact.dimension,
        key: fact.key,
        label: fact.label,
        value: fact.value,
        source: fact.source,
        unit: fact.unit
      }
    ]);
    return { ok: true, data: await patchFrom(facts) };
  } catch (error) {
    return fail(message(error));
  }
}

export async function confirmFacts(input: unknown): Promise<Result<SessionPatch>> {
  if (typeof input !== "object" || input === null) return fail("Expected an object");
  const ids = (input as { factIds?: unknown }).factIds;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
    return fail("factIds must be a list of ids");
  }

  const db = await createSupabaseServerClient();
  try {
    const current = await loadFacts(db);
    const targets = current.filter((fact) => (ids as string[]).includes(fact.id));
    if (targets.length === 0) return { ok: true, data: await patchFrom(current) };

    const facts = await writeFacts(
      db,
      targets.map((fact) => ({
        dimension: fact.dimension,
        key: fact.key,
        label: fact.label,
        value: fact.value,
        // Confirming vouches for the value; it is not an edit, so `edited` stays false.
        source: "confirmed" as const,
        confidence: 1,
        evidence: fact.evidence,
        unit: fact.unit
      }))
    );
    return { ok: true, data: await patchFrom(facts) };
  } catch (error) {
    return fail(message(error));
  }
}

export async function editFact(input: unknown): Promise<Result<SessionPatch>> {
  const ref = parseFactRef(input);
  if (!ref.ok) return ref;
  const value = (input as { value?: unknown }).value;
  if (typeof value !== "string" || value.trim().length === 0) return fail("Value cannot be empty");

  const db = await createSupabaseServerClient();
  try {
    const current = await loadFacts(db);
    const target = current.find((fact) => fact.id === ref.data.factId);
    if (!target) return fail("Unknown fact");

    const facts = await writeFacts(db, [
      {
        dimension: target.dimension,
        key: target.key,
        label: target.label,
        value: value.trim(),
        source: "confirmed",
        confidence: 1,
        // The evidence span described the OLD value — carrying it over would misattribute the
        // candidate's correction to the source document.
        evidence: undefined,
        edited: true,
        unit: target.unit
      }
    ]);
    return { ok: true, data: await patchFrom(facts) };
  } catch (error) {
    return fail(message(error));
  }
}

export async function setDnaVisibility(input: unknown): Promise<Result<SessionPatch>> {
  const parsed = parseSetVisibility(input);
  if (!parsed.ok) return parsed;

  const db = await createSupabaseServerClient();
  try {
    const facts = await writeFacts(db, [
      {
        dimension: "dna",
        key: "dna.visibility",
        label: "Visibility",
        value: parsed.data.visibility,
        source: "self-reported"
      }
    ]);
    return { ok: true, data: await patchFrom(facts) };
  } catch (error) {
    return fail(message(error));
  }
}

/** Persists the transcript so a candidate resumes mid-conversation rather than restarting. */
export async function saveTranscript(history: unknown): Promise<Result<null>> {
  if (!Array.isArray(history)) return { ok: false, error: "Expected a transcript array" };

  const db = await createSupabaseServerClient();
  try {
    const session = await ensureSession(db);
    const { error } = await db
      .from("candidate_onboarding_sessions")
      .update({
        state: { history: history as TurnRecord[] } as never,
        updated_at: new Date().toISOString()
      })
      .eq("id", session.id);
    if (error) throw new Error(error.message);
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function skipOnboarding(): Promise<Result<null>> {
  const db = await createSupabaseServerClient();
  try {
    const session = await ensureSession(db);
    const { error } = await db
      .from("candidate_onboarding_sessions")
      .update({ skipped_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", session.id);
    if (error) throw new Error(error.message);
    revalidatePath("/", "layout");
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

/**
 * Projects confirmed facts onto the real profile and closes the session — one transaction inside
 * the database, so a partial projection can never leave a "completed" session behind.
 */
export async function completeOnboarding(): Promise<Result<null>> {
  const db = await createSupabaseServerClient();
  try {
    await ensureSession(db);
    const { error } = await db.rpc("complete_candidate_onboarding");
    if (error) throw new Error(error.message);
    revalidatePath("/", "layout");
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function getSessionStatus(): Promise<{ completed: boolean; skipped: boolean }> {
  const db = await createSupabaseServerClient();
  const session = await loadSession(db);
  return { completed: Boolean(session?.completed_at), skipped: Boolean(session?.skipped_at) };
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}
