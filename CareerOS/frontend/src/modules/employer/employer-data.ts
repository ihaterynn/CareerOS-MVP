import type { EmployerModuleId, NavigationItem } from "@careeros/shared";

export const employerModules: Array<NavigationItem<EmployerModuleId>> = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "View hiring health, retention risk, and pipeline movement."
  },
  {
    id: "talent",
    label: "Talent",
    description: "Search matched candidates and internal mobility pools."
  },
  {
    id: "onboarding",
    label: "Onboarding",
    description: "Track ramp plans and success predictors."
  },
  {
    id: "admin",
    label: "Admin",
    description: "Manage organization settings, roles, and access."
  }
];

export const employerMetrics = [
  { label: "Open roles", value: "18", detail: "6 urgent requisitions" },
  { label: "Talent matches", value: "247", detail: "42 high-confidence matches" },
  { label: "Retention alerts", value: "9", detail: "3 high-risk teams" }
];
