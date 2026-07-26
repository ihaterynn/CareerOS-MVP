import assert from "node:assert/strict";
import test from "node:test";
import { buildSeedRows } from "./seed-cv-ingestion.mjs";

test("builds 1,000 synthetic CV records with exactly 24 Gold candidates", () => {
  const rows = buildSeedRows("6be5d6b2-76e4-4de3-a5ef-50de7beff274");
  const valid = rows.filter((row) => row.status === null);
  const gold = valid.filter((row) => row.years === 6 && row.skills.length === 3);

  assert.equal(rows.length, 1000);
  assert.equal(valid.length, 100);
  assert.equal(gold.length, 24);
  assert.match(rows[0].id, /^[0-9a-f-]{36}$/i);
});
