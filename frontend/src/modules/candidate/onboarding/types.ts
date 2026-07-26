// Candidate onboarding — AI-native conversational intake.
// Spec: docs/superpowers/specs/2026-07-26-candidate-onboarding-ai-native-design.md

export type DimensionId = "identity" | "experience" | "skills" | "preferences" | "dna";

export type FactSource = "parsed" | "confirmed" | "inferred" | "self-reported";

/**
 * One unit of knowledge about the candidate. Facts are the ledger the whole flow reads from —
 * the profile rail, the coverage model, and the next-question selector all derive from these.
 * `parsed`/`inferred` facts are provisional until the candidate confirms them (spec §4).
 */
export type Fact = {
  id: string;
  dimension: DimensionId;
  key: string; // "role.current", "skill.go", "pref.work_mode"
  label: string; // display label for the rail
  value: string | string[] | number;
  source: FactSource;
  confidence: number; // 0..1
  /** Verbatim span from the source document. Absent ⇒ the model inferred it (spec §6.4). */
  evidence?: string;
  /** True only when the candidate changed the value — confirming as-is does not set this. */
  edited?: boolean;
  /** Display unit for numeric answers ("RM", "min") so the rail doesn't show a bare number. */
  unit?: string;
};

export type AnswerControl =
  | { kind: "confirm" }
  | { kind: "chips"; options: string[] }
  | { kind: "multi"; options: string[]; max?: number }
  | { kind: "range"; min: number; max: number; step: number; unit: string }
  | { kind: "location" }
  | { kind: "text"; placeholder: string; multiline?: boolean };

export type AnswerValue = string | string[] | number;

export type IntakeSourceKind = "resume" | "linkedin" | "paste" | "conversation";

export type TurnKind = "intake" | "parsing" | "confirm" | "gap" | "dna" | "handoff";

type TurnBase = {
  id: string;
  kind: TurnKind;
  /** Agent-side text. Rendered as the agent's message bubble. */
  say: string;
};

export type IntakeTurn = TurnBase & { kind: "intake" };

export type ParsingTurn = TurnBase & {
  kind: "parsing";
  /** Grounded status lines, revealed one at a time while the parse streams. */
  steps: string[];
};

/**
 * One turn confirms the whole parse, not one fact at a time — six sequential yes-taps is a form
 * wearing a chat costume. Each listed fact stays individually editable in place.
 */
export type ConfirmTurn = TurnBase & {
  kind: "confirm";
  factIds: string[];
  control: { kind: "confirm" };
};

export type GapTurn = TurnBase & {
  kind: "gap";
  dimension: DimensionId;
  /** Fact key this answer will write. */
  writes: string;
  label: string;
  control: AnswerControl;
  /** Why the agent is asking — shown small, keeps the flow legible. */
  because?: string;
};

export type DnaTurn = TurnBase & {
  kind: "dna";
  summaryMd: string;
  bestFit: Array<{ role: string; level: string }>;
};

export type HandoffTurn = TurnBase & {
  kind: "handoff";
  /** Dimensions still below target — named honestly rather than hidden. */
  thin: DimensionId[];
};

export type Turn = IntakeTurn | ParsingTurn | ConfirmTurn | GapTurn | DnaTurn | HandoffTurn;

export type TurnStatus = "pending" | "answered" | "skipped";

export type TurnRecord = {
  turn: Turn;
  status: TurnStatus;
  answer?: AnswerValue;
};

export type DimensionCoverage = {
  id: DimensionId;
  label: string;
  weight: number;
  /** 0..1 — provisional facts count at PROVISIONAL_WEIGHT. */
  completion: number;
};

export type Coverage = {
  total: number; // 0..1
  dimensions: DimensionCoverage[];
};

export type DnaVisibility = "private" | "employer" | "public";

export type OnboardingSession = {
  candidateName: string | null;
  sourceKind: IntakeSourceKind | null;
  history: TurnRecord[];
  /** Turns not yet shown. The engine refills this as coverage changes. */
  queue: Turn[];
  facts: Fact[];
  visibility: DnaVisibility;
  dnaSummary: string | null;
  completed: boolean;
};

/** What a server action returns so the client reconciles without a refetch (spec §6.2). */
export type SessionPatch = {
  facts: Fact[];
  coverage: Coverage;
  nextTurn: Turn | null;
};

export type OnboardingData = {
  session: OnboardingSession;
  /** Bank the next-question selector draws from. Server-side config, not model output. */
  gapBank: GapTurn[];
  coverage: Coverage;
};

/** NDJSON frames streamed by the parse route (spec §6.3). */
export type ParseStreamEvent =
  | { type: "step"; text: string }
  | { type: "facts"; facts: Fact[] }
  | { type: "error"; message: string };

/** NDJSON frames streamed by the DNA route. */
export type DnaStreamEvent =
  | { type: "delta"; text: string }
  | { type: "done"; summaryMd: string; bestFit: Array<{ role: string; level: string }> }
  | { type: "error"; message: string };
