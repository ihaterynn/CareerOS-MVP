"use client";

import { useMemo, useState } from "react";
import { Gem, Network, ShieldCheck, Sparkles } from "lucide-react";
import { careerRootBranches, talentMatches, type CareerRootBranch, type TalentMatch } from "../employer-data";
import { CandidateDnaPanel, EmployerPageHeader, HeaderCard, MicroBar, MiniMetric } from "./employer-ui";

const REQUIRED_FIELD = "Computer Science";
type SourcingMode = "traditional" | "root";

const vacancyRequirements = [
  { label: "Backend API delivery", kind: "required" },
  { label: "Cloud systems exposure", kind: "preferred" },
  { label: "Computer Science degree", kind: "relaxable" }
] as const;

const relaxationEvidence: Record<string, { original: string; substitute: string }> = {
  "Computer Science": { original: "Computer Science degree", substitute: "No substitution — strict filter retained" },
  "Economics and Operations": { original: "Computer Science degree", substitute: "SQL portfolio, process-redesign evidence, and analytics delivery" },
  "Business and Product": { original: "Computer Science degree", substitute: "Product analytics portfolio and completed technical learning" }
};

function isHiddenGem(candidate: TalentMatch) {
  return candidate.sourceField !== REQUIRED_FIELD;
}

