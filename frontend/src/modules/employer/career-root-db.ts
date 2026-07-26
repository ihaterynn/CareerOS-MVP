import "server-only";

import postgres from "postgres";
import {
  careerRootBranches as demoBranches,
  roleTalentBoards as demoRoles,
  type TalentMatch
} from "./employer-data";

export type CareerRootDataSource = "supabase" | "demo";

export type CareerRootCourse = {
  id: string;
  title: string;
  provider: string;
  partner: string;
  targetSkill: string;
  duration: string;
  url: string;
};

export type CareerRootRoute = {
  id: string;
  title: string;
  track: "Grow" | "Pivot" | "Specialize" | "Adjacent";
  readiness: number;
  horizon: string;
  salaryRange: string;
  currentExpectedPay: string;
  unlockedPayRange: string;
  marketSignal: string;
  whyRealistic: string[];
  bridgeSkills: string[];
  requiredSignals: string[];
  projects: string[];
  nextMilestones: string[];
  sourceSignals: string[];
  courses: CareerRootCourse[];
};

export type CareerRootSkill = {
  id: string;
  name: string;
  category: "Core" | "Adjacent" | "Emerging";
  level: number;
  evidence: string;
};

export type CareerRootCandidate = TalentMatch & {
  candidateId: string;
  reviewStatus: "New" | "Shortlisted" | "Rejected";
  route: CareerRootRoute | null;
  skillSignals: CareerRootSkill[];
};

export type CareerRootRole = {
  id: string;
  title: string;
  team: string;
  location: string;
  priority: "Urgent" | "Active" | "Pipeline";
  openings: number;
  candidatePoolSize?: number;
  hiringGoal: string;
  roleSignals: string[];
  candidates: CareerRootCandidate[];
};

export type CareerRootBranchRecord = {
  id: string;
  roleId?: string;
  roleTitle?: string;
  field: string;
  fitReason: string;
  thresholdRelaxed: string;
  sourceFields: string[];
  matchSignals?: string[];
  isPrimary?: boolean;
};

export type CareerRootSnapshot = {
  source: CareerRootDataSource;
  roles: CareerRootRole[];
  branches: CareerRootBranchRecord[];
};

type Sql = ReturnType<typeof postgres>;
const globalForDatabase = globalThis as typeof globalThis & {
  careerOsCareerRootDb?: Sql;
};

function getDatabase(): Sql | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  globalForDatabase.careerOsCareerRootDb ??= postgres(connectionString, {
    ssl: "require",
    max: 3,
    connect_timeout: 10,
    idle_timeout: 20,
    prepare: false
  });

  return globalForDatabase.careerOsCareerRootDb;
}

type DbRole = {
  id: string;
  title: string;
  team: string | null;
  location: string | null;
  priority: CareerRootRole["priority"];
  openings: number;
  hiring_goal: string | null;
  role_signals: string[] | null;
};

type DbBranch = {
  id: string;
  field: string;
  fit_reason: string | null;
  threshold_relaxed: string | null;
};

type DbApplicant = {
  role_board_id: string;
  talent_match_id: string;
  score: number | null;
  summary: string | null;
  skill_fit: number | null;
  experience_fit: number | null;
  education_fit: number | null;
  interest_signal: number | null;
  highlights: string[] | null;
  missing_signals: string[] | null;
  mobility_intent: string | null;
  status: CareerRootCandidate["reviewStatus"];
};

type DbMatch = {
  id: string;
  candidate_id: string;
  name: string;
  current_track: string | null;
  source_field: string | null;
  location: string | null;
  summary: string | null;
  score: number | null;
  education_fit: number | null;
  skill_fit: number | null;
  experience_fit: number | null;
  interest_signal: number | null;
  skills: string[] | null;
  education: string | null;
  experience: string[] | null;
  certifications: string[] | null;
  portfolio: string[] | null;
  career_interests: string[] | null;
  learning_signals: string[] | null;
  dna_signals: string[] | null;
  mobility_intent: string | null;
  highlights: string[] | null;
  missing_signals: string[] | null;
};

type DbRoute = {
  id: string;
  candidate_id: string;
  title: string;
  track: CareerRootRoute["track"];
  readiness: number;
  horizon: string | null;
  salary_range: string | null;
  current_expected_pay: string | null;
  unlocked_pay_range: string | null;
  market_signal: string | null;
  why_realistic: string[] | null;
  bridge_skills: string[] | null;
  required_signals: string[] | null;
  projects: string[] | null;
  next_milestones: string[] | null;
  source_signals: string[] | null;
};

