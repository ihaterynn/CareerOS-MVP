# Candidate Revamp — Application Tracker · Candidate DNA · Resume Studio

**Date:** 2026-07-24
**Branch:** feat/careeros-design-merge
**Source of truth (UI):** `Candidate Frontend Revamp Directions/CareerOS Candidate.dc.html`
**Build brief:** `Candidate Frontend Revamp Directions/INTEGRATION_PROMPT.md`

## Goal

Replace the three current candidate modules (`dashboard | dna | jobby`) with the revamped
**Application Tracker · Candidate DNA · Resume Studio** experience, pixel-matching the reference
HTML. This session: **frontend to full parity with typed in-file mocks**; backend wired behind
typed server-action signatures + Zod contracts that return mocks (clearly-marked TODOs). Employer
side untouched.

Scope decisions (confirmed):
- FE: all 3 screens, full parity.
- Data: in-file typed mock exports (no Supabase calls this session).
- Backend specs written now: Supabase schema/RLS/enums, server actions + Zod, LLM/agent + export services.

**Dependency prerequisite:** add `zod` now and write `schema.ts` files as real runtime validators
for the mock actions. `zod` is not in `frontend/package.json`; it is not a paid dependency.
`@supabase/*`, Supabase project configuration, generated database types, and live calls are deferred
to the backend phase. Do not hand-write generated Supabase types.

**Backend-artifact boundary for this session:** feature domain types, Zod schemas, mock queries, and
server-action signatures are code deliverables. The tables/RLS below are the approved migration
design, not a claim that a Supabase project exists today. Add executable SQL migrations and generate
Supabase types only after a Supabase project/configuration is available; keep their paths and README
instructions as future-phase work.

---

## 1. Reuse map (audited — do not rebuild)

| Concern | Reuse | Path |
|---|---|---|
| Design tokens, themes, accents | `globals.css` — light/dark, gold/indigo, `--shadow-*`, `--r-*` | `frontend/app/globals.css` |
| Animations | `fade-up`, `greenflash`, `dot-bounce`, `sheen`, `pop-in`; `.anim-fade-up`, `.anim-pop` | `globals.css` |
| Shell (header/sidebar/portal switch/theme/drawer) | `WorkspaceShell` — data-driven off `shellNav` | `frontend/src/components/workspace-shell.tsx` |
| Nav | `nav-config.ts` — driven by `candidateModules` + `CandidateModuleId` | `frontend/src/components/nav-config.ts` |
| Primitives (CSS-var, inline-style) | `Card, Button, Badge, Avatar, ProgressRing, Gauge, Tabs, SignalBar, Popover, Skeleton, Modal, Stat, Confetti` | `frontend/src/components/ui.tsx` |
| Candidate primitives (Tailwind `@theme`) | `KpiCard, ModuleCard, ScoreBar, Tag, Collapsible` | `frontend/src/modules/candidate/components/candidate-ui.tsx` |
| Icons | `Icon` + typed `ICONS` map — extend, never re-import lucide per component | `frontend/src/components/icon.tsx` |

**Primitive choice:** reference HTML is CSS-var + inline-style. Build screens on `components/ui.tsx`
(`Card`, `Button`, `Badge`, `Stat`, `Tabs`, `Modal`, `SignalBar`, `Skeleton`, `Confetti`) — closest
1:1 match and richest. Reach for `candidate-ui.tsx` (`Tag`, `ScoreBar`) where lighter. Do **not**
introduce a third parallel primitive set.

**Token name deltas (ref HTML → repo):** ref uses `--good/--good-bg/--warn/--bad`; repo uses
`--risk-good/--risk-good-bg/--risk-warn/--risk-bad`. `greenflash`/`dot-bounce` keyframes already use
the repo names — use repo names everywhere.

**Missing animation to ADD** (one keyframe, `globals.css`): the drawer slide-in.
```css
@keyframes slide-in { from { opacity:0; transform: translateX(24px); } to { opacity:1; transform:none; } }
.anim-slide { animation: slide-in .4s var(--ease) both; }
```
Reduced-motion `*` gate already covers it. Add nothing else to `globals.css`.

---

## 2. Routing + nav changes

Three typed edits; TS `Record<CandidateModuleId, …>` forces all sites to update together.

1. `packages/shared/src/index.ts`
   ```ts
   export type CandidateModuleId = "tracker" | "dna" | "studio";
   ```
