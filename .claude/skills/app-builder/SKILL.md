---
name: app-builder
description: Orchestrates the full prompt-to-product pipeline for a SaaS/web-app build — PRODUCT SPEC → DATABASE → AUTH → BACKEND → API → UI → CRUD → TESTING → BROWSER QA → DEBUGGING → SEO → PERFORMANCE → DEPLOYMENT. Use this when the request is "build me a [SaaS/app]" rather than a single-page marketing site (for those, the plain frontend/design workflow in CLAUDE.md is enough — this skill is for anything with a database, auth, or backend logic).
---

# App Builder

The orchestrator for full-stack app builds in this repo. It sequences the other skills and the four `.claude/agents/` subagents so a brief turns into a deployed, tested app instead of a pile of disconnected files.

**When to use this vs. the plain site workflow**: a landing page, portfolio, or marketing site (this repo's existing `website*/` folders) doesn't need this pipeline — follow CLAUDE.md's Design standard directly. Reach for `app-builder` the moment the request implies a database, user accounts, or server-side logic — "SaaS", "dashboard", "booking system", "marketplace", "app where users can log in and...".

## Pipeline

Run these in order. Each stage names which skill/agent owns it and what "done" means before moving on. Stages 4–7 (BACKEND/API/UI/CRUD) commonly interleave in practice — see Sequencing below — but never skip a stage, and never move a stage's work to a later one just because it's inconvenient now.

| # | Stage | Owner | Done when |
|---|---|---|---|
| 1 | PRODUCT SPEC | `prompt-to-product` skill | Spec written: entities, MVP feature list, user flows, auth model, monetization (if any) |
| 2 | DATABASE | `database` skill + `backend` agent | Schema migrated, RLS enabled + policies written for every table, TypeScript types generated |
| 3 | AUTH | `auth` skill + `backend` agent | Sign-up/in/out working end to end, protected routes actually reject unauthenticated requests server-side (not just hidden in the UI) |
| 4 | BACKEND | `backend` agent | Server Actions / Route Handlers implement the MVP feature list, zod-validated at every boundary |
| 5 | API | `backend` agent | Contracts (inputs/outputs/errors) are typed and consistent; documented in code, not just implied |
| 6 | UI | `frontend-design` skill (this repo's version) + `frontend` agent | Pages/components built per CLAUDE.md's design standard — real content, no lorem ipsum, responsive, accessible |
| 7 | CRUD | `frontend` + `backend` agents together | Every entity from the spec has working create/read/update/delete wired UI-to-backend, including loading/error/empty states |
| 8 | TESTING | `webapp-testing` skill + `qa` agent | Playwright covers the core user flows from the spec (signup, primary CTA, at least one full CRUD cycle) |
| 9 | BROWSER QA | `browser-qa` skill + `qa` agent | Desktop + mobile viewports visually checked, zero console/page errors, fix→reload→inspect loop actually run |
| 10 | DEBUGGING | `debugging` skill | Invoked ad hoc whenever any stage above breaks — not a separate phase at the end |
| 11 | SEO | `seo` skill | Metadata, sitemap, robots, structured data in place for every public route |
| 12 | PERFORMANCE | `performance` skill | Core Web Vitals checked, images/fonts optimized, no obvious waterfall or bundle bloat |
| 13 | DEPLOYMENT | `vercel` plugin/MCP | Production build verified locally first, env vars confirmed present, deployed, live URL actually opened and checked |

Before declaring the whole build done, run the `reviewer` agent against CLAUDE.md's self-critique rubric (10 categories, 0–10, anything under 8 gets fixed, not noted).

## Sequencing

- Stages 1–3 are strictly sequential — you cannot design the API before the schema exists, and you cannot gate routes before auth exists.
- Once the schema (2) and auth (3) are settled, BACKEND (4) and UI (6) can proceed in parallel against the API contract from stage 5, drafted early rather than left implicit — write the contract (route/action names, inputs, outputs, error shapes) before both agents start, so they aren't guessing at each other's shape.
- CRUD (7) is the integration point — it's where BACKEND and UI stages actually get wired together, so treat it as its own checkpoint even though no new "layer" is created.
- TESTING and BROWSER QA (8–9) run after each vertical slice (e.g. "appointments CRUD" end to end), not only once at the very end — catching a broken flow while its code is still in context is far cheaper than after three more features are layered on top.
- SEO and PERFORMANCE (11–12) apply per public route as it's built, and get a final full pass before DEPLOYMENT.

## Real code, not mockups

Every stage produces working code against the real stack (Next.js + Supabase, per `.mcp.json`/`.env.example`), not placeholder JSON or hardcoded arrays standing in for a database — the `database` skill stage exists specifically so CRUD is never faked. The one exception is content that doesn't exist yet (a real logo, a real price, a real testimonial) — mark that as a placeholder per CLAUDE.md, don't invent it and don't fake the data layer to hide that it's missing.

## Gating rule

Don't advance a stage until the previous one's "done when" column is actually true — verified (build passes, RLS policy exists, Playwright run happened), not assumed. A green build is not "done" (CLAUDE.md's own rule) — this applies doubly here since a broken DATABASE or AUTH stage silently breaks everything built on top of it later.

## Kicking off a build

Given a brief like "Construiește-mi un SaaS pentru programări":
1. Run `prompt-to-product` to get the spec.
2. Walk the pipeline table above in order, dispatching each stage's work through the matching agent (`Agent` tool with `subagent_type` set to `frontend`, `backend`, or `qa` — see `.claude/agents/`) or by directly following the matching skill when a subagent isn't warranted for a small stage.
3. Run `reviewer` before calling DEPLOYMENT (13) finished.
4. Report back exactly what was built, what was tested, and — per this repo's standing instruction — exactly what the human needs to authorize or log into manually (Supabase project, Stripe account, Vercel account/domain) that Claude cannot do on their behalf.
