"use client";

import { useRef } from "react";
import type { Application, ApplicationStatus, BoardColumnId } from "../types";
import { boardColumnOf } from "../types";
import { BOARD_COLUMNS, SOURCE_LABEL, matchLabel } from "../view";

// Dropping into a column sets the matching status; "closed" resolves to rejected
// (ghosted is inbound-only, never set by drag — spec §4).
function statusForColumn(col: BoardColumnId): ApplicationStatus {
  return col === "closed" ? "rejected" : col;
}

export function Board({
  apps,
  onOpen,
  onMove
}: {
  apps: Application[];
  onOpen: (id: string) => void;
  onMove: (id: string, to: ApplicationStatus) => void;
}) {
  const dragId = useRef<string | null>(null);

  return (
    <div className="anim-fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(150px,1fr))", gap: 11, overflowX: "auto", paddingBottom: 6 }}>
      {BOARD_COLUMNS.map((col) => {
        const list = apps.filter((a) => boardColumnOf(a.status) === col.id);
        return (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = dragId.current;
              if (id) onMove(id, statusForColumn(col.id));
              dragId.current = null;
            }}
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "11px 9px", minHeight: 120 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "2px 4px 11px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.dot }} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>{col.label}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>{list.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {list.map((a) => (
                <div
                  key={a.id}
                  draggable
                  onDragStart={() => { dragId.current = a.id; }}
                  onDragEnd={() => { dragId.current = null; }}
                  onClick={() => onOpen(a.id)}
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 11, padding: 11, cursor: "grab", boxShadow: "var(--shadow-sm)" }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{a.short}</span>
                    <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{a.role}</div>
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--text-2)", marginTop: 6 }}>{a.company}</div>
                  <div style={{ fontSize: 9.5, color: "var(--text-3)", marginTop: 7, fontFamily: "var(--font-mono)" }}>
                    {SOURCE_LABEL[a.source].toUpperCase()}{a.match == null ? "" : ` · ${matchLabel(a.match)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
