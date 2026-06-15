"use client";

import type { CandidateModuleId } from "@careeros/shared";
import { candidateProfile } from "./candidate-data";
import { ApplicationsPanel } from "./components/applications-panel";
import { CareerPathNavigatorPanel } from "./components/career-path-navigator-panel";
import { CandidateDashboardPanel } from "./components/candidate-dashboard-panel";
import { CandidateDnaPanel } from "./components/candidate-dna-panel";
import { JobSearchPanel } from "./components/job-search-panel";
import { JobbyAiPanel } from "./components/jobby-ai-panel";

export function CandidateView({ activeModule }: { activeModule: CandidateModuleId }) {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="kicker">Your Workspace</p>
          <h2 className="mt-1 font-serif text-3xl font-semibold text-ink">{candidateProfile.name}</h2>
          <p className="mt-1 text-sm text-muted">
            {candidateProfile.currentRole} - {candidateProfile.location}
          </p>
        </div>
      </div>

      {activeModule === "dashboard" ? <CandidateDashboardPanel /> : null}
      {activeModule === "dna" ? <CandidateDnaPanel /> : null}
      {activeModule === "career-path" ? <CareerPathNavigatorPanel /> : null}
      {activeModule === "jobby" ? <JobbyAiPanel /> : null}
      {activeModule === "jobs" ? <JobSearchPanel /> : null}
      {activeModule === "applications" ? <ApplicationsPanel /> : null}
    </div>
  );
}
