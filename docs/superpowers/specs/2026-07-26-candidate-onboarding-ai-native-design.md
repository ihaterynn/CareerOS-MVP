# Candidate Onboarding — AI-Native Conversational Intake

**Date:** 2026-07-26
**Branch:** main
**Depends on:** `2026-07-24-candidate-revamp-design.md` (§0.1 server boundary, §5 DNA consent
contract, §7 schema/actions/LLM services). This spec extends it; it does not supersede it.

## Goal

Today a candidate signs in and lands in `/candidate/tracker` with a hardcoded profile
(`candidate-data.ts:28`). There is no intake at all — Tracker, DNA, and Studio each assume a
fully-formed candidate that nothing in the product ever creates.

Build the missing front door: a **conversational, AI-native intake** that turns a résumé (or a
LinkedIn URL, or plain talking) into a confirmed profile + Career DNA in one continuous surface.
The candidate never fills a form they didn't have to.

**This session:** frontend to full parity with typed in-file mocks; a pure, unit-tested turn engine;
server actions and route handlers spec'd and stubbed with `TODO(backend)` markers against
final signatures. No Supabase calls, no live LLM calls, no new runtime dependencies.

---

## 1. Design principle — why conversational, not a wizard

A step wizard asks the candidate to supply what the system could already know. The parse is the
product; the conversation exists only to close what the parse missed.

Four properties define "AI-native" here. Every later decision in this spec falls out of them:

1. **Nothing is typed twice.** Parse first, then ask *only* gaps. Questions are derived from a
   coverage model, never from a fixed script.
2. **Coverage-driven, not step-driven.** Progress is `SignalCoverage` per dimension, not "step 3 of
   5". Above `MIN_VIABLE_COVERAGE` the candidate can leave for the workspace at any time and finish
   later — the flow is never a gate.
3. **Every fact is a proposal.** Same suggestion-first contract as Resume Studio (§7.5 of the
   revamp spec): the agent never commits a fact silently. Each fact carries a `source`, and anything
   not grounded in candidate-supplied text is badged `inferred` and requires confirmation.
4. **The profile assembles visibly.** A live rail shows the profile filling in as facts land. The
   candidate watches their DNA build itself — this is the moment the product earns trust, and it is
   why the rail is not optional chrome.

---

## 2. Surface + routing

Onboarding is **full-screen and outside `(workspace)`** — no sidebar, no portal switch, no module
nav. It is a focus surface, not a module.

```
frontend/app/onboarding/
  layout.tsx    # minimal chrome: logo, theme toggle, "Skip for now" escape hatch
  page.tsx      # Server Component — loads session via queries.ts, renders client panel
  loading.tsx   # Skeleton: rail + conversation column
```

- **Not** added to `candidateModules` / `shellNav`. It is not a nav destination.
- `login-gateway.tsx:132` routes on onboarding state: incomplete → `/onboarding`, otherwise
  `shellNav.candidate.defaultHref`. Mock returns "incomplete" so the flow is reachable in the demo.
- **Real gating (backend phase):** `middleware.ts` redirects authenticated candidates with
  `completed_at IS NULL` to `/onboarding` for any `/candidate/**` route, except when the session
  carries `skipped_at` (the escape hatch), which suppresses the redirect until re-invited by a
  workspace nudge. Never gate on a client-supplied flag.

### Layout (three zones, one screen)

