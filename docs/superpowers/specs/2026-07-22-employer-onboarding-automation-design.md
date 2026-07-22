# Employer Onboarding Automation — Design Spec

**Goal:** Turn a confirmed hire into a visible, role-aware onboarding workflow that automates operational work and preserves human moments.

## Scope

This warrants its own spec because onboarding starts after a hiring decision and is owned by HR, IT, managers, and buddies—not by the recruiter’s matching workflow.

## Decisions

| Area | Decision |
| --- | --- |
| Trigger | Recruiter confirms a hire; the demo begins with three pre-confirmed hires. |
| Workflow | Generate four phases: pre-boarding, week one, first 30 days, and ramp to impact. |
| Automation | Automate provisioning, documents, reminders, scheduling, and recurring check-ins. |
| Human ownership | Managers own goals; buddies own connection; HR owns sensitive documentation. |
| Tailoring | Candidate role, predicted ramp time, onboarding risk, and first milestone set the workflow content. |

## Experience

The recruiter or HR operator selects a confirmed hire. The page presents success probability, time to impact, and ramp risk before showing the generated workflow. Each phase states its purpose, date window, and tasks with clear owner, due date, status, and type:

- **Automated:** system performs or schedules the task.
- **Manual:** a named human needs to act.
- **Document:** a required employee or HR record.

The top summary quantifies automation without pretending the onboarding is fully automated. The detail view makes handoffs and human responsibilities easy to inspect.

## Data Contract

`OnboardingPrediction` supplies hire, role, success probability, time to impact, risk, and initial milestone. `buildOnboardingWorkflow` maps that to a stable role-aware workflow with managers, buddies, phases, and task types.

Talent Match’s **Confirm hire** action is the intended trigger. For the static demo, onboarding starts from three pre-confirmed hires rather than a live cross-page state transition.

## Guardrails

- Risk and success signals guide support and workload planning; they must not become automatic employment decisions.
- Sensitive documents show status only in the demo, never contents.
- An unavailable manager/buddy produces an explicit assignment-needed task instead of a silent placeholder.

## Verification

- Switching hire regenerates role-specific milestones, manager/buddy, and tasks.
- Automation count equals the number of tasks labelled Automated.
- Every task has an owner, due label, type, and status.
- Mobile layout retains phase order and task legibility.
