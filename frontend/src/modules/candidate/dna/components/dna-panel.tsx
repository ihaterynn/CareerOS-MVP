"use client";

import { useEffect, useState } from "react";

import { WORK_PROFILE_QUESTIONS, type WorkProfileAnswers, type WorkProfileQuestionId } from "../assessment";
import { nextSurveyStep, surveyProgress } from "../survey";
import { profileAvailability, type CandidateProfile } from "../profile";
import { radarPolygon } from "../radar";
import { DNA_STORAGE_KEY, parseDnaState } from "../storage";
import type { CareerGuidance } from "../types";

type GuidanceResponse = { guidance?: CareerGuidance; error?: string };
type ProfileResponse = { profile?: CandidateProfile; error?: string; code?: string; source?: "active" | "sample" };
type ProfileState = { profile?: CandidateProfile; availability: "loading" | "ready" | "missing" | "unavailable"; message?: string; source?: "active" | "sample" };

export function DnaPanel() {
  const [guidance, setGuidance] = useState<CareerGuidance>();
  const [profile, setProfile] = useState<ProfileState>({ availability: "loading" });
  const [answers, setAnswers] = useState<WorkProfileAnswers>(() => Object.fromEntries(WORK_PROFILE_QUESTIONS.map((question) => [question.id, 5])) as WorkProfileAnswers);
  const [surveyStage, setSurveyStage] = useState<"intro" | "questions" | "ready">("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string>();
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const saved = parseDnaState(window.localStorage.getItem(DNA_STORAGE_KEY));
    if (saved) {
      setAnswers(saved.answers);
      setSurveyStage(saved.surveyStage);
      setQuestionIndex(Math.min(saved.questionIndex, WORK_PROFILE_QUESTIONS.length - 1));
      setGuidance(saved.guidance);
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      window.localStorage.setItem(DNA_STORAGE_KEY, JSON.stringify({ answers, surveyStage, questionIndex, guidance }));
    } catch {
      // Storage can be disabled by the browser; the check-in still works for this session.
    }
  }, [answers, guidance, questionIndex, restored, surveyStage]);

  useEffect(() => {
    void fetch("/api/candidate/dna/guidance").then(async (response) => {
      const result = await response.json() as ProfileResponse;
      const availability = profileAvailability(result.profile, result.code);
      setProfile({ profile: result.profile, availability, message: result.error, source: result.source });
    }).catch(() => setProfile({ availability: "unavailable", message: "Your résumé profile could not be loaded." }));
  }, []);

  async function generate() {
    setState("loading");
    setError(undefined);
    try {
      const response = await fetch("/api/candidate/dna/guidance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) });
      const result = await response.json() as GuidanceResponse;
      if (!response.ok || !result.guidance) throw new Error(result.error || "Career guidance could not be generated.");
      setGuidance(result.guidance);
      setState("idle");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Career guidance could not be generated.");
      setState("error");
    }
  }

  return (
    <div className="anim-fade-up">
      <div>
        <div className="kicker" style={{ color: "var(--accent)" }}>Candidate DNA</div>
        <h1 className="ser" style={{ fontSize: 29, margin: "6px 0 0" }}>Your profile, decoded</h1>
        <p style={{ maxWidth: 680, margin: "8px 0 0", color: "var(--text-2)", fontSize: 13, lineHeight: 1.55 }}>Your résumé shows what you have done; your private check-in adds the work that gives you energy.</p>
      </div>

      <CareerGuidance guidance={guidance} profile={profile} answers={answers} surveyStage={surveyStage} questionIndex={questionIndex} busy={state === "loading"} error={error} onAnswer={(id, value) => setAnswers((current) => ({ ...current, [id]: value }))} onStart={() => setSurveyStage("questions")} onNext={() => { const next = nextSurveyStep(questionIndex, WORK_PROFILE_QUESTIONS.length); if (next === "complete") setSurveyStage("ready"); else setQuestionIndex(next); }} onBack={() => { if (questionIndex === 0) setSurveyStage("intro"); else setQuestionIndex((index) => index - 1); }} onGenerate={() => void generate()} onEdit={() => { setGuidance(undefined); setState("idle"); setSurveyStage("intro"); }} />
    </div>
  );
}