2. `frontend/src/modules/candidate/candidate-data.ts` — rewrite `candidateModules`:
   ```ts
   export const candidateModules: Array<NavigationItem<CandidateModuleId>> = [
     { id: "tracker", label: "Application Tracker", description: "Every role, every company — pipeline, funnel, reminders." },
     { id: "dna",     label: "Candidate DNA",       description: "Your profile decoded — traits, instruments, best-fit roles." },
     { id: "studio",  label: "Resume Studio",       description: "Tailor to any JD, review AI diffs, export ATS-safe PDF/DOCX." }
   ];
   ```
3. `frontend/src/components/nav-config.ts` — icons + default href:
   ```ts
   const candidateIcons: Record<CandidateModuleId, ShellNavItem["icon"]> = {
     tracker: KanbanSquare, dna: Dna, studio: FilePenLine
   };
   // shellNav.candidate.defaultHref = "/candidate/tracker"
   ```
   `icon.tsx`: add `kanban → KanbanSquare`, `dna → Dna`, `filePen → FilePenLine` to `ICONS` (nav
   uses lucide directly via `ShellNavItem.icon`, but feature UI uses `Icon` name map — register there).

**Route directories** under `frontend/app/(workspace)/candidate/`:
- delete `dashboard/`, `jobby/` (and old `dna/` page body — route slug kept, rebuilt)
- create `tracker/`, `dna/`, `studio/`, each with:
  - `page.tsx` — **Server Component**. Imports typed data from feature `queries.ts` (mock now),
    passes plain typed props into the client panel. No secrets/keys client-side.
  - `loading.tsx` — Skeleton layout matching the screen (stat-card row, rail, table shell).
  - `error.tsx` — `"use client"` boundary, retry button.
- render explicit **empty states** (no applications / no assessments taken / no résumé uploaded).

**Delete stale candidate code** now unreferenced after the module swap (grep-verify each first):
- Panels: `candidate-dashboard-panel.tsx`, `candidate-dna-panel.tsx` (rebuilt), `jobby-ai-panel.tsx`,
  `dna-helix-scene.tsx` (if unused by new DNA).
- `candidate-header.tsx` (`CandidateHeader`) — only imported by the old dashboard/jobby/dna pages;
  dead once those routes are replaced. New pages render their own headers per the ref design.
- Data arrays + their types only the deleted panels consumed: `jobListings`/`CandidateJob`,
  `careerPathRoutes`/`CareerPathRoute`/`CareerRouteCourse`, `careerTwins`/`careerTwinContext`/
  `CareerTwin`/`TwinMilestone`, `courseRecommendations`/`CourseRecommendation`,
  `candidateApplications`/`CandidateApplication` (old shape — superseded by tracker `Application`),
  and `registrationSteps` (dashboard-only).
- Keep `candidateProfile`, `skillSignals`, `candidateModules` (reused by new DNA / nav).

Run `tsc` after deletion — the `CandidateModuleId` change + removed exports surface every stale
reference at compile time. Clear `.next/types` cache (stale route types persist after route dir
deletion).

---

## 3. Feature module layout (co-located per route)

```
frontend/src/modules/candidate/
  tracker/
    types.ts        — Application, StatusEvent, Contact, Stage/Status enums (import shared enums)
    mock.ts         — 10-app semantic seed (ported from ref HTML `state.apps`)
    queries.ts      — typed reads (return mock now; TODO: Supabase)
    schema.ts       — Zod: AddApplication, MoveStage, UpdateContact
    actions.ts      — "use server" stubs: createApplication, moveStage, updateNextAction (TODO+mock)
    components/
      tracker-panel.tsx   ("use client" — owns view state, drag, drawer)
      stat-cards.tsx, funnel-rail.tsx, applications-table.tsx, board.tsx, detail-drawer.tsx
      add-application-modal.tsx
  dna/
    types.ts, mock.ts, queries.ts, schema.ts, actions.ts
    components/
      dna-panel.tsx ("use client" — tab state)
      profile-tab.tsx (identity header, instrument badges, trait radar+bars, AI summary editable, best-fit, consent cycle)
      assessments-tab.tsx (instrument list, question flow, live result, completion)
  studio/
    types.ts, mock.ts, queries.ts, schema.ts, actions.ts
    stream.ts       — future chat stream protocol/service helpers (not a Server Action)
    components/
      studio-panel.tsx ("use client")
      scoreboard.tsx, resume-document.tsx (contentEditable sections), review-queue.tsx,
      agent-chat.tsx (streaming-ready), export-panel.tsx
  candidate-data.ts   (keep candidateProfile, skillSignals, candidateModules)
  candidate-ui.tsx    (shared candidate primitives)
```

