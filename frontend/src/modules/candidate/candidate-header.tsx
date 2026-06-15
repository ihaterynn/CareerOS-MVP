import type { ReactNode } from "react";
import { candidateProfile } from "./candidate-data";

/** Shared candidate workspace header, rendered above each candidate module page. */
export function CandidateHeader({ children }: { children: ReactNode }) {
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
      {children}
    </div>
  );
}
