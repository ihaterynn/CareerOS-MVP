import "server-only";

import postgres from "postgres";
import { getCareerRootSnapshot } from "./career-root-db";
import { getLiveHiringPipelineSnapshot } from "./hiring-pipeline-live-db";
import type {
  CareerRootBranchRecord,
  CareerRootCandidate,
  CareerRootCourse,
  CareerRootRole,
  CareerRootRoute,
  CareerRootSnapshot
} from "./career-root-db";
import type { RoleTalentBoard, TalentMatch } from "./employer-data";

type MarketJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: string;
  requirements: string[] | null;
};

type Sql = ReturnType<typeof postgres>;
const globalForDatabase = globalThis as typeof globalThis & { careerOsMarketRootDb?: Sql };

function getDatabase(): Sql | null {
  if (!process.env.DATABASE_URL) return null;
  globalForDatabase.careerOsMarketRootDb ??= postgres(process.env.DATABASE_URL, {
    ssl: "require",
    max: 2,
    connect_timeout: 10,
    idle_timeout: 20,
    prepare: false
  });
  return globalForDatabase.careerOsMarketRootDb;
}

const clean = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9+#/.]+/g, " ").replace(/\s+/g, " ").trim();

const tokenSet = (value: string) =>
  new Set(clean(value).split(/[\s/]+/).filter((token) => token.length > 1));

function similarity(left: string, right: string) {
  const a = tokenSet(left);
  const b = tokenSet(right);
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  return overlap / Math.max(a.size, b.size);
}

function sharedRequirements(left: string[], right: string[]) {
  const rightNames = new Set(right.map(clean));
  return left.filter((requirement) => rightNames.has(clean(requirement)));
}

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
  const affinity = similarity(candidate.currentTrack, role.title);
  if (affinity >= 0.7) return "Grow";
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

function buildRoute(candidate: TalentMatch, role: RoleTalentBoard): CareerRootRoute {
  const bridgeSkills = role.roleSignals
    .filter((requirement) =>
      !candidate.skills.some((skill) => clean(skill.split("·")[0]) === clean(requirement))
    )
    .slice(0, 3);
  const resolvedBridge = bridgeSkills.length ? bridgeSkills : ["Role-scale systems ownership"];
  const readiness = Math.round(candidate.score * 0.55 + candidate.interestSignal * 0.2 + candidate.experienceFit * 0.25);

  return {
    id: `${candidate.id}-${role.id}`,
    title: role.title,
    track: careerTrack(candidate, role),
    readiness,
    horizon: resolvedBridge.length <= 1 ? "30–45 day bridge" : "60–90 day bridge",
    salaryRange: role.salary ?? "Compensation available on seeded listing",
    currentExpectedPay: "Candidate expectation retained in private profile",
    unlockedPayRange: role.salary ?? "Validate against the live role",
    marketSignal: `${role.team} has an active ${role.title} listing with ${role.roleSignals.length} capability signals.`,
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
    route: buildRoute(candidate, role),
    skillSignals: parsedSkills(candidate)
  };
}

function marketBranches(role: RoleTalentBoard, jobs: MarketJob[]): CareerRootBranchRecord[] {
  const direct: CareerRootBranchRecord = {
    id: `${role.id}-direct`,
    roleId: role.id,
    roleTitle: role.title,
    field: role.title,
    fitReason: `Direct evidence against the ${role.title} title and its seeded requirements.`,
    thresholdRelaxed: "No adjacent-title relaxation; candidates need direct title or multi-skill evidence.",
    sourceFields: [],
    matchSignals: role.roleSignals,
    isPrimary: true
  };

  const bestByTitle = new Map<string, { job: MarketJob; score: number; shared: string[] }>();
  for (const job of jobs) {
    if (job.id === role.id || clean(job.title) === clean(role.title)) continue;
    const requirements = job.requirements ?? [];
    const shared = sharedRequirements(role.roleSignals, requirements);
    const requirementScore = shared.length / Math.max(1, new Set([...role.roleSignals.map(clean), ...requirements.map(clean)]).size);
    const titleScore = similarity(role.title, job.title);
    const score = requirementScore * 0.72 + titleScore * 0.28;
    const key = clean(job.title);
    const existing = bestByTitle.get(key);
    if (!existing || score > existing.score) bestByTitle.set(key, { job, score, shared });
  }

  return [
    direct,
    ...[...bestByTitle.values()]
      .sort((a, b) => b.score - a.score || a.job.title.localeCompare(b.job.title))
      .slice(0, 4)
      .map(({ job, shared }, index) => ({
        id: `${role.id}-adjacent-${index}-${job.id}`,
        roleId: role.id,
        roleTitle: job.title,
        field: job.title,
        fitReason: shared.length
          ? `Shares ${shared.join(", ")} with ${role.title}; the adjacent market role is seeded at ${job.company}.`
          : `${job.title} is the closest seeded market title by transferable role and capability evidence.`,
        thresholdRelaxed: `Exact ${role.title} history is relaxed when candidates show ${((job.requirements ?? []).slice(0, 3)).join(", ") || "transferable delivery evidence"}.`,
        sourceFields: [],
        matchSignals: job.requirements ?? [],
        isPrimary: false
      }))
  ];
}

export async function getMarketCareerRootSnapshot(): Promise<CareerRootSnapshot> {
  const database = getDatabase();
  if (!database) return getCareerRootSnapshot();

  const [hiring, marketRows] = await Promise.all([
    getLiveHiringPipelineSnapshot(),
    database`
      select id, title, company, location, mode::text, requirements
      from public.job_listings
      where is_active = true
      order by company, title
    `
  ]);
  if (hiring.source !== "supabase") return getCareerRootSnapshot();
  const jobs = marketRows as unknown as MarketJob[];

  const roles = hiring.roles.map<CareerRootRole>((role) => ({
    id: role.id,
    title: role.title,
    team: role.team,
    location: role.location,
    priority: role.priority,
    openings: role.openings,
    candidatePoolSize: role.candidatePoolSize,
    hiringGoal: `Discover direct and adjacent-role candidates for ${role.title} from live market evidence.`,
    roleSignals: role.roleSignals,
    candidates: role.applicants.map((candidate) => toCandidate(candidate, role))
  }));
  const branches = hiring.roles.flatMap((role) => marketBranches(role, jobs));

  return roles.length && branches.length
    ? { source: "supabase", roles, branches }
    : getCareerRootSnapshot();
}
