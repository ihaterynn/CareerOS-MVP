"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { Application, ApplicationStatus, TrackerData } from "../types";
import { companyCount } from "../analytics";
import { StatRow } from "./stat-row";
import { FunnelRail } from "./funnel-rail";
import { ApplicationsTable } from "./applications-table";
import { Board } from "./board";
import { DetailDrawer } from "./detail-drawer";
import { Toast } from "./toast";
import { STATUS_LABEL } from "../view";

// ponytail: local in-memory mock state (spec §3 mock-mutation contract) — a reload
// restores seed data. Real persistence arrives with the Supabase server actions.
export function TrackerPanel({ data }: { data: TrackerData }) {
  const router = useRouter();
  const [apps, setApps] = useState(data.applications);
  const [view, setView] = useState<"table" | "board">("table");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApplicationStatus | null>(null);

  const selected = useMemo(() => apps.find((a) => a.id === selectedId) ?? null, [apps, selectedId]);

  const visible: Application[] = useMemo(
    () => (filter ? apps.filter((a) => a.status === filter) : apps),
    [apps, filter]
  );

  const toggleFilter = useCallback(
    (status: ApplicationStatus) => setFilter((cur) => (cur === status ? null : status)),
    []
  );

  const move = useCallback((id: string, to: ApplicationStatus) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: to } : a)));
  }, []);

  const openStudio = useCallback(
    (id: string) => router.push(`/candidate/studio?applicationId=${id}`),
    [router]
  );

  return (
    <div className="anim-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div className="kicker" style={{ color: "var(--accent)" }}>Application Tracker</div>
          <h1 className="ser" style={{ fontSize: 29, margin: "6px 0 0" }}>Every role, every company</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-2)" }}>
            {apps.length} applications across {companyCount(apps)} companies · 3 active this week
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "inline-flex", padding: 4, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
            {(["table", "board"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "7px 14px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: 7,
                  textTransform: "capitalize",
                  background: view === v ? "var(--surface)" : "transparent",
                  color: view === v ? "var(--text)" : "var(--text-2)",
                  boxShadow: view === v ? "var(--shadow-sm)" : "none"
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => setToast("Add application — manual entry or paste a JD URL to prefill")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 15px", fontSize: 13, fontWeight: 600, color: "var(--accent-contrast)", background: "var(--accent)", border: "none", borderRadius: "var(--r-sm)", boxShadow: "0 6px 18px var(--accent-glow)" }}
          >
            + Add application
          </button>
        </div>
      </div>

      <StatRow apps={apps} analytics={data.analytics} />

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "260px minmax(0,1fr)", gap: 20, alignItems: "start" }}>
        <FunnelRail apps={apps} activeStatus={filter} onToggle={toggleFilter} />
        <div style={{ minWidth: 0 }}>
          {/* key on view+filter → smooth re-fade when the filter changes */}
          <div key={`${view}-${filter ?? "all"}`} className="anim-fade-up">
            {view === "table" ? (
              visible.length ? (
                <ApplicationsTable apps={visible} onOpen={setSelectedId} />
              ) : (
                <EmptyFilter status={filter} onClear={() => setFilter(null)} />
              )
            ) : (
              <Board apps={visible} onOpen={setSelectedId} onMove={move} />
            )}
          </div>
        </div>
      </div>

      <DetailDrawer app={selected} onClose={() => setSelectedId(null)} onTailor={openStudio} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function EmptyFilter({ status, onClear }: { status: ApplicationStatus | null; onClear: () => void }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "48px 20px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
      <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>
        No applications in <strong>{status ? STATUS_LABEL[status] : ""}</strong>.
      </p>
      <button onClick={onClear} style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
        Clear filter
      </button>
    </div>
  );
}
