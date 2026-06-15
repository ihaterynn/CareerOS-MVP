# CareerOS Design-System Merge — Design Spec

**Date:** 2026-06-15
**Goal:** Bring the complete, polished design system from the `careeros` repo into `CareerOS-MVP` (the main repo), restyle all 14 feature modules to it, convert navigation to file-routes, and enhance for cross-display (responsive) visibility.

---

## Context

Two repos converging on the same product:

- **`careeros`** — perfect layout/design. Next 16.2.9 / React 19 / Tailwind 4. Inline `style={}` + CSS-variable design tokens. Full theming: light/dark, accent (gold/indigo), heading-font switch, tweaks panel. Rich UI primitive library (`ui.tsx`). File-route App Router (`/candidate/tree`, `/employer/dash`). Only 7 modules, all polished.
- **`CareerOS-MVP`** — full suite of **14 feature modules**, monorepo (npm workspaces: `frontend`, `packages/shared`, plus FastAPI `backend`). Next 14 / React 18 / Tailwind 3. Tailwind utility classes with **hardcoded** hex palette. Single-page **state-router** (`careeros-app.tsx` toggles `activeId`; no URL change). Partial, lighter port of the careeros Shell (no dark mode, no accent switch, no tweaks panel). Employer portal's 8 panels embedded in one ~1200-line `employer-view.tsx`.

The MVP already contains a half-done port of the careeros design. This spec finishes it: the *complete* careeros design layer lands in MVP, every module adopts it, and the result is responsive across displays.

**Destination = `CareerOS-MVP`. Source of design = `careeros`. Mock data only — no FastAPI wiring this pass.**

---

## Decisions (locked)

| Decision | Choice |
|---|---|
| Destination repo | `CareerOS-MVP` (main) |
| Stack | Upgrade MVP frontend to Next 16 / React 19 / Tailwind 4 (match careeros, "best prod ready") |
| Module styling | Tailwind utility classes mapped to careeros CSS-var design tokens (one styling system, full theming through existing classes) |
| Navigation | Convert MVP state-router → **file-routes** (Next App Router, deep-linkable URLs, browser history) |
| Icons | Keep `lucide-react` (MVP standard); do not port careeros custom icon set |
| Employer panels | Split `employer-view.tsx` into 8 separate module files (match candidate pattern) |
| Scope | All 14 modules |
| Data | Mock data only (port MVP `*-data.ts`, no API client) |

---

## Architecture

### Token layer (foundation — do this first)

1. **`frontend/postcss.config.mjs`** ← migrate from TW3 (`tailwindcss: {}` + `autoprefixer: {}`) to TW4 (`"@tailwindcss/postcss": {}`), matching careeros. TW4 includes autoprefixing — drop the separate `autoprefixer` plugin + devDep.
2. **`frontend/app/globals.css`** ← replace with careeros `globals.css`: full CSS-var token set (light + dark themes, gold/indigo accents, shadows, radii, fonts via Google Fonts import, keyframes, `.kicker`/`.mono` utilities, `.app-shell` themed wrapper, reduced-motion guard).
3. **Delete `frontend/tailwind.config.ts`** and declare the theme in CSS via TW4 `@theme` — **this is a hard requirement, not optional.** TW4 generates utilities from `@theme` namespaced custom properties (`--color-*`, `--shadow-*`, `--font-*`, `--radius-*`), NOT from a JS `theme.extend.colors` object. If the JS config is removed without adding `@theme` aliases, **existing `bg-paper`/`text-muted`/`shadow-soft`/`bg-gold` classes stop compiling** (MVP modules go unstyled).
   - Every MVP color/shadow currently in `tailwind.config.ts` must get an explicit `@theme` alias pointing at the careeros runtime CSS var, e.g.:
     ```css
     @theme {
       --color-ink:    var(--text);
       --color-muted:  var(--text-2);
       --color-faint:  var(--text-3);
       --color-paper:  var(--surface);
       --color-mist:   var(--surface-2);
       --color-cream:  var(--bg);
       --color-line:   var(--border);
       --color-rule:   var(--border-2);
       --color-gold:   var(--accent);   /* legacy alias for existing bg-gold */
       --color-good:   var(--risk-good);
       --color-warn:   var(--risk-warn);
       --color-bad:    var(--risk-bad);
       --color-info:   var(--info);
       --shadow-soft:   var(--shadow);   /* MVP boxShadow.soft */
       --shadow-lifted: var(--shadow-lg);/* MVP boxShadow.lifted */
     }
     ```
   - Caveat: `@theme` values must be *static* for TW4 to emit the utility, but the *referenced* var (`var(--text)`) re-resolves at runtime — so `bg-paper` swaps with dark mode / accent automatically. Confirm exact TW4 `@theme` semantics against `careeros/node_modules/tailwindcss` + installed docs before writing; this var-indirection pattern must be tested early (Phase 2 gate).
   - Result: every existing `bg-paper`/`text-muted`/`bg-gold`/`shadow-soft` class in all 14 modules keeps compiling AND responds to dark mode + accent switch with zero per-module edits.

