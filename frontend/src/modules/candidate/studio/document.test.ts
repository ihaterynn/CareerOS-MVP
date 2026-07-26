import assert from "node:assert/strict";
import test from "node:test";

import { formatResumeText, parseResumeImport, parseResumeText, resumeContentKey } from "./document";

test("parseResumeText turns a simple resume into editable sections", () => {
  const resume = parseResumeText(`Avery Lee
Backend Engineer
avery@example.com | Kuala Lumpur

SUMMARY
Builds reliable APIs for payment products.

EXPERIENCE
Backend Engineer | Acme | 2023 - Present
- Cut API latency by 40%.
- Built reconciliation services.

SKILLS
TypeScript, PostgreSQL, AWS`);

  assert.equal(resume.name, "Avery Lee");
  assert.equal(resume.title, "Backend Engineer");
  assert.equal(resume.email, "avery@example.com");
  assert.equal(resume.summary, "Builds reliable APIs for payment products.");
  assert.deepEqual(resume.experience[0]?.bullets, ["Cut API latency by 40%.", "Built reconciliation services."]);
  assert.deepEqual(resume.skills, ["TypeScript", "PostgreSQL", "AWS"]);
});

test("parseResumeText keeps unstructured text editable", () => {
  const resume = parseResumeText("Jordan Kim\nProduct builder with an eye for detail.");

  assert.equal(resume.name, "Jordan Kim");
  assert.equal(resume.summary, "Product builder with an eye for detail.");
});

test("parseResumeImport recognises common section aliases and retains unmatched content", () => {
  const result = parseResumeImport(`Nur Aina Rahman
Cloud Engineer
aina@example.com | Petaling Jaya

RELEVANT WORK EXPERIENCE
Cloud Engineer | Nimbus Learning | 2023 - Present
- Delivered AWS solutions.

SKILLS
AWS, Kubernetes

CERTIFICATIONS
AWS Solutions Architect Associate`);

  assert.equal(result.resume.experience[0]?.role, "Cloud Engineer · Nimbus Learning");
  assert.deepEqual(result.resume.experience[0]?.bullets, ["Delivered AWS solutions."]);
  assert.deepEqual(result.resume.skills, ["AWS", "Kubernetes"]);
  assert.match(result.unmatchedText, /AWS Solutions Architect Associate/);
  assert.ok(result.confidence >= 0.7);
});

test("parseResumeImport handles PDF-style role and date lines", () => {
  const result = parseResumeImport(`Nur Aina Rahman
Cloud Engineer

WORK EXPERIENCE
Cloud Engineer 06/2023 - Present
Nimbus Learning, Kuala Lumpur
- Delivered AWS platforms for enterprise clients.

SKILLS
AWS`);

  assert.equal(result.resume.experience[0]?.role, "Cloud Engineer · Nimbus Learning, Kuala Lumpur");
  assert.equal(result.resume.experience[0]?.period, "06/2023 - Present");
});

test("formatResumeText produces selectable export text", () => {
  const text = formatResumeText({
    name: "Avery Lee", title: "Backend Engineer", loc: "Kuala Lumpur", email: "avery@example.com", version: "v1", summary: "Builds APIs.",
    experience: [{ role: "Engineer", period: "2023 - Present", bullets: ["Shipped billing."] }], skills: ["TypeScript"]
  });

  assert.match(text, /AVERY LEE/);
  assert.match(text, /• Shipped billing\./);
  assert.match(text, /SKILLS\nTypeScript/);
});

test("resumeContentKey ignores the saved-version label", () => {
  const draft = { name: "Avery Lee", title: "Engineer", loc: "KL", email: "avery@example.com", version: "Draft · unsaved", summary: "Builds APIs.", experience: [], skills: ["TypeScript"] };
  assert.equal(resumeContentKey(draft), resumeContentKey({ ...draft, version: "Saved · Supabase v2" }));
  assert.notEqual(resumeContentKey(draft), resumeContentKey({ ...draft, summary: "Builds secure APIs." }));
});
