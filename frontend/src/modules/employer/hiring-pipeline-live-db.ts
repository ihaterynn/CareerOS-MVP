import "server-only";

import postgres from "postgres";
import { roleTalentBoards as demoRoles, type RoleTalentBoard, type TalentMatch } from "./employer-data";
import type { HiringPipelineSnapshot } from "./hiring-pipeline-db";

type ProfileRow = {
  id: string;
  name: string;
  current_role_title: string | null;
  location: string | null;
  work_preferences: string[] | null;
  relocation_flexibility: string | null;
  career_interests: string[] | null;
  summary: string | null;
};

type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: string;
  salary: string | null;
  requirements: string[] | null;
  is_active: boolean;
};

type SkillRow = {
  candidate_id: string;
  name: string;
  level: number;
  category: string;
};

type ExperienceRow = {
  candidate_id: string;
  role: string;
  company: string;
  period: string;
  impact: string[] | null;
  sort_order: number;
};

type EducationRow = {
  candidate_id: string;
  school: string;
  credential: string;
  year: string | null;
};

type CertificationRow = {
  candidate_id: string;
  name: string;
  issuer: string;
  year: string | null;
};

type SignalRow = {
  candidate_id: string;
  signal: string;
};

type Sql = ReturnType<typeof postgres>;
const globalForDatabase = globalThis as typeof globalThis & { careerOsHiringLiveDb?: Sql };

function getDatabase(): Sql | null {
  if (!process.env.DATABASE_URL) return null;
  globalForDatabase.careerOsHiringLiveDb ??= postgres(process.env.DATABASE_URL, {
    ssl: "require",
    max: 5,
    connect_timeout: 10,
    idle_timeout: 20,
    prepare: false
  });
  return globalForDatabase.careerOsHiringLiveDb;
}

function groupByCandidate<T extends { candidate_id: string }>(rows: T[]) {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const existing = grouped.get(row.candidate_id);
    if (existing) existing.push(row);
    else grouped.set(row.candidate_id, [row]);
  }
  return grouped;
}

const clean = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9+#/.]+/g, " ").replace(/\s+/g, " ").trim();

const tokens = (value: string) =>
  new Set(clean(value).split(/[\s/]+/).filter((token) => token.length > 1));

function similarity(left: string, right: string) {
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  return overlap / Math.max(a.size, b.size);
}