### Shell layer

4. **`frontend/src/components/workspace-shell.tsx`** — merge careeros `Shell.tsx` capabilities into MVP's shell while keeping MVP's generic props (`portal`, `navItems`, `activeId`/route-driven, `sidebarTitle`, children). Add:
   - Theme toggle (sun/moon, localStorage `cos_theme`, pre-paint sync script in root layout).
   - Accent pill portal-switch animation, accent glow.
   - Tweaks panel (accent gold/indigo, heading-font source/newsreader) — port `tweaks-panel.tsx`.
   - Bottom "Living profile / Living ecosystem" sparkle card.
   - Keep MVP's responsive breakpoints (`lg:` grid, stacking header) — these are the cross-display win and careeros lacks them.

### Primitives layer

5. **`frontend/src/components/ui.tsx`** ← port careeros `ui.tsx`: `Card, Button, Badge, Avatar, ProgressRing, Gauge, Tabs, SignalBar, Popover, Skeleton, Modal, Stat, Confetti`. CSS-var driven, so they theme automatically. Modules adopt these where they replace ad-hoc markup (dashboards, gauges, heatmap stats).
   - **Remove `// @ts-nocheck`.** Source careeros `ui.tsx`, `Shell.tsx`, AND `tweaks-panel.tsx` all carry `// @ts-nocheck` and rely on untyped `<Icon name=...>` strings. Copying that through defeats the stack upgrade — TS would silently hide React-19/Next-16 breakage. Requirement: port ALL THREE **typed** — add prop interfaces for every primitive + the tweaks panel controls, and a typed icon-adapter boundary (below). MVP `frontend/tsconfig.json` is strict; `typecheck` must pass without `@ts-nocheck` in any ported file.
   - **Icon adapter (typed):** careeros `ui.tsx`/`Shell.tsx` call custom `<Icon name="sun" />`. Keeping lucide, build a typed adapter: `type IconName = 'sun'|'moon'|'trend'|'trendDown'|...` mapped to a `Record<IconName, LucideIcon>`. ui.tsx + Shell use `<Icon name>` against that union; unknown names become compile errors, not silent blanks. Keep lucide as the single icon source.

### Routing layer (state-router → file-routes)

6. Replace single-page `careeros-app.tsx` orchestrator with App Router pages:
   ```
   frontend/app/
     layout.tsx                  ← root ONLY: <html>, fonts, globals, pre-paint theme script. NO shell here.
     page.tsx                    ← login-gateway (UNSHELLED). On demo-enter, redirect to /candidate/dashboard.
     (workspace)/                ← route group (no URL segment) — shelled area
       layout.tsx                ← <WorkspaceShell> wrapper deriving portal+active from pathname
       candidate/
         dashboard/page.tsx
         dna/page.tsx
         jobs/page.tsx
         career-path/page.tsx
         jobby/page.tsx
         applications/page.tsx
       employer/
         dashboard/page.tsx
         career-root/page.tsx
         talent/page.tsx
         retention/page.tsx
         onboarding/page.tsx
         heatmap/page.tsx
         attrition/page.tsx
         review/page.tsx
   ```
   - **Shell scope:** `<WorkspaceShell>` lives in `(workspace)/layout.tsx`, NOT root layout — so the login-gateway (`app/page.tsx`) renders unshelled. Root `layout.tsx` carries only `<html>`/fonts/globals/pre-paint script.
   - Shell derives `portal` from `pathname.startsWith('/employer')` and active nav from the path (careeros pattern). Nav items become `<Link href>` not `onActiveChange`.
   - Portal switch routes to the portal's default page (`/candidate/dashboard`, `/employer/dashboard`).
   - `@careeros/shared` nav metadata (`candidateModules`/`employerModules`) keeps `id`+`label`+`description`; add `href` derived from id, keep lucide `icon` mapping from `careeros-app.tsx`.
   - **Route ids:** use MVP module ids for URLs (`/candidate/dashboard`, `/candidate/dna`, …). careeros's own routes use different slugs (`/candidate/tree`, `/advisor`, `/profile`, `/employer/dash`) — we do NOT adopt those slugs; we take careeros's *visual design* for the page that maps to each MVP module (see mapping table below).

