"use client";

import {
  BrainCircuit,
  ChartNoAxesCombined,
  ClipboardCheck,
  GraduationCap,
  GitBranch,
  MapPinned,
  Settings,
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
  dna: BrainCircuit,
  "career-path": GitBranch,
  upskilling: GraduationCap,
  jobs: MapPinned
} satisfies Record<CandidateModuleId, SidebarNavItem<CandidateModuleId>["icon"]>;

const employerIcons = {
  dashboard: ChartNoAxesCombined,
  talent: UsersRound,
  onboarding: ClipboardCheck,
  admin: Settings
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
  const [candidatePage, setCandidatePage] = useState<CandidateModuleId>("dna");
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
