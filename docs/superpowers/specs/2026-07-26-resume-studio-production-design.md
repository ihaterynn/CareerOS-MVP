# Resume Studio — Production-Ready Hackathon Demo

**Date:** 2026-07-26
**Status:** approved for planning
**Scope:** candidate Resume Studio only; existing employer views remain unchanged.

## Hackathon implementation cutline

This is a **reliable demo build**, not a general-purpose enterprise document
platform. This section takes precedence over deeper hardening detail elsewhere in
the document for the first implementation.

Build now:

1. A single demo candidate can upload a text-PDF or DOCX, see parsed sections,
   edit them, save versions to Supabase, and export a CareerOS ATS template as
   DOCX or PDF.
2. Users can paste or upload up to five JDs, see each as a tab, run one cached
   batch analysis with GPT-5.4 Nano, accept/reject suggestions, and explicitly
   refresh stale results.
3. Native text extraction is the main path. Tesseract is an optional scanned-PDF
   fallback; curated hackathon files must not depend on OCR.
4. Original-layout DOCX export is labelled **best effort** and enabled only for
   simple curated DOCX files. Every other document exports through the polished
   CareerOS template.

Defer until after the hackathon:

- arbitrary DOCX round-trip fidelity, XML/ZIP adversarial hardening, and advanced
  original-layout mapping;
- background workers, antivirus, durable retry/cleanup orchestration, complex
  multi-device conflict recovery, and formal retention/purge workflows;
- exhaustive RLS/Storage policy matrices and adversarial prompt-injection
  defenses beyond server-side keys, basic owner checks, schema validation, and
  safe rendering.

Non-negotiable basics remain: OpenRouter and Supabase service keys stay
server-side; users cannot be shown another candidate's data; uploaded content is
rendered as text rather than executable HTML; and failures keep the last saved
version intact.

> **Supersession:** this document supersedes the Resume Studio portions of the
> 2026-07-24 candidate-revamp spec. Its canonical application-table name is
> `candidate_applications`, matching the product data model supplied for this
> project. No migration may introduce a second application table.

## Goal

Turn Resume Studio from a frontend mock into a secure, persistent product flow:

1. Upload a PDF or DOCX résumé.
2. Extract and normalize its content for editing in the frontend.
3. Save edits as immutable résumé versions.
4. Upload or paste one or more job descriptions (JDs).
5. Generate tailored, tab-specific AI recommendations using OpenRouter
   `openai/gpt-5.4-nano`.
6. Export an ATS-friendly PDF or DOCX, preserving an uploaded DOCX layout where
   targeted edits are possible and otherwise using a selected CareerOS template.

The demo should make multi-role tailoring visible: one résumé, several JD tabs,
distinct match results, and one-click branching into tailored versions.

## Product decisions

- Candidates can own multiple independent résumé lineages, such as Software
  Engineer and Data Analyst. A résumé has many immutable versions.
- Direct PII in demonstration data is replaced (name, email, phone, address,
  social URLs, and document metadata). Employers, accomplishments, skills, and
  projects remain so matching is meaningful.
- PDF and DOCX uploads are accepted. Text-based PDFs and DOCX files are parsed
  without OCR. Tesseract.js is an in-browser fallback only for scanned PDFs.
- JD input accepts pasted text and uploaded PDF/DOCX files. Each selected JD is a
  tab in Studio.
- The first analysis is one batch request for all selected JDs. Switching tabs
  reads cached, per-JD results and makes no AI request.
- Saving any edit creates a new version but never calls the AI automatically.
  Semantic analyses are marked stale; the candidate explicitly refreshes one JD
  or all JDs.
- The original DOCX is retained as an export option. Targeted OOXML edits preserve
  its layout where the parsed content can be mapped safely. PDFs cannot be
  round-tripped as editable source documents, so PDF-origin versions export via a
  CareerOS template.
- Supabase Auth, an authenticated server client, a `candidate_profiles.id →
  auth.users.id` ownership mapping, and RLS are prerequisites—not follow-up work.
  The current demo login is replaced rather than adapted.

## Experience

