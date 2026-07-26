import assert from "node:assert/strict";
import test from "node:test";

import { WORK_PROFILE_QUESTIONS } from "./assessment.ts";
import { parseDnaState } from "./storage.ts";

const answers = Object.fromEntries(WORK_PROFILE_QUESTIONS.map((question) => [question.id, 7]));

test("restores a completed check-in and its generated guidance", () => {
  const saved = parseDnaState(JSON.stringify({
    answers,
    surveyStage: "ready",
    questionIndex: 13,
    guidance: {
      workProfile: { satisfactionScore: 70, summary: "You value ownership.", energizers: ["Ownership"], drains: ["Unclear priorities"] },
      currentRole: { role: "Cloud Engineer", score: 76, summary: "A good fit.", dimensions: [
        { label: "Technical craft", value: 80, detail: "Strong", evidence: "AWS delivery" },
        { label: "Ownership", value: 70, detail: "Growing", evidence: "Client work" },
        { label: "Collaboration", value: 72, detail: "Useful", evidence: "Cross-team work" }
      ] },
      suggestions: [{ path: "Explore", role: "Cloud Architect", score: 80, reason: "Good direction.", evidence: "Architecture work", nextStep: "Document impact." }]
    }
  }));

  assert.equal(saved?.surveyStage, "ready");
  assert.equal(saved?.questionIndex, 13);
  assert.equal(saved?.answers.ownership, 7);
  assert.equal(saved?.guidance?.currentRole.role, "Cloud Engineer");
});

test("ignores invalid stored data", () => {
  assert.equal(parseDnaState('{"answers":{"ownership":7}}'), undefined);
});
