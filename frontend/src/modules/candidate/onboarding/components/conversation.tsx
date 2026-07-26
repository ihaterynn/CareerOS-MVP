"use client";

import { useEffect, useRef } from "react";
import { formatValue } from "../engine";
import type { AnswerValue, DimensionId, DnaVisibility, Fact, TurnRecord } from "../types";
import { AnswerControls } from "./answer-controls";

export type ConversationHandlers = {
  onAnswer: (value: AnswerValue) => void;
  onEditFact: (factId: string, value: string) => void;
  onEditSummary: (summaryMd: string) => void;
  onRequestVisibility: (visibility: DnaVisibility) => void;
  onComplete: () => void;
};

/**
 * The turn stream. `role="log"` + `aria-live="polite"` so a screen reader hears each new agent
 * turn as it lands (spec §6.6) — the flow is unusable otherwise, since content arrives over time.
 */
export function Conversation({
  records,
  thinking,
  streamingSteps,
  facts,
  visibility,
  handlers
}: {
  records: TurnRecord[];
  thinking: boolean;
  streamingSteps: string[];
  facts: Fact[];
  visibility: DnaVisibility;
  handlers: ConversationHandlers;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [records.length, thinking, streamingSteps.length]);

  return (
    <div role="log" aria-live="polite" aria-label="Onboarding conversation" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {records.map((record, index) => {
        const last = index === records.length - 1;
        return (
          <TurnBlock
            key={record.turn.id}
            record={record}
            live={last && record.status === "pending"}
            facts={facts}
            streamingSteps={streamingSteps}
            visibility={visibility}
            handlers={handlers}
          />
        );
      })}
      {thinking ? <Thinking /> : null}
      <div ref={endRef} />
    </div>
  );
}

function TurnBlock({
  record,
  live,
  facts,
  streamingSteps,
  visibility,
  handlers
}: {
  record: TurnRecord;
  live: boolean;
  facts: Fact[];
  streamingSteps: string[];
  visibility: DnaVisibility;
  handlers: ConversationHandlers;
}) {
  const { turn } = record;
  const { onAnswer, onEditFact } = handlers;

  return (
    <div className="anim-fade-up" style={{ display: "flex", gap: 11 }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--accent)",
          color: "var(--accent-contrast)",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          flexShrink: 0,
          marginTop: 2
        }}
        aria-hidden="true"
      >
        ✦
      </span>

      <div style={{ minWidth: 0, flex: 1 }}>
        <p className="ser" style={{ fontSize: 16.5, lineHeight: 1.5, margin: 0, color: "var(--text)" }}>
          {turn.say}
        </p>

        {turn.kind === "gap" && turn.because ? (
          <p style={{ fontSize: 11.5, color: "var(--text-3)", margin: "6px 0 0", lineHeight: 1.5 }}>{turn.because}</p>
        ) : null}

        {turn.kind === "parsing" ? <ParseSteps shown={streamingSteps} all={turn.steps} /> : null}

        {turn.kind === "confirm" ? (
          <ConfirmBlock
            facts={turn.factIds
              .map((id) => facts.find((f) => f.id === id))
              .filter((f): f is Fact => Boolean(f))}
            live={live}
            onAnswer={onAnswer}
            onEditFact={onEditFact}
          />
        ) : null}

        {turn.kind === "gap" && live ? (
          <AnswerControls control={turn.control} onAnswer={onAnswer} />
        ) : null}

        {turn.kind === "dna" ? (
          <DnaBlock
            summaryMd={turn.summaryMd}
            bestFit={turn.bestFit}
            visibility={visibility}
            live={live}
            handlers={handlers}
          />
        ) : null}

        {turn.kind === "handoff" ? (
          <HandoffBlock thin={turn.thin} onComplete={handlers.onComplete} />
        ) : null}

        {record.status === "answered" && record.answer !== undefined ? (
          <AnsweredEcho value={record.answer} />
        ) : null}
      </div>
    </div>
  );
}

function ParseSteps({ shown, all }: { shown: string[]; all: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
      {all.map((step, i) => {
        const done = i < shown.length;
        return (
          <div
            key={step}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontSize: 12,
              color: done ? "var(--text-2)" : "var(--text-3)",
              opacity: done ? 1 : 0.4,
              transition: "opacity .3s var(--ease)"
            }}
          >
            <span style={{ color: done ? "var(--risk-good)" : "var(--text-3)", fontWeight: 700, width: 12 }}>
              {done ? "✓" : "○"}
            </span>
            {step}
          </div>
        );
      })}
    </div>
  );
}

/**
 * The whole parse in one reviewable card. Confirming is one tap; correcting any single line is
 * an inline edit that never interrupts the flow.
 */
