"use client";

import type { EmployerModuleId } from "@careeros/shared";
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { employerModules, type SkillHeatmapPoint, type TalentMatch } from "../employer-data";

export function Collapsible({
  title,
  defaultOpen = false,
  children
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-[14px] border border-line bg-mist">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <span className="text-sm font-semibold text-ink">{title}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? <div className="border-t border-line px-3 pb-3 pt-3">{children}</div> : null}
    </section>
  );
}

export const statusTone = {
  New: "border-line bg-mist text-muted",
  Shortlisted: "border-transparent bg-[#EAF4EC] text-good",
  Rejected: "border-transparent bg-[#F7EFD9] text-warn"
} as const;

export const pressureTone = {
  Low: "bg-[#EAF4EC] text-good border-[#BFDCC8]",
  Medium: "bg-[#F7EFD9] text-warn border-[#E3D2A6]",
  High: "bg-[#F7E5E1] text-bad border-[#E8BDB7]"
} as const;

export function EmployerPageHeader({ moduleId }: { moduleId: EmployerModuleId }) {
  const active = employerModules.find((item) => item.id === moduleId) ?? employerModules[0];

  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="kicker">Employer workspace</p>
        <h2 className="mt-1 font-serif text-3xl font-semibold text-ink">Cempaka Digital</h2>
        <p className="mt-1 text-sm text-muted">{active.description}</p>
      </div>
    </div>
  );
}

export function CandidateDnaPanel({ candidate, ctaLabel }: { candidate: TalentMatch; ctaLabel: string }) {
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

      <div className="grid items-start gap-3 p-4 lg:grid-cols-2">
        <Collapsible title="Composite score" defaultOpen>
          <div className="grid gap-3">
            <ScoreBar label="Skills" value={candidate.skillFit} />
            <ScoreBar label="Experience" value={candidate.experienceFit} />
            <ScoreBar label="Education" value={candidate.educationFit} />
            <ScoreBar label="Interest signal" value={candidate.interestSignal} />
          </div>
        </Collapsible>

        <Collapsible title="Profile">
          <ItemList items={[candidate.education, ...candidate.experience]} />
        </Collapsible>
        <Collapsible title="Certifications">
          <ItemList items={candidate.certifications} />
        </Collapsible>
        <Collapsible title="Learning signals">
          <ItemList items={candidate.learningSignals} />
        </Collapsible>
        <Collapsible title="Career interests">
          <ItemList items={candidate.careerInterests} />
        </Collapsible>
        <Collapsible title="Portfolio evidence">
          <ItemList items={candidate.portfolio} />
        </Collapsible>
        <Collapsible title="Skills">
          <TagRow items={candidate.skills} tone="info" />
        </Collapsible>
        <Collapsible title="DNA signals">
          <TagRow items={candidate.dnaSignals} tone="good" />
        </Collapsible>
        <Collapsible title="Missing signals">
          <TagRow items={candidate.missingSignals} tone="warn" />
        </Collapsible>
        <Collapsible title="Mobility intent">
          <p className="text-sm leading-6 text-ink">{candidate.mobilityIntent}</p>
        </Collapsible>

        <button type="button" className="rounded-[12px] bg-ink px-4 py-3 text-sm font-semibold text-paper transition hover:bg-gold hover:text-[#1c1402] lg:col-span-2">
          {ctaLabel}
        </button>
      </div>
    </aside>
  );
}

export function HeaderCard({ label, title, detail }: { label: string; title: string; detail: string }) {
  return (
    <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
      <p className="kicker">{label}</p>
      <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-muted">{detail}</p>
    </section>
  );
}

export function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-mist p-3">
      <p className="kicker">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold leading-none text-ink">{value}</p>
      <p className="mt-2 text-sm leading-5 text-muted">{detail}</p>
    </div>
  );
}

export function InsightCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-[16px] border border-line bg-mist p-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-2 font-serif text-3xl font-semibold text-gold">{value}</p>
      <p className="mt-2 text-sm leading-5 text-muted">{detail}</p>
    </div>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
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

export function MicroBar({ label, value }: { label: string; value: number }) {
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

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[12px] border border-line bg-mist px-3 py-2">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

export function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-line bg-paper p-3">
      <p className="kicker">{label}</p>
      <p className="mt-2 font-serif text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-paper/15 bg-paper/10 p-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-paper/55">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#F3EAD3]">{value}</p>
    </div>
  );
}

export function RiskDial({ value }: { value: number }) {
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

export function ItemList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div key={item} className="rounded-[10px] border border-line bg-paper px-3 py-2 text-sm leading-6 text-muted">
          {item}
        </div>
      ))}
    </div>
  );
}

export function TagRow({ items, tone }: { items: string[]; tone: "good" | "warn" | "info" }) {
  const toneClass = {
    good: "bg-[#EAF4EC] text-good",
    warn: "bg-[#F7EFD9] text-warn",
    info: "bg-[#E8EFF7] text-info"
  }[tone];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function ProfileSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      <ItemList items={items} />
    </section>
  );
}

export function TagList({ title, items, tone }: { title: string; items: string[]; tone: "good" | "warn" | "info" }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      <TagRow items={items} tone={tone} />
    </div>
  );
}

export function salaryPressureValue(point: SkillHeatmapPoint) {
  return point.salaryPressure === "High" ? 92 : point.salaryPressure === "Medium" ? 68 : 38;
}

export function heatmapRecommendation(point: SkillHeatmapPoint) {
  if (point.salaryPressure === "High") {
    return "Increase offer band or widen sourcing immediately";
  }

  if (point.salaryPressure === "Medium") {
    return "Use adjacent-field candidates and upskilling";
  }

  return "Maintain current salary band and build bench";
}