type DbCourse = {
  id: string;
  route_id: string;
  title: string;
  provider: string;
  partner: string | null;
  target_skill: string | null;
  duration: string | null;
  url: string | null;
};

type DbSkill = {
  id: string;
  candidate_id: string;
  name: string;
  category: CareerRootSkill["category"];
  level: number;
  evidence: string | null;
};

const list = (value: string[] | null | undefined) => value ?? [];
const value = (number: number | null | undefined) => number ?? 0;
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function sourceFieldsForBranch(field: string): string[] {
  const normalized = field.toLowerCase();
  if (normalized.includes("computer") || normalized.includes("engineering")) {
    return ["Computer Science", "Engineering"];
  }
  if (normalized.includes("economics") || normalized.includes("operations")) {
    return ["Economics", "Operations"];
  }
  if (normalized.includes("business") || normalized.includes("product")) {
    return ["Business", "Product"];
  }
  return [field];
}

function buildFallback(): CareerRootSnapshot {
  return {
    source: "demo",
    roles: demoRoles.map((role) => ({
      id: role.id,
      title: role.title,
      team: role.team,
      location: role.location,
      priority: role.priority,
      openings: role.openings,
      hiringGoal: role.hiringGoal,
      roleSignals: role.roleSignals,
      candidates: role.applicants.map((candidate) => ({
        ...candidate,
        candidateId: candidate.id,
        reviewStatus: "New" as const,
        route: null,
        skillSignals: candidate.skills.slice(0, 4).map((skill, index) => ({
          id: `${candidate.id}-${skill}`,
          name: skill,
          category: index < 2 ? "Core" as const : "Adjacent" as const,
          level: Math.max(55, candidate.skillFit - index * 5),
          evidence: candidate.highlights[index] ?? candidate.summary
        }))
      }))
    })),
    branches: demoBranches.map((branch, index) => ({
      id: `demo-branch-${index}`,
      field: branch.field,
      fitReason: branch.fitReason,
      thresholdRelaxed: branch.thresholdRelaxed,
      sourceFields: sourceFieldsForBranch(branch.field)
    }))
  };
}

