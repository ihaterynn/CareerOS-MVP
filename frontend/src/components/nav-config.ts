import {
  BrainCircuit,
  Bot,
  ChartNoAxesCombined,
  ClipboardCheck,
  ClipboardList,
  Flame,
  GitBranch,
  LayoutDashboard,
  LineChart,
  MapPinned,
  Network,
  UsersRound
} from "lucide-react";
import type { CandidateModuleId, EmployerModuleId } from "@careeros/shared";
import { candidateModules } from "@/modules/candidate/candidate-data";
import { employerModules } from "@/modules/employer/employer-data";
import type { ShellNav, ShellNavItem } from "./workspace-shell";

const candidateIcons: Record<CandidateModuleId, ShellNavItem["icon"]> = {
  dashboard: LayoutDashboard,
  dna: BrainCircuit,
  jobs: MapPinned,
  "career-path": GitBranch,
  jobby: Bot,
  applications: ClipboardList
};

const employerIcons: Record<EmployerModuleId, ShellNavItem["icon"]> = {
  dashboard: ChartNoAxesCombined,
  "career-root": Network,
  talent: UsersRound,
  retention: Flame,
  onboarding: ClipboardCheck,
  heatmap: MapPinned,
  attrition: LineChart,
  review: ClipboardList
};

const candidateItems: ShellNavItem[] = candidateModules.map((m) => ({
  href: `/candidate/${m.id}`,
  label: m.label,
  description: m.description,
  icon: candidateIcons[m.id]
}));

const employerItems: ShellNavItem[] = employerModules.map((m) => ({
  href: `/employer/${m.id}`,
  label: m.label,
  description: m.description,
  icon: employerIcons[m.id]
}));

export const shellNav: ShellNav = {
  candidate: { title: "My Career", items: candidateItems, defaultHref: "/candidate/dashboard" },
  employer: { title: "Cempaka Digital", items: employerItems, defaultHref: "/employer/dashboard" }
};
