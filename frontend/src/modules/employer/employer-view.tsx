"use client";

import type { EmployerModuleId } from "@careeros/shared";
import { useState } from "react";
import {
  applicationReviews,
  attritionClusters,
  careerRootBranches,
  employerMetrics,
  employerModules,
  onboardingPredictions,
  retentionSignals,
  roleTalentBoards,
  skillHeatmap,
  talentMatches,
  type ApplicationReview,
  type RoleTalentBoard,
  type SkillHeatmapPoint,
  type TalentMatch
} from "./employer-data";

type ReviewState = Record<string, ApplicationReview>;

const statusTone = {
  New: "border-line bg-mist text-muted",
  Shortlisted: "border-transparent bg-[#EAF4EC] text-good",
  Rejected: "border-transparent bg-[#F7EFD9] text-warn"
} as const;

const pressureTone = {
  Low: "bg-[#EAF4EC] text-good border-[#BFDCC8]",
  Medium: "bg-[#F7EFD9] text-warn border-[#E3D2A6]",
  High: "bg-[#F7E5E1] text-bad border-[#E8BDB7]"
} as const;

export function EmployerView({ activeModule }: { activeModule: EmployerModuleId }) {
  const active = employerModules.find((item) => item.id === activeModule) ?? employerModules[0];
  const [reviews, setReviews] = useState<ReviewState>(
    Object.fromEntries(applicationReviews.map((review) => [review.id, review]))
  );

  function updateReview(id: string, patch: Partial<ApplicationReview>) {
    setReviews((current) => ({
      ...current,
      [id]: { ...current[id], ...patch }
    }));
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="kicker">Employer workspace</p>
          <h2 className="mt-1 font-serif text-3xl font-semibold text-ink">Cempaka Digital</h2>
          <p className="mt-1 text-sm text-muted">{active.description}</p>
        </div>
      </div>

      {activeModule === "dashboard" ? <EmployerDashboard /> : null}
      {activeModule === "career-root" ? <CareerRootPanel /> : null}
      {activeModule === "talent" ? <TalentMatchingPanel /> : null}
      {activeModule === "retention" ? <RetentionPanel /> : null}
      {activeModule === "onboarding" ? <OnboardingPanel /> : null}
      {activeModule === "heatmap" ? <SkillHeatmapPanel /> : null}
      {activeModule === "attrition" ? <AttritionPanel /> : null}
      {activeModule === "review" ? (
        <ApplicationReviewPanel reviews={Object.values(reviews)} onUpdateReview={updateReview} />
      ) : null}
    </div>
  );
}