export function CareerRootPanel() {
  const [mode, setMode] = useState<SourcingMode>("root");
  const [selectedCandidateId, setSelectedCandidateId] = useState(talentMatches[0].id);
  const selectedCandidate = talentMatches.find((candidate) => candidate.id === selectedCandidateId) ?? talentMatches[0];

  const branches = useMemo<CareerRootBranch[]>(
    () =>
      mode === "root"
        ? careerRootBranches
        : careerRootBranches
            .filter((branch) => branch.field === REQUIRED_FIELD)
            .map((branch) => ({ ...branch, applicants: branch.applicants.filter((candidate) => candidate.sourceField === REQUIRED_FIELD) })),
    [mode]
  );

  const stats = useMemo(() => {
    const unique = new Map<string, TalentMatch>();
    branches.forEach((branch) => branch.applicants.forEach((candidate) => unique.set(candidate.id, candidate)));
    const surfaced = [...unique.values()];
    const gems = surfaced.filter(isHiddenGem).length;
    const topScore = surfaced.length ? Math.max(...surfaced.map((candidate) => candidate.score)) : 0;
    const pathwayFits = branches.reduce((total, branch) => total + branch.applicants.length, 0);
    return { fields: branches.length, surfaced: surfaced.length, pathwayFits, gems, topScore };
  }, [branches]);

  const missedByTraditional = talentMatches.filter(isHiddenGem).length;

  return (
    <div>
      <EmployerPageHeader moduleId="career-root" />
      <div className="grid gap-4">
        <HeaderCard
          label="Career Root"
          title="Find candidates beyond the obvious degree pipeline"
          detail="Career Root is the inverse of Career Tree. It expands from a vacancy into adjacent fields, relaxes non-critical filters, and ranks people who show both role fit and genuine interest — surfacing strong candidates a degree-gated search would silently drop."
        />

        <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="kicker">Sourcing lens</p>
              <h3 className="mt-1 font-serif text-2xl font-semibold text-ink">Compare a traditional filter with Career Root</h3>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                Toggle the lens to see how relaxing the degree gate changes who reaches your shortlist.
              </p>
            </div>
            <ModeToggle mode={mode} onChange={setMode} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Source fields" value={String(stats.fields)} tone="ink" />
            <StatCard label="Unique leads" value={String(stats.surfaced)} tone="ink" hint={`${stats.pathwayFits} pathway fits`} />
            <StatCard label="Hidden gems" value={String(stats.gems)} tone="gold" hint="Strong fit, non-CS background" />
            <StatCard label="Top fit score" value={`${stats.topScore}%`} tone="ink" />
          </div>

          <div
            className={`mt-4 rounded-[14px] border p-3 text-sm leading-6 ${
              mode === "root"
                ? "border-[#BFDCC8] bg-[#EAF4EC] text-[#2f6a48]"
                : "border-[#E8BDB7] bg-[#F7E5E1] text-bad"
            }`}
          >
            {mode === "root" ? (
              <span className="inline-flex items-center gap-2">
                <Sparkles size={15} aria-hidden="true" />
                Career Root surfaces <strong>{missedByTraditional} strong candidates</strong> a Computer-Science-only filter would have missed.
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={15} aria-hidden="true" />
                Traditional filter shows only Computer Science graduates — {missedByTraditional} qualified adjacent-field candidates are hidden.
              </span>
            )}
          </div>
        </section>

        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="overflow-hidden rounded-[18px] border border-line bg-paper shadow-soft">
            <div className="border-b border-line bg-mist px-4 py-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="kicker">Vacancy root</p>
                  <h3 className="mt-1 font-serif text-2xl font-semibold text-ink">Senior Platform Engineer</h3>
                  <p className="mt-1 text-sm text-muted">Geography: Klang Valley · Experience: 2+ years · Threshold mode: {mode === "root" ? "adjacent signals allowed" : "degree-gated"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {vacancyRequirements.map((requirement) => (
                    <span key={requirement.label} className="rounded-full border border-[#E3D2A6] bg-[#F3EAD3] px-3 py-1 text-xs font-bold text-gold">
                      {requirement.label} · {requirement.kind}
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
                <path d="M50 10 C61 34 68 47 77 58" className={`career-path-line ${mode === "root" ? "is-selected" : ""}`} />
                <path d="M50 10 C70 27 84 42 93 58" className={`career-path-line ${mode === "root" ? "is-selected" : ""}`} />
              </svg>

              <div className="relative z-10 mx-auto mb-6 w-full max-w-[360px] rounded-[22px] border border-[#E3D2A6] bg-ink p-5 text-paper shadow-lifted">
                <p className="kicker text-[#D7C899]">Open role</p>
                <h4 className="mt-2 font-serif text-2xl font-semibold">Senior Platform Engineer</h4>
                <p className="mt-2 text-sm leading-6 text-paper/70">Career Root relaxes only marked requirements, then ranks sourced leads by fit and intent.</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <MiniMetric label="Fields" value={String(stats.fields)} />
                  <MiniMetric label="Surfaced" value={String(stats.surfaced)} />
                  <MiniMetric label="Top score" value={`${stats.topScore}`} />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {branches.map((branch, branchIndex) => (
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

          <div className="grid gap-3">
            <p className="rounded-[14px] border border-[#BFDCC8] bg-[#EAF4EC] px-3 py-2 text-xs font-semibold leading-5 text-[#2f6a48]">
              Sourced lead — not an applicant. Review before contacting or adding to a hiring process.
            </p>
            <CandidateDnaPanel candidate={selectedCandidate} ctaLabel="Move to review queue" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: SourcingMode; onChange: (mode: SourcingMode) => void }) {
  const options: Array<{ id: SourcingMode; label: string }> = [
    { id: "traditional", label: "Traditional filter" },
    { id: "root", label: "Career Root" }
  ];

  return (
    <div className="inline-flex shrink-0 rounded-full border border-line bg-mist p-1">
      {options.map((option) => {
        const active = option.id === mode;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              active ? "bg-ink text-paper shadow-soft" : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  hint
}: {
  label: string;
  value: string;
  tone: "ink" | "gold";
  hint?: string;
}) {
  return (
    <div className={`rounded-[14px] border p-3 ${tone === "gold" ? "border-[#E3D2A6] bg-[#F3EAD3]" : "border-line bg-mist"}`}>
      <p className={`kicker ${tone === "gold" ? "text-gold" : ""}`}>{label}</p>
      <p className={`mt-2 font-serif text-3xl font-semibold leading-none ${tone === "gold" ? "text-gold" : "text-ink"}`}>{value}</p>
      {hint ? <p className="mt-2 text-xs leading-4 text-muted">{hint}</p> : null}
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
  branch: CareerRootBranch;
  selectedCandidateId: string;
  onSelectCandidate: (candidateId: string) => void;
}) {
  return (
    <section className="relative z-20 rounded-[18px] border border-line bg-paper/95 p-4 shadow-soft backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[8px] bg-mist text-gold">
            <Network size={14} aria-hidden="true" />
          </span>
          <div>
            <p className="kicker">Hiring source 0{branchIndex + 1}</p>
            <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{branch.field}</h3>
          </div>
        </div>
        <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-paper">{branch.applicants.length} pathway fits</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{branch.fitReason}</p>
      <div className="mt-3 rounded-[12px] border border-[#E3D2A6] bg-[#F3EAD3] p-3 text-xs leading-5 text-gold">
        <p className="font-semibold">Relaxed threshold: {branch.thresholdRelaxed}</p>
        <p className="mt-1"><span className="font-semibold">Original:</span> {relaxationEvidence[branch.field].original}</p>
        <p><span className="font-semibold">Accepted evidence:</span> {relaxationEvidence[branch.field].substitute}</p>
      </div>

      <div className="mt-4 grid gap-2">
        {branch.applicants.slice(0, 10).map((candidate, index) => {
          const isSelected = selectedCandidateId === candidate.id;
          const gem = isHiddenGem(candidate);

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
                  <div className="mt-1 flex items-center gap-2">
                    <p className="truncate text-xs text-muted">{candidate.currentTrack} · {candidate.location}</p>
                    <span className="shrink-0 rounded-full border border-[#BFDCC8] bg-[#EAF4EC] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#2f6a48]">
                      Sourced lead
                    </span>
                    {gem ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#E3D2A6] bg-[#F3EAD3] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-gold">
                        <Gem size={9} aria-hidden="true" />
                        Hidden gem
                      </span>
                    ) : null}
                  </div>
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
