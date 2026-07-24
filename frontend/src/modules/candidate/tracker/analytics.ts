// Client-derived tracker analytics (spec §4). Mirrors the reference renderVals math.
import type { Application, ApplicationStatus } from "./types";

const count = (apps: Application[], pred: (s: ApplicationStatus) => boolean) =>
  apps.filter((a) => pred(a.status)).length;

export function trackerStats(apps: Application[]) {
  const appliedN = count(apps, (s) => s !== "saved");
  const responded = count(apps, (s) => s === "screening" || s === "interview" || s === "offer");
  const responseRate = appliedN ? Math.round((responded / appliedN) * 100) : 0;
  const inProgress = count(apps, (s) => s === "applied" || s === "screening" || s === "interview");
  const offers = count(apps, (s) => s === "offer");
  return { appliedN, responded, responseRate, inProgress, offers };
}

export function funnelCounts(apps: Application[]) {
  const c = (s: ApplicationStatus) => count(apps, (x) => x === s);
  // `status` is the filter key when a row is clicked (spec: click a stage to filter).
  return [
    { label: "Saved", status: "saved" as ApplicationStatus, color: "var(--text-3)", count: c("saved"), indent: 0 },
    { label: "Applied", status: "applied" as ApplicationStatus, color: "var(--info)", count: count(apps, (s) => s !== "saved"), indent: 8 },
    { label: "Screening", status: "screening" as ApplicationStatus, color: "var(--accent)", count: c("screening"), indent: 16 },
    { label: "Interview", status: "interview" as ApplicationStatus, color: "var(--risk-good)", count: c("interview"), indent: 24 },
    { label: "Offer", status: "offer" as ApplicationStatus, color: "var(--risk-good)", count: c("offer"), indent: 32 }
  ];
}

export function companyCount(apps: Application[]) {
  return new Set(apps.map((a) => a.company)).size;
}
