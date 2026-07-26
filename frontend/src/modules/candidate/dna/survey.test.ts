import assert from "node:assert/strict";
import test from "node:test";

import { nextSurveyStep, surveyProgress } from "./survey.ts";

test("advances one question at a time and finishes after the final question", () => {
  assert.equal(nextSurveyStep(0, 8), 1);
  assert.equal(nextSurveyStep(7, 8), "complete");
});

test("reports progress from the current question rather than the last completed one", () => {
  assert.equal(surveyProgress(0, 8), 13);
  assert.equal(surveyProgress(7, 8), 100);
});