```
┌ CareerOS ──────────────────────────────── ☾  Skip for now ─┐
│                                                             │
│  ┌ conversation (minmax(0,1fr)) ─┐  ┌ profile rail 360px ─┐│
│  │ ● Read résumé — 3 roles       │  │  ◕ 68% signal       ││
│  │ ◐ "You listed Go — production │  │  Aishah Rahman      ││
│  │    or side projects?"         │  │  Software Engineer  ││
│  │   [Production][Side][type…]   │  │  ─────────────────  ││
│  │                               │  │  Identity    ✓ 100% ││
│  │                               │  │  Experience  ✓  90% ││
│  │                               │  │  Skills      ◐  60% ││
│  │                               │  │  Preferences ○   0% ││
│  └───────────────────────────────┘  └─────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

Under 1100px the rail collapses to a sticky top summary bar (ring + headline + dimension dots).

---

## 3. The turn model

The whole flow is a queue of typed `Turn`s consumed by a pure reducer. This is the core
abstraction: the UI renders whatever turn is current, and the engine decides what comes next.

```ts
type TurnKind = "intake" | "parsing" | "confirm" | "gap" | "dna" | "handoff";
```

| Turn | What the agent does | What the candidate does |
|---|---|---|
| `intake` | Opens: drop a résumé, paste a LinkedIn URL, paste text, or "just tell me about you" | Supplies a source (or opts to talk) |
| `parsing` | Streams grounded status lines — "Reading résumé…", "Found 3 roles", "Extracted 12 skills" | Watches; rail fills |
| `confirm` | Shows the **whole parse** as one review card, each row inline-editable | `All correct` (one tap) or corrects individual rows in place |
| `gap` | Asks one missing signal, with a typed answer control | Answers via chips / range / location / text |
| `dna` | Streams a draft DNA summary + best-fit roles | Edits inline; sets visibility (default private) |
| `handoff` | Recaps what was built and what's still thin | Enters the workspace |

Confirmation is **batched on purpose**: one yes-tap per parsed fact is a form wearing a chat
costume. The card shows everything the parse recovered at once, with its evidence span under each
row, and correcting a row is an inline edit that does not interrupt the flow.

**Answer controls are declarative** so gap questions stay data, not components:

```ts
type AnswerControl =
  | { kind: "confirm" }
  | { kind: "chips"; options: string[] }            // single-select
  | { kind: "multi"; options: string[]; max?: number }
  | { kind: "range"; min: number; max: number; step: number; unit: string }
  | { kind: "location" }
  | { kind: "text"; placeholder: string; multiline?: boolean };
```

Every turn also accepts free typing — the composer is always live. A typed reply on a `chips` turn
is a valid answer (backend: the LLM maps free text onto the expected shape; mock: stored verbatim).

---

## 4. The fact ledger + coverage model

### Facts

Parsed and answered data lands in a **fact ledger**, not directly on a profile object. This is what
makes the agent re-askable, auditable, and honest about provenance.

```ts
type FactSource = "parsed" | "confirmed" | "inferred" | "self-reported";

type Fact = {
  id: string;
  dimension: DimensionId;
  key: string;              // "role.current", "skill.go", "pref.work_mode"
  value: string | string[] | number;
  source: FactSource;
  confidence: number;       // 0..1 — parser/model confidence
  evidence?: string;        // verbatim span from the source document
};
```

Rules (enforced in the engine, not by convention):
- `parsed` and `inferred` facts are **provisional**. They render with a dashed border + source
  badge and never count as full coverage weight until confirmed.
- Confirming a fact rewrites `source` to `confirmed` and clears `confidence` to 1.
- `inferred` facts (no `evidence` span) must state that they were inferred, in the turn text.
  The model may not present an inference as a reading.
- Facts are append-only in the backend (`candidate_profile_facts`); an edit writes a superseding row.

### Coverage

```ts
type DimensionId = "identity" | "experience" | "skills" | "preferences" | "dna";
```

| Dimension | Weight | Complete when |
|---|---|---|
| `identity` | 0.15 | name, current role, location |
| `experience` | 0.30 | ≥1 role with company + period + ≥1 impact line |
| `skills` | 0.25 | ≥5 skills, each with a level or evidence |
| `preferences` | 0.20 | work mode, salary band, commute/relocation, interests |
| `dna` | 0.10 | summary drafted + visibility explicitly chosen |

`coverage = Σ(weight × dimensionCompletion)`. Provisional facts contribute at
`PROVISIONAL_WEIGHT = 0.5`. `MIN_VIABLE_COVERAGE = 0.55` — above it, "Skip to workspace" activates
and the handoff turn becomes reachable.

**Question selection** is `highest (dimension weight × remaining gap)` first, so the flow always
asks the most valuable unanswered thing next and terminates naturally rather than running a script
to the end.

---

## 5. Module layout

```
frontend/src/modules/candidate/onboarding/
  types.ts                        # Turn, Fact, AnswerControl, Coverage, OnboardingSession
  engine.ts                       # PURE: reducer + coverage + next-question selection (unit-tested)
  engine.test.ts                  # node:test, mirrors employer/onboarding-data.test.ts
  mock.ts                         # scripted parse result + gap bank  // DISPLAY-ONLY
  queries.ts                      # getOnboardingSession() — mock now
  actions.ts                      # "use server" stubs, final signatures
  schema.ts                       # runtime validators (hand-rolled — see §8)
  components/
    onboarding-panel.tsx          # client orchestrator, owns session state
    intake-dropzone.tsx           # file / URL / paste / talk
    conversation.tsx              # turn stream + streaming status lines + composer
    answer-controls.tsx           # renders AnswerControl union
    profile-rail.tsx              # live profile card + coverage ring + dimension list
