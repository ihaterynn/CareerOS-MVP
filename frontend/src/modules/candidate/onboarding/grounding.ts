// Anti-fabrication gate for model-extracted facts (spec §6.4). Pure — no I/O, no server-only
// import — so it is unit-testable in isolation. This is the security-relevant half of parsing:
// it decides what the model is allowed to assert about a real person.

import type { DimensionId } from "./types";

export type AllowedKeySpec = { dimension: DimensionId; label: string; array?: boolean };

/** Fact keys the parser may emit. Anything outside this map is discarded, not stored. */
export const ALLOWED_KEYS: Record<string, AllowedKeySpec> = {
  "identity.name": { dimension: "identity", label: "Name" },
  "identity.role": { dimension: "identity", label: "Current role" },
  "identity.location": { dimension: "identity", label: "Location" },
  "experience.current": { dimension: "experience", label: "Current employer" },
  "experience.tenure": { dimension: "experience", label: "Experience" },
  "experience.impact": { dimension: "experience", label: "Signature impact" },
  "skills.core": { dimension: "skills", label: "Core skills", array: true }
};

export type RawFact = {
  key?: unknown;
  value?: unknown;
  evidence?: unknown;
  confidence?: unknown;
};

export type GroundedFact = {
  dimension: DimensionId;
  key: string;
  label: string;
  value: string | string[];
  source: "parsed" | "inferred";
  confidence: number;
  evidence?: string;
};

/**
 * A fact survives only if the span it quotes really appears in the source document.
 *
 * Failures are NOT silently dropped — they are downgraded to `inferred` with the evidence
 * stripped, which halves their coverage weight and forces the candidate to confirm them before
 * they can reach the profile. A model that hallucinates an employer therefore produces a
 * question, never a stored claim.
 */
export function groundFacts(raw: RawFact[], sourceText: string): GroundedFact[] {
  const haystack = normalize(sourceText);
  const seen = new Set<string>();
  const out: GroundedFact[] = [];

  for (const fact of raw) {
    if (typeof fact?.key !== "string") continue;
    const spec = ALLOWED_KEYS[fact.key];
    if (!spec) continue;
    if (seen.has(fact.key)) continue;

    const value = normalizeValue(fact.value, spec.array);
    if (value === null) continue;

    const evidence = typeof fact.evidence === "string" ? fact.evidence.trim() : "";
    const grounded = evidence.length > 0 && haystack.includes(normalize(evidence));
    const confidence = clampConfidence(fact.confidence);

    seen.add(fact.key);
    out.push({
      dimension: spec.dimension,
      key: fact.key,
      label: spec.label,
      value,
      source: grounded ? "parsed" : "inferred",
      confidence: grounded ? confidence : Math.min(confidence, 0.5),
      evidence: grounded ? evidence : undefined
    });
  }

  return out;
}

function normalizeValue(value: unknown, wantsArray?: boolean): string | string[] | null {
  if (wantsArray) {
    const list = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
    const cleaned = list
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 12);
    return cleaned.length ? cleaned : null;
  }
  if (Array.isArray(value)) {
    return value.length && typeof value[0] === "string" ? value[0].trim() || null : null;
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed.slice(0, 300) : null;
}

function clampConfidence(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0.6;
  return Math.min(1, Math.max(0, n));
}

/** Whitespace- and case-insensitive, so PDF reflow doesn't fail an otherwise true quote. */
function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}