### 1. Upload and parse

The empty Studio screen has a single upload drop zone and clear limits: PDF/DOCX,
at most 10 MB and 10 pages. The browser performs an early type/size check. After
server-side authentication, it receives a one-time signed `PUT` URL for one exact
non-readable `resume-quarantine/{candidateId}/{uploadId}` key. The Node.js route
downloads that object once into the bounded 10 MB buffer, computes its SHA-256,
and validates/parses those exact bytes before uploading the same buffer with
no-overwrite semantics to the candidate-private `resumes` bucket. It persists the
validated hash; it never validates one Storage read then copies a later mutable
read. Invalid or partial uploads are deleted.

For this hackathon slice, parsing is a bounded synchronous Node.js request, not
a background job: the client presents the stages uploading, extracting, OCR
fallback, structuring, and ready while awaiting the validated response. Documents
above the configured limit receive a clear rejection rather than an unimplemented
queue state.

Uploaded JDs use the same authenticated quarantine, validation, and bounded
parse policy as résumés, but their validated source path is
`{candidate_id}/job-descriptions/{jd_id}/source/{content_hash}`. They have the
same PDF/DOCX, 10 MB, and 10-page limits; a pasted JD never creates a source
object. Parsed text creates the `resume_job_descriptions` row only after
validation. JD source objects follow owner RLS and are deleted by the same
idempotent cleanup flow as their JD row.

DOCX parsing extracts supported visible body paragraphs, lists, and table cells
with stable node IDs, document-part paths, run boundaries, and original-text
hashes. PDF parsing first uses selectable text. When extraction is empty or below
a text-density threshold, the browser renders sequential pages with PDF.js and
uses self-hosted English-first Tesseract.js worker/language assets. It limits each
page to 4M pixels, supports cancellation, and caps the document at 10 pages. OCR
is opt-in at the fallback step and stays in the browser; only the resulting text
is submitted to the server with a one-time OCR session and the validated source
hash. The session is candidate-scoped, expires in 15 minutes, and is consumed
atomically. The browser may OCR its still-held File only after local SHA-256
matches the session hash; after refresh it can request a session-bound signed GET
of the exact validated source. A low-confidence page—not a guessed résumé
section—is flagged for user correction.

The parser produces a canonical `ResumeDocument` JSON object with contact,
summary, experience, education, skills, certifications, projects, and ordered
unmapped blocks. The user can edit every extracted field before it becomes the
current version.

`ResumeDocumentV1` is a versioned Zod contract, not an informal JSON blob:

- document fields: `schema_version`, `sections`, and ordered `unmapped_blocks`;
- every section/node has a stable `id`, `kind`, ordered children, and text/value;
- imported node IDs are deterministic hashes of source file hash, OOXML/PDF path,
  and ordinal; child versions preserve IDs, while newly inserted nodes use UUIDs;
- canonical serialization sorts object keys but preserves ordered arrays; its
  SHA-256 is the `content_hash` used by versions, evidence, and analysis caches;
- allowed edits are a small discriminated union: `replace_text`, `append_bullet`,
  `add_skill`, `remove_node`, and `move_node`. Each identifies a target/parent
  node and requires the relevant `before_hash`.

Unknown structures remain read-only unmapped blocks until the candidate moves
their content into a supported field. This makes parsing, patching, evidence
validation, and exports deterministic.

The concrete grammar is:

```ts
type ResumeDocumentV1 = {
  schema_version: "resume-document/v1";
  sections: ResumeSection[];
  unmapped_blocks: UnmappedBlock[];
};
type ResumeSection = { id: string; kind: "contact" | "summary" | "experience" | "education" | "skills" | "certifications" | "projects"; nodes: ResumeNode[] };
type ResumeNode = { id: string; kind: "text" | "bullet" | "skill" | "entry"; text?: string; children?: ResumeNode[]; source_ref?: string };
type UnmappedBlock = { id: string; kind: "unmapped"; text: string; reason: "unsupported_structure" | "low_confidence_ocr" };
```

