import assert from "node:assert/strict";
import test from "node:test";

import { applyRefinement, refinementFrames, validateRefinement } from "./refinement";

test("a cached experience refinement replaces the whole role without inventing a new target", () => {
  const resume = {
    name: "Nur Aina Rahman", title: "Cloud Engineer", loc: "Kuala Lumpur", email: "aina@example.com", version: "Draft", summary: "cloud engineer do alot cloud work.",
    experience: [{ role: "Cloud Engineer · Nimbus", period: "2023 – Present", bullets: ["did 15 cloud architecture solution for 7 enterprise client.", "make log shipping scripts and it reduce cost by 74%."] }], skills: ["AWS"]
  };
  const refinement = validateRefinement({
    target: "experience", experienceIndex: 0,
    title: "Strengthen Cloud Engineer", rationale: "Clarifies existing impact.",
    bullets: ["Delivered 15 cloud architecture solutions for seven enterprise clients.", "Automated log-shipping scripts, reducing enterprise-license costs by 74%."]
  }, resume);

  const next = applyRefinement(resume, refinement);
  assert.deepEqual(next.experience[0]?.bullets, ["Delivered 15 cloud architecture solutions for seven enterprise clients.", "Automated log-shipping scripts, reducing enterprise-license costs by 74%."]);
  assert.equal(next.summary, resume.summary);
  assert.equal(resume.experience[0]?.bullets[0], "did 15 cloud architecture solution for 7 enterprise client.");
});

test("a cached profile refinement changes only the profile", () => {
  const resume = { name: "Avery", title: "Cloud Engineer", loc: "KL", email: "a@b.com", version: "Draft", summary: "i do aws.", experience: [], skills: [] };
  const refinement = validateRefinement({ target: "summary", title: "Improve profile", rationale: "Keeps the original AWS evidence.", replacement: "Cloud engineer with AWS experience." }, resume);

  assert.equal(applyRefinement(resume, refinement).summary, "Cloud engineer with AWS experience.");
});

test("a valid rewrite remains usable when the model omits optional rationale", () => {
  const resume = { name: "Avery", title: "Cloud Engineer", loc: "KL", email: "a@b.com", version: "Draft", summary: "i do aws.", experience: [], skills: [] };
  const refinement = validateRefinement({ target: "summary", title: "Improve profile", replacement: "Cloud engineer with AWS experience." }, resume);

  assert.equal(refinement.rationale, "Grounded rewrite from your draft.");
});

test("an overlong rationale is trimmed instead of rejecting a valid rewrite", () => {
  const resume = { name: "Avery", title: "Cloud Engineer", loc: "KL", email: "a@b.com", version: "Draft", summary: "i do aws.", experience: [], skills: [] };
  const refinement = validateRefinement({ target: "summary", title: "Improve profile", rationale: "x".repeat(400), replacement: "Cloud engineer with AWS experience." }, resume);

  assert.equal(refinement.rationale.length, 240);
});

test("a section refinement names the JD requirements it strengthens", () => {
  const resume = { name: "Avery", title: "Cloud Engineer", loc: "KL", email: "a@b.com", version: "Draft", summary: "i do aws.", experience: [], skills: [] };
  const refinement = validateRefinement({ target: "summary", title: "Improve profile", replacement: "Cloud engineer with AWS experience.", coverage: ["AWS operations", "Enterprise reliability"] }, resume);

  assert.deepEqual(refinement.coverage, ["AWS operations", "Enterprise reliability"]);
});

test("experience refinements reveal each rewritten bullet before the completed draft", () => {
  const resume = { name: "Avery", title: "Cloud Engineer", loc: "KL", email: "a@b.com", version: "Draft", summary: "AWS.", experience: [{ role: "Cloud Engineer", period: "2024", bullets: ["old one", "old two"] }], skills: [] };
  const refinement = validateRefinement({ target: "experience", experienceIndex: 0, title: "Improve role", replacement: undefined, bullets: ["new one", "new two"] }, resume);

  const frames = refinementFrames(resume, refinement);
  assert.deepEqual(frames.map((frame) => frame.experience[0]?.bullets), [["new one", "old two"], ["new one", "new two"]]);
});
