# Detect App (Next.js + Node.js)

This repository contains a Next.js (App Router) web application with authentication and role-based access for admins, doctors, and patients. It also includes a small Socket.IO server for real-time chat and an optional Python (FastAPI) model server used for AI inference.

---

## Prerequisites

- **Node.js:** 18.18+ (20 LTS recommended)
- **Package manager:** npm (recommended) or yarn
- **Database:** PostgreSQL (required, via Prisma)
- **Optional services:**
  - **Redis** (recommended for production): token revocation + Socket.IO Redis adapter
  - **Python 3.x** (for the model server): required for AI inference and E2E flows that check the model health
  - **AWS S3** (optional): presigned uploads for chat attachments

---

## Clone & Setup

1) Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd Detect-app-scripts
npm install
```

2) Create your environment file:

- Copy the template to Next.js local env:

```bash
# macOS/Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

- For Prisma CLI and Node scripts, you may also want a `.env` (Prisma commonly reads `.env` by default):

```bash
# macOS/Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

3) Update environment variables (at minimum):

- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET` (use 32+ chars in production)

Optional (depending on what you use locally):
- `REDIS_URL`
- `PY_MODEL_URL`
- `S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

4) Run database migrations:

```bash
npx prisma migrate dev
```

Optional seed (creates sample admin/doctor/patient and a chat):

```bash
node prisma/seed.cjs
```

---

## Run Locally

### Full dev stack (recommended)

Runs Next.js + Socket server + Python model server:

```bash
npm run dev
```

### Run parts separately

- Next.js only:

```bash
npm run dev:next
```

- Socket server only:

```bash
npx cross-env NODE_ENV=development node scripts/socket-server.js
```

- Python model server only (Windows path used by the project scripts):

```bash
python_model\venv\Scripts\python.exe python_model\predict_server.py
```

---

## Common Commands

- Dev: `npm run dev`
- Lint: `npm run lint`
- Unit tests (Jest): `npm test`
- Build: `npm run build`
- Start (production): `npm run start`

### E2E Tests (Playwright)

- Run E2E (checks model health first):

```bash
npm run test:e2e
```

- Open Playwright UI:

```bash
npm run test:e2e:ui
```

If you want a watch workflow that boots Next + Socket and re-runs Playwright:

```bash
npm run test:e2e:watch
```

---

## Key Folder Structure

- **app/**
  - Next.js App Router pages, layouts, route handlers (API), and localized routes under `app/[locale]/...`.

- **components/**
  - Shared UI components used across the app.

- **public/uploads/**
  - Local upload storage for development (served statically by Next.js). In production you may prefer S3.

- **scripts/**
  - Development and maintenance scripts, including `scripts/socket-server.js` (Socket.IO dev server).

- **prisma/**
  - Prisma schema and migrations (`prisma/schema.prisma`, `prisma/migrations/`).

- **python_model/**
  - Optional FastAPI model server (`python_model/predict_server.py`) plus benchmarking utilities.

---

## Git-Ignored / Not Tracked Files

This repo ignores common local/build artifacts, including:

- `node_modules/`
- `.next/` and `out/`
- `coverage/`
- `.env*` (environment files)
- Build artifacts like `build/`

Uploads/logs:
- `public/uploads/` is present for local dev, but you typically should not commit user-uploaded files.
- If you generate logs locally, keep them out of Git (store under `logs/` or your preferred path).

---

## Documentation Links (Official)

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Playwright: https://playwright.dev/docs/intro
- Socket.IO: https://socket.io/docs/v4
- FastAPI: https://fastapi.tiangolo.com/
- AWS SDK for JavaScript (S3): https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/

---

## Notes

- Environment validation in production is enforced by `scripts/check-env.mjs` (requires at least `DATABASE_URL` and a strong `JWT_SECRET`).
- For Arabic documentation, see [README_AR.md](README_AR.md).
