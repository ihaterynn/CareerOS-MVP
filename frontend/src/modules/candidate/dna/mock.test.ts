import assert from "node:assert/strict";
import test from "node:test";
import { dnaMock } from "./mock.ts";

test("provides multi-dimensional career guidance for Nur Aina", () => {
  const guidance = dnaMock.profile.careerGuidance;

  assert.equal(guidance.currentRole.score, 87);
  assert.equal(guidance.currentRole.dimensions.length, 4);
  assert.equal(guidance.suggestions.filter((suggestion) => suggestion.path === "Explore").length, 2);
  assert.equal(guidance.suggestions.filter((suggestion) => suggestion.path === "Promotion").length, 1);
  assert.ok(guidance.suggestions.every((suggestion) => suggestion.nextStep.length > 0));
});
