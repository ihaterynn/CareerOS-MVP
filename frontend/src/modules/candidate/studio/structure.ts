import type { Experience, Resume } from "./types";

const text = (value: unknown, field: string, limit = 8_000) => {
  if (typeof value !== "string") throw new Error(`Invalid ${field}.`);
  return value.trim().slice(0, limit);
};

export function validateStructuredResume(value: unknown): Resume {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid structured resume.");
  const item = value as Record<string, unknown>;
  if (!Array.isArray(item.experience)) throw new Error("Invalid experience.");
  if (!Array.isArray(item.skills)) throw new Error("Invalid skills.");
  const experience: Experience[] = item.experience.slice(0, 25).map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("Invalid experience.");
    const job = entry as Record<string, unknown>;
    if (!Array.isArray(job.bullets)) throw new Error("Invalid experience bullets.");
    return { role: text(job.role, "experience role", 300), period: text(job.period, "experience period", 100), bullets: job.bullets.slice(0, 15).map((bullet) => text(bullet, "experience bullet", 1_000)) };
  });

  return {
    name: text(item.name, "name", 200) || "Your name",
    title: text(item.title, "title", 200) || "Professional",
    loc: text(item.loc, "location", 300),
    email: text(item.email, "email", 300),
    summary: text(item.summary, "summary", 3_000),
    experience,
    skills: item.skills.slice(0, 100).map((skill) => text(skill, "skill", 120)).filter(Boolean),
    ...(typeof item.other === "string" && item.other.trim() ? { other: item.other.trim().slice(0, 10_000) } : {}),
    version: "Draft · AI-structured"
  };
}
