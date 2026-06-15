export type Portal = "candidate" | "employer";

export type CandidateModuleId = "dashboard" | "dna" | "jobs" | "career-path" | "jobby" | "applications";

export type EmployerModuleId =
  | "dashboard"
  | "career-root"
  | "talent"
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

export const apiRoutes = {
  health: "/api/health",
  candidate: "/api/candidate",
  employer: "/api/employer"
} as const;
