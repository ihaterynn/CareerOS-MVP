// DISPLAY-ONLY MOCK — no parser, no model, no storage. Drives the UI flow only.
// The scripted "parse" below pretends to have read Aishah Rahman's résumé so the demo has
// grounded-looking evidence spans. Replace wholesale in the backend phase (spec §6.4).

import type { Fact, GapTurn, OnboardingSession, Turn } from "./types";

export const PARSE_STEPS = [
  "Reading résumé — 2 pages, text layer detected",
  "Found 2 roles across 5 years",
  "Extracted 12 skills with evidence",
  "Detected 1 degree, 3 certifications",
  "Cross-checking dates for gaps — none found"
];

/** Facts the mock parser "recovers" from the résumé. All provisional until confirmed. */
export const PARSED_FACTS: Fact[] = [
  {
    id: "fact-identity.name",
    dimension: "identity",
    key: "identity.name",
    label: "Name",
    value: "Aishah Rahman",
    source: "parsed",
    confidence: 0.99,
    evidence: "AISHAH RAHMAN — Software Engineer"
  },
  {
    id: "fact-identity.role",
    dimension: "identity",
    key: "identity.role",
    label: "Current role",
    value: "Software Engineer",
    source: "parsed",
    confidence: 0.97,
    evidence: "Software Engineer, Hantar — 2023 to Present"
  },
  {
    id: "fact-identity.location",
    dimension: "identity",
    key: "identity.location",
    label: "Location",
    value: "Petaling Jaya, Selangor",
    source: "parsed",
    confidence: 0.91,
    evidence: "Petaling Jaya, Selangor · aishah.r@example.com"
  },
  {
    id: "fact-experience.current",
    dimension: "experience",
    key: "experience.current",
    label: "Current employer",
    value: "Hantar",
    source: "parsed",
    confidence: 0.96,
    evidence: "Software Engineer, Hantar — 2023 to Present"
  },
  {
    id: "fact-experience.tenure",
    dimension: "experience",
    key: "experience.tenure",
    label: "Experience",
    value: "5 years across 2 companies",
    source: "parsed",
    confidence: 0.88,
    evidence: "Jasa Tech 2021–2023 · Hantar 2023–Present"
  },
  {
    id: "fact-skills.core",
    dimension: "skills",
    key: "skills.core",
    label: "Core skills",
    value: ["Python", "TypeScript", "PostgreSQL"],
    source: "parsed",
    confidence: 0.93,
    evidence: "Skills: Python, TypeScript, PostgreSQL, Go, Docker, AWS"
  }
];

/**
 * Gap questions the selector draws from. Deliberately more than the flow will ask —
 * selection is coverage-driven, so the tail only surfaces if earlier answers leave it relevant.
 */