function parseYears(summary: string | null) {
  const match = summary?.match(/(\d+)\+?\s+years/i);
  return match ? Number(match[1]) : 0;
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

const clamp = (score: number, minimum = 25, maximum = 98) =>
  Math.round(Math.min(maximum, Math.max(minimum, score)));

function rankCandidate(
  profile: ProfileRow,
  job: JobRow,
  skills: SkillRow[],
  experiences: ExperienceRow[],
  education: EducationRow[],
  certifications: CertificationRow[],
  learning: SignalRow[],
  dna: SignalRow[]
): TalentMatch {
  const requirements = job.requirements ?? [];
  const matched = requirements.map((requirement) => {
    const exact = skills.find((skill) => clean(skill.name) === clean(requirement));
    if (exact) return { requirement, skill: exact, strength: exact.level };
    const fuzzy = skills
      .map((skill) => ({ skill, affinity: similarity(skill.name, requirement) }))
      .sort((a, b) => b.affinity - a.affinity)[0];
    return fuzzy && fuzzy.affinity >= 0.5
      ? { requirement, skill: fuzzy.skill, strength: Math.round(fuzzy.skill.level * fuzzy.affinity) }
      : { requirement, skill: null, strength: 0 };
  });

  const skillFit = clamp(
    requirements.length
      ? matched.reduce((total, match) => total + match.strength, 0) / requirements.length
      : skills.slice(0, 4).reduce((total, skill) => total + skill.level, 0) / Math.max(1, Math.min(4, skills.length)),
    18
  );

  const roleAffinity = Math.max(
    similarity(profile.current_role_title ?? "", job.title),
    ...experiences.map((experience) => similarity(experience.role, job.title))
  );
  const impactCount = experiences.flatMap((experience) => experience.impact ?? []).length;
  const years = parseYears(profile.summary);
  const experienceFit = clamp(43 + roleAffinity * 34 + Math.min(12, years) * 1.25 + Math.min(8, impactCount));

  const educationEvidence = education[0];
  const credentialRelevance = educationEvidence
    ? similarity(`${educationEvidence.credential} ${educationEvidence.school}`, `${job.title} ${requirements.join(" ")}`)
    : 0;
  const certificationRelevance = certifications.length
    ? Math.max(...certifications.map((certification) =>
        similarity(`${certification.name} ${certification.issuer}`, `${job.title} ${requirements.join(" ")}`)
      ))
    : 0;
  const educationFit = clamp(59 + credentialRelevance * 18 + certificationRelevance * 16 + Math.min(8, certifications.length * 3));

  const intentText = (profile.career_interests ?? []).join(" ");
  const intentAffinity = similarity(intentText, `${job.title} ${requirements.join(" ")}`);
  const interestSignal = clamp(54 + intentAffinity * 22 + Math.min(12, learning.length * 4) + Math.min(10, dna.length * 3));

  const preferences = (profile.work_preferences ?? []).map(clean);
  const modeMatch = preferences.includes(clean(job.mode)) ? 1 : 0;
  const locationMatch = clean(profile.location ?? "") === clean(job.location) ? 1 : 0;
  const relocation = clean(profile.relocation_flexibility ?? "").includes("nation") ? 1 : 0;
  const preferenceFit = clamp(48 + modeMatch * 28 + locationMatch * 16 + relocation * 8);

  const score = clamp(
    skillFit * 0.43 +
    experienceFit * 0.25 +
    educationFit * 0.11 +
    interestSignal * 0.14 +
    preferenceFit * 0.07
  );

  const matchedSkills = matched
    .filter((match) => match.skill && match.strength >= 45)
    .sort((a, b) => b.strength - a.strength);
  const missingSignals = matched
    .filter((match) => !match.skill || match.strength < 55)
    .map((match) => match.requirement);
  if (!modeMatch) missingSignals.push(`${job.mode} work preference not confirmed`);

  const impacts = experiences.flatMap((experience) => experience.impact ?? []);
  const highlights = [
    ...matchedSkills.slice(0, 2).map((match) => `${match.skill?.name}: ${match.skill?.level}% evidence strength`),
    experiences[0] ? `${experiences[0].role} at ${experiences[0].company}` : "",
    impacts[0] ?? "",
    dna[0]?.signal ?? ""
  ].filter(Boolean);

  return {
    id: profile.id,
    name: profile.name,
    avatar: initials(profile.name),
    currentTrack: profile.current_role_title ?? "Candidate",
    sourceField: "Seeded Supabase profile",
    location: profile.location ?? "Location flexible",
    summary: profile.summary ?? `${profile.current_role_title ?? "Candidate"} with verified profile evidence.`,
    score,
    educationFit,
    skillFit,
    experienceFit,
    interestSignal,
    skills: skills.sort((a, b) => b.level - a.level).slice(0, 8).map((skill) => `${skill.name} · ${skill.level}%`),
    education: educationEvidence
      ? `${educationEvidence.credential}, ${educationEvidence.school}${educationEvidence.year ? ` (${educationEvidence.year})` : ""}`
      : "Education evidence not provided",
    experience: experiences
      .sort((a, b) => a.sort_order - b.sort_order)
      .slice(0, 4)
      .map((experience) => `${experience.role} · ${experience.company} · ${experience.period}`),
    certifications: certifications.slice(0, 4).map((certification) => `${certification.name} · ${certification.issuer}`),
    portfolio: [...impacts.slice(0, 3), ...learning.slice(0, 2).map((item) => item.signal)],
    careerInterests: profile.career_interests ?? [],
    learningSignals: learning.map((item) => item.signal),
    dnaSignals: dna.map((item) => item.signal),
    mobilityIntent: `${profile.relocation_flexibility ?? "Relocation not stated"} · ${(profile.work_preferences ?? []).join(", ") || "work mode open"}`,
    highlights: highlights.length ? highlights : ["Complete seeded profile evidence"],
    missingSignals: missingSignals.length ? missingSignals.slice(0, 4) : ["Validate depth through a role-specific interview"]
  };
}

export async function getLiveHiringPipelineSnapshot(): Promise<HiringPipelineSnapshot> {
  const database = getDatabase();
  if (!database) return { roles: demoRoles, source: "demo" };

  try {
    const [jobsResult, profilesResult, skillsResult, experienceResult, educationResult, certificationResult, learningResult, dnaResult] =
      await Promise.all([
        database`
          select j.id, j.title, j.company, j.location, j.mode::text, j.salary, j.requirements, j.is_active
          from public.job_listings j
          join public.employers e on e.id = j.employer_id
          where e.name = 'Cempaka Digital' and j.is_active = true
          order by j.created_at, j.title
        `,
        database`
          select id, name, current_role_title, location, work_preferences,
                 relocation_flexibility, career_interests, summary
          from public.candidate_profiles
        `,
        database`select candidate_id, name, level, category::text from public.skill_signals`,
        database`select candidate_id, role, company, period, impact, sort_order from public.candidate_experience`,
        database`select candidate_id, school, credential, year from public.candidate_education`,
        database`select candidate_id, name, issuer, year from public.candidate_certifications`,
        database`select candidate_id, signal from public.candidate_learning_signals`,
        database`select candidate_id, signal from public.candidate_dna_signals`
      ]);

    const jobs = jobsResult as unknown as JobRow[];
    const profiles = profilesResult as unknown as ProfileRow[];
    const skills = groupByCandidate(skillsResult as unknown as SkillRow[]);
    const experiences = groupByCandidate(experienceResult as unknown as ExperienceRow[]);
    const education = groupByCandidate(educationResult as unknown as EducationRow[]);
    const certifications = groupByCandidate(certificationResult as unknown as CertificationRow[]);
    const learning = groupByCandidate(learningResult as unknown as SignalRow[]);
    const dna = groupByCandidate(dnaResult as unknown as SignalRow[]);

    const roles = jobs.map<RoleTalentBoard>((job) => ({
      id: job.id,
      title: job.title,
      team: job.company,
      location: `${job.location} · ${job.mode}`,
      salary: job.salary ?? undefined,
      priority: "Active",
      openings: 1,
      candidatePoolSize: profiles.length,
      hiringGoal: `Rank the strongest evidence-backed profiles for ${job.title}.`,
      roleSignals: job.requirements ?? [],
      applicants: profiles
        .map((profile) =>
          rankCandidate(
            profile,
            job,
            skills.get(profile.id) ?? [],
            experiences.get(profile.id) ?? [],
            education.get(profile.id) ?? [],
            certifications.get(profile.id) ?? [],
            learning.get(profile.id) ?? [],
            dna.get(profile.id) ?? []
          )
        )
        .sort((a, b) => b.score - a.score || b.skillFit - a.skillFit)
        .slice(0, 24)
    }));

    return roles.length ? { roles, source: "supabase" } : { roles: demoRoles, source: "demo" };
  } catch (error) {
    console.error("Hiring pipeline live-data load failed", error);
    return { roles: demoRoles, source: "demo" };
  }
}
