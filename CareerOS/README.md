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
