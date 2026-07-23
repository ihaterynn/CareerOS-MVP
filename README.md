# CareerOS

CareerOS is a monorepo with a TypeScript Next.js + Tailwind frontend.

Prototype URL: https://careeros-mvp-phi.vercel.app/

## Workspaces

- `frontend` - Next.js app router frontend for candidate/user and employer/admin modules.
- `packages/shared` - Shared domain types and constants.

## Product Views

CareerOS currently ships two main frontend views:

- `Candidate view` for students and job seekers building their Career DNA, exploring routes, searching jobs, and applying quickly.
- `Employer view` for hiring teams reviewing talent matches, career-root sourcing, retention signals, and application decisions.

## Candidate Modules

### Login / Landing

- Demo-first login page used as the application landing screen.
- Pre-filled credentials for fast prototype access.

### Command Center Dashboard

- Default candidate home after sign-in.
- Summarizes registration, top matches, career route readiness, applications, and mandatory platform coverage.

### Candidate DNA

- Unified profile builder for identity, skills, interests, achievements, and preferences.
- Powers resume generation, job matching, quick apply flows, and career route recommendations.
- Includes ATS-friendly resume export formatting.

### Job Search

- Keyword and location-aware job discovery.
- Shows match scoring, saved jobs, job detail context, and map-based exploration.

### Career Path

- Career Tree / navigator experience based on Career DNA plus market-route signals.
- Shows realistic adjacent and growth paths, salary thresholds, readiness, projects, required signals, and Coursera course branches.
- Includes the Fair Pay Engine as supportive route intelligence inside this view rather than as a standalone tab.

### Jobby.ai

- Candidate-facing career advisor chat module.
- Uses high-level context from Candidate DNA, saved jobs, job signals, generated pathways, and upskilling recommendations.

### Applications

- Tracks active applications, quick-apply resume versions, saved jobs, and next steps.
- Combines application management with upskilling visibility for missing skills and recommended learning.

## Employer Modules

### Dashboard

- Employer command center for hiring health, retention risk, onboarding outlook, and review load.

### Career Root

- Inverse of the candidate Career Tree.
- Helps employers source talent from adjacent fields, inspect top candidates, and view profile / Career DNA evidence for each match.

### Talent Match

- Role-based talent matching board for multiple employer-created jobs.
- Each job has its own candidate ranking, fit matrix, match explanation, and candidate DNA inspection panel.
- Includes inline `Create job` flow to add new roles and generate matching candidates in the prototype.

### Retention

- Explainable talent retention signals using weighted factors such as promotion delay, compensation gap, engagement, mobility attempts, and skill growth.

### Onboarding

- Onboarding success predictor with probability of success, time to impact, turnover risk, milestone tracking, and driver explanations.

### Skill Heatmap

- OpenStreetMap-style skill supply-demand view.
- Visualizes talent pressure, salary pressure, and location-based skill concentration.

### Attrition

- Attrition root cause engine for viewing clustered exit patterns and systemic risk drivers.

### Review

- Application review workflow for shortlist / reject decisions.
- Supports mandatory reject-with-reason behavior and candidate profile inspection.

## Commands

```bash
npm install
npm run dev
```

The frontend defaults to `http://localhost:3000`.

## Deploying Frontend to Vercel

CareerOS frontend is ready to deploy as a Vercel Git project from this repository.

Recommended Vercel project settings:

- Repository: `ihaterynn/CareerOS-MVP`
- Framework Preset: `Next.js`
- Root Directory: `frontend`
- Install Command: `npm install`
- Build Command: `npm run build`
- Node Version: `20.x`

Notes:

- No environment variables are currently required for the frontend demo deployment.
- The frontend depends on the workspace package in `packages/shared`, so import the full repository into Vercel rather than uploading only the `frontend` folder manually.
- If Vercel caches an older failed build, use `Redeploy` with `Clear build cache`.

Local production verification:

```bash
npm --workspace frontend run build
```

If Vercel does not auto-detect the monorepo correctly:

1. Open the Vercel project settings.
2. Confirm the Root Directory is `frontend`.
3. Keep the repository connected at the monorepo root.
4. Trigger a fresh deploy after clearing the build cache.
