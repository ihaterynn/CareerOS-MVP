"use client";

import { useRef, useState } from "react";
import type { StudioData, Suggestion } from "../types";
import { AGENT_REPLY, mockAgentSuggestion } from "../mock";
import { Toast } from "../../tracker/components/toast";

export function StudioPanel({ data, applicationId }: { data: StudioData; applicationId?: string }) {
  const [resume, setResume] = useState(data.resume);
  const [suggestions, setSuggestions] = useState(data.suggestions);
  const [atsScore, setAtsScore] = useState(data.atsScore);
  const [jd, setJd] = useState(0);
  const [missing, setMissing] = useState(data.jds[0].missing);
  const [template, setTemplate] = useState(0);
  const [chat, setChat] = useState(data.chat);
  const [chatInput, setChatInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const chatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pending = suggestions.filter((s) => s.status === "pending");
  const accepted = suggestions.filter((s) => s.status === "accepted");
  const kwCovered = data.keywordTotal - missing.length;

  const showToast = (m: string) => setToast(m);

  const accept = (id: string) => {
    const sg = suggestions.find((s) => s.id === id);
    if (!sg || sg.status !== "pending") return;
    let flash: string | null = null;
    setResume((r) => {
      if (sg.field === "summary") return { ...r, summary: sg.replacement };
      if (sg.field === "exp" && sg.ei != null && sg.bi != null) {
        flash = `${sg.ei}-${sg.bi}`;
        return {
          ...r,
          experience: r.experience.map((e, i) =>
            i === sg.ei ? { ...e, bullets: e.bullets.map((b, j) => (j === sg.bi ? sg.replacement : b)) } : e
          )
        };
      }
      return r;
    });
    if (sg.removeKw) setMissing((m) => m.filter((k) => k !== sg.removeKw));
    setAtsScore((s) => Math.min(100, s + (sg.delta || 0)));
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "accepted" } : s)));
    if (flash) {
      setFlashKey(flash);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlashKey(null), 2600);
    }
    showToast(`Edit applied · ATS match +${sg.delta || 0}%`);
  };

  const reject = (id: string) =>
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "rejected" } : s)));

  const send = () => {
    const text = chatInput.trim();
    if (!text || thinking) return;
    setChat((c) => [...c, { role: "user", text }]);
    setChatInput("");
    setThinking(true);
    if (chatTimer.current) clearTimeout(chatTimer.current);
    chatTimer.current = setTimeout(() => {
      setThinking(false);
      setChat((c) => [...c, { role: "bot", text: AGENT_REPLY }]);
      setSuggestions((prev) => [...prev, mockAgentSuggestion(prev.length + 1)]);
    }, 1400);
  };

  const cycleJd = () => {
    const n = (jd + 1) % data.jds.length;
    setJd(n);
    setMissing(data.jds[n].missing);
    showToast(`Re-analysed against ${data.jds[n].label}`);
  };

  const saveBullet = (ei: number, bi: number, value: string) =>
    setResume((r) => ({
      ...r,
      experience: r.experience.map((e, i) =>
        i === ei ? { ...e, bullets: e.bullets.map((b, j) => (j === bi ? value : b)) } : e
      )
    }));

  const skillMatched = (name: string) => ["PostgreSQL", "AWS"].includes(name);

  return (
    <div className="anim-fade-up">
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div className="kicker" style={{ color: "var(--accent)" }}>Resume Studio</div>
          <h1 className="ser" style={{ fontSize: 26, margin: "5px 0 0" }}>Tailor &amp; export</h1>
          {applicationId ? (
            <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--text-3)" }}>Tailoring for application · {applicationId}</p>
          ) : null}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={cycleJd} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", fontSize: 12, fontWeight: 600, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>
            ◎ JD: {data.jds[jd].label}
          </button>
          <span style={{ padding: "8px 13px", fontSize: 12, fontWeight: 600, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>📄 {resume.version}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 20, alignItems: "start" }}>
        {/* LEFT */}
        <div>
          {/* scoreboard */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
            <ScoreCard label="ATS match" main={<span className="ser" style={{ fontSize: 26, color: "var(--accent)" }}>{atsScore}<span style={{ fontSize: 12, color: "var(--text-3)" }}>%</span></span>} bar={atsScore} />
            <ScoreCard label="Keywords" main={<span className="ser" style={{ fontSize: 26 }}>{kwCovered}<span style={{ fontSize: 12, color: "var(--text-3)" }}> / {data.keywordTotal}</span></span>} note="from JD matched" />
            <ScoreCard label="Format" main={<span className="ser" style={{ fontSize: 17, color: "var(--risk-good)" }}>✓ ATS-safe</span>} note="single column" />
            <ScoreCard label="Suggestions" main={<span className="ser" style={{ fontSize: 26, color: "var(--accent)" }}>{pending.length}<span style={{ fontSize: 11, color: "var(--text-3)" }}> pending</span></span>} note={`${accepted.length} accepted`} />
          </div>

          {/* missing keywords */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 16, fontSize: 11.5 }}>
            <span className="kicker" style={{ fontSize: 9 }}>Missing</span>
            {missing.length ? (
              missing.map((mk) => (
                <span key={mk} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, background: "var(--risk-bad-bg)", color: "var(--risk-bad)", borderRadius: 99 }}>{mk}</span>
              ))
            ) : (
              <span style={{ color: "var(--risk-good)", fontWeight: 600 }}>All JD keywords covered 🎉</span>
            )}
          </div>

          {/* résumé document */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", boxShadow: "var(--shadow-lg)", padding: "30px 36px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid var(--border)", paddingBottom: 14, marginBottom: 16 }}>
              <div>
                <div className="ser" style={{ fontSize: 24 }}>{resume.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{resume.title} · {resume.loc} · {resume.email}</div>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{resume.version}</span>
            </div>

            <div className="kicker" style={{ fontSize: 9, color: "var(--text-3)" }}>Summary</div>
            <div
              contentEditable
              suppressContentEditableWarning
              title="Click to edit"
              onBlur={(e) => setResume((r) => ({ ...r, summary: e.currentTarget.innerText }))}
              style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--text-2)", margin: "7px 0 18px", padding: "6px 8px", borderRadius: 7, border: "1px solid transparent", cursor: "text" }}
            >
              {resume.summary}
            </div>

            {resume.experience.map((exp, ei) => (
              <div key={ei}>
                <div className="kicker" style={{ fontSize: 9, color: "var(--text-3)", marginTop: 4 }}>Experience</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, margin: "7px 0 2px" }}>
                  {exp.role} <span style={{ color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>· {exp.period}</span>
                </div>
                <ul style={{ margin: "8px 0 16px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {exp.bullets.map((bl, bi) => (
                    <li key={bi} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--accent)", marginTop: 9, flexShrink: 0, width: 4, height: 4, borderRadius: "50%", background: "currentColor" }} />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        title="Click to edit"
                        onBlur={(e) => saveBullet(ei, bi, e.currentTarget.innerText)}
                        style={{
                          fontSize: 12.5,
                          lineHeight: 1.55,
                          color: "var(--text-2)",
                          flex: 1,
                          padding: "4px 7px",
                          borderRadius: 6,
                          border: "1px solid transparent",
                          cursor: "text",
                          animation: flashKey === `${ei}-${bi}` ? "greenflash 2.4s var(--ease) forwards" : "none"
                        }}
                      >
                        {bl}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="kicker" style={{ fontSize: 9, color: "var(--text-3)" }}>Skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
              {resume.skills.map((sk) => {
                const hot = skillMatched(sk);
                return (
                  <span key={sk} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, background: hot ? "var(--accent-soft)" : "var(--surface-2)", color: hot ? "var(--accent)" : "var(--text-2)", border: `1px solid ${hot ? "var(--accent-line)" : "var(--border)"}`, borderRadius: 99 }}>{sk}</span>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 80 }}>
          {/* review queue */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 16, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div className="kicker" style={{ fontSize: 9 }}>Review queue</div>
              <span style={{ fontSize: 10.5, color: "var(--text-3)" }}>{pending.length} pending</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {suggestions.map((sg) => (
                <SuggestionCard key={sg.id} sg={sg} onAccept={() => accept(sg.id)} onReject={() => reject(sg.id)} />
              ))}
              {suggestions.every((s) => s.status !== "pending") ? (
                <div style={{ textAlign: "center", padding: 14, fontSize: 11.5, color: "var(--text-3)" }}>Queue clear. Ask the agent for more ↓</div>
              ) : null}
            </div>
          </div>

          {/* agent chat */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}>🤖</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>Resume Agent</div>
                <div style={{ fontSize: 10, color: "var(--risk-good)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--risk-good)" }} />
                  {thinking ? "Thinking…" : "Online · edits your résumé"}
                </div>
              </div>
            </div>
            <div style={{ maxHeight: 230, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 11 }}>
              {chat.map((m, i) => {
                const bot = m.role === "bot";
                return (
                  <div key={i} className="anim-fade-up" style={{ display: "flex", gap: 8, flexDirection: bot ? "row" : "row-reverse" }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: bot ? "var(--accent)" : "var(--surface-3)", color: bot ? "#fff" : "var(--text-2)", display: "grid", placeItems: "center", fontSize: 11, flexShrink: 0 }}>{bot ? "✦" : "🙂"}</span>
                    <div style={{ maxWidth: "80%", padding: "9px 11px", borderRadius: 12, background: bot ? "var(--surface-2)" : "var(--accent)", color: bot ? "var(--text)" : "var(--accent-contrast)", border: `1px solid ${bot ? "var(--border)" : "transparent"}`, fontSize: 12, lineHeight: 1.5, borderTopLeftRadius: bot ? 4 : 12, borderTopRightRadius: bot ? 12 : 4 }}>{m.text}</div>
                  </div>
                );
              })}
              {thinking ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, flexShrink: 0 }}>✦</span>
                  <div style={{ padding: "11px 13px", borderRadius: 12, borderTopLeftRadius: 4, background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", gap: 5 }}>
                    {[0, 0.15, 0.3].map((d) => (
                      <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: `dot-bounce 1.2s ${d}s infinite` }} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div style={{ padding: "11px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
                placeholder="Ask the agent…"
                style={{ flex: 1, padding: "9px 11px", fontSize: 12, background: "var(--inset)", border: "1px solid var(--border-2)", borderRadius: "var(--r-sm)", color: "var(--text)" }}
              />
              <button onClick={send} aria-label="Send" style={{ padding: "9px 12px", background: "var(--accent)", color: "var(--accent-contrast)", border: "none", borderRadius: "var(--r-sm)" }}>➤</button>
            </div>
          </div>

          {/* export */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 16, boxShadow: "var(--shadow-sm)" }}>
            <div className="kicker" style={{ fontSize: 9, marginBottom: 10 }}>Export template</div>
            <div style={{ display: "flex", gap: 9 }}>
              {data.templates.map((t, i) => {
                const on = template === i;
                return (
                  <button key={t} onClick={() => setTemplate(i)} style={{ flex: 1, border: on ? "2px solid var(--accent)" : "1px solid var(--border)", borderRadius: 9, padding: 9, textAlign: "center", background: on ? "var(--accent-soft)" : "transparent" }}>
                    <div style={{ height: 32, background: `repeating-linear-gradient(${on ? "var(--accent-line)" : "var(--border-2)"} 0 2px,transparent 2px 6px)`, borderRadius: 3 }} />
                    <div style={{ fontSize: 10, fontWeight: 700, marginTop: 6, color: on ? "var(--accent)" : "var(--text-2)" }}>{t}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
              <button onClick={() => showToast(`Exported ${resume.name} · ${data.templates[template]} template · PDF`)} style={{ flex: 1, padding: 10, fontSize: 12.5, fontWeight: 700, background: "var(--accent)", color: "var(--accent-contrast)", border: "none", borderRadius: 8, boxShadow: "0 6px 18px var(--accent-glow)" }}>Export PDF</button>
              <button onClick={() => showToast(`Exported ${resume.name} · ${data.templates[template]} template · DOCX`)} style={{ flex: 1, padding: 10, fontSize: 12.5, fontWeight: 600, background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: 8 }}>DOCX</button>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function ScoreCard({ label, main, bar, note }: { label: string; main: React.ReactNode; bar?: number; note?: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "13px 15px", boxShadow: "var(--shadow-sm)" }}>
      <div className="kicker" style={{ fontSize: 9 }}>{label}</div>
      <div style={{ marginTop: 6 }}>{main}</div>
      {bar != null ? (
        <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 99, marginTop: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${bar}%`, background: "var(--accent)", borderRadius: 99, transition: "width .6s var(--ease)" }} />
        </div>
      ) : null}
      {note ? <div style={{ fontSize: 10.5, color: "var(--text-2)", marginTop: 8 }}>{note}</div> : null}
    </div>
  );
}

function SuggestionCard({ sg, onAccept, onReject }: { sg: Suggestion; onAccept: () => void; onReject: () => void }) {
  const pending = sg.status === "pending";
  const accepted = sg.status === "accepted";
  return (
    <div style={{ border: `1px solid ${pending ? "var(--accent-line)" : "var(--border)"}`, borderRadius: 11, padding: 12, boxShadow: pending ? "0 0 0 3px var(--accent-soft)" : "none", opacity: pending ? 1 : 0.6 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: pending ? "var(--accent)" : "var(--text-3)", fontFamily: "var(--font-mono)", letterSpacing: ".05em" }}>{sg.tag}</div>
      <p style={{ fontSize: 12, lineHeight: 1.5, margin: "8px 0 0", color: "var(--text)" }}>{sg.text}</p>
      {pending ? (
        <div style={{ display: "flex", gap: 7, marginTop: 11 }}>
          <button onClick={onAccept} style={{ flex: 1, padding: 7, fontSize: 11.5, fontWeight: 700, background: "var(--risk-good)", color: "#fff", border: "none", borderRadius: 7 }}>✓ Accept</button>
          <button onClick={onReject} style={{ flex: 1, padding: 7, fontSize: 11.5, fontWeight: 600, background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: 7 }}>Reject</button>
        </div>
      ) : (
        <div style={{ marginTop: 9, fontSize: 10.5, fontWeight: 700, color: accepted ? "var(--risk-good)" : "var(--text-3)" }}>
          {accepted ? "✓ Accepted — applied to résumé" : "✕ Rejected"}
        </div>
      )}
    </div>
  );
}
