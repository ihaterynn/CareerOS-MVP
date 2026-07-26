"use client";

import { ProgressRing } from "@/components/ui";
import { MIN_VIABLE_COVERAGE, formatValue } from "../engine";
import type { Coverage, DimensionId, Fact } from "../types";

const DIMENSION_ORDER: DimensionId[] = ["identity", "experience", "skills", "preferences", "dna"];

/**
 * The live profile. This is the payoff of the whole flow (spec §1.4) — the candidate watches
 * their profile assemble instead of filling a form and hoping.
 */
export function ProfileRail({
  coverage,
  facts,
  name,
  role,
  canHandOff,
  onHandOff
}: {
  coverage: Coverage;
  facts: Fact[];
  name: string | null;
  role: string | null;
  canHandOff: boolean;
  onHandOff: () => void;
}) {
  const percent = Math.round(coverage.total * 100);
  const provisional = facts.filter((f) => f.source === "parsed" || f.source === "inferred").length;

  return (
    <aside
      aria-label="Profile being built"
      style={{
        position: "sticky",
        top: 24,
        display: "flex",
        flexDirection: "column",
        gap: 14
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          boxShadow: "var(--shadow-sm)",
          padding: 18
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ProgressRing value={percent} size={58} stroke={6} label={`${percent}%`} />
          <div style={{ minWidth: 0 }}>
            <div className="kicker" style={{ fontSize: 9 }}>
              Signal captured
            </div>
            <div className="ser" style={{ fontSize: 17, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {name ?? "Your profile"}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2 }}>
              {role ?? "Waiting on your résumé"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 16 }}>
          {DIMENSION_ORDER.map((id) => {
            const dimension = coverage.dimensions.find((d) => d.id === id);
            if (!dimension) return null;
            const pct = Math.round(dimension.completion * 100);
            const state = pct >= 100 ? "done" : pct > 0 ? "partial" : "empty";
            const color =
              state === "done" ? "var(--risk-good)" : state === "partial" ? "var(--accent)" : "var(--text-3)";
            return (
              <div key={id}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
                  <span style={{ color, fontWeight: 700, width: 12 }}>
                    {state === "done" ? "✓" : state === "partial" ? "◐" : "○"}
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{dimension.label}</span>
                  <span style={{ marginLeft: "auto", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ height: 4, background: "var(--surface-3)", borderRadius: 99, marginTop: 5, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: color,
                      borderRadius: 99,
                      transition: "width .6s var(--ease)"
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {facts.length ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r)",
            boxShadow: "var(--shadow-sm)",
            padding: 16
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
            <div className="kicker" style={{ fontSize: 9 }}>
              What I know
            </div>
            {provisional ? (
              <span style={{ fontSize: 10, color: "var(--text-3)" }}>{provisional} unconfirmed</span>
            ) : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {facts.map((fact) => (
              <FactRow key={fact.id} fact={fact} />
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onHandOff}
        disabled={!canHandOff}
        title={canHandOff ? undefined : "A bit more signal first — then you can finish later"}
        style={{
          padding: "11px 14px",
          fontSize: 12.5,
          fontWeight: 700,
          background: canHandOff ? "var(--accent)" : "var(--surface-2)",
          color: canHandOff ? "var(--accent-contrast)" : "var(--text-3)",
          border: `1px solid ${canHandOff ? "var(--accent)" : "var(--border-2)"}`,
          borderRadius: "var(--r-sm)",
          cursor: canHandOff ? "pointer" : "default",
          boxShadow: canHandOff ? "0 6px 18px var(--accent-glow)" : "none"
        }}
      >
        {canHandOff ? "Enter CareerOS →" : `Enter CareerOS at ${Math.round(MIN_VIABLE_COVERAGE * 100)}%`}
      </button>
    </aside>
  );
}

function FactRow({ fact }: { fact: Fact }) {
  const provisional = fact.source === "parsed" || fact.source === "inferred";
  const display = formatValue(fact.value, fact.unit);

  return (
    <div
      className="anim-fade-up"
      style={{
        padding: "8px 10px",
        borderRadius: 9,
        background: "var(--surface-2)",
        border: provisional ? "1px dashed var(--border-2)" : "1px solid var(--border)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span className="kicker" style={{ fontSize: 8.5 }}>
          {fact.label}
        </span>
        {provisional ? (
          <span
            title={
              fact.evidence
                ? `Read from your résumé: “${fact.evidence}”`
                : "Inferred — I didn't read this directly, so please confirm it"
            }
            style={{
              marginLeft: "auto",
              fontSize: 8.5,
              fontWeight: 700,
              letterSpacing: ".05em",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
              color: fact.evidence ? "var(--text-3)" : "var(--risk-warn)"
            }}
          >
            {fact.evidence ? "parsed" : "inferred"}
          </span>
        ) : null}
      </div>
      <div style={{ fontSize: 12, color: "var(--text)", marginTop: 3, lineHeight: 1.45 }}>{display}</div>
    </div>
  );
}
