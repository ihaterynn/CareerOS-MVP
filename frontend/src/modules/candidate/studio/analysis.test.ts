import assert from "node:assert/strict";
import test from "node:test";

import { calibrateQualityScore, fallbackAnalyses, freshAnalysisSuggestions, parseStudioPayload, validateModelResults } from "./analysis";

test("fallbackAnalyses reports JD keywords missing from the resume", () => {
  const results = fallbackAnalyses(
    { summary: "Built backend APIs", skills: ["Python", "TypeScript"] },
    [{ id: "platform", label: "Platform engineer", text: "Python TypeScript Kubernetes" }]
  );

  assert.deepEqual(results, [
    {
      jobDescriptionId: "platform",
      atsScore: 67,
      qualityScore: 67,
      missing: ["Kubernetes"],
      suggestions: [],
      refinementTargets: []
    }
  ]);
});

test("validateModelResults makes fresh model suggestions actionable", () => {
  const [result] = validateModelResults({
    results: [{ jobDescriptionId: "platform", atsScore: 80, qualityScore: 74, missing: [], suggestions: [{ id: "s1", tag: "KEYWORD", text: "Add evidence", field: "summary", replacement: "Evidence", delta: 3 }] }]
  }, [{ id: "platform", label: "Platform engineer", text: "Kubernetes" }]);

  assert.equal(result?.suggestions[0]?.status, "pending");
  assert.equal(result?.qualityScore, 74);
});

test("validateModelResults keeps rewrites separate from evidence gaps", () => {
  const [result] = validateModelResults({
    results: [{
      jobDescriptionId: "platform", atsScore: 80, qualityScore: 74, missing: ["Kubernetes"],
      recommendations: [{ id: "r1", tag: "GRAMMAR · SAFE", text: "Tighten this sentence.", field: "summary", replacement: "Built APIs.", delta: 2 }],
      suggestions: [{ id: "s1", tag: "EVIDENCE · KUBERNETES", text: "Add Kubernetes only if you can describe a real deployment or operational task.", delta: 5 }]
    }]
  }, [{ id: "platform", label: "Platform engineer", text: "Kubernetes" }]);

  assert.equal(result?.suggestions[0]?.kind, "recommendation");
  assert.equal(result?.suggestions[1]?.kind, "suggestion");
  assert.equal(result?.suggestions[1]?.replacement, "");
});

test("validateModelResults retains the JD requirement and current evidence behind a recommendation", () => {
  const [result] = validateModelResults({
    results: [{ jobDescriptionId: "platform", atsScore: 80, qualityScore: 74, missing: [], recommendations: [{ id: "r1", tag: "PROFILE", text: "Make the AWS impact clearer.", field: "summary", replacement: "AWS engineer.", delta: 3, jdRequirement: "AWS infrastructure automation", evidence: "Built AWS services for enterprise clients." }], suggestions: [] }]
  }, [{ id: "platform", label: "Platform engineer", text: "AWS infrastructure automation" }]);

  assert.equal(result?.suggestions[0]?.jdRequirement, "AWS infrastructure automation");
  assert.equal(result?.suggestions[0]?.evidence, "Built AWS services for enterprise clients.");
});

test("validateModelResults keeps only AI-selected section rewrite targets", () => {
  const [result] = validateModelResults({
    results: [{ jobDescriptionId: "platform", atsScore: 80, qualityScore: 74, missing: [], recommendations: [], suggestions: [], refinementTargets: [{ target: "experience", experienceIndex: 0, title: "Strengthen Cloud Engineer", reason: "Make the AWS automation evidence easier to scan.", jdRequirement: "AWS automation" }] }]
  }, [{ id: "platform", label: "Platform engineer", text: "AWS automation" }]);

  assert.deepEqual(result?.refinementTargets, [{ target: "experience", experienceIndex: 0, title: "Strengthen Cloud Engineer", reason: "Make the AWS automation evidence easier to scan.", jdRequirement: "AWS automation" }]);
});

test("fresh analysis replaces the old recommendation queue instead of retaining accepted cards", () => {
  const fresh = freshAnalysisSuggestions([{ id: "new", kind: "recommendation", tag: "PROFILE", text: "Use current evidence.", field: "summary", replacement: "Current profile.", delta: 2, status: "pending" }], new Set(["new"]));

  assert.deepEqual(fresh.map((item) => [item.id, item.status]), [["new", "accepted"]]);
});

test("quality score blends role fit with a complete résumé's document quality", () => {
  assert.equal(calibrateQualityScore(42, 90), 59);
});

test("validateModelResults condenses overly long guidance into one actionable sentence", () => {
  const [result] = validateModelResults({
    results: [{ jobDescriptionId: "platform", atsScore: 80, qualityScore: 74, missing: [], recommendations: [], suggestions: [{ id: "s1", tag: "EVIDENCE", text: "Add Kubernetes evidence if it is real. Explain every cluster, deployment, and operational detail you can remember so the recruiter understands the full context.", delta: 4 }] }]
  }, [{ id: "platform", label: "Platform engineer", text: "Kubernetes" }]);

  assert.equal(result?.suggestions[0]?.text, "Add Kubernetes evidence if it is real.");
});

test("validateModelResults caps each AI queue at three high-impact items", () => {
  const items = Array.from({ length: 6 }, (_, index) => ({ id: `r${index}`, tag: "GRAMMAR · SAFE", text: `Tighten sentence ${index}.`, field: "summary", replacement: `Tight sentence ${index}.`, delta: 1 }));
  const [result] = validateModelResults({ results: [{ jobDescriptionId: "platform", atsScore: 80, qualityScore: 74, missing: [], recommendations: items, suggestions: [] }] }, [{ id: "platform", label: "Platform engineer", text: "Kubernetes" }]);

  assert.equal(result?.suggestions.length, 3);
});

test("parseStudioPayload enforces the five-JD batch limit", () => {
  const jd = { id: "jd", label: "Role", text: "TypeScript" };

  assert.throws(() => parseStudioPayload({ resume: { summary: "API work" }, jobDescriptions: Array.from({ length: 6 }, (_, index) => ({ ...jd, id: `${index}` })) }), /1 to 5/);
});

test("parseStudioPayload allows saving a resume before adding a JD", () => {
  const payload = parseStudioPayload({ resume: { summary: "API work" }, jobDescriptions: [] }, { requireJobDescriptions: false });

  assert.deepEqual(payload.jobDescriptions, []);
});
