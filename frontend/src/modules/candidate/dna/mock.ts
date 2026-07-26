// DISPLAY-ONLY mock (spec §5) — ported from CareerOS Candidate.dc.html.
// The question pool + results are NOT a validated instrument; the UI labels
// the flow "Demo — not a validated assessment". Real scoring is a backend blocker.

import type { DnaData } from "./types";

export const dnaMock: DnaData = {
  profile: {
    name: "Nur Aina Rahman",
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
      "An analytical builder who thrives in structured, autonomy-heavy teams. Turns messy operational problems into reliable systems and measurable impact — happiest owning a service end-to-end with room for deep focus.",
    careerGuidance: {
      workProfile: {
        satisfactionScore: 76,
        summary: "Technical depth and ownership are energising; broader stakeholder influence is the next growth area.",
        energizers: ["Deep systems work", "End-to-end delivery"],
        drains: ["Limited cross-team influence"]
      },
      currentRole: {
        role: "Software Engineer",
        score: 87,
        summary: "A strong fit for systems-heavy engineering: your analytical depth, structure, and ownership align with the work. Collaboration is the clearest growth edge for broader scope.",
        dimensions: [
          { label: "Systems thinking", value: 92, detail: "Enjoys deep problem framing and reliable architecture.", evidence: "Reduced order-assignment latency in a production dispatch system." },
          { label: "Autonomy", value: 89, detail: "Works best with clear outcomes and room to own execution.", evidence: "Built merchant dashboards and automated reconciliation jobs." },
          { label: "Delivery discipline", value: 84, detail: "Turns operational ambiguity into measurable improvements.", evidence: "Delivered measurable latency improvements for Klang Valley dispatch." },
          { label: "Stakeholder influence", value: 62, detail: "A useful stretch area before managing broader initiatives.", evidence: "The résumé contains limited cross-team leadership evidence." }
        ]
      },
      suggestions: [
        { path: "Explore", role: "Backend Platform Engineer", score: 91, reason: "Your systems focus, PostgreSQL depth, and preference for end-to-end ownership map directly to platform work.", evidence: "Production dispatch latency and automated reconciliation work.", nextStep: "Lead one reliability or developer-experience improvement from proposal to rollout." },
        { path: "Explore", role: "Data Product Engineer", score: 84, reason: "You combine data curiosity with production engineering and have evidence in dispatch tooling and analytics workflows.", evidence: "Merchant dashboards and reconciliation workflows.", nextStep: "Build one governed data product or experiment pipeline with a product partner." },
        { path: "Promotion", role: "Senior Software Engineer", score: 86, reason: "You already show technical ownership; the next level needs visible technical direction and stronger cross-team communication.", evidence: "Measurable ownership of production reliability work.", nextStep: "Own an architecture review and mentor a teammate through a production delivery." }
      ]
    }
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