```

Reuse only (§1 of the revamp spec): `components/ui.tsx` primitives, `globals.css` tokens and
`anim-fade-up` / `anim-pop` / `dot-bounce`, `Icon`, and the tracker `Toast`. No new primitive set,
no additions to `globals.css`.

---

## 6. Backend spec (written now, implemented later)

### 6.1 Schema

```
candidate_onboarding_sessions
  id, candidate_id → profiles, state jsonb (turn queue + cursor),
  coverage jsonb, source_kind (resume|linkedin|paste|conversation|null),
  storage_path text null, started_at, skipped_at null, completed_at null

candidate_profile_facts
  id, candidate_id → profiles, dimension, key, value jsonb,
  source (parsed|confirmed|inferred|self-reported), confidence numeric,
  evidence text null, superseded_by uuid null, created_at
```

**RLS:** owner-only read/write on both (`candidate_id = auth.uid()`). Uploaded source files live in
Storage under a candidate-owned path; the path is derived server-side from `auth.uid()` — never from
a client-supplied candidate id. On `completeOnboarding`, confirmed facts project into
`resume_sections` / `dna_profiles` (revamp spec §7.2) inside one transaction.

### 6.2 Server actions (`actions.ts`, `"use server"`)

`startOnboarding(input)` · `submitAnswer({turnId, value})` · `confirmFact({factId})` ·
`editFact({factId, value})` · `setDnaVisibility({visibility})` · `skipOnboarding()` ·
`completeOnboarding()`

Each returns a typed patch `{facts, coverage, nextTurn}` so the client reconciles without a refetch.
Stubs validate input, return a mock patch, and carry `// TODO(backend):`. Mock success never
implies durable storage.

### 6.3 Route handlers (streaming)

```
frontend/app/api/candidate/onboarding/parse/route.ts   # résumé/URL → streamed status + facts
frontend/app/api/candidate/onboarding/turn/route.ts    # free-text reply → next turn
frontend/app/api/candidate/onboarding/dna/route.ts     # streamed DNA summary draft
```

All three: `runtime = "nodejs"`, `dynamic = "force-dynamic"`, `Cache-Control: no-store`,
`supabase.auth.getUser()` before any work, distributed rate limit keyed on `auth.uid()` (Supabase
counter table — no new vendor), validate input before invoking the provider.

### 6.4 LLM contract

OpenRouter, server-side only, `OPENROUTER_API_KEY` never in the browser bundle, model ID pinned per
release (revamp spec §7.5). Tools:

- `parse_resume(file_text) → Fact[]` — every fact **must** carry an `evidence` span quoted verbatim
  from the input. A fact without a span is rejected server-side and re-emitted as `inferred`.
- `select_next_question(coverage, facts) → GapQuestion` — must return a question for a dimension
  that is actually incomplete; server re-checks against the coverage model before sending.
- `normalize_answer(freeText, control) → value` — maps typed replies onto the expected shape.
- `draft_dna_summary(facts) → {summaryMd, bestFit[]}` — grounded in confirmed facts only.

**No fabrication.** The model may not invent employers, dates, titles, or skills. Server-side
grounding check: every string fact value must appear in, or be normalized from, the source text or a
candidate answer. Failures degrade to a `gap` question — never to a guess.

### 6.5 Privacy + consent

Onboarding inherits the DNA consent contract verbatim (revamp spec §5): **visibility defaults to
private**, leaving private requires explicit confirmation in a dialog, employer sharing requires
naming the employer, public sharing mints a revocable token link. Onboarding **may not** publish
anything as a side effect of completion. The uploaded source file is deletable from the handoff turn
and on account deletion.

