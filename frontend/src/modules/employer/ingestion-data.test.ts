import assert from "node:assert/strict";
import test from "node:test";
import { aggregateGoldCandidates, buildDailyReviewDesk, buildIngestionResult, extractedCvs, mockDailyCvs, rejectionBreakdown } from "./ingestion-data.ts";

test("builds the fixed medallion batch into explainable Bronze, Silver, and Gold counts", () => {
  const result = buildIngestionResult();

  assert.equal(result.bronze.length, 24);
  assert.equal(result.silver.length, 18);
  assert.equal(result.gold.length, 11);
  assert.equal(result.rejected.length, 6);
  assert.match(result.rejected[0]?.reason ?? "", /missing|duplicate|parse/i);
});

test("turns validation failures into a concise decision explanation", () => {
  const result = buildIngestionResult();

  assert.deepEqual(rejectionBreakdown(result.rejected), [
    { label: "missing contact", count: 2 },
    { label: "duplicate fingerprint", count: 2 },
    { label: "parse failed", count: 2 }
  ]);
});

test("aggregates only trusted Gold candidates by shared evidence patterns", () => {
  const result = buildIngestionResult();
  const grouped = aggregateGoldCandidates(result.gold, "gap");

  assert.deepEqual(grouped, [
    { label: "Architecture review", count: 2 },
    { label: "Design leadership", count: 2 },
    { label: "Experiment design", count: 2 },
    { label: "People mentorship", count: 2 },
    { label: "Stakeholder influence", count: 2 },
    { label: "Data storytelling", count: 1 }
  ]);
});

test("keeps a 35 percent mock review pool while never bypassing JD hard filters", () => {
  const desk = buildDailyReviewDesk(mockDailyCvs);

  assert.equal(desk.totalReceived, 1000);
  assert.equal(desk.passed.length, 24);
  assert.equal(desk.reviewable.length, 326);
  assert.equal(desk.ineligible.length, 433);
  assert.equal(desk.deferred.length, 217);
  assert.equal(desk.queue.length, 350);
  assert.ok(desk.queue.every((candidate) => candidate.hardFilterReasons.length === 0));
  assert.ok(desk.passed.every((candidate) => candidate.recommendation === "Passed"));
  assert.ok(desk.reviewable.every((candidate) => candidate.recommendation === "Reviewable"));
});