### Source-to-target design mapping

careeros has 7 polished pages; MVP has 14 modules. This table says which careeros page visually informs which MVP module. Modules with no careeros counterpart are styled from careeros primitives/Shell conventions (no 1:1 reference page).

| MVP route | MVP module | careeros design reference | careeros component |
|---|---|---|---|
| `/candidate/dashboard` | Candidate Dashboard | (compose from primitives — no direct careeros page) | `ui.tsx` Stat/ProgressRing/Card |
| `/candidate/dna` | Candidate DNA | `/candidate/profile` | `view-dna.tsx` |
| `/candidate/jobs` | Job Search | `/candidate/jobs` | `view-quickapply.tsx` + `map.tsx` |
| `/candidate/career-path` | Career Path Navigator | `/candidate/tree` | `view-careertree.tsx` |
| `/candidate/jobby` | Jobby.ai advisor | `/candidate/advisor` | `view-advisor.tsx` |
| `/candidate/applications` | Applications | (compose — partial from advisor/jobs) | `ui.tsx` Tabs/Badge/Card |
| `/employer/dashboard` | Employer Dashboard | `/employer/dash` | `view-employer-dash.tsx` |
| `/employer/career-root` | Career Root | (inverse of) `view-careertree.tsx` | careertree styling |
| `/employer/talent` | Talent Match | `/employer/talent` | `view-employer-talent.tsx` |
| `/employer/retention` | Retention | `/employer/dash` (at-risk section) | employer-dash styling |
| `/employer/onboarding` | Onboarding | `/employer/onboarding` | `Onboarding` export in `view-employer-talent.tsx` (no separate `view-onboarding.tsx`) |
| `/employer/heatmap` | Skill Heatmap | `/employer/talent` (heatmap) | `map.tsx` |
| `/employer/attrition` | Attrition | (compose — no direct page) | `ui.tsx` Stat/SignalBar |
| `/employer/review` | Application Review | (compose — partial from talent) | `ui.tsx` Modal/Badge |

### Module layer

7. **Candidate** (6 modules) — already separate files in `modules/candidate/components/`. Each becomes a route page that renders its panel. Restyle per mapping above: classes already map to tokens; adopt `ui.tsx` primitives where cleaner; verify dark mode + responsive.
8. **Employer** (8 modules) — **split** `employer-view.tsx` into `modules/employer/components/{dashboard,career-root,talent,retention,onboarding,heatmap,attrition,review}-panel.tsx`. Each becomes a route page. Same restyle pass per mapping.
9. External libs to preserve: Leaflet (jobs/heatmap maps), Three.js (`dna-helix-scene`), jsPDF (resume export). Ensure they work under React 19 / Next 16 (dynamic import, `ssr:false` where needed).

---

## Cross-display visibility (the "enhance" requirement)

careeros Shell is desktop-only (236px fixed sidebar, no mobile collapse). MVP shell already stacks at `lg:`. Merged result:

- **Mobile (`<lg`):** header stacks/wraps; sidebar becomes a slide-in drawer (hamburger) or top tab row; main content full-width with comfortable padding.
- **Tablet:** sidebar may collapse to icon-rail; content fluid.
- **Desktop (`≥lg`):** careeros layout — sticky 64px header, sticky 236px sidebar, fluid main, `max-width: 1320px` centered on ultrawide.
- Maps, gauges, grids reflow (CSS grid `minmax`, `auto-fit`). Verify each of the 14 modules at mobile / tablet / desktop / ultrawide.
- Respect `prefers-reduced-motion` (already in globals).

---

## Data flow

- Mock data stays in `modules/candidate/candidate-data.ts` and `modules/employer/employer-data.ts`. No API client, no FastAPI calls this pass.
- `@careeros/shared` continues to provide `Portal`, `*ModuleId`, nav types, `apiRoutes` (unused for now).
- Backend left untouched; verify CORS origin still valid after frontend port/stack change (dev server port may shift).

## Error handling / edge cases

- **Theme/accent/font persistence contract (fix source bug):** careeros's pre-paint script *reads* `cos_theme` + `cos_accent`, but Shell.tsx only *writes* `cos_theme` (accent is set as a `data-accent` attribute but never `localStorage.setItem`'d; heading font is neither persisted nor read pre-paint). Result in source: accent + font always reset to default on reload. Merged spec fixes this — define one contract:
  - `cos_theme` (`light`|`dark`), `cos_accent` (`gold`|`indigo`), `cos_headingfont` (`source`|`newsreader`): all three **written** on change (Shell/tweaks-panel) AND **read** in the pre-paint inline script, setting `data-theme`/`data-accent`/`data-headingfont` before first paint. Defaults: light / gold / source.
