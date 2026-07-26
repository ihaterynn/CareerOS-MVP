import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeCoverage } from "./engine";
import { GAP_BANK, INTAKE_TURN } from "./mock";
import { loadFacts, loadSession } from "./repository";
import type { OnboardingData, OnboardingSession, TurnRecord } from "./types";

/**
 * Loads the caller's onboarding state. RLS scopes every read to the signed-in candidate — no
 * candidate id is accepted from the caller.
 */
export async function getOnboardingData(): Promise<OnboardingData> {
  const db = await createSupabaseServerClient();
  const [session, facts] = await Promise.all([loadSession(db), loadFacts(db)]);

  // The turn transcript lives in session.state so a candidate resumes mid-conversation instead
  // of re-answering. An unreadable/legacy state falls back to a fresh intake rather than 500ing.
  const history = readHistory(session?.state);

  const restored: OnboardingSession = {
    candidateName: stringFact(facts, "identity.name"),
    sourceKind: session?.source_kind ?? null,
    history: history.length ? history : [{ turn: INTAKE_TURN, status: "pending" }],
    queue: history.length ? [] : [INTAKE_TURN],
    facts,
    visibility: (stringFact(facts, "dna.visibility") as OnboardingSession["visibility"]) ?? "private",
    dnaSummary: stringFact(facts, "dna.summary"),
    completed: Boolean(session?.completed_at)
  };

  return { session: restored, gapBank: GAP_BANK, coverage: computeCoverage(facts) };
}

export async function isOnboardingComplete(): Promise<boolean> {
  const db = await createSupabaseServerClient();
  const session = await loadSession(db);
  return Boolean(session?.completed_at);
}

function stringFact(facts: OnboardingSession["facts"], key: string): string | null {
  const value = facts.find((fact) => fact.key === key)?.value;
  return typeof value === "string" ? value : null;
}

function readHistory(state: unknown): TurnRecord[] {
  if (!state || typeof state !== "object") return [];
  const history = (state as { history?: unknown }).history;
  if (!Array.isArray(history)) return [];
  return history.filter(
    (entry): entry is TurnRecord =>
      Boolean(entry) && typeof entry === "object" && "turn" in entry && "status" in entry
  );
}
