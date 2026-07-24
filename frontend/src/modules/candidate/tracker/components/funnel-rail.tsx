"use client";

import type { Application, ApplicationStatus } from "../types";
import { funnelCounts, trackerStats } from "../analytics";

export function FunnelRail({
  apps,
  activeStatus,
  onToggle
}: {
  apps: Application[];
  activeStatus: ApplicationStatus | null;
  onToggle: (status: ApplicationStatus) => void;
}) {
  const funnel = funnelCounts(apps);
  const { responseRate } = trackerStats(apps);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "20px 18px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="kicker" style={{ color: "var(--accent)" }}>Pipeline funnel</div>
        {activeStatus ? (
          <button
            onClick={() => onToggle(activeStatus)}
            style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", background: "none", border: "none", padding: 0, fontFamily: "var(--font-mono)" }}
          >
            CLEAR ✕
          </button>
        ) : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
        {funnel.map((f) => {
          const on = activeStatus === f.status;
          const dimmed = activeStatus !== null && !on;
          return (
            <div key={f.label} style={{ paddingLeft: f.indent }}>
              <button
                onClick={() => onToggle(f.status)}
                aria-pressed={on}
                style={{
                  width: "100%",
                  height: 34,
                  background: on ? "var(--accent-soft)" : "var(--surface-2)",
                  borderTop: `1px solid ${on ? "var(--accent-line)" : "var(--border)"}`,
                  borderRight: `1px solid ${on ? "var(--accent-line)" : "var(--border)"}`,
                  borderBottom: `1px solid ${on ? "var(--accent-line)" : "var(--border)"}`,
                  borderLeft: `3px solid ${f.color}`,
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 11px",
                  cursor: "pointer",
                  opacity: dimmed ? 0.55 : 1,
                  boxShadow: on ? "0 0 0 3px var(--accent-soft)" : "none",
                  transform: on ? "translateX(2px)" : "none",
                  transition: "background .2s var(--ease), opacity .2s var(--ease), transform .2s var(--ease-spring), box-shadow .2s var(--ease), border-color .2s var(--ease)"
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: on ? "var(--accent)" : "var(--text)" }}>{f.label}</span>
                <span className="ser" style={{ fontSize: 15, color: f.color }}>{f.count}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "18px 0" }} />
      <div className="kicker" style={{ fontSize: 9.5 }}>Response rate</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
        <span className="ser" style={{ fontSize: 32 }}>{responseRate}<span style={{ fontSize: 16 }}>%</span></span>
        <span style={{ fontSize: 11, color: "var(--risk-good)", fontWeight: 700 }}>▲ 8%</span>
      </div>
      <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5, margin: "6px 0 0" }}>Above the 41% Klang Valley tech median.</p>

      <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />
      <div className="kicker" style={{ fontSize: 9.5, marginBottom: 10 }}>Reminders</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ background: "var(--risk-warn-bg)", borderRadius: 8, padding: "9px 11px" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--risk-warn)" }}>Follow up · RinggitPay</div>
          <div style={{ fontSize: 10.5, color: "var(--text-2)", marginTop: 2 }}>Recruiter quiet · due 2 days</div>
        </div>
        <div style={{ background: "var(--risk-good-bg)", borderRadius: 8, padding: "9px 11px" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--risk-good)" }}>Prep · Cempaka panel</div>
          <div style={{ fontSize: 10.5, color: "var(--text-2)", marginTop: 2 }}>Tomorrow 2:00 PM</div>
        </div>
      </div>
    </div>
  );
}
