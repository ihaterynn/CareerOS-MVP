import type { Resume } from "./types";

export type Refinement = {
  target: "summary" | "experience";
  title: string;
  rationale: string;
  coverage?: string[];
  replacement?: string;
  experienceIndex?: number;
  bullets?: string[];
};

function string(value: unknown, label: string, max = 3_000) {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error(`Invalid ${label}.`);
  return value.trim();
}

function optionalText(value: unknown, fallback: string, max: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback;
}

export function validateRefinement(value: unknown, resume: Resume): Refinement {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid refinement.");
  const item = value as Record<string, unknown>;
  const target = item.target;
  if (target !== "summary" && target !== "experience") throw new Error("Invalid refinement target.");
  const common = { target, title: optionalText(item.title, "Section rewrite", 120), rationale: optionalText(item.rationale, "Grounded rewrite from your draft.", 240) } as const;
  const coverage = Array.isArray(item.coverage) ? item.coverage.filter((value): value is string => typeof value === "string" && Boolean(value.trim())).slice(0, 3).map((value) => value.trim().slice(0, 100)) : undefined;
  if (target === "summary") return { ...common, replacement: string(item.replacement, "profile rewrite"), ...(coverage?.length ? { coverage } : {}) };
  const experienceIndex = item.experienceIndex;
  if (typeof experienceIndex !== "number" || !Number.isInteger(experienceIndex) || experienceIndex < 0 || experienceIndex >= resume.experience.length) throw new Error("Invalid experience target.");
  if (!Array.isArray(item.bullets) || !item.bullets.length || item.bullets.length > 12) throw new Error("Invalid experience rewrite.");
  return { ...common, experienceIndex, bullets: item.bullets.map((bullet) => string(bullet, "experience bullet", 800)), ...(coverage?.length ? { coverage } : {}) };
}

export function applyRefinement(resume: Resume, refinement: Refinement): Resume {
  if (refinement.target === "summary") return { ...resume, summary: refinement.replacement || resume.summary };
  return { ...resume, experience: resume.experience.map((experience, index) => index === refinement.experienceIndex ? { ...experience, bullets: refinement.bullets || experience.bullets } : experience) };
}

export function refinementFrames(resume: Resume, refinement: Refinement) {
  if (refinement.target !== "experience" || refinement.experienceIndex == null || !refinement.bullets) return [applyRefinement(resume, refinement)];
  const original = resume.experience[refinement.experienceIndex]?.bullets || [];
  return refinement.bullets.map((_, index) => applyRefinement(resume, { ...refinement, bullets: [...refinement.bullets!.slice(0, index + 1), ...original.slice(index + 1)] }));
}

export function refinementTarget(refinement: Refinement) {
  return refinement.target === "summary" ? "summary" : `experience:${refinement.experienceIndex}`;
}
