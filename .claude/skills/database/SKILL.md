---
name: database
description: Schema design, migrations, and Row Level Security for the Supabase/Postgres backend — use for the DATABASE stage of an app-builder pipeline, or any time an entity from the product spec needs a table. Not for one-off SQL queries against an already-built app; that's normal backend work.
---

# Database

Owns the DATABASE stage of the `app-builder` pipeline: turning the spec's entity list into real, secured Postgres tables on Supabase.

## Stack

Supabase (Postgres + RLS + generated types). Two ways to reach it, use whichever is actually available in the session:
- **`supabase` MCP tools** (`mcp__supabase__*`, from the installed `supabase` plugin) when connected — can list projects, run SQL, apply migrations against a real project directly.
- **Supabase CLI** (`supabase migration new <name>`, `supabase db push`, `supabase gen types typescript`) when working against a local/linked project via the repo's `supabase/` directory.

If neither is connected yet, say so and tell the user what to authorize (see .env.example / CLAUDE.md's MCP section) rather than inventing table state that doesn't exist.

## Process, per entity from the product spec

1. **Design the table.** UUID primary key (`id uuid primary key default gen_random_uuid()`), `created_at`/`updated_at timestamptz default now()`, foreign keys with an explicit `on delete` behavior (don't leave it to the default — decide cascade vs restrict vs set null per relationship).
2. **Write it as a migration**, not an ad hoc `ALTER TABLE` — `supabase/migrations/<timestamp>_<name>.sql`, checked into git. Migrations are the only source of truth for schema; never hand-edit the remote database and let the migration history drift from it.
3. **Enable RLS immediately, same migration**: `alter table <t> enable row level security;`. A table with RLS off is not "temporarily open for development" — it's a table anyone with the anon key can read and write. There is no case in this pipeline where a table ships to CRUD/UI with RLS disabled.
4. **Write policies before any client code touches the table.** Minimum: a `select` policy scoped to what the auth model says the user should see (their own rows, or their team's, or public if the spec says so), and `insert`/`update`/`delete` policies scoped the same way. Tie them to `auth.uid()`, not to a client-supplied user-id column that a request could spoof.
5. **Generate types**: `supabase gen types typescript --local > lib/database.types.ts` (or via MCP equivalent) after every schema change, so the BACKEND/UI stages are working against the real shape, not a stale one.
6. **Seed data** for local dev goes in `supabase/seed.sql` — realistic shapes, but never real user data and never fabricated "customer" data presented as if real (placeholder, clearly marked, per CLAUDE.md).

## RLS is non-negotiable

If a query fails with "permission denied" or returns empty because of RLS, the fix is a correct policy — never `alter table ... disable row level security` to make an error go away. Disabling RLS to unblock a demo is the single most common way this stack ships a real vulnerability; treat any suggestion to do so (including your own, mid-debugging) as a red flag to stop and fix the policy instead. See `security` skill for the fuller checklist this rule belongs to.

## CRUD generation pattern

For each entity, the DATABASE stage's output feeds directly into BACKEND/CRUD:
```
migration (table + RLS policies)
  → generated types
  → typed query/mutation functions (Server Actions or Route Handlers — see `backend` agent)
  → UI hookup (see `frontend-design` skill + `frontend` agent)
```
Don't let the UI stage query Supabase directly from client components for anything that needs authorization logic beyond RLS itself — route mutations through Server Actions/Route Handlers so validation (zod) and any business logic beyond row-level access control has one place to live.

## Common mistakes to avoid

- Using `text` for everything instead of the right type (`timestamptz`, `numeric` for money — never `float` for currency, `enum`/check constraints for fixed value sets).
- Missing indexes on foreign keys and on columns used in frequent `where`/`order by` — check with the `performance` skill once real queries exist, don't guess indexes speculatively either.
- Storing money as floats, or storing derived/computed values that can drift instead of computing them on read or via a generated column.
- One migration per unrelated change — keep migrations scoped so a rollback doesn't take unrelated schema with it.
