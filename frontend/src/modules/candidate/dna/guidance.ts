import type { CareerGuidance } from "./types";

type Input = Record<string, unknown>;

function record(value: unknown, label: string): Input {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} is invalid.`);
  return value as Input;
}

function text(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim() || value.length > 600) throw new Error(`${label} is required.`);
  return value.trim();
}

function score(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100) throw new Error(`${label} must be a score from 0 to 100.`);
  return value;
}

function percentage(value: unknown, label: string) {
  const valueAsScore = score(value, label);
  return valueAsScore <= 10 ? valueAsScore * 10 : valueAsScore;
}

function items(value: unknown, label: string, minimum: number, maximum: number) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) throw new Error(`${label} must contain ${minimum} to ${maximum} items.`);
  return value;
}

function signals(value: unknown, label: string) {
  if (!Array.isArray(value) || !value.length) throw new Error(`${label} must contain at least one item.`);
  return value.slice(0, 3).map((item) => text(item, label));
}

export function validateCareerGuidance(value: unknown): CareerGuidance {
  const input = record(value, "Career guidance");
  const profile = record(input.workProfile, "Work profile");
  const current = record(input.currentRole, "Current role");
  const dimensions = items(current.dimensions, "Dimensions", 3, 5).map((item) => {
    const dimension = record(item, "Dimension");
    return { label: text(dimension.label, "Dimension label"), value: score(dimension.value, "Dimension score"), detail: text(dimension.detail, "Dimension detail"), evidence: text(dimension.evidence, "Dimension evidence") };
  });
  const suggestions: CareerGuidance["suggestions"] = items(input.suggestions, "Suggestions", 1, 3).map((item) => {
    const suggestion = record(item, "Suggestion");
    const path = suggestion.path;
    if (path !== "Explore" && path !== "Promotion") throw new Error("Suggestion path is invalid.");
    return { path: path as "Explore" | "Promotion", role: text(suggestion.role, "Suggestion role"), score: score(suggestion.score, "Suggestion score"), reason: text(suggestion.reason, "Suggestion reason"), evidence: text(suggestion.evidence, "Suggestion evidence"), nextStep: text(suggestion.nextStep, "Suggestion next step") };
  });

  return {
    workProfile: {
      satisfactionScore: percentage(profile.satisfactionScore, "Work-profile satisfaction score"),
      summary: text(profile.summary, "Work-profile summary"),
      energizers: signals(profile.energizers, "Work-profile energizer"),
      drains: signals(profile.drains, "Work-profile drain")
    },
    currentRole: { role: text(current.role, "Current role title"), score: score(current.score, "Current role score"), summary: text(current.summary, "Current role summary"), dimensions },
    suggestions
  };
}
