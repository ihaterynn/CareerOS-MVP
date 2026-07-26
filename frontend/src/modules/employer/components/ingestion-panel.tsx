"use client";

import { BadgeCheck, ChevronRight, CircleCheck, Clock3, FileSearch, Filter, LockKeyhole, MapPin, Pause, UserCheck, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { EmployerPageHeader } from "./employer-ui";
import { buildDailyReviewDesk, mockDailyCvs, type DailyReviewCandidate, type ExtractedCv, type IngestionRole } from "../ingestion-data";

type ReviewAction = "Shortlisted" | "On hold" | "Not progressing";
type RoleFilter = IngestionRole | "All roles";
type QueueFilter = "all" | "passed" | "reviewable";

const actionStyle: Record<ReviewAction, string> = {
  Shortlisted: "border-[#BFDCC8] bg-[#EAF4EC] text-good",
  "On hold": "border-[#E3D2A6] bg-[#F7EFD9] text-warn",
  "Not progressing": "border-[#E8BDB7] bg-[#F7E5E1] text-bad"
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2);
}

function CandidateRow({ candidate, selected, action, onSelect }: { candidate: DailyReviewCandidate; selected: boolean; action?: ReviewAction; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full rounded-2xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${selected ? "border-[#B89542] bg-[#FFF9EB] shadow-soft" : "border-line bg-paper hover:border-[#B89542] hover:bg-[#FFFCF5]"}`}
    >
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-xs font-bold text-paper">{initials(candidate.name)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-ink">{candidate.name}</span>
          <span className="mt-0.5 block truncate text-xs text-muted">{candidate.role} · {candidate.location}</span>
          <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-muted"><CircleCheck size={13} className="text-good" />{candidate.matchedRequirements}/{candidate.requiredRequirements} core requirements · {candidate.years} yrs</span>
          <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${candidate.recommendation === "Passed" ? "border-[#BFDCC8] bg-[#EAF4EC] text-good" : "border-[#E3D2A6] bg-[#FFF7E2] text-[#8A6516]"}`}>{candidate.recommendation === "Passed" ? "Passed all" : "Reviewable"}</span>
          {action ? <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${actionStyle[action]}`}>{action}</span> : null}
        </span>
        <EvidenceScore score={candidate.score} compact />
        <ChevronRight size={16} className="mt-3 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-gold" aria-hidden="true" />
      </div>
    </button>
  );
}

function DecisionAction({ label, icon, className, onClick }: { label: string; icon: React.ReactNode; className: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${className}`}>{icon}{label}</button>;
}

