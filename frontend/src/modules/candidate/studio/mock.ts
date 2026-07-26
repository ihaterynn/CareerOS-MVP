// DISPLAY-ONLY mock ported from CareerOS Candidate.dc.html (studio state).
import type { StudioData } from "./types";

export const studioMock: StudioData = {
  atsScore: 78,
  keywordTotal: 12,
  matchedKeywords: ["PostgreSQL", "AWS", "Python", "Go", "TypeScript", "API design", "CI/CD", "Docker"],
  jds: [
    { label: "Senior SWE · Cempaka", text: "Senior Software Engineer. Build distributed systems and reliable API platforms. Strong system design, PostgreSQL, AWS, TypeScript, Go, CI/CD, Docker, and experiment design required.", missing: ["Distributed systems", "System design", "Experiment design"] },
    { label: "Data Product Eng · RinggitPay", text: "Data Product Engineer. Build data pipelines for payments products. Python, PostgreSQL, A/B testing, experiment design, AWS, and API design required.", missing: ["Experiment design", "Data pipelines", "A/B testing"] }
  ],
  resume: {
    name: "Aishah Rahman",
    title: "Backend Software Engineer",
    loc: "Petaling Jaya",
    email: "aishah.rahman@hantar.my",
    version: "v3 · active",
    summary:
      "Backend-focused engineer who turns operational logistics problems into reliable product systems with measurable business impact.",
    experience: [
      {
        role: "Software Engineer · Hantar",
        period: "2023–Present",
        bullets: [
          "Reduced order-assignment latency from 900ms to 210ms for Klang Valley dispatch.",
          "Built merchant dashboards and automated reconciliation jobs for SME users."
        ]
      },
      {
        role: "Junior Software Engineer · Jasa Tech",
        period: "2021–2023",
        bullets: ["Built internal tools and automated reconciliation for SME merchants."]
      }
    ],
    skills: ["Python", "TypeScript", "PostgreSQL", "Go", "AWS"]
  },
  suggestions: [
    {
      id: "s1",
      tag: "REWRITE · XYZ FORMULA",
      text: 'Reframe the latency bullet to surface "distributed systems" and quantified scope — from real work only.',
      field: "exp",
      ei: 0,
      bi: 0,
      replacement:
        "Cut order-assignment latency 77% (900ms→210ms) across a distributed matching service by profiling and re-indexing the PostgreSQL path — lifting throughput for ~12k daily orders.",
      removeKw: "Distributed systems",
      delta: 6,
      status: "pending"
    },
    {
      id: "s2",
      tag: "TONE · WEAK VERB",
      text: '"Built" → "Designed and shipped" in your summary for stronger ownership signal.',
      field: "summary",
      replacement:
        "Backend engineer who designs and ships reliable product systems from messy operational data, with measurable business impact.",
      delta: 2,
      status: "pending"
    }
  ],
  chat: [
    {
      role: "bot",
      text: "I compared your résumé to the Cempaka JD. You're missing distributed systems and system design — your latency work already proves both. Want me to reframe it? No fabrication."
    }
  ],
  templates: ["ATS Clean", "Modern"]
};

// Mock "agent" follow-up suggestion (spec §6: mock stream pushes a new pending card).
export function mockAgentSuggestion(n: number) {
  return {
    id: `s${n}`,
    tag: "KEYWORD · SYSTEM DESIGN",
    text: "Add a bullet naming a system-design decision you owned — closes the last JD gap.",
    field: "exp" as const,
    ei: 0,
    bi: 0,
    replacement:
      "Led the system-design review for the dispatch matching service, documenting scaling and failure-mode tradeoffs adopted across the platform team.",
    removeKw: "System design",
    delta: 5,
    status: "pending" as const
  };
}

export const AGENT_REPLY =
  "Added a suggestion to your review queue — it only surfaces real work (no invented metrics). Accept it to close the “system design” gap.";
