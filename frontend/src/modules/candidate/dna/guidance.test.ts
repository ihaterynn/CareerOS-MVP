import assert from "node:assert/strict";
import test from "node:test";

import { validateCareerGuidance } from "./guidance.ts";

const validGuidance = {
  workProfile: {
    satisfactionScore: 72,
    summary: "Technical craft and ownership are energising, while the candidate wants more collaborative scope.",
    energizers: ["Technical problem solving", "End-to-end ownership"],
    drains: ["Low influence across teams"]
  },
  currentRole: {
    role: "Backend Software Engineer",
    score: 84,
    summary: "The resume shows production backend ownership and measurable reliability work.",
    dimensions: [
      { label: "Technical depth", value: 88, detail: "Built production services.", evidence: "Reduced dispatch latency from 900ms to 210ms." },
      { label: "Ownership", value: 81, detail: "Owned outcomes end to end.", evidence: "Built reconciliation jobs for SME users." },
      { label: "Collaboration", value: 64, detail: "Some partner-facing work is present.", evidence: "Built merchant dashboards for SME users." }
    ]
  },
  suggestions: [
    { path: "Explore", role: "Backend Platform Engineer", score: 89, reason: "Reliability and database work are directly relevant.", evidence: "Latency and PostgreSQL work.", nextStep: "Lead one reliability improvement." }
  ]
};

test("accepts career guidance only when every recommendation is grounded in resume evidence", () => {
  const guidance = validateCareerGuidance(validGuidance);

  assert.equal(guidance.currentRole.role, "Backend Software Engineer");
  assert.equal(guidance.workProfile.satisfactionScore, 72);
  assert.equal(guidance.suggestions[0]?.evidence, "Latency and PostgreSQL work.");
});

test("rejects a recommendation that has no resume evidence", () => {
  const withoutEvidence = structuredClone(validGuidance);
  withoutEvidence.suggestions[0]!.evidence = "";

  assert.throws(() => validateCareerGuidance(withoutEvidence), /evidence/i);
});

test("normalizes a one-to-ten satisfaction response into a percentage", () => {
  const fromCheckIn = structuredClone(validGuidance);
  fromCheckIn.workProfile.satisfactionScore = 8;

  assert.equal(validateCareerGuidance(fromCheckIn).workProfile.satisfactionScore, 80);
});

test("keeps the top three work-profile signals when the model returns extra items", () => {
  const verbose = structuredClone(validGuidance);
  verbose.workProfile.energizers = ["Technical problem solving", "End-to-end ownership", "Learning", "Customer impact"];

  assert.deepEqual(validateCareerGuidance(verbose).workProfile.energizers, ["Technical problem solving", "End-to-end ownership", "Learning"]);
});
