import assert from "node:assert/strict";
import test from "node:test";
import { aggregateGoldCandidates, buildIngestionResult } from "./ingestion-data.ts";

test("builds the fixed medallion batch into explainable Bronze, Silver, and Gold counts", () => {
  const result = buildIngestionResult();

  assert.equal(result.bronze.length, 24);
  assert.equal(result.silver.length, 18);
  assert.equal(result.gold.length, 11);
  assert.equal(result.rejected.length, 6);
  assert.match(result.rejected[0]?.reason ?? "", /missing|duplicate|parse/i);
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
