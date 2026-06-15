"use client";

import { useState } from "react";
import { careerRootBranches, talentMatches } from "../employer-data";
import { CandidateDnaPanel, EmployerPageHeader, HeaderCard, MicroBar, MiniMetric } from "./employer-ui";

export function CareerRootPanel() {
  const [selectedCandidateId, setSelectedCandidateId] = useState(talentMatches[0].id);
  const selectedCandidate = talentMatches.find((candidate) => candidate.id === selectedCandidateId) ?? talentMatches[0];

  return (
    <div>
      <EmployerPageHeader moduleId="career-root" />
      <div className="grid gap-4">
        <HeaderCard
          label="Career Root"
          title="Find candidates beyond the obvious degree pipeline"
          detail="Career Root is the inverse of Career Tree. It expands from a vacancy into adjacent fields, relaxed threshold logic, and candidates who show both role fit and interest signals."
        />
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="overflow-hidden rounded-[18px] border border-line bg-paper shadow-soft">
            <div className="border-b border-line bg-mist px-4 py-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="kicker">Vacancy root</p>
                  <h3 className="mt-1 font-serif text-2xl font-semibold text-ink">Senior Platform Engineer</h3>
                  <p className="mt-1 text-sm text-muted">Geography: Klang Valley - Experience: 2+ years - Threshold mode: adjacent signals allowed</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Backend APIs", "Cloud", "Data systems", "Consulting signal"].map((item) => (
                    <span key={item} className="rounded-full border border-[#E3D2A6] bg-[#F3EAD3] px-3 py-1 text-xs font-bold text-gold">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_24%,#fff8e8_0%,rgba(255,248,232,0)_28%),linear-gradient(135deg,#fffefb_0%,#f8f5ee_100%)] p-4">
              <svg className="pointer-events-none absolute inset-x-0 top-16 h-[260px] w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M50 10 C38 30 24 45 12 58" className="career-path-line is-selected" />
                <path d="M50 10 C44 38 39 48 35 58" className="career-path-line is-selected" />
                <path d="M50 10 C50 36 50 48 50 58" className="career-path-line is-selected" />
                <path d="M50 10 C61 34 68 47 77 58" className="career-path-line" />
                <path d="M50 10 C70 27 84 42 93 58" className="career-path-line" />
              </svg>

              <div className="relative z-10 mx-auto mb-6 w-full max-w-[360px] rounded-[22px] border border-[#E3D2A6] bg-ink p-5 text-paper shadow-lifted">
                <p className="kicker text-[#D7C899]">Open role</p>
                <h4 className="mt-2 font-serif text-2xl font-semibold">Platform Engineer</h4>
                <p className="mt-2 text-sm leading-6 text-paper/70">Career Root relaxes non-critical filters, then ranks applicants by fit and intent.</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <MiniMetric label="Fields" value={String(careerRootBranches.length)} />
                  <MiniMetric label="Matches" value="10" />
                  <MiniMetric label="Top score" value="91" />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {careerRootBranches.map((branch, branchIndex) => (
                  <CareerRootBranchCard
                    key={branch.field}
                    branchIndex={branchIndex}
                    branch={branch}
                    selectedCandidateId={selectedCandidateId}
                    onSelectCandidate={setSelectedCandidateId}
                  />
                ))}
              </div>

              <div className="relative z-20 mt-4 grid gap-3 lg:grid-cols-3">
                {[
                  ["Threshold logic", "Relax degree and exact-title filters when portfolio and learning signals are strong."],
                  ["Interest evidence", "Prioritizes candidates who saved similar roles, explored adjacent paths, or completed relevant courses."],
                  ["Top 10 branch view", "Each branch exposes the best candidates for that hiring source before review."]
                ].map(([title, detail]) => (
                  <div key={title} className="rounded-[14px] border border-line bg-paper/90 p-3 shadow-soft backdrop-blur">
                    <p className="text-sm font-semibold text-ink">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <CandidateDnaPanel candidate={selectedCandidate} ctaLabel="Move to review queue" />
        </div>
      </div>
    </div>
  );
}

function CareerRootBranchCard({
  branchIndex,
  branch,
  selectedCandidateId,
  onSelectCandidate
}: {
  branchIndex: number;
  branch: (typeof careerRootBranches)[number];
  selectedCandidateId: string;
  onSelectCandidate: (candidateId: string) => void;
}) {
  return (
    <section className="relative z-20 rounded-[18px] border border-line bg-paper/95 p-4 shadow-soft backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Hiring source 0{branchIndex + 1}</p>
          <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{branch.field}</h3>
        </div>
        <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-paper">{branch.applicants.length} fits</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{branch.fitReason}</p>
      <p className="mt-3 rounded-[12px] border border-[#E3D2A6] bg-[#F3EAD3] p-3 text-xs font-semibold leading-5 text-gold">
        Relaxed threshold: {branch.thresholdRelaxed}
      </p>

      <div className="mt-4 grid gap-2">
        {branch.applicants.slice(0, 10).map((candidate, index) => {
          const isSelected = selectedCandidateId === candidate.id;

          return (
            <button
              key={`${branch.field}-${candidate.id}`}
              type="button"
              onClick={() => onSelectCandidate(candidate.id)}
              className={`group rounded-[14px] border p-3 text-left transition ${
                isSelected ? "border-gold bg-[#FFF8E8] shadow-soft" : "border-line bg-mist hover:border-gold hover:bg-paper"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-paper">{candidate.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-ink">{index + 1}. {candidate.name}</p>
                    <span className="mono text-xs font-bold text-gold">{candidate.score}%</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted">{candidate.currentTrack} - {candidate.location}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1">
                <MicroBar label="Skill" value={candidate.skillFit} />
                <MicroBar label="Exp" value={candidate.experienceFit} />
                <MicroBar label="Edu" value={candidate.educationFit} />
                <MicroBar label="Intent" value={candidate.interestSignal} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
