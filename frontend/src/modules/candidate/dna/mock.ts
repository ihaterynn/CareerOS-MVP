// DISPLAY-ONLY mock (spec §5) — ported from CareerOS Candidate.dc.html.
// The question pool + results are NOT a validated instrument; the UI labels
// the flow "Demo — not a validated assessment". Real scoring is a backend blocker.

import type { DnaData } from "./types";

export const dnaMock: DnaData = {
  profile: {
    name: "Aishah Rahman",
    short: "AR",
    meta: "Software Engineer · Petaling Jaya · Parsed from résumé v3",
    skills: ["Python", "PostgreSQL", "TypeScript"],
    extraSkills: 8,
    instruments: { mbti: "INTJ-A", disc: "C · D", enneagram: "5w6" },
    traitBars: [
      { label: "Analytical", value: 92, color: "var(--accent)" },
      { label: "Structure", value: 82, color: "var(--accent)" },
      { label: "Ownership", value: 85, color: "var(--accent)" },
      { label: "Collaboration", value: 62, color: "var(--info)" },
      { label: "Communication", value: 56, color: "var(--info)" }
    ],
    bestFit: [
      { role: "Backend Platform", level: "Strong", color: "var(--risk-good)" },
      { role: "Data Products", level: "Good", color: "var(--accent)" },
      { role: "People Management", level: "Stretch", color: "var(--text-3)" }
    ],
    summary:
      "An analytical builder who thrives in structured, autonomy-heavy teams. Turns messy operational problems into reliable systems and measurable impact — happiest owning a service end-to-end with room for deep focus."
  },
  instruments: [
    { id: "mbti", label: "MBTI", total: 60, result: "INTJ-A" },
    { id: "disc", label: "DISC", total: 28, result: "C · D · Analyst" },
    { id: "enneagram", label: "Enneagram", total: 45, result: "5w6" }
  ]
};

// Demo question pool + Likert scale (ref QPOOL/LIKERT). DISPLAY-ONLY.
export const QUESTION_POOL = [
  "I plan my work well ahead and dislike leaving decisions to the last minute.",
  "I prefer to understand a system deeply before I start acting on it.",
  "I recharge with focused solo time more than with group settings.",
  "I trust logic and evidence over gut feeling when I decide.",
  "I like clear structure and well-defined processes.",
  "I enjoy exploring abstract ideas and long-term possibilities."
];

export const LIKERT = ["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"];

export const DONE_RESULT: Record<string, string> = { mbti: "INTJ-A", disc: "C · D", enneagram: "5w6" };
export const DONE_BLURB: Record<string, string> = {
  mbti: "The Architect — strategic, analytical, independent. Now woven into your DNA profile.",
  disc: "Conscientious-Dominant — precise, results-driven, systems-minded.",
  enneagram: "The Investigator — perceptive, focused, knowledge-seeking."
};

// Emerging/live result bars per instrument.
export const LIVE_BARS: Record<string, Array<{ a: string; b: string; width: string }>> = {
  mbti: [
    { a: "I", b: "E", width: "72%" },
    { a: "N", b: "S", width: "66%" },
    { a: "T", b: "F", width: "81%" },
    { a: "J", b: "P", width: "58%" }
  ],
  disc: [
    { a: "D", b: "", width: "70%" },
    { a: "I", b: "", width: "38%" },
    { a: "S", b: "", width: "44%" },
    { a: "C", b: "", width: "86%" }
  ],
  enneagram: [
    { a: "5", b: "", width: "88%" },
    { a: "6", b: "", width: "54%" },
    { a: "1", b: "", width: "40%" }
  ]
};