**Server/client split:** `page.tsx` server-fetches; only interactive leaves are `"use client"`
(board drag, drawer, chat, assessment flow, contentEditable editors, tab/toggle state).
Optimistic UI for stage moves via `useOptimistic`; revert on server error.

**Mock mutation contract (this session):** each client panel owns the authoritative in-memory
snapshot initialized from `queries.ts`. Mock actions validate input and return a typed record/patch;
the panel reconciles that response into local state. They must not use module-global server state or
claim persistence across requests/reloads. A reload intentionally restores seed data. This preserves
the future server-action signatures without making the mock UX depend on non-persistent server state.

---

## 4. Feature 1 — Application Tracker (`/candidate/tracker`)

Recreate ref lines 116–209 + drawer 431–449 + toast 452–454 exactly.

**Layout**
- Header: kicker "Application Tracker", serif h1 "Every role, every company", subline
  `{appCount} applications across {companyCount} companies · 3 active this week`.
  Right: Table⇄Board segmented toggle + gold "Add application" button.
- Stat row: `grid-template-columns: repeat(4,1fr) 1.3fr`. Four `Stat`-style cards
  (Response rate, In progress, Avg time in stage, Offers) + dark "Next up" card
  (`linear-gradient(135deg,#14223D,#20304f)`, accent-2 kicker).
- Body grid `260px minmax(0,1fr)`:
  - **Funnel rail** (`Card`): kicker "Pipeline funnel"; 5 indented stage rows
    (Saved 0 / Applied 8px / Screening 16px / Interview 24px / Offer 32px), each a bar with
    left-border stage color + count. Divider → Response rate big serif number + ▲8% + median line
    → divider → Reminders (warn + good pills).
  - **Table ⇄ Board** (right):
    - **Table:** header row (Role·Company / Stage / Source / Match) grid `1.9fr 1fr .9fr .7fr`;
      clickable rows open drawer; rejected/ghosted rows dimmed `opacity .6`. Sort order:
      Interview, Offer, Screening, Applied, Saved, Rejected, Ghosted → then match desc.
    - **Board:** 6 columns `repeat(6,minmax(150px,1fr))` overflow-x auto, HTML5 drag between
      stages. Cards show avatar, role, company, `SOURCE · match%` mono tail.

**Status vs board columns (distinct models):** `application_status` is the 7-value enum in §7.1
(`saved|applied|screening|interview|offer|rejected|ghosted`). The board renders **6 columns**, not
7 — the last column "Rejected / Ghosted" ("Closed") groups both terminal statuses:
```ts
type BoardColumnId = "saved" | "applied" | "screening" | "interview" | "offer" | "closed";
// column membership: stageOf(a) = (a.status === "rejected" || a.status === "ghosted") ? "closed" : a.status
```
Drop rules: dropping into one of the five non-closed columns sets `status` to that matching
`application_status`; dropping into `closed` sets `status = "rejected"` (ghosted is inbound-only —
an app becomes ghosted via time/no response, never by drag). `BoardColumnId` is board-UI-only; it
is never persisted — only `application_status` is stored.

**Detail drawer** (fixed overlay + `.anim-slide` aside, 380px): avatar, role, company·loc·mode,
status/match/salary pills, **status timeline** (dotted vertical connector), Next-action card
(due-tone colored), buttons **"Tailor résumé →"** + Notes, Contact block. See §6 for the deep-link
target and Studio initialization.

**Analytics math** (client-derived from apps, mirrors ref `renderVals`):
- `appliedN = apps where status !== "Saved"`
- `responded = status in {Screening,Interview,Offer}`
- `responseRate = round(responded/appliedN*100)`
- `inProgress = status in {Applied,Screening,Interview}`
- funnel counts per stage; `stageOf` per the board-column mapping above.
- **`avgTimeInStage` is NOT derivable from the current mock `apps`** (no per-stage timestamps). The
  ref hard-codes `6.2`. This session: keep it **explicit mock data** — a literal in `tracker/mock.ts`
  (e.g. `analytics: { avgDaysInStage: 6.2, slowestStage: "screening" }`), rendered as-is. Do not
  fake a client computation.
