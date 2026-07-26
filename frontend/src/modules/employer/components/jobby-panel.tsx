"use client";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Copy,
  ListFilter,
  LoaderCircle,
  MessageSquareText,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UsersRound
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { JobbyBootstrap, JobbyCandidate, JobbyScope } from "../jobby-db";
import { EmployerPageHeader } from "./employer-ui";
import { jobbyStyles } from "./jobby-polish";

type SourceCard = Pick<
  JobbyCandidate,
  "id" | "name" | "initials" | "currentRole" | "source" | "status" | "score"
>;

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
  sources?: SourceCard[];
  followUps?: string[];
};

type ChatResponse = {
  answer?: string;
  error?: string;
  sources?: SourceCard[];
  followUps?: string[];
  scope?: JobbyScope;
};

const quickPrompts = [
  { icon: UsersRound, label: "Rank this pipeline", prompt: "Rank the strongest candidates in this role-scoped pipeline and explain why." },
  { icon: ListFilter, label: "Surface evidence gaps", prompt: "Show the biggest repeated evidence gaps across this role's pipeline." },
  { icon: UserCheck, label: "Prepare interviews", prompt: "Prepare interview priorities for the strongest visible candidate." }
];

function welcome(scope: JobbyScope | null): Message {
  return {
    id: `welcome-${scope?.job.id ?? "empty"}`,
    role: "assistant",
    text: scope
      ? `Ready for ${scope.job.title}\n\nI can work with ${scope.candidates.length} candidates currently connected to this role: ${scope.appliedCount} applied, ${scope.shortlistedCount} shortlisted, and ${scope.relevantCount} curated relevant matches.\n\nAsk me to compare evidence, surface gaps, prepare interviews, or draft outreach.`
      : "Choose an active job listing to open a role-scoped hiring conversation."
  };
}

function Metric({
  icon: MetricIcon,
  label,
  value,
  tone
}: {
  icon: typeof UsersRound;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="jobby-metric">
      <span className="jobby-metric-icon" style={{ "--metric-tone": tone } as React.CSSProperties}>
        <MetricIcon size={16} />
      </span>
      <span>
        <strong>{value}</strong>
        <small>{label}</small>
      </span>
    </div>
  );
}

function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="jobby-rich-text">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <span className="jobby-text-gap" key={`gap-${index}`} />;
        if (trimmed.startsWith("•")) return <p className="jobby-bullet" key={`${trimmed}-${index}`}>{trimmed}</p>;
        const looksLikeHeading =
          index === 0 &&
          trimmed.length < 90 &&
          !trimmed.endsWith(".") &&
          !trimmed.startsWith("1.");
        return looksLikeHeading
          ? <h4 key={`${trimmed}-${index}`}>{trimmed}</h4>
          : <p key={`${trimmed}-${index}`}>{trimmed}</p>;
      })}
    </div>
  );
}

function CandidateRow({
  candidate,
  onAsk
}: {
  candidate: JobbyCandidate;
  onAsk: (prompt: string) => void;
}) {
  const sourceClass = candidate.source.toLowerCase();
  return (
    <button
      type="button"
      className="jobby-candidate"
      onClick={() => onAsk(`Prepare interview priorities for ${candidate.name}.`)}
    >
      <span className="jobby-avatar">{candidate.initials}</span>
      <span className="jobby-candidate-copy">
        <span className="jobby-candidate-name">
          {candidate.name}
          <span className={`jobby-source ${sourceClass}`}>{candidate.source}</span>
        </span>
        <span className="jobby-candidate-role">{candidate.currentRole}</span>
        <span className="jobby-candidate-evidence">{candidate.highlights[0] ?? candidate.skills[0] ?? "Evidence on file"}</span>
      </span>
      <span className="jobby-score">
        {candidate.score}<small>%</small>
      </span>
    </button>
  );
}

