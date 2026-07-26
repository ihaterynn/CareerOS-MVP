import "server-only";

import postgres from "postgres";
import { getRelevantJobCandidates } from "./jobby-relevant-db";

export type JobbyRole = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: string;
  salary?: string;
  requirements: string[];
};

export type JobbyCandidateSource = "Applied" | "Shortlisted" | "Relevant";

export type JobbyCandidate = {
  id: string;
  name: string;
  initials: string;
  currentRole: string;
  status: string;
  source: JobbyCandidateSource;
  score: number;
  summary: string;
  skills: string[];
  experience: string[];
  highlights: string[];
  gaps: string[];
  nextStep?: string;
};

export type JobbyScope = {
  job: JobbyRole;
  candidates: JobbyCandidate[];
  appliedCount: number;
  shortlistedCount: number;
  relevantCount: number;
};

export type JobbyBootstrap = {
  organization: string;
  roles: JobbyRole[];
  initialScope: JobbyScope | null;
  connected: boolean;
  warning?: string;
};

type Sql = ReturnType<typeof postgres>;
const globalForJobby = globalThis as typeof globalThis & { careerOsJobbyDb?: Sql };

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  globalForJobby.careerOsJobbyDb ??= postgres(connectionString, {
    ssl: "require",
    max: 4,
    connect_timeout: 10,
    idle_timeout: 20,
    prepare: false
  });
  return globalForJobby.careerOsJobbyDb;
}