function CareerGuidance({ guidance, profile, answers, surveyStage, questionIndex, busy, error, onAnswer, onStart, onNext, onBack, onGenerate, onEdit }: { guidance?: CareerGuidance; profile: ProfileState; answers: WorkProfileAnswers; surveyStage: "intro" | "questions" | "ready"; questionIndex: number; busy: boolean; error?: string; onAnswer: (id: WorkProfileQuestionId, value: number) => void; onStart: () => void; onNext: () => void; onBack: () => void; onGenerate: () => void; onEdit: () => void }) {
  if (!guidance) {
    return <WorkCheckIn profile={profile} answers={answers} stage={surveyStage} questionIndex={questionIndex} busy={busy} error={error} onAnswer={onAnswer} onStart={onStart} onNext={onNext} onBack={onBack} onGenerate={onGenerate} />;
  }

  return <section className="anim-fade-up" style={dashboardShell}>
    <DashboardIdentity profile={profile} onEdit={onEdit} onRefresh={onGenerate} busy={busy} />
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px" }}>
      <section style={{ padding: "24px 26px" }}>
        <div className="kicker" style={{ color: "var(--accent)" }}>Current role fit</div>
        <div style={{ display: "grid", gridTemplateColumns: "230px minmax(0,1fr)", gap: 22, alignItems: "center", marginTop: 12 }}>
          <PentagonProfile dimensions={guidance.currentRole.dimensions} />
          <div><div style={{ display: "flex", gap: 12, alignItems: "center" }}><ScoreRing score={guidance.currentRole.score} label={`Compatibility with ${guidance.currentRole.role}`} large /><div><h2 className="ser" style={{ fontSize: 26, margin: 0 }}>{guidance.currentRole.role}</h2><span style={{ color: scoreTone(guidance.currentRole.score), fontSize: 12, fontWeight: 700 }}>Résumé-backed compatibility</span></div></div><p style={bodyText}>{guidance.currentRole.summary}</p><details open style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}><summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Evidence behind this fit</summary><div style={{ display: "grid", gap: 10, marginTop: 13 }}>{guidance.currentRole.dimensions.map((dimension) => <div key={dimension.label}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}><strong>{titleLabel(dimension.label)}</strong><span style={{ color: "var(--text-3)" }}>{dimension.value}</span></div><p style={evidenceText}>{dimension.detail} <strong>Evidence:</strong> {dimension.evidence}</p></div>)}</div></details></div>
        </div>
      </section>
      <aside style={{ padding: "24px 22px", background: "var(--surface-2)", borderLeft: "1px solid var(--border)" }}><div className="kicker" style={{ color: "var(--accent)" }}>Career readout</div><p style={{ ...bodyText, margin: "10px 0 16px" }}>{guidance.workProfile.summary}</p><div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>{guidance.workProfile.energizers.map((item) => <span key={item} style={{ ...pathBadge, color: "var(--risk-good)", background: "var(--risk-good-bg)" }}>{item}</span>)}</div><div className="kicker" style={{ fontSize: 9 }}>Potential directions</div><div style={{ display: "grid", gap: 10, marginTop: 9 }}>{guidance.suggestions.map((suggestion) => <article key={`${suggestion.path}-${suggestion.role}`} style={{ paddingTop: 10, borderTop: "1px solid var(--border)" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><ScoreRing score={suggestion.score} label={`Compatibility with ${suggestion.role}`} tone={suggestion.path === "Promotion" ? "var(--risk-good)" : "var(--accent)"} /><div><strong style={{ display: "block", fontSize: 13 }}>{suggestion.role}</strong><span style={{ color: scoreTone(suggestion.score), fontSize: 11, fontWeight: 700 }}>{suggestion.path} · {suggestion.score}%</span></div></div><p style={{ margin: "7px 0 0", fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>{suggestion.nextStep}</p></article>)}</div></aside>
    </div>
    <p style={{ margin: 0, padding: "11px 26px", borderTop: "1px solid var(--border)", fontSize: 11.5, color: "var(--text-3)" }}>Guidance is advisory. Work-style insight is self-reported; role fit is grounded only in the résumé.</p>
  </section>;
}

function DashboardIdentity({ profile, onEdit, onRefresh, busy }: { profile: ProfileState; onEdit: () => void; onRefresh: () => void; busy: boolean }) {
  const active = profile.profile;
  const name = displayName(active?.name || "Career profile");
  return <header style={{ padding: "20px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", borderBottom: "1px solid var(--border)" }}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 56, height: 56, borderRadius: 15, display: "grid", placeItems: "center", background: "linear-gradient(140deg,var(--accent),var(--accent-2))", color: "#fff", fontFamily: "var(--font-serif)", fontSize: 20, boxShadow: "0 6px 18px var(--accent-glow)" }}>{name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</div><div><h2 className="ser" style={{ fontSize: 25, margin: 0 }}>{name}</h2><p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--text-2)" }}>{active ? `${active.role}${active.location ? ` · ${active.location}` : ""} · ${active.currentYears} years in role` : "Personalised career dashboard"}</p>{active?.skills.length ? <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>{active.skills.map((skill) => <span key={skill} style={{ padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}>{skill}</span>)}</div> : null}</div></div><div style={{ display: "flex", gap: 8 }}><button onClick={onEdit} style={secondaryButton}>Update check-in</button><button onClick={onRefresh} disabled={busy} style={secondaryButton}>{busy ? "Refreshing…" : "Refresh AI"}</button></div></header>;
}

function WorkCheckIn({ profile, answers, stage, questionIndex, busy, error, onAnswer, onStart, onNext, onBack, onGenerate }: { profile: ProfileState; answers: WorkProfileAnswers; stage: "intro" | "questions" | "ready"; questionIndex: number; busy: boolean; error?: string; onAnswer: (id: WorkProfileQuestionId, value: number) => void; onStart: () => void; onNext: () => void; onBack: () => void; onGenerate: () => void }) {
  const question = WORK_PROFILE_QUESTIONS[questionIndex];
  const purpose = "This short check-in helps us distinguish work you can do from work that actually suits you—then combines that with your résumé for more useful career guidance.";

  if (stage === "intro") return <section className="anim-fade-up" style={checkInShell}>
    <div style={{ maxWidth: 620 }}><div className="kicker" style={{ color: "var(--accent)" }}>Private career check-in</div><h2 className="ser" style={{ fontSize: 28, margin: "7px 0" }}>A better career recommendation needs your point of view.</h2><p style={{ ...bodyText, fontSize: 13, margin: "0 0 18px" }}>{purpose}</p><ActiveProfile profile={profile} /><div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 20 }}>{[[String(WORK_PROFILE_QUESTIONS.length), "short questions"], ["2 min", "to complete"], ["Private", "self-report"]].map(([value, label]) => <div key={label} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)" }}><strong className="ser" style={{ fontSize: 18 }}>{value}</strong><span style={{ display: "block", marginTop: 2, fontSize: 10.5, color: "var(--text-3)" }}>{label}</span></div>)}</div><button onClick={onStart} style={primaryButton}>Start check-in</button><p style={{ margin: "11px 0 0", fontSize: 11, color: "var(--text-3)" }}>There are no right answers. You can update this whenever your work situation changes.</p></div>
  </section>;

  if (stage === "ready") return <section className="anim-pop" style={checkInShell}>
    <div style={{ maxWidth: 560 }}><div style={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: "50%", background: "var(--risk-good-bg)", color: "var(--risk-good)", fontSize: 22 }}>✓</div><div className="kicker" style={{ color: "var(--accent)", marginTop: 14 }}>Check-in complete</div><h2 className="ser" style={{ fontSize: 26, margin: "6px 0" }}>Your perspective is ready to add.</h2><p style={{ ...bodyText, fontSize: 13, margin: "0 0 18px" }}>We’ll combine your responses with your active résumé and create a personalised career dashboard. Every role recommendation still needs résumé evidence.</p><div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}><button onClick={onGenerate} disabled={busy} style={primaryButton}>{busy ? "Building your dashboard…" : "Build my personalised dashboard"}</button><button onClick={onBack} style={secondaryButton}>Review last answer</button></div><p aria-live="polite" style={{ margin: "11px 0 0", fontSize: 11.5, color: error ? "var(--risk-bad)" : "var(--text-3)" }}>{error || "Self-report is private. This is guidance, not a clinical or hiring assessment."}</p></div>
  </section>;

  return <section style={checkInShell}>
    <div style={{ maxWidth: 680, margin: "0 auto", width: "100%", textAlign: "center" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 11, color: "var(--text-3)" }}><span className="kicker" style={{ color: "var(--accent)" }}>Private work check-in</span><span>Question {questionIndex + 1} of {WORK_PROFILE_QUESTIONS.length}</span></div><div style={{ height: 4, overflow: "hidden", borderRadius: 99, background: "var(--surface-3)", margin: "9px 0 24px" }}><div style={{ width: `${surveyProgress(questionIndex, WORK_PROFILE_QUESTIONS.length)}%`, height: "100%", background: "var(--accent)", borderRadius: 99, transition: "width .35s var(--ease)" }} /></div><div key={question.id} className="anim-slide"><h2 className="ser" style={{ fontSize: 27, lineHeight: 1.22, margin: "0 0 26px" }}>{question.prompt}</h2><div style={{ ...card, padding: "22px 18px" }}><input aria-label={question.prompt} type="range" min="1" max="10" value={answers[question.id]} onChange={(event) => onAnswer(question.id, Number(event.target.value))} style={{ width: "100%", accentColor: "var(--accent)" }} /><div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginTop: 10, fontSize: 11, color: "var(--text-3)" }}><span>{question.low}</span><strong className="ser" style={{ fontSize: 26, color: "var(--accent)" }}>{answers[question.id]}<small style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--text-3)" }}> / 10</small></strong><span style={{ textAlign: "right" }}>{question.high}</span></div></div></div><div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 24 }}><button onClick={onBack} style={secondaryButton}>Back</button><button onClick={onNext} style={primaryButton}>{questionIndex + 1 === WORK_PROFILE_QUESTIONS.length ? "Finish check-in" : "Continue"}</button></div></div>
  </section>;
}

