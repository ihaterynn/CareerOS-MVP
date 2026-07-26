"use client";

import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleCheck,
  Compass,
  Gem,
  GitBranch,
  GraduationCap,
  Lightbulb,
  Network,
  Route,
  Scale,
  Sparkles,
  Target,
  UserCheck,
  Users,
  WandSparkles,
  X
} from "lucide-react";
import { useState, type CSSProperties } from "react";
import type {
  CareerRootBranchRecord,
  CareerRootCandidate,
  CareerRootDataSource,
  CareerRootRole,
  CareerRootRoute,
  CareerRootSkill
} from "../career-root-db";

type Lens = "traditional" | "root";
type DetailTab = "evidence" | "bridge";
type SortMode = "score" | "intent";

type Props = {
  initialRoles: CareerRootRole[];
  initialBranches: CareerRootBranchRecord[];
  dataSource: CareerRootDataSource;
};

const normalized = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9+#/.]+/g, " ").replace(/\s+/g, " ").trim();

function wordAffinity(left: string, right: string) {
  const a = new Set(normalized(left).split(/\s+/).filter((token) => token.length > 1));
  const b = new Set(normalized(right).split(/\s+/).filter((token) => token.length > 1));
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  return overlap / Math.max(a.size, b.size);
}

function branchHasCandidate(branch: CareerRootBranchRecord, candidate: CareerRootCandidate) {
  const signals = branch.matchSignals ?? [];
  if (signals.length) {
    const candidateSkills = candidate.skills.map((skill) => normalized(skill.split("·")[0]));
    const matchedSignals = signals.filter((signal) =>
      candidateSkills.some((skill) => skill === normalized(signal) || skill.includes(normalized(signal)))
    ).length;
    const titleFit = wordAffinity(candidate.currentTrack, branch.roleTitle ?? branch.field);
    const requiredMatches = branch.isPrimary
      ? Math.min(2, signals.length)
      : Math.max(1, Math.ceil(signals.length * 0.34));
    return titleFit >= (branch.isPrimary ? 0.55 : 0.4) || matchedSignals >= requiredMatches;
  }
  const source = candidate.sourceField.toLowerCase();
  return branch.sourceFields.some((field) => source.includes(field.toLowerCase()));
}

