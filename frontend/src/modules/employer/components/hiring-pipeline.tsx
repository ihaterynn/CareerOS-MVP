"use client";

import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleCheck,
  FileSearch,
  Lightbulb,
  MessageSquareText,
  Scale,
  Sparkles,
  Target,
  UserCheck,
  WandSparkles
} from "lucide-react";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  generateInterviewKit,
  type RoleTalentBoard,
  type TalentMatch
} from "../employer-data";
import type { HiringPipelineDataSource } from "../hiring-pipeline-db";

type Stage = "match" | "shortlist" | "interview" | "decision";

type Props = {
  initialRoles: RoleTalentBoard[];
  dataSource: HiringPipelineDataSource;
};

const stages: Array<{ id: Stage; label: string }> = [
  { id: "match", label: "Discover" },
  { id: "shortlist", label: "Shortlisted" },
  { id: "interview", label: "Interviewing" },
  { id: "decision", label: "Decision" }
];

export function HiringPipeline({ initialRoles, dataSource }: Props) {
  const [stage, setStage] = useState<Stage>("match");
  const [roleId, setRoleId] = useState(initialRoles[0].id);
  const [candidateId, setCandidateId] = useState(initialRoles[0].applicants[0].id);
  const [shortlisted, setShortlisted] = useState<Set<string>>(
    () => new Set(initialRoles.map((role) => role.applicants[0].id))
  );
  const [compared, setCompared] = useState<Set<string>>(new Set());

  const role = initialRoles.find((item) => item.id === roleId) ?? initialRoles[0];
  const candidates = role.applicants;
  const candidate = candidates.find((item) => item.id === candidateId) ?? candidates[0];
  const shortlist = candidates.filter((item) => shortlisted.has(item.id));

  function chooseRole(nextRoleId: string) {
    const nextRole = initialRoles.find((item) => item.id === nextRoleId) ?? initialRoles[0];
    setRoleId(nextRole.id);
    setCandidateId(nextRole.applicants[0].id);
    setCompared(new Set());
    setStage("match");
  }

  function toggleShortlist(id: string) {
    setShortlisted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCompare(id: string) {
    setCompared((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  }

  function prepareInterview(id: string) {
    setShortlisted((current) => new Set(current).add(id));
    setCandidateId(id);
    setStage("interview");
  }

  const stageCounts: Record<Stage, number> = {
    match: candidates.length,
    shortlist: shortlist.length,
    interview: stage === "interview" || stage === "decision" ? 1 : 0,
    decision: stage === "decision" ? 1 : 0
  };

  return (
    <div className="hp">
      <CommandBar
        roles={initialRoles}
        role={role}
        candidates={candidates}
        shortlistCount={shortlist.length}
        dataSource={dataSource}
        onRoleChange={chooseRole}
      />

      <PipelineStatus
        active={stage}
        counts={stageCounts}
        onChange={setStage}
      />

      <main key={`${role.id}-${stage}`} className="hp-content hp-enter">
        {stage === "match" ? (
          <MatchStage
            role={role}
            candidates={candidates}
            selected={candidate}
            shortlisted={shortlisted}
            compared={compared}
            onSelect={setCandidateId}
            onToggleShortlist={toggleShortlist}
            onToggleCompare={toggleCompare}
            onPrepareInterview={prepareInterview}
            onViewAnalysis={() => setStage("shortlist")}
          />
        ) : null}

        {stage === "shortlist" ? (
          <ShortlistStage
            candidates={shortlist}
            selected={candidate}
            onSelect={setCandidateId}
            onInterview={prepareInterview}
            onBack={() => setStage("match")}
          />
        ) : null}

        {stage === "interview" ? (
          <InterviewStage
            role={role}
            candidates={shortlist.length ? shortlist : candidates.slice(0, 1)}
            selected={candidate}
            onSelect={setCandidateId}
            onDecision={() => setStage("decision")}
          />
        ) : null}

        {stage === "decision" ? (
          <DecisionStage
            role={role}
            candidates={shortlist.length ? shortlist : candidates.slice(0, 1)}
            selected={candidate}
            onSelect={setCandidateId}
            onBack={() => setStage("interview")}
          />
        ) : null}
      </main>

      <style>{styles}</style>
    </div>
  );
}

function CommandBar({
  roles,
  role,
  candidates,
  shortlistCount,
  dataSource,
  onRoleChange
}: {
  roles: RoleTalentBoard[];
  role: RoleTalentBoard;
  candidates: TalentMatch[];
  shortlistCount: number;
  dataSource: HiringPipelineDataSource;
  onRoleChange: (id: string) => void;
}) {
  const shortage = Math.max(0, role.openings - shortlistCount);
  const risk = shortage > 0 ? "High" : "On track";

  return (
    <header className="hp-command">
      <div className="hp-command-context">
        <div className="hp-command-label">
          <BriefcaseBusiness size={15} aria-hidden="true" />
          Hiring pipeline
          <span className={dataSource === "supabase" ? "is-live" : ""}>
            <i />
            {dataSource === "supabase" ? "Live data" : "Demo data"}
          </span>
        </div>

        <div className="hp-role-line">
          <div>
            <h1>{role.title}</h1>
            <p>{role.openings} openings <b>·</b> {role.location} <b>·</b> {role.team}</p>
          </div>
          <label className="hp-role-select">
            <span className="sr-only">Change hiring role</span>
            <select value={role.id} onChange={(event) => onRoleChange(event.target.value)}>
              {roles.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </label>
        </div>

        <div className="hp-role-signals" aria-label="Priority role signals">
          {role.roleSignals.slice(0, 4).map((signal) => <span key={signal}>{signal}</span>)}
        </div>
      </div>

      <div className="hp-search-brief">
        <div className="hp-risk">
          <span>Hiring risk</span>
          <strong data-risk={risk === "High" ? "high" : "good"}>
            <i /> {risk}
          </strong>
          <p>
            {shortage
              ? `Only ${shortlistCount} shortlisted for ${role.openings} openings. Review ${shortage + 1} more candidates.`
              : "Shortlist coverage meets the current hiring target."}
          </p>
        </div>
        <div className="hp-command-metrics">
          <Metric value={candidates.length} label="Matched" />
          <Metric value={`${candidates[0].score}%`} label="Best fit" />
          <Metric value={shortlistCount} label="Shortlisted" />
        </div>
      </div>
    </header>
  );
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return <div><strong>{value}</strong><span>{label}</span></div>;
}

function PipelineStatus({
  active,
  counts,
  onChange
}: {
  active: Stage;
  counts: Record<Stage, number>;
  onChange: (stage: Stage) => void;
}) {
  const activeIndex = stages.findIndex((item) => item.id === active);

  return (
    <nav className="hp-pipeline" aria-label="Hiring workflow">
      {stages.map((item, index) => {
        const isActive = item.id === active;
        const isDone = index < activeIndex;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => onChange(item.id)}
              className={`${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span>{isDone ? <Check size={13} /> : counts[item.id]}</span>
              {item.label}
            </button>
            {index < stages.length - 1 ? <ArrowRight size={13} aria-hidden="true" /> : null}
          </div>
        );
      })}
    </nav>
  );
}

function MatchStage({
  role,
  candidates,
  selected,
  shortlisted,
  compared,
  onSelect,
  onToggleShortlist,
  onToggleCompare,
  onPrepareInterview,
  onViewAnalysis
}: {
  role: RoleTalentBoard;
  candidates: TalentMatch[];
  selected: TalentMatch;
  shortlisted: Set<string>;
  compared: Set<string>;
  onSelect: (id: string) => void;
  onToggleShortlist: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onPrepareInterview: (id: string) => void;
  onViewAnalysis: () => void;
}) {
  return (
    <div className="hp-match-layout">
      <section className="hp-ranking">
        <div className="hp-section-head">
          <div>
            <span>Candidate ranking</span>
            <h2>{candidates.length} matches for {role.title}</h2>
          </div>
          <p>{compared.size ? `${compared.size} selected to compare` : "Select up to 3 to compare"}</p>
        </div>

        <div className="hp-table-head" aria-hidden="true">
          <span>Candidate</span>
          <span>Evidence summary</span>
          <span>Match</span>
          <span>Action</span>
        </div>

        <div className="hp-rank-list">
          {candidates.map((item, index) => {
            const isSelected = selected.id === item.id;
            const isShortlisted = shortlisted.has(item.id);
            return (
              <article
                key={item.id}
                className={isSelected ? "is-selected" : ""}
                style={{ "--delay": `${Math.min(index, 10) * 35}ms` } as CSSProperties}
              >
                <button
                  type="button"
                  className="hp-candidate"
                  onClick={() => onSelect(item.id)}
                  aria-label={`Review ${item.name}`}
                >
                  <span className="hp-rank">{String(index + 1).padStart(2, "0")}</span>
                  <Avatar candidate={item} />
                  <span className="hp-person">
                    <strong>{item.name}</strong>
                    <small>{item.currentTrack} · {item.location}</small>
                    {isSelected ? <em>Selected</em> : null}
                  </span>
                </button>

                <button
                  type="button"
                  className="hp-evidence"
                  onClick={() => onSelect(item.id)}
                  aria-label={`View evidence for ${item.name}`}
                >
                  <span><b>Strong</b> {item.highlights.slice(0, 2).join(" · ")}</span>
                  <span className="is-gap"><b>Gap</b> {item.missingSignals[0] ?? "No material gap"}</span>
                </button>

                <button
                  type="button"
                  className="hp-match-score"
                  onClick={() => onSelect(item.id)}
                  aria-label={`${item.score} percent match for ${item.name}`}
                >
                  <strong>{item.score}</strong><span>%</span><small>Match</small>
                </button>

                <div className="hp-row-actions">
                  <button
                    type="button"
                    className={isShortlisted ? "is-on" : ""}
                    onClick={() => onToggleShortlist(item.id)}
                    aria-pressed={isShortlisted}
                  >
                    {isShortlisted ? <Check size={13} /> : <UserCheck size={13} />}
                    {isShortlisted ? "Shortlisted" : "Shortlist"}
                  </button>
                  <button
                    type="button"
                    className={compared.has(item.id) ? "is-compare-on" : ""}
                    onClick={() => onToggleCompare(item.id)}
                    aria-pressed={compared.has(item.id)}
                    disabled={!compared.has(item.id) && compared.size >= 3}
                  >
                    <Scale size={13} />
                    Compare
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <CandidateSummary
        candidate={selected}
        shortlisted={shortlisted.has(selected.id)}
        compared={compared.has(selected.id)}
        onToggleShortlist={() => onToggleShortlist(selected.id)}
        onToggleCompare={() => onToggleCompare(selected.id)}
        onPrepareInterview={() => onPrepareInterview(selected.id)}
        onViewAnalysis={onViewAnalysis}
      />
    </div>
  );
}

function CandidateSummary({
  candidate,
  shortlisted,
  compared,
  onToggleShortlist,
  onToggleCompare,
  onPrepareInterview,
  onViewAnalysis
}: {
  candidate: TalentMatch;
  shortlisted: boolean;
  compared: boolean;
  onToggleShortlist: () => void;
  onToggleCompare: () => void;
  onPrepareInterview: () => void;
  onViewAnalysis: () => void;
}) {
  return (
    <aside className="hp-summary">
      <div className="hp-summary-head">
        <Avatar candidate={candidate} large />
        <div>
          <span><BadgeCheck size={13} /> Verified profile</span>
          <h2>{candidate.name}</h2>
          <p>{candidate.currentTrack} · {candidate.sourceField}</p>
        </div>
        <div className="hp-summary-score">
          <strong>{candidate.score}</strong><span>% match</span>
        </div>
      </div>

      <div className="hp-summary-body">
        <div className="hp-ai-label"><Sparkles size={14} /> AI-assisted match analysis</div>
        <h3>Why this candidate</h3>
        <ul className="hp-reasons">
          {candidate.highlights.slice(0, 3).map((item) => (
            <li key={item}><CircleCheck size={14} /> <span>{item}</span></li>
          ))}
        </ul>

        <div className="hp-validate">
          <Target size={15} />
          <div><span>Validate next</span><p>{candidate.missingSignals[0] ?? "No material evidence gap"}</p></div>
        </div>

        <button type="button" className="hp-analysis-link" onClick={onViewAnalysis}>
          View full analysis <ArrowRight size={13} />
        </button>
      </div>

      <div className="hp-summary-actions">
        <button type="button" className="hp-primary" onClick={onPrepareInterview}>
          <WandSparkles size={15} /> Prepare interview
        </button>
        <button
          type="button"
          className={`hp-secondary ${shortlisted ? "is-on" : ""}`}
          onClick={onToggleShortlist}
        >
          {shortlisted ? <Check size={14} /> : <UserCheck size={14} />}
          {shortlisted ? "Shortlisted" : "Shortlist"}
        </button>
        <button
          type="button"
          className={`hp-secondary ${compared ? "is-on" : ""}`}
          onClick={onToggleCompare}
        >
          <Scale size={14} /> {compared ? "Comparing" : "Compare"}
        </button>
      </div>
    </aside>
  );
}

function ShortlistStage({
  candidates,
  selected,
  onSelect,
  onInterview,
  onBack
}: {
  candidates: TalentMatch[];
  selected: TalentMatch;
  onSelect: (id: string) => void;
  onInterview: (id: string) => void;
  onBack: () => void;
}) {
  if (!candidates.length) return <EmptyState onAction={onBack} />;
  const profile = candidates.find((item) => item.id === selected.id) ?? candidates[0];

  return (
    <div className="hp-workspace-layout">
      <aside className="hp-side-list">
        <div className="hp-section-head">
          <div><span>Shortlist</span><h2>{candidates.length} profiles</h2></div>
        </div>
        <div className="hp-side-list-items">
          {candidates.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={profile.id === item.id ? "is-selected" : ""}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Avatar candidate={item} />
              <span><strong>{item.name}</strong><small>{item.score}% match</small></span>
              <ArrowRight size={13} />
            </button>
          ))}
        </div>
        <button type="button" className="hp-text-action" onClick={onBack}>Edit shortlist</button>
      </aside>

      <section className="hp-profile">
        <div className="hp-profile-head">
          <div>
            <span><BadgeCheck size={14} /> Shortlisted profile</span>
            <h2>{profile.name}</h2>
            <p>{profile.summary}</p>
          </div>
          <div><strong>{profile.score}</strong><span>% role fit</span></div>
        </div>

        <div className="hp-profile-grid">
          <ProfilePanel icon={<FileSearch size={15} />} label="Experience" tone="blue" items={profile.experience} />
          <ProfilePanel icon={<Sparkles size={15} />} label="Career DNA" tone="purple" items={profile.dnaSignals} />
          <ProfilePanel icon={<Lightbulb size={15} />} label="Proof of work" tone="green" items={[...profile.portfolio, ...profile.certifications]} />
          <div className="hp-readiness">
            <span>Interview readiness</span>
            <strong>{Math.round((profile.skillFit + profile.experienceFit + profile.interestSignal) / 3)}%</strong>
            <p>{profile.missingSignals.length} evidence gaps to validate.</p>
            <button type="button" className="hp-primary" onClick={() => onInterview(profile.id)}>
              Prepare interview <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function InterviewStage({
  role,
  candidates,
  selected,
  onSelect,
  onDecision
}: {
  role: RoleTalentBoard;
  candidates: TalentMatch[];
  selected: TalentMatch;
  onSelect: (id: string) => void;
  onDecision: () => void;
}) {
  const candidate = candidates.find((item) => item.id === selected.id) ?? candidates[0];
  const kit = useMemo(() => generateInterviewKit(candidate, role.title), [candidate, role.title]);
  const [activeCategory, setActiveCategory] = useState<"role" | "personality" | "culture">("role");
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const category = kit.categories.find((item) => item.id === activeCategory) ?? kit.categories[0];

  function generate() {
    setGenerating(true);
    setGenerated(false);
    window.setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 650);
  }

  return (
    <div className="hp-interview-layout">
      <aside className="hp-interview-control">
        <div className="hp-ai-label"><WandSparkles size={14} /> Interview studio</div>
        <h2>Questions grounded in candidate evidence.</h2>
        <label>
          Candidate
          <div>
            <select
              value={candidate.id}
              onChange={(event) => {
                onSelect(event.target.value);
                setGenerated(false);
              }}
            >
              {candidates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </div>
        </label>
        <div className="hp-category-tabs">
          {kit.categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveCategory(item.id)}
              className={activeCategory === item.id ? "is-active" : ""}
            >
              <span>{item.id === "personality" ? "Working style" : item.label}</span>
              <i>{item.questions.length}</i>
            </button>
          ))}
        </div>
        <button type="button" className="hp-generate" onClick={generate}>
          <WandSparkles size={16} />
          {generated ? "Regenerate kit" : "Generate interview kit"}
        </button>
      </aside>

      <section className="hp-question-workspace">
        {!generated || generating ? (
          <div className="hp-generation-state">
            <div className={generating ? "is-generating" : ""}><WandSparkles size={25} /></div>
            <h3>{generating ? "Building the interview…" : "Ready to generate."}</h3>
            <p>{generating ? "Reading resume, Career DNA and role gaps." : `Create focused questions for ${candidate.name}.`}</p>
          </div>
        ) : (
          <>
            <div className="hp-question-head">
              <div><span>{category.label}</span><h2>{candidate.name.split(" ")[0]} × {role.title}</h2></div>
              <button type="button" className="hp-secondary" onClick={onDecision}>
                Decision brief <ArrowRight size={14} />
              </button>
            </div>
            <div className="hp-question-list">
              {category.questions.map((question, index) => (
                <article key={question.prompt} style={{ "--delay": `${index * 65}ms` } as CSSProperties}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{question.prompt}</h3>
                    <p><MessageSquareText size={13} /> Listen for: {question.lookFor}</p>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function DecisionStage({
  role,
  candidates,
  selected,
  onSelect,
  onBack
}: {
  role: RoleTalentBoard;
  candidates: TalentMatch[];
  selected: TalentMatch;
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  const candidate = candidates.find((item) => item.id === selected.id) ?? candidates[0];

  return (
    <div className="hp-decision-layout">
      <section className="hp-decision-main">
        <div className="hp-section-head">
          <div><span>Decision room</span><h2>{role.title}</h2></div>
          <div className="hp-decision-candidates">
            {candidates.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={candidate.id === item.id ? "is-selected" : ""}
                aria-label={`Review decision evidence for ${item.name}`}
              >
                {item.avatar}
              </button>
            ))}
          </div>
        </div>

        <div className="hp-decision-person">
          <Avatar candidate={candidate} large />
          <div><h2>{candidate.name}</h2><p>{candidate.currentTrack} · {candidate.location}</p></div>
          <strong>{candidate.score}<span>% match</span></strong>
        </div>

        <div className="hp-score-grid">
          <DecisionScore label="Skills" value={candidate.skillFit} tone="blue" />
          <DecisionScore label="Experience" value={candidate.experienceFit} tone="blue" />
          <DecisionScore label="Education" value={candidate.educationFit} tone="neutral" />
          <DecisionScore label="Intent" value={candidate.interestSignal} tone="green" />
        </div>

        <div className="hp-decision-evidence">
          <ProfilePanel icon={<CircleCheck size={15} />} label="Evidence for progression" tone="green" items={candidate.highlights} />
          <ProfilePanel icon={<Target size={15} />} label="Open questions" tone="amber" items={candidate.missingSignals} />
        </div>
      </section>

      <aside className="hp-checklist">
        <span><BadgeCheck size={14} /> Panel handoff</span>
        <h2>Complete the evidence trail.</h2>
        <div>
          {["Role capability scored", "Working-style evidence", "Culture contribution", "Feedback reason"].map((item, index) => (
            <label key={item}>
              <input type="checkbox" defaultChecked={index < 2} />
              <span><i>{index + 1}</i>{item}</span>
            </label>
          ))}
        </div>
        <button type="button" className="hp-primary">Complete review <Check size={14} /></button>
        <button type="button" className="hp-text-action" onClick={onBack}>Back to interview</button>
      </aside>
    </div>
  );
}

function Avatar({ candidate, large = false }: { candidate: TalentMatch; large?: boolean }) {
  return <span className={`hp-avatar ${large ? "is-large" : ""}`}>{candidate.avatar}</span>;
}

function ProfilePanel({
  icon,
  label,
  tone,
  items
}: {
  icon: ReactNode;
  label: string;
  tone: string;
  items: string[];
}) {
  return (
    <article className="hp-profile-panel" data-tone={tone}>
      <div><span>{icon}</span><strong>{label}</strong></div>
      <ul>{items.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
    </article>
  );
}

function DecisionScore({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <article className="hp-decision-score" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}<i>%</i></strong>
      <div><i style={{ width: `${value}%` }} /></div>
    </article>
  );
}

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <section className="hp-empty">
      <UserCheck size={25} />
      <h2>No one shortlisted yet.</h2>
      <p>Choose candidates from the ranked match pool.</p>
      <button type="button" className="hp-primary" onClick={onAction}>Review candidates</button>
    </section>
  );
}

const styles = `
  .hp {
    --ink: #16213a;
    --muted: #5f6b7d;
    --subtle: #8791a1;
    --line: #dce3ec;
    --line-strong: #c9d3e1;
    --paper: #fff;
    --surface: #f7f9fc;
    --blue: #2457d6;
    --blue-soft: #edf3ff;
    --green: #087d68;
    --green-soft: #eaf8f4;
    --amber: #a4510d;
    --amber-soft: #fff6e9;
    --purple: #6d4cc4;
    width: 100%;
    color: var(--ink);
  }
  .hp *, .hp *::before, .hp *::after { box-sizing: border-box; }
  .hp button, .hp select { font: inherit; }
  .hp button { cursor: pointer; }
  .hp button:focus-visible, .hp select:focus-visible { outline: 3px solid rgba(36,87,214,.22); outline-offset: 2px; }
  .hp .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

  .hp-command {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(380px, .75fr);
    min-height: 174px;
    overflow: hidden;
    border: 1px solid #bfcceb;
    border-radius: 16px;
    background: linear-gradient(120deg, #f8fbff 0%, #eef3ff 58%, #f7f5ff 100%);
    box-shadow: 0 8px 24px rgba(42,58,92,.07);
  }
  .hp-command-context { padding: 22px 26px; }
  .hp-command-label { display: flex; align-items: center; gap: 7px; color: #3c4b66; font-size: 12px; font-weight: 750; }
  .hp-command-label > span { display: inline-flex; align-items: center; gap: 6px; margin-left: 5px; border-left: 1px solid #c9d3e1; padding-left: 12px; color: #6d7787; font-size: 11px; font-weight: 650; }
  .hp-command-label > span.is-live { color: var(--green); }
  .hp-command-label > span i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .hp-role-line { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-top: 13px; }
  .hp-role-line h1 { margin: 0; color: var(--ink); font-family: var(--font-sans); font-size: clamp(25px, 2.4vw, 34px); font-weight: 760; line-height: 1.08; letter-spacing: -.045em; }
  .hp-role-line p { margin: 6px 0 0; color: var(--muted); font-size: 12px; }
  .hp-role-line p b { margin: 0 4px; color: #a5afbd; }
  .hp-role-select { position: relative; flex: 0 0 auto; }
  .hp-role-select select { max-width: 210px; appearance: none; border: 1px solid var(--line-strong); border-radius: 8px; padding: 9px 34px 9px 11px; color: #34415a; background: rgba(255,255,255,.82); font-size: 11px; font-weight: 700; }
  .hp-role-select svg { position: absolute; top: 50%; right: 10px; transform: translateY(-50%); pointer-events: none; color: #687386; }
  .hp-role-signals { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 15px; }
  .hp-role-signals span { border-radius: 6px; padding: 5px 8px; color: #42506a; background: rgba(255,255,255,.76); font-size: 10px; font-weight: 650; }

  .hp-search-brief { display: grid; grid-template-columns: minmax(180px, 1fr) 132px; gap: 16px; border-left: 1px solid #cbd6eb; padding: 21px 24px; background: rgba(255,255,255,.48); }
  .hp-risk > span { color: #667188; font-size: 11px; font-weight: 700; }
  .hp-risk > strong { display: flex; align-items: center; gap: 6px; margin-top: 7px; color: var(--amber); font-size: 16px; }
  .hp-risk > strong[data-risk="good"] { color: var(--green); }
  .hp-risk > strong i { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
  .hp-risk p { max-width: 270px; margin: 8px 0 0; color: #56637a; font-size: 11px; line-height: 1.48; }
  .hp-command-metrics { display: grid; align-content: center; }
  .hp-command-metrics > div { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; border-bottom: 1px solid #d7dfeb; padding: 7px 0; }
  .hp-command-metrics > div:last-child { border-bottom: 0; }
  .hp-command-metrics strong { color: var(--ink); font-size: 17px; letter-spacing: -.03em; }
  .hp-command-metrics span { color: #707b8e; font-size: 10px; }

  .hp-pipeline {
    display: flex;
    align-items: center;
    width: max-content;
    max-width: 100%;
    margin: 12px 0 0;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 4px;
    background: #fff;
  }
  .hp-pipeline > div { display: flex; align-items: center; color: #a6afbc; }
  .hp-pipeline button { display: inline-flex; align-items: center; gap: 7px; border: 0; border-radius: 7px; padding: 8px 12px; color: #697487; background: transparent; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .hp-pipeline button > span { display: grid; min-width: 21px; height: 21px; padding: 0 5px; place-items: center; border-radius: 6px; color: #697487; background: #edf0f5; font-size: 10px; }
  .hp-pipeline button:hover { background: #f6f8fb; color: var(--ink); }
  .hp-pipeline button.is-active { color: #173f9f; background: var(--blue-soft); }
  .hp-pipeline button.is-active > span { color: #fff; background: var(--blue); }
  .hp-pipeline button.is-done { color: var(--green); }
  .hp-pipeline button.is-done > span { color: var(--green); background: var(--green-soft); }

  .hp-content { padding-top: 12px; }
  .hp-match-layout { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(300px, .62fr); gap: 14px; align-items: start; }
  .hp-ranking, .hp-summary, .hp-side-list, .hp-profile, .hp-interview-control, .hp-question-workspace, .hp-decision-main, .hp-checklist, .hp-empty {
    border: 1px solid var(--line);
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 5px 18px rgba(42,58,92,.045);
  }
  .hp-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding: 16px 18px 13px; }
  .hp-section-head > div > span { color: #667188; font-size: 11px; font-weight: 700; }
  .hp-section-head h2 { margin: 4px 0 0; color: var(--ink); font-family: var(--font-sans); font-size: 17px; font-weight: 750; letter-spacing: -.025em; }
  .hp-section-head > p { margin: 0; color: #727d8f; font-size: 10px; }
  .hp-table-head { display: grid; grid-template-columns: minmax(260px, 1.05fr) minmax(220px, .95fr) 68px 116px; gap: 12px; border-block: 1px solid var(--line); padding: 9px 14px; color: #657084; background: #f8fafc; font-size: 10px; font-weight: 700; }
  .hp-rank-list article {
    position: relative;
    display: grid;
    grid-template-columns: minmax(260px, 1.05fr) minmax(220px, .95fr) 68px 116px;
    align-items: center;
    gap: 12px;
    min-height: 94px;
    border-bottom: 1px solid var(--line);
    padding: 12px 14px;
    animation: hp-row-in .35s var(--delay) both;
    transition: background .18s ease;
  }
  .hp-rank-list article:last-child { border-bottom: 0; }
  .hp-rank-list article:hover { background: #fafbfe; }
  .hp-rank-list article.is-selected { background: #eef4ff; box-shadow: inset 4px 0 0 var(--blue); }
  .hp-candidate { display: grid; grid-template-columns: 22px 40px minmax(0,1fr); align-items: center; gap: 10px; min-width: 0; border: 0; padding: 0; color: inherit; background: transparent; text-align: left; }
  .hp-rank { color: #8a94a4; font-family: var(--font-mono); font-size: 10px; font-weight: 750; }
  .hp-avatar { display: grid; width: 40px; height: 40px; place-items: center; border-radius: 10px; color: #fff; background: #315fbf; font-size: 11px; font-weight: 800; }
  .hp-avatar.is-large { width: 48px; height: 48px; border-radius: 12px; font-size: 13px; }
  .hp-person { position: relative; min-width: 0; }
  .hp-person > strong { display: block; overflow: hidden; color: var(--ink); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
  .hp-person > small { display: block; margin-top: 4px; overflow: hidden; color: #687487; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
  .hp-person > em { display: inline-block; margin-top: 6px; border-radius: 5px; padding: 3px 6px; color: #1746ac; background: #dce9ff; font-size: 9px; font-style: normal; font-weight: 750; }
  .hp-evidence { display: grid; gap: 6px; min-width: 0; border: 0; padding: 0; color: inherit; background: transparent; text-align: left; }
  .hp-evidence span { overflow: hidden; color: #526075; font-size: 10px; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
  .hp-evidence b { margin-right: 4px; color: var(--green); font-size: 9px; }
  .hp-evidence .is-gap b { color: var(--amber); }
  .hp-match-score { border: 0; padding: 0; color: inherit; background: transparent; text-align: center; }
  .hp-match-score strong { color: var(--ink); font-size: 21px; letter-spacing: -.05em; }
  .hp-match-score > span { color: #6e7889; font-size: 10px; }
  .hp-match-score small { display: block; color: #707b8c; font-size: 9px; }
  .hp-row-actions { display: grid; gap: 5px; }
  .hp-row-actions button { display: flex; align-items: center; justify-content: center; gap: 5px; min-height: 29px; border: 1px solid var(--line-strong); border-radius: 7px; padding: 5px 7px; color: #536075; background: #fff; font-size: 9px; font-weight: 700; }
  .hp-row-actions button:hover { border-color: #9eb4e9; color: #1746ac; }
  .hp-row-actions button.is-on { border-color: #9ed5ca; color: var(--green); background: var(--green-soft); }
  .hp-row-actions button.is-compare-on { border-color: #b8c8ef; color: var(--blue); background: var(--blue-soft); }
  .hp-row-actions button:disabled { cursor: not-allowed; opacity: .45; }

  .hp-summary { position: sticky; top: 76px; align-self: start; overflow: hidden; }
  .hp-summary-head { display: grid; grid-template-columns: 48px minmax(0,1fr) 62px; align-items: center; gap: 11px; border-bottom: 1px solid var(--line); padding: 16px; background: #f6f9ff; }
  .hp-summary-head > div:nth-child(2) { min-width: 0; }
  .hp-summary-head > div:nth-child(2) > span { display: flex; align-items: center; gap: 5px; color: var(--green); font-size: 9px; font-weight: 700; }
  .hp-summary-head h2 { overflow: hidden; margin: 5px 0 0; color: var(--ink); font-family: var(--font-sans); font-size: 18px; font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
  .hp-summary-head p { overflow: hidden; margin: 3px 0 0; color: #687487; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
  .hp-summary-score { border-left: 1px solid var(--line); padding-left: 12px; text-align: center; }
  .hp-summary-score strong { display: block; color: var(--blue); font-size: 22px; letter-spacing: -.05em; }
  .hp-summary-score span { display: block; margin-top: 2px; color: #6d788a; font-size: 8px; }
  .hp-summary-body { padding: 16px; }
  .hp-ai-label { display: flex; align-items: center; gap: 6px; color: var(--purple); font-size: 10px; font-weight: 700; }
  .hp-summary-body h3 { margin: 12px 0 0; color: var(--ink); font-family: var(--font-sans); font-size: 14px; font-weight: 750; }
  .hp-reasons { display: grid; gap: 9px; margin: 11px 0 0; padding: 0; list-style: none; }
  .hp-reasons li { display: flex; align-items: flex-start; gap: 7px; color: #47556a; font-size: 11px; line-height: 1.4; }
  .hp-reasons li svg { flex: 0 0 auto; margin-top: 1px; color: var(--green); }
  .hp-validate { display: flex; align-items: flex-start; gap: 9px; margin-top: 14px; border-left: 3px solid #e7a34e; padding: 9px 11px; background: var(--amber-soft); }
  .hp-validate > svg { flex: 0 0 auto; color: var(--amber); }
  .hp-validate span { color: var(--amber); font-size: 9px; font-weight: 750; }
  .hp-validate p { margin: 4px 0 0; color: #70411f; font-size: 10px; line-height: 1.4; }
  .hp-analysis-link { display: flex; align-items: center; gap: 6px; border: 0; margin-top: 13px; padding: 0; color: var(--blue); background: transparent; font-size: 10px; font-weight: 750; }
  .hp-summary-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; border-top: 1px solid var(--line); padding: 12px 16px 16px; }
  .hp-summary-actions .hp-primary { grid-column: 1 / -1; }
  .hp-primary, .hp-secondary, .hp-generate {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 36px;
    border-radius: 8px;
    padding: 8px 11px;
    font-size: 10px;
    font-weight: 750;
    transition: background .18s ease, border-color .18s ease, transform .18s ease;
  }
  .hp-primary { border: 1px solid var(--blue); color: #fff; background: var(--blue); }
  .hp-primary:hover { background: #1947bb; transform: translateY(-1px); }
  .hp-secondary { border: 1px solid var(--line-strong); color: #455268; background: #fff; }
  .hp-secondary:hover { border-color: #9eb4e9; color: #1746ac; }
  .hp-secondary.is-on { border-color: #9ed5ca; color: var(--green); background: var(--green-soft); }

  .hp-workspace-layout { display: grid; grid-template-columns: 240px minmax(0,1fr); gap: 14px; }
  .hp-side-list { align-self: start; padding-bottom: 12px; }
  .hp-side-list-items { display: grid; gap: 4px; padding: 0 8px; }
  .hp-side-list-items button { display: grid; grid-template-columns: 20px 36px minmax(0,1fr) 14px; align-items: center; gap: 8px; border: 1px solid transparent; border-radius: 9px; padding: 8px; color: inherit; background: transparent; text-align: left; }
  .hp-side-list-items button:hover, .hp-side-list-items button.is-selected { border-color: #bfd0f3; background: var(--blue-soft); }
  .hp-side-list-items button > span:first-child { color: #7f8999; font-family: var(--font-mono); font-size: 9px; }
  .hp-side-list-items .hp-avatar { width: 36px; height: 36px; border-radius: 9px; }
  .hp-side-list-items button > span:nth-child(3) { min-width: 0; }
  .hp-side-list-items strong, .hp-side-list-items small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hp-side-list-items strong { font-size: 10px; }
  .hp-side-list-items small { margin-top: 3px; color: #697487; font-size: 9px; }
  .hp-text-action { display: block; border: 0; margin: 9px auto 0; padding: 7px; color: #5d6879; background: transparent; font-size: 10px; font-weight: 700; }
  .hp-profile { overflow: hidden; }
  .hp-profile-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; border-bottom: 1px solid var(--line); padding: 22px; background: #f6f9ff; }
  .hp-profile-head > div:first-child > span { display: flex; align-items: center; gap: 6px; color: var(--green); font-size: 10px; font-weight: 700; }
  .hp-profile-head h2 { margin: 8px 0 0; font-size: 23px; letter-spacing: -.035em; }
  .hp-profile-head p { max-width: 680px; margin: 7px 0 0; color: #57647a; font-size: 11px; line-height: 1.55; }
  .hp-profile-head > div:last-child { min-width: 78px; border-left: 1px solid var(--line); padding-left: 18px; text-align: center; }
  .hp-profile-head > div:last-child strong { display: block; color: var(--blue); font-size: 25px; }
  .hp-profile-head > div:last-child span { color: #697487; font-size: 9px; }
  .hp-profile-grid { display: grid; grid-template-columns: 1fr 1fr .75fr; gap: 10px; padding: 15px; }
  .hp-profile-panel { border-top: 3px solid var(--panel-color); padding: 13px; background: var(--panel-bg); }
  .hp-profile-panel[data-tone="blue"] { --panel-color: var(--blue); --panel-bg: #f4f7fd; }
  .hp-profile-panel[data-tone="purple"] { --panel-color: var(--purple); --panel-bg: #f7f5fb; }
  .hp-profile-panel[data-tone="green"] { --panel-color: var(--green); --panel-bg: #f1f8f6; }
  .hp-profile-panel[data-tone="amber"] { --panel-color: var(--amber); --panel-bg: #fff8ee; }
  .hp-profile-panel > div { display: flex; align-items: center; gap: 7px; color: var(--panel-color); }
  .hp-profile-panel > div span { display: grid; width: 26px; height: 26px; place-items: center; }
  .hp-profile-panel > div strong { font-size: 10px; }
  .hp-profile-panel ul { display: grid; gap: 6px; margin: 11px 0 0; padding: 0; list-style: none; }
  .hp-profile-panel li { color: #4c596d; font-size: 10px; line-height: 1.42; }
  .hp-profile-panel li::before { content: "•"; margin-right: 6px; color: var(--panel-color); }
  .hp-readiness { grid-row: span 2; display: flex; flex-direction: column; justify-content: center; border-left: 1px solid var(--line); padding: 16px; }
  .hp-readiness > span { color: #667188; font-size: 10px; font-weight: 700; }
  .hp-readiness > strong { margin-top: 6px; color: var(--blue); font-size: 32px; letter-spacing: -.05em; }
  .hp-readiness p { margin: 4px 0 13px; color: #697487; font-size: 10px; }

  .hp-interview-layout { display: grid; grid-template-columns: 270px minmax(0,1fr); gap: 14px; }
  .hp-interview-control { padding: 19px; background: #f8f7fc; }
  .hp-interview-control h2 { margin: 10px 0 0; font-size: 20px; line-height: 1.18; letter-spacing: -.03em; }
  .hp-interview-control > label { display: block; margin-top: 21px; color: #647084; font-size: 10px; font-weight: 700; }
  .hp-interview-control > label > div { position: relative; margin-top: 6px; }
  .hp-interview-control select { width: 100%; appearance: none; border: 1px solid var(--line-strong); border-radius: 8px; padding: 9px 32px 9px 10px; color: var(--ink); background: #fff; font-size: 10px; font-weight: 700; }
  .hp-interview-control label svg { position: absolute; top: 50%; right: 10px; transform: translateY(-50%); }
  .hp-category-tabs { display: grid; gap: 5px; margin-top: 13px; }
  .hp-category-tabs button { display: flex; align-items: center; justify-content: space-between; border: 1px solid transparent; border-radius: 8px; padding: 9px 10px; color: #59667a; background: transparent; font-size: 10px; }
  .hp-category-tabs button i { display: grid; width: 21px; height: 21px; place-items: center; border-radius: 6px; background: #e9e6f2; font-size: 9px; font-style: normal; }
  .hp-category-tabs button:hover, .hp-category-tabs button.is-active { border-color: #cfc5e8; color: #5e3eae; background: #f0ecf9; }
  .hp-generate { width: 100%; border: 1px solid var(--purple); margin-top: 15px; color: #fff; background: var(--purple); }
  .hp-question-workspace { min-height: 470px; padding: 20px; }
  .hp-generation-state { display: grid; min-height: 425px; place-items: center; align-content: center; text-align: center; }
  .hp-generation-state > div { display: grid; width: 58px; height: 58px; place-items: center; border-radius: 14px; color: var(--purple); background: #eeeaf8; }
  .hp-generation-state > div.is-generating { animation: hp-breathe 1.3s ease-in-out infinite; }
  .hp-generation-state h3 { margin: 19px 0 0; font-size: 17px; }
  .hp-generation-state p { margin: 6px 0 0; color: #697487; font-size: 11px; }
  .hp-question-head { display: flex; align-items: center; justify-content: space-between; gap: 15px; }
  .hp-question-head span { color: var(--purple); font-size: 10px; font-weight: 700; }
  .hp-question-head h2 { margin: 4px 0 0; font-size: 19px; letter-spacing: -.025em; }
  .hp-question-list { display: grid; gap: 9px; margin-top: 17px; }
  .hp-question-list article { display: grid; grid-template-columns: 34px minmax(0,1fr); gap: 11px; border: 1px solid var(--line); border-radius: 10px; padding: 14px; background: #fff; animation: hp-row-in .35s var(--delay) both; }
  .hp-question-list article > span { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 8px; color: #fff; background: var(--purple); font-family: var(--font-mono); font-size: 9px; font-weight: 750; }
  .hp-question-list h3 { font-size: 11px; line-height: 1.5; }
  .hp-question-list p { display: flex; align-items: flex-start; gap: 6px; margin: 7px 0 0; color: #697487; font-size: 10px; line-height: 1.45; }
  .hp-question-list p svg { flex: 0 0 auto; color: var(--purple); }

  .hp-decision-layout { display: grid; grid-template-columns: minmax(0,1fr) 285px; gap: 14px; }
  .hp-decision-main { padding-bottom: 17px; }
  .hp-decision-candidates { display: flex; }
  .hp-decision-candidates button { display: grid; width: 30px; height: 30px; margin-left: -5px; place-items: center; border: 2px solid #fff; border-radius: 50%; color: #fff; background: #66758c; font-size: 8px; font-weight: 800; }
  .hp-decision-candidates button.is-selected { z-index: 1; background: var(--blue); box-shadow: 0 0 0 2px #c9d8f8; }
  .hp-decision-person { display: flex; align-items: center; gap: 12px; margin: 0 18px; border: 1px solid #cad6eb; border-radius: 11px; padding: 14px; background: #f6f9ff; }
  .hp-decision-person > div { flex: 1; min-width: 0; }
  .hp-decision-person h2 { overflow: hidden; font-size: 18px; text-overflow: ellipsis; white-space: nowrap; }
  .hp-decision-person p { margin: 4px 0 0; color: #697487; font-size: 10px; }
  .hp-decision-person > strong { color: var(--blue); font-size: 25px; }
  .hp-decision-person > strong span { display: block; color: #697487; font-size: 8px; font-weight: 600; }
  .hp-score-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin: 12px 18px 0; }
  .hp-decision-score { border-top: 3px solid var(--score-color); padding: 11px; background: var(--score-bg); }
  .hp-decision-score[data-tone="blue"] { --score-color: var(--blue); --score-bg: #f1f5fd; }
  .hp-decision-score[data-tone="green"] { --score-color: var(--green); --score-bg: #f0f8f6; }
  .hp-decision-score[data-tone="neutral"] { --score-color: #68758a; --score-bg: #f5f7fa; }
  .hp-decision-score > span { color: #617087; font-size: 9px; font-weight: 700; }
  .hp-decision-score > strong { display: block; margin-top: 4px; color: var(--score-color); font-size: 22px; }
  .hp-decision-score > strong i { font-size: 9px; font-style: normal; }
  .hp-decision-score > div { height: 4px; margin-top: 7px; overflow: hidden; background: rgba(255,255,255,.8); }
  .hp-decision-score > div i { display: block; height: 100%; background: var(--score-color); }
  .hp-decision-evidence { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin: 12px 18px 0; }
  .hp-checklist { align-self: start; padding: 19px; }
  .hp-checklist > span { display: flex; align-items: center; gap: 6px; color: var(--blue); font-size: 10px; font-weight: 700; }
  .hp-checklist h2 { margin: 9px 0 0; font-size: 19px; line-height: 1.2; }
  .hp-checklist > div { display: grid; gap: 6px; margin-top: 16px; }
  .hp-checklist label { display: block; }
  .hp-checklist input { position: absolute; opacity: 0; pointer-events: none; }
  .hp-checklist label > span { display: grid; grid-template-columns: 25px 1fr; align-items: center; gap: 8px; border: 1px solid var(--line); border-radius: 8px; padding: 8px; color: #5c687b; background: #f8fafc; font-size: 10px; font-weight: 650; }
  .hp-checklist label > span i { display: grid; width: 23px; height: 23px; place-items: center; border-radius: 6px; color: #778295; background: #e8edf4; font-size: 8px; font-style: normal; }
  .hp-checklist input:checked + span { border-color: #a5d8ce; color: var(--green); background: var(--green-soft); }
  .hp-checklist input:checked + span i { color: #fff; background: var(--green); }
  .hp-checklist > .hp-primary { width: 100%; margin-top: 14px; }
  .hp-empty { display: grid; min-height: 330px; place-items: center; align-content: center; text-align: center; }
  .hp-empty > svg { color: var(--blue); }
  .hp-empty h2 { margin: 12px 0 0; font-size: 19px; }
  .hp-empty p { margin: 5px 0 14px; color: #697487; font-size: 11px; }

  .hp-enter { animation: hp-enter .3s ease both; }
  @keyframes hp-enter { from { opacity: 0; transform: translateY(6px); } }
  @keyframes hp-row-in { from { opacity: 0; transform: translateY(5px); } }
  @keyframes hp-breathe { 50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(109,76,196,.08); } }

  @media (max-width: 1240px) {
    .hp-command { grid-template-columns: 1fr; }
    .hp-search-brief { grid-template-columns: 1fr 1fr; border-top: 1px solid #cbd6eb; border-left: 0; padding-block: 14px; }
    .hp-risk p { max-width: 520px; }
    .hp-command-metrics { grid-template-columns: repeat(3,1fr); gap: 18px; }
    .hp-command-metrics > div { display: grid; justify-content: start; border-right: 1px solid #d7dfeb; border-bottom: 0; padding: 0 18px 0 0; }
    .hp-command-metrics > div:last-child { border-right: 0; }
    .hp-match-layout, .hp-decision-layout { grid-template-columns: 1fr; }
    .hp-summary { position: static; }
  }
  @media (max-width: 860px) {
    .hp-role-line { align-items: flex-start; }
    .hp-table-head { display: none; }
    .hp-rank-list article { grid-template-columns: minmax(230px,1fr) 68px 116px; }
    .hp-evidence { grid-column: 1 / -1; grid-row: 2; border-top: 1px solid var(--line); padding-top: 8px; }
    .hp-workspace-layout, .hp-interview-layout { grid-template-columns: 1fr; }
    .hp-side-list-items { grid-template-columns: repeat(3,minmax(190px,1fr)); overflow-x: auto; padding-bottom: 5px; }
    .hp-profile-grid { grid-template-columns: 1fr 1fr; }
    .hp-readiness { grid-row: auto; border-left: 0; border-top: 1px solid var(--line); }
  }
  @media (max-width: 620px) {
    .hp-command { border-radius: 13px; }
    .hp-command-context { padding: 18px; }
    .hp-role-line { display: grid; gap: 13px; }
    .hp-role-select select { max-width: 100%; width: 100%; }
    .hp-search-brief { grid-template-columns: 1fr; padding: 16px 18px; }
    .hp-command-metrics { gap: 10px; }
    .hp-pipeline { width: 100%; overflow-x: auto; }
    .hp-pipeline > div > svg { display: none; }
    .hp-pipeline button { padding: 8px 9px; }
    .hp-rank-list article { grid-template-columns: minmax(0,1fr) 56px; padding: 12px; }
    .hp-match-score { grid-column: 2; grid-row: 1; }
    .hp-row-actions { grid-column: 1 / -1; grid-template-columns: 1fr 1fr; }
    .hp-evidence { grid-column: 1 / -1; grid-row: auto; }
    .hp-section-head { align-items: flex-start; }
    .hp-section-head > p { display: none; }
    .hp-summary-head { grid-template-columns: 44px minmax(0,1fr) 58px; }
    .hp-summary-actions { grid-template-columns: 1fr; }
    .hp-summary-actions .hp-primary { grid-column: auto; }
    .hp-profile-head { display: grid; }
    .hp-profile-head > div:last-child { border-left: 0; padding-left: 0; text-align: left; }
    .hp-profile-grid, .hp-score-grid, .hp-decision-evidence { grid-template-columns: 1fr; }
    .hp-question-head { align-items: flex-start; }
  }
  @media (prefers-reduced-motion: reduce) {
    .hp *, .hp *::before, .hp *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
  }
`;