function ConfirmBlock({
  facts,
  live,
  onAnswer,
  onEditFact
}: {
  facts: Fact[];
  live: boolean;
  onAnswer: (value: AnswerValue) => void;
  onEditFact: (factId: string, value: string) => void;
}) {
  if (facts.length === 0) return null;

  return (
    <div style={{ marginTop: 12, maxWidth: 520 }}>
      <div
        style={{
          borderRadius: "var(--r)",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          overflow: "hidden"
        }}
      >
        {facts.map((fact, i) => (
          <ConfirmRow
            key={fact.id}
            fact={fact}
            live={live}
            first={i === 0}
            onEditFact={onEditFact}
          />
        ))}
      </div>
      {live ? (
        <>
          <AnswerControls control={{ kind: "confirm" }} onAnswer={onAnswer} />
          <p style={{ fontSize: 10.5, color: "var(--text-3)", margin: "8px 0 0" }}>
            Click any value to correct it — no need to answer one at a time.
          </p>
        </>
      ) : null}
    </div>
  );
}

function ConfirmRow({
  fact,
  live,
  first,
  onEditFact
}: {
  fact: Fact;
  live: boolean;
  first: boolean;
  onEditFact: (factId: string, value: string) => void;
}) {
  const display = formatValue(fact.value, fact.unit);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "132px minmax(0,1fr)",
        gap: 12,
        alignItems: "baseline",
        padding: "10px 13px",
        borderTop: first ? "none" : "1px solid var(--border)"
      }}
    >
      <div className="kicker" style={{ fontSize: 8.5 }}>
        {fact.label}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          contentEditable={live}
          suppressContentEditableWarning
          role={live ? "textbox" : undefined}
          tabIndex={live ? 0 : undefined}
          aria-label={live ? `${fact.label} — edit` : undefined}
          title={live ? "Click to correct" : undefined}
          onBlur={(e) => {
            const next = e.currentTarget.innerText.trim();
            if (next && next !== display) onEditFact(fact.id, next);
          }}
          style={{
            fontSize: 12.5,
            color: "var(--text)",
            lineHeight: 1.5,
            cursor: live ? "text" : "default",
            padding: "2px 5px",
            margin: "-2px -5px",
            borderRadius: 6,
            border: "1px solid transparent",
            outline: "none"
          }}
        >
          {display}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 3, lineHeight: 1.45 }}>
          {fact.edited ? (
            <span style={{ color: "var(--risk-good)", fontWeight: 600 }}>edited by you</span>
          ) : fact.evidence ? (
            <span style={{ fontStyle: "italic" }}>&ldquo;{fact.evidence}&rdquo;</span>
          ) : (
            <span style={{ color: "var(--risk-warn)", fontWeight: 600 }}>
              inferred — I didn&rsquo;t read this directly
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const DIMENSION_LABELS: Record<DimensionId, string> = {
  identity: "identity",
  experience: "experience",
  skills: "skills",
  preferences: "preferences",
  dna: "Career DNA"
};

function DnaBlock({
  summaryMd,
  bestFit,
  visibility,
  live,
  handlers
}: {
  summaryMd: string;
  bestFit: Array<{ role: string; level: string }>;
  visibility: DnaVisibility;
  live: boolean;
  handlers: ConversationHandlers;
}) {
  const levelColor = (level: string) =>
    level === "Strong" ? "var(--risk-good)" : level === "Good" ? "var(--accent)" : "var(--text-3)";

  return (
    <div style={{ marginTop: 12, maxWidth: 520 }}>
      <div
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          padding: 16
        }}
      >
        <span
          style={{
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            fontFamily: "var(--font-mono)",
            color: "var(--accent)",
            background: "var(--accent-soft)",
            border: "1px solid var(--accent-line)",
            borderRadius: 99,
            padding: "3px 8px"
          }}
        >
          AI-generated · editable
        </span>
        <div
          contentEditable={live}
          suppressContentEditableWarning
          title={live ? "Click to edit — this is yours, not mine" : undefined}
          onBlur={(e) => handlers.onEditSummary(e.currentTarget.innerText)}
          style={{
            fontSize: 13,
            lineHeight: 1.65,
            color: "var(--text-2)",
            marginTop: 11,
            cursor: live ? "text" : "default",
            outline: "none"
          }}
        >
          {summaryMd}
        </div>

        <div className="kicker" style={{ fontSize: 8.5, marginTop: 16 }}>
          Best-fit directions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 8 }}>
          {bestFit.map((fit) => (
            <div key={fit.role} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5 }}>
              <span style={{ fontWeight: 600 }}>{fit.role}</span>
              <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: 11, color: levelColor(fit.level) }}>
                {fit.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      <VisibilityChoice visibility={visibility} live={live} onRequest={handlers.onRequestVisibility} />

      {live ? (
        <button
          type="button"
          onClick={() => handlers.onAnswer("yes")}
          style={{
            marginTop: 14,
            padding: "10px 18px",
            fontSize: 12.5,
            fontWeight: 700,
            background: "var(--accent)",
            color: "var(--accent-contrast)",
            border: "none",
            borderRadius: "var(--r-sm)",
            cursor: "pointer"
          }}
        >
          Looks right — continue
        </button>
      ) : null}
    </div>
  );
}