`before_hash` is SHA-256 of UTF-8 canonical JSON for one node (sorted object keys,
NFC-normalized strings, and original child order). `replace_text` requires an exact
target hash and only patches a source-mapped DOCX node when its server-owned mapping
is patchable. `resume_source_mappings` is a server-only table keyed by
`(resume_version_id, node_id)`: it holds the original text hash and mapping details;
the browser can neither read nor submit OOXML paths, run offsets, or patchability.
Mappings are limited to allow-listed visible body paths in `word/document.xml`, have
non-negative safe-integer run bounds, and are revalidated against the origin bytes
immediately before Original export.

The Zod schema enforces unique IDs, at most 20 sections, tree depth at most three,
at most 250 nodes, and 10,000 NFC-normalized characters per node. Summary/contact
sections accept text nodes; skills accept skill nodes; experience, education,
certifications, and projects accept entry nodes containing text/bullet children.
All other kind-parent pairs are rejected. `replace_text` requires an exact
target hash and only patches a source-mapped DOCX node when its server-owned mapping
is patchable.

`append_bullet` and `add_skill` require a compatible parent section and mint a new
UUID node. `remove_node` requires a direct child of a mutable section. `move_node`
requires an existing source/target parent and preserves the node ID. Every operation
is rejected if its precondition or postcondition fails.

### 2. Editing and versioning

Studio renders the canonical document in the selected template, with ordinary
form controls and controlled textareas instead of unconstrained `contentEditable`
state. Debounced autosave writes only a browser recovery draft in `sessionStorage`,
scoped to candidate/resume/base-version, expiring after 30 minutes, and cleared on
save, logout, and tab close; it is never synced to the server. Explicit Save or
accepted AI edits call a transaction that creates one immutable child version.
The transaction receives `base_version_id`, locks the résumé lineage, assigns a
unique version number, and changes `active_version_id` only if the expected base
is still current. Otherwise the UI shows a conflict and lets the candidate branch
or reload. The version rail shows lineage, source (upload/manual/AI), target
role, and analysis freshness.

Accepting an existing suggestion verifies its target node and `before_hash`, then
applies its structured patch and saves a child version without another model
request. Deterministic checks—section completeness, word count, duplicate bullet
detection, and exact JD keyword coverage—update on the client/server without AI.

### 3. JD tabs and recommendations

The top rail holds `+ Add JD` and a tab for every selected job. A tab displays:

- overall match score and exact keyword coverage;
- matched and missing requirements;
- ranked, reversible recommendations with before/after text;
- an explainable reason and evidence from the résumé;
- a `Refresh this JD` action when the result is stale.

`Analyze all roles` sends one request containing the normalized résumé, all
selected JDs, and a strict JSON schema. The response is stored once per run and
split into per-JD result rows. A tab is a keyboard-accessible `tablist`/tabpanel
and only changes presentation state. Analysis freshness is derived from its
`resume_version_id`; historical records are never mutated to add a stale flag.
`Refresh all` submits one new batch; `Refresh this JD` sends the current version
and only that JD. A candidate can branch a targeted version from a tab and link
it to an existing `candidate_applications` record.

### 4. Export

The export selector offers `Original` for DOCX-origin documents when safe,
alongside a deliberately small set of CareerOS ATS templates. The template
preview is generated from the canonical content. Exports create a private Storage
artifact and a short-lived download URL; they never overwrite the uploaded file.

PDF export is generated from the selected template. DOCX export is generated
from the selected template or patched from the uploaded DOCX when the chosen
template is Original. Original is available only for edits mapped to matching,
visible body paragraphs/list items/table cells. Headers, footers, text boxes,
fields, tracked changes, comments, and unmatched/split runs are explicitly out
of scope in v1. If an original-layout edit cannot be applied safely, Studio blocks
that option with a precise message and offers a CareerOS template instead.

## Data design

Existing candidate profile, experience, education, skills, job listings, and
`candidate_applications` remain the primary profile and application models.
Resume Studio adds only candidate-owned records:

