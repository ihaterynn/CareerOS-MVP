import assert from "node:assert/strict";
import test from "node:test";
import { groundFacts } from "./grounding.ts";

const RESUME = `AISHAH RAHMAN — Software Engineer
Petaling Jaya, Selangor · aishah.r@example.com

EXPERIENCE
Software Engineer, Hantar — 2023 to Present
  Cut order-assignment latency from 900ms to 210ms.
Junior Software Engineer, Jasa Tech — 2021 to 2023

SKILLS
Python, TypeScript, PostgreSQL, Go`;

test("a quoted, real span is accepted as parsed", () => {
  const [fact] = groundFacts(
    [{ key: "identity.name", value: "Aishah Rahman", evidence: "AISHAH RAHMAN — Software Engineer", confidence: 0.99 }],
    RESUME
  );
  assert.equal(fact.source, "parsed");
  assert.equal(fact.evidence, "AISHAH RAHMAN — Software Engineer");
  assert.equal(fact.confidence, 0.99);
});

test("a fabricated employer is downgraded, never stored as read", () => {
  const [fact] = groundFacts(
    [{ key: "experience.current", value: "Goldman Sachs", evidence: "Vice President, Goldman Sachs — 2019", confidence: 0.95 }],
    RESUME
  );
  assert.equal(fact.source, "inferred", "ungrounded claims must not be presented as parsed");
  assert.equal(fact.evidence, undefined, "the invented span must not be shown to the candidate");
  assert.ok(fact.confidence <= 0.5, "confidence is capped so it cannot outrank real facts");
});

test("a real value with a missing quote is still downgraded", () => {
  // The value happens to be true, but the model didn't show its work — treat it as unverified.
  const [fact] = groundFacts([{ key: "identity.role", value: "Software Engineer", evidence: "", confidence: 1 }], RESUME);
  assert.equal(fact.source, "inferred");
});

test("reflowed whitespace and casing still count as a match", () => {
  const [fact] = groundFacts(
    [{ key: "experience.current", value: "Hantar", evidence: "software engineer,   hantar\n— 2023 to present", confidence: 0.9 }],
    RESUME
  );
  assert.equal(fact.source, "parsed", "PDF reflow must not fail a genuine quote");
});

test("keys outside the allow-list are discarded entirely", () => {
  const facts = groundFacts(
    [
      { key: "identity.ssn", value: "123-45-6789", evidence: "AISHAH RAHMAN", confidence: 1 },
      { key: "dna.summary", value: "A great hire", evidence: "AISHAH RAHMAN", confidence: 1 },
      { key: "identity.name", value: "Aishah Rahman", evidence: "AISHAH RAHMAN", confidence: 1 }
    ],
    RESUME
  );
  assert.deepEqual(facts.map((f) => f.key), ["identity.name"]);
});

test("duplicate keys keep only the first", () => {
  const facts = groundFacts(
    [
      { key: "identity.name", value: "Aishah Rahman", evidence: "AISHAH RAHMAN", confidence: 1 },
      { key: "identity.name", value: "Someone Else", evidence: "AISHAH RAHMAN", confidence: 1 }
    ],
    RESUME
  );
  assert.equal(facts.length, 1);
  assert.equal(facts[0].value, "Aishah Rahman");
});

test("array-valued keys are normalised and capped; scalars are coerced", () => {
  const [skills] = groundFacts(
    [{ key: "skills.core", value: ["  Python ", "", "Go"], evidence: "Python, TypeScript, PostgreSQL, Go", confidence: 0.9 }],
    RESUME
  );
  assert.deepEqual(skills.value, ["Python", "Go"]);

  const [single] = groundFacts(
    [{ key: "skills.core", value: "Python", evidence: "Python, TypeScript", confidence: 0.9 }],
    RESUME
  );
  assert.deepEqual(single.value, ["Python"]);
});

test("malformed model output is dropped rather than crashing the parse", () => {
  const facts = groundFacts(
    [
      { key: 42, value: "x", evidence: "y", confidence: 1 },
      { key: "identity.name", value: null, evidence: "AISHAH RAHMAN", confidence: 1 },
      { key: "identity.role", value: "   ", evidence: "AISHAH RAHMAN", confidence: 1 },
      {} as never
    ],
    RESUME
  );
  assert.deepEqual(facts, []);
});

test("out-of-range confidence is clamped", () => {
  const [high] = groundFacts([{ key: "identity.name", value: "A", evidence: "AISHAH RAHMAN", confidence: 9 }], RESUME);
  assert.equal(high.confidence, 1);
  const [low] = groundFacts([{ key: "identity.name", value: "A", evidence: "AISHAH RAHMAN", confidence: -3 }], RESUME);
  assert.equal(low.confidence, 0);
});
