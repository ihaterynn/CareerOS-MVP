"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  canHandOff as canHandOffFor,
  computeCoverage,
  formatValue,
  selectNextGap,
  thinDimensions
} from "../engine";
import {
  completeOnboarding,
  confirmFacts,
  editFact as editFactAction,
  saveTranscript,
  setDnaVisibility,
  skipOnboarding,
  submitAnswer
} from "../actions";
import type {
  AnswerValue,
  DnaStreamEvent,
  DnaVisibility,
  Fact,
  GapTurn,
  IntakeSourceKind,
  OnboardingData,
  ParseStreamEvent,
  Turn,
  TurnRecord
} from "../types";
import { Conversation, type ConversationHandlers } from "./conversation";
import { IntakeDropzone } from "./intake-dropzone";
import { ProfileRail } from "./profile-rail";
import { Toast } from "../../tracker/components/toast";

const AGENT_PAUSE = 550;

/**
 * Client orchestrator. Turn selection stays in the pure engine; everything that persists goes
 * through server actions or the streaming route handlers. The client never holds a candidate id
 * or a service key — the server resolves identity from the session.
 */
export function OnboardingPanel({ data }: { data: OnboardingData }) {
  const router = useRouter();
  const [records, setRecords] = useState<TurnRecord[]>(data.session.history);
  const [facts, setFacts] = useState<Fact[]>(data.session.facts);
  const [visibility, setVisibility] = useState<DnaVisibility>(data.session.visibility);
  const [thinking, setThinking] = useState(false);
  const [streamingSteps, setStreamingSteps] = useState<string[]>([]);
  const [pendingVisibility, setPendingVisibility] = useState<DnaVisibility | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dnaDraft, setDnaDraft] = useState<{ summaryMd: string; bestFit: Array<{ role: string; level: string }> } | null>(
    null
  );
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const coverage = useMemo(() => computeCoverage(facts), [facts]);
  const canHandOff = canHandOffFor(facts);
  const name = facts.find((f) => f.key === "identity.name")?.value;
  const role = facts.find((f) => f.key === "identity.role")?.value;

  const push = useCallback((turn: Turn) => {
    setRecords((prev) => (prev.some((r) => r.turn.id === turn.id) ? prev : [...prev, { turn, status: "pending" }]));
  }, []);

  const settle = useCallback((answer: AnswerValue) => {
    setRecords((prev) =>
      prev.map((record, i) => (i === prev.length - 1 ? { ...record, status: "answered", answer } : record))
    );
  }, []);

  // Persist the transcript so a candidate resumes mid-conversation instead of restarting.
  useEffect(() => {
    if (records.length <= 1) return;
    const id = setTimeout(() => {
      void saveTranscript(records);
    }, 900);
    return () => clearTimeout(id);
  }, [records]);

  /** Applies a server patch: the server's ledger is authoritative, not local state. */
  const applyPatch = useCallback((patch: { facts: Fact[] }) => {
    setFacts(patch.facts);
    return patch.facts;
  }, []);

  const advance = useCallback(
    (nextFacts: Fact[], askedIds: Set<string>) => {
      setThinking(true);
      later(() => {
        setThinking(false);

        const unconfirmed = nextFacts.filter(
          (fact) => fact.source === "parsed" || fact.source === "inferred"
        );
        const dnaPending = unconfirmed.filter((fact) => fact.key !== "dna.summary");

        if (dnaPending.length && !askedIds.has("turn-confirm-parse")) {
          push({
            id: "turn-confirm-parse",
            kind: "confirm",
            factIds: dnaPending.map((fact) => fact.id),
            say: `Here's what I read. ${dnaPending.length} things — correct any that are wrong, then we'll move on.`,
            control: { kind: "confirm" }
          });
          return;
        }

        const gap = selectNextGap(nextFacts, data.gapBank, askedIds);
        if (gap) {
          push(gap);
          return;
        }

        if (!askedIds.has("turn-dna")) {
          void requestDna();
          return;
        }

        push({
          id: "turn-handoff",
          kind: "handoff",
          say: "That's your profile. Tracker, DNA, and Resume Studio are all wired to it now.",
          thin: thinDimensions(nextFacts)
        });
      }, AGENT_PAUSE);
    },
    // requestDna is stable enough for this flow; declared below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.gapBank, later, push]
  );

  const askedIdsWith = (extra?: string) => {
    const ids = new Set(records.map((r) => r.turn.id));
    if (extra) ids.add(extra);
    return ids;
  };

  /** Reads an NDJSON stream frame by frame. */
  async function readStream<T>(response: Response, onEvent: (event: T) => void) {
    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          onEvent(JSON.parse(line) as T);
        } catch {
          // Skip a malformed frame rather than aborting the whole stream.
        }
      }
    }
  }

  const start = async (kind: IntakeSourceKind, payload?: string, file?: File) => {
    if (busy) return;
    settle(sourceLabel(kind, payload));

    if (kind === "conversation") {
      advance([], askedIdsWith());
      return;
    }

    setBusy(true);
    push({ id: "turn-parsing", kind: "parsing", say: "Reading it now.", steps: [] });
    setStreamingSteps([]);

    try {
      const response = file
        ? await fetch("/api/candidate/onboarding/parse", { method: "POST", body: toFormData(file) })
        : await fetch("/api/candidate/onboarding/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sourceKind: kind, payload })
          });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Parse failed (${response.status})`);
      }

      let parsed: Fact[] = [];
      await readStream<ParseStreamEvent>(response, (event) => {
        if (event.type === "step") {
          setStreamingSteps((prev) => [...prev, event.text]);
          setRecords((prev) =>
            prev.map((record) =>
              record.turn.id === "turn-parsing" && record.turn.kind === "parsing"
                ? { ...record, turn: { ...record.turn, steps: [...record.turn.steps, event.text] } }
                : record
            )
          );
        } else if (event.type === "facts") {
          parsed = event.facts;
        } else if (event.type === "error") {
          throw new Error(event.message);
        }
      });

      setFacts(parsed);
      setRecords((prev) =>
        prev.map((record) => (record.turn.id === "turn-parsing" ? { ...record, status: "answered" } : record))
      );
      advance(parsed, askedIdsWith("turn-parsing"));
    } catch (error) {
      setRecords((prev) => prev.filter((record) => record.turn.id !== "turn-parsing"));
      setToast(errorText(error));
    } finally {
      setBusy(false);
    }
  };

  async function requestDna() {
    setThinking(true);
    try {
      const response = await fetch("/api/candidate/onboarding/dna", { method: "POST" });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Couldn't draft your DNA (${response.status})`);
      }

      let draft: { summaryMd: string; bestFit: Array<{ role: string; level: string }> } | null = null;
      await readStream<DnaStreamEvent>(response, (event) => {
        if (event.type === "done") draft = { summaryMd: event.summaryMd, bestFit: event.bestFit };
        else if (event.type === "error") throw new Error(event.message);
      });

      if (!draft) throw new Error("No summary came back");
      const resolved = draft as { summaryMd: string; bestFit: Array<{ role: string; level: string }> };
      setDnaDraft(resolved);
      setFacts((prev) =>
        prev.some((f) => f.key === "dna.summary")
          ? prev
          : [
              ...prev,
              {
                id: "fact-dna.summary",
                dimension: "dna",
                key: "dna.summary",
                label: "DNA summary",
                value: resolved.summaryMd,
                source: "inferred",
                confidence: 0.8
              }
            ]
      );
      push({
        id: "turn-dna",
        kind: "dna",
        say: "Here's your Career DNA, drafted from what you confirmed. Edit anything that doesn't sound like you.",
        summaryMd: resolved.summaryMd,
        bestFit: resolved.bestFit
      });
    } catch (error) {
      setToast(errorText(error));
    } finally {
      setThinking(false);
    }
  }

  const handleAnswer = async (value: AnswerValue) => {
    const current = records[records.length - 1];
    if (!current || current.status !== "pending" || busy) return;
    const { turn } = current;

    if (turn.kind === "confirm") {
      if (value === "no") {
        setToast("Click any value in the card to correct it.");
        return;
      }
      setBusy(true);
      const result = await confirmFacts({ factIds: turn.factIds });
      setBusy(false);
      if (!result.ok) {
        setToast(result.error);
        return;
      }
      const next = applyPatch(result.data);
      settle(`Confirmed ${turn.factIds.length} details`);
      advance(next, askedIdsWith());
      return;
    }

    if (turn.kind === "dna") {
      setBusy(true);
      const [visibilityResult, confirmResult] = await Promise.all([
        setDnaVisibility({ visibility }),
        confirmFacts({ factIds: facts.filter((f) => f.key === "dna.summary").map((f) => f.id) })
      ]);
      setBusy(false);
      if (!visibilityResult.ok) {
        setToast(visibilityResult.error);
        return;
      }
      const next = applyPatch(confirmResult.ok ? confirmResult.data : visibilityResult.data);
      settle(visibility === "private" ? "Keep it private" : `Shared: ${visibility}`);
      advance(next, askedIdsWith());
      return;
    }

    if (turn.kind === "gap") {
      const gap = turn as GapTurn;
      setBusy(true);
      const result = await submitAnswer({ turnId: gap.id, value });
      setBusy(false);
      if (!result.ok) {
        setToast(result.error);
        return;
      }
      const next = applyPatch(result.data);
      const written = next.find((fact) => fact.key === gap.writes);
      settle(written ? formatValue(written.value, written.unit) : formatValue(value));
      advance(next, askedIdsWith());
    }
  };

  const handleEditFact = async (factId: string, value: string) => {
    const result = await editFactAction({ factId, value });
    if (!result.ok) {
      setToast(result.error);
      return;
    }
    applyPatch(result.data);
    setToast("Updated — thanks for the correction.");
  };

  const handleEditSummary = async (summaryMd: string) => {
    const summary = facts.find((fact) => fact.key === "dna.summary");
    if (!summary || summaryMd.trim() === String(summary.value).trim()) return;
    const result = await editFactAction({ factId: summary.id, value: summaryMd });
    if (result.ok) applyPatch(result.data);
  };

  /** Leaving private always goes through an explicit confirmation (spec §6.5). */
  const handleRequestVisibility = (next: DnaVisibility) => {
    if (next === visibility) return;
    if (next === "private") {
      setVisibility("private");
      setToast("DNA is private.");
      return;
    }
    setPendingVisibility(next);
  };

  const commitVisibility = (next: DnaVisibility) => {
    setVisibility(next);
    setPendingVisibility(null);
    // Persisted when the candidate continues past the DNA turn, so the ledger records the
    // visibility actually in effect rather than every intermediate toggle.
    setToast(`Sharing set to ${next}.`);
  };

  const complete = async () => {
    setBusy(true);
    const result = await completeOnboarding();
    setBusy(false);
    if (!result.ok) {
      setToast(result.error);
      return;
    }
    router.push("/candidate/tracker");
  };

  const skip = async () => {
    setBusy(true);
    const result = await skipOnboarding();
    setBusy(false);
    if (!result.ok) {
      setToast(result.error);
      return;
    }
    router.push("/candidate/tracker");
  };

  const handlers: ConversationHandlers = {
    onAnswer: (value) => void handleAnswer(value),
    onEditFact: (factId, value) => void handleEditFact(factId, value),
    onEditSummary: (summary) => void handleEditSummary(summary),
    onRequestVisibility: handleRequestVisibility,
    onComplete: () => void complete()
  };

  const started = records.length > 1 || records[0]?.status === "answered";
  void dnaDraft;

  return (
    <div className="onboarding-grid">
      <div style={{ minWidth: 0 }}>
        <div style={{ marginBottom: 22 }}>
          <div className="kicker" style={{ color: "var(--accent)" }}>
            Welcome to CareerOS
          </div>
          <h1 className="ser" style={{ fontSize: 27, margin: "6px 0 0" }}>
            Let&rsquo;s build your Career DNA
          </h1>
          <p style={{ fontSize: 12.5, color: "var(--text-2)", margin: "6px 0 0" }}>
            One pass. I read what you give me and only ask for what&rsquo;s missing.
          </p>
        </div>

        <Conversation
          records={records}
          thinking={thinking}
          streamingSteps={streamingSteps}
          facts={facts}
          visibility={visibility}
          handlers={handlers}
        />

        {!started ? (
          <div style={{ marginTop: 18, marginLeft: 39 }}>
            <IntakeDropzone
              busy={busy}
              onStart={(kind, payload, file) => void start(kind, payload, file)}
            />
          </div>
        ) : null}
      </div>

      <ProfileRail
        coverage={coverage}
        facts={facts}
        name={typeof name === "string" ? name : null}
        role={typeof role === "string" ? role : null}
        canHandOff={canHandOff}
        onHandOff={() => void skip()}
      />

      {pendingVisibility ? (
        <VisibilityDialog
          target={pendingVisibility}
          onCancel={() => setPendingVisibility(null)}
          onConfirm={() => commitVisibility(pendingVisibility)}
        />
      ) : null}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function toFormData(file: File): FormData {
  const form = new FormData();
  form.set("file", file);
  return form;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

function sourceLabel(kind: IntakeSourceKind, payload?: string): string {
  if (kind === "resume") return `Uploaded ${payload ?? "résumé"}`;
  if (kind === "linkedin") return payload ?? "LinkedIn profile";
  if (kind === "paste") return "Pasted résumé text";
  return "Let's just talk";
}

function VisibilityDialog({
  target,
  onCancel,
  onConfirm
}: {
  target: DnaVisibility;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const headingId = "visibility-dialog-title";
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const copy =
    target === "employer"
      ? "Employers you name will be able to read your DNA summary. You choose them one by one, and you can revoke access at any time."
      : "This creates an unguessable link. Anyone holding it can read your DNA summary until you revoke the link.";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,15,29,.42)",
        display: "grid",
        placeItems: "center",
        zIndex: 60,
        padding: 20
      }}
      onClick={onCancel}
    >
      <div
        className="anim-pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 420,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          boxShadow: "var(--shadow-lg)",
          padding: 22
        }}
      >
        <h2 id={headingId} className="ser" style={{ fontSize: 19, margin: 0 }}>
          Leave private?
        </h2>
        <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--text-2)", margin: "10px 0 0" }}>{copy}</p>
        <div style={{ display: "flex", gap: 9, marginTop: 18 }}>
          <button
            ref={ref}
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: 10,
              fontSize: 12.5,
              fontWeight: 600,
              background: "var(--surface-2)",
              border: "1px solid var(--border-2)",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Stay private
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: 10,
              fontSize: 12.5,
              fontWeight: 700,
              background: "var(--accent)",
              color: "var(--accent-contrast)",
              border: "none",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            {target === "employer" ? "Choose employers" : "Create link"}
          </button>
        </div>
      </div>
    </div>
  );
}
