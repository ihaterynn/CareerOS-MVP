import assert from "node:assert/strict";
import test from "node:test";

import { sampleResume } from "./sample-resume.ts";

test("uses Nur Aina's supplied cloud-engineer resume as the worker-free DNA fallback", async () => {
  const resume = await sampleResume();

  assert.equal(resume.name, "NUR AINA RAHMAN");
  assert.equal(resume.title, "Cloud Engineer");
  assert.ok(resume.experience.length >= 3);
});