export function CareerRootWorkspace({
  initialRoles,
  initialBranches,
  dataSource
}: Props) {
  const [roleId, setRoleId] = useState(initialRoles[0].id);
  const [lens, setLens] = useState<Lens>("root");
  const [branchId, setBranchId] = useState(initialBranches[0].id);
  const [candidateId, setCandidateId] = useState(initialRoles[0].candidates[0].id);
  const [detailTab, setDetailTab] = useState<DetailTab>("evidence");
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [queued, setQueued] = useState<Set<string>>(
    () =>
      new Set(
        initialRoles.flatMap((role) =>
          role.candidates
            .filter((candidate) => candidate.reviewStatus === "Shortlisted")
            .map((candidate) => candidate.id)
        )
      )
  );
  const [compared, setCompared] = useState<Set<string>>(new Set());
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [assignedCourses, setAssignedCourses] = useState<Set<string>>(new Set());
  const [branchOverrides, setBranchOverrides] = useState<Record<string, CareerRootBranchRecord[]>>({});
  const [refreshingBranches, setRefreshingBranches] = useState(false);

  const role = initialRoles.find((item) => item.id === roleId) ?? initialRoles[0];
  const seededRoleBranches = initialBranches.filter((branch) => !branch.roleId || branch.roleId === role.id);
  const roleBranches = branchOverrides[role.id] ?? seededRoleBranches;
  const directBranch = roleBranches.find((branch) => branch.isPrimary) ?? roleBranches[0];
  const visibleBranches = lens === "traditional" ? [directBranch] : roleBranches;
  const allCandidateMap = new Map(
    roleBranches.map((branch) => [
      branch.id,
      role.candidates
        .filter((candidate) => branchHasCandidate(branch, candidate))
        .sort((a, b) =>
          sortMode === "intent" ? b.interestSignal - a.interestSignal : b.score - a.score
        )
    ])
  );
  const candidateMap = new Map(
    visibleBranches.map((branch) => [branch.id, allCandidateMap.get(branch.id) ?? []])
  );
  const visibleById = new Map<string, CareerRootCandidate>();
  for (const candidates of candidateMap.values()) {
    for (const candidate of candidates) visibleById.set(candidate.id, candidate);
  }
  const visibleCandidates = [...visibleById.values()].sort((a, b) =>
    sortMode === "intent" ? b.interestSignal - a.interestSignal : b.score - a.score
  );
  const activeBranch = visibleBranches.find((branch) => branch.id === branchId) ?? visibleBranches[0];
  const branchCandidates = candidateMap.get(activeBranch.id) ?? [];
  const selected =
    visibleCandidates.find((candidate) => candidate.id === candidateId) ??
    branchCandidates[0] ??
    visibleCandidates[0] ??
    role.candidates[0];
  const directIds = new Set((allCandidateMap.get(directBranch.id) ?? []).map((candidate) => candidate.id));
  const adjacentCandidates = roleBranches
    .filter((branch) => !branch.isPrimary)
    .flatMap((branch) => allCandidateMap.get(branch.id) ?? []);
  const hiddenGemMap = new Map(
    adjacentCandidates
      .filter((candidate) => !directIds.has(candidate.id))
      .map((candidate) => [candidate.id, candidate])
  );
  const hiddenGems = hiddenGemMap.size;
  const recommendedAdjacent = [...hiddenGemMap.values()].sort((a, b) => b.score - a.score)[0];
  const recommendedBranch = recommendedAdjacent
    ? roleBranches.find((branch) => !branch.isPrimary && (allCandidateMap.get(branch.id) ?? []).some((candidate) => candidate.id === recommendedAdjacent.id))
    : undefined;
  const comparedCandidates = role.candidates.filter((candidate) => compared.has(candidate.id));

  function chooseRole(nextRoleId: string) {
    const nextRole = initialRoles.find((item) => item.id === nextRoleId) ?? initialRoles[0];
    const nextBranches = branchOverrides[nextRole.id] ??
      initialBranches.filter((branch) => !branch.roleId || branch.roleId === nextRole.id);
    const nextDirect = nextBranches.find((branch) => branch.isPrimary) ?? nextBranches[0];
    setRoleId(nextRole.id);
    setBranchId(nextDirect.id);
    const firstCandidate = nextRole.candidates.find((candidate) => branchHasCandidate(nextDirect, candidate)) ?? nextRole.candidates[0];
    setCandidateId(firstCandidate.id);
    setCompared(new Set());
    setComparisonOpen(false);
    setDetailTab("evidence");
  }

  function chooseLens(nextLens: Lens) {
    setLens(nextLens);
    if (nextLens === "traditional") {
      setBranchId(directBranch.id);
      const directCandidate = candidateMap.get(directBranch.id)?.[0] ?? role.candidates[0];
      setCandidateId(directCandidate.id);
    }
  }

  function chooseBranch(nextBranch: CareerRootBranchRecord) {
    setBranchId(nextBranch.id);
    const firstCandidate = candidateMap.get(nextBranch.id)?.[0];
    if (firstCandidate) setCandidateId(firstCandidate.id);
    setDetailTab("evidence");
  }

  async function refreshAdjacentRoles() {
    setRefreshingBranches(true);
    try {
      const response = await fetch("/api/employer/adjacent-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: { id: role.id, title: role.title, signals: role.roleSignals },
          branches: seededRoleBranches
        })
      });
      if (!response.ok) throw new Error("Adjacent-role refresh failed");
      const result = await response.json() as { branches: CareerRootBranchRecord[] };
      setBranchOverrides((current) => ({ ...current, [role.id]: result.branches }));
      const refreshedDirect = result.branches.find((branch) => branch.isPrimary) ?? result.branches[0];
      setBranchId(refreshedDirect.id);
    } catch {
      // Keep the deterministic seeded-market recommendations already on screen.
    } finally {
      setRefreshingBranches(false);
    }
  }

  function toggleQueued(id: string) {
    setQueued((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCompared(id: string) {
    setCompared((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  }

  function toggleCourse(id: string) {
    setAssignedCourses((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="cr">
      <CommandBar
        roles={initialRoles}
        role={role}
        hiddenGems={hiddenGems}
        dataSource={dataSource}
        recommendation={recommendedAdjacent}
        recommendationBranch={recommendedBranch}
        onRoleChange={chooseRole}
        onReviewRecommendation={() => {
          if (!recommendedAdjacent || !recommendedBranch) return;
          setLens("root");
          setBranchId(recommendedBranch.id);
          setCandidateId(recommendedAdjacent.id);
          setDetailTab("evidence");
        }}
      />

      <LensBar lens={lens} hiddenCount={hiddenGems} onChange={chooseLens} />

      <main className="cr-main">
        <section className="cr-explorer">
          <div className="cr-section-head">
            <div>
              <span>Sourcing map</span>
              <h2>Expand the vacancy into adjacent market roles</h2>
            </div>
            <div className="cr-map-actions">
              <button type="button" className="cr-secondary" onClick={refreshAdjacentRoles} disabled={refreshingBranches}>
                <Network size={14} />
                {refreshingBranches ? "Refreshing roles…" : "Refresh adjacent roles"}
              </button>
              <label className="cr-sort">
                <span>Rank by</span>
                <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
                  <option value="score">Overall fit</option>
                  <option value="intent">Interest signal</option>
                </select>
                <ChevronDown size={14} aria-hidden="true" />
              </label>
            </div>
          </div>

          <RoleRoot role={role} visibleCount={visibleCandidates.length} lens={lens} />

          <div className="cr-branch-grid" style={{ "--branches": visibleBranches.length } as CSSProperties}>
            {visibleBranches.map((branch, index) => {
              const candidates = candidateMap.get(branch.id) ?? [];
              const best = candidates.length ? Math.max(...candidates.map((item) => item.score)) : 0;
              const isActive = branch.id === activeBranch.id;
              const isPrimary = Boolean(branch.isPrimary);
              const sharedEvidence =
                candidates[0]?.highlights.slice(0, 2).join(" · ") ?? "Evidence still developing";
              const stateLabel = isActive
                ? "Currently exploring"
                : isPrimary
                  ? "Direct role"
                  : "Adjacent role";
              return (
                <button
                  key={branch.id}
                  type="button"
                  className={isActive ? "is-active" : ""}
                  onClick={() => chooseBranch(branch)}
                  aria-pressed={isActive}
                >
                  <span className="cr-branch-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="cr-branch-icon"><GitBranch size={16} /></span>
                  <span className="cr-branch-copy">
                    <em data-state={isActive ? "exploring" : isPrimary ? "primary" : "adjacent"}>{stateLabel}</em>
                    <strong>{branch.field}</strong>
                    <small>Shared evidence: {sharedEvidence}</small>
                    <small className="cr-branch-count">{candidates.length} candidate{candidates.length === 1 ? "" : "s"}</small>
                  </span>
                  <span className="cr-branch-fit"><strong>{best}</strong><small>best fit</small></span>
                </button>
              );
            })}
          </div>

          <div className="cr-branch-focus">
            <div className="cr-branch-story">
              <div>
                <span><Network size={14} /> Currently exploring</span>
                <h3>{activeBranch.field}</h3>
                <p>{activeBranch.fitReason}</p>
                <div className="cr-threshold-inline">
                  <i />
                  <strong>Threshold relaxed:</strong>
                  <span>{activeBranch.thresholdRelaxed}</span>
                </div>
              </div>
            </div>

            <div className="cr-candidate-list">
              {branchCandidates.length ? (
                branchCandidates.map((candidate, index) => (
                  <CandidateRow
                    key={candidate.id}
                    candidate={candidate}
                    rank={index + 1}
                    selected={selected.id === candidate.id}
                    queued={queued.has(candidate.id)}
                    compared={compared.has(candidate.id)}
                    compareDisabled={!compared.has(candidate.id) && compared.size >= 3}
                    onSelect={() => {
                      setCandidateId(candidate.id);
                      setDetailTab("evidence");
                    }}
                    onToggleQueued={() => toggleQueued(candidate.id)}
                    onToggleCompared={() => toggleCompared(candidate.id)}
                  />
                ))
              ) : (
                <div className="cr-empty-branch">
                  <Users size={20} />
                  <p>No surfaced candidate currently matches this adjacent role.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <CandidateInspector
          key={selected.id}
          candidate={selected}
          role={role}
          branch={activeBranch}
          tab={detailTab}
          queued={queued.has(selected.id)}
          compared={compared.has(selected.id)}
          assignedCourses={assignedCourses}
          onTabChange={setDetailTab}
          onToggleQueued={() => toggleQueued(selected.id)}
          onToggleCompared={() => toggleCompared(selected.id)}
          onToggleCourse={toggleCourse}
        />
      </main>

      {compared.size ? (
        <CompareTray
          candidates={comparedCandidates}
          open={comparisonOpen}
          onToggleOpen={() => setComparisonOpen((current) => !current)}
          onRemove={toggleCompared}
        />
      ) : null}

      <style>{styles}</style>
    </div>
  );
}

function CommandBar({
  roles,
  role,
  hiddenGems,
  dataSource,
  recommendation,
  recommendationBranch,
  onRoleChange,
  onReviewRecommendation
}: {
  roles: CareerRootRole[];
  role: CareerRootRole;
  hiddenGems: number;
  dataSource: CareerRootDataSource;
  recommendation: CareerRootCandidate | undefined;
  recommendationBranch: CareerRootBranchRecord | undefined;
  onRoleChange: (id: string) => void;
  onReviewRecommendation: () => void;
}) {
  return (
    <header className="cr-command">
      <div className="cr-command-copy">
        <div className="cr-label">
          <Compass size={15} />
          Career Root
          <span className={dataSource === "supabase" ? "is-live" : ""}>
            <i /> {dataSource === "supabase" ? "Live Supabase" : "Demo fallback"}
          </span>
        </div>
        <div className="cr-role-line">
          <div>
            <h1>{role.title}</h1>
            <p>{role.team} · {role.location} · {role.openings} openings</p>
          </div>
          <label>
            <span className="sr-only">Change open role</span>
            <select value={role.id} onChange={(event) => onRoleChange(event.target.value)}>
              {roles.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
            <ChevronDown size={15} />
          </label>
        </div>
        <p className="cr-goal">{role.hiringGoal}</p>
        <div className="cr-signals">
          {role.roleSignals.map((signal) => <span key={signal}>{signal}</span>)}
        </div>
      </div>

      <div className="cr-command-insight">
        <div className="cr-insight-copy">
          <span><Sparkles size={14} /> Recommended next action</span>
          <strong>
            {hiddenGems
              ? `${hiddenGems} strong candidate${hiddenGems === 1 ? "" : "s"} found beyond the traditional filter`
              : "Direct-field evidence is currently strongest"}
          </strong>
          <p>
            {recommendation && recommendationBranch
              ? `Expanding into ${recommendationBranch.field} surfaced ${recommendation.name} at ${recommendation.score}% fit.`
              : "Keep the direct-field search active while adjacent evidence develops."}
          </p>
          {recommendation ? (
            <button type="button" className="cr-recommend" onClick={onReviewRecommendation}>
              Review {recommendation.name.split(" ")[0]}’s evidence <ArrowRight size={13} />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function LensBar({
  lens,
  hiddenCount,
  onChange
}: {
  lens: Lens;
  hiddenCount: number;
  onChange: (lens: Lens) => void;
}) {
  return (
    <section className="cr-lens">
      <div className="cr-lens-toggle">
        <button type="button" className={lens === "traditional" ? "is-active" : ""} onClick={() => onChange("traditional")}>
          <BriefcaseBusiness size={14} /> Traditional filter
        </button>
        <button type="button" className={lens === "root" ? "is-active" : ""} onClick={() => onChange("root")}>
          <Network size={14} /> Career Root
        </button>
      </div>
      <p className={lens === "root" ? "is-positive" : "is-warning"}>
        {lens === "root" ? <Gem size={14} /> : <Target size={14} />}
        {lens === "root"
          ? `${hiddenCount} candidates recovered by evidence-based threshold relaxation.`
          : `${hiddenCount} adjacent candidates hidden by the direct-field filter.`}
      </p>
    </section>
  );
}

function RoleRoot({
  role,
  visibleCount,
  lens
}: {
  role: CareerRootRole;
  visibleCount: number;
  lens: Lens;
}) {
  return (
    <div className="cr-role-root">
      <div className="cr-root-icon"><Route size={20} /></div>
      <div>
        <span>Vacancy root</span>
        <h3>{role.title}</h3>
        <p>{lens === "root" ? "Adjacent evidence enabled" : "Direct field only"} · {visibleCount} surfaced from {role.candidatePoolSize ?? visibleCount} indexed profiles</p>
      </div>
      <div className="cr-priority" data-priority={role.priority.toLowerCase()}>
        <i /> {role.priority}
      </div>
    </div>
  );
}

function CandidateRow({
  candidate,
  rank,
  selected,
  queued,
  compared,
  compareDisabled,
  onSelect,
  onToggleQueued,
  onToggleCompared
}: {
  candidate: CareerRootCandidate;
  rank: number;
  selected: boolean;
  queued: boolean;
  compared: boolean;
  compareDisabled: boolean;
  onSelect: () => void;
  onToggleQueued: () => void;
  onToggleCompared: () => void;
}) {
  return (
    <article className={selected ? "is-selected" : ""}>
      <button type="button" className="cr-candidate-main" onClick={onSelect}>
        <span className="cr-rank">{String(rank).padStart(2, "0")}</span>
        <span className="cr-avatar">{candidate.avatar}</span>
        <span className="cr-person">
          <strong>{candidate.name}</strong>
          <small>{candidate.currentTrack} · {candidate.location}</small>
          <span>{candidate.sourceField}</span>
        </span>
      </button>

      <button type="button" className="cr-proof" onClick={onSelect}>
        <span><b>Strong evidence</b><small>{candidate.highlights.slice(0, 2).join(" · ")}</small></span>
        <span><b>Validation gap</b><small>{candidate.missingSignals[0] ?? "No material evidence gap"}</small></span>
      </button>

      <button type="button" className="cr-fit" onClick={onSelect}>
        <strong>{candidate.score}</strong><span>%</span><small>Role fit</small>
      </button>

      <div className="cr-row-actions">
        <button type="button" className={queued ? "is-on" : ""} onClick={onToggleQueued} aria-pressed={queued}>
          {queued ? <Check size={13} /> : <UserCheck size={13} />}
          {queued ? "In review" : "Review"}
        </button>
        <button type="button" className={compared ? "is-compare" : ""} onClick={onToggleCompared} disabled={compareDisabled} aria-pressed={compared}>
          <Scale size={13} /> Compare
        </button>
      </div>
    </article>
  );
}

function CandidateInspector({
  candidate,
  role,
  branch,
  tab,
  queued,
  compared,
  assignedCourses,
  onTabChange,
  onToggleQueued,
  onToggleCompared,
  onToggleCourse
}: {
  candidate: CareerRootCandidate;
  role: CareerRootRole;
  branch: CareerRootBranchRecord;
  tab: DetailTab;
  queued: boolean;
  compared: boolean;
  assignedCourses: Set<string>;
  onTabChange: (tab: DetailTab) => void;
  onToggleQueued: () => void;
  onToggleCompared: () => void;
  onToggleCourse: (id: string) => void;
}) {
  return (
    <aside className="cr-inspector">
      <div className="cr-inspector-head">
        <span className="cr-avatar is-large">{candidate.avatar}</span>
        <div>
          <span><BadgeCheck size={13} /> Verified seeded profile</span>
          <h2>{candidate.name}</h2>
          <p>{candidate.currentTrack} · {candidate.sourceField}</p>
        </div>
        <div className="cr-score"><strong>{candidate.score}</strong><span>% fit</span></div>
      </div>

      <div className="cr-inspector-tabs">
        <button type="button" className={tab === "evidence" ? "is-active" : ""} onClick={() => onTabChange("evidence")}>
          <Lightbulb size={14} /> Evidence
        </button>
        <button type="button" className={tab === "bridge" ? "is-active" : ""} onClick={() => onTabChange("bridge")}>
          <WandSparkles size={14} /> Bridge plan
        </button>
      </div>

      <div className="cr-inspector-body">
        {tab === "evidence" ? (
          <EvidenceView candidate={candidate} branch={branch} />
        ) : (
          <BridgeView candidate={candidate} role={role} assignedCourses={assignedCourses} onToggleCourse={onToggleCourse} />
        )}
      </div>

      <div className="cr-inspector-actions">
        <button type="button" className="cr-primary" onClick={onToggleQueued}>
          {queued ? <Check size={14} /> : <UserCheck size={14} />}
          {queued ? "Added to review queue" : "Add to review queue"}
        </button>
        <button type="button" className={`cr-secondary ${compared ? "is-on" : ""}`} onClick={onToggleCompared}>
          <Scale size={14} /> {compared ? "Added to compare" : "Compare candidate"}
        </button>
      </div>
    </aside>
  );
}

function EvidenceView({
  candidate,
  branch
}: {
  candidate: CareerRootCandidate;
  branch: CareerRootBranchRecord;
}) {
  return (
    <>
      <div className="cr-ai-label"><Sparkles size={13} /> Evidence-based sourcing rationale</div>
      <p className="cr-summary">{candidate.summary}</p>

      <div className="cr-signal-grid">
        <Signal value={candidate.skillFit} label="Capability" tone="blue" />
        <Signal value={candidate.experienceFit} label="Experience" tone="blue" />
        <Signal value={candidate.interestSignal} label="Intent" tone="green" />
      </div>

      <div className="cr-evidence-block">
        <h3>Why this candidate surfaced</h3>
        <ul>
          {candidate.highlights.slice(0, 3).map((item) => <li key={item}><CircleCheck size={13} />{item}</li>)}
        </ul>
      </div>

      <details className="cr-disclosure">
        <summary>
          <span><Target size={14} /> Threshold substitution</span>
          <ChevronDown size={14} />
        </summary>
        <div className="cr-disclosure-body">
          <p>{branch.thresholdRelaxed}</p>
          <small>Validate next: {candidate.missingSignals[0] ?? "No material evidence gap"}</small>
        </div>
      </details>

      <details className="cr-disclosure">
        <summary>
          <span><BadgeCheck size={14} /> Verified skill signals</span>
          <b>{candidate.skillSignals.length}</b>
          <ChevronDown size={14} />
        </summary>
        <div className="cr-skills">
          {candidate.skillSignals.map((skill) => <SkillSignal key={skill.id} skill={skill} />)}
        </div>
      </details>

      <details className="cr-disclosure">
        <summary>
          <span><Lightbulb size={14} /> Supporting evidence</span>
          <b>{candidate.learningSignals.length}</b>
          <ChevronDown size={14} />
        </summary>
        <ul className="cr-supporting-list">
          {[...candidate.learningSignals, ...candidate.portfolio].slice(0, 5).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </details>
    </>
  );
}

function Signal({ value, label, tone }: { value: number; label: string; tone: string }) {
  return <div data-tone={tone}><strong>{value}</strong><span>{label}</span></div>;
}

function SkillSignal({ skill }: { skill: CareerRootSkill }) {
  return (
    <div className="cr-skill">
      <div><strong>{skill.name}</strong><span data-category={skill.category.toLowerCase()}>{skill.category}</span><b>{skill.level}</b></div>
      <i><b style={{ width: `${skill.level}%` }} /></i>
      <p>{skill.evidence}</p>
    </div>
  );
}

function BridgeView({
  candidate,
  role,
  assignedCourses,
  onToggleCourse
}: {
  candidate: CareerRootCandidate;
  role: CareerRootRole;
  assignedCourses: Set<string>;
  onToggleCourse: (id: string) => void;
}) {
  const [route, setRoute] = useState<CareerRootRoute | null>(candidate.route);
  const [generating, setGenerating] = useState(false);
  const [generationMeta, setGenerationMeta] = useState<{
    source: "openrouter" | "fallback";
    model?: string;
    warning?: string;
  } | null>(null);

  async function refineRoute() {
    if (!route) return;
    setGenerating(true);
    setGenerationMeta(null);
    try {
      const response = await fetch("/api/employer/career-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate,
          role: { title: role.title, signals: role.roleSignals },
          existingRoute: route
        })
      });
      if (!response.ok) throw new Error("Career route generation request failed");
      const result = await response.json() as {
        route: CareerRootRoute;
        source: "openrouter" | "fallback";
        model?: string;
        warning?: string;
      };
      setRoute(result.route);
      setGenerationMeta({ source: result.source, model: result.model, warning: result.warning });
    } catch {
      setGenerationMeta({
        source: "fallback",
        warning: "AI refinement was unavailable; the evidence-derived route remains active."
      });
    } finally {
      setGenerating(false);
    }
  }

  if (!route) {
    return (
      <div className="cr-no-route">
        <Route size={22} />
        <h3>No bridge plan available.</h3>
        <p>A route needs enough candidate and role evidence before it can be modelled.</p>
      </div>
    );
  }

  return (
    <>
      <div className="cr-route-head">
        <div>
          <span>{route.track} route</span>
          <h3>{route.horizon}</h3>
          <p>{route.marketSignal}</p>
        </div>
        <div><strong>{route.readiness}</strong><span>% ready</span></div>
      </div>

      <button type="button" className="cr-secondary" onClick={refineRoute} disabled={generating}>
        <WandSparkles size={14} />
        {generating ? "Refining bridge…" : generationMeta ? "Refine bridge again" : "Refine bridge"}
      </button>

      <div className="cr-pay">
        <div><span>Current expectation</span><strong>{route.currentExpectedPay}</strong></div>
        <ArrowRight size={14} />
        <div><span>Unlocked range</span><strong>{route.unlockedPayRange}</strong></div>
      </div>

      <div className="cr-bridge-section">
        <h3>Why the route is realistic</h3>
        <ul>{route.whyRealistic.map((item) => <li key={item}><CircleCheck size={13} />{item}</li>)}</ul>
      </div>

      <div className="cr-bridge-section">
        <h3>Bridge skills and milestones</h3>
        <div className="cr-bridge-tags">
          {route.bridgeSkills.map((item) => <span key={item}>{item}</span>)}
        </div>
        <ol>
          {route.nextMilestones.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}
        </ol>
      </div>

      <div className="cr-course-list">
        <h3><GraduationCap size={14} /> Recommended learning</h3>
        {route.courses.map((course) => {
          const assigned = assignedCourses.has(course.id);
          return (
            <article key={course.id}>
              <div><span>{course.targetSkill}</span><h4>{course.title}</h4><p>{course.partner || course.provider} · {course.duration}</p></div>
              <button type="button" className={assigned ? "is-assigned" : ""} onClick={() => onToggleCourse(course.id)}>
                {assigned ? <Check size={13} /> : <GraduationCap size={13} />}
                {assigned ? "Assigned" : "Assign"}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}

function CompareTray({
  candidates,
  open,
  onToggleOpen,
  onRemove
}: {
  candidates: CareerRootCandidate[];
  open: boolean;
  onToggleOpen: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className={`cr-compare-tray ${open ? "is-open" : ""}`}>
      <div className="cr-compare-top">
        <div><Scale size={15} /><strong>Candidate comparison</strong><span>{candidates.length}/3 selected</span></div>
        <div className="cr-compare-chips">
          {candidates.map((candidate) => (
            <span key={candidate.id}>{candidate.name}<button type="button" onClick={() => onRemove(candidate.id)} aria-label={`Remove ${candidate.name} from comparison`}><X size={11} /></button></span>
          ))}
        </div>
        <button type="button" className="cr-secondary" onClick={onToggleOpen} disabled={candidates.length < 2}>
          {open ? "Close comparison" : "Compare now"}
        </button>
      </div>
      {open ? (
        <div className="cr-compare-grid">
          {candidates.map((candidate) => (
            <article key={candidate.id}>
              <div><span className="cr-avatar">{candidate.avatar}</span><div><h3>{candidate.name}</h3><p>{candidate.sourceField}</p></div></div>
              <strong>{candidate.score}% <span>role fit</span></strong>
              <dl>
                <div><dt>Capability</dt><dd>{candidate.skillFit}</dd></div>
                <div><dt>Experience</dt><dd>{candidate.experienceFit}</dd></div>
                <div><dt>Intent</dt><dd>{candidate.interestSignal}</dd></div>
              </dl>
              <p><b>Strong:</b> {candidate.highlights[0]}</p>
              <p className="is-gap"><b>Validate:</b> {candidate.missingSignals[0]}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

const styles = `
  .cr {
    --ink: #17233d;
    --muted: #5f6d82;
    --subtle: #7e899b;
    --line: #d8e0ea;
    --line-strong: #c5d0de;
    --blue: #2457d6;
    --blue-soft: #eaf1ff;
    --green: #087d68;
    --green-soft: #e7f6f1;
    --amber: #a65b13;
    --amber-soft: #fff4e4;
    --purple: #6d4cc4;
    width: 100%;
    border: 1px solid #dfe5ee;
    border-radius: 18px;
    padding: 10px;
    color: var(--ink);
    background:
      radial-gradient(circle at 94% 1%, rgba(72,101,178,.1), transparent 24%),
      linear-gradient(180deg, #f2f5f9, #edf1f6);
  }
  .cr *, .cr *::before, .cr *::after { box-sizing: border-box; }
  .cr button, .cr select { font: inherit; }
  .cr button { cursor: pointer; }
  .cr button:focus-visible, .cr select:focus-visible { outline: 3px solid rgba(36,87,214,.2); outline-offset: 2px; }
  .cr button:disabled { cursor: not-allowed; opacity: .48; }
  .cr .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

  .cr-command {
    display: grid;
    grid-template-columns: minmax(0,1.2fr) minmax(390px,.8fr);
    overflow: hidden;
    border: 1px solid #b9c7df;
    border-radius: 16px;
    background: linear-gradient(110deg, rgba(255,255,255,.94), rgba(235,241,251,.9));
    box-shadow: 0 10px 28px rgba(44,57,87,.08);
  }
  .cr-command-copy { position: relative; padding: 22px 26px; }
  .cr-command-copy::before { content: ""; position: absolute; inset: 20px auto 20px 0; width: 3px; border-radius: 0 3px 3px 0; background: linear-gradient(var(--blue), var(--purple)); }
  .cr-label { display: flex; align-items: center; gap: 7px; color: #3e4e67; font-size: 12px; font-weight: 750; }
  .cr-label > span { display: inline-flex; align-items: center; gap: 6px; margin-left: 5px; border-left: 1px solid #cbd5e3; padding-left: 11px; color: #6f7b8d; font-size: 10px; }
  .cr-label > span.is-live { color: var(--green); }
  .cr-label > span i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .cr-role-line { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-top: 12px; }
  .cr-role-line h1 { margin: 0; font-family: var(--font-sans); font-size: clamp(25px,2.4vw,34px); font-weight: 780; line-height: 1.08; letter-spacing: -.045em; }
  .cr-role-line p { margin: 6px 0 0; color: var(--muted); font-size: 11px; }
  .cr-role-line p b { margin: 0 4px; color: #a4aebb; }
  .cr-role-line label { position: relative; flex: 0 0 auto; }
  .cr-role-line select { max-width: 210px; appearance: none; border: 1px solid var(--line-strong); border-radius: 8px; padding: 9px 33px 9px 10px; color: #34435b; background: rgba(255,255,255,.85); font-size: 10px; font-weight: 700; }
  .cr-role-line label svg { position: absolute; top: 50%; right: 9px; transform: translateY(-50%); pointer-events: none; }
  .cr-goal { margin: 11px 0 0; color: #536178; font-size: 11px; }
  .cr-signals { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
  .cr-signals span { border: 1px solid #c6d1e1; border-radius: 6px; padding: 4px 7px; color: #43526a; background: rgba(255,255,255,.68); font-size: 9px; font-weight: 650; }
  .cr-command-insight { display: grid; grid-template-columns: 1fr 135px; gap: 17px; border-left: 1px solid #cbd6e6; padding: 21px 23px; background: linear-gradient(150deg, rgba(234,240,251,.78), rgba(247,248,252,.82)); }
  .cr-insight-copy { align-self: center; }
  .cr-insight-copy > span { display: flex; align-items: center; gap: 6px; color: var(--purple); font-size: 10px; font-weight: 750; }
  .cr-insight-copy > strong { display: block; margin-top: 8px; font-size: 16px; }
  .cr-insight-copy p { max-width: 280px; margin: 6px 0 0; color: #5f6d82; font-size: 10px; line-height: 1.5; }
  .cr-metrics { display: grid; align-content: center; }
  .cr-metrics > div { display: flex; align-items: baseline; justify-content: space-between; gap: 9px; border-bottom: 1px solid #d4dce8; padding: 6px 0; }
  .cr-metrics > div:last-child { border-bottom: 0; }
  .cr-metrics strong { font-size: 17px; letter-spacing: -.03em; }
  .cr-metrics span { color: #6c788b; font-size: 9px; }

  .cr-lens { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 10px; border: 1px solid var(--line); border-radius: 11px; padding: 5px 8px 5px 5px; background: rgba(255,255,255,.82); }
  .cr-lens-toggle { display: inline-flex; gap: 3px; }
  .cr-lens-toggle button { display: flex; align-items: center; gap: 6px; border: 0; border-radius: 7px; padding: 8px 11px; color: #647084; background: transparent; font-size: 10px; font-weight: 700; }
  .cr-lens-toggle button.is-active { color: #fff; background: #253a65; box-shadow: 0 5px 12px rgba(32,49,85,.15); }
  .cr-lens > p { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 10px; font-weight: 700; }
  .cr-lens > p.is-positive { color: var(--green); }
  .cr-lens > p.is-warning { color: var(--amber); }

  .cr-main { display: grid; grid-template-columns: minmax(0,1.55fr) minmax(320px,.58fr); gap: 14px; margin-top: 10px; align-items: start; }
  .cr-explorer, .cr-inspector, .cr-compare-tray { border: 1px solid var(--line); border-radius: 14px; background: #f8fafc; box-shadow: 0 7px 20px rgba(42,57,85,.055); }
  .cr-explorer { overflow: hidden; }
  .cr-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; border-bottom: 1px solid var(--line); padding: 15px 17px; background: linear-gradient(90deg,#e8eef8,#f7f9fc); }
  .cr-section-head > div > span { color: #637086; font-size: 10px; font-weight: 700; }
  .cr-section-head h2 { margin: 4px 0 0; font-size: 18px; letter-spacing: -.028em; }
  .cr-map-actions { display: flex; align-items: flex-end; gap: 9px; }
  .cr-map-actions > button { min-height: 32px; white-space: nowrap; }
  .cr-sort { position: relative; }
  .cr-sort > span { display: block; margin-bottom: 4px; color: #6b778a; font-size: 9px; font-weight: 700; }
  .cr-sort select { appearance: none; border: 1px solid var(--line-strong); border-radius: 7px; padding: 7px 29px 7px 9px; color: #415069; background: #fff; font-size: 9px; font-weight: 700; }
  .cr-sort svg { position: absolute; right: 8px; bottom: 7px; pointer-events: none; }

  .cr-role-root { position: relative; display: grid; grid-template-columns: 40px 1fr auto; align-items: center; gap: 10px; width: min(440px,calc(100% - 30px)); margin: 16px auto 26px; border: 1px solid #2b416d; border-radius: 12px; padding: 13px 15px; color: #fff; background: radial-gradient(circle at 90% 0%,rgba(87,111,179,.5),transparent 40%),linear-gradient(120deg,#1d315b,#2d497b); box-shadow: 0 12px 25px rgba(31,49,86,.16); }
  .cr-role-root::after { content: ""; position: absolute; left: 50%; bottom: -27px; width: 1px; height: 26px; background: #9baccc; }
  .cr-root-icon { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 9px; color: #cbd8fa; background: rgba(255,255,255,.09); }
  .cr-role-root span { color: rgba(255,255,255,.57); font-size: 8px; font-weight: 750; text-transform: uppercase; letter-spacing: .08em; }
  .cr-role-root h3 { margin: 3px 0 0; color: #fff; font-size: 15px; }
  .cr-role-root p { margin: 3px 0 0; color: rgba(255,255,255,.61); font-size: 9px; }
  .cr-priority { display: flex; align-items: center; gap: 5px; border: 1px solid rgba(255,255,255,.14); border-radius: 6px; padding: 5px 7px; color: #ffd49b; background: rgba(255,255,255,.07); font-size: 8px; font-weight: 750; }
  .cr-priority i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  .cr-branch-grid { position: relative; display: grid; grid-template-columns: repeat(var(--branches),minmax(0,1fr)); gap: 9px; padding: 0 14px 14px; }
  .cr-branch-grid::before { content: ""; position: absolute; inset: -13px 10% auto; height: 1px; background: #9baccc; }
  .cr-branch-grid > button { position: relative; display: grid; grid-template-columns: 25px 32px minmax(0,1fr) 47px; align-items: center; gap: 8px; min-width: 0; border: 1px solid #cbd6e4; border-radius: 10px; padding: 10px; color: inherit; background: rgba(255,255,255,.72); text-align: left; transition: border-color .18s ease,background .18s ease,transform .18s ease; }
  .cr-branch-grid > button::before { content: ""; position: absolute; left: 50%; top: -14px; width: 1px; height: 13px; background: #9baccc; }
  .cr-branch-grid > button:hover { border-color: #9eb3d7; transform: translateY(-1px); }
  .cr-branch-grid > button.is-active { border-color: #7f9cd3; background: linear-gradient(135deg,#e9f0fc,#f8faff); box-shadow: inset 0 0 0 1px rgba(36,87,214,.08),0 7px 15px rgba(45,66,107,.07); }
  .cr-branch-index { color: #6e7a8d; font-family: var(--font-mono); font-size: 8px; }
  .cr-branch-icon { display: grid; width: 31px; height: 31px; place-items: center; border-radius: 8px; color: #526b9c; background: #e5ebf5; }
  .cr-branch-copy { min-width: 0; }
  .cr-branch-copy strong,.cr-branch-copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cr-branch-copy strong { font-size: 10px; }
  .cr-branch-copy small { margin-top: 3px; color: #6d798b; font-size: 8px; }
  .cr-branch-fit { border-left: 1px solid #d6deea; padding-left: 8px; text-align: center; }
  .cr-branch-fit strong { display: block; color: var(--blue); font-size: 15px; }
  .cr-branch-fit small { color: #748094; font-size: 7px; }

  .cr-branch-focus { border-top: 1px solid var(--line); background: #f2f5f9; }
  .cr-branch-story { display: grid; grid-template-columns: minmax(0,1fr) minmax(250px,.65fr); gap: 12px; border-bottom: 1px solid var(--line); padding: 14px 16px; background: linear-gradient(120deg,#edf2fa,#f8f9fc); }
  .cr-branch-story > div:first-child > span { display: flex; align-items: center; gap: 6px; color: var(--blue); font-size: 9px; font-weight: 750; }
  .cr-branch-story h3 { margin: 6px 0 0; font-size: 17px; }
  .cr-branch-story p { margin: 5px 0 0; color: #59677d; font-size: 10px; line-height: 1.5; }
  .cr-threshold { display: flex; align-items: flex-start; gap: 8px; border-left: 3px solid #e8a653; padding: 9px 11px; background: var(--amber-soft); }
  .cr-threshold > svg { flex: 0 0 auto; color: var(--amber); }
  .cr-threshold span { color: var(--amber); font-size: 8px; font-weight: 750; }
  .cr-threshold p { margin-top: 4px; color: #72451e; font-size: 9px; }
  .cr-candidate-list { background: #f6f8fb; }
  .cr-candidate-list > article { display: grid; grid-template-columns: minmax(230px,1fr) minmax(220px,.9fr) 62px 105px; align-items: center; gap: 10px; min-height: 92px; border-bottom: 1px solid var(--line); padding: 11px 13px; background: rgba(255,255,255,.68); }
  .cr-candidate-list > article:last-child { border-bottom: 0; }
  .cr-candidate-list > article.is-selected { background: linear-gradient(90deg,#e4edfc,#eff4fb 58%,#f8fafc); box-shadow: inset 4px 0 0 var(--blue); }
  .cr-candidate-main { display: grid; grid-template-columns: 21px 39px minmax(0,1fr); align-items: center; gap: 9px; min-width: 0; border: 0; padding: 0; color: inherit; background: transparent; text-align: left; }
  .cr-rank { color: #758195; font-family: var(--font-mono); font-size: 8px; }
  .cr-avatar { display: grid; width: 39px; height: 39px; place-items: center; border-radius: 10px; color: #fff; background: #315fbf; font-size: 10px; font-weight: 800; }
  .cr-avatar.is-large { width: 47px; height: 47px; border-radius: 12px; font-size: 12px; }
  .cr-person { min-width: 0; }
  .cr-person > strong,.cr-person > small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cr-person > strong { font-size: 11px; }
  .cr-person > small { margin-top: 3px; color: #667388; font-size: 9px; }
  .cr-person > span { display: inline-block; margin-top: 5px; border-radius: 5px; padding: 3px 5px; color: #4a5971; background: #e8edf4; font-size: 8px; font-weight: 700; }
  .cr-proof { display: grid; gap: 5px; min-width: 0; border: 0; padding: 0; color: inherit; background: transparent; text-align: left; }
  .cr-proof span { overflow: hidden; color: #526075; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
  .cr-proof b { display: inline-block; min-width: 42px; margin-right: 5px; border-radius: 5px; padding: 2px 4px; color: var(--green); background: #e3f5f0; text-align: center; font-size: 8px; }
  .cr-proof span:last-child b { color: var(--amber); background: #fcebd5; }
  .cr-fit { border: 0; border-left: 1px solid #d4dce7; padding: 0; color: inherit; background: transparent; text-align: center; }
  .cr-fit strong { font-size: 20px; letter-spacing: -.04em; }
  .cr-fit > span { color: #6b7789; font-size: 9px; }
  .cr-fit small { display: block; color: #748094; font-size: 8px; }
  .cr-row-actions { display: grid; gap: 5px; }
  .cr-row-actions button { display: flex; align-items: center; justify-content: center; gap: 5px; min-height: 28px; border: 1px solid var(--line-strong); border-radius: 7px; padding: 5px; color: #526076; background: #fff; font-size: 8px; font-weight: 700; }
  .cr-row-actions button.is-on { border-color: #9fd5ca; color: var(--green); background: var(--green-soft); }
  .cr-row-actions button.is-compare { border-color: #aebfe3; color: var(--blue); background: var(--blue-soft); }
  .cr-empty-branch { display: grid; min-height: 140px; place-items: center; align-content: center; color: #6d798b; text-align: center; }
  .cr-empty-branch p { max-width: 350px; margin: 8px 0 0; font-size: 10px; }

  .cr-inspector { position: sticky; top: 76px; overflow: hidden; background: #fbfcfe; }
  .cr-inspector-head { display: grid; grid-template-columns: 47px minmax(0,1fr) 58px; align-items: center; gap: 10px; border-bottom: 1px solid #cdd8e7; padding: 15px; background: linear-gradient(135deg,#e5edf9,#f5f7fb); }
  .cr-inspector-head > div:nth-child(2) { min-width: 0; }
  .cr-inspector-head > div:nth-child(2) > span { display: flex; align-items: center; gap: 5px; color: var(--green); font-size: 8px; font-weight: 750; }
  .cr-inspector-head h2 { overflow: hidden; margin: 5px 0 0; font-size: 18px; text-overflow: ellipsis; white-space: nowrap; }
  .cr-inspector-head p { overflow: hidden; margin: 3px 0 0; color: #657186; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
  .cr-score { border-left: 1px solid #cbd5e3; padding-left: 9px; text-align: center; }
  .cr-score strong { display: block; color: var(--blue); font-size: 21px; }
  .cr-score span { color: #6d798b; font-size: 8px; }
  .cr-inspector-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; border-bottom: 1px solid var(--line); padding: 5px; background: #eef2f7; }
  .cr-inspector-tabs button { display: flex; align-items: center; justify-content: center; gap: 6px; border: 0; border-radius: 7px; padding: 8px; color: #627086; background: transparent; font-size: 9px; font-weight: 700; }
  .cr-inspector-tabs button.is-active { color: #fff; background: #263b67; box-shadow: 0 4px 10px rgba(35,55,94,.14); }
  .cr-inspector-body { max-height: calc(100vh - 315px); overflow-y: auto; padding: 15px; scrollbar-width: thin; scrollbar-color: #bdc8d8 transparent; }
  .cr-ai-label { display: flex; align-items: center; gap: 6px; color: var(--purple); font-size: 9px; font-weight: 750; }
  .cr-summary { margin: 9px 0 0; color: #536177; font-size: 10px; line-height: 1.5; }
  .cr-signal-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; margin-top: 13px; }
  .cr-signal-grid > div { border-top: 3px solid var(--signal); padding: 9px; background: var(--signal-bg); }
  .cr-signal-grid > div[data-tone="blue"] { --signal: var(--blue); --signal-bg: #f0f4fb; }
  .cr-signal-grid > div[data-tone="green"] { --signal: var(--green); --signal-bg: #edf7f4; }
  .cr-signal-grid strong { display: block; color: var(--signal); font-size: 18px; }
  .cr-signal-grid span { color: #667287; font-size: 8px; }
  .cr-evidence-block { margin-top: 15px; }
  .cr-evidence-block h3,.cr-skills h3,.cr-bridge-section h3,.cr-course-list > h3 { color: #2d3b54; font-size: 10px; }
  .cr-evidence-block ul,.cr-bridge-section ul { display: grid; gap: 7px; margin: 9px 0 0; padding: 0; list-style: none; }
  .cr-evidence-block li,.cr-bridge-section li { display: flex; align-items: flex-start; gap: 6px; color: #4d5b70; font-size: 9px; line-height: 1.4; }
  .cr-evidence-block li svg,.cr-bridge-section li svg { flex: 0 0 auto; color: var(--green); }
  .cr-relaxation { display: flex; align-items: flex-start; gap: 8px; margin-top: 14px; border-left: 3px solid #e4a04b; padding: 9px 10px; background: var(--amber-soft); }
  .cr-relaxation > svg { flex: 0 0 auto; color: var(--amber); }
  .cr-relaxation span { color: var(--amber); font-size: 8px; font-weight: 750; }
  .cr-relaxation p { margin: 4px 0 0; color: #70431e; font-size: 9px; line-height: 1.4; }
  .cr-relaxation small { display: block; margin-top: 5px; color: #8a581f; font-size: 8px; }
  .cr-skills { margin-top: 15px; }
  .cr-skill { border-bottom: 1px solid var(--line); padding: 9px 0; }
  .cr-skill:last-child { border-bottom: 0; }
  .cr-skill > div { display: flex; align-items: center; gap: 6px; }
  .cr-skill > div strong { flex: 1; font-size: 9px; }
  .cr-skill > div span { border-radius: 5px; padding: 2px 5px; color: #536177; background: #e8edf4; font-size: 7px; font-weight: 700; }
  .cr-skill > div span[data-category="emerging"] { color: var(--amber); background: var(--amber-soft); }
  .cr-skill > div b { color: var(--blue); font-size: 9px; }
  .cr-skill > i { display: block; height: 4px; margin-top: 6px; overflow: hidden; border-radius: 99px; background: #e3e8ef; }
  .cr-skill > i b { display: block; height: 100%; border-radius: inherit; background: var(--blue); }
  .cr-skill p { margin: 5px 0 0; color: #697589; font-size: 8px; line-height: 1.35; }
  .cr-inspector-actions { display: grid; gap: 6px; border-top: 1px solid var(--line); padding: 11px 15px 14px; background: #eef3f9; }
  .cr-primary,.cr-secondary { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 34px; border-radius: 8px; padding: 7px 10px; font-size: 9px; font-weight: 750; }
  .cr-primary { border: 1px solid var(--blue); color: #fff; background: var(--blue); }
  .cr-secondary { border: 1px solid var(--line-strong); color: #48566d; background: #fff; }
  .cr-secondary.is-on { border-color: #9fd5ca; color: var(--green); background: var(--green-soft); }

  .cr-route-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--line); padding-bottom: 11px; }
  .cr-route-head > div:first-child > span { color: var(--purple); font-size: 8px; font-weight: 750; }
  .cr-route-head h3 { margin: 4px 0 0; font-size: 17px; }
  .cr-route-head p { margin: 4px 0 0; color: #637086; font-size: 8px; line-height: 1.4; }
  .cr-route-head > div:last-child { min-width: 58px; border-left: 1px solid var(--line); padding-left: 9px; text-align: center; }
  .cr-route-head > div:last-child strong { display: block; color: var(--purple); font-size: 20px; }
  .cr-route-head > div:last-child span { color: #6d798b; font-size: 7px; }
  .cr-pay { display: grid; grid-template-columns: 1fr 18px 1fr; align-items: center; gap: 6px; margin-top: 11px; border: 1px solid #cbd6e6; padding: 9px; background: #f1f5fb; }
  .cr-pay svg { color: #7b8799; }
  .cr-pay span { display: block; color: #6d798b; font-size: 7px; }
  .cr-pay strong { display: block; margin-top: 3px; color: #32425d; font-size: 9px; }
  .cr-bridge-section { margin-top: 14px; }
  .cr-bridge-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
  .cr-bridge-tags span { border: 1px solid #d0c6e5; border-radius: 6px; padding: 4px 6px; color: #644da0; background: #f2eef8; font-size: 8px; font-weight: 700; }
  .cr-bridge-section ol { display: grid; gap: 6px; margin: 9px 0 0; padding: 0; list-style: none; }
  .cr-bridge-section ol li { display: flex; align-items: center; gap: 7px; color: #536177; font-size: 9px; }
  .cr-bridge-section ol li span { display: grid; width: 20px; height: 20px; place-items: center; border-radius: 6px; color: #fff; background: var(--purple); font-size: 7px; font-weight: 750; }
  .cr-course-list { margin-top: 14px; }
  .cr-course-list > h3 { display: flex; align-items: center; gap: 6px; }
  .cr-course-list article { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px; border: 1px solid #d5ddea; border-radius: 8px; padding: 9px; background: #fff; }
  .cr-course-list article > div { min-width: 0; }
  .cr-course-list article > div > span { color: var(--purple); font-size: 7px; font-weight: 750; }
  .cr-course-list h4 { overflow: hidden; margin: 3px 0 0; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
  .cr-course-list p { margin: 3px 0 0; color: #6b7789; font-size: 7px; }
  .cr-course-list button { display: flex; align-items: center; gap: 5px; border: 1px solid #baaadd; border-radius: 7px; padding: 6px 7px; color: var(--purple); background: #f5f2fa; font-size: 8px; font-weight: 700; }
  .cr-course-list button.is-assigned { border-color: #9fd5ca; color: var(--green); background: var(--green-soft); }
  .cr-no-route { display: grid; min-height: 290px; place-items: center; align-content: center; color: #6f7b8d; text-align: center; }
  .cr-no-route h3 { margin: 10px 0 0; color: #33415a; font-size: 13px; }
  .cr-no-route p { max-width: 260px; margin: 5px 0 0; font-size: 9px; line-height: 1.45; }

  .cr-compare-tray { margin-top: 10px; overflow: hidden; background: #eef3f9; }
  .cr-compare-top { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; padding: 9px 12px; }
  .cr-compare-top > div:first-child { display: flex; align-items: center; gap: 6px; }
  .cr-compare-top > div:first-child strong { font-size: 10px; }
  .cr-compare-top > div:first-child span { color: #6c788b; font-size: 8px; }
  .cr-compare-chips { display: flex; flex-wrap: wrap; gap: 5px; }
  .cr-compare-chips > span { display: flex; align-items: center; gap: 5px; border-radius: 6px; padding: 4px 6px; color: #41516b; background: #fff; font-size: 8px; font-weight: 700; }
  .cr-compare-chips button { display: grid; border: 0; padding: 0; color: #7a8596; background: transparent; }
  .cr-compare-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; border-top: 1px solid var(--line); padding: 10px; background: #f6f8fb; }
  .cr-compare-grid > article { border: 1px solid #ccd6e4; border-top: 3px solid var(--blue); padding: 11px; background: #fff; }
  .cr-compare-grid > article > div:first-child { display: flex; align-items: center; gap: 8px; }
  .cr-compare-grid h3 { font-size: 10px; }
  .cr-compare-grid > article > div:first-child p { margin: 2px 0 0; color: #6b7789; font-size: 8px; }
  .cr-compare-grid > article > strong { display: block; margin-top: 9px; color: var(--blue); font-size: 18px; }
  .cr-compare-grid > article > strong span { color: #6a7689; font-size: 8px; }
  .cr-compare-grid dl { display: grid; grid-template-columns: repeat(3,1fr); gap: 5px; margin: 8px 0 0; }
  .cr-compare-grid dl div { padding: 6px; background: #eef3f9; }
  .cr-compare-grid dt { color: #6a7689; font-size: 7px; }
  .cr-compare-grid dd { margin: 3px 0 0; font-size: 11px; font-weight: 750; }
  .cr-compare-grid > article > p { overflow: hidden; margin: 8px 0 0; color: #4e5c71; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
  .cr-compare-grid > article > p b { color: var(--green); }
  .cr-compare-grid > article > p.is-gap b { color: var(--amber); }

  @media (max-width: 1260px) {
    .cr-command { grid-template-columns: 1fr; }
    .cr-command-insight { border-top: 1px solid #cbd6e6; border-left: 0; }
    .cr-main { grid-template-columns: 1fr; }
    .cr-inspector { position: static; }
    .cr-inspector-body { max-height: none; }
  }
  @media (max-width: 860px) {
    .cr-branch-grid { grid-template-columns: 1fr; }
    .cr-branch-grid::before,.cr-branch-grid > button::before,.cr-role-root::after { display: none; }
    .cr-branch-story { grid-template-columns: 1fr; }
    .cr-candidate-list > article { grid-template-columns: minmax(220px,1fr) 58px 104px; }
    .cr-proof { grid-column: 1 / -1; grid-row: 2; border-top: 1px solid var(--line); padding-top: 7px; }
    .cr-compare-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 620px) {
    .cr { padding: 6px; border-radius: 14px; }
    .cr-command-copy { padding: 18px; }
    .cr-role-line { display: grid; align-items: start; gap: 12px; }
    .cr-role-line label,.cr-role-line select { width: 100%; max-width: none; }
    .cr-command-insight { grid-template-columns: 1fr; padding: 16px 18px; }
    .cr-metrics { grid-template-columns: repeat(3,1fr); gap: 8px; }
    .cr-metrics > div { display: grid; justify-content: start; border-right: 1px solid #d4dce8; border-bottom: 0; }
    .cr-metrics > div:last-child { border-right: 0; }
    .cr-lens { display: grid; }
    .cr-lens-toggle { display: grid; grid-template-columns: 1fr 1fr; }
    .cr-lens > p { padding: 4px; }
    .cr-section-head { align-items: flex-start; }
    .cr-role-root { grid-template-columns: 38px 1fr; }
    .cr-priority { grid-column: 1 / -1; width: max-content; }
    .cr-candidate-list > article { grid-template-columns: minmax(0,1fr) 54px; padding: 11px; }
    .cr-fit { grid-column: 2; grid-row: 1; }
    .cr-row-actions { grid-column: 1 / -1; grid-template-columns: 1fr 1fr; }
    .cr-proof { grid-row: auto; }
    .cr-compare-top { grid-template-columns: 1fr; }
  }
  @media (prefers-reduced-motion: reduce) {
    .cr *, .cr *::before, .cr *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; }
  }
`;