const clean = (value: string | null | undefined) =>
  (value ?? "").toLowerCase().replace(/[^a-z0-9+#/.]+/g, " ").replace(/\s+/g, " ").trim();

const words = (value: string) =>
  new Set(clean(value).split(/[\s/]+/).filter((word) => word.length > 1));

function affinity(left: string, right: string) {
  const a = words(left);
  const b = words(right);
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / Math.max(1, Math.min(a.size, b.size));
}

const safeScore = (value: number | null | undefined, fallback = 0) =>
  Math.max(0, Math.min(100, Math.round(value ?? fallback)));

const list = (value: string[] | null | undefined) => value?.filter(Boolean) ?? [];

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

type EmployerRow = { id: string; name: string };
type JobRow = {
  id: string;
  employer_id: string;
  title: string;
  company: string;
  location: string;
  mode: string;
  salary: string | null;
  requirements: string[] | null;
};
type ApplicationRow = {
  candidate_id: string;
  status: string;
  submitted_at: string | null;
  next_step: string | null;
};
type BoardRow = { id: string; title: string };
type BoardApplicantRow = {
  talent_match_id: string;
  status: string;
  score: number | null;
  skill_fit: number | null;
  experience_fit: number | null;
  summary: string | null;
  highlights: string[] | null;
  missing_signals: string[] | null;
};
type MatchRow = {
  id: string;
  candidate_id: string;
  name: string;
  current_track: string | null;
  summary: string | null;
  score: number | null;
  skill_fit: number | null;
  experience_fit: number | null;
  skills: string[] | null;
  experience: string[] | null;
  highlights: string[] | null;
  missing_signals: string[] | null;
  career_interests: string[] | null;
};
type ProfileRow = {
  id: string;
  name: string;
  current_role_title: string | null;
  summary: string | null;
};
type SkillRow = { candidate_id: string; name: string; level: number };
type ExperienceRow = {
  candidate_id: string;
  role: string;
  company: string;
  period: string;
  impact: string[] | null;
  sort_order: number;
};

function toRole(row: JobRow): JobbyRole {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    mode: row.mode,
    salary: row.salary ?? undefined,
    requirements: list(row.requirements)
  };
}

async function employerAndJobs(sql: Sql) {
  const configuredName = process.env.CAREEROS_EMPLOYER_NAME ?? "Cempaka Digital";
  let employers = await sql`
    select id, name
    from public.employers
    where lower(name) = lower(${configuredName})
    limit 1
  ` as unknown as EmployerRow[];

  if (!employers.length) {
    employers = await sql`
      select id, name
      from public.employers
      order by created_at, name
      limit 1
    ` as unknown as EmployerRow[];
  }

  const employer = employers[0];
  if (!employer) return { employer: null, jobs: [] as JobRow[] };

  const jobs = await sql`
    select id, employer_id, title, company, location, mode::text, salary, requirements
    from public.job_listings
    where employer_id = ${employer.id} and is_active = true
    order by created_at desc, title
    limit 20
  ` as unknown as JobRow[];

  return { employer, jobs };
}

function relevantMatchScore(match: MatchRow, job: JobRow) {
  const role = affinity(match.current_track ?? "", job.title);
  const skills = Math.max(
    0,
    ...list(match.skills).map((skill) => affinity(skill, job.requirements?.join(" ") ?? ""))
  );
  const interests = affinity(list(match.career_interests).join(" "), `${job.title} ${list(job.requirements).join(" ")}`);
  return role * 0.5 + skills * 0.35 + interests * 0.15;
}

export async function getJobbyScope(jobId: string): Promise<JobbyScope> {
  const sql = database();
  if (!sql) throw new Error("DATABASE_URL is not configured.");

  const { employer, jobs } = await employerAndJobs(sql);
  if (!employer) throw new Error("No employer is available.");
  const job = jobs.find((item) => item.id === jobId);
  if (!job) throw new Error("That job is not available to this employer.");

  const [applicationResult, boardResult, allMatchesResult] = await Promise.all([
    sql`
      select candidate_id, status::text, submitted_at, next_step
      from public.candidate_applications
      where job_id = ${job.id}
    `,
    sql`
      select id, title
      from public.role_talent_boards
      where employer_id = ${employer.id}
    `,
    sql`
      select
        id, candidate_id, name, current_track, summary, score,
        skill_fit, experience_fit, skills, experience, highlights,
        missing_signals, career_interests
      from public.talent_matches
    `
  ]);

  const applications = (applicationResult as unknown as ApplicationRow[])
    .filter((item) => clean(item.status) !== "draft");
  const boards = (boardResult as unknown as BoardRow[])
    .filter((board) => clean(board.title) === clean(job.title) || affinity(board.title, job.title) >= 0.7);
  const boardIds = boards.map((board) => board.id);
  const boardApplicants = boardIds.length
    ? await sql`
        select
          talent_match_id, status::text, score, skill_fit, experience_fit,
          summary, highlights, missing_signals
        from public.role_talent_board_applicants
        where role_board_id = any(${boardIds}::uuid[])
      ` as unknown as BoardApplicantRow[]
    : [];

  const matches = allMatchesResult as unknown as MatchRow[];
  const matchById = new Map(matches.map((match) => [match.id, match]));
  const matchByCandidate = new Map(matches.map((match) => [match.candidate_id, match]));
  const applicationByCandidate = new Map(applications.map((application) => [application.candidate_id, application]));
  const boardByMatch = new Map(
    boardApplicants
      .filter((item) => !["rejected", "declined"].includes(clean(item.status)))
      .map((item) => [item.talent_match_id, item])
  );

  const scopedMatchIds = new Set(boardByMatch.keys());
  for (const application of applications) {
    const match = matchByCandidate.get(application.candidate_id);
    if (match) scopedMatchIds.add(match.id);
  }

  const curatedRelevant = matches
    .filter((match) => !scopedMatchIds.has(match.id))
    .map((match) => ({ match, relevance: relevantMatchScore(match, job) }))
    .filter((item) => item.relevance >= 0.28)
    .sort((a, b) => b.relevance - a.relevance || (b.match.score ?? 0) - (a.match.score ?? 0))
    .slice(0, 8);
  for (const item of curatedRelevant) scopedMatchIds.add(item.match.id);

  const candidates: JobbyCandidate[] = [...scopedMatchIds]
    .map<JobbyCandidate | null>((matchId) => {
      const match = matchById.get(matchId);
      if (!match) return null;
      const application = applicationByCandidate.get(match.candidate_id);
      const board = boardByMatch.get(match.id);
      const source: JobbyCandidateSource = application
        ? "Applied"
        : board && clean(board.status) === "shortlisted"
          ? "Shortlisted"
          : board
            ? "Shortlisted"
            : "Relevant";
      const roleRelevance = relevantMatchScore(match, job);
      const score = board?.score ?? Math.round(
        (match.skill_fit ?? match.score ?? 60) * 0.5 +
        (match.experience_fit ?? match.score ?? 60) * 0.3 +
        Math.min(100, roleRelevance * 100) * 0.2
      );
      return {
        id: match.candidate_id,
        name: match.name,
        initials: initials(match.name),
        currentRole: match.current_track ?? "Candidate",
        status: application?.status ?? board?.status ?? "Relevant match",
        source,
        score: safeScore(score),
        summary: board?.summary ?? match.summary ?? "Professional evidence is available in the hiring pipeline.",
        skills: list(match.skills).slice(0, 8),
        experience: list(match.experience).slice(0, 5),
        highlights: (list(board?.highlights).length ? list(board?.highlights) : list(match.highlights)).slice(0, 5),
        gaps: (list(board?.missing_signals).length ? list(board?.missing_signals) : list(match.missing_signals)).slice(0, 5),
        nextStep: application?.next_step ?? undefined
      } satisfies JobbyCandidate;
    })
    .filter((candidate): candidate is JobbyCandidate => candidate !== null);

  const unmatchedApplicationIds = applications
    .map((item) => item.candidate_id)
    .filter((candidateId) => !matchByCandidate.has(candidateId))
    .slice(0, 12);

  if (unmatchedApplicationIds.length) {
    const [profileResult, skillResult, experienceResult] = await Promise.all([
      sql`
        select id, name, current_role_title, summary
        from public.candidate_profiles
        where id = any(${unmatchedApplicationIds}::uuid[])
      `,
      sql`
        select candidate_id, name, level
        from public.skill_signals
        where candidate_id = any(${unmatchedApplicationIds}::uuid[])
        order by level desc
      `,
      sql`
        select candidate_id, role, company, period, impact, sort_order
        from public.candidate_experience
        where candidate_id = any(${unmatchedApplicationIds}::uuid[])
        order by sort_order
      `
    ]);
    const skills = skillResult as unknown as SkillRow[];
    const experiences = experienceResult as unknown as ExperienceRow[];
    for (const profile of profileResult as unknown as ProfileRow[]) {
      const application = applicationByCandidate.get(profile.id);
      const candidateSkills = skills.filter((item) => item.candidate_id === profile.id).slice(0, 8);
      const candidateExperience = experiences.filter((item) => item.candidate_id === profile.id).slice(0, 5);
      const requirementText = list(job.requirements).join(" ");
      const skillFit = candidateSkills.length
        ? candidateSkills.reduce((sum, skill) => sum + skill.level * Math.max(0.25, affinity(skill.name, requirementText)), 0) /
          candidateSkills.length
        : 45;
      const roleFit = Math.max(
        affinity(profile.current_role_title ?? "", job.title),
        ...candidateExperience.map((item) => affinity(item.role, job.title))
      );
      candidates.push({
        id: profile.id,
        name: profile.name,
        initials: initials(profile.name),
        currentRole: profile.current_role_title ?? "Candidate",
        status: application?.status ?? "Applied",
        source: "Applied",
        score: safeScore(skillFit * 0.65 + roleFit * 35, 50),
        summary: profile.summary ?? "Application profile on file.",
        skills: candidateSkills.map((skill) => `${skill.name} · ${skill.level}%`),
        experience: candidateExperience.map((item) => `${item.role} · ${item.company} · ${item.period}`),
        highlights: candidateExperience.flatMap((item) => list(item.impact)).slice(0, 5),
        gaps: [],
        nextStep: application?.next_step ?? undefined
      });
    }
  }

  if (candidates.length < 12) {
    candidates.push(
      ...await getRelevantJobCandidates(sql, toRole(job), candidates.map((candidate) => candidate.id))
    );
  }

  const ranked = candidates
    .sort((a, b) => {
      const sourceRank = { Applied: 0, Shortlisted: 1, Relevant: 2 };
      return sourceRank[a.source] - sourceRank[b.source] || b.score - a.score;
    })
    .slice(0, 18);

  return {
    job: toRole(job),
    candidates: ranked,
    appliedCount: ranked.filter((candidate) => candidate.source === "Applied").length,
    shortlistedCount: ranked.filter((candidate) => candidate.source === "Shortlisted").length,
    relevantCount: ranked.filter((candidate) => candidate.source === "Relevant").length
  };
}

export async function getJobbyBootstrap(): Promise<JobbyBootstrap> {
  const sql = database();
  if (!sql) {
    return {
      organization: "Employer workspace",
      roles: [],
      initialScope: null,
      connected: false,
      warning: "DATABASE_URL is not configured."
    };
  }

  try {
    const { employer, jobs } = await employerAndJobs(sql);
    const roles = jobs.map(toRole);
    const initialScope = roles[0] ? await getJobbyScope(roles[0].id) : null;
    return {
      organization: employer?.name ?? "Employer workspace",
      roles,
      initialScope,
      connected: true,
      warning: roles.length ? undefined : "No active job listings are available for this employer."
    };
  } catch (error) {
    console.error("Jobby.ai bootstrap failed", error);
    return {
      organization: "Employer workspace",
      roles: [],
      initialScope: null,
      connected: false,
      warning: "The hiring pipeline connection is unavailable."
    };
  }
}