export function JobbyPanel({ bootstrap }: { bootstrap: JobbyBootstrap }) {
  const [scope, setScope] = useState<JobbyScope | null>(bootstrap.initialScope);
  const [jobId, setJobId] = useState(bootstrap.initialScope?.job.id ?? bootstrap.roles[0]?.id ?? "");
  const [messages, setMessages] = useState<Message[]>([welcome(bootstrap.initialScope)]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [scopeBusy, setScopeBusy] = useState(false);
  const [error, setError] = useState(bootstrap.warning ?? "");
  const [copiedId, setCopiedId] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sortedCandidates = useMemo(
    () => [...(scope?.candidates ?? [])].sort((a, b) => b.score - a.score),
    [scope]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const chooseRole = async (nextJobId: string) => {
    if (!nextJobId || nextJobId === jobId) return;
    setJobId(nextJobId);
    setScopeBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/employer/jobby?jobId=${encodeURIComponent(nextJobId)}`);
      const payload = await response.json() as ChatResponse;
      if (!response.ok || !payload.scope) throw new Error(payload.error ?? "Unable to open this pipeline.");
      setScope(payload.scope);
      setMessages([welcome(payload.scope)]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to open this pipeline.");
    } finally {
      setScopeBusy(false);
    }
  };

  const submit = async (event?: FormEvent, promptOverride?: string) => {
    event?.preventDefault();
    const prompt = (promptOverride ?? draft).trim();
    if (!prompt || !jobId || busy) return;
    const userMessage: Message = { id: `user-${Date.now()}`, role: "user", text: prompt };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setDraft("");
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/employer/jobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          messages: conversation.map((message) => ({ role: message.role, content: message.text }))
        })
      });
      const payload = await response.json() as ChatResponse;
      if (!response.ok || !payload.answer) throw new Error(payload.error ?? "Jobby.ai could not complete that request.");
      if (payload.scope) setScope(payload.scope);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: payload.answer ?? "",
          sources: payload.sources,
          followUps: payload.followUps
        }
      ]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Jobby.ai could not complete that request.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const copyMessage = async (message: Message) => {
    await navigator.clipboard.writeText(message.text);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(""), 1500);
  };

  const reset = () => {
    setMessages([welcome(scope)]);
    setDraft("");
    setError("");
  };

  return (
    <div className="jobby-page">
      <EmployerPageHeader moduleId="jobby" />

      <section className="jobby-hero">
        <div className="jobby-orb orb-one" />
        <div className="jobby-orb orb-two" />
        <div className="jobby-hero-copy">
          <span className="jobby-eyebrow"><Sparkles size={14} /> Employer hiring copilot</span>
          <h1>Meet Jobby<span>.ai</span></h1>
          <p>Move from pipeline evidence to a confident next action—without leaving the role you are hiring for.</p>
          <div className="jobby-trust">
            <span><ShieldCheck size={14} /> Role-scoped retrieval</span>
            <span><BriefcaseBusiness size={14} /> Live hiring records</span>
            <span><Search size={14} /> No full-database search</span>
          </div>
        </div>

        <div className="jobby-role-control">
          <label htmlFor="jobby-role">Active role</label>
          <div className="jobby-select-wrap">
            <BriefcaseBusiness size={17} />
            <select
              id="jobby-role"
              value={jobId}
              onChange={(event) => void chooseRole(event.target.value)}
              disabled={scopeBusy || !bootstrap.roles.length}
            >
              {!bootstrap.roles.length ? <option value="">No active roles</option> : null}
              {bootstrap.roles.map((role) => (
                <option value={role.id} key={role.id}>{role.title}</option>
              ))}
            </select>
            {scopeBusy ? <LoaderCircle className="jobby-spin" size={16} /> : <ChevronDown size={16} />}
          </div>
          <p>{scope ? `${scope.job.location} · ${scope.job.mode}` : bootstrap.organization}</p>
        </div>
      </section>

      {scope ? (
        <section className="jobby-scope-strip">
          <div className="jobby-scope-title">
            <span className="jobby-live-dot" />
            <span><strong>Live role scope</strong><small>{scope.job.title}</small></span>
          </div>
          <Metric icon={UsersRound} label="Applied" value={scope.appliedCount} tone="#4f7bd9" />
          <Metric icon={UserCheck} label="Shortlisted" value={scope.shortlistedCount} tone="#20a477" />
          <Metric icon={Sparkles} label="Relevant" value={scope.relevantCount} tone="#a9802f" />
          <div className="jobby-scope-note"><ShieldCheck size={16} /> Only this role’s pipeline is queried</div>
        </section>
      ) : null}

      <section className="jobby-workspace">
        <div className="jobby-chat-card">
          <div className="jobby-chat-head">
            <div>
              <span className="jobby-bot-mark"><MessageSquareText size={18} /></span>
              <span><strong>Hiring conversation</strong><small>Evidence-aware · employer workspace</small></span>
            </div>
            <button type="button" onClick={reset} title="Clear conversation"><RotateCcw size={16} /> Reset</button>
          </div>

          <div className="jobby-messages" ref={scrollRef}>
            {messages.map((message) => (
              <article className={`jobby-message ${message.role}`} key={message.id}>
                {message.role === "assistant" ? <span className="jobby-message-mark"><Sparkles size={15} /></span> : null}
                <div className="jobby-bubble">
                  <RichText text={message.text} />
                  {message.sources?.length ? (
                    <div className="jobby-sources">
                      <span className="jobby-source-label">Pipeline evidence</span>
                      <div className="jobby-source-grid">
                        {message.sources.map((source) => (
                          <button
                            type="button"
                            key={source.id}
                            onClick={() => setDraft(`Compare ${source.name} with the next strongest candidate.`)}
                          >
                            <span className="jobby-source-avatar">{source.initials}</span>
                            <span><strong>{source.name}</strong><small>{source.source} · {source.status}</small></span>
                            <b>{source.score}%</b>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {message.role === "assistant" ? (
                    <button className="jobby-copy" type="button" onClick={() => void copyMessage(message)}>
                      {copiedId === message.id ? <Check size={13} /> : <Copy size={13} />}
                      {copiedId === message.id ? "Copied" : "Copy"}
                    </button>
                  ) : null}
                </div>
                {message.followUps?.length ? (
                  <div className="jobby-followups">
                    {message.followUps.map((followUp) => (
                      <button type="button" key={followUp} onClick={() => void submit(undefined, followUp)}>
                        {followUp}<ArrowUpRight size={13} />
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
            {busy ? (
              <article className="jobby-message assistant">
                <span className="jobby-message-mark"><Sparkles size={15} /></span>
                <div className="jobby-bubble jobby-thinking">
                  <span /><span /><span />
                  <small>Reading this role’s pipeline</small>
                </div>
              </article>
            ) : null}
          </div>

          <div className="jobby-quick-row">
            {quickPrompts.map((item) => {
              const PromptIcon = item.icon;
              return (
                <button type="button" key={item.label} onClick={() => void submit(undefined, item.prompt)} disabled={!scope || busy}>
                  <PromptIcon size={14} /> {item.label}
                </button>
              );
            })}
          </div>

          <form className="jobby-composer" onSubmit={(event) => void submit(event)}>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit();
                }
              }}
              placeholder={scope ? `Ask about ${scope.job.title} candidates…` : "Select an active role first"}
              rows={1}
              disabled={!scope || busy}
            />
            <button type="submit" disabled={!draft.trim() || !scope || busy} aria-label="Send message">
              {busy ? <LoaderCircle className="jobby-spin" size={18} /> : <Send size={18} />}
            </button>
          </form>
          <div className="jobby-composer-note">
            <ShieldCheck size={12} /> Candidate evidence stays inside CareerOS; the language service receives only a masked task request.
          </div>
          {error ? <div className="jobby-error">{error}</div> : null}
        </div>

        <aside className="jobby-context-card">
          <div className="jobby-context-head">
            <span><strong>Visible candidates</strong><small>{scope?.candidates.length ?? 0} in role scope</small></span>
            <span className="jobby-count">{scope?.candidates.length ?? 0}</span>
          </div>
          <div className="jobby-context-filter">
            <Search size={14} />
            <span>Ranked by current evidence</span>
          </div>
          <div className="jobby-candidate-list">
            {sortedCandidates.length ? sortedCandidates.map((candidate) => (
              <CandidateRow key={candidate.id} candidate={candidate} onAsk={setDraft} />
            )) : (
              <div className="jobby-empty">
                <UsersRound size={24} />
                <strong>No candidates in scope</strong>
                <p>Submitted and shortlisted profiles will appear here.</p>
              </div>
            )}
          </div>
          {scope?.job.requirements.length ? (
            <div className="jobby-requirements">
              <span className="kicker">Role evidence lens</span>
              <div>{scope.job.requirements.slice(0, 5).map((item) => <span key={item}>{item}</span>)}</div>
            </div>
          ) : null}
        </aside>
      </section>

      <style>{jobbyStyles}</style>
    </div>
  );
}