function EvidenceScore({ score, compact = false }: { score: number; compact?: boolean }) {
  return (
    <div className="shrink-0 text-center" role="img" aria-label={`${score} percent evidence score`}>
      <div className={`grid place-items-center rounded-full ${compact ? "size-10 p-[3px]" : "size-[92px] p-[7px]"}`} style={{ background: `conic-gradient(#39B878 0 ${score}%, #DCE2DC ${score}% 100%)` }}>
        <div className="grid size-full place-items-center rounded-full bg-[#FFFDF8] text-ink"><span className={`font-serif font-semibold leading-none ${compact ? "text-xs" : "text-2xl"}`}>{score}{compact ? null : <span className="text-sm">%</span>}</span></div>
      </div>
      {!compact ? <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#D7C899]">Evidence fit</p> : null}
    </div>
  );
}

export function CvIngestionPanel({ records: _records }: { records: ExtractedCv[] }) {
  const [role, setRole] = useState<RoleFilter>("All roles");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [selectedId, setSelectedId] = useState("");
  const [actions, setActions] = useState<Record<string, ReviewAction>>({});
  void _records;
  const desk = useMemo(() => buildDailyReviewDesk(mockDailyCvs, role === "All roles" ? undefined : role), [role]);
  const visibleQueue = desk.queue.filter((candidate) => queueFilter === "all" || candidate.recommendation.toLowerCase() === queueFilter);
  const passedCount = desk.queue.filter((candidate) => candidate.recommendation === "Passed").length;
  const reviewableCount = desk.queue.filter((candidate) => candidate.recommendation === "Reviewable").length;
  const selected = visibleQueue.find((candidate) => candidate.id === selectedId) ?? visibleQueue[0];

  function decide(action: ReviewAction) {
    if (selected) setActions((current) => ({ ...current, [selected.id]: action }));
  }

  return (
    <div className="space-y-5 pb-8">
      <EmployerPageHeader moduleId="dashboard" />

      <section className="overflow-hidden rounded-[22px] border border-[#CFC6B3] bg-[#FFFDF8] shadow-soft">
        <div className="border-b border-[#E8E1D3] px-5 py-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="kicker text-[#8A6516]">Today’s CV review desk</p>
              <h1 className="mt-1 max-w-2xl font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">Review only the people who already meet the bar.</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-muted"><Clock3 size={13} />Snapshot 08:45 today</span>
            </div>
          </div>
        </div>
        <div className="grid divide-y divide-[#E8E1D3] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-4 sm:px-6"><p className="kicker">Received today</p><p className="mt-1 font-serif text-3xl font-semibold text-ink">{desk.totalReceived.toLocaleString()}</p><p className="mt-1 text-xs text-muted">CVs extracted into this batch</p></div>
          <div className="p-4 sm:px-6"><p className="kicker">Hard filters not passed</p><p className="mt-1 font-serif text-3xl font-semibold text-bad">{desk.autoFiltered.toLocaleString()}</p><p className="mt-1 text-xs text-muted">JD experience or degree rules only</p></div>
          <div className="p-4 sm:px-6"><p className="kicker">Perfect resumes</p><p className="mt-1 font-serif text-3xl font-semibold text-good">{desk.passed.length.toLocaleString()}</p><p className="mt-1 text-xs text-muted">Every stated requirement matched</p></div>
        </div>
      </section>

      <section className="rounded-[18px] border border-line bg-paper p-3 shadow-soft sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-ink"><Filter size={16} className="text-gold" />Review queue for</div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter review queue by role">
            {(["All roles", ...desk.roles.map((entry) => entry.title)] as RoleFilter[]).map((entry) => {
              const count = entry === "All roles" ? desk.reviewReady : desk.roles.find((item) => item.title === entry)?.count ?? 0;
              return <button key={entry} type="button" onClick={() => setRole(entry)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${role === entry ? "border-ink bg-ink text-paper" : "border-line bg-mist text-muted hover:border-gold hover:text-ink"}`}>{entry} <span className="ml-1 opacity-70">{count}</span></button>;
            })}
          </div>
        </div>
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <aside className="overflow-hidden rounded-[20px] border border-line bg-paper shadow-soft">
          <div className="border-b border-line px-4 py-4"><div className="flex items-start justify-between gap-3"><div><p className="kicker">Prioritised queue</p><h2 className="mt-1 font-serif text-2xl font-semibold text-ink">{role === "All roles" ? "Best fit, by role" : role}</h2></div><span className="rounded-full bg-[#EAF4EC] px-2.5 py-1 text-xs font-bold text-good">{visibleQueue.length} to review</span></div><p className="mt-2 text-xs leading-5 text-muted">Hard filters cannot be bypassed. Requirement gaps are visible, not automatic rejections.</p></div>
          <div className="grid grid-cols-2 gap-2 border-b border-line p-3" role="group" aria-label="Filter candidates by review status">
            <button type="button" onClick={() => setQueueFilter("passed")} className={`rounded-xl border px-3 py-2 text-left transition ${queueFilter === "passed" ? "border-[#8DBCA0] bg-[#EAF4EC] text-good" : "border-line bg-mist text-muted hover:border-[#8DBCA0]"}`}><span className="block text-xs font-bold">Passed all</span><span className="mt-0.5 block text-[11px]">{passedCount} full matches</span></button>
            <button type="button" onClick={() => setQueueFilter("reviewable")} className={`rounded-xl border px-3 py-2 text-left transition ${queueFilter === "reviewable" ? "border-[#D9BD74] bg-[#FFF7E2] text-[#8A6516]" : "border-line bg-mist text-muted hover:border-[#D9BD74]"}`}><span className="block text-xs font-bold">Reviewable</span><span className="mt-0.5 block text-[11px]">{reviewableCount} partial matches</span></button>
            {queueFilter !== "all" ? <button type="button" onClick={() => setQueueFilter("all")} className="col-span-2 text-xs font-bold text-muted underline decoration-line underline-offset-4 hover:text-ink">Show all {desk.queue.length} eligible candidates</button> : null}
          </div>
          <div className="max-h-[620px] space-y-2 overflow-y-auto p-3">
            {visibleQueue.map((candidate) => <CandidateRow key={candidate.id} candidate={candidate} selected={selected?.id === candidate.id} action={actions[candidate.id]} onSelect={() => setSelectedId(candidate.id)} />)}
            {!visibleQueue.length ? <p className="rounded-xl bg-mist p-4 text-sm text-muted">No candidates match this review status for the selected role.</p> : null}
          </div>
        </aside>

        {selected ? <article className="overflow-hidden rounded-[20px] border border-line bg-paper shadow-soft">
          <div className="border-b border-line bg-[#132440] px-5 py-5 text-paper sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-paper text-sm font-bold text-ink">{initials(selected.name)}</span><div><p className="kicker text-[#D7C899]">Candidate review</p><h2 className="mt-1 font-serif text-3xl font-semibold">{selected.name}</h2><p className="mt-1 text-sm text-paper/70">{selected.role} · {selected.years} years experience</p></div></div><EvidenceScore score={selected.score} /></div>
            <div className="mt-4 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-2.5 py-1 text-xs font-bold text-paper"><MapPin size={13} />{selected.location}</span><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${selected.recommendation === "Passed" ? "bg-[#EAF4EC] text-good" : "bg-[#FFF1D8] text-[#8A6516]"}`}><BadgeCheck size={13} />{selected.recommendation === "Passed" ? "Passed all requirements" : "Reviewable · gaps flagged"}</span>{actions[selected.id] ? <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${actionStyle[actions[selected.id]]}`}>{actions[selected.id]}</span> : null}</div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="kicker">Why this CV is here</p>
              <h3 className="mt-1 text-lg font-bold text-ink">{selected.recommendation === "Passed" ? "Every stated requirement was evidenced." : "Hard filters passed; missing requirements need human context."}</h3>
              <div className="mt-4 space-y-3">
                {selected.evidence.map((item) => <div key={item.label} className="flex gap-3 rounded-xl border border-line bg-[#FFFCF6] p-3"><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${item.passed ? "bg-[#EAF4EC] text-good" : "bg-[#F7EFD9] text-warn"}`}>{item.passed ? <CircleCheck size={13} /> : <Pause size={12} />}</span><div><p className="text-sm font-bold text-ink">{item.label}</p><p className="mt-0.5 text-xs leading-5 text-muted">{item.detail}</p></div></div>)}
              </div>
              <div className="mt-5"><p className="kicker">Matched skills</p><div className="mt-2 flex flex-wrap gap-2">{selected.skills.map((skill) => <span key={skill} className="rounded-full bg-[#E8EFF7] px-2.5 py-1 text-xs font-semibold text-info">{skill}</span>)}</div></div>
            </div>
            <div className="rounded-2xl border border-[#E8D6A5] bg-[#FFF9EB] p-4"><p className="kicker text-[#8A6516]">Human decision</p><h3 className="mt-1 font-serif text-2xl font-semibold text-ink">What do you want to do?</h3><p className="mt-2 text-sm leading-6 text-muted">AI prioritised this CV. The hiring team owns the outcome and can review the source file before deciding.</p><a href="#" onClick={(event) => event.preventDefault()} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#795907] underline decoration-[#C9A449] underline-offset-4">Open {selected.source}<FileSearch size={15} /></a><div className="mt-5 grid gap-2"><DecisionAction label="Shortlist" icon={<UserCheck size={16} />} className="border-ink bg-ink text-paper hover:bg-[#253a5d]" onClick={() => decide("Shortlisted")} /><div className="flex gap-2"><DecisionAction label="Hold" icon={<Pause size={15} />} className="border-[#D5C18D] bg-paper text-[#795907] hover:bg-[#FFF6DE]" onClick={() => decide("On hold")} /><DecisionAction label="Decline" icon={<XCircle size={15} />} className="border-[#E8BDB7] bg-paper text-bad hover:bg-[#FDF0ED]" onClick={() => decide("Not progressing")} /></div></div><div className="mt-5 flex gap-2 border-t border-[#E8D6A5] pt-4 text-xs leading-5 text-[#715F36]"><LockKeyhole size={14} className="mt-0.5 shrink-0" />Actions are mocked for this preview. The migration will persist the decision, reviewer, reason, and audit event.</div></div>
          </div>
        </article> : null}
      </section>

      <section className="grid gap-3 rounded-[18px] border border-line bg-mist p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div><p className="kicker">Screening guardrails</p><p className="mt-1 text-sm leading-6 text-ink"><strong>{desk.autoFiltered.toLocaleString()} CVs did not meet a non-bypassable JD rule.</strong> {desk.deferred.length} more cleared hard filters but are deferred outside today’s 35% review pool—not rejected.</p></div>
        <div className="flex flex-wrap gap-2">{desk.hardFilterBreakdown.map((reason) => <span key={reason.label} className="rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-muted">{reason.count} {reason.label}</span>)}<span className="rounded-full border border-[#BFDCC8] bg-[#EAF4EC] px-2.5 py-1 text-xs font-semibold text-good">24 passed all requirements</span></div>
      </section>
    </div>
  );
}
