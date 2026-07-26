import { validateWorkProfileAnswers, type WorkProfileAnswers } from "./assessment";
import { validateCareerGuidance } from "./guidance";
import type { CareerGuidance } from "./types";

export const DNA_STORAGE_KEY = "careeros.candidate-dna.v1";

export type DnaState = {
  answers: WorkProfileAnswers;
  surveyStage: "intro" | "questions" | "ready";
  questionIndex: number;
  guidance?: CareerGuidance;
};

export function parseDnaState(value: string | null): DnaState | undefined {
  if (!value) return undefined;
  try {
    const input = JSON.parse(value) as Record<string, unknown>;
    if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
    if (input.surveyStage !== "intro" && input.surveyStage !== "questions" && input.surveyStage !== "ready") return undefined;
    if (typeof input.questionIndex !== "number" || !Number.isInteger(input.questionIndex) || input.questionIndex < 0) return undefined;
    return {
      answers: validateWorkProfileAnswers(input.answers),
      surveyStage: input.surveyStage,
      questionIndex: input.questionIndex,
      guidance: input.guidance ? validateCareerGuidance(input.guidance) : undefined
    };
  } catch {
    return undefined;
  }
}
