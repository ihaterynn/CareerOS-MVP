// Runtime validators for onboarding inputs, shared client/server.
//
// Hand-rolled on purpose: `zod` is specified (revamp spec §7.3) but not yet a dependency, and this
// session adds none. Every validator returns the same Result shape as `z.safeParse`, so swapping in
// `zod` later is a body-only change (spec §8).

import type { AnswerControl, AnswerValue, DnaVisibility, IntakeSourceKind } from "./types";

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const ok = <T,>(data: T): Result<T> => ({ ok: true, data });
const fail = <T,>(error: string): Result<T> => ({ ok: false, error });

const SOURCE_KINDS: IntakeSourceKind[] = ["resume", "linkedin", "paste", "conversation"];
const VISIBILITIES: DnaVisibility[] = ["private", "employer", "public"];

export type StartOnboardingInput = {
  sourceKind: IntakeSourceKind;
  /** LinkedIn URL for "linkedin", pasted résumé text for "paste". Absent for file/conversation. */
  payload?: string;
};

export function parseStartOnboarding(input: unknown): Result<StartOnboardingInput> {
  if (typeof input !== "object" || input === null) return fail("Expected an object");
  const { sourceKind, payload } = input as Record<string, unknown>;

  if (typeof sourceKind !== "string" || !SOURCE_KINDS.includes(sourceKind as IntakeSourceKind)) {
    return fail(`sourceKind must be one of ${SOURCE_KINDS.join(", ")}`);
  }
  const kind = sourceKind as IntakeSourceKind;

  if (kind === "linkedin") {
    if (typeof payload !== "string") return fail("A LinkedIn URL is required");
    let url: URL;
    try {
      url = new URL(payload);
    } catch {
      return fail("That doesn't look like a URL");
    }
    // http/https only — the backend fetches this server-side, so no file:// or javascript:.
    if (url.protocol !== "http:" && url.protocol !== "https:") return fail("URL must be http or https");
    if (!url.hostname.endsWith("linkedin.com")) return fail("Expected a linkedin.com profile URL");
    return ok({ sourceKind: kind, payload: url.toString() });
  }

  if (kind === "paste") {
    if (typeof payload !== "string" || payload.trim().length < 40) {
      return fail("Paste at least a few lines of your résumé");
    }
    return ok({ sourceKind: kind, payload: payload.trim() });
  }

  return ok({ sourceKind: kind });
}

export type SubmitAnswerInput = { turnId: string; value: AnswerValue };

export function parseSubmitAnswer(input: unknown): Result<SubmitAnswerInput> {
  if (typeof input !== "object" || input === null) return fail("Expected an object");
  const { turnId, value } = input as Record<string, unknown>;
  if (typeof turnId !== "string" || turnId.length === 0) return fail("turnId is required");
  if (typeof value === "string") {
    if (value.trim().length === 0) return fail("Answer cannot be empty");
    return ok({ turnId, value: value.trim() });
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return fail("Answer must be a finite number");
    return ok({ turnId, value });
  }
  if (Array.isArray(value) && value.every((entry) => typeof entry === "string")) {
    if (value.length === 0) return fail("Pick at least one option");
    return ok({ turnId, value: value as string[] });
  }
  return fail("Unsupported answer value");
}

/** Second gate: the answer must also fit the control the turn actually offered. */
export function answerFitsControl(control: AnswerControl, value: AnswerValue): Result<AnswerValue> {
  switch (control.kind) {
    case "confirm":
      return value === "yes" || value === "no" ? ok(value) : fail("Expected yes or no");
    case "chips":
      // Free typing is always allowed (spec §3) — an off-list string is a valid answer.
      return typeof value === "string" ? ok(value) : fail("Expected a single choice");
    case "multi": {
      if (!Array.isArray(value)) return fail("Expected a list of choices");
      if (control.max && value.length > control.max) return fail(`Pick at most ${control.max}`);
      return ok(value);
    }
    case "range": {
      if (typeof value !== "number") return fail("Expected a number");
      if (value < control.min || value > control.max) {
        return fail(`Must be between ${control.min} and ${control.max}`);
      }
      return ok(value);
    }
    case "location":
    case "text":
      return typeof value === "string" ? ok(value) : fail("Expected text");
  }
}

export type SetVisibilityInput = { visibility: DnaVisibility };

export function parseSetVisibility(input: unknown): Result<SetVisibilityInput> {
  if (typeof input !== "object" || input === null) return fail("Expected an object");
  const { visibility } = input as Record<string, unknown>;
  if (typeof visibility !== "string" || !VISIBILITIES.includes(visibility as DnaVisibility)) {
    return fail(`visibility must be one of ${VISIBILITIES.join(", ")}`);
  }
  return ok({ visibility: visibility as DnaVisibility });
}

export type FactRefInput = { factId: string };

export function parseFactRef(input: unknown): Result<FactRefInput> {
  if (typeof input !== "object" || input === null) return fail("Expected an object");
  const { factId } = input as Record<string, unknown>;
  if (typeof factId !== "string" || factId.length === 0) return fail("factId is required");
  return ok({ factId });
}
