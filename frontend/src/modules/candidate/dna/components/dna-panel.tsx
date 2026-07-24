"use client";

import { useState } from "react";
import type { DnaData, InstrumentId } from "../types";
import { DONE_BLURB, DONE_RESULT, LIKERT, LIVE_BARS, QUESTION_POOL } from "../mock";
import { Toast } from "../../tracker/components/toast";

const VIS = [
  { label: "🔒 Private", value: "private" as const },
  { label: "👔 Employers (with consent)", value: "employer" as const },
  { label: "🌐 Public link", value: "public" as const }
];

export function DnaPanel({ data }: { data: DnaData }) {
  const [tab, setTab] = useState<"profile" | "assessments">("profile");
  const [summary, setSummary] = useState(data.profile.summary);
  const [vis, setVis] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  // Assessment flow (DISPLAY-ONLY — spec §5). progress per instrument.
  const [progress, setProgress] = useState<Record<InstrumentId, number>>({ mbti: 36, disc: 28, enneagram: 0 });
  const [active, setActive] = useState<InstrumentId | null>(null);

  return (
    <div className="anim-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="kicker" style={{ color: "var(--accent)" }}>Candidate DNA</div>
          <h1 className="ser" style={{ fontSize: 29, margin: "6px 0 0" }}>Your profile, decoded</h1>
        </div>
        <div style={{ display: "inline-flex", padding: 4, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
          {(["profile", "assessments"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                borderRadius: 7,
                textTransform: "capitalize",
                background: tab === t ? "var(--surface)" : "transparent",
                color: tab === t ? "var(--text)" : "var(--text-2)",
                boxShadow: tab === t ? "var(--shadow-sm)" : "none"
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "profile" ? (
        <ProfileTab
          data={data}
          summary={summary}
          onSummary={setSummary}
          vis={vis}
          onCycleVis={() => {
            const n = (vis + 1) % 3;
            setVis(n);
            setToast(`Sharing set to ${VIS[n].label} — explicit, revocable`);
          }}
          visLabel={VIS[vis].label}
        />
      ) : (
        <AssessmentsTab data={data} progress={progress} setProgress={setProgress} active={active} setActive={setActive} onGotoProfile={() => setTab("profile")} />
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

/* ---------------- Profile tab ---------------- */
function ProfileTab({
  data,
  summary,
  onSummary,
  onCycleVis,
  visLabel
}: {
  data: DnaData;
  summary: string;
  onSummary: (s: string) => void;
  vis: number;
  onCycleVis: () => void;
  visLabel: string;
}) {
  const p = data.profile;
  const badges = [
    { k: "MBTI", v: p.instruments.mbti, sub: "The Architect", c: "var(--accent)" },
    { k: "DISC", v: p.instruments.disc, sub: "Analyst", c: "var(--info)" },
    { k: "Enneagram", v: p.instruments.enneagram, sub: "Investigator", c: "var(--risk-good)" }
  ];

  return (
    <div className="anim-fade-up" style={{ marginTop: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
      {/* identity header */}
      <div style={{ padding: "24px 28px", display: "flex", gap: 20, alignItems: "flex-start", borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: "linear-gradient(140deg,var(--accent),var(--accent-2))", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 600, flexShrink: 0, boxShadow: "0 6px 18px var(--accent-glow)" }}>{p.short}</div>
        <div style={{ flex: 1 }}>
          <h2 className="ser" style={{ fontSize: 25, margin: 0 }}>{p.name}</h2>
          <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 3 }}>{p.meta} · <span style={{ color: "var(--risk-good)", fontWeight: 600 }}>96% depth</span></div>
          <div style={{ display: "flex", gap: 7, marginTop: 11, flexWrap: "wrap" }}>
            {p.skills.map((s) => (
              <span key={s} style={skillPill(false)}>{s}</span>
            ))}
            <span style={skillPill(true)}>+{p.extraSkills} more</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 11.5, fontWeight: 600, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 99, color: "var(--text-2)" }}>{visLabel}</span>
          <button onClick={onCycleVis} style={{ padding: "8px 14px", fontSize: 12.5, fontWeight: 600, background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: "var(--r-sm)" }}>Manage sharing</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px" }}>
        {/* left: instruments + radar + bars */}
        <div style={{ padding: "22px 26px", borderRight: "1px solid var(--border)" }}>
          <div className="kicker">Personality instruments</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "12px 0 22px" }}>
            {badges.map((b) => (
              <div key={b.k} style={{ background: "var(--surface)", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", borderLeft: "1px solid var(--border)", borderTop: `3px solid ${b.c}`, borderRadius: 12, padding: 14 }}>
                <div className="kicker" style={{ fontSize: 9 }}>{b.k}</div>
                <div className="ser" style={{ fontSize: 24, marginTop: 5 }}>{b.v}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>{b.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 20, alignItems: "center" }}>
            <svg width="210" height="210" viewBox="0 0 220 220" aria-hidden="true">
              <polygon points="110,20 187.9,65 187.9,155 110,200 32.1,155 32.1,65" fill="none" stroke="var(--border-2)" />
              <polygon points="110,65 148.97,87.5 148.97,132.5 110,155 71.03,132.5 71.03,87.5" fill="none" stroke="var(--border)" />
              <line x1="110" y1="110" x2="110" y2="20" stroke="var(--border)" />
              <line x1="110" y1="110" x2="187.9" y2="65" stroke="var(--border)" />
              <line x1="110" y1="110" x2="187.9" y2="155" stroke="var(--border)" />
              <line x1="110" y1="110" x2="110" y2="200" stroke="var(--border)" />
              <line x1="110" y1="110" x2="32.1" y2="155" stroke="var(--border)" />
              <line x1="110" y1="110" x2="32.1" y2="65" stroke="var(--border)" />
              <polygon points="110,27.2 173.9,73.1 176.2,148.25 110,165.8 66.35,135.2 53.9,77.6" fill="var(--accent-glow)" stroke="var(--accent)" strokeWidth="2" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {p.traitBars.map((t) => (
                <div key={t.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{t.label}</span>
                    <span style={{ color: "var(--text-3)" }}>{t.value}</span>
                  </div>
                  <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${t.value}%`, background: t.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right: AI summary + best fit */}
        <div style={{ padding: "22px 24px", background: "var(--surface-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center" }}>✦</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>AI DNA summary</span>
          </div>
          <span style={{ display: "inline-block", marginTop: 9, padding: "3px 8px", fontSize: 9, fontWeight: 600, background: "var(--accent-soft)", color: "var(--accent)", borderRadius: 99, fontFamily: "var(--font-mono)" }}>AI-GENERATED · EDITABLE</span>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onSummary(e.currentTarget.innerText)}
            style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--text)", marginTop: 11, padding: 10, borderRadius: 8, border: "1px solid transparent" }}
          >
            {summary}
          </div>
          <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />
          <div className="kicker" style={{ fontSize: 9 }}>Best-fit roles</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {p.bestFit.map((b) => (
              <div key={b.role} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ fontWeight: 600 }}>{b.role}</span>
                <span style={{ color: b.color, fontWeight: 700 }}>{b.level}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10, color: "var(--text-3)", lineHeight: 1.5, margin: "14px 0 0", borderTop: "1px dashed var(--border-2)", paddingTop: 11 }}>
            Self-report instruments. Guidance, not a clinical or hiring guarantee.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Assessments tab ---------------- */
function AssessmentsTab({
  data,
  progress,
  setProgress,
  active,
  setActive,
  onGotoProfile
}: {
  data: DnaData;
  progress: Record<InstrumentId, number>;
  setProgress: (fn: (p: Record<InstrumentId, number>) => Record<InstrumentId, number>) => void;
  active: InstrumentId | null;
  setActive: (id: InstrumentId | null) => void;
  onGotoProfile: () => void;
}) {
  const actInstr = data.instruments.find((i) => i.id === active) ?? null;
  const done = !!(active && actInstr && progress[active] >= actInstr.total);
  const running = !!active && !done;

  const answer = () => {
    if (!active || !actInstr) return;
    setProgress((p) => ({ ...p, [active]: Math.min(p[active] + 1, actInstr.total) }));
  };
  const back = () => {
    if (!active) return;
    setProgress((p) => ({ ...p, [active]: Math.max(0, p[active] - 1) }));
  };

  return (
    <div className="anim-fade-up" style={{ marginTop: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", boxShadow: "var(--shadow)", overflow: "hidden", display: "grid", gridTemplateColumns: "240px 1fr 280px", minHeight: 520 }}>
      {/* instrument list */}
      <div style={{ padding: "20px 18px", borderRight: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <div className="kicker" style={{ color: "var(--accent)" }}>Assessments</div>
        <h3 className="ser" style={{ fontSize: 18, margin: "6px 0 4px" }}>Build your DNA</h3>
        <p style={{ fontSize: 10, color: "var(--risk-warn)", fontWeight: 600, margin: "0 0 16px" }}>Demo — not a validated assessment</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.instruments.map((ins) => {
            const pdone = progress[ins.id] >= ins.total;
            const started = progress[ins.id] > 0;
            const isActive = active === ins.id;
            return (
              <div key={ins.id} style={{ background: "var(--surface)", border: `1px solid ${isActive ? "var(--accent-line)" : "var(--border)"}`, borderRadius: 11, padding: 13, boxShadow: isActive ? "0 0 0 3px var(--accent-soft)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{ins.label}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: pdone ? "var(--risk-good)" : started ? "var(--accent)" : "var(--text-3)" }}>
                    {pdone ? "✓ Done" : started ? "In progress" : "Not started"}
                  </span>
                </div>
                {started && !pdone ? (
                  <>
                    <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 99, marginTop: 9, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.round((progress[ins.id] / ins.total) * 100)}%`, background: "var(--accent)" }} />
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 6 }}>{progress[ins.id]} / {ins.total} questions</div>
                  </>
                ) : null}
                {pdone ? <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 7 }}>Result: <strong>{ins.result}</strong></div> : null}
                <button
                  onClick={() => {
                    setActive(ins.id);
                    if (pdone) setProgress((p) => ({ ...p, [ins.id]: 0 }));
                  }}
                  style={{ marginTop: 9, width: "100%", padding: 7, fontSize: 11.5, fontWeight: 600, background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: 8 }}
                >
                  {pdone ? "Retake" : started ? "Resume" : "Start"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* center: idle / running / done */}
      <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column" }}>
        {!active ? (
          <div style={{ margin: "auto", textAlign: "center", maxWidth: 340 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", margin: "0 auto 16px", fontSize: 24 }}>🧠</div>
            <h3 className="ser" style={{ fontSize: 20, margin: "0 0 6px" }}>Pick an assessment to begin</h3>
            <p style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.55, margin: 0 }}>Demo questionnaire flow with reverse-check items. Answers auto-save — accuracy beats speed.</p>
          </div>
        ) : running && actInstr ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div className="kicker" style={{ color: "var(--text-3)" }}>{actInstr.label} · Question {Math.min(progress[active] + 1, actInstr.total)} of {actInstr.total}</div>
              <span style={{ fontSize: 11, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>~{Math.max(1, Math.round((actInstr.total - progress[active]) * 0.25))} min left</span>
            </div>
            <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden", marginBottom: 28 }}>
              <div style={{ height: "100%", width: `${Math.round((progress[active] / actInstr.total) * 100)}%`, background: "linear-gradient(90deg,var(--accent),var(--accent-2))", borderRadius: 99, transition: "width .4s var(--ease)" }} />
            </div>
            <h3 className="ser" style={{ fontSize: 22, lineHeight: 1.3, margin: "0 0 24px", maxWidth: 520 }}>&ldquo;{QUESTION_POOL[progress[active] % QUESTION_POOL.length]}&rdquo;</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 520 }}>
              {LIKERT.map((opt) => (
                <button key={opt} onClick={answer} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 11, textAlign: "left" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--border-2)", flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{opt}</span>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, maxWidth: 520 }}>
              <button onClick={back} style={{ padding: "9px 15px", fontSize: 12.5, fontWeight: 600, background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-2)" }}>← Back</button>
              <span style={{ fontSize: 10.5, color: "var(--text-3)" }}>Answers auto-save</span>
            </div>
          </>
        ) : done && actInstr ? (
          <div className="anim-pop" style={{ margin: "auto", textAlign: "center", maxWidth: 360 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--risk-good-bg)", color: "var(--risk-good)", display: "grid", placeItems: "center", margin: "0 auto 16px", fontSize: 28 }}>✓</div>
            <div className="kicker" style={{ fontSize: 9 }}>{actInstr.label} complete</div>
            <div className="ser" style={{ fontSize: 34, margin: "8px 0 4px" }}>{DONE_RESULT[active]}</div>
            <p style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.55, margin: "0 0 18px" }}>{DONE_BLURB[active]}</p>
            <button onClick={onGotoProfile} style={{ padding: "10px 18px", fontSize: 12.5, fontWeight: 600, background: "var(--accent)", color: "var(--accent-contrast)", border: "none", borderRadius: "var(--r-sm)", boxShadow: "0 6px 18px var(--accent-glow)" }}>View in DNA profile →</button>
          </div>
        ) : null}
      </div>

      {/* right: live result */}
      <div style={{ padding: 20, background: "var(--surface-2)", borderLeft: "1px solid var(--border)" }}>
        <div className="kicker" style={{ fontSize: 9 }}>{done ? "Final result" : "Emerging result"}</div>
        <div className="ser" style={{ fontSize: 28, margin: "8px 0 2px" }}>{active ? (DONE_RESULT[active] || "INTJ") + (done ? "" : "?") : "INTJ?"}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>{done ? "Locked in" : "Preliminary · firms up at the end"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 18 }}>
          {(LIVE_BARS[active ?? "mbti"] ?? LIVE_BARS.mbti).map((lb, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: "var(--text-3)" }}>{lb.a}</span>
                <span style={{ fontWeight: 600, color: "var(--text-3)" }}>{lb.b}</span>
              </div>
              <div style={{ height: 7, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: lb.width, background: "var(--accent)", borderRadius: 99, transition: "width .5s var(--ease)" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, padding: 11, background: "var(--info-bg)", borderRadius: 9 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--info)" }}>Reliability</div>
          <p style={{ fontSize: 10.5, color: "var(--text-2)", lineHeight: 1.5, margin: "4px 0 0" }}>Balanced item pool with reverse-scored checks.</p>
        </div>
      </div>
    </div>
  );
}

function skillPill(accent: boolean): React.CSSProperties {
  return {
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 600,
    background: accent ? "var(--accent-soft)" : "var(--surface-2)",
    border: `1px solid ${accent ? "var(--accent-line)" : "var(--border)"}`,
    color: accent ? "var(--accent)" : "var(--text)",
    borderRadius: 99
  };
}
