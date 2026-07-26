import assert from "node:assert/strict";
import test from "node:test";
import { mapCandidateApplication, mapCvIngestionRecord } from "./backend-data.ts";

test("maps a joined Supabase application into the tracker UI contract", () => {
  const result = mapCandidateApplication({
    id: "app-1",
    status: "Review",
    submitted_at: "Jul 18",
    resume_version: "v3",
    next_step: "Follow up with recruiter",
    job: {
      title: "Data Product Engineer",
      company: "RinggitPay",
      location: "Bangsar South",
      salary: "RM 10.5–13.5k",
      mode: "Remote-first",
      match_overall: 87
    }
  });

  assert.deepEqual(result, {
    id: "app-1",
    role: "Data Product Engineer",
    company: "RinggitPay",
    short: "Ri",
    location: "Bangsar South",
    mode: "remote",
    salary: "RM 10.5–13.5k",
    source: "careeros",
    status: "screening",
    match: 87,
    nextAction: "Follow up with recruiter",
    due: "Submitted Jul 18",
    dueTone: "neutral",
    contact: { name: "—", role: "No contact yet", initials: "?" },
    timeline: [{ title: "Under review", detail: "Jul 18 · résumé v3", status: "screening" }]
  });
});

test("maps a Supabase CV record without changing its deterministic qualification inputs", () => {
  assert.deepEqual(
    mapCvIngestionRecord({
      id: "cv-01",
      name: "Aisha Rahman",
      source: "aisha-rahman-cv.pdf",
      role: "Senior Product Designer",
      location: "Kuala Lumpur",
      years: 7,
      skills: ["Figma", "Research", "Design systems"],
      confidence: 96,
      status: null
    }),
    {
      id: "cv-01",
      name: "Aisha Rahman",
      source: "aisha-rahman-cv.pdf",
      role: "Senior Product Designer",
      location: "Kuala Lumpur",
      years: 7,
      skills: ["Figma", "Research", "Design systems"],
      confidence: 96,
      status: undefined
    }
  );
});