function ActiveProfile({ profile }: { profile: ProfileState }) {
  if (profile.availability === "loading") return <div style={{ ...card, padding: 14, marginBottom: 14, color: "var(--text-3)", fontSize: 11.5 }}>Loading your active résumé profile…</div>;
  if (profile.availability === "missing") return <div style={{ ...card, padding: 14, marginBottom: 14 }}><div className="kicker" style={{ fontSize: 9, color: "var(--accent)" }}>Your active profile</div><strong className="ser" style={{ display: "block", fontSize: 18, margin: "4px 0" }}>Add a résumé to personalise this check-in.</strong><p style={{ margin: "0 0 10px", fontSize: 11.5, color: "var(--text-2)" }}>Upload it in Resume Studio, save it as active, then return here.</p><a href="/candidate/studio" style={{ ...secondaryButton, display: "inline-block", textDecoration: "none" }}>Upload résumé</a></div>;
  if (profile.availability === "unavailable" || !profile.profile) return <div style={{ ...card, padding: 14, marginBottom: 14, color: "var(--text-2)", fontSize: 11.5 }}>{profile.message || "Your résumé profile is unavailable right now. You can still complete the check-in."}</div>;
  const active = profile.profile;
  return <div style={{ ...card, padding: 14, marginBottom: 14 }}><div className="kicker" style={{ fontSize: 9, color: "var(--accent)" }}>{profile.source === "sample" ? "Demo profile · supplied résumé" : "Your active profile"}</div><strong className="ser" style={{ display: "block", fontSize: 19, marginTop: 4 }}>{active.name}</strong><span style={{ display: "block", fontSize: 11.5, color: "var(--text-2)", marginTop: 2 }}>{active.role}</span><div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, marginTop: 12 }}><ProfileMetric value={`${active.currentYears} ${active.currentYears === 1 ? "year" : "years"}`} label="in current position" /><ProfileMetric value={`${active.totalYears} ${active.totalYears === 1 ? "year" : "years"}`} label="total work experience" /></div></div>;
}

