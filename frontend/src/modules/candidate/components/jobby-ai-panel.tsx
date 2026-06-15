"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, ShieldCheck, User, Bolt } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { candidateProfile, careerPathRoutes, jobListings, candidateApplications } from "../candidate-data";

/* ============================================================
   Jobby.ai — AI Career Advisor + live CV updater.
   Layout + animation preserved from the careeros advisor view:
   left = single-source-of-truth CV; right = chat that edits it
   live, with a typing ("Thinking") indicator and a green flash
   when the AI appends a new, quantified bullet.
   ============================================================ */

type ChatMsg = {
  role: "bot" | "user";
  text: string;
  chips?: string[];
};

type CvEntry = {
  id: string;
  role: string;
  org: string;
  period: string;
  bullets: string[];
};

const INITIAL_CV: CvEntry[] = candidateProfile.experience.map((e, i) => ({
  id: `exp-${i}`,
  role: e.role,
  org: e.company,
  period: e.period,
  bullets: [e.impact]
}));

const SUMMARY =
  "Backend-leaning software engineer focused on platform performance, routing optimisation, and data products. Single living profile, always current.";

function Section({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 22 }}>
      <div className="kicker" style={{ marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}

function CVDoc({ cv, flashId }: { cv: CvEntry[]; flashId: string | null }) {
  return (
    <Card pad={0} style={{ overflow: "hidden" }}>
      <div style={{ height: 6, background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }} />
      <div style={{ padding: "26px 30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: 18, marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 26, marginBottom: 4 }}>{candidateProfile.name}</h2>
            <div style={{ color: "var(--text-2)", fontSize: 14, fontWeight: 600 }}>
              {candidateProfile.currentRole} · {candidateProfile.experience[0]?.company}
            </div>
            <div style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 4 }}>{candidateProfile.location}</div>
          </div>
          <Badge tone="accent" icon="shield">Single source of truth</Badge>
        </div>

        <Section label="Summary">
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-2)", margin: 0 }}>{SUMMARY}</p>
        </Section>

        <Section label="Experience">
          {cv.map((job) => (
            <div key={job.id} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>
                  {job.role} · <span style={{ color: "var(--accent)" }}>{job.org}</span>
                </div>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{job.period}</div>
              </div>
              <ul style={{ margin: "8px 0 0", paddingLeft: 0, listStyle: "none", display: "grid", gap: 4 }}>
                {job.bullets.map((b, i) => {
                  const flash = flashId === job.id + ":" + i;
                  return (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        gap: 9,
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: "var(--text-2)",
                        padding: "4px 8px",
                        marginLeft: -8,
                        borderRadius: 6,
                        animation: flash ? "greenflash 2.4s var(--ease) forwards" : "none"
                      }}
                    >
                      <span style={{ color: flash ? "var(--risk-good)" : "var(--accent)", marginTop: 6, flexShrink: 0 }}>
                        <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                      </span>
                      <span>
                        {b}
                        {flash && <Badge tone="good" icon="sparkles" style={{ marginLeft: 8, verticalAlign: "middle" }}>Just added</Badge>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </Section>

        <Section label="Education">
          {candidateProfile.education.map((ed) => (
            <div key={ed.school} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{ed.school}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-2)" }}>{ed.credential}</div>
              </div>
              <div className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>{ed.year}</div>
            </div>
          ))}
        </Section>

        <Section label="Skills" last>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {candidateProfile.careerInterests.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </Section>
      </div>
    </Card>
  );
}

function ChatBubble({ m }: { m: ChatMsg }) {
  const bot = m.role === "bot";
  return (
    <div className="anim-fade-up" style={{ display: "flex", gap: 9, flexDirection: bot ? "row" : "row-reverse" }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          background: bot ? "var(--accent)" : "var(--surface-3)",
          color: bot ? "var(--accent-contrast)" : "var(--text-2)"
        }}
      >
        {bot ? <Sparkles size={15} aria-hidden="true" /> : <User size={15} aria-hidden="true" />}
      </div>
      <div
        style={{
          maxWidth: "78%",
          padding: "10px 13px",
          borderRadius: 14,
          borderTopLeftRadius: bot ? 4 : 14,
          borderTopRightRadius: bot ? 14 : 4,
          background: bot ? "var(--surface-2)" : "var(--accent)",
          color: bot ? "var(--text)" : "var(--accent-contrast)",
          border: "1px solid " + (bot ? "var(--border)" : "transparent"),
          fontSize: 13.5,
          lineHeight: 1.5
        }}
      >
        {m.text}
        {m.chips && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
            {m.chips.map((c, i) => (
              <Badge key={i} tone="accent" icon="check">{c}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="anim-fade-up" style={{ display: "flex", gap: 9 }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: "var(--accent)", color: "var(--accent-contrast)" }}>
        <Sparkles size={15} aria-hidden="true" />
      </div>
      <div style={{ padding: "13px 15px", borderRadius: 14, borderTopLeftRadius: 4, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: `dot-bounce 1.2s ${i * 0.15}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function buildJobbyReply(prompt: string): { text: string; chips?: string[]; bullet?: string } {
  const n = prompt.toLowerCase();
  const bestJob = jobListings[0];
  const bestRoute = careerPathRoutes[0];
  const savedJobsCount = candidateApplications.length;

  if (/rout|deliver|python|optimi|fuel|logistic/.test(n)) {
    return {
      text: "Done — I've added a quantified bullet under your current role and tagged the new skills so employers searching for them can find you.",
      chips: ["Python", "OR-Tools", "Route optimisation"],
      bullet: "Led a delivery-route optimisation project in Python with OR-Tools, cutting fuel cost ~18%."
    };
  }
  if (n.includes("salary") || n.includes("pay") || n.includes("ask")) {
    return {
      text: `For the ${bestRoute.title} route, current expected pay is ${bestRoute.currentExpectedPay}; the unlocked range is ${bestRoute.unlockedPayRange} once you prove ${bestRoute.requiredSignals.slice(0, 2).join(" and ")}.`
    };
  }
  if (n.includes("learn") || n.includes("course") || n.includes("skill")) {
    return {
      text: `Start with ${bestRoute.bridgeSkills[0]} — mapped to ${bestRoute.courses[0].title}, then build the project: ${bestRoute.projects[0]}.`,
      chips: [bestRoute.bridgeSkills[0]]
    };
  }
  if (n.includes("apply") || n.includes("job")) {
    return {
      text: `Apply first to ${bestJob.title} at ${bestJob.company} — highest employer-job match. You have ${savedJobsCount} active targets to prioritise after that.`
    };
  }
  if (n.includes("path") || n.includes("career")) {
    return {
      text: `The most realistic market route is ${bestRoute.title} — ${bestRoute.readiness}% ready over ${bestRoute.horizon}. Career DNA also surfaces adjacent paths when soft signals support them.`
    };
  }
  if (n.includes("resume") || n.includes("cv")) {
    return {
      text: "Position the CV around backend platform ownership: dispatch latency reduction, PostgreSQL tuning, and route-optimisation portfolio evidence. Tell me a recent win and I'll write it up."
    };
  }
  return {
    text: `Jobby recommends starting with ${bestRoute.title}: close ${bestRoute.bridgeSkills.join(" and ")}, build "${bestRoute.projects[0]}", and target the ${bestRoute.unlockedPayRange} pay band once those signals are proven.`
  };
}

const SUGGESTION = "I just led a project optimising delivery routes using Python — we cut fuel cost by 18%.";

export function JobbyAiPanel() {
  const [cv, setCv] = useState<CvEntry[]>(() => INITIAL_CV.map((j) => ({ ...j, bullets: [...j.bullets] })));
  const [flashId, setFlashId] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const [usedSuggestion, setUsedSuggestion] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      role: "bot",
      text: `Hi ${candidateProfile.name.split(" ")[0]} 👋 I keep your CV current as you grow, using your Career DNA, job matches, and market routes. Tell me a recent project, win, or new skill — I'll write it up.`
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, thinking]);

  // Clean up pending timers on unmount.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setThinking(true);
    const reply = buildJobbyReply(text);

    timers.current.push(
      setTimeout(() => {
        setThinking(false);
        if (reply.bullet) {
          setCv((prev) => {
            const copy = prev.map((j) => ({ ...j, bullets: [...j.bullets] }));
            copy[0].bullets.push(reply.bullet as string);
            setFlashId(copy[0].id + ":" + (copy[0].bullets.length - 1));
            return copy;
          });
          timers.current.push(setTimeout(() => setFlashId(null), 2600));
        }
        setMsgs((m) => [...m, { role: "bot", text: reply.text, chips: reply.chips }]);
      }, 1500)
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div className="kicker">Jobby.ai career advisor</div>
        <h2 style={{ fontSize: 26, marginTop: 6 }}>Talk to your CV</h2>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 6, maxWidth: 640, lineHeight: 1.55 }}>
          One living profile, always current. Describe your work in plain language — Jobby turns it into recruiter-ready,
          quantified bullets and answers career-path, pay, course, and application questions using your Career DNA.
        </p>
      </div>

      <div className="jobby-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(340px,.9fr)", gap: 22, alignItems: "start" }}>
        <CVDoc cv={cv} flashId={flashId} />

        <Card pad={0} style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", height: "min(680px, calc(100vh - 120px))", overflow: "hidden" }}>
          <div style={{ padding: "15px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--accent-soft)", color: "var(--accent)" }}>
              <Bot size={18} aria-hidden="true" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Career Advisor</div>
              <div style={{ fontSize: 11.5, color: "var(--risk-good)", display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--risk-good)" }} />
                Online · writes to your CV
              </div>
            </div>
            <ShieldCheck size={16} aria-hidden="true" style={{ color: "var(--text-3)" }} />
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            {msgs.map((m, i) => (
              <ChatBubble key={i} m={m} />
            ))}
            {thinking && <Thinking />}
          </div>

          {!usedSuggestion && (
            <div style={{ padding: "0 18px 10px" }}>
              <button
                onClick={() => {
                  setUsedSuggestion(true);
                  send(SUGGESTION);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "var(--accent-soft)",
                  border: "1px dashed var(--accent-line)",
                  color: "var(--accent)",
                  borderRadius: "var(--r-sm)",
                  padding: "9px 12px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <Bolt size={14} aria-hidden="true" /> Try: &quot;{SUGGESTION.slice(0, 46)}…&quot;
              </button>
            </div>
          )}

          <div style={{ padding: 14, borderTop: "1px solid var(--border)", display: "flex", gap: 9, alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Describe a recent project or win…"
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid var(--border-2)",
                borderRadius: "var(--r-sm)",
                padding: "10px 12px",
                fontSize: 13.5,
                background: "var(--inset)",
                color: "var(--text)",
                outline: "none",
                maxHeight: 90
              }}
            />
            <Button variant="primary" size="md" onClick={() => send(input)} disabled={!input.trim() || thinking} style={{ padding: 11 }}>
              <Send size={16} aria-hidden="true" />
            </Button>
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .jobby-grid { grid-template-columns: 1fr !important; }
          .jobby-grid > div:last-child { position: static !important; height: auto !important; min-height: 460px; }
        }
      `}</style>
    </div>
  );
}
