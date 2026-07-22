# Employer Talent Intelligence — Design Spec

**Goal:** Make Talent Match the employer’s decision workspace: role-specific ranking, explainable candidate evidence, and a generated interview kit that converts a profile into useful interviews.

## Scope

This is one spec because matching and interview generation are the same recruiter workflow. A recruiter selects an open role, reviews candidates who applied to that role, inspects the evidence behind the score, and generates a targeted interview kit for one person.

## Decisions

| Area | Decision |
| --- | --- |
| Candidate pool | Preserve the role the candidate applied for; never silently reassign an applicant to a “best” role. |
| Ranking | Score within the selected role using skills, experience, education, and interest, with visible contribution bars. |
| Evidence | Show strengths, missing signals, portfolio work, Career DNA, and mobility intent beside the score. |
| Interview generation | Deterministic demo generator based on the selected candidate and role; no model/API call. |
| Interview sections | Role & technical, personality, and culture fit. Each question includes probes and what good evidence sounds like. |

## Experience

The recruiter begins on an open-role board. Selecting a role filters its applicants and ranks only that role’s submissions. Selecting an applicant opens the evidence panel. **Generate interview kit** uses the displayed resume/profile signals to prepare three question sets:

- **Role & technical:** tests the exact skills, portfolio claims, and gaps relevant to the selected vacancy.
- **Personality:** tests working style, self-awareness, response to feedback, and ambiguity handling using the Career DNA signals.
- **Culture fit:** tests motivation, collaboration, and the fit between stated candidate intent and the role’s actual context.

Questions must name their source signal in plain language. The tool does not claim to assess personality or culture automatically; it gives interviewers structured prompts and evidence to seek.

## Data Contract

`TalentMatch` remains the candidate evidence source: skills, experience, certifications, portfolio, career interests, learning signals, DNA signals, and missing signals. `RoleTalentBoard` defines role-specific requirements and applicants. `generateInterviewKit(candidate, roleTitle)` returns a stable demo result with category, question, probe, and “listen for” guidance.

Gold candidate-review records are the intended input from CV Ingestion. The current demo keeps its Talent Match fixtures independent, but both conform to the same role-preserving candidate-review boundary; no live data handoff is claimed yet.

## States and Guardrails

- Empty role board: explain that no applications have reached the role yet and point to CV Ingestion.
- Low score: retain the candidate and show why; do not hide evidence or imply rejection.
- Generate state: clear short progress state, then tabs for each category.
- Copy controls copy a question only; no candidate data leaves the app.
- Evidence-light candidate: the kit foregrounds gaps with probes such as “what evidence would demonstrate this?” rather than treating missing evidence as a negative personal trait or inventing a claim.
- Interview kits are advisory. Hiring decisions remain human and must not rely on personality/culture labels alone.

## Verification

- Each role only shows its submitted applicants.
- Generated role, personality, and culture questions change with candidate evidence and selected role.
- Every question has a readable purpose and “listen for” cue.
- Keyboard navigation works across role cards, candidates, generation action, tabs, and copy controls.
