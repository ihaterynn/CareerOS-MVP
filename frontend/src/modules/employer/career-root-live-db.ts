import "server-only";

import { getLiveHiringPipelineSnapshot } from "./hiring-pipeline-live-db";
import { getCareerRootSnapshot } from "./career-root-db";
import type {
  CareerRootBranchRecord,
  CareerRootCandidate,
  CareerRootCourse,
  CareerRootRole,
  CareerRootRoute,
  CareerRootSnapshot
} from "./career-root-db";
import type { RoleTalentBoard, TalentMatch } from "./employer-data";

const branches: CareerRootBranchRecord[] = [
  {
    id: "software-engineering",
    field: "Computer Science & Engineering",
    fitReason: "Software delivery, architecture, and implementation evidence transfer directly into technical roles.",
    thresholdRelaxed: "Degree-title matching is replaced by demonstrated systems and implementation evidence.",
    sourceFields: ["Computer Science", "Software Engineering"]
  },
  {
    id: "data-analytics",
    field: "Data & Analytics",
    fitReason: "Analytical reasoning, SQL, machine-learning, and measurable decision evidence can bridge into product engineering.",
    thresholdRelaxed: "Prior job title is relaxed when data and technical delivery evidence is strong.",
    sourceFields: ["Data Analytics", "Machine Learning"]
  },
  {
    id: "cloud-infrastructure",
    field: "Cloud & Infrastructure",
    fitReason: "Platform, distributed-systems, DevOps, and cloud signals reveal candidates with strong operational depth.",
    thresholdRelaxed: "Application-stack recency is relaxed in favour of architecture and production ownership.",
    sourceFields: ["Cloud Infrastructure", "Platform Engineering"]
  },
  {
    id: "product-operations",
    field: "Product & Operations",
    fitReason: "Cross-functional delivery and systems thinking can translate into technical product and analyst roles.",
    thresholdRelaxed: "Pure coding tenure is relaxed when implementation and technical collaboration evidence is present.",
    sourceFields: ["Product Operations", "Business Analysis"]
  },
  {
    id: "design-quality",
    field: "Design, UX & Quality",
    fitReason: "User-centred design, prototyping, quality, and validation evidence can unlock adjacent product roles.",
    thresholdRelaxed: "Conventional engineering titles are relaxed for candidates with relevant delivery evidence.",
    sourceFields: ["Design Experience", "Quality Engineering"]
  }
];

const clean = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim();

function sourceField(candidate: TalentMatch) {
  const evidence = clean(`${candidate.currentTrack} ${candidate.skills.join(" ")}`);
  if (/(ux|ui|design|figma|prototype)/.test(evidence)) return "Design Experience";
  if (/(quality|qa|test automation|testing)/.test(evidence)) return "Quality Engineering";
  if (/(data analyst|data scientist|machine learning|tensorflow|pytorch|spark)/.test(evidence)) return "Data Analytics";
  if (/(cloud|devops|platform|kubernetes|aws|infrastructure)/.test(evidence)) return "Cloud Infrastructure";
  if (/(product manager|business analyst|operations)/.test(evidence)) return "Product Operations";
  return "Computer Science";
}

function parsedSkills(candidate: TalentMatch) {
  return candidate.skills.map((skill, index) => {
    const [namePart, levelPart] = skill.split("·").map((part) => part.trim());
    const level = Number(levelPart?.replace(/\D/g, "")) || Math.max(50, candidate.skillFit - index * 4);
    return {
      id: `${candidate.id}-${clean(namePart).replace(/\s/g, "-")}`,
      name: namePart,
      category: index < 3 ? "Core" as const : index < 6 ? "Adjacent" as const : "Emerging" as const,
      level,
      evidence: candidate.highlights.find((item) => clean(item).includes(clean(namePart))) ?? "Verified seeded skill signal"
    };
  });
}

function careerTrack(candidate: TalentMatch, role: RoleTalentBoard): CareerRootRoute["track"] {
  const current = clean(candidate.currentTrack);
  const target = clean(role.title);
  if (current === target || current.includes(target) || target.includes(current)) return "Grow";
  if (candidate.skillFit >= 78) return "Specialize";
  if (candidate.score >= 68) return "Adjacent";
  return "Pivot";
}

