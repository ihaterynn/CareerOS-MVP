"use client";

import type { Application } from "../types";
import { STATUS_COLOR, STATUS_LABEL, SOURCE_LABEL, isDimmed, matchColor, matchLabel, sortedForTable } from "../view";

const COLS = "1.9fr 1fr .9fr .7fr";

export function ApplicationsTable({ apps, onOpen }: { apps: Application[]; onOpen: (id: string) => void }) {
  const rows = sortedForTable(apps);

  return (
    <div className="anim-fade-up" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "18px 20px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 className="ser" style={{ fontSize: 19, margin: 0 }}>All applications</h2>
        <span style={{ fontSize: 11.5, color: "var(--text-2)" }}>Click a row to open · drag on Board</span>
      </div>
      <div className="kicker" style={{ display: "grid", gridTemplateColumns: COLS, gap: 10, padding: "0 10px 9px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 9.5 }}>Role · Company</span>
        <span style={{ fontSize: 9.5 }}>Stage</span>
        <span style={{ fontSize: 9.5 }}>Source</span>
        <span style={{ fontSize: 9.5 }}>Match</span>
      </div>
      {rows.map((a) => (
        <button
          key={a.id}
          onClick={() => onOpen(a.id)}
          style={{
            display: "grid",
            gridTemplateColumns: COLS,
            gap: 10,
            padding: "12px 10px",
            alignItems: "center",
            borderTop: "none",
            borderRight: "none",
            borderLeft: "none",
            borderBottom: "1px solid var(--border)",
            cursor: "pointer",
            borderRadius: 8,
            opacity: isDimmed(a.status) ? 0.6 : 1,
            width: "100%",
            background: "transparent",
            textAlign: "left"
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 800, flexShrink: 0 }}>{a.short}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{a.role}</div>
              <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>{a.company}</div>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[a.status] }}>{STATUS_LABEL[a.status]}</span>
          <span style={{ fontSize: 11.5, color: "var(--text-2)" }}>{SOURCE_LABEL[a.source]}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: matchColor(a.match) }}>{matchLabel(a.match)}</span>
        </button>
      ))}
    </div>
  );
}
