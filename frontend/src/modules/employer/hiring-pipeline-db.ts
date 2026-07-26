import "server-only";

import postgres from "postgres";
import {
  roleTalentBoards as demoRoles,
  type RoleTalentBoard,
  type TalentMatch
} from "./employer-data";

export type HiringPipelineDataSource = "supabase" | "demo";
export type HiringPipelineSnapshot = {
  roles: RoleTalentBoard[];
  source: HiringPipelineDataSource;
};

type DbRole = {
  id: string;
  title: string;
  team: string | null;
  location: string | null;
  priority: RoleTalentBoard["priority"];
  openings: number;
  hiring_goal: string | null;
  role_signals: string[] | null;
};

type DbBoardApplicant = {
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
};

type DbTalentMatch = {
  id: string;
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

type Sql = ReturnType<typeof postgres>;
const globalForDatabase = globalThis as typeof globalThis & {
  careerOsHiringDb?: Sql;
};

function getDatabase(): Sql | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  globalForDatabase.careerOsHiringDb ??= postgres(connectionString, {
    ssl: "require",
    max: 3,
    connect_timeout: 10,
    idle_timeout: 20,
    prepare: false
  });

  return globalForDatabase.careerOsHiringDb;
}

const list = (value: string[] | null | undefined) => value ?? [];
const number = (value: number | null | undefined) => value ?? 0;
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function toCandidate(match: DbTalentMatch, board: DbBoardApplicant): TalentMatch {
  return {
    id: match.id,
    name: match.name,
    avatar: initials(match.name),
    currentTrack: match.current_track ?? "Candidate",
    sourceField: match.source_field ?? "Profile",
    location: match.location ?? "Flexible",
    summary: board.summary ?? match.summary ?? "",
    score: number(board.score ?? match.score),
    educationFit: number(board.education_fit ?? match.education_fit),
    skillFit: number(board.skill_fit ?? match.skill_fit),
    experienceFit: number(board.experience_fit ?? match.experience_fit),
    interestSignal: number(board.interest_signal ?? match.interest_signal),
    skills: list(match.skills),
    education: match.education ?? "Education evidence on file",
    experience: list(match.experience),
    certifications: list(match.certifications),
    portfolio: list(match.portfolio),
    careerInterests: list(match.career_interests),
    learningSignals: list(match.learning_signals),
    dnaSignals: list(match.dna_signals),
    mobilityIntent: board.mobility_intent ?? match.mobility_intent ?? "Intent not verified",
    highlights: list(board.highlights).length ? list(board.highlights) : list(match.highlights),
    missingSignals: list(board.missing_signals).length
      ? list(board.missing_signals)
      : list(match.missing_signals)
  };
}

export async function getHiringPipelineSnapshot(): Promise<HiringPipelineSnapshot> {
  const database = getDatabase();
  if (!database) return { roles: demoRoles, source: "demo" };

  try {
    const [roleResult, applicantResult, matchResult] = await Promise.all([
      database`
        select id, title, team, location, priority, openings, hiring_goal, role_signals
        from public.role_talent_boards
        order by
          case priority when 'Urgent' then 1 when 'Active' then 2 else 3 end,
          title
      `,
      database`
        select
          role_board_id, talent_match_id, score, summary,
          skill_fit, experience_fit, education_fit, interest_signal,
          highlights, missing_signals, mobility_intent
        from public.role_talent_board_applicants
      `,
      database`
        select
          id, name, current_track, source_field, location, summary,
          score, education_fit, skill_fit, experience_fit, interest_signal,
          skills, education, experience, certifications, portfolio,
          career_interests, learning_signals, dna_signals, mobility_intent,
          highlights, missing_signals
        from public.talent_matches
      `
    ]);

    const roles = roleResult as unknown as DbRole[];
    const applicants = applicantResult as unknown as DbBoardApplicant[];
    const matches = matchResult as unknown as DbTalentMatch[];
    const matchesById = new Map(matches.map((match) => [match.id, match]));

    const mapped = roles
      .map<RoleTalentBoard>((role) => ({
        id: role.id,
        title: role.title,
        team: role.team ?? "Hiring team",
        location: role.location ?? "Flexible",
        priority: role.priority,
        openings: role.openings,
        hiringGoal: role.hiring_goal ?? "",
        roleSignals: list(role.role_signals),
        applicants: applicants
          .filter((applicant) => applicant.role_board_id === role.id)
          .map((applicant) => {
            const match = matchesById.get(applicant.talent_match_id);
            return match ? toCandidate(match, applicant) : null;
          })
          .filter((candidate): candidate is TalentMatch => candidate !== null)
          .sort((a, b) => b.score - a.score)
      }))
      .filter((role) => role.applicants.length > 0);

    return mapped.length
      ? { roles: mapped, source: "supabase" }
      : { roles: demoRoles, source: "demo" };
  } catch {
    return { roles: demoRoles, source: "demo" };
  }
}