- `resumes`: `id`, `candidate_id`, `title`, `source_kind`, `original_file_path`,
  `original_mime_type`, `original_content_hash`, `parser_mapping_version`,
  `active_version_id`, `deleted_at`, `purge_status`, `purge_completed_at`, and
  timestamps. One row per independent résumé lineage.
- `resume_versions`: extend the existing concept with `resume_id`,
  `parent_version_id`, `version_number`, `source`, `content_json`, `content_hash`,
  `template_id`, optional `candidate_application_id`, and timestamps. `content_json`
  is the canonical `ResumeDocument`; historical rows are immutable. Enforce
  `UNIQUE(resume_id, version_number)` and create versions through a transactional
  RPC/function, never a client-side counter.
- `resume_job_descriptions`: candidate-owned imported or pasted JDs with
  `candidate_id`, `title`, `company_name`, `source_kind`, optional `source_file_path`,
  `content_text`, `content_hash`, `parser_version`, optional `job_listing_id`,
  `deleted_at`, `purge_status`, `purge_completed_at`, and timestamps.
- `resume_analysis_runs`: `resume_version_id`, canonical request hash, model,
  prompt/schema version, provider privacy settings, output cap, request/response
  token counts, returned USD cost, status (`dispatching|unknown|complete|failed`),
  and timestamps. A partial unique index prevents duplicate dispatching/successful
  runs for the same request hash.
- `resume_analysis_run_items`: immutable snapshots of ordered
  `(job_description_id, content_hash, parser_version, title, normalized_text)`
  inputs for a run. Historical runs never depend on a mutable JD row.
- `resume_analysis_results`: one row per run/JD with `job_description_id`, match
  metrics, gaps, evidence node IDs, and structured result JSON; enforce
  `UNIQUE(analysis_run_id, job_description_id)`.
- `resume_suggestions`: `analysis_result_id`, stable `target_node_id`,
  `before_hash`, `evidence_excerpt`, `evidence_hash`, constrained field
  operation, before/after text, reason, status (`pending|accepted|rejected`), and
  timestamps. Do not use fragile array-index JSON Patch paths.
- `resume_ai_consents`: `candidate_id` (unique), `active_event_id`, current
  disclosure version, active/revoked state, and timestamps.
- `resume_ai_consent_events`: immutable candidate ID, disclosure version,
  `granted|revoked` event, actor, and timestamp. Analysis is unavailable without
  active consent for the current disclosure version.
- `resume_exports`: `id`, `resume_version_id`, `template_id`, `format`,
  `content_hash`, `storage_path`, `status`, `created_at`, and `deleted_at`. This
  is the owner-scoped export history, retry, and cleanup record.

Store validated source uploads and exports in a private `resumes` bucket under
`{candidate_id}/resumes/{resume_id}/{version_id}/`; JD sources use
`{candidate_id}/job-descriptions/{jd_id}/source/{content_hash}`. The final bucket
has no browser `INSERT`, `UPDATE`, or `DELETE` policy: only server code moves
validated uploads in and generates exports. The browser has no object-list access
and receives short-lived signed downloads only after server authorization. The
quarantine bucket allows only the one-time signed upload to its exact key; it is
otherwise unreadable to the browser and service-managed after upload.

Every candidate-owned table has explicit `USING` and `WITH CHECK` owner policies;
child policies use an `EXISTS` join through the résumé lineage or a direct
`candidate_id`. Every résumé-descendant predicate additionally requires its
ancestor `resumes.deleted_at IS NULL`; every JD predicate requires
`resume_job_descriptions.deleted_at IS NULL`. Signed-download resolvers make the
same tombstone checks. The browser never receives the service-role key. Server
code verifies the authenticated user and candidate-profile mapping before issuing
signed URLs or calling OpenRouter.

`resume_versions`, `resumes.active_version_id`, analysis runs/results, exports,
and suggestion status are server/RPC-only state. Direct browser `INSERT`,
`UPDATE`, and `DELETE` privileges are revoked; the browser receives narrow
server actions for candidate-controlled metadata, JD create/delete, and suggestion
reject. A hardened `SECURITY DEFINER` save/accept RPC with a fixed `search_path`
verifies `auth.uid()`, locks the lineage, checks `base_version_id`, creates the
child, and conditionally updates the active pointer. It also verifies that an
optional `candidate_application_id` belongs to the same candidate. Accepting a
suggestion atomically checks `status = pending`, its target/before hash, and the
expected base before marking it accepted. This prevents a PostgREST write or a
second browser tab from mutating history.

