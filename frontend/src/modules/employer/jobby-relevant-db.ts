import type postgres from "postgres";
import type { JobbyCandidate, JobbyRole } from "./jobby-db";

type Sql = ReturnType<typeof postgres>;
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

const clean = (value: string | null | undefined) =>
  (value ?? "").toLowerCase().replace(/[^a-z0-9+#/.]+/g, " ").replace(/\s+/g, " ").trim();

const tokens = (value: string) =>
  new Set(clean(value).split(/[\s/]+/).filter((token) => token.length > 1));

function affinity(left: string, right: string) {
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  return overlap / Math.max(1, Math.min(a.size, b.size));
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const list = (value: string[] | null | undefined) => value?.filter(Boolean) ?? [];
const initials = (name: string) =>
  name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

export async function getRelevantJobCandidates(
  sql: Sql,
  job: JobbyRole,
  existingIds: string[]
): Promise<JobbyCandidate[]> {
  const requirements = job.requirements;
  const genericTitleWords = new Set(["senior", "junior", "lead", "engineer", "developer", "specialist"]);
  const titleWords = clean(job.title)
    .split(" ")
    .filter((word) => word.length > 1 && !genericTitleWords.has(word));
  const rolePatterns = [`%${clean(job.title)}%`, ...titleWords.map((word) => `%${word}%`)];

  const profiles = await sql`
    select cp.id, cp.name, cp.current_role_title, cp.summary
    from public.candidate_profiles cp
    where cp.id <> all(${existingIds}::uuid[])
      and (
        exists (
          select 1
          from public.skill_signals ss
          where ss.candidate_id = cp.id
            and exists (
              select 1
              from unnest(${requirements}::text[]) requirement
              where lower(ss.name) like '%' || lower(requirement) || '%'
                 or lower(requirement) like '%' || lower(ss.name) || '%'
            )
        )
        or lower(coalesce(cp.current_role_title, '')) like any(${rolePatterns})
        or exists (
          select 1
          from public.candidate_experience ce
          where ce.candidate_id = cp.id
            and lower(ce.role) like any(${rolePatterns})
        )
      )
    order by
      (
        select count(*)
        from public.skill_signals ss
        where ss.candidate_id = cp.id
          and exists (
            select 1
            from unnest(${requirements}::text[]) requirement
            where lower(ss.name) like '%' || lower(requirement) || '%'
               or lower(requirement) like '%' || lower(ss.name) || '%'
          )
      ) desc,
      (
        select coalesce(avg(ss.level), 0)
        from public.skill_signals ss
        where ss.candidate_id = cp.id
          and exists (
            select 1
            from unnest(${requirements}::text[]) requirement
            where lower(ss.name) like '%' || lower(requirement) || '%'
               or lower(requirement) like '%' || lower(ss.name) || '%'
          )
      ) desc,
      cp.name
    limit 36
  ` as unknown as ProfileRow[];

  const candidateIds = profiles.map((profile) => profile.id);
  if (!candidateIds.length) return [];

  const [skillResult, experienceResult] = await Promise.all([
    sql`
      select candidate_id, name, level
      from public.skill_signals
      where candidate_id = any(${candidateIds}::uuid[])
      order by level desc
    `,
    sql`
      select candidate_id, role, company, period, impact, sort_order
      from public.candidate_experience
      where candidate_id = any(${candidateIds}::uuid[])
      order by sort_order
    `
  ]);

  const skills = skillResult as unknown as SkillRow[];
  const experiences = experienceResult as unknown as ExperienceRow[];
  const requirementText = requirements.join(" ");

  return profiles.map((profile) => {
    const candidateSkills = skills.filter((item) => item.candidate_id === profile.id).slice(0, 10);
    const candidateExperience = experiences.filter((item) => item.candidate_id === profile.id).slice(0, 5);
    const matchedSkills = candidateSkills
      .map((skill) => ({ ...skill, relevance: affinity(skill.name, requirementText) }))
      .filter((skill) => skill.relevance > 0)
      .sort((a, b) => b.relevance * b.level - a.relevance * a.level);
    const generalStrength = candidateSkills.slice(0, 4)
      .reduce((sum, skill) => sum + skill.level, 0) / Math.max(1, Math.min(4, candidateSkills.length));
    const roleFit = Math.max(
      affinity(profile.current_role_title ?? "", job.title),
      ...candidateExperience.map((item) => affinity(item.role, job.title))
    );
    const matchedRequirementNames = new Set(
      requirements.filter((requirement) =>
        candidateSkills.some((skill) => affinity(skill.name, requirement) >= 0.5)
      )
    );
    const coverage = matchedRequirementNames.size / Math.max(1, requirements.length);
    const matchedStrength = matchedSkills.slice(0, Math.max(1, requirements.length))
      .reduce((sum, skill) => sum + skill.level, 0) / Math.max(1, matchedSkills.length);
    const skillFit = matchedSkills.length
      ? matchedStrength * (0.62 + coverage * 0.38)
      : generalStrength * 0.55;
    const gaps = requirements.filter((requirement) => !matchedRequirementNames.has(requirement)).slice(0, 5);
    const impacts = candidateExperience.flatMap((item) => list(item.impact));

    return {
      id: profile.id,
      name: profile.name,
      initials: initials(profile.name),
      currentRole: profile.current_role_title ?? "Candidate",
      status: "Relevant to role",
      source: "Relevant",
      score: clamp(skillFit * 0.55 + roleFit * 30 + generalStrength * 0.15),
      summary: profile.summary ?? "Seeded professional evidence matches this job's role lens.",
      skills: candidateSkills.slice(0, 8).map((skill) => `${skill.name} · ${skill.level}%`),
      experience: candidateExperience.map((item) => `${item.role} · ${item.company} · ${item.period}`),
      highlights: [
        ...matchedSkills.slice(0, 3).map((skill) => `${skill.name}: ${skill.level}% evidence strength`),
        ...impacts.slice(0, 2)
      ],
      gaps
    } satisfies JobbyCandidate;
  });
}
