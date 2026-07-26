import assert from "node:assert/strict";
import test from "node:test";

import { profileAvailability, profileFromResume } from "./profile.ts";

test("derives the current role and experience totals from a saved resume", () => {
  const profile = profileFromResume({
    name: "Nur Aina Rahman",
    title: "Backend Software Engineer",
    loc: "Petaling Jaya",
    email: "aina@example.com",
    version: "v3",
    summary: "",
    skills: [],
    experience: [
      { role: "Software Engineer · Hantar", period: "2023–Present", bullets: [] },
      { role: "Junior Software Engineer · Jasa Tech", period: "2021–2023", bullets: [] }
    ]
  }, 2026);

  assert.deepEqual(profile, { name: "Nur Aina Rahman", role: "Software Engineer", location: "Petaling Jaya", skills: [], currentYears: 3, totalYears: 5 });
});

test("marks a missing active resume as upload-ready instead of loading", () => {
  assert.equal(profileAvailability(undefined, "no_active_resume"), "missing");
});
