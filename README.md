# CareerOS

CareerOS is a monorepo with a TypeScript Next.js + Tailwind frontend and a Python API backend.

## Workspaces

- `frontend` - Next.js app router frontend for candidate/user and employer/admin modules.
- `backend` - Python FastAPI skeleton.
- `packages/shared` - Shared domain types and constants.

## Commands

```bash
npm install
npm run install:backend
npm run dev:frontend
npm run dev:backend
```

The frontend defaults to `http://localhost:3000`.
The backend defaults to `http://localhost:4000`.

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
