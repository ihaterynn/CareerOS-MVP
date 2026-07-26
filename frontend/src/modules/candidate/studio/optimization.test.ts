import assert from "node:assert/strict";
import test from "node:test";

import { formattingChecks, isGrammarRewrite, isOneClickSafe, personalDetailChecks, resumeQuality, suggestionPhase } from "./optimization";

test("personalDetailChecks identifies missing contact details without flagging present fields", () => {
  assert.deepEqual(personalDetailChecks({ name: "Avery Lee", title: "Engineer", loc: "", email: "", version: "Draft", summary: "", experience: [], skills: [] }), ["Add a location so recruiters can assess eligibility.", "Add a professional contact email."]);
});

test("formattingChecks catches résumé basics that affect ATS readability", () => {
  assert.deepEqual(formattingChecks({ name: "Avery Lee", title: "Engineer", loc: "KL", email: "avery@example.com", version: "Draft", summary: "Engineer", experience: [{ role: "Engineer", period: "2024", bullets: [] }], skills: [] }), ["Replace the duplicate profile with a two-line value proposition.", "Add at least one outcome-focused bullet for each role.", "Add a focused skills section with tools named in the target role."]);
});

test("suggestionPhase follows the resume refinement journey", () => {
  assert.equal(suggestionPhase({ tag: "PROFILE · INTRO", text: "Introduce the candidate's relevant profile.", field: "summary", replacement: "x", delta: 1, id: "0", status: "pending" }), "recommendations");
  assert.equal(suggestionPhase({ tag: "GRAMMAR · CLARITY", text: "Make this sentence easier to read.", field: "summary", replacement: "x", delta: 1, id: "grammar", status: "pending" }), "content");
  assert.equal(suggestionPhase({ tag: "FORMAT · ATS", text: "Use a standard heading.", field: "summary", replacement: "x", delta: 1, id: "1", status: "pending" }), "ats");
  assert.equal(suggestionPhase({ tag: "EVIDENCE", text: "Quantify delivery.", field: "exp", replacement: "x", delta: 1, id: "2", status: "pending" }), "content");
  assert.equal(suggestionPhase({ tag: "KEYWORD", text: "Name AWS.", field: "summary", replacement: "x", delta: 1, id: "3", status: "pending" }), "content");
});

test("isOneClickSafe allows only fact-preserving grammar suggestions to auto-apply", () => {
  assert.equal(isOneClickSafe({ tag: "GRAMMAR · SAFE", text: "Tighten the sentence.", field: "summary", replacement: "Built 3 AWS services.", delta: 1, id: "safe", status: "pending" }, "Built 3 AWS services."), true);
  assert.equal(isOneClickSafe({ tag: "GRAMMAR · SAFE", text: "Tighten the sentence.", field: "summary", replacement: "Built 3 Kubernetes services.", delta: 1, id: "unsafe", status: "pending" }, "Built 3 AWS services."), false);
  assert.equal(isOneClickSafe({ tag: "FORMAT · SECTION", text: "Add a projects section.", field: "summary", replacement: "x", delta: 1, id: "review", status: "pending" }, "x"), false);
});

test("grammar rewrites are absorbed by section refinement instead of shown as recommendations", () => {
  assert.equal(isGrammarRewrite({ tag: "GRAMMAR · CLARITY", text: "Tighten this sentence.", field: "summary", replacement: "Tighter sentence.", delta: 1, id: "grammar", status: "pending" }), true);
  assert.equal(isGrammarRewrite({ tag: "EVIDENCE", text: "Add a real metric.", field: "exp", replacement: "", delta: 1, id: "evidence", status: "pending" }), false);
});

test("resumeQuality rewards grounded, recruiter-readable evidence", () => {
  const quality = resumeQuality({ name: "Avery Lee", title: "Cloud Engineer", loc: "Kuala Lumpur", email: "avery@example.com", version: "Draft", summary: "Cloud engineer with five years building reliable AWS platforms for enterprise teams.", experience: [{ role: "Cloud Engineer", period: "2022 – Present", bullets: ["Reduced deployment time by 40% by automating AWS release workflows.", "Built Kubernetes observability dashboards used by 12 product teams."] }], skills: ["AWS", "Kubernetes", "Terraform", "TypeScript", "CI/CD", "Prometheus"] });

  assert.equal(quality.score, 100);
  assert.deepEqual(quality.checks, []);
});
