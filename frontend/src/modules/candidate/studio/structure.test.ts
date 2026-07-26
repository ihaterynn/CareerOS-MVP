import assert from "node:assert/strict";
import test from "node:test";

import { validateStructuredResume } from "./structure";

test("validateStructuredResume keeps only grounded editable resume fields", () => {
  const resume = validateStructuredResume({
    name: "Nur Aina Rahman", title: "Cloud Engineer", loc: "Petaling Jaya", email: "aina@example.com",
    summary: "Builds cloud platforms.", experience: [{ role: "Cloud Engineer · Nimbus Learning", period: "2023 - Present", bullets: ["Delivered AWS solutions."] }],
    skills: ["AWS", "Kubernetes"], other: "AWS Solutions Architect Associate"
  });

  assert.equal(resume.name, "Nur Aina Rahman");
  assert.deepEqual(resume.experience[0]?.bullets, ["Delivered AWS solutions."]);
  assert.equal(resume.other, "AWS Solutions Architect Associate");
});

test("validateStructuredResume rejects malformed model payloads", () => {
  assert.throws(() => validateStructuredResume({ name: "Avery", experience: "not an array" }), /experience/i);
});
