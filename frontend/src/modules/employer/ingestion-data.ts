export type IngestionRole = "Senior Product Designer" | "Backend Engineer" | "Data Analyst";

export type ExtractedCv = {
  id: string;
  name: string;
  source: string;
  role: IngestionRole;
  location: string;
  years: number;
  skills: string[];
  confidence: number;
  degreeRelevant?: boolean;
  status?: "missing contact" | "duplicate fingerprint" | "parse failed";
};

export type QualifiedCv = ExtractedCv & { score: number; skillCluster: string; experienceBand: string; gap: string };
export type AggregationMode = "skillCluster" | "experienceBand" | "location" | "gap";

const roles: Record<IngestionRole, { skills: string[]; cluster: string; minYears?: number; requiresRelevantDegree?: boolean }> = {
  "Senior Product Designer": { skills: ["Figma", "Research", "Design systems"], cluster: "Product craft", minYears: 5 },
  "Backend Engineer": { skills: ["TypeScript", "Node.js", "PostgreSQL"], cluster: "Platform engineering", minYears: 5, requiresRelevantDegree: true },
  "Data Analyst": { skills: ["SQL", "Python", "Tableau"], cluster: "Decision science" }
};

const evidenceGapById: Record<string, string> = {
  "cv-01": "Stakeholder influence",
  "cv-02": "Architecture review",
  "cv-03": "Experiment design",
  "cv-04": "People mentorship",
  "cv-05": "Design leadership",
  "cv-06": "Data storytelling",
  "cv-07": "Architecture review",
  "cv-08": "Stakeholder influence",
  "cv-09": "Experiment design",
  "cv-10": "People mentorship",
  "cv-11": "Design leadership"
};

const cv = (id: string, name: string, role: IngestionRole, location: string, years: number, skills: string[], confidence = 96, status?: ExtractedCv["status"]): ExtractedCv => ({
  id,
  name,
  source: `${name.toLowerCase().replaceAll(" ", "-")}-cv.pdf`,
  role,
  location,
  years,
  skills,
  confidence,
  status
});

export const extractedCvs: ExtractedCv[] = [
  cv("cv-01", "Aisha Rahman", "Senior Product Designer", "Kuala Lumpur", 7, ["Figma", "Research", "Design systems", "Prototyping"]),
  cv("cv-02", "Daniel Lee", "Backend Engineer", "Singapore", 6, ["TypeScript", "Node.js", "PostgreSQL", "AWS"]),
  cv("cv-03", "Mei Tan", "Data Analyst", "Kuala Lumpur", 5, ["SQL", "Python", "Tableau", "dbt"]),
  cv("cv-04", "Kavin Raj", "Backend Engineer", "Penang", 8, ["TypeScript", "Node.js", "PostgreSQL", "Kafka"]),
  cv("cv-05", "Nur Amina", "Senior Product Designer", "Kuala Lumpur", 6, ["Figma", "Research", "Design systems", "Accessibility"]),
  cv("cv-06", "Jason Wong", "Data Analyst", "Singapore", 4, ["SQL", "Python", "Tableau", "Excel"]),
  cv("cv-07", "Siti Hawa", "Backend Engineer", "Johor Bahru", 5, ["TypeScript", "Node.js", "PostgreSQL", "Docker"]),
  cv("cv-08", "Irfan Malik", "Senior Product Designer", "Penang", 5, ["Figma", "Research", "Design systems", "Framer"]),
  cv("cv-09", "Chloe Lim", "Data Analyst", "Kuala Lumpur", 6, ["SQL", "Python", "Tableau", "Looker"]),
  cv("cv-10", "Pradeep Nair", "Backend Engineer", "Kuala Lumpur", 7, ["TypeScript", "Node.js", "PostgreSQL", "Redis"]),
  cv("cv-11", "Hannah Teo", "Senior Product Designer", "Singapore", 4, ["Figma", "Research", "Design systems", "Content design"]),
  cv("cv-12", "Farid Aziz", "Data Analyst", "Kuala Lumpur", 3, ["SQL", "R"]),
  cv("cv-13", "Liam Goh", "Backend Engineer", "Penang", 2, ["JavaScript", "Node.js", "MongoDB"]),
  cv("cv-14", "Evelyn Chua", "Senior Product Designer", "Kuala Lumpur", 2, ["Figma", "Illustration", "Webflow"]),
  cv("cv-15", "Marcus Tan", "Data Analyst", "Singapore", 2, ["Excel", "SQL", "Power BI"]),
  cv("cv-16", "Ariq Zain", "Backend Engineer", "Kuala Lumpur", 2, ["Python", "Django", "MySQL"]),
  cv("cv-17", "Yuna Park", "Senior Product Designer", "Singapore", 2, ["Sketch", "Figma", "Prototyping"]),
  cv("cv-18", "Terry Ong", "Data Analyst", "Penang", 1, ["Excel", "Python", "Power BI"]),
  cv("cv-19", "Unknown Candidate", "Backend Engineer", "Kuala Lumpur", 4, ["TypeScript", "Node.js"], 88, "missing contact"),
  cv("cv-20", "Daniel Lee", "Backend Engineer", "Singapore", 6, ["TypeScript", "Node.js", "PostgreSQL"], 96, "duplicate fingerprint"),
  cv("cv-21", "Unreadable Scan", "Data Analyst", "Kuala Lumpur", 0, [], 32, "parse failed"),
  cv("cv-22", "Noor Iman", "Senior Product Designer", "Kuala Lumpur", 3, ["Figma", "Research"], 91, "missing contact"),
  cv("cv-23", "Marcus Tan", "Data Analyst", "Singapore", 2, ["Excel", "SQL", "Power BI"], 95, "duplicate fingerprint"),
  cv("cv-24", "Damaged Export", "Backend Engineer", "Penang", 0, [], 19, "parse failed")
];