- Theme flash: pre-paint inline script in root `layout.tsx` applies all three attributes before first paint (extend careeros's script to cover accent-write + headingfont).
- SSR vs client: Three.js/Leaflet/jsPDF and any `localStorage`/`window` access must be client-only (`'use client'`, dynamic `ssr:false`).
- Next 16 breaking changes: **read the Next 16 docs before writing route/layout code** (per careeros `AGENTS.md`). Source-reference copy already on disk: `careeros/node_modules/next/dist/docs/` (confirmed present: `01-app`, `02-pages`, `03-architecture`, `index.md`). After upgrading MVP, the same docs live at `CareerOS-MVP/frontend/node_modules/next/dist/docs/`. Async APIs (`cookies`, `headers`, route params) may now be promises.
- Unknown route id → Next `not-found`.

## Toolchain migration (lint / lockfile)

- **ESLint:** MVP frontend uses ESLint 8 + `eslint-config-next@14` + `next lint`. Next 16 deprecates/removes `next lint`. Migrate to flat config `frontend/eslint.config.mjs` (careeros already uses this — reference it), bump to ESLint 9 + the Next-16-compatible config, and update the `lint` script to call `eslint` directly. Confirm the valid lint command/config shape against installed `eslint-config-next` docs.
- **Lockfile + workspaces:** this is an npm-workspaces monorepo — run install from repo root so the root `package-lock.json` regenerates consistently across `frontend` + `packages/*`. Verify `@careeros/shared` still resolves after the bump. Don't hand-edit the lockfile.

## Testing / verification

- Root install clean: `npm install` at repo root succeeds, lockfile updated, no peer-dep errors from the React 19 / Next 16 bump.
- `npm run typecheck` passes with **no `@ts-nocheck`** in ported `ui.tsx`/`workspace-shell`/`tweaks-panel`/icon-adapter.
- Persistence: toggle theme + accent + heading font, reload — all three persist (no reset-to-default); no flash of wrong theme on reload.
- Lint passes under the new ESLint 9 flat-config command (not `next lint`).
- `npm run build` (frontend) succeeds on the new stack.
- `npm run dev:frontend` boots; manually verify each of 14 routes renders, light/dark toggle works, accent switch works, deep-link to each URL works, browser back/forward works.
- **Token gate (Phase 2):** before touching modules, confirm a sample `bg-paper`/`shadow-soft`/`bg-gold` element still compiles AND flips with dark/accent toggle — validates the `@theme` var-indirection works.
- Visual cross-display check per module at 4 breakpoints.
- Use `vercel-react-best-practices` skill during module/route work (RSC vs client boundaries, dynamic imports, bundle).

---

## Execution phases

1. **Stack upgrade** — bump MVP frontend deps to Next16/React19/TW4/ESLint9; migrate `postcss.config.mjs` to `@tailwindcss/postcss`, `next lint` → flat `eslint.config.mjs`; root `npm install`, get a blank build + lint + typecheck green. Read Next 16 docs first.
2. **Token foundation** — port `globals.css`; delete `tailwind.config.ts`, declare theme via `@theme` with explicit `--color-*`/`--shadow-*` aliases for every MVP token; pass the token gate (existing classes compile + flip with theme). Verify existing modules still render.
3. **Primitives + Shell** — port `ui.tsx` (+ lucide icon adapter), `tweaks-panel.tsx`; merge full Shell into `workspace-shell.tsx` keeping responsive breakpoints + adding theme/accent/tweaks.
4. **Routing conversion** — build App Router page tree; shell derives portal/active from pathname; retire `careeros-app.tsx` state-router.
5. **Candidate modules** — wire 6 panels to routes, restyle, adopt primitives, responsive pass.
6. **Employer modules** — split `employer-view.tsx` into 8 files, wire to routes, restyle, responsive pass.
7. **Cross-display + polish** — 4-breakpoint sweep all 14 modules; dark mode + accent sweep; reduced-motion; fix map/3D/PDF under new stack.
8. **Verify** — typecheck, lint, build, manual route + theme + responsive walkthrough.

## Out of scope (this pass)

- FastAPI integration / real data / API client.
- New features beyond the existing 14 modules.
- Auth beyond existing login-gateway mock.
- careeros custom icon set (keeping lucide).
