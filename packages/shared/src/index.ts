export type Portal = "candidate" | "employer";

export type CandidateModuleId = "dashboard" | "dna" | "jobs" | "career-path" | "jobby" | "applications";

export type EmployerModuleId =
  | "dashboard"
  | "career-root"
  | "talent"
  | "ingestion"
  | "retention"
  | "onboarding"
  | "heatmap"
  | "attrition"
  | "review";

export type NavigationItem<TId extends string> = {
  id: TId;
  label: string;
  description: string;
};

export type CandidateSnapshot = {
  name: string;
  targetRole: string;
  readiness: number;
  nextActions: string[];
};

export type EmployerSnapshot = {
  organization: string;
  openRoles: number;
  talentMatches: number;
  riskAlerts: number;
};

export { createSupabaseClient, createSupabaseAdmin } from "./supabase";
export type { Database } from "./supabase";
