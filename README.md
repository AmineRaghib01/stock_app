# StockFlow — Inventory Management Platform

Full-stack portfolio application for **stock / inventory management**: authentication with roles, dashboard analytics, catalog (products, categories, suppliers), stock movements, purchases with receiving, sales with automatic deductions, reports with CSV export, and an audit activity log.

## Tech stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, shadcn-style UI primitives, React Router, Axios, TanStack React Query, Recharts, Sonner
- **Backend:** Node.js, Express, PostgreSQL, Prisma, JWT, bcrypt, Zod, Helmet, CORS, Morgan, express-rate-limit, Multer (product images)

## Prerequisites

- Node.js 20+ recommended
- PostgreSQL 14+ (local or remote)

## Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set:

- **Database** — either a full `DATABASE_URL`, or the same style as many Node apps:
  - `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT`
  - At runtime the API builds `DATABASE_URL` from these if it is missing.
  - For `npx prisma db push` / migrations, keep a `DATABASE_URL` line in `.env` as well (see `.env.example`), or export it in your shell.
- `JWT_SECRET` — long random string (32+ characters)
- `CLIENT_ORIGIN` — frontend URL (default `http://localhost:5173`)
- `PORT` — API port (default `4000`; your other app may use `3000` — use a free port here)

Install dependencies and prepare the database:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

Start the API:

```bash
npm run dev
```

API base URL: `http://localhost:4000`  
REST prefix: `/api/v1`  
Health check: `GET http://localhost:4000/health`

Uploaded product images are served from `/uploads/...` (stored under `backend/uploads`).

## Frontend setup

```bash
cd frontend
cp .env.example .env
```

Ensure `VITE_API_URL` points to the API (default `http://localhost:4000/api/v1`).

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo accounts (after seed)

| Email | Password   | Role    |
|-----------------------|------------|---------|
| admin@stockflow.app   | Demo123!   | ADMIN   |
| manager@stockflow.app | Demo123!   | MANAGER |
| staff@stockflow.app   | Demo123!   | STAFF   |

**Users** management is restricted to **ADMIN**. Other roles use the rest of the operational modules.

## Project structure

```
backend/
  prisma/schema.prisma
  prisma/seed.js
  src/
    app.js, server.js
    config/, controllers/, middlewares/, routes/, services/, validations/, utils/

frontend/
  src/
    components/, hooks/, layouts/, lib/, pages/, services/, types/
```

## Scripts reference

**Backend**

- `npm run dev` — API with file watch
- `npm run db:push` — sync schema to DB
- `npm run db:seed` — seed demo data
- `npm run db:studio` — Prisma Studio

**Frontend**

- `npm run dev` — Vite dev server
- `npm run build` — typecheck + production build
- `npm run preview` — preview production build

## Security notes (portfolio)

- Passwords are hashed with bcrypt.
- JWT is stored in `localStorage` for simplicity; for production apps consider httpOnly cookies and CSRF strategy.
- Configure `JWT_SECRET`, `DATABASE_URL`, and CORS `CLIENT_ORIGIN` for each environment.

No Docker, Kubernetes, CI/CD, or cloud configuration files are included, by design.
