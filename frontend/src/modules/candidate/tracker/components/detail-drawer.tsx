"use client";

import type { Application } from "../types";
import {
  DUE_COLOR,
  MODE_LABEL,
  STATUS_BG,
  STATUS_COLOR,
  STATUS_LABEL,
  matchLabel
} from "../view";
import { useDialogA11y } from "./use-dialog-a11y";

export function DetailDrawer({
  app,
  onClose,
  onTailor
}: {
  app: Application | null;
  onClose: () => void;
  onTailor: (id: string) => void;
}) {
  const ref = useDialogA11y(!!app, onClose);
  if (!app) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(10,12,22,.4)",
        backdropFilter: "blur(3px)"
      }}
    >
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-role"
        onClick={(e) => e.stopPropagation()}
        className="anim-slide"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          width: 380,
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          padding: 24,
          overflowY: "auto"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--accent)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 15,
              fontWeight: 800
            }}
          >
            {app.short}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              width: 30,
              height: 30,
              color: "var(--text-2)"
            }}
          >
            ✕
          </button>
        </div>

        <h3 id="drawer-role" className="ser" style={{ fontSize: 20, margin: "13px 0 2px", lineHeight: 1.15 }}>
          {app.role}
        </h3>
        <div style={{ fontSize: 12.5, color: "var(--text-2)" }}>
          {app.company} · {app.location} · {MODE_LABEL[app.mode]}
        </div>

        <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
          <span style={pill(STATUS_BG[app.status], STATUS_COLOR[app.status])}>{STATUS_LABEL[app.status]}</span>
          <span style={pill("var(--accent-soft)", "var(--accent)")}>{matchLabel(app.match)} match</span>
          <span style={pill("var(--surface-2)", "var(--text-2)")}>{app.salary}</span>
        </div>

        <div className="kicker" style={{ fontSize: 9, margin: "20px 0 12px" }}>
          Status timeline
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {app.timeline.map((ev, i) => (
            <div key={i} style={{ display: "flex", gap: 11, paddingBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: STATUS_COLOR[ev.status],
                    border: "2px solid var(--surface)",
                    flexShrink: 0
                  }}
                />
                {i < app.timeline.length - 1 ? (
                  <span style={{ width: 2, flex: 1, background: "var(--border-2)" }} />
                ) : null}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{ev.title}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>{ev.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 13, background: "var(--surface-2)", borderRadius: 10, marginTop: 4 }}>
          <div className="kicker" style={{ fontSize: 9 }}>
            Next action
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 5 }}>{app.nextAction}</div>
          <div style={{ fontSize: 10.5, color: DUE_COLOR[app.dueTone], fontWeight: 600, marginTop: 3 }}>
            {app.due}
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <button
            onClick={() => onTailor(app.id)}
            style={{
              flex: 1,
              padding: 10,
              fontSize: 12,
              fontWeight: 700,
              background: "var(--accent)",
              color: "var(--accent-contrast)",
              border: "none",
              borderRadius: 8
            }}
          >
            Tailor résumé →
          </button>
          <button
            style={{
              padding: "10px 13px",
              fontSize: 12,
              fontWeight: 600,
              background: "var(--surface-2)",
              border: "1px solid var(--border-2)",
              borderRadius: 8
            }}
          >
            Notes
          </button>
        </div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <div className="kicker" style={{ fontSize: 9, marginBottom: 8 }}>
            Contact
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--surface-3)",
                display: "grid",
                placeItems: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-2)"
              }}
            >
              {app.contact.initials}
            </span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{app.contact.name}</div>
              <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>{app.contact.role}</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function pill(bg: string, color: string): React.CSSProperties {
  return {
    padding: "4px 9px",
    fontSize: 10.5,
    fontWeight: 600,
    background: bg,
    color,
    borderRadius: 99
  };
}
