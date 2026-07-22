"use client";

import { CheckCircle2, CircleX, FileText, Play, RotateCcw, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmployerPageHeader } from "./employer-ui";
import {
  aggregateGoldCandidates,
  buildIngestionResult,
  type AggregationMode,
  type ExtractedCv,
  type QualifiedCv
} from "../ingestion-data";

const pipeline = buildIngestionResult();
type RunState = "ready" | "bronze" | "silver" | "gold" | "complete";

const stages = [
  { id: "bronze", label: "Bronze", title: "Submitted", detail: "Raw extracted records", tone: "border-[#C88852] bg-[#FDF2E8] text-[#8A4D1E]" },
  { id: "silver", label: "Silver", title: "Validated", detail: "Clean, complete profiles", tone: "border-[#9CA9B6] bg-[#EFF3F6] text-[#465767]" },
  { id: "gold", label: "Gold", title: "Qualified", detail: "Role-matched candidates", tone: "border-[#D6AC4D] bg-[#FFF7DE] text-[#825D0D]" }
] as const;

function stateIncludes(state: RunState, stage: "bronze" | "silver" | "gold") {
  return (state === "bronze" && stage === "bronze") ||
    (state === "silver" && (stage === "bronze" || stage === "silver")) ||
    (state === "gold" && true) ||
    state === "complete";
}

function RecordPills({ records, tone }: { records: ExtractedCv[]; tone: "bronze" | "silver" | "gold" }) {
  const color = tone === "gold" ? "bg-[#E8C878] text-[#3D2C03]" : tone === "silver" ? "bg-[#DDE5EC] text-[#33495A]" : "bg-[#F2D3B8] text-[#703A14]";

  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {records.slice(0, 5).map((record) => (
        <span key={record.id} className={`rounded-full px-2 py-1 text-[10px] font-bold ${color}`}>
          {record.name.split(" ")[0]}
        </span>
      ))}
      {records.length > 5 ? <span className="rounded-full border border-current/15 px-2 py-1 text-[10px] font-bold">+{records.length - 5}</span> : null}
    </div>
  );
}

function StageCard({
  stage,
  count,
  records,
  running,
  complete
}: {
  stage: (typeof stages)[number];
  count: number;
  records: ExtractedCv[];
  running: boolean;
  complete: boolean;
}) {
  const visible = running || complete;
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    if (!visible) {
      frame = requestAnimationFrame(() => setDisplayCount(0));
      return () => cancelAnimationFrame(frame);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = requestAnimationFrame(() => setDisplayCount(count));
      return () => cancelAnimationFrame(frame);
    }

    const startedAt = performance.now();
    const duration = 360;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      setDisplayCount(Math.round(count * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count, visible]);

  return (
    <section className={`relative min-h-56 overflow-hidden rounded-[20px] border p-4 shadow-soft transition-all duration-500 ${stage.tone} ${running ? "-translate-y-1 ring-4 ring-gold/15" : ""}`}>
      <div className="absolute right-3 top-3 font-mono text-[10px] font-bold tracking-[0.16em] opacity-50">{stage.label.toUpperCase()}</div>
      <p className="kicker !text-current opacity-65">{stage.detail}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <h3 className="font-serif text-2xl font-semibold">{stage.title}</h3>
        <p className="font-serif text-5xl font-semibold leading-none">{visible ? displayCount : "—"}</p>
      </div>
      <p className="mt-2 text-sm font-medium opacity-75">{visible ? `${displayCount} records in this layer` : "Waiting for run"}</p>
      {visible ? <RecordPills records={records} tone={stage.id} /> : <div className="mt-4 h-8 rounded-full border border-current/10 bg-paper/35" />}
      {running ? <div className="absolute bottom-0 left-0 h-1 w-full animate-pulse-soft bg-current/50" /> : null}
    </section>
  );
}

