// Pure onboarding engine — coverage math, question selection, session reduction.
// No React, no I/O: everything here is unit-tested in engine.test.ts.
// Spec: docs/superpowers/specs/2026-07-26-candidate-onboarding-ai-native-design.md §4

import type {
  AnswerValue,
  Coverage,
  DimensionCoverage,
  DimensionId,
  Fact,
  GapTurn,
  OnboardingSession,
  Turn
} from "./types";

/** Provisional (parsed/inferred) facts count at half weight until confirmed. */
export const PROVISIONAL_WEIGHT = 0.5;
/** Above this the candidate may hand off to the workspace and finish later. */
export const MIN_VIABLE_COVERAGE = 0.55;

type DimensionSpec = {
  id: DimensionId;
  label: string;
  weight: number;
  /** Fact keys that together make the dimension complete. */
  required: string[];
};

export const DIMENSIONS: DimensionSpec[] = [
  {
    id: "identity",
    label: "Identity",
    weight: 0.15,
    required: ["identity.name", "identity.role", "identity.location"]
  },
  {
    id: "experience",
    label: "Experience",
    weight: 0.3,
    required: ["experience.current", "experience.tenure", "experience.impact"]
  },
  {
    id: "skills",
    label: "Skills",
    weight: 0.25,
    required: ["skills.core", "skills.depth", "skills.emerging"]
  },
  {
    id: "preferences",
    label: "Preferences",
    weight: 0.2,
    required: ["pref.work_mode", "pref.salary", "pref.commute", "pref.interests"]
  },
  {
    id: "dna",
    label: "Career DNA",
    weight: 0.1,
    required: ["dna.summary", "dna.visibility"]
  }
];

const isProvisional = (fact: Fact) => fact.source === "parsed" || fact.source === "inferred";

/** A fact counts fully once confirmed or self-reported; provisionally otherwise. */
export function factWeight(fact: Fact): number {
  return isProvisional(fact) ? PROVISIONAL_WEIGHT : 1;
}

export function computeCoverage(facts: Fact[]): Coverage {
  const best = new Map<string, number>();
  for (const fact of facts) {
    const weight = factWeight(fact);
    const current = best.get(fact.key) ?? 0;
    if (weight > current) best.set(fact.key, weight);
  }

  const dimensions: DimensionCoverage[] = DIMENSIONS.map((spec) => {
    const earned = spec.required.reduce((sum, key) => sum + (best.get(key) ?? 0), 0);
    return {
      id: spec.id,
      label: spec.label,
      weight: spec.weight,
      completion: spec.required.length === 0 ? 1 : earned / spec.required.length
    };
  });

  const total = dimensions.reduce((sum, d) => sum + d.weight * d.completion, 0);
  return { total, dimensions };
}

/** Fact keys a dimension still needs, in declaration order. */
export function missingKeys(dimension: DimensionId, facts: Fact[]): string[] {
  const spec = DIMENSIONS.find((d) => d.id === dimension);
  if (!spec) return [];
  const covered = new Set(facts.filter((f) => !isProvisional(f)).map((f) => f.key));
  return spec.required.filter((key) => !covered.has(key));
}

/**
 * Highest (dimension weight × remaining gap) first, so the flow always asks the most
 * valuable unanswered thing next instead of running a fixed script to the end.
 */
export function selectNextGap(facts: Fact[], bank: GapTurn[], asked: Set<string>): GapTurn | null {
  const coverage = computeCoverage(facts);
  const priority = new Map<DimensionId, number>(
    coverage.dimensions.map((d) => [d.id, d.weight * (1 - d.completion)])
  );

  let best: GapTurn | null = null;
  let bestScore = 0;

  for (const candidate of bank) {
    if (asked.has(candidate.id)) continue;
    if (!missingKeys(candidate.dimension, facts).includes(candidate.writes)) continue;
    const score = priority.get(candidate.dimension) ?? 0;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return bestScore > 0 ? best : null;
}

export function canHandOff(facts: Fact[]): boolean {
  return computeCoverage(facts).total >= MIN_VIABLE_COVERAGE;
}

/** Dimensions worth naming as thin at handoff — below two-thirds complete. */
export function thinDimensions(facts: Fact[]): DimensionId[] {
  return computeCoverage(facts)
    .dimensions.filter((d) => d.completion < 2 / 3)
    .map((d) => d.id);
}

/** Confirming rewrites provenance: the candidate has now vouched for the fact. */
export function confirmFact(facts: Fact[], factId: string): Fact[] {
  return facts.map((fact) =>
    fact.id === factId ? { ...fact, source: "confirmed" as const, confidence: 1 } : fact
  );
}

export function editFact(facts: Fact[], factId: string, value: AnswerValue): Fact[] {
  return facts.map((fact) =>
    fact.id === factId
      ? { ...fact, value, source: "confirmed" as const, confidence: 1, edited: true }
      : fact
  );
}

/** An answered gap becomes a self-reported fact (or replaces the prior one for that key). */
export function factFromAnswer(turn: GapTurn, value: AnswerValue): Fact {
  return {
    id: `fact-${turn.writes}`,
    dimension: turn.dimension,
    key: turn.writes,
    label: turn.label,
    value,
    source: "self-reported",
    confidence: 1,
    unit: turn.control.kind === "range" ? turn.control.unit : undefined
  };
}

/** Single formatter so the rail, the confirm card, and the answer echo never disagree. */
export function formatValue(value: AnswerValue, unit?: string): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") {
    const n = value.toLocaleString();
    if (!unit) return n;
    return unit === "RM" ? `RM ${n}` : `${n} ${unit}`;
  }
  return value;
}

export function upsertFact(facts: Fact[], next: Fact): Fact[] {
  const index = facts.findIndex((fact) => fact.key === next.key);
  if (index === -1) return [...facts, next];
  const copy = facts.slice();
  copy[index] = next;
  return copy;
}

export function askedTurnIds(session: OnboardingSession): Set<string> {
  return new Set(session.history.map((record) => record.turn.id));
}

/**
 * What the agent should say next: pending confirmations first (cheap, one tap, and they
 * upgrade provisional facts to full weight), then the highest-value gap.
 */
export function nextTurn(
  session: OnboardingSession,
  bank: GapTurn[],
  makeDna: () => Turn,
  makeHandoff: () => Turn
): Turn | null {
  const asked = askedTurnIds(session);

  const queued = session.queue.find((turn) => !asked.has(turn.id));
  if (queued) return queued;

  const gap = selectNextGap(session.facts, bank, asked);
  if (gap) return gap;

  const hasDna = session.facts.some((fact) => fact.key === "dna.summary");
  if (!hasDna) return makeDna();

  return makeHandoff();
}
