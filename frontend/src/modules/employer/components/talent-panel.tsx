"use client";

import { useState } from "react";
import { roleTalentBoards, talentMatches, type RoleTalentBoard, type TalentMatch } from "../employer-data";
import { CandidateDnaPanel, EmployerPageHeader, HeaderCard, InfoTile, InsightCard, MicroBar, MiniMetric, ScoreBar, TagList } from "./employer-ui";

export function TalentMatchingPanel() {
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
    <div>
      <EmployerPageHeader moduleId="talent" />
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
