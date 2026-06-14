"use client";

import type { CandidateModuleId } from "@careeros/shared";
import { candidateProfile, jobListings } from "./candidate-data";
import { CareerPathNavigatorPanel } from "./components/career-path-navigator-panel";
import { CandidateDnaPanel } from "./components/candidate-dna-panel";
import { JobSearchPanel } from "./components/job-search-panel";
import { UpskillingPanel } from "./components/upskilling-panel";

export function CandidateView({ activeModule }: { activeModule: CandidateModuleId }) {
  const bestMatch = jobListings[0];

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

      {activeModule === "upskilling" ? (
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-[10px] border border-line bg-mist p-3">
            <p className="kicker">Top match</p>
            <p className="mt-2 font-serif text-2xl font-semibold leading-none text-ink">{bestMatch.match.overall}%</p>
            <p className="mt-2 text-sm text-muted">{bestMatch.title}</p>
          </div>
          <div className="rounded-[10px] border border-line bg-mist p-3">
            <p className="kicker">Salary expectation</p>
            <p className="mt-2 font-serif text-2xl font-semibold leading-none text-ink">RM 11k+</p>
            <p className="mt-2 text-sm text-muted">{candidateProfile.salaryExpectation}</p>
          </div>
          <div className="rounded-[10px] border border-line bg-mist p-3">
            <p className="kicker">Commute preference</p>
            <p className="mt-2 font-serif text-2xl font-semibold leading-none text-ink">
              {candidateProfile.commutePreferenceMinutes}m
            </p>
            <p className="mt-2 text-sm text-muted">{candidateProfile.relocationFlexibility}</p>
          </div>
        </div>
      ) : null}

      {activeModule === "dna" ? <CandidateDnaPanel /> : null}
      {activeModule === "career-path" ? <CareerPathNavigatorPanel /> : null}
      {activeModule === "upskilling" ? <UpskillingPanel /> : null}
      {activeModule === "jobs" ? <JobSearchPanel /> : null}
    </div>
  );
}