- **Backend rule (for `avgTimeInStage` query helper):** compute from `application_status_events`.
  Time-in-stage for a status = `(next event's occurred_at) − (this event's occurred_at)`; for the
  **current open stage**, use `now() − last event's occurred_at`. Average across apps per stage.
  A **reopened** application (a later event returning to an earlier status) starts a fresh interval —
  sum all intervals for that status, don't collapse them. Exclude terminal stages
  (`rejected`/`ghosted`) from the "slowest stage" pick.
Server equivalents specified in §7 as query helpers.

**Data (mock now):** port all 10 apps' semantic data from ref HTML `state.apps` (lines 502–511) into
`tracker/mock.ts` as typed `Application[]`, including `timeline`, `contact*`, `next`, `dueTone`.
Port the *semantic* values, not its presentation fields: normalize `status`, `source`, and `work_mode`
to the shared lowercase unions; derive title-case labels, colors, and avatar styles in the view. Map
the reference label `Remote-first` to domain value `remote` and render it back as `Remote-first`.

**Interactions:** Add-application → `Modal` (manual entry + optional paste-JD-URL-to-prefill);
submit calls `createApplication` action (mock → toast). Stage move → `useOptimistic` + `moveStage`
(writes a status event server-side; mock now). Toast component (ref 452) for all confirmations.
In this mock phase, a pasted URL is stored as `jd_url` only; do **not** fetch or scrape arbitrary
URLs in the browser or server. A real prefill service is a later server-side, allowlisted/SSRF-safe
capability with its own product and legal review.

---

## 5. Feature 2 — Candidate DNA (`/candidate/dna`)

Recreate ref lines 211–325 exactly. Two tabs via `Tabs` primitive: **Profile** / **Assessments**.

**Profile tab** (`Card`, overflow hidden):
- Identity header: 72px gradient avatar "AR", serif name "Aishah Rahman",
  `Software Engineer · Petaling Jaya · Parsed from résumé v3 · 96% depth`, skill pills (+N more),
  visibility pill + **"Manage sharing"** button.
- Grid `1fr 340px`:
  - Left: instrument badges row (MBTI `INTJ-A`, DISC `C·D`, Enneagram `5w6` — colored top-borders
    accent/info/good), trait **radar SVG** (hex, ref line 249 polygon points reused) + **trait bars**
    (Analytical 92, Structure 82, Ownership 85, Collaboration 62, Communication 56).
  - Right (`surface-2`): **AI DNA summary** — badge "AI-GENERATED · EDITABLE", `contentEditable`
    div (onBlur saves), Best-fit roles list (Backend Platform Strong / Data Products Good /
    People Management Stretch), dashed self-report disclaimer.

**Assessments tab** (`Card`, grid `240px 1fr 280px`, min-height 520):
- Left: instrument list (MBTI 60q, DISC 28q, Enneagram 45q) — state label (Done ✓ / In progress /
  Not started), progress bar when started-not-done, result when done, Start/Resume/Retake CTA;
  active instrument gets accent ring glow.
- Center: three states — **idle** (pick-an-assessment empty state), **running** (question header
  `{label} · Question n of total` + time-left mono, progress bar, serif question text, 5 Likert
  option buttons, Back button, "Answers auto-save"), **done** (`.anim-pop` check, big serif result,
  blurb, "View in DNA profile →").
- Right (`surface-2`): live **emerging result** — label, big type (`INTJ?` while running, locked at
  end), MBTI axis bars (I/E N/S T/F J/P) or DISC bars, reliability note.
- **Question pool + results are DISPLAY-ONLY MOCK this session.** `QPOOL`/`LIKERT` (ref 480–488)
  and the fixed results (`INTJ-A`, `C·D`, `5w6`) drive the UI flow only. They are **not** a real
  instrument and must not be scored or presented as a real MBTI/DISC/Enneagram result to a
  candidate in production. Mark `dna/mock.ts` clearly `// DISPLAY-ONLY — not a validated instrument`.
  The UI must visibly label the flow/results **Demo — not a validated assessment**, and mock
  results must not be included in real sharing/export payloads.
