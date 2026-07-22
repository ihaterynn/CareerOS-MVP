# CV Ingestion Control Tower — Design Spec

**Date:** 2026-07-22  
**Goal:** Add a demo-only employer workspace page that visibly runs a batch of extracted CV records through a medallion pipeline and presents aggregated, role-qualified candidates.

## Context

Cempaka Digital is hiring for several open roles. The demo needs to make the data journey clear without depending on document upload, OCR, storage, or backend services. All CVs are therefore deterministic, preloaded TypeScript objects representing the output of a parser.

The new page complements the existing Talent Match page: Talent Match is for reviewing applicants; this page shows how a batch becomes a trusted, organised candidate pool.

## Decisions

| Decision | Choice |
| --- | --- |
| Location | New employer route: `/employer/ingestion` |
| Page model | Pipeline control tower, not a kanban or a catalogue |
| Data source | Fixed mock extracted-CV JSON records; no document parsing or API calls |
| Interaction | One **Run ingestion** button advances the whole batch through the pipeline |
| Hiring context | Multiple active roles: Senior Product Designer, Backend Engineer, and Data Analyst |
| Demo batch | 24 records, including valid, incomplete, duplicate, and low-match submissions |
| Output | Gold records aggregated by role, skill cluster, and location |

## Experience

The page opens in a ready state: it already contains a representative batch and shows how each medallion layer will reduce and enrich it. The main action, **Run ingestion**, starts a short staged animation:

1. **Bronze — Submitted:** all 24 raw extracted records enter. The panel exposes source name, parse status, and a compact JSON preview for the selected record.
2. **Silver — Validated:** malformed, duplicate, and incomplete records are separated with specific reasons. Valid records are normalised into a consistent candidate schema.
3. **Gold — Qualified:** validated CVs are scored against their best-matching open role. Only records meeting the configured threshold enter the trusted shortlist.
4. **Aggregate:** Gold candidates are grouped by role, shared skill cluster, and location. The result provides a clear hand-off into recruiting review.

The UI remains useful before and after the run. During the animation, counters advance, a single selected record updates its status, and stage cards receive restrained motion. After completion, the Gold aggregation becomes the visual focal point and the action changes to **Run again**.

## Page Structure

```
Employer workspace / CV Ingestion
┌─────────────────────────────────────────────────────────────────┐
│ CV Ingestion Control Tower                  [Run ingestion]      │
│ 24 submitted · 3 open roles · mock data                          │
├─────────────────────────────────────────────────────────────────┤
│  BRONZE              →  SILVER               →  GOLD            │
│  24 received            18 validated             11 qualified   │
│  raw record list         invalid reasons          ranked people  │
├──────────────────────────────┬──────────────────────────────────┤
│ Selected extracted CV JSON   │ Gold candidate aggregation        │
│ structured mock preview      │ role / skills / location toggles │
│ parse & validation trace     │ aggregate cards + people list    │
└──────────────────────────────┴──────────────────────────────────┘
```

### Visual direction

The current CareerOS cream, deep-navy, gold, serif, and mono-token system remains intact. The signature element is a thin, luminous data route connecting the three stage cards: it gives the page a sense of movement without adding a chart library or visual noise. Existing card, badge, progress, and responsive conventions are reused.

## Components and Data

The implementation stays local to the employer frontend:

- `ingestion-data.ts` defines role requirements, the 24 extracted CV records, deterministic validation outcomes, and aggregation helpers.
- `ingestion-panel.tsx` owns the demo state: idle/running/complete, active layer, selected record, and aggregation grouping.
- A new route renders the panel, and employer navigation gains one item for **CV Ingestion**.

Each CV record includes only the fields required to make the demo believable: identity, source filename, extracted skills, years of experience, location, target role, education, parse confidence, and any validation/matching explanation. No personal documents or real candidate data are used.

### Qualification rules

- Bronze accepts every submitted mock record.
- Silver rejects records with missing name/contact, failed extraction, duplicate fingerprint, or insufficient core fields.
- Gold assigns each Silver record to its best-matching open role, using deterministic skill and experience fit. A record must score at least 70 to qualify.
- Aggregations use Gold records only, so every displayed total is explainable.

## States and Accessibility

- The run button is disabled while the short staged run is in progress and announces progress through an `aria-live` status message.
- Stage cards use both text and colour for their state; rejected records always include a readable reason.
- The page reflows from a three-stage desktop pipeline to a vertical mobile sequence. Gold aggregation stacks below the record preview.
- Existing global reduced-motion handling makes the demo instant for people who prefer reduced motion.
- Resetting the page or pressing **Run again** returns it to the known mock batch; no data persists.

## Verification

- Typecheck, lint, and production build pass.
- The new navigation item routes to `/employer/ingestion` and marks itself active.
- One click moves the same fixed batch through Bronze, Silver, and Gold, ending with consistent counters and aggregations.
- Rejected records show their exact deterministic reason; Gold records show a matching role and score.
- Check the page at mobile and desktop widths, including keyboard access to the button, candidate selection, and aggregation controls.

## Out of Scope

- File upload, PDF/DOCX parsing, OCR, persistence, authentication changes, backend APIs, and ML ranking.
- Editing role requirements or individual parsed CV data in the interface.

These can be added only when the demo needs to become a real ingestion workflow.
