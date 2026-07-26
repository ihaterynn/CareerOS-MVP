import assert from "node:assert/strict";
import test from "node:test";
import { employerModules } from "./employer-data.ts";

test("makes the daily CV review desk the employer dashboard", () => {
  const dashboard = employerModules.find((module) => module.id === "dashboard");

  assert.match(dashboard?.description ?? "", /daily CV review/i);
  for (const id of ["ingestion", "retention", "heatmap", "attrition", "review"]) {
    assert.equal((employerModules as Array<{ id: string }>).some((module) => module.id === id), false);
  }
});