- **Production gate (blocker before shipping real assessments):** using the names MBTI / DISC /
  Enneagram requires a **named, approved question bank + license** and a documented scoring spec
  (item-to-dimension mapping, reverse-scored items, thresholds, `instrument_version`). MBTI® and
  DISC® are trademarked/licensed — either license them or ship an **open, unencumbered alternative**
  (e.g. IPIP-based Big Five) and label it as such. Until that is chosen and approved, the
  Assessments tab stays a demo flow. See §7.5.
- Answering advances progress; Back decrements; auto-save writes via `saveAnswer` action (mock now).

**Consent/privacy (must-hold contract):** DNA visibility default **private**; explicit opt-in to
share; revocable; RLS-enforced server-side (§7). AI summary editable by candidate before sharing;
self-report disclaimer always visible. The control must **open a sharing dialog, not cycle state**:
leaving Private requires confirmation; Employer sharing requires selecting the specific employer;
Public link requires confirmation and shows a revoke control. For this session those flows are
in-memory mocks, but they must use the same explicit choices and never silently publish data.

---

## 6. Feature 3 — Resume Studio (`/candidate/studio`)

Recreate ref lines 327–425 + accept/flash logic (lines 752–787) exactly.

**Layout** grid `minmax(0,1fr) 340px`:
- Header: kicker "Resume Studio", serif "Tailor & export"; right = JD picker (cycles JDs,
  re-analyses) + résumé-version pill.

