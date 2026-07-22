"use client";

import { useState } from "react";
import { roleTalentBoards } from "../employer-data";
import { CandidateDnaPanel, EmployerPageHeader, HeaderCard, InfoTile, InsightCard, MicroBar, MiniMetric, ScoreBar, TagList } from "./employer-ui";
import { InterviewKit } from "./interview-kit";

export function TalentMatchingPanel() {
  const [selectedRoleId, setSelectedRoleId] = useState(roleTalentBoards[0].id);
  const selectedRole = roleTalentBoards.find((role) => role.id === selectedRoleId) ?? roleTalentBoards[0];
  const [selectedCandidateId, setSelectedCandidateId] = useState(selectedRole.applicants[0].id);
  const selectedCandidate =
    selectedRole.applicants.find((candidate) => candidate.id === selectedCandidateId) ?? selectedRole.applicants[0];
  const topScore = Math.max(...selectedRole.applicants.map((candidate) => candidate.score));
  const averageIntent = Math.round(
    selectedRole.applicants.reduce((sum, candidate) => sum + candidate.interestSignal, 0) / selectedRole.applicants.length
  );

  return (
    <div>
      <EmployerPageHeader moduleId="talent" />
      <div className="grid gap-4">
        <HeaderCard
          label="Smart Talent Matching"
          title="Composite scoring across experience, skills, education, and intent"
          detail="Applicants stay with the role they submitted for. Review explainable evidence, gaps, and intent, then prepare a tailored interview kit in one click."
        />
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="grid gap-4">
            <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="kicker">Open roles</p>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">Each role has its own talent board</h3>
                  <p className="mt-1 text-sm text-muted">Switch roles to inspect only the applicants who submitted for that vacancy—never reassigned silently.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-line bg-mist px-3 py-1.5 text-sm font-semibold text-ink">
                    {roleTalentBoards.length} live roles
                  </span>
                </div>
              </div>
              <div className="mt-4 grid gap-3 xl:grid-cols-3">
                {roleTalentBoards.map((role) => {
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
                        <InfoTile label="Applicants" value={String(role.applicants.length)} />
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

            <InterviewKit candidate={selectedCandidate} roleTitle={selectedRole.title} />
          </section>
          <CandidateDnaPanel candidate={selectedCandidate} ctaLabel="Invite to interview" />
        </div>
      </div>
    </div>
  );
}
