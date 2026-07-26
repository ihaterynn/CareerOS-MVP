import {
  ChartNoAxesCombined,
  ClipboardCheck,
  Dna,
  FilePenLine,
  KanbanSquare,
  BotMessageSquare,
  Network,
  Workflow
} from "lucide-react";
import type { CandidateModuleId, EmployerModuleId } from "@careeros/shared";
import { candidateModules } from "@/modules/candidate/candidate-data";
import { employerModules } from "@/modules/employer/employer-data";
import type { ShellNav, ShellNavItem } from "./workspace-shell";

const candidateIcons: Record<CandidateModuleId, ShellNavItem["icon"]> = {
  tracker: KanbanSquare,
  dna: Dna,
  studio: FilePenLine
};

const employerIcons: Record<EmployerModuleId, ShellNavItem["icon"]> = {
  dashboard: ChartNoAxesCombined,
  "career-root": Network,
  talent: Workflow,
  jobby: BotMessageSquare,
  onboarding: ClipboardCheck
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
  candidate: { title: "My Career", items: candidateItems, defaultHref: "/candidate/tracker" },
  employer: { title: "Cempaka Digital", items: employerItems, defaultHref: "/employer/dashboard" }
};