function courseFor(candidate: TalentMatch, gap: string, index: number): CareerRootCourse {
  return {
    id: `${candidate.id}-${clean(gap).replace(/\s/g, "-")}-${index}`,
    title: `${gap} applied pathway`,
    provider: "CareerOS Skills Network",
    partner: "Industry learning partner",
    targetSkill: gap,
    duration: index === 0 ? "4 weeks" : "3 weeks",
    url: "#"
  };
}

export function buildEvidenceRoute(candidate: TalentMatch, role: RoleTalentBoard): CareerRootRoute {
  const requirementGaps = role.roleSignals.filter((requirement) =>
    candidate.missingSignals.some((gap) => clean(gap).includes(clean(requirement)))
  );
  const bridgeSkills = requirementGaps.length
    ? requirementGaps.slice(0, 3)
    : role.roleSignals.filter((requirement) =>
        !candidate.skills.some((skill) => clean(skill).includes(clean(requirement)))
      ).slice(0, 3);
  const resolvedBridge = bridgeSkills.length ? bridgeSkills : ["Role-scale systems ownership"];
  const track = careerTrack(candidate, role);
  const readiness = Math.round(candidate.score * 0.55 + candidate.interestSignal * 0.2 + candidate.experienceFit * 0.25);

  return {
    id: `${candidate.id}-${role.id}`,
    title: role.title,
    track,
    readiness,
    horizon: resolvedBridge.length <= 1 ? "30–45 day bridge" : "60–90 day bridge",
    salaryRange: role.salary ?? "Seeded role compensation available on listing",
    currentExpectedPay: "Candidate expectation retained in private profile",
    unlockedPayRange: role.salary ?? "Validate against the live role",
    marketSignal: `${role.team} has an active ${role.title} listing with ${role.roleSignals.length} explicit capability signals.`,
    whyRealistic: [
      candidate.highlights[0] ?? `${candidate.currentTrack} evidence transfers into the role`,
      candidate.highlights[1] ?? `${candidate.skillFit}% capability alignment`,
      `${candidate.interestSignal}% learning and intent signal`
    ],
    bridgeSkills: resolvedBridge,
    requiredSignals: resolvedBridge.map((skill) => `Demonstrate ${skill} in a role-scale scenario`),
    projects: candidate.portfolio.slice(0, 2).length
      ? candidate.portfolio.slice(0, 2)
      : [`Build a scoped ${role.title} proof-of-capability project`],
    nextMilestones: [
      `Validate ${resolvedBridge[0]} with a practical assessment`,
      "Complete one evidence-backed learning sprint",
      `Review readiness for ${role.title} with the hiring panel`
    ],
    sourceSignals: [...candidate.skills.slice(0, 3), ...candidate.dnaSignals.slice(0, 2)],
    courses: resolvedBridge.slice(0, 2).map((gap, index) => courseFor(candidate, gap, index))
  };
}

function toCandidate(candidate: TalentMatch, role: RoleTalentBoard): CareerRootCandidate {
  return {
    ...candidate,
    candidateId: candidate.id,
    sourceField: sourceField(candidate),
    reviewStatus: "New",
    route: buildEvidenceRoute(candidate, role),
    skillSignals: parsedSkills(candidate)
  };
}

export async function getLiveCareerRootSnapshot(): Promise<CareerRootSnapshot> {
  const snapshot = await getLiveHiringPipelineSnapshot();
  if (snapshot.source !== "supabase") return getCareerRootSnapshot();

  const roles = snapshot.roles.map<CareerRootRole>((role) => ({
    id: role.id,
    title: role.title,
    team: role.team,
    location: role.location,
    priority: role.priority,
    openings: role.openings,
    candidatePoolSize: role.candidatePoolSize,
    hiringGoal: `Find adjacent talent and produce evidence-based bridges into ${role.title}.`,
    roleSignals: role.roleSignals,
    candidates: role.applicants.map((candidate) => toCandidate(candidate, role))
  }));

  return roles.length
    ? { source: "supabase", roles, branches }
    : getCareerRootSnapshot();
}
