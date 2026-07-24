// Presentation derivation: domain values → display labels + CSS-var colors.
// Keeps the mock/domain layer free of presentation (spec §4).

import type {
  Application,
  ApplicationSource,
  ApplicationStatus,
  BoardColumnId,
  DueTone,
  WorkMode
} from "./types";

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted"
};

export const STATUS_COLOR: Record<ApplicationStatus, string> = {
  saved: "var(--text-2)",
  applied: "var(--info)",
  screening: "var(--accent)",
  interview: "var(--risk-good)",
  offer: "var(--risk-good)",
  rejected: "var(--risk-bad)",
  ghosted: "var(--risk-warn)"
};

export const STATUS_BG: Record<ApplicationStatus, string> = {
  saved: "var(--surface-2)",
  applied: "var(--info-bg)",
  screening: "var(--accent-soft)",
  interview: "var(--risk-good-bg)",
  offer: "var(--risk-good-bg)",
  rejected: "var(--risk-bad-bg)",
  ghosted: "var(--risk-warn-bg)"
};

export const SOURCE_LABEL: Record<ApplicationSource, string> = {
  careeros: "CareerOS",
  linkedin: "LinkedIn",
  referral: "Referral",
  other: "Other"
};

export const MODE_LABEL: Record<WorkMode, string> = {
  hybrid: "Hybrid",
  remote: "Remote-first",
  onsite: "On-site"
};

export const DUE_COLOR: Record<DueTone, string> = {
  warn: "var(--risk-warn)",
  good: "var(--risk-good)",
  bad: "var(--risk-bad)",
  neutral: "var(--text-3)"
};

export function matchColor(match: number | null): string {
  if (match == null) return "var(--text-3)";
  if (match >= 85) return "var(--risk-good)";
  if (match >= 75) return "var(--accent)";
  return "var(--text-2)";
}

export function matchLabel(match: number | null): string {
  return match == null ? "—" : `${match}%`;
}

// Board columns in display order (spec §4: 6 columns, "closed" groups rejected+ghosted).
export const BOARD_COLUMNS: Array<{ id: BoardColumnId; label: string; dot: string }> = [
  { id: "saved", label: "Saved", dot: "var(--text-3)" },
  { id: "applied", label: "Applied", dot: "var(--info)" },
  { id: "screening", label: "Screening", dot: "var(--accent)" },
  { id: "interview", label: "Interview", dot: "var(--risk-good)" },
  { id: "offer", label: "Offer", dot: "var(--risk-good)" },
  { id: "closed", label: "Rejected / Ghosted", dot: "var(--risk-bad)" }
];

// Table sort: active stages first, then match desc.
const SORT_ORDER: ApplicationStatus[] = [
  "interview",
  "offer",
  "screening",
  "applied",
  "saved",
  "rejected",
  "ghosted"
];

export function sortedForTable(apps: Application[]): Application[] {
  return [...apps].sort(
    (a, b) =>
      SORT_ORDER.indexOf(a.status) - SORT_ORDER.indexOf(b.status) ||
      (b.match ?? 0) - (a.match ?? 0)
  );
}

export function isDimmed(status: ApplicationStatus): boolean {
  return status === "rejected" || status === "ghosted";
}
