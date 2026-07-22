# Employer Career Root — Design Spec

**Goal:** Give sourcing teams an explainable way to discover strong adjacent-background talent beyond a narrow, degree-gated search.

## Scope

Career Root is separate from Talent Match. Talent Match handles people who applied to a vacancy; Career Root is proactive sourcing that starts with the vacancy and expands into adjacent experience patterns.

## Decisions

| Area | Decision |
| --- | --- |
| Starting point | A selected vacancy with required and preferred signals. |
| Expansion | Map into adjacent source fields and career histories—not just degree names. |
| Relaxation | Only requirements explicitly marked `relaxable` may be substituted; relax one at a time and explain the evidence accepted. |
| Ranking | Show role fit, interest, and evidence strength; retain gaps visibly. |
| Comparison | Contrast Career Root results against a traditional strict-filter view. |

## Experience

The recruiter selects a sourcing lens:

- **Traditional filter:** keeps strict degree/experience gates.
- **Career Root:** starts at the same vacancy then reveals credible adjacent pathways, e.g. operations analytics → technical consulting or product operations → data product.

Each branch communicates: the source background, why it maps to the vacancy, which threshold was safely relaxed, and the candidates surfaced. The visual root is a sourcing explanation, not a claim that any background is interchangeable.

## Data Contract

`CareerRootBranch` holds field/background, fit rationale, relaxed threshold, and candidates. Each Career Root candidate carries `origin: "sourced"`; Talent Match application candidates carry `origin: "application"`. The UI labels that provenance so a sourcing lead is never presented as an applicant.

Each vacancy requirement has a class: `required`, `preferred`, or `relaxable`. Career Root can only relax the last class, and must show the replacement evidence. Candidate records reuse the Talent Match evidence model; future integration may derive branches from vacancy requirements, but the demo remains deterministic.

## Guardrails

- Do not use protected attributes or proxy attributes as sourcing filters.
- A relaxed requirement must show both the original requirement and substitute evidence.
- Career Root suggestions are recruiter leads, not automatic shortlists.

## Verification

- Traditional mode shows only strict-filter candidates; Career Root shows additional adjacent candidates with clear rationale.
- Counts are deduplicated across branches.
- Every surfaced candidate has fit evidence and explicit gaps.
- Toggle and candidate selection work by keyboard and on mobile.