function CandidateRow({ candidate, selected, onSelect }: { candidate: QualifiedCv; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl border px-3 py-2.5 text-left transition ${selected ? "border-gold bg-[#FFF8E8]" : "border-line bg-paper hover:border-gold"}`}
    >
      <span>
        <span className="block text-sm font-bold text-ink">{candidate.name}</span>
        <span className="mt-0.5 block text-xs text-muted">{candidate.role} · {candidate.location}</span>
      </span>
      <span className="self-center rounded-full bg-[#EAF4EC] px-2 py-1 text-xs font-bold text-good">{candidate.score}%</span>
    </button>
  );
}

export function CvIngestionPanel() {
  const [runState, setRunState] = useState<RunState>("ready");
  const [selectedId, setSelectedId] = useState(pipeline.bronze[0]?.id ?? "");
  const [groupBy, setGroupBy] = useState<AggregationMode>("skillCluster");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const selected = pipeline.bronze.find((candidate) => candidate.id === selectedId) ?? pipeline.bronze[0];
  const complete = runState === "complete";
  const goldVisible = runState === "gold" || complete;
  const aggregate = useMemo(() => aggregateGoldCandidates(pipeline.gold, groupBy), [groupBy]);
  const bronzeChoices = selected && !pipeline.bronze.slice(0, 8).some((candidate) => candidate.id === selected.id)
    ? [...pipeline.bronze.slice(0, 7), selected]
    : pipeline.bronze.slice(0, 8);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function runIngestion() {
    timers.current.forEach(clearTimeout);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRunState("complete");
      return;
    }
    setRunState("bronze");
    timers.current = [
      setTimeout(() => setRunState("silver"), 750),
      setTimeout(() => setRunState("gold"), 1500),
      setTimeout(() => setRunState("complete"), 2250)
    ];
  }

  return (
    <div>
      <EmployerPageHeader moduleId="ingestion" />
      <div className="grid gap-4">
        <section className="relative overflow-hidden rounded-[22px] border border-[#253858] bg-[linear-gradient(120deg,#101c33,#1e3151_62%,#70551d_160%)] p-5 text-paper shadow-lifted">
          <div className="absolute -right-12 -top-16 size-64 rounded-full border border-[#E8C878]/25 bg-[#E8C878]/10" />
          <div className="absolute right-10 top-12 size-36 rounded-full border border-paper/10" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="kicker text-[#E8C878]">Medallion architecture · hiring ops</p>
              <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Turn submissions into a trusted talent pool.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-paper/70">A fixed batch of extracted CV records moves through validation and role matching—then becomes an explainable shortlist your hiring team can use.</p>
            </div>
            <button
              type="button"
              onClick={runIngestion}
              disabled={runState !== "ready" && !complete}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#E8C878] px-5 py-3 text-sm font-bold text-[#1c1402] transition hover:bg-paper disabled:cursor-wait disabled:opacity-70"
            >
              {complete ? <RotateCcw size={16} aria-hidden="true" /> : <Play size={16} fill="currentColor" aria-hidden="true" />}
              {complete ? "Run again" : runState === "ready" ? "Run ingestion" : "Ingestion running"}
            </button>
          </div>
          <div className="relative mt-5 flex flex-wrap gap-2 text-xs font-semibold text-paper/80">
            {["24 submitted", "3 open roles", "deterministic demo data"].map((item) => <span key={item} className="rounded-full border border-paper/15 bg-paper/10 px-3 py-1.5">{item}</span>)}
          </div>
        </section>

        <p aria-live="polite" className="sr-only">{runState === "ready" ? "Pipeline ready" : complete ? "Ingestion complete: 11 qualified candidates" : `Processing ${runState} layer`}</p>

        <section className="grid gap-3 xl:grid-cols-[1fr_auto_1fr_auto_1fr] xl:items-center">
          {stages.map((stage, index) => {
            const count = stage.id === "bronze" ? pipeline.bronze.length : stage.id === "silver" ? pipeline.silver.length : pipeline.gold.length;
            const records = stage.id === "bronze" ? pipeline.bronze : stage.id === "silver" ? pipeline.silver : pipeline.gold;
            const active = stateIncludes(runState, stage.id);
            return (
              <div key={stage.id} className="contents">
                <StageCard stage={stage} count={count} records={records} running={runState === stage.id} complete={active && runState !== stage.id} />
                {index < stages.length - 1 ? <div className="hidden place-items-center text-gold xl:grid"><Workflow size={25} aria-hidden="true" /></div> : null}
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="kicker">Bronze record inspection</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">Submission evidence</h2>
              </div>
              <FileText size={22} className="text-gold" aria-hidden="true" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {bronzeChoices.map((candidate) => (
                <button key={candidate.id} type="button" onClick={() => setSelectedId(candidate.id)} className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${selected.id === candidate.id ? "border-gold bg-[#FFF8E8] text-ink" : "border-line bg-mist text-muted hover:border-gold"}`}>
                  {candidate.name}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-[14px] border border-line bg-mist p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-paper">{selected.name.split(" ").map((name) => name[0]).join("").slice(0, 2)}</span>
                <div>
                  <p className="text-base font-bold text-ink">{selected.name}</p>
                  <p className="mt-0.5 text-sm text-muted">{selected.role} · {selected.location}</p>
                  <p className="mt-2 text-xs font-semibold text-muted">{selected.source}</p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl border border-line bg-paper p-3"><dt className="kicker">Experience</dt><dd className="mt-1 font-bold text-ink">{selected.years} years</dd></div>
                <div className="rounded-xl border border-line bg-paper p-3"><dt className="kicker">Parse confidence</dt><dd className="mt-1 font-bold text-ink">{selected.confidence}%</dd></div>
              </dl>
              <div className="mt-3"><p className="kicker">Extracted strengths</p><div className="mt-2 flex flex-wrap gap-1.5">{selected.skills.map((skill) => <span key={skill} className="rounded-full bg-[#E8EFF7] px-2.5 py-1 text-xs font-semibold text-info">{skill}</span>)}</div></div>
            </div>
            <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${selected.status ? "bg-[#F8E8E5] text-bad" : "bg-[#EAF4EC] text-good"}`}>
              {selected.status ? <CircleX size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
              {selected.status ? `Silver rejection: ${selected.status}` : "Silver validation: ready for matching"}
            </div>
          </div>

          <div className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="kicker">Gold aggregation</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">Trusted candidates, organised</h2>
              </div>
              <div className="flex rounded-full border border-line bg-mist p-1">
                {(["skillCluster", "experienceBand", "location", "gap"] as const).map((mode) => (
                  <button key={mode} type="button" onClick={() => setGroupBy(mode)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${groupBy === mode ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}>
                    {mode === "skillCluster" ? "Skills" : mode === "experienceBand" ? "Experience" : mode === "gap" ? "Gaps" : "Location"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {aggregate.map((item) => (
                <div key={item.label} className="rounded-[14px] border border-[#E3D2A6] bg-[#FFF8E8] p-3">
                  <p className="kicker text-[#8A6516]">{groupBy === "skillCluster" ? "Capability" : groupBy === "experienceBand" ? "Experience" : groupBy === "gap" ? "Evidence gap" : "Location"}</p>
                  <p className="mt-2 text-sm font-bold text-ink">{item.label}</p>
                  <p className="mt-3 font-serif text-3xl font-semibold text-gold">{goldVisible ? item.count : "—"}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-sm font-semibold text-ink"><ShieldCheck size={18} className="text-good" aria-hidden="true" /> 11 people cleared validation and role-fit thresholds.</div>
            <div className="mt-3 grid gap-2">
              {pipeline.gold.slice(0, 5).map((candidate) => <CandidateRow key={candidate.id} candidate={candidate} selected={selected.id === candidate.id} onSelect={() => setSelectedId(candidate.id)} />)}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-[14px] bg-[#E8EFF7] px-3 py-2.5 text-sm text-info"><Sparkles size={16} aria-hidden="true" /> Gold holds only candidates with enough evidence to review.</div>
          </div>
        </section>
      </div>
    </div>
  );
}
