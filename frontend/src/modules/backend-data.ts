import type { ExtractedCv } from "./employer/ingestion-data";
import type { Application, ApplicationStatus, WorkMode } from "./candidate/tracker/types";

export type SupabaseApplicationRow = {
  id: string;
  status: "Draft" | "Review" | "Applied" | "Interview";
  submitted_at: string | null;
  resume_version: string | null;
  next_step: string | null;
  job: {
    title: string;
    company: string;
    location: string;
    salary: string | null;
    mode: "Hybrid" | "Remote-first" | "On-site";
    match_overall: number | null;
  };
};

export type SupabaseCvIngestionRow = Omit<ExtractedCv, "status"> & {
  status: ExtractedCv["status"] | null;
};

const statusMap: Record<SupabaseApplicationRow["status"], ApplicationStatus> = {
  Draft: "saved",
  Review: "screening",
  Applied: "applied",
  Interview: "interview"
};

const statusTitle: Record<ApplicationStatus, string> = {
  saved: "Saved",
  screening: "Under review",
  applied: "Application submitted",
  interview: "Interview scheduled",
  offer: "Offer received",
  rejected: "Application closed",
  ghosted: "No response"
};

const modeMap: Record<SupabaseApplicationRow["job"]["mode"], WorkMode> = {
  Hybrid: "hybrid",
  "Remote-first": "remote",
  "On-site": "onsite"
};

export function mapCandidateApplication(row: SupabaseApplicationRow): Application {
  const status = statusMap[row.status];
  const submitted = row.submitted_at || "Not submitted";
  const resume = row.resume_version ? `résumé ${row.resume_version}` : null;

  return {
    id: row.id,
    role: row.job.title,
    company: row.job.company,
    short: row.job.company.trim().slice(0, 2),
    location: row.job.location,
    mode: modeMap[row.job.mode],
    salary: row.job.salary ?? "—",
    source: "careeros",
    status,
    match: row.job.match_overall,
    nextAction: row.next_step || "No next step yet",
    due: `Submitted ${submitted}`,
    dueTone: "neutral",
    contact: { name: "—", role: "No contact yet", initials: "?" },
    timeline: [{ title: statusTitle[status], detail: [submitted, resume].filter(Boolean).join(" · "), status }]
  };
}

export function mapCvIngestionRecord(row: SupabaseCvIngestionRow): ExtractedCv {
  return { ...row, status: row.status ?? undefined };
}
