import assert from "node:assert/strict";
import test from "node:test";
import { trackerDataOrMock } from "./mock.ts";

test("uses Nur Aina's application-tracker mock when Supabase has no applications", () => {
  const tracker = trackerDataOrMock([]);

  assert.equal(tracker.applications.length, 10);
  assert.equal(tracker.applications[0]?.company, "Cempaka Digital");
  assert.equal(tracker.analytics.slowestStage, "screening");
});