function ProfileMetric({ value, label }: { value: string; label: string }) {
  return <div style={{ padding: 10, borderRadius: 10, background: "var(--surface-2)" }}><strong className="ser" style={{ fontSize: 16 }}>{value}</strong><span style={{ display: "block", fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{label}</span></div>;
}

function PentagonProfile({ dimensions }: { dimensions: CareerGuidance["currentRole"]["dimensions"] }) {
  const plotted = [...dimensions.slice(0, 5)];
  while (plotted.length < 5) plotted.push({ label: "Evidence emerging", value: 0, detail: "", evidence: "" });
  const values = plotted.map((dimension) => dimension.value);
  const outer = radarPolygon([100, 100, 100, 100, 100]);
  const middle = radarPolygon([60, 60, 60, 60, 60]);
  const shape = radarPolygon(values);
  const axisPoints = outer.split(" ");

  return <figure style={{ margin: 0, textAlign: "center" }}>
    <svg width="200" height="200" viewBox="0 0 200 200" role="img" aria-label="Five-dimensional role compatibility profile">
      <polygon points={outer} fill="none" stroke="var(--border-2)" strokeWidth="1" />
      <polygon points={middle} fill="none" stroke="var(--border)" strokeWidth="1" />
      {axisPoints.map((point, index) => <line key={point} x1="100" y1="100" x2={point.split(",")[0]} y2={point.split(",")[1]} stroke="var(--border)" strokeWidth="1" />)}
      <polygon points={shape} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" />
      {shape.split(" ").map((point) => <circle key={point} cx={point.split(",")[0]} cy={point.split(",")[1]} r="3" fill="var(--accent)" />)}
    </svg>
    <figcaption style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "5px 10px", marginTop: -4, textAlign: "left" }}>{plotted.map((dimension) => <span key={dimension.label} style={{ fontSize: 11, color: dimension.value ? "var(--text-2)" : "var(--text-3)" }}><strong style={{ color: "var(--text)" }}>{dimension.value || "—"}</strong> {titleLabel(dimension.label)}</span>)}</figcaption>
  </figure>;
}