/**
 * Visibility defaults to private and stays there unless the candidate explicitly chooses
 * otherwise — onboarding must never publish as a side effect of finishing (spec §6.5).
 */
function VisibilityChoice({
  visibility,
  live,
  onRequest
}: {
  visibility: DnaVisibility;
  live: boolean;
  onRequest: (visibility: DnaVisibility) => void;
}) {
  const options: Array<{ id: DnaVisibility; label: string; detail: string }> = [
    { id: "private", label: "Private", detail: "Only you. Change any time." },
    { id: "employer", label: "Named employers", detail: "You pick who, per employer." },
    { id: "public", label: "Share link", detail: "Revocable link you control." }
  ];

  return (
    <div style={{ marginTop: 12 }}>
      <div className="kicker" style={{ fontSize: 8.5 }}>
        Who can see this
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8, marginTop: 8 }}>
        {options.map((option) => {
          const on = visibility === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={!live}
              aria-pressed={on}
              onClick={() => onRequest(option.id)}
              style={{
                textAlign: "left",
                padding: "10px 11px",
                borderRadius: 10,
                background: on ? "var(--accent-soft)" : "var(--surface)",
                border: `1px solid ${on ? "var(--accent-line)" : "var(--border)"}`,
                cursor: live ? "pointer" : "default"
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: on ? "var(--accent)" : "var(--text)" }}>
                {on ? "● " : "○ "}
                {option.label}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 3, lineHeight: 1.4 }}>
                {option.detail}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HandoffBlock({ thin, onComplete }: { thin: DimensionId[]; onComplete: () => void }) {
  return (
    <div style={{ marginTop: 12, maxWidth: 520 }}>
      {thin.length ? (
        <div
          style={{
            padding: "11px 13px",
            borderRadius: 10,
            background: "var(--risk-warn-bg)",
            border: "1px solid var(--border)",
            fontSize: 12,
            lineHeight: 1.55,
            color: "var(--text-2)"
          }}
        >
          Still thin: {thin.map((id) => DIMENSION_LABELS[id]).join(", ")}. Your matches will improve
          when you fill these in — I&rsquo;ll nudge you from the workspace.
        </div>
      ) : (
        <div
          style={{
            padding: "11px 13px",
            borderRadius: 10,
            background: "var(--risk-good-bg)",
            border: "1px solid var(--border)",
            fontSize: 12,
            color: "var(--risk-good)",
            fontWeight: 600
          }}
        >
          Full signal captured. Nothing left to ask.
        </div>
      )}
      <button
        type="button"
        onClick={onComplete}
        style={{
          marginTop: 12,
          padding: "11px 20px",
          fontSize: 13,
          fontWeight: 700,
          background: "var(--accent)",
          color: "var(--accent-contrast)",
          border: "none",
          borderRadius: "var(--r-sm)",
          boxShadow: "0 6px 18px var(--accent-glow)",
          cursor: "pointer"
        }}
      >
        Enter CareerOS →
      </button>
    </div>
  );
}

function AnsweredEcho({ value }: { value: AnswerValue }) {
  const display = value === "yes" ? "Confirmed" : formatValue(value);

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
      <div
        className="anim-pop"
        style={{
          maxWidth: "80%",
          padding: "8px 12px",
          borderRadius: 12,
          borderTopRightRadius: 4,
          background: "var(--accent)",
          color: "var(--accent-contrast)",
          fontSize: 12.5,
          lineHeight: 1.45,
          fontWeight: 600
        }}
      >
        {display}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div style={{ display: "flex", gap: 11 }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--accent)",
          color: "var(--accent-contrast)",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          flexShrink: 0
        }}
        aria-hidden="true"
      >
        ✦
      </span>
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          borderTopLeftRadius: 4,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          display: "flex",
          gap: 5,
          alignItems: "center"
        }}
      >
        {[0, 0.15, 0.3].map((delay) => (
          <span
            key={delay}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              animation: `dot-bounce 1.2s ${delay}s infinite`
            }}
          />
        ))}
      </div>
    </div>
  );
}