export async function getCareerRootSnapshot(): Promise<CareerRootSnapshot> {
  const database = getDatabase();
  if (!database) return buildFallback();

  try {
    const [roleRows, branchRows, applicantRows, matchRows, routeRows, courseRows, skillRows] =
      await Promise.all([
        database`
          select id, title, team, location, priority, openings, hiring_goal, role_signals
          from public.role_talent_boards
          order by case priority when 'Urgent' then 1 when 'Active' then 2 else 3 end, title
        `,
        database`
          select id, field, fit_reason, threshold_relaxed
          from public.career_root_branches
          order by field
        `,
        database`
          select
            role_board_id, talent_match_id, score, summary,
            skill_fit, experience_fit, education_fit, interest_signal,
            highlights, missing_signals, mobility_intent, status
          from public.role_talent_board_applicants
        `,
        database`
          select
            id, candidate_id, name, current_track, source_field, location, summary,
            score, education_fit, skill_fit, experience_fit, interest_signal,
            skills, education, experience, certifications, portfolio,
            career_interests, learning_signals, dna_signals, mobility_intent,
            highlights, missing_signals
          from public.talent_matches
        `,
        database`
          select
            id, candidate_id, title, track, readiness, horizon,
            salary_range, current_expected_pay, unlocked_pay_range, market_signal,
            why_realistic, bridge_skills, required_signals, projects,
            next_milestones, source_signals
          from public.career_path_routes
        `,
        database`
          select id, route_id, title, provider, partner, target_skill, duration, url
          from public.career_route_courses
        `,
        database`
          select id, candidate_id, name, category, level, evidence
          from public.skill_signals
          order by level desc
        `
      ]);

    const roles = roleRows as unknown as DbRole[];
    const branches = branchRows as unknown as DbBranch[];
    const applicants = applicantRows as unknown as DbApplicant[];
    const matches = matchRows as unknown as DbMatch[];
    const routes = routeRows as unknown as DbRoute[];
    const courses = courseRows as unknown as DbCourse[];
    const skills = skillRows as unknown as DbSkill[];
    const matchesById = new Map(matches.map((match) => [match.id, match]));

    const mappedRoles = roles.map<CareerRootRole>((role) => ({
      id: role.id,
      title: role.title,
      team: role.team ?? "Hiring team",
      location: role.location ?? "Flexible",
      priority: role.priority,
      openings: role.openings,
      hiringGoal: role.hiring_goal ?? "",
      roleSignals: list(role.role_signals),
      candidates: applicants
        .filter((applicant) => applicant.role_board_id === role.id)
        .map((applicant) => {
          const match = matchesById.get(applicant.talent_match_id);
          if (!match) return null;
          const route = routes.find(
            (item) => item.candidate_id === match.candidate_id && item.title === role.title
          );
          const mappedRoute: CareerRootRoute | null = route
            ? {
                id: route.id,
                title: route.title,
                track: route.track,
                readiness: route.readiness,
                horizon: route.horizon ?? "Timing to validate",
                salaryRange: route.salary_range ?? "Market range pending",
                currentExpectedPay: route.current_expected_pay ?? "Not provided",
                unlockedPayRange: route.unlocked_pay_range ?? "Not modelled",
                marketSignal: route.market_signal ?? "Market signal pending",
                whyRealistic: list(route.why_realistic),
                bridgeSkills: list(route.bridge_skills),
                requiredSignals: list(route.required_signals),
                projects: list(route.projects),
                nextMilestones: list(route.next_milestones),
                sourceSignals: list(route.source_signals),
                courses: courses
                  .filter((course) => course.route_id === route.id)
                  .map((course) => ({
                    id: course.id,
                    title: course.title,
                    provider: course.provider,
                    partner: course.partner ?? "",
                    targetSkill: course.target_skill ?? "Role readiness",
                    duration: course.duration ?? "Self-paced",
                    url: course.url ?? "#"
                  }))
              }
            : null;

          return {
            id: match.id,
            candidateId: match.candidate_id,
            name: match.name,
            avatar: initials(match.name),
            currentTrack: match.current_track ?? "Candidate",
            sourceField: match.source_field ?? "Adjacent field",
            location: match.location ?? "Flexible",
            summary: applicant.summary ?? match.summary ?? "",
            score: value(applicant.score ?? match.score),
            educationFit: value(applicant.education_fit ?? match.education_fit),
            skillFit: value(applicant.skill_fit ?? match.skill_fit),
            experienceFit: value(applicant.experience_fit ?? match.experience_fit),
            interestSignal: value(applicant.interest_signal ?? match.interest_signal),
            skills: list(match.skills),
            education: match.education ?? "Education evidence on file",
            experience: list(match.experience),
            certifications: list(match.certifications),
            portfolio: list(match.portfolio),
            careerInterests: list(match.career_interests),
            learningSignals: list(match.learning_signals),
            dnaSignals: list(match.dna_signals),
            mobilityIntent: applicant.mobility_intent ?? match.mobility_intent ?? "",
            highlights: list(applicant.highlights).length
              ? list(applicant.highlights)
              : list(match.highlights),
            missingSignals: list(applicant.missing_signals).length
              ? list(applicant.missing_signals)
              : list(match.missing_signals),
            reviewStatus: applicant.status,
            route: mappedRoute,
            skillSignals: skills
              .filter((skill) => skill.candidate_id === match.candidate_id)
              .map((skill) => ({
                id: skill.id,
                name: skill.name,
                category: skill.category,
                level: skill.level,
                evidence: skill.evidence ?? "Evidence on file"
              }))
          } satisfies CareerRootCandidate;
        })
        .filter((candidate): candidate is CareerRootCandidate => candidate !== null)
        .sort((a, b) => b.score - a.score)
    }));

    if (!mappedRoles.length || !mappedRoles.some((role) => role.candidates.length) || !branches.length) {
      return buildFallback();
    }

    return {
      source: "supabase",
      roles: mappedRoles,
      branches: branches.map((branch) => ({
        id: branch.id,
        field: branch.field,
        fitReason: branch.fit_reason ?? "",
        thresholdRelaxed: branch.threshold_relaxed ?? "",
        sourceFields: sourceFieldsForBranch(branch.field)
      }))
    };
  } catch {
    return buildFallback();
  }
}
