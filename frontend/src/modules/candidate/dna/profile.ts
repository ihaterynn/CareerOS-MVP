import type { Resume } from "../studio/types";

export type CandidateProfile = { name: string; role: string; location: string; skills: string[]; currentYears: number; totalYears: number };

export function profileAvailability(profile?: CandidateProfile, code?: string) {
  return profile ? "ready" : code === "no_active_resume" ? "missing" : "unavailable";
}

function yearsIn(period: string, currentYear: number) {
  const years = period.match(/(?:19|20)\d{2}/g)?.map(Number) ?? [];
  if (!years.length) return 0;
  const end = /present|current/i.test(period) ? currentYear : years.at(-1) ?? years[0];
  return Math.max(0, end - years[0]!);
}

export function profileFromResume(resume: Resume, currentYear = new Date().getFullYear()): CandidateProfile {
  const current = resume.experience[0];
  const role = current?.role.split("·")[0]?.trim() || resume.title || "Current role";
  const durations = resume.experience.map((experience) => yearsIn(experience.period, currentYear));
  return { name: resume.name || "Your profile", role, location: resume.loc, skills: resume.skills.slice(0, 4), currentYears: current ? durations[0] ?? 0 : 0, totalYears: durations.reduce((total, years) => total + years, 0) };
}