Resume/JD deletion and consent transitions are also server-only RPCs. The delete
RPC atomically sets `deleted_at` and `purge_status = pending`; no normal owner
update policy can clear those columns. `set_resume_ai_consent` validates the
currently published disclosure version, appends an immutable consent event, and
updates the current state row. The atomic analysis/quota RPC requires that current
active consent before consuming quota or dispatching a provider request.

An analysis run is persisted as `dispatching` with a fresh `attempt_id` and
`lease_expires_at` before OpenRouter is called. A successful response atomically
writes results/usage and marks it complete only when its attempt ID still matches,
its status is `dispatching`, and its lease has not expired. A server-only expiry
CAS changes an expired dispatch to `unknown` and nulls/rotates its attempt ID. If
the server loses the response or dies after dispatch, it is never auto-retried. A
late worker cannot overwrite an expired or newer retry because its conditional
update has the old attempt ID and inactive status. Studio explains that the
request may have been billed and offers an explicit new analysis only if the
candidate chooses to proceed. This avoids claiming provider idempotency that the
API does not offer.

## AI and cost controls

OpenRouter is called from a server-only Node.js route; `OPENROUTER_API_KEY` never
reaches the browser. The request uses `openai/gpt-5.4-nano`, strict JSON schema,
bounded output tokens, and
`provider: { require_parameters: true, zdr: true, data_collection: "deny" }`.
If no provider can honour those constraints, analysis fails safely rather than
routing résumé content elsewhere. The consent screen explains that parsed résumé
and JD text—not binary originals—are sent to OpenRouter and a ZDR/no-data-
collection provider for analysis.

At the current list price of $0.20/M input tokens and $1.25/M output tokens, a
five-JD batch with roughly 7k input and 2.5k output tokens costs about $0.0045.
The UI shows actual returned usage/cost rather than promising a fixed price.

Cost controls:

- hash and reuse results for the same résumé version, JD set, model, and prompt
  version. The canonical hash includes `resume_version_id`, the résumé
  `content_hash`, parser/canonicalization version, sorted JD snapshots, model,
  prompt/schema version, output cap, and provider/privacy configuration;
- make `Analyze all` idempotent against that hash, so concurrent clicks reuse the
  same in-flight/completed run rather than creating two bills;
- no model request on tab switch, edit, save, or suggestion acceptance;
- cap input to five JDs, 12,000 normalized characters per JD, 25,000 résumé
  characters, six suggestions per JD, and 4,000 output tokens per batch;
- enforce at most three batch analyses and ten single-JD refreshes per candidate
  per 15-minute window;
- require explicit refresh after semantic edits;
- rate-limit per authenticated candidate and record every returned usage object;
- reject analysis when a parsed document is incomplete rather than asking the
  model to repair it.

The quota/concurrency guard is a database-atomic RPC: it locks/upserts a
candidate/window counter and creates the dispatching run in the same transaction.
It is never an in-process serverless counter.

Untrusted résumé/JD content is delimited as data, never trusted as instructions.
Every recommendation must cite stable résumé node IDs and an exact evidence
excerpt. The server verifies the excerpt against the node text/hash and rejects
output that does not validate against the response schema, references unknown
nodes, or attempts an unsupported operation. JSON shape is not treated as proof
of factual accuracy.

## Reliability, security, and failure states

- Accept only PDF/DOCX within the configured size/page limit; verify MIME type,
  magic bytes, page count, ZIP expansion ratio/entry count, and encryption
  server-side before the final private write.
- Reject macro-enabled Office documents, `vbaProject.bin`, encrypted files, and
  unsupported embedded objects; never fetch embedded resources. The parser runs
  with a 20-second timeout/AbortSignal and a bounded memory profile. DOCX limits
  are at most 500 ZIP entries, 30 MB total uncompressed content, a 20:1 expansion
  ratio, and 2 MB per XML part. Reject `<!DOCTYPE` and `<!ENTITY` before any XML
  DOM parse.