The optional personality assessment is **not** part of onboarding — the handoff turn links to it and
it stays labeled *Demo — not a validated assessment* until the licensing gate in revamp spec §5 is
cleared.

### 6.6 A11y

The conversation is a live region: `role="log"` + `aria-live="polite"` on the turn stream, so new
agent turns are announced. Answer controls are real buttons/inputs with visible focus rings; the
composer keeps focus after every send. Streaming status lines announce once, not per token. Reduced
motion is already globally gated.

---

## 7. Build status

**Done — frontend:** `types.ts`, pure `engine.ts` + tests, `mock.ts` (question bank + demo parse),
`schema.ts` validators, all five components, `/onboarding` routes.

**Done — backend:**
- Migration `supabase/migrations/20260727000000_candidate_onboarding.sql` — both tables, the
  rate-limit counter, enums, RLS, storage bucket + policies, and four functions
  (`current_candidate_id`, `consume_rate_limit`, `upsert_candidate_facts`,
  `complete_candidate_onboarding`). **Written and validated locally; not pushed to the linked
  project.**
- Real Supabase Auth: request client (`@supabase/ssr` + cookies), admin client (`server-only`),
  `middleware.ts` session refresh + onboarding gate, `signIn`/`signOut` actions.
- `repository.ts` + real `queries.ts` / `actions.ts` — no mock returns left.
- Route handlers `parse` and `dna`: `runtime = "nodejs"`, `force-dynamic`, `no-store` (including
  on 401/429), auth before any work, Postgres-backed rate limit, NDJSON streaming.
- Local text extraction (`unpdf`, `mammoth`) — the document never leaves the server to be read.
- `grounding.ts` — the anti-fabrication gate, with tests.

**Not built (deliberate):**
- The `turn` route handler from §6.3. Question selection is deterministic in the engine and free
  text is accepted as-is, so the route would only wrap `selectNextGap`. It becomes necessary when
  free-text answers need `normalize_answer` against a control.
- LinkedIn import. The route returns **501 with an explanatory message** rather than a silent empty
  parse — profile fetching has auth-wall and ToS questions to settle first.
- Employer-grant and share-link flows behind the visibility dialog. The dialog records the choice;
  minting tokens and naming grantees is the DNA module's work (revamp spec §7.2).

### Ownership model — read before adding policies

`candidate_profiles` has both `id` (PK, referenced by every candidate-owned table) and a separate
`user_id` (the auth user). **They are not interchangeable.** All policies here resolve ownership
through `public.current_candidate_id()`.

⚠️ The pre-existing `20260726000000_resume_studio.sql` writes its RLS as `auth.uid() = candidate_id`,
which is only correct if `id == user_id`. That migration should be reviewed before it is pushed.

## 8. Dependency note

Added this phase, all free/OSS: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `unpdf`, `mammoth`.
`zod` is installed but `schema.ts` still uses hand-rolled validators behind
`parseX(input): Result<T>` — the signatures are drop-in replaceable by `z.safeParse`.
OpenRouter is the one usage-billed dependency; it is optional at runtime (see §9).

## 9. Running without a model key

`OPENROUTER_API_KEY` is optional. Without it the parse route returns the scripted demo facts and the
DNA route the sample summary — and the stream carries an explicit
`"Demo parse — no model key configured"` step so the UI never implies a real parse happened. Adding
the key switches both routes to live extraction with no code change.

## 10. Verification

- `npm run typecheck`, `npm run lint`, `npm run build` clean.
- `npm test` — 26 tests: coverage math, question selection, provisional weighting, unit formatting,
  and the grounding gate (fabricated employers downgraded, allow-list enforced, malformed output
  dropped).
- SQL verified against local Postgres: migration is idempotent; RLS isolates two candidates;
  cross-candidate writes rejected; rate limiter accurate per route and per window; provisional facts
  excluded from the profile projection; fact upsert keeps exactly one live row per key with history
  intact.
- HTTP boundary verified: `/candidate/**` and `/onboarding` redirect when signed out; both API
  routes return 401 with `no-store`.
- **Not yet verified end to end:** a signed-in candidate completing the flow against a running
  Supabase stack. Needs the migration pushed and a seeded auth user.