**Deep-link from Tracker:** drawer "Tailor résumé →" navigates to
`/candidate/studio?applicationId=<id>`. Studio `page.tsx` reads the `applicationId` search param
(Server Component), loads that application + its linked/target JD via `queries.ts`, and initializes
the JD picker to that application's JD and the résumé-version pill to the app's `resume_version_id`
(fallback: candidate's active version). No `applicationId` → default JD + active résumé. The
client panel receives the resolved initial selection as props (no client-side param parsing).
- **Left:**
  - **Scoreboard** `repeat(4,1fr)`: ATS match % (accent, animated fill), Keywords `covered/total`,
    Format (✓ ATS-safe), Suggestions `pending` + `accepted`.
  - **Missing-keyword strip:** red chips; "All JD keywords covered 🎉" when empty.
  - **Résumé document** (`Card`, `--shadow-lg`): name/title/loc/email header + version mono;
    Summary (contentEditable), Experience sections with contentEditable bullets, Skills chips
    (matched keywords highlighted accent). Click/highlight-to-edit; edited bullet flashes
    `greenflash` on accept.
- **Right rail** (sticky):
  - **Review queue:** suggestion cards (mono tag e.g. `REWRITE · XYZ FORMULA`, body text) with
    **Accept / Reject**. Accept → rewrites the target bullet/summary, removes matched keyword from
    missing, bumps ATS by `delta`, green-flashes the bullet, toast `Edit applied · ATS match +N%`.
    Resolved cards dim + show ✓Accepted/✕Rejected. Empty → "Queue clear. Ask the agent for more ↓".
  - **Agent chat:** header (avatar, "Resume Agent", online/thinking status), scrollable messages
    (bot left / user right bubbles), **thinking dots** (`dot-bounce`), input + send.
    On send → append user msg, show thinking, then (mock now) append bot reply + push a new pending
    suggestion into the queue. Wire to streaming endpoint in §7.
  - **Export panel:** template picker (ATS Clean / Modern thumbnails), Export PDF (gold) + DOCX.

**AI safety (must-hold):** suggestion-first with clear diffs — never silently overwrite; no
fabricated experience (only reframe real work); no keyword stuffing; human-in-the-loop accept/reject;
label AI content. Accepted tailored résumé saved as a new resume version linked to the application
(so Tracker knows which résumé went where) — server side §7.

**Editing/versioning:** `contentEditable` fields are plain text only (`innerText`); do not persist or
render user/AI HTML. Validate and length-limit all edited text with the Studio Zod schema. In the
mock session edits update only local draft state. In the backend phase, both a manually saved draft
and an accepted suggestion create a new immutable `resume_versions` row; never mutate a historical
version in place.

**Data (mock now):** port `state.resume`, `state.suggestions`, `state.chat`, `JDS`, `missing`,
`matchedKw`, `atsScore`, `templates` from ref (lines 515–536, 663–702) into `studio/mock.ts`.

---

## 7. Backend specs (written now; implemented later)

Enable RLS on every table. Candidate-owned tables are scoped to `auth.uid()`; `companies` and DNA
sharing use the explicit policies below. Migrations are SQL files (tables + enums + policies) — never
hand-edit the DB. Generate Supabase types only in the configured backend phase; share domain enums
via `packages/shared`. Validate every input with Zod on client **and** server. Server actions are
server-side only; LLM/export keys never exposed; rate-limit agent calls.

### 7.1 Enums (shared + Postgres)
```
application_source : careeros | linkedin | referral | other
application_status : saved | applied | screening | interview | offer | rejected | ghosted
work_mode          : hybrid | remote | onsite
assessment_kind    : mbti | disc | enneagram
dna_visibility     : private | employer | public
```
Mirror in `packages/shared` as string-literal unions; Tracker's client `stageOf`/status colors key
off these.

### 7.2 Schema (Supabase)
- `companies` — id, name, logo_url, website. (reuse if present)
- `applications` — id, candidate_id→profiles, company_id (nullable), company_name_freetext,
  role_title, jd_text, jd_url, source, status, applied_at, resume_version_id (nullable fk),
  next_action, next_action_due, salary_range, location, work_mode, created_at, updated_at.
- `application_status_events` — id, application_id, from_status **nullable**, to_status, note,
  occurred_at. Creation writes the initial `null → saved|applied` event; every later transition
  writes one row. This makes timeline and time-in-stage analytics well-defined.
- `application_contacts` — id, application_id, name, role, email, linkedin, notes.
- `resumes` — id, candidate_id, active_version_id (nullable), created_at. One résumé lineage per
  candidate (or per named résumé if product later supports multiple lineages).
- `resume_versions` — id, resume_id, version_number, parent_version_id (nullable), source,
  created_at. Each accepted tailor/edit creates an immutable new version; `applications.resume_version_id`
  references this table.
- `resume_sections` — id, resume_version_id, section_kind, position, content jsonb. Raw files live
  in Storage under a candidate-owned path and are associated with the source version. Parsed
  experience, education, skills, projects, and certifications are versioned here.
- `assessments` — id, candidate_id, instrument (assessment_kind), raw_answers jsonb, results jsonb,
  instrument_version, completed_at. **Real, properly-licensed/open scored question banks** — no
  hardcoded shortcut; store instrument_version.
- `dna_profiles` — id, candidate_id, summary_md, visibility (dna_visibility), updated_at.
  **Default private; explicit opt-in; RLS-enforced; revocable.**
- `dna_shares` — id, dna_profile_id, grantee_employer_id, granted_at, revoked_at (nullable).
  (per-employer grant for `visibility="employer"`)
- `dna_share_links` — id, dna_profile_id, token_hash (hash of a random ≥128-bit token, unique),
  created_at, revoked_at (nullable), expires_at (nullable). Return the raw token only once when
  creating the link; store only its hash. (unguessable public link for `visibility="public"`)

**RLS:**
- Owner-only read/write on candidate-owned tables (`candidate_id = auth.uid()`, or join to the
  owning application for `application_status_events` / `application_contacts` / `resume_sections`).
- `companies` has **no** `candidate_id` — it is shared reference data, not owner-scoped. Policy:
  **read = any authenticated user**; **write = service role / admin only** (candidates never
  insert companies directly; free-text company names live on `applications.company_name_freetext`,
  and a backend job promotes them to `companies` rows). Never expose company write to candidate
  sessions.
- `resume_versions` and `resume_sections` inherit candidate ownership through their parent résumé/
  version; Storage policies use the same candidate-owned path. Do not rely on a client-supplied
  candidate ID when resolving either a row or a file path.

**Employer-identity prerequisite:** `dna_shares.grantee_employer_id` must reference the canonical
employer organization table, and RLS must derive the caller's organization membership server-side.
This repository does not yet define that organization/membership model. Choose and document that
source before writing the migration; do not substitute a client-supplied employer ID or grant every
authenticated employer access.

**DNA visibility — exact semantics (security-critical, do not simplify):**
- `visibility = "private"` (default): readable only by the owner. No exceptions.
- `visibility = "employer"`: readable by an **explicitly authorized employer audience**, not "any
  employer". Requires a `dna_shares` grant table — `id, dna_profile_id, grantee_employer_id,
  granted_at, revoked_at (nullable)`. RLS allows an employer to read a `dna_profiles` row only when
  `visibility = "employer"` **and** a matching non-revoked `dna_shares` row exists for their org.
  Candidate grants/revokes per employer; revocation sets `revoked_at` and cuts access immediately.
- `visibility = "public"`: **never** means "row is world-readable by policy" — that would expose
  every candidate's DNA. Public sharing is via an **unguessable, revocable share token**:
  `dna_share_links` — `id, dna_profile_id, token_hash (hash of random ≥128-bit token), created_at,
  revoked_at (nullable), expires_at (nullable)`. The public page hashes the presented token, then
  looks up a valid (non-revoked, non-expired) link via a **service-role read**, returning only whitelisted
  summary fields — it does **not** rely on a permissive RLS SELECT on `dna_profiles`. RLS on
  `dna_profiles` itself stays owner-only for SELECT; token access is server-mediated. Revoking a
  link sets `revoked_at`; the page 404s thereafter.
- All three: `dna_profiles` remains **owner-writable only**. "Manage sharing" in the Profile tab
  drives grants/links/revocation through `setVisibility` + grant/revoke actions (§7.4).

### 7.3 Zod schemas (`schema.ts` per feature, shared client/server)
- Tracker: `AddApplicationInput` (optional `status` defaults to `saved`; optional `jdUrl` must be
  an `http`/`https` URL but is not fetched this session), `MoveStageInput {applicationId, toStatus,
  note?}` where `toStatus` is only `application_status` — never `BoardColumnId` —
  `UpdateNextActionInput`, `UpsertContactInput`.
- DNA: `SaveAnswerInput {instrument, questionId, value}`, `SetVisibilityInput {visibility}`,
  `EditSummaryInput {summaryMd}`.
- Studio: `AnalyzeAtsInput {jdText, resumeVersionId}`, `AcceptSuggestionInput`,
  `ChatInput {message, resumeVersionId, applicationId?}`, `ExportInput {resumeVersionId, template, format}`.

### 7.4 Server actions (`actions.ts`, `"use server"` — stubs now, TODO+mock)
- Tracker: `createApplication`, `moveStage` (writes status event), `updateNextAction`, `upsertContact`.
- Analytics query helpers: `funnelCounts`, `responseRate`, `avgTimeInStage` (SQL over status_events).
- DNA: `saveAnswer` (auto-save), `scoreAssessment` (server scoring against question bank),
  `setVisibility`, `saveSummary`, `grantEmployerAccess {employerId}` / `revokeEmployerAccess`,
  `createShareLink` (mints token) / `revokeShareLink`.
- Studio actions: `analyzeAts`, `acceptSuggestion` (creates new resume_version linked to
  application), `exportResume` (PDF/DOCX to Storage + download URL). `chatWithAgent` is the
  authenticated Route Handler/service described in §7.5, not a Server Action.

Every stub returns a typed record/patch (or the documented mock analytics result) with a
`// TODO(backend): …` marker so wiring the real service is drop-in against an unchanged signature.
They follow the mock-mutation contract in §3: validation failures reject, successful results are
reconciled by the client panel, and no result implies durable storage. `createShareLink` returns the
raw share URL only at creation time; subsequent reads expose link metadata, never the raw token.

### 7.5 LLM / agent / export services (spec)
- **Streaming Resume Agent** — OpenRouter API, server-side only, keys never exposed, rate-limited.
  Tool/function-calling: `analyze_ats(jd, resume)`, `rewrite_bullet`, `suggest_keywords`,
  `apply_edit`. Suggestion-first, no silent overwrite, no fabrication, no keyword stuffing.
  Use `OPENROUTER_API_KEY` only in the server environment and select the OpenRouter model by an
  explicit server-side configuration value. Pin the model ID for a release and upgrade it
  intentionally rather than relying on an ambiguous "latest" alias.
  The real token stream is the Next Route Handler
  `frontend/app/api/candidate/studio/chat/route.ts`, not a Server Action return value; the mock
  chat uses a local delayed reply. The route authenticates the candidate, validates `ChatInput`,
  rate-limits before invoking the provider, and streams only text/proposed suggestions.
- **Résumé parser** — server parser + LLM structuring pass → `resume_sections` JSON.
- **Assessment scoring** — **blocked on a named, approved instrument** (see §5): license MBTI/DISC/
  Enneagram, or adopt an open alternative (e.g. IPIP Big Five) and relabel the UI. Requires
  real item bank with reverse-scored checks, documented scoring spec, server-side scoring, stored
  `instrument_version`. The ported `QPOOL` is display-only and must be replaced, not scored.
- **Export** — server-side HTML→PDF + DOCX builder, ATS-friendly template(s), deterministic layout,
  selectable text, no rasterization. Replaces the current jsPDF export; reuse its section structure.
  Save to Storage + direct download.

Ask before adding any paid third-party dependency **or usage-billed vendor/API** (including LLM,
PDF/DOCX generation, scraping, or assessment providers).

---

## 8. Cross-cutting

- **Auth:** Supabase Auth and server-side session checks. Candidate-owned tables are owner-scoped;
  `companies` and DNA sharing use the explicit exception policies in §7.2 — not a blanket
  "every table is owner-scoped" rule.
- **A11y:** WCAG AA, keyboard nav, focus-visible rings, reduced-motion respected (global `*` gate
  already present).
- **Dialog a11y — Modal must be EXTENDED, not reused as-is.** The current `Modal`
  (`frontend/src/components/ui.tsx:448`) provides Esc-close and backdrop-click only — **no**
  `role="dialog"`/`aria-modal`, no focus trap, no initial-focus, no focus-restore-on-close. Before
  the Add-application modal and any Studio dialog use it, extend `Modal` to add: `role="dialog"` +
  `aria-modal="true"` + labelling (`aria-labelledby`), focus trap (Tab/Shift-Tab cycle within),
  initial focus to first focusable/close, and focus restoration to the trigger on close. The
  **custom detail drawer** is a dialog too and must meet the **same** contract (it is not a `Modal`
  instance — implement trap/restore/roles directly on the drawer aside). This is an accessibility
  basic — not optional.
- **Fonts:** unchanged — `--font-sans` Plus Jakarta Sans, `--font-serif` Source Serif 4,
  `--font-mono` JetBrains Mono.
- **Seed data:** the ported mock set (10 apps, personality results, résumé versions) doubles as
  local-dev seeds when Supabase lands.
- **README:** run steps + required env vars; "Future phases" lists every stubbed server capability.

## 9. Phasing (this session ships FE parity; backend stubbed)

1. Nav/route swap + shared enum + `slide-in` keyframe + icon registrations.
2. Tracker (full UI parity, drag, drawer, analytics, add-modal, optimistic mock moves).
3. DNA (profile + assessments flow + consent).
4. Studio (editor + review-queue accept/flash + agent chat mock stream + export toast).
5. Add Zod schemas, mock queries/action signatures, and README future-phase notes. Keep §7 as the
   approved migration/RLS design; create executable Supabase migrations and generated types only
   once the Supabase project/configuration and employer-identity source exist.

## 10. Verification

- `npm run typecheck`, `npm run lint`, and `npm run build` clean (the shared enum change propagates
  through nav-config's `Record`).
- Employer routes/components unchanged: the candidate change set contains no files under
  `frontend/app/(workspace)/employer/` or `frontend/src/modules/employer/`.
- All three routes render with `loading`/`error`/empty states.
- Reduced-motion: animations gated (verify `.anim-slide` covered by `*` rule).
- Interactions match ref: board drag moves stage (drop→closed sets rejected), accept green-flashes
  + bumps ATS, chat thinking dots, assessment progress + live result, toast confirmations, drawer
  slide-in.
- Dialog a11y: Modal + drawer have `role="dialog"`/`aria-modal`, focus trap, focus restore
  (keyboard-only pass: Tab stays trapped, Esc closes, focus returns to trigger).
- Studio deep-link: `/candidate/studio?applicationId=<id>` initializes JD + résumé version.
- Assessment mock flagged display-only in code; no real MBTI/DISC result presented as validated.
- Mock persistence: add/move/edit/share interactions reconcile in the active client panel; a reload
  restores the seed snapshot and no UI claims the change was saved remotely.

**Blockers explicitly deferred to backend phase (must resolve before those features go live):**
named+licensed (or open-alternative) assessment instrument & scoring; `dna_shares` +
`dna_share_links` token flow for employer/public visibility; `companies` read-any/write-admin
policy; `avgTimeInStage` from status_events. None block this session's FE parity.
