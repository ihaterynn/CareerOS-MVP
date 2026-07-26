import assert from "node:assert/strict";
import test from "node:test";

import { WORK_PROFILE_QUESTIONS, validateWorkProfileAnswers } from "./assessment.ts";

test("accepts a complete 1 to 10 work-preference check-in", () => {
  const answers = Object.fromEntries(WORK_PROFILE_QUESTIONS.map((question, index) => [question.id, (index % 10) + 1]));

  assert.deepEqual(validateWorkProfileAnswers(answers), answers);
});

test("rejects an incomplete work-preference check-in", () => {
  assert.throws(() => validateWorkProfileAnswers({ technical_craft: 8 }), /complete/i);
});

test("covers work style, satisfaction, leadership, growth, and pace without becoming a long survey", () => {
  assert.equal(WORK_PROFILE_QUESTIONS.length, 14);
});
