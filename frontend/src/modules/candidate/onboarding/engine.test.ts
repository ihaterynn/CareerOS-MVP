import assert from "node:assert/strict";
import test from "node:test";
import {
  DIMENSIONS,
  MIN_VIABLE_COVERAGE,
  PROVISIONAL_WEIGHT,
  canHandOff,
  computeCoverage,
  confirmFact,
  editFact,
  factFromAnswer,
  formatValue,
  missingKeys,
  selectNextGap,
  thinDimensions,
  upsertFact
} from "./engine.ts";
import { GAP_BANK, PARSED_FACTS } from "./mock.ts";
import type { Fact, GapTurn } from "./types.ts";

const fact = (key: string, dimension: Fact["dimension"], source: Fact["source"]): Fact => ({
  id: `fact-${key}`,
  dimension,
  key,
  label: key,
  value: "x",
  source,
  confidence: 1
});

test("dimension weights sum to 1 so coverage is a true percentage", () => {
  const total = DIMENSIONS.reduce((sum, d) => sum + d.weight, 0);
  assert.ok(Math.abs(total - 1) < 1e-9, `weights sum to ${total}`);
});

test("empty ledger is zero coverage", () => {
  assert.equal(computeCoverage([]).total, 0);
});

test("a fully confirmed ledger reaches 100%", () => {
  const facts = DIMENSIONS.flatMap((d) => d.required.map((key) => fact(key, d.id, "confirmed")));
  assert.ok(Math.abs(computeCoverage(facts).total - 1) < 1e-9);
});

test("provisional facts count at half weight until confirmed", () => {
  const parsed = fact("identity.name", "identity", "parsed");
  const identity = (facts: Fact[]) =>
    computeCoverage(facts).dimensions.find((d) => d.id === "identity")!.completion;

  const provisional = identity([parsed]);
  const confirmed = identity(confirmFact([parsed], parsed.id));

  assert.equal(provisional, (1 / 3) * PROVISIONAL_WEIGHT);
  assert.equal(confirmed, 1 / 3);
  assert.equal(provisional, confirmed * PROVISIONAL_WEIGHT);
});

test("confirming rewrites provenance rather than duplicating the fact", () => {
  const facts = confirmFact(PARSED_FACTS, "fact-identity.name");
  assert.equal(facts.length, PARSED_FACTS.length);
  const name = facts.find((f) => f.id === "fact-identity.name")!;
  assert.equal(name.source, "confirmed");
  assert.equal(name.confidence, 1);
});

test("provisional facts still read as missing — they have not been vouched for", () => {
  const missing = missingKeys("identity", PARSED_FACTS);
  assert.deepEqual(missing, ["identity.name", "identity.role", "identity.location"]);

  const afterConfirm = missingKeys("identity", confirmFact(PARSED_FACTS, "fact-identity.name"));
  assert.deepEqual(afterConfirm, ["identity.role", "identity.location"]);
});

test("next gap is the highest weight × remaining-gap, not bank order", () => {
  // Experience (0.30) outranks skills (0.25) and preferences (0.20) when all are equally empty,
  // even though the preferences questions sit earlier in the bank for some dimensions.
  const next = selectNextGap([], GAP_BANK, new Set());
  assert.ok(next);
  assert.equal(next!.dimension, "experience");
});

test("selection skips gaps already asked and gaps whose key is already covered", () => {
  const facts = DIMENSIONS.find((d) => d.id === "experience")!.required.map((key) =>
    fact(key, "experience", "confirmed")
  );
  const next = selectNextGap(facts, GAP_BANK, new Set());
  assert.ok(next);
  assert.notEqual(next!.dimension, "experience");

  const asked = new Set(GAP_BANK.filter((g) => g.dimension === "skills").map((g) => g.id));
  const afterAsked = selectNextGap(facts, GAP_BANK, asked);
  assert.ok(afterAsked);
  assert.notEqual(afterAsked!.dimension, "skills");
});

test("selection terminates once every dimension in the bank is covered", () => {
  const facts = DIMENSIONS.flatMap((d) => d.required.map((key) => fact(key, d.id, "confirmed")));
  assert.equal(selectNextGap(facts, GAP_BANK, new Set()), null);
});

test("answering a gap writes a self-reported fact that replaces the provisional one", () => {
  const turn = GAP_BANK.find((g) => g.writes === "skills.core") as GapTurn;
  const answered = factFromAnswer(turn, ["Python", "Go"]);
  const facts = upsertFact(PARSED_FACTS, answered);

  assert.equal(facts.length, PARSED_FACTS.length, "replaces, does not append a duplicate key");
  const core = facts.find((f) => f.key === "skills.core")!;
  assert.equal(core.source, "self-reported");
  assert.deepEqual(core.value, ["Python", "Go"]);
});

test("confirming as-is is not an edit; changing the value is", () => {
  const confirmed = confirmFact(PARSED_FACTS, "fact-identity.name");
  assert.equal(confirmed.find((f) => f.id === "fact-identity.name")!.edited, undefined);

  const changed = editFact(PARSED_FACTS, "fact-identity.name", "Aishah binti Rahman");
  const row = changed.find((f) => f.id === "fact-identity.name")!;
  assert.equal(row.edited, true);
  assert.equal(row.value, "Aishah binti Rahman");
});

test("numeric answers keep their unit so the rail never shows a bare number", () => {
  const salary = GAP_BANK.find((g) => g.writes === "pref.salary") as GapTurn;
  const commute = GAP_BANK.find((g) => g.writes === "pref.commute") as GapTurn;

  assert.equal(formatValue(factFromAnswer(salary, 15500).value, factFromAnswer(salary, 15500).unit), "RM 15,500");
  assert.equal(formatValue(factFromAnswer(commute, 50).value, factFromAnswer(commute, 50).unit), "50 min");
  assert.equal(formatValue(["Python", "Go"]), "Python, Go");
  assert.equal(formatValue("Hybrid"), "Hybrid");
});

test("handoff unlocks at the viability threshold, not before", () => {
  assert.equal(canHandOff([]), false);
  assert.equal(canHandOff(PARSED_FACTS), false, "a bare parse is not enough on its own");

  const facts = DIMENSIONS.flatMap((d) => d.required.map((key) => fact(key, d.id, "confirmed")));
  assert.equal(canHandOff(facts), true);
  assert.ok(computeCoverage(facts).total >= MIN_VIABLE_COVERAGE);
});

test("handoff names thin dimensions honestly", () => {
  const thin = thinDimensions(PARSED_FACTS);
  assert.ok(thin.includes("preferences"), "nothing was asked about preferences");
  assert.ok(thin.includes("dna"), "no DNA summary drafted yet");

  const complete = DIMENSIONS.flatMap((d) => d.required.map((key) => fact(key, d.id, "confirmed")));
  assert.deepEqual(thinDimensions(complete), []);
});