function ScoreRing({ score, label, large = false, tone = scoreTone(score) }: { score: number; label: string; large?: boolean; tone?: string }) {
  const size = large ? 76 : 46;
  return <div role="img" aria-label={`${score}% ${label}`} style={{ width: size, height: size, borderRadius: "50%", padding: large ? 6 : 4, display: "grid", placeItems: "center", flexShrink: 0, background: `conic-gradient(${tone} 0 ${score}%, var(--surface-3) ${score}% 100%)` }}><div style={{ width: "100%", height: "100%", borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--surface)" }}><strong className={large ? "ser" : undefined} style={{ fontSize: large ? 22 : 11 }}>{score}%</strong></div></div>;
}

function scoreTone(score: number) {
  return score >= 80 ? "var(--risk-good)" : score >= 60 ? "var(--accent)" : "var(--risk-warn)";
}

function displayName(name: string) {
  return name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function titleLabel(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const card: React.CSSProperties = { border: "1px solid var(--border)", borderRadius: 16, padding: 16, background: "var(--surface)" };
const bodyText: React.CSSProperties = { fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.55, margin: "14px 0" };
const evidenceText: React.CSSProperties = { fontSize: 11.5, color: "var(--text-3)", lineHeight: 1.45, margin: "3px 0 0" };
const primaryButton: React.CSSProperties = { padding: "10px 16px", fontSize: 12.5, fontWeight: 700, background: "var(--accent)", color: "var(--accent-contrast)", border: "none", borderRadius: "var(--r-sm)", boxShadow: "0 6px 18px var(--accent-glow)" };
const secondaryButton: React.CSSProperties = { padding: "8px 12px", fontSize: 11.5, fontWeight: 700, background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border-2)", borderRadius: "var(--r-sm)" };
const checkInShell: React.CSSProperties = { marginTop: 20, padding: "clamp(24px,5vw,44px)", border: "1px solid var(--border)", borderRadius: "var(--r)", background: "linear-gradient(120deg,var(--surface),var(--surface-2))", boxShadow: "var(--shadow)", minHeight: 410, display: "grid", alignItems: "center" };
const pathBadge: React.CSSProperties = { padding: "3px 7px", borderRadius: 99, fontSize: 9, fontWeight: 700 };
const dashboardShell: React.CSSProperties = { marginTop: 20, border: "1px solid var(--border)", borderRadius: "var(--r)", background: "var(--surface)", boxShadow: "var(--shadow)", overflow: "hidden" };