- Treat uploaded files and extracted text as untrusted. Escape displayed content,
  never execute embedded links, and do not send original binary files to the LLM.
- Deleting one résumé first tombstones that lineage and removes it from every
  owner-access RLS predicate, so no new object or row access is possible. A
  retryable cleanup worker/function then idempotently deletes its validated and
  quarantine Storage prefixes and cascades its versions, analyses, suggestions,
  and exports, recording purge status. Reusable candidate JDs remain until deleted
  separately. Standard JD deletion is a soft delete: it hides the live JD and
  source object from the picker while immutable analysis run-item snapshots remain
  available only through their owning résumé history. A candidate may instead
  choose Purge JD, which server-deletes its source/text and the dependent
  run-items, results, and suggestions; `resume_analysis_results.job_description_id`
  is `ON DELETE RESTRICT` so this cascade is explicit, never accidental. Deleting
  a candidate account additionally tombstones and cleans all candidate JDs and
  AI-consent data. Blob deletion is not described as atomic with the database.
  Download URLs are short-lived (60 seconds), use `Cache-Control: private,
  no-store`, and expire; an already issued URL can work only until expiry.
- Show recoverable errors for parse/OCR/AI/export failures and preserve the last
  saved version. Never silently replace content.
- Validate every server input and AI response. Reject invalid patches rather than
  applying free-form model text.
- Add Vitest and an `npm run test` script before feature code. Cover RLS against
  an isolated Supabase project, parser fixtures (DOCX, text PDF, scan),
  version/patch conflicts, idempotent analysis, route authorization, and export
  render checks. Keep Playwright for the tab, upload, stale-state, and keyboard
  accessibility flows.

## Scope boundaries

This feature does not build a general-purpose Word editor, introduce a Python or
container OCR service, call AI automatically after user edits, or expose any
server/admin secret to the browser. It preserves original DOCX layout through
safe, mapped text edits—not arbitrary visual redesign. A richer WYSIWYG DOCX
editor and server-side OCR are future upgrades if evidence shows they are needed.

## Delivery prerequisites and runtime contract

Phase 0 is a non-negotiable foundation before any Studio feature code:

1. Add and lock compatible direct dependencies for `@supabase/ssr`,
   `@supabase/supabase-js`, `zod`, `pdfjs-dist`, `tesseract.js`, `mammoth`,
   `jszip`, `@xmldom/xmldom`, `docx`, and `vitest`; confirm their Node 20/Next
   16/Vercel support in the lockfile. No transitive dependency is treated as an
   application contract. `mammoth` is extraction-only; Original DOCX mapping and
   patching reads/writes WordprocessingML parts through JSZip plus the XML DOM
   parser/serializer and is covered by OOXML fixtures.
2. Implement Supabase Auth/session middleware, server/browser client factories,
   `auth.users ↔ candidate_profiles` mapping, migrations, explicit RLS/Storage
   policies, and generated database types. The current mock data and redirect-only
   login do not count as an existing backend.
3. Run migrations and RLS tests in an isolated Supabase environment before the
   first authenticated Studio route is enabled.

All parse, export, signed-URL, and OpenRouter handlers declare
`runtime = "nodejs"`, `dynamic = "force-dynamic"`, and `maxDuration = 60`.
They use `Cache-Control: no-store`; parse calls time out at 20 seconds, AI calls
at 30 seconds, and export calls at 45 seconds via `AbortSignal`. Each handler has
a small concurrency guard and returns a recoverable timeout state rather than
retrying invisibly. Before enabling a deployment, verify the selected Vercel plan
permits the declared duration; otherwise lower the limits or reject oversized work.

An initial DOCX parse preserves Original only when every editable field selected
for editing has a supported mapping and matching source hash. Otherwise the source
is retained as a non-editable download and Studio opens the editable canonical
CareerOS template with Original disabled.