function qualify(candidate: ExtractedCv): QualifiedCv {
  const requirement = roles[candidate.role];
  const matchedSkills = candidate.skills.filter((skill) => requirement.skills.includes(skill)).length;
  const score = Math.min(98, 42 + matchedSkills * 15 + Math.min(candidate.years, 6) * 3);

  return {
    ...candidate,
    score,
    skillCluster: requirement.cluster,
    experienceBand: candidate.years >= 6 ? "Senior experience" : candidate.years >= 4 ? "Established experience" : "Early experience",
    gap: evidenceGapById[candidate.id] ?? "Portfolio evidence"
  };
}

export function buildIngestionResult(candidates = extractedCvs) {
  const silver = candidates.filter((candidate) => !candidate.status);
  const rejected = candidates.filter((candidate) => candidate.status).map((candidate) => ({
    ...candidate,
    reason: candidate.status as NonNullable<ExtractedCv["status"]>
  }));
  const qualified = silver.map(qualify);
  const gold = qualified.filter((candidate) => candidate.score >= 70);

  return { bronze: candidates, silver, gold, rejected };
}

export function aggregateGoldCandidates(candidates: QualifiedCv[], by: AggregationMode) {
  const counts = new Map<string, number>();

  for (const candidate of candidates) {
    const label = candidate[by];
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

export function rejectionBreakdown(records: Array<ExtractedCv & { reason: NonNullable<ExtractedCv["status"]> }>) {
  const counts = new Map<NonNullable<ExtractedCv["status"]>, number>();

  for (const record of records) counts.set(record.reason, (counts.get(record.reason) ?? 0) + 1);
  return [...counts].map(([label, count]) => ({ label, count }));
}

export const mockDailyCvs: ExtractedCv[] = Array.from({ length: 1000 }, (_, index) => {
  const role = (Object.keys(roles) as IngestionRole[])[index % 3];
  const job = roles[role];
  const passed = index < 24;
  const reviewable = index >= 24 && index < 350;
  const hardPass = passed || reviewable;

  return {
    id: `daily-mock-${index + 1}`,
    name: `Candidate ${String(index + 1).padStart(4, "0")}`,
    source: `candidate-${String(index + 1).padStart(4, "0")}.pdf`,
    role,
    location: ["Kuala Lumpur", "Penang", "Singapore"][index % 3],
    years: hardPass ? job.minYears ?? 2 : Math.max(0, (job.minYears ?? 2) - 2),
    skills: passed ? job.skills : reviewable ? job.skills.slice(0, 1 + (index % (job.skills.length - 1))) : ["Excel"],
    confidence: 96,
    degreeRelevant: hardPass,
  };
});

export type ReviewRecommendation = "Passed" | "Reviewable";

export type DailyReviewCandidate = QualifiedCv & {
  matchedRequirements: number;
  requiredRequirements: number;
  recommendation: ReviewRecommendation;
  hardFilterReasons: string[];
  evidence: Array<{ label: string; detail: string; passed: boolean }>;
};

export function buildDailyReviewDesk(candidates = extractedCvs, role?: IngestionRole) {
  const assessed = candidates.filter((candidate) => !candidate.status).map((candidate) => {
    const job = roles[candidate.role];
    const hardFilterReasons = [
      ...(job.minYears && candidate.years < job.minYears ? [`Requires ${job.minYears}+ years of relevant experience`] : []),
      ...(job.requiresRelevantDegree && !candidate.degreeRelevant ? ["Requires a relevant degree"] : [])
    ];
    return { ...qualify(candidate), hardFilterReasons };
  });
  const eligible = assessed.filter((candidate) => candidate.hardFilterReasons.length === 0);
  const toReviewCandidate = (candidate: (typeof eligible)[number]): DailyReviewCandidate => {
      const requirements = roles[candidate.role].skills;
      const matchedRequirements = candidate.skills.filter((skill) => requirements.includes(skill)).length;
      const recommendation: ReviewRecommendation = matchedRequirements === requirements.length ? "Passed" : "Reviewable";

      return {
        ...candidate,
        matchedRequirements,
        requiredRequirements: requirements.length,
        recommendation,
        hardFilterReasons: [],
        evidence: [
          { label: "Hard filters", detail: "Experience and required qualifications passed", passed: true },
          { label: "Core requirements", detail: `${matchedRequirements} of ${requirements.length} matched`, passed: recommendation === "Passed" },
          { label: "Relevant experience", detail: `${candidate.years} years in comparable work`, passed: candidate.years >= 4 },
          { label: "CV quality", detail: `${candidate.confidence}% extraction confidence`, passed: candidate.confidence >= 90 }
        ]
      };
    };
  const passed = eligible.filter((candidate) => candidate.skills.filter((skill) => roles[candidate.role].skills.includes(skill)).length === roles[candidate.role].skills.length).map(toReviewCandidate);
  const remainingReviewSlots = Math.max(0, Math.round(candidates.length * 0.35) - passed.length);
  const partialMatches = eligible
    .filter((candidate) => candidate.skills.filter((skill) => roles[candidate.role].skills.includes(skill)).length < roles[candidate.role].skills.length)
    .map(toReviewCandidate)
    .sort((left, right) => right.score - left.score || right.years - left.years);
  const reviewable = partialMatches.slice(0, remainingReviewSlots);
  const deferred = partialMatches.slice(remainingReviewSlots);
  const visiblePassed = passed.filter((candidate) => !role || candidate.role === role);
  const visibleReviewable = reviewable.filter((candidate) => !role || candidate.role === role);
  const queue = [...visiblePassed, ...visibleReviewable].sort((left, right) => right.score - left.score || right.years - left.years);
  const ineligible = assessed.filter((candidate) => candidate.hardFilterReasons.length > 0);

  return {
    totalReceived: candidates.length,
    autoFiltered: ineligible.length,
    reviewReady: passed.length + reviewable.length,
    queue,
    passed,
    reviewable,
    ineligible,
    deferred,
    hardFilterBreakdown: [...new Set(ineligible.flatMap((candidate) => candidate.hardFilterReasons))].map((label) => ({ label, count: ineligible.filter((candidate) => candidate.hardFilterReasons.includes(label)).length })),
    roles: (Object.keys(roles) as IngestionRole[]).map((title) => ({ title, count: passed.filter((candidate) => candidate.role === title).length + reviewable.filter((candidate) => candidate.role === title).length }))
  };
}