export const GAP_BANK: GapTurn[] = [
  {
    id: "gap-impact",
    kind: "gap",
    dimension: "experience",
    writes: "experience.impact",
    label: "Signature impact",
    say: "Your résumé says you cut order-assignment latency at Hantar. What was the actual before → after?",
    because: "Numbers are what employers screen on — your résumé has the story but not the delta.",
    control: { kind: "text", placeholder: "e.g. 900ms → 210ms for Klang Valley dispatch", multiline: true }
  },
  {
    id: "gap-depth",
    kind: "gap",
    dimension: "skills",
    writes: "skills.depth",
    label: "Go depth",
    say: "You listed Go. Production work, or side projects so far?",
    because: "I'd rather rate it honestly than inflate it.",
    control: { kind: "chips", options: ["Production", "Side projects", "Learning it"] }
  },
  {
    id: "gap-emerging",
    kind: "gap",
    dimension: "skills",
    writes: "skills.emerging",
    label: "Growing into",
    say: "What are you actively growing into right now?",
    because: "This drives your Career Twin paths, not just today's matches.",
    control: {
      kind: "multi",
      options: ["Machine learning", "System design", "Platform engineering", "Data products", "Leadership"],
      max: 3
    }
  },
  {
    id: "gap-work-mode",
    kind: "gap",
    dimension: "preferences",
    writes: "pref.work_mode",
    label: "Work mode",
    say: "How do you want to work?",
    control: { kind: "chips", options: ["Hybrid", "Remote-first", "Onsite"] }
  },
  {
    id: "gap-salary",
    kind: "gap",
    dimension: "preferences",
    writes: "pref.salary",
    label: "Salary expectation",
    say: "What monthly range are you targeting?",
    because: "Kept private — it filters your matches, employers never see the number.",
    control: { kind: "range", min: 6000, max: 25000, step: 500, unit: "RM" }
  },
  {
    id: "gap-commute",
    kind: "gap",
    dimension: "preferences",
    writes: "pref.commute",
    label: "Commute limit",
    say: "How far are you willing to commute on an office day?",
    control: { kind: "range", min: 10, max: 90, step: 5, unit: "min" }
  },
  {
    id: "gap-interests",
    kind: "gap",
    dimension: "preferences",
    writes: "pref.interests",
    label: "Domains",
    say: "Which domains actually interest you?",
    control: {
      kind: "multi",
      options: ["Fintech", "Logistics", "Health", "Gov tech", "Developer tools", "E-commerce"],
      max: 3
    }
  },
  {
    id: "gap-location",
    kind: "gap",
    dimension: "identity",
    writes: "identity.location",
    label: "Location",
    say: "Where are you based?",
    control: { kind: "location" }
  },
  {
    id: "gap-role",
    kind: "gap",
    dimension: "identity",
    writes: "identity.role",
    label: "Current role",
    say: "What's your current title?",
    control: { kind: "text", placeholder: "e.g. Software Engineer" }
  },
  {
    id: "gap-name",
    kind: "gap",
    dimension: "identity",
    writes: "identity.name",
    label: "Name",
    say: "What should I call you?",
    control: { kind: "text", placeholder: "Full name" }
  },
  {
    id: "gap-employer",
    kind: "gap",
    dimension: "experience",
    writes: "experience.current",
    label: "Current employer",
    say: "Where are you working now?",
    control: { kind: "text", placeholder: "Company name" }
  },
  {
    id: "gap-tenure",
    kind: "gap",
    dimension: "experience",
    writes: "experience.tenure",
    label: "Experience",
    say: "Roughly how many years have you been working?",
    control: { kind: "chips", options: ["0–2 years", "3–5 years", "6–9 years", "10+ years"] }
  },
  {
    id: "gap-core-skills",
    kind: "gap",
    dimension: "skills",
    writes: "skills.core",
    label: "Core skills",
    say: "What do you actually build with day to day?",
    control: {
      kind: "multi",
      options: ["Python", "TypeScript", "Go", "Java", "PostgreSQL", "React", "AWS", "Kubernetes"],
      max: 6
    }
  }
];

export const DNA_DRAFT = {
  summaryMd:
    "Backend-leaning product engineer with five years shipping latency-sensitive dispatch and " +
    "payments systems. Strongest signal is measurable optimization work — you reach for profiling " +
    "and query tuning before rewrites. Analytical and ownership-heavy; collaboration signal is " +
    "thinner, mostly because your résumé describes systems rather than teams.",
  bestFit: [
    { role: "Backend Platform", level: "Strong" },
    { role: "Data Products", level: "Good" },
    { role: "People Management", level: "Stretch" }
  ]
};

export const INTAKE_TURN: Turn = {
  id: "turn-intake",
  kind: "intake",
  say: "Let's build your Career DNA. Drop your résumé and I'll read it — or just tell me about yourself and we'll work from there."
};

export const emptySession: OnboardingSession = {
  candidateName: null,
  sourceKind: null,
  history: [{ turn: INTAKE_TURN, status: "pending" }],
  queue: [INTAKE_TURN],
  facts: [],
  visibility: "private",
  dnaSummary: null,
  completed: false
};
