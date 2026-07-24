# TaskHorizon — Task Workflow Platform

A task workflow platform for distributing structured online tasks (such as community responses,
comments, replies) to a managed pool of registered workers. Not a public
marketplace — admins create tasks manually and workers claim, submit, and
get reviewed.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma · Supabase
Postgres · Auth.js (credentials only) · React Hook Form + Zod · TanStack
Query · Framer Motion · shadcn-style UI primitives.

## Getting started

```bash
npm install
cp .env.example .env       # fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET
npx prisma db push          # or: npm run db:migrate
npm run db:seed             # creates the first admin account
npm run dev
```

Sign in with the seeded admin credentials (`SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` from your `.env`, default `admin@example.com` /
`ChangeMe123!`) and change the password immediately in production.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Supabase connection (port 6543) used at runtime |
| `DIRECT_URL` | Direct Supabase connection (port 5432) used for migrations |
| `AUTH_SECRET` | Auth.js session encryption secret — generate with `openssl rand -base64 32` |
| `AUTH_URL` | Full URL of the deployment (e.g. `https://taskhorizon.yourdomain.com`) |
| `CRON_SECRET` | Optional — protects the `/api/cron/expire-claims` route |
| `DISCORD_TASKS_CHANNEL_ID` | Discord channel ID for the minimal available-task count alert |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Used only by `prisma/seed.ts` |

## Architecture notes

- **Balance is a ledger, not a mutable field.** Every approval writes a
  `BalanceTransaction` row; a worker's balance is `SUM(transactions)`. This
  makes every dollar auditable and leaves room for adjustments/payouts
  later without a second source of truth to keep in sync.
- **Claiming is race-safe.** `claimTask` uses a conditional `updateMany`
  (`WHERE status = 'AVAILABLE'`) so two workers hitting claim on the same
  task at once can't both succeed.
- **Claims expire.** Settings include a claim timeout separate from the
  claim cooldown. `/api/cron/expire-claims`, wired up in `vercel.json` to
  run every 5 minutes, releases stale claims back to the pool.
- **Rewards are snapshotted.** `Task.rewardSnapshot` is copied from
  `GlobalSettings` at creation time, so changing the reward settings never
  retroactively changes existing tasks.
- **NEEDS_REVISION** is a distinct submission/task state from REJECTED —
  it sends the task back to the same worker with an admin note rather than
  releasing it to the whole pool.

## What's built (Phase 2 MVP)

Auth (register/login, credentials only), role-based middleware, full
Prisma schema, worker dashboard (overview, browse + claim + submit,
history), admin panel (analytics overview, task creation, review queue
with approve/reject/needs-revision, worker search + profile with
suspend/reinstate, global settings), command palette, dark theme UI kit.

## Suggested next steps (Phase 3/4)

- Password reset / email verification flow (credentials-only auth has no
  self-serve recovery yet — locked-out users currently need an admin).
- Admin action audit log (who approved/rejected what, and when).
- IP/device fingerprint logging at registration to help catch
  multi-accounting.
- Further UI polish pass: empty-state illustrations, richer skeleton
  loading states, page transition animation.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel, add the environment variables above.
3. Vercel will run `prisma generate` via `postinstall` automatically.
4. Run `npx prisma db push` (or a migration) against your Supabase database
   once before first deploy, and run the seed script locally pointed at
   production `DATABASE_URL`/`DIRECT_URL` to create the first admin.