function EmployerDashboard() {
  const highRiskCount = retentionSignals.filter((signal) => !signal.optOut && signal.score >= 75).length;
  const averageMatch = Math.round(talentMatches.reduce((sum, candidate) => sum + candidate.score, 0) / talentMatches.length);
  const totalDemandGap = skillHeatmap.reduce((sum, point) => sum + Math.max(0, point.demand - point.supply), 0);

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="overflow-hidden rounded-[18px] border border-line bg-paper shadow-soft">
        <div className="border-b border-line bg-[linear-gradient(135deg,#14223d_0%,#233456_55%,#a9802f_140%)] p-5 text-paper">
          <p className="kicker text-[#D7C899]">Talent command center</p>
          <div className="mt-2 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
            <div>
              <h3 className="font-serif text-3xl font-semibold">Hiring, retention, and workforce pressure in one view</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-paper/75">
                CareerOS prioritizes high-match applicants, shows where new talent can come from, and flags workforce risk before it becomes churn.
              </p>
            </div>
            <div className="rounded-[14px] border border-paper/15 bg-paper/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold text-paper/70">This week</p>
              <p className="mt-2 font-serif text-4xl font-semibold text-[#F3EAD3]">{averageMatch}%</p>
              <p className="mt-1 text-sm text-paper/70">Average score across active high-fit candidates</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid gap-3 md:grid-cols-4">
            {employerMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <InsightCard title="Smart matching" value="42" detail="High-confidence candidates from composite scoring." />
            <InsightCard title="Retention risk" value={String(highRiskCount)} detail="Employees above 75 risk, excluding opt-outs." />
            <InsightCard title="Supply gap" value={String(totalDemandGap)} detail="Demand-minus-supply pressure across tracked locations." />
          </div>
        </div>
      </section>

      <aside className="grid gap-4">
        <section className="rounded-[18px] border border-line bg-ink p-4 text-paper shadow-soft">
          <p className="text-sm font-semibold text-paper/70">Recommended action</p>
          <h3 className="mt-2 text-xl font-semibold">Open Career Root for the Platform Engineer search</h3>
          <p className="mt-2 text-sm leading-6 text-paper/70">
            The strongest pipeline is not only CS. Economics and product candidates are showing consulting, analytics, and technical learning signals.
          </p>
        </section>
        <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
          <p className="kicker">Live employer modules</p>
          <div className="mt-3 grid gap-2">
            {["Career Root", "Talent Match", "Skill Heatmap", "Review"].map((label, index) => (
              <div key={label} className="flex items-center gap-3 rounded-[12px] border border-line bg-mist p-3">
                <span className="grid size-8 place-items-center rounded-full bg-ink text-xs font-bold text-paper">0{index + 1}</span>
                <span className="text-sm font-semibold text-ink">{label}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function CareerRootPanel() {
  const [selectedCandidateId, setSelectedCandidateId] = useState(talentMatches[0].id);
  const selectedCandidate = talentMatches.find((candidate) => candidate.id === selectedCandidateId) ?? talentMatches[0];

  return (
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

function TalentMatchingPanel() {
  const [roleBoards, setRoleBoards] = useState<RoleTalentBoard[]>(roleTalentBoards);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [jobDraft, setJobDraft] = useState({
    title: "",
    team: "",
    location: "",
    priority: "Active" as RoleTalentBoard["priority"],
    openings: "1",
    roleSignals: "",
    hiringGoal: ""
  });
  const [selectedRoleId, setSelectedRoleId] = useState(roleTalentBoards[0].id);
  const selectedRole = roleBoards.find((role) => role.id === selectedRoleId) ?? roleBoards[0];
  const [selectedCandidateId, setSelectedCandidateId] = useState(selectedRole.applicants[0].id);
  const selectedCandidate =
    selectedRole.applicants.find((candidate) => candidate.id === selectedCandidateId) ?? selectedRole.applicants[0];
  const topScore = Math.max(...selectedRole.applicants.map((candidate) => candidate.score));
  const averageIntent = Math.round(
    selectedRole.applicants.reduce((sum, candidate) => sum + candidate.interestSignal, 0) / selectedRole.applicants.length
  );

  function createJob() {
    const title = jobDraft.title.trim();
    const team = jobDraft.team.trim();
    const location = jobDraft.location.trim();
    const hiringGoal = jobDraft.hiringGoal.trim();
    const roleSignals = jobDraft.roleSignals
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!title || !team || !location || !hiringGoal || roleSignals.length === 0) {
      return;
    }

    const newRole = buildRoleBoard({
      id: `role-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${roleBoards.length + 1}`,
      title,
      team,
      location,
      priority: jobDraft.priority,
      openings: Math.max(1, Number(jobDraft.openings) || 1),
      hiringGoal,
      roleSignals
    });

    setRoleBoards((current) => [newRole, ...current]);
    setSelectedRoleId(newRole.id);
    setSelectedCandidateId(newRole.applicants[0].id);
    setShowCreateJob(false);
    setJobDraft({
      title: "",
      team: "",
      location: "",
      priority: "Active",
      openings: "1",
      roleSignals: "",
      hiringGoal: ""
    });
  }

  return (
    <div className="grid gap-4">
      <HeaderCard
        label="Smart Talent Matching"
        title="Composite scoring across experience, skills, education, and intent"
        detail="Each candidate is scored across multiple explainable dimensions so hiring teams can inspect profile evidence, Career DNA, missing signals, and likely role fit."
      />
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="grid gap-4">
          <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="kicker">Open roles</p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">Each role has its own talent board</h3>
                <p className="mt-1 text-sm text-muted">Switch roles to inspect different candidate rankings, gaps, and intent signals.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-line bg-mist px-3 py-1.5 text-sm font-semibold text-ink">
                  {roleBoards.length} live roles
                </span>
                <button
                  type="button"
                  onClick={() => setShowCreateJob((current) => !current)}
                  className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-gold hover:text-[#1c1402]"
                >
                  {showCreateJob ? "Close" : "Create job"}
                </button>
              </div>
            </div>
            {showCreateJob ? (
              <div className="mt-4 grid gap-3 rounded-[16px] border border-line bg-mist p-4 xl:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-ink">
                  Job title
                  <input
                    value={jobDraft.title}
                    onChange={(event) => setJobDraft((current) => ({ ...current, title: event.target.value }))}
                    placeholder="e.g. Solutions Architect"
                    className="rounded-[12px] border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-ink">
                  Team
                  <input
                    value={jobDraft.team}
                    onChange={(event) => setJobDraft((current) => ({ ...current, team: event.target.value }))}
                    placeholder="e.g. Enterprise Solutions"
                    className="rounded-[12px] border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-ink">
                  Location
                  <input
                    value={jobDraft.location}
                    onChange={(event) => setJobDraft((current) => ({ ...current, location: event.target.value }))}
                    placeholder="e.g. Kuala Lumpur"
                    className="rounded-[12px] border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-ink">
                  Openings
                  <input
                    value={jobDraft.openings}
                    onChange={(event) => setJobDraft((current) => ({ ...current, openings: event.target.value }))}
                    placeholder="1"
                    className="rounded-[12px] border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-ink">
                  Priority
                  <select
                    value={jobDraft.priority}
                    onChange={(event) =>
                      setJobDraft((current) => ({
                        ...current,
                        priority: event.target.value as RoleTalentBoard["priority"]
                      }))
                    }
                    className="rounded-[12px] border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="Active">Active</option>
                    <option value="Pipeline">Pipeline</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-ink xl:col-span-2">
                  Role signals
                  <input
                    value={jobDraft.roleSignals}
                    onChange={(event) => setJobDraft((current) => ({ ...current, roleSignals: event.target.value }))}
                    placeholder="Comma separated, e.g. client discovery, cloud, solution design"
                    className="rounded-[12px] border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-ink xl:col-span-2">
                  Hiring goal
                  <textarea
                    value={jobDraft.hiringGoal}
                    onChange={(event) => setJobDraft((current) => ({ ...current, hiringGoal: event.target.value }))}
                    placeholder="Describe what this role needs to achieve."
                    className="min-h-24 rounded-[12px] border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
                  />
                </label>
                <div className="xl:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={createJob}
                    className="rounded-[12px] bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-gold hover:text-[#1c1402]"
                  >
                    Add role and generate matches
                  </button>
                </div>
              </div>
            ) : null}
            <div className="mt-4 grid gap-3 xl:grid-cols-3">
              {roleBoards.map((role) => {
                const isSelected = role.id === selectedRole.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setSelectedCandidateId(role.applicants[0].id);
                    }}
                    className={`rounded-[16px] border p-4 text-left transition ${
                      isSelected ? "border-gold bg-[#FFF8E8] ring-4 ring-[#F3EAD3]" : "border-line bg-mist hover:border-gold hover:bg-paper"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="kicker">{role.team}</p>
                        <h4 className="mt-1 font-serif text-xl font-semibold text-ink">{role.title}</h4>
                        <p className="mt-1 text-sm text-muted">{role.location}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        role.priority === "Urgent"
                          ? "bg-[#F7E5E1] text-bad"
                          : role.priority === "Active"
                            ? "bg-[#F7EFD9] text-warn"
                            : "bg-[#E8EFF7] text-info"
                      }`}>
                        {role.priority}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <InfoTile label="Openings" value={String(role.openings)} />
                      <InfoTile label="Top match" value={`${Math.max(...role.applicants.map((candidate) => candidate.score))}%`} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {role.roleSignals.map((signal) => (
                        <span key={signal} className="rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-muted">
                          {signal}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <section className="overflow-hidden rounded-[18px] border border-line bg-paper shadow-soft">
              <div className="border-b border-line bg-[linear-gradient(135deg,#14223d_0%,#233456_58%,#a9802f_155%)] p-4 text-paper">
                <p className="kicker text-[#D7C899]">Matching board</p>
                <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold">{selectedRole.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-paper/75">
                      {selectedRole.hiringGoal}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <MiniMetric label="Top score" value={`${topScore}%`} />
                    <MiniMetric label="Avg intent" value={`${averageIntent}%`} />
                    <MiniMetric label="Profiles" value={String(selectedRole.applicants.length)} />
                  </div>
                </div>
              </div>
              <div className="grid gap-3 p-4 md:grid-cols-3">
                <InsightCard title="Best immediate fit" value={selectedRole.applicants[0].name.split(" ")[0]} detail={selectedRole.applicants[0].highlights[0]} />
                <InsightCard title="Best adjacent pivot" value={selectedRole.applicants[1].name.split(" ")[0]} detail={selectedRole.applicants[1].highlights[0]} />
                <InsightCard title="Primary gap trend" value={selectedRole.applicants[0].missingSignals[0].split(" ")[0]} detail={selectedRole.applicants[0].missingSignals[0]} />
              </div>
            </section>

            <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
              <p className="kicker">Selection focus</p>
              <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{selectedCandidate.name}</h3>
              <p className="mt-1 text-sm text-muted">{selectedCandidate.currentTrack} - {selectedCandidate.sourceField}</p>
              <div className="mt-4 grid gap-3">
                <ScoreBar label="Overall match" value={selectedCandidate.score} />
                <ScoreBar label="Interest signal" value={selectedCandidate.interestSignal} />
              </div>
              <div className="mt-4 rounded-[14px] border border-[#E3D2A6] bg-[#F3EAD3] p-3">
                <p className="kicker text-gold">Hiring angle</p>
                <p className="mt-2 text-sm leading-6 text-ink">{selectedCandidate.mobilityIntent}</p>
              </div>
              <div className="mt-4 rounded-[14px] border border-line bg-mist p-3">
                <p className="kicker">Role requirement lens</p>
                <p className="mt-2 text-sm leading-6 text-muted">{selectedRole.roleSignals.join(" • ")}</p>
              </div>
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-4 xl:grid-cols-2">
              {selectedRole.applicants.map((candidate, index) => {
                const isSelected = selectedCandidateId === candidate.id;

                return (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => setSelectedCandidateId(candidate.id)}
                    className={`rounded-[18px] border bg-paper p-4 text-left shadow-soft transition ${
                      isSelected ? "border-gold ring-4 ring-[#F3EAD3]" : "border-line hover:border-gold"
                    }`}
                    >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-12 place-items-center rounded-full bg-ink text-sm font-bold text-paper">{candidate.avatar}</span>
                        <div>
                          <p className="kicker">Rank 0{index + 1} - {candidate.sourceField}</p>
                          <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{candidate.name}</h3>
                          <p className="mt-1 text-sm text-muted">{candidate.currentTrack} - {candidate.location}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-gold px-3 py-1.5 text-sm font-bold text-[#1c1402]">{candidate.score}%</span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted">{candidate.summary}</p>
                    <div className="mt-4 grid gap-3">
                      <ScoreBar label="Skills" value={candidate.skillFit} />
                      <ScoreBar label="Experience" value={candidate.experienceFit} />
                      <ScoreBar label="Education" value={candidate.educationFit} />
                      <ScoreBar label="Interest signal" value={candidate.interestSignal} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <InfoTile label="Best fit" value={candidate.highlights[0]} />
                      <InfoTile label="Primary gap" value={candidate.missingSignals[0]} />
                    </div>
                    <TagList title="Core skills" items={candidate.skills.slice(0, 4)} tone="info" />
                    <span className="mt-4 inline-flex rounded-[10px] border border-line bg-mist px-3 py-2 text-sm font-semibold text-ink">
                      View profile and Career DNA
                    </span>
                  </button>
                );
              })}
            </div>

            <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
              <p className="kicker">Fit matrix</p>
              <h3 className="mt-2 font-serif text-xl font-semibold text-ink">Compare candidates for this role</h3>
              <div className="mt-4 grid gap-3">
                {selectedRole.applicants.map((candidate) => (
                  <div key={`matrix-${candidate.id}`} className="rounded-[14px] border border-line bg-mist p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-ink">{candidate.name}</span>
                      <span className="mono text-xs font-bold text-gold">{candidate.score}%</span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      <MicroBar label="Skill" value={candidate.skillFit} />
                      <MicroBar label="Exp" value={candidate.experienceFit} />
                      <MicroBar label="Edu" value={candidate.educationFit} />
                      <MicroBar label="Intent" value={candidate.interestSignal} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
        <CandidateDnaPanel candidate={selectedCandidate} ctaLabel="Invite to interview" />
      </div>
    </div>
  );
}

function buildRoleBoard({
  id,
  title,
  team,
  location,
  priority,
  openings,
  hiringGoal,
  roleSignals
}: {
  id: string;
  title: string;
  team: string;
  location: string;
  priority: RoleTalentBoard["priority"];
  openings: number;
  hiringGoal: string;
  roleSignals: string[];
}) {
  const keywords = `${title} ${team} ${roleSignals.join(" ")}`.toLowerCase();
  const applicants = talentMatches
    .map((candidate) => scoreCandidateForRole(candidate, keywords))
    .sort((left, right) => right.score - left.score);

  return {
    id,
    title,
    team,
    location,
    priority,
    openings,
    hiringGoal,
    roleSignals,
    applicants
  };
}

function scoreCandidateForRole(candidate: TalentMatch, keywords: string): TalentMatch {
  const titleBoost =
    includesAny(keywords, ["platform", "backend", "infrastructure", "cloud"]) && candidate.id === "tm-aishah"
      ? 8
      : includesAny(keywords, ["consult", "client", "solutions", "advisory"]) && candidate.id === "tm-daniel"
        ? 8
        : includesAny(keywords, ["product", "data", "analytics", "growth"]) && candidate.id === "tm-sara"
          ? 8
          : 0;
  const adjacentBoost = candidate.careerInterests.some((interest) => keywords.includes(interest.toLowerCase().split(" ")[0])) ? 4 : 0;
  const signalBoost = candidate.skills.filter((skill) => keywords.includes(skill.toLowerCase().split(" ")[0])).length * 2;
  const score = Math.min(96, candidate.score + titleBoost + adjacentBoost + signalBoost - 4);

  return {
    ...candidate,
    id: `${candidate.id}-${keywords.replace(/[^a-z0-9]+/g, "-").slice(0, 18)}`,
    score,
    skillFit: Math.max(68, Math.min(96, candidate.skillFit + titleBoost + signalBoost - 4)),
    experienceFit: Math.max(68, Math.min(95, candidate.experienceFit + titleBoost + adjacentBoost - 3)),
    educationFit: Math.max(68, Math.min(93, candidate.educationFit + adjacentBoost - 2)),
    interestSignal: Math.max(72, Math.min(98, candidate.interestSignal + titleBoost + adjacentBoost)),
    summary: `${candidate.summary} Match generated for ${keywords.includes("consult") ? "a client-facing" : "a role-specific"} requisition based on entered job signals.`,
    mobilityIntent: `${candidate.mobilityIntent}. Role-specific fit generated from employer-created job signals.`,
    highlights: [...candidate.highlights.slice(0, 2), `Matched to signals: ${keywords.split(" ").slice(0, 3).join(", ")}`]
  };
}

function includesAny(source: string, terms: string[]) {
  return terms.some((term) => source.includes(term));
}

function RetentionPanel() {
  return (
    <div className="grid gap-4">
      <HeaderCard
        label="Talent Retention Signals"
        title="Explainable retention risk with opt-out awareness"
        detail="Risk is computed from weighted signals: stagnation 25%, compensation gap 25%, engagement 20%, mobility 15%, and skill growth 15%."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {retentionSignals.map((signal) => (
          <section key={signal.employee} className="overflow-hidden rounded-[18px] border border-line bg-paper shadow-soft">
            <div className={`p-4 ${signal.optOut ? "bg-mist" : signal.score >= 75 ? "bg-[#FFF4EF]" : "bg-[#FFF8E8]"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="kicker">{signal.team}</p>
                  <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{signal.employee}</h3>
                  <p className="mt-1 text-sm text-muted">{signal.role}</p>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${signal.optOut ? "bg-muted text-paper" : "bg-ink text-paper"}`}>
                  {signal.optOut ? "Opt out" : `${signal.score}/100`}
                </span>
              </div>
              {!signal.optOut ? <RiskDial value={signal.score} /> : null}
            </div>
            {signal.optOut ? (
              <p className="m-4 rounded-[12px] border border-line bg-mist p-3 text-sm leading-6 text-muted">
                This employee opted out of CareerOS retention monitoring. Only aggregate team metrics are shown.
              </p>
            ) : (
              <div className="grid gap-2 p-4">
                {signal.factors.map((factor) => (
                  <div key={factor.label} className="rounded-[12px] border border-line bg-mist p-3">
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold text-ink">
                      <span>{factor.label} ({factor.weight})</span>
                      <span className="text-gold">+{factor.contribution}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted">{factor.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function OnboardingPanel() {
  return (
    <div className="grid gap-4">
      <HeaderCard
        label="Onboarding Success Predictor"
        title="Forecast first impact, ramp risk, and next milestone"
        detail="The predictor uses prior turnover patterns, time to first tangible impact, mentor fit, and milestone clarity."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {onboardingPredictions.map((hire) => (
          <section key={hire.hire} className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="kicker">{hire.role}</p>
                <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{hire.hire}</h3>
              </div>
              <span className="rounded-full bg-ink px-3 py-1.5 text-sm font-bold text-paper">{hire.successProbability}%</span>
            </div>
            <div className="mt-4 rounded-[16px] border border-line bg-mist p-4">
              <ScoreBar label="Success probability" value={hire.successProbability} />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <InfoTile label="Time to impact" value={hire.timeToImpact} />
                <InfoTile label="Turnover risk" value={`${hire.turnoverRisk}%`} />
              </div>
            </div>
            <div className="mt-4 rounded-[12px] border border-[#E3D2A6] bg-[#F3EAD3] p-3">
              <p className="kicker text-gold">Next milestone</p>
              <p className="mt-1 text-sm font-semibold text-ink">{hire.nextMilestone}</p>
            </div>
            <TagList title="Prediction drivers" items={hire.drivers} tone="info" />
          </section>
        ))}
      </div>
    </div>
  );
}

function SkillHeatmapPanel() {
  const [selectedSkill, setSelectedSkill] = useState(skillHeatmap[0].skill);
  const selectedPoint = skillHeatmap.find((point) => point.skill === selectedSkill) ?? skillHeatmap[0];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
      <section className="overflow-hidden rounded-[18px] border border-line bg-paper shadow-soft">
        <div className="border-b border-line bg-mist px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="kicker">Skill Supply-Demand Heatmap</p>
              <h3 className="mt-1 font-serif text-2xl font-semibold text-ink">Klang Valley talent pressure map</h3>
              <p className="mt-1 text-sm text-muted">Bubble size shows demand gap. Ring color shows salary pressure.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full border border-[#BFDCC8] bg-[#EAF4EC] px-3 py-1 text-good">Low pressure</span>
              <span className="rounded-full border border-[#E3D2A6] bg-[#F7EFD9] px-3 py-1 text-warn">Medium</span>
              <span className="rounded-full border border-[#E8BDB7] bg-[#F7E5E1] px-3 py-1 text-bad">High</span>
            </div>
          </div>
        </div>
        <div className="relative min-h-[610px] overflow-hidden bg-[#DDE8F2]">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "url(https://a.tile.openstreetmap.org/11/1651/1015.png), linear-gradient(#cbd9e7 1px, transparent 1px), linear-gradient(90deg, #cbd9e7 1px, transparent 1px)",
              backgroundPosition: "center, 0 0, 0 0",
              backgroundRepeat: "repeat",
              backgroundSize: "256px 256px, 42px 42px, 42px 42px"
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_34%,rgba(192,84,77,.26),transparent_16%),radial-gradient(circle_at_44%_79%,rgba(192,84,77,.22),transparent_15%),radial-gradient(circle_at_48%_54%,rgba(169,128,47,.20),transparent_16%)]" />

          {skillHeatmap.map((point) => (
            <HeatmapMarker
              key={`${point.skill}-${point.location}`}
              point={point}
              selected={point.skill === selectedSkill}
              onSelect={() => setSelectedSkill(point.skill)}
            />
          ))}

          <div className="absolute left-4 top-4 w-[min(360px,calc(100%-32px))] rounded-[16px] border border-line bg-paper/95 p-4 shadow-lifted backdrop-blur">
            <p className="kicker">Map interpretation</p>
            <h4 className="mt-2 font-serif text-xl font-semibold text-ink">Where hiring will cost more or take longer</h4>
            <div className="mt-3 grid gap-2">
              {skillHeatmap.map((point) => {
                const gap = point.demand - point.supply;

                return (
                  <button
                    key={`summary-${point.skill}`}
                    type="button"
                    onClick={() => setSelectedSkill(point.skill)}
                    className={`rounded-[12px] border p-3 text-left transition ${
                      point.skill === selectedSkill ? "border-gold bg-[#FFF8E8]" : "border-line bg-mist hover:border-gold"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-ink">{point.skill}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${pressureTone[point.salaryPressure]}`}>
                        {point.salaryPressure}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">{point.location} - demand gap {gap > 0 ? `+${gap}` : gap}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-4 left-4 rounded-[10px] border border-line bg-paper/90 px-3 py-2 text-xs font-semibold text-muted shadow-soft backdrop-blur">
            OpenStreetMap-based skill pressure prototype
          </div>
        </div>
      </section>

      <aside className="grid content-start gap-4">
        <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
          <p className="kicker">{selectedPoint.location}</p>
          <h3 className="mt-1 font-serif text-2xl font-semibold text-ink">{selectedPoint.skill}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Demand is {selectedPoint.demand}% against {selectedPoint.supply}% available supply. This market needs either salary adjustment, adjacent-source hiring, or targeted upskilling.
          </p>
          <div className="mt-4 grid gap-3">
            <ScoreBar label="Demand concentration" value={selectedPoint.demand} />
            <ScoreBar label="Talent availability" value={selectedPoint.supply} />
            <ScoreBar label="Salary pressure" value={salaryPressureValue(selectedPoint)} />
          </div>
        </section>
        <section className="rounded-[18px] border border-line bg-ink p-4 text-paper shadow-soft">
          <p className="kicker text-[#D7C899]">Suggested action</p>
          <h3 className="mt-2 text-xl font-semibold">{heatmapRecommendation(selectedPoint)}</h3>
          <p className="mt-2 text-sm leading-6 text-paper/70">
            Use Career Root to source adjacent candidates, then assign courses or portfolio projects to close the visible supply gap.
          </p>
        </section>
        <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
          <p className="kicker">Location cards</p>
          <div className="mt-3 grid gap-2">
            {skillHeatmap.map((point) => (
              <InfoRow
                key={`row-${point.skill}`}
                label={`${point.location} - ${point.skill}`}
                value={`${point.demand - point.supply > 0 ? "+" : ""}${point.demand - point.supply}`}
              />
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function AttritionPanel() {
  return (
    <div className="grid gap-4">
      <HeaderCard
        label="Attrition Root Cause Engine"
        title="Cluster exit patterns instead of blaming individual cases"
        detail="The engine groups salary, promotion, performance, and engagement data to expose systemic retention issues."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {attritionClusters.map((cluster) => (
          <section key={cluster.label} className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="kicker">{cluster.share} of exits</p>
                <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{cluster.label}</h3>
              </div>
              <span className="rounded-full bg-ink px-3 py-1.5 text-sm font-bold text-paper">{cluster.risk}</span>
            </div>
            <div className="mt-4 rounded-[16px] border border-line bg-mist p-4">
              <ScoreBar label="Cluster risk" value={cluster.risk} />
              <p className="mt-3 rounded-[12px] border border-[#E3D2A6] bg-[#F3EAD3] p-3 text-sm leading-6 text-gold">
                Root cause: {cluster.rootCause}
              </p>
            </div>
            <TagList title="Evidence" items={cluster.evidence} tone="warn" />
          </section>
        ))}
      </div>
    </div>
  );
}

function ApplicationReviewPanel({
  reviews,
  onUpdateReview
}: {
  reviews: ApplicationReview[];
  onUpdateReview: (id: string, patch: Partial<ApplicationReview>) => void;
}) {
  const [selectedCandidateId, setSelectedCandidateId] = useState(talentMatches[0].id);
  const selectedCandidate = talentMatches.find((candidate) => candidate.id === selectedCandidateId) ?? talentMatches[0];

  return (
    <div className="grid gap-4">
      <HeaderCard
        label="Application review"
        title="Shortlist or reject with a feedback trace"
        detail="Rejected applicants must receive a reason so they know which skills to build before reapplying."
      />
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="grid gap-4 xl:grid-cols-3">
          {reviews.map((review) => {
            const candidate = talentMatches.find((match) => match.name === review.candidate);

            return (
              <article key={review.id} className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="kicker">{review.role}</p>
                    <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{review.candidate}</h3>
                  </div>
                  <span className="rounded-full bg-ink px-3 py-1.5 text-sm font-bold text-paper">{review.score}%</span>
                </div>
                <span className={`mt-4 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone[review.status]}`}>
                  {review.status}
                </span>
                <TagList title="Feedback trace" items={review.feedbackTrace} tone="info" />
                {candidate ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCandidateId(candidate.id)}
                    className="mt-4 w-full rounded-[10px] border border-line bg-mist px-3 py-2 text-sm font-semibold text-ink transition hover:border-gold hover:bg-paper"
                  >
                    View profile and Career DNA
                  </button>
                ) : null}
                <textarea
                  value={review.reasonRequired}
                  onChange={(event) => onUpdateReview(review.id, { reasonRequired: event.target.value })}
                  placeholder="Reject reason required before rejection"
                  className="mt-4 min-h-20 w-full rounded-[10px] border border-line bg-mist px-3 py-2 text-sm leading-6 text-ink outline-none transition focus:border-gold focus:bg-paper"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateReview(review.id, { status: "Shortlisted" })}
                    className="flex-1 rounded-[10px] bg-ink px-3 py-2 text-sm font-semibold text-paper transition hover:bg-gold hover:text-[#1c1402]"
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    disabled={!review.reasonRequired.trim()}
                    onClick={() => onUpdateReview(review.id, { status: "Rejected" })}
                    className="flex-1 rounded-[10px] border border-line bg-paper px-3 py-2 text-sm font-semibold text-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Reject
                  </button>
                </div>
              </article>
            );
          })}
        </section>
        <CandidateDnaPanel candidate={selectedCandidate} ctaLabel="Attach feedback trace" />
      </div>
    </div>
  );
}

function CandidateDnaPanel({ candidate, ctaLabel }: { candidate: TalentMatch; ctaLabel: string }) {
  return (
    <aside className="sticky top-4 self-start overflow-hidden rounded-[18px] border border-line bg-paper shadow-soft">
      <div className="bg-[linear-gradient(135deg,#14223d_0%,#263858_70%,#a9802f_150%)] p-4 text-paper">
        <div className="flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-full bg-paper text-lg font-bold text-ink">{candidate.avatar}</span>
          <div>
            <p className="kicker text-[#D7C899]">Candidate Career DNA</p>
            <h3 className="mt-1 font-serif text-2xl font-semibold">{candidate.name}</h3>
            <p className="mt-1 text-sm text-paper/70">{candidate.currentTrack} - {candidate.location}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-paper/75">{candidate.summary}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <MiniMetric label="Match" value={`${candidate.score}%`} />
          <MiniMetric label="Intent" value={`${candidate.interestSignal}%`} />
        </div>
      </div>

      <div className="grid gap-4 p-4">
        <section className="rounded-[14px] border border-line bg-mist p-3">
          <p className="kicker">Composite score</p>
          <div className="mt-3 grid gap-3">
            <ScoreBar label="Skills" value={candidate.skillFit} />
            <ScoreBar label="Experience" value={candidate.experienceFit} />
            <ScoreBar label="Education" value={candidate.educationFit} />
            <ScoreBar label="Interest signal" value={candidate.interestSignal} />
          </div>
        </section>

        <ProfileSection title="Profile" items={[candidate.education, ...candidate.experience]} />
        <ProfileSection title="Certifications" items={candidate.certifications} />
        <ProfileSection title="Learning signals" items={candidate.learningSignals} />
        <ProfileSection title="Career interests" items={candidate.careerInterests} />
        <ProfileSection title="Portfolio evidence" items={candidate.portfolio} />
        <TagList title="Skills" items={candidate.skills} tone="info" />
        <TagList title="DNA signals" items={candidate.dnaSignals} tone="good" />
        <TagList title="Missing signals" items={candidate.missingSignals} tone="warn" />

        <div className="rounded-[14px] border border-[#E3D2A6] bg-[#F3EAD3] p-3">
          <p className="kicker text-gold">Mobility intent</p>
          <p className="mt-2 text-sm leading-6 text-ink">{candidate.mobilityIntent}</p>
        </div>

        <button type="button" className="rounded-[12px] bg-ink px-4 py-3 text-sm font-semibold text-paper transition hover:bg-gold hover:text-[#1c1402]">
          {ctaLabel}
        </button>
      </div>
    </aside>
  );
}

function HeatmapMarker({
  point,
  selected,
  onSelect
}: {
  point: SkillHeatmapPoint;
  selected: boolean;
  onSelect: () => void;
}) {
  const gap = Math.max(0, point.demand - point.supply);
  const size = 58 + gap * 0.75;
  const ringColor = point.salaryPressure === "High" ? "rgba(192,84,77,.38)" : point.salaryPressure === "Medium" ? "rgba(169,128,47,.34)" : "rgba(63,143,94,.28)";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-paper/95 text-center shadow-lifted backdrop-blur transition hover:scale-105 ${
        selected ? "border-ink ring-4 ring-[#F3EAD3]" : "border-paper"
      }`}
      style={{
        left: `${point.x}%`,
        top: `${point.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        boxShadow: `0 0 0 13px ${ringColor}, 0 18px 36px rgba(20,34,61,.20)`
      }}
      title={`${point.skill} in ${point.location}`}
    >
      <span className="block px-2 text-[11px] font-extrabold leading-tight text-ink">{point.skill}</span>
      <span className="mt-1 block text-[10px] font-bold text-gold">+{point.demand - point.supply}</span>
    </button>
  );
}

function HeaderCard({ label, title, detail }: { label: string; title: string; detail: string }) {
  return (
    <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
      <p className="kicker">{label}</p>
      <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-muted">{detail}</p>
    </section>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-mist p-3">
      <p className="kicker">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold leading-none text-ink">{value}</p>
      <p className="mt-2 text-sm leading-5 text-muted">{detail}</p>
    </div>
  );
}

function InsightCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-[16px] border border-line bg-mist p-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-2 font-serif text-3xl font-semibold text-gold">{value}</p>
      <p className="mt-2 text-sm leading-5 text-muted">{detail}</p>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#F1EDE3]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#a9802f,#d9b65d)]"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function MicroBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-1 text-[10px] font-bold text-muted">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#F1EDE3]">
        <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[12px] border border-line bg-mist px-3 py-2">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-line bg-paper p-3">
      <p className="kicker">{label}</p>
      <p className="mt-2 font-serif text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-paper/15 bg-paper/10 p-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-paper/55">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#F3EAD3]">{value}</p>
    </div>
  );
}

function RiskDial({ value }: { value: number }) {
  return (
    <div className="mt-4 rounded-[14px] border border-line bg-paper/80 p-3">
      <div className="flex items-center justify-between text-xs font-semibold text-muted">
        <span>Low risk</span>
        <span>High risk</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#EAF4EC]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#3f8f5e,#bc8a2e,#c0544d)]"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function ProfileSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      <div className="grid gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-[10px] border border-line bg-mist px-3 py-2 text-sm leading-6 text-muted">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function TagList({ title, items, tone }: { title: string; items: string[]; tone: "good" | "warn" | "info" }) {
  const toneClass = {
    good: "bg-[#EAF4EC] text-good",
    warn: "bg-[#F7EFD9] text-warn",
    info: "bg-[#E8EFF7] text-info"
  }[tone];

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function salaryPressureValue(point: SkillHeatmapPoint) {
  return point.salaryPressure === "High" ? 92 : point.salaryPressure === "Medium" ? 68 : 38;
}

function heatmapRecommendation(point: SkillHeatmapPoint) {
  if (point.salaryPressure === "High") {
    return "Increase offer band or widen sourcing immediately";
  }

  if (point.salaryPressure === "Medium") {
    return "Use adjacent-field candidates and upskilling";
  }

  return "Maintain current salary band and build bench";
}
