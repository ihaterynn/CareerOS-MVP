import type { CandidateModuleId, NavigationItem } from "@careeros/shared";

export type SkillSignal = {
  name: string;
  level: number;
  category: "Core" | "Adjacent" | "Emerging";
  evidence: string;
};

export const candidateModules: Array<NavigationItem<CandidateModuleId>> = [
  {
    id: "tracker",
    label: "Application Tracker",
    description: "Every role, every company — pipeline, funnel, reminders."
  },
  {
    id: "dna",
    label: "Candidate DNA",
    description: "Your profile decoded — traits, instruments, best-fit roles."
  },
  {
    id: "studio",
    label: "Resume Studio",
    description: "Tailor to any JD, review AI diffs, export ATS-safe PDF/DOCX."
  }
];

export const candidateProfile = {
  name: "Nur Aina Rahman",
  currentRole: "Software Engineer",
  location: "Petaling Jaya, Selangor",
  coordinates: { lat: 3.1073, lng: 101.6067 },
  commutePreferenceMinutes: 35,
  workPreferences: ["Hybrid", "Remote-first", "Product engineering teams"],
  salaryExpectation: "RM 11,000 - 15,000 / month",
  relocationFlexibility: "Open within Klang Valley",
  careerInterests: ["Backend platform", "Data products", "Routing optimization", "Fintech"],
  education: [
    {
      school: "Universiti Malaya",
      credential: "B.CompSc (Hons), Software Engineering",
      year: "2021"
    }
  ],
  experience: [
    {
      role: "Software Engineer",
      company: "Hantar",
      period: "2023 - Present",
      impact: "Reduced order assignment latency from 900ms to 210ms for Klang Valley dispatch."
    },
    {
      role: "Junior Software Engineer",
      company: "Jasa Tech",
      period: "2021 - 2023",
      impact: "Built merchant dashboards and automated reconciliation jobs for SME users."
    }
  ],
  certifications: [
    "AWS Cloud Practitioner",
    "Meta Front-End Developer Certificate",
    "Google Data Analytics Foundation"
  ],
  portfolio: [
    "Route optimizer proof of concept using Python and OR-Tools",
    "React operations dashboard for rider dispatch monitoring",
    "PostgreSQL query tuning notes from high-volume order matching"
  ],
  learningSignals: [
    "Completed 18 hours of data science content in the last 30 days",
    "Saved 4 machine learning job descriptions",
    "Practiced 6 system design interview prompts this month"
  ]
};

export const skillSignals: SkillSignal[] = [
  {
    name: "Python",
    level: 88,
    category: "Core",
    evidence: "Production dispatch tooling, optimization scripts, analytics notebooks"
  },
  {
    name: "TypeScript",
    level: 82,
    category: "Core",
    evidence: "React dashboards, API clients, form-heavy internal tools"
  },
  {
    name: "PostgreSQL",
    level: 78,
    category: "Core",
    evidence: "Query tuning, reconciliation jobs, operational reporting"
  },
  {
    name: "Go",
    level: 63,
    category: "Adjacent",
    evidence: "Matching service rewrite and platform service maintenance"
  },
  {
    name: "Machine Learning",
    level: 42,
    category: "Emerging",
    evidence: "Learning signal only: course activity and saved job requirements"
  },
  {
    name: "System Design",
    level: 56,
    category: "Emerging",
    evidence: "Interview practice, service ownership, no formal architecture review history yet"
  }
];
