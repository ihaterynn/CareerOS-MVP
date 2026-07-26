"use client";

import type { Application, TrackerAnalytics } from "../types";
import { trackerStats } from "../analytics";

export function StatRow({ apps, analytics }: { apps: Application[]; analytics: TrackerAnalytics }) {
  const s = trackerStats(apps);
  const cards = [
    { label: "Response rate", value: `${s.responseRate}%`, delta: "▲8%", deltaColor: "var(--risk-good)", color: "var(--text)", sub: `${s.appliedN} applied · ${s.responded} replies` },
    { label: "In progress", value: String(s.inProgress), delta: "", deltaColor: "var(--risk-good)", color: "var(--text)", sub: "Applied → Interview" },
    { label: "Avg time in stage", value: analytics.avgDaysInStage == null ? "—" : String(analytics.avgDaysInStage), delta: analytics.avgDaysInStage == null ? "" : "d", deltaColor: "var(--text-3)", color: "var(--text)", sub: analytics.slowestStage ? `${analytics.slowestStage} is slowest` : "Stage timing unavailable" },
    { label: "Offers", value: String(s.offers), delta: "", deltaColor: "var(--risk-good)", color: "var(--risk-good)", sub: "Setel · decide by Aug 2" }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr) 1.3fr", gap: 14, marginTop: 22 }}>
      {cards.map((c) => (
        <div key={c.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "15px 17px", boxShadow: "var(--shadow-sm)" }}>
          <div className="kicker" style={{ fontSize: 9.5 }}>{c.label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 7 }}>
            <span className="ser" style={{ fontSize: 28, color: c.color }}>{c.value}</span>
            <span style={{ fontSize: 11, color: c.deltaColor, fontWeight: 700 }}>{c.delta}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 9 }}>{c.sub}</div>
        </div>
      ))}
      <div style={{ background: "linear-gradient(135deg,#14223D,#20304f)", border: "1px solid var(--border)", borderRadius: 12, padding: "15px 17px", color: "#F4F7FB" }}>
        <div className="kicker" style={{ fontSize: 9.5, color: "var(--accent-2)" }}>Next up</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>Interview · Cempaka Digital</div>
        <div style={{ fontSize: 11.5, color: "#c9d3e6", marginTop: 4 }}>Tomorrow, 2:00 PM · Panel round</div>
      </div>
    </div>
  );
}
