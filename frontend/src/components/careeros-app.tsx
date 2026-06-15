"use client";

import {
  BrainCircuit,
  Bot,
  ChartNoAxesCombined,
  ClipboardList,
  ClipboardCheck,
  Flame,
  GitBranch,
  MapPinned,
  LayoutDashboard,
  LineChart,
  Network,
  UsersRound
} from "lucide-react";
import { useState } from "react";
import type { CandidateModuleId, EmployerModuleId, Portal } from "@careeros/shared";
import { WorkspaceShell, type SidebarNavItem } from "@/components/workspace-shell";
import { candidateModules } from "@/modules/candidate/candidate-data";
import { CandidateView } from "@/modules/candidate/candidate-view";
import { employerModules } from "@/modules/employer/employer-data";
import { EmployerView } from "@/modules/employer/employer-view";

const candidateIcons = {
  dashboard: LayoutDashboard,
  dna: BrainCircuit,
  jobs: MapPinned,
  "career-path": GitBranch,
  jobby: Bot,
  applications: ClipboardList
} satisfies Record<CandidateModuleId, SidebarNavItem<CandidateModuleId>["icon"]>;

const employerIcons = {
  dashboard: ChartNoAxesCombined,
  "career-root": Network,
  talent: UsersRound,
  retention: Flame,
  onboarding: ClipboardCheck,
  heatmap: MapPinned,
  attrition: LineChart,
  review: ClipboardList
} satisfies Record<EmployerModuleId, SidebarNavItem<EmployerModuleId>["icon"]>;

const candidateNav = candidateModules.map((item) => ({
  ...item,
  icon: candidateIcons[item.id]
}));

const employerNav = employerModules.map((item) => ({
  ...item,
  icon: employerIcons[item.id]
}));

export function CareerOSApp() {
  const [portal, setPortal] = useState<Portal>("candidate");
  const [candidatePage, setCandidatePage] = useState<CandidateModuleId>("dashboard");
  const [employerPage, setEmployerPage] = useState<EmployerModuleId>("dashboard");

  if (portal === "candidate") {
    return (
      <WorkspaceShell
        portal={portal}
        onPortalChange={setPortal}
        sidebarTitle="My Career"
        navItems={candidateNav}
        activeId={candidatePage}
        onActiveChange={setCandidatePage}
      >
        <CandidateView activeModule={candidatePage} />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      portal={portal}
      onPortalChange={setPortal}
      sidebarTitle="Cempaka Digital"
      navItems={employerNav}
      activeId={employerPage}
      onActiveChange={setEmployerPage}
    >
      <EmployerView activeModule={employerPage} />
    </WorkspaceShell>
  );
}
