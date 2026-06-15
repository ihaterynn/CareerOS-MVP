"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

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
    <section className="rounded-[12px] border border-line bg-mist">
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

export function ModuleCard({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[14px] border border-line bg-paper p-4 shadow-soft ${className}`}>
      {children}
    </section>
  );
}

export function KpiCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[10px] border border-line bg-mist p-3">
      <p className="kicker">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold leading-none text-ink">{value}</p>
      <p className="mt-2 text-sm leading-5 text-muted">{detail}</p>
    </div>
  );
}

export function Tag({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "gold" | "good" | "warn" | "info";
}) {
  const tones = {
    neutral: "border-line bg-mist text-muted",
    gold: "border-[#E3D2A6] bg-[#F3EAD3] text-gold",
    good: "border-transparent bg-[#EAF4EC] text-good",
    warn: "border-transparent bg-[#F7EFD9] text-warn",
    info: "border-transparent bg-[#E8EFF7] text-info"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function ScoreBar({
  value,
  tone = "gold",
  label
}: {
  value: number;
  tone?: "gold" | "good" | "warn" | "bad" | "info";
  label?: string;
}) {
  const colors = {
    gold: "bg-gold",
    good: "bg-good",
    warn: "bg-warn",
    bad: "bg-bad",
    info: "bg-info"
  };

  return (
    <div>
      {label ? (
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-[#F1EDE3]">
        <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
