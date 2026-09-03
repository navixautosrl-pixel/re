---
name: browser-qa
description: Full-stack browser QA for an app with auth and CRUD — Playwright flows covering signed-out/signed-in states, desktop+mobile viewports, console errors, accessibility. Use for the BROWSER QA stage of an app-builder pipeline. For static/marketing sites without a backend, the simpler `webapp-testing` skill alone is usually enough.
---

# Browser QA

Owns the BROWSER QA stage of the `app-builder` pipeline. Builds on `webapp-testing` (Python Playwright, already installed in this repo) with the extra dimension a full-stack app needs: state (signed out vs signed in vs different roles), not just static pages.

## What to actually check, per build

1. **Server boots clean.** Start the dev server (or a production build + start) and confirm no startup errors before opening a browser at all.
2. **Unauthenticated state**: public pages render, protected pages/routes correctly redirect or reject (this doubles as a real test of the `auth` stage's server-side checks, not just its UI).
3. **Signed-in state**: use a real test account (seeded via `database` skill's seed data, never a hardcoded skip-auth backdoor) to walk the primary user flows from the product spec.
4. **Full CRUD cycle for at least one entity, end to end in the browser**: create → confirm it appears in the list → edit → confirm the change persisted → delete → confirm it's gone. This is the real acceptance test for the CRUD stage — a component that merely renders is not the same as a mutation that actually round-trips through the database.
5. **Console/page errors**: assert zero, on every page visited, both states. A page that "looks fine" with a red console error is not fine — treat it the same as this repo's existing site QA already does.
6. **Responsive**: at minimum a mobile width (~390px) and a desktop width (~1440px) per page, screenshotted and actually looked at — overflow, stacking, tap-target size.
7. **Accessibility, quick pass**: keyboard-only navigation through the primary flow (tab order, visible focus), form labels/errors announce correctly, color contrast on the theme's actual tokens (not assumed from the design spec). Use `axe-core` via Playwright if the project already has it available; otherwise the manual checklist in CLAUDE.md's Accessibility section still applies.
8. **Payment flows, if Stripe is wired in**: use Stripe's documented test card numbers (never real card data) — see the `stripe` plugin's `test-cards` command — and verify the webhook-driven state change actually happens (e.g. subscription status flips) rather than only checking the checkout redirect succeeded.

## Loop

Fix → reload → inspect again, per CLAUDE.md's Visual QA section — this stage is not a one-shot pass/fail, it's the same iterate-until-it's-actually-right loop used throughout this repo's site QA, extended to cover authenticated state and data mutations.

## Server lifecycle

Use `webapp-testing`'s `scripts/with_server.py` pattern (or equivalent) so the dev/preview server is reliably started before tests and torn down after — don't leave orphaned servers running on a port (check with `lsof`/`ps` and kill explicitly if a prior run left one, as has happened in this repo's history).

## Handoff

Anything found here that isn't a quick fix goes back to whichever stage owns it — a broken mutation goes to `backend`/`database`, a layout bug goes to `frontend`, a real bug either agent introduces gets logged and handed to `debugging` if the cause isn't immediately obvious. Don't silently work around a bug in the test itself (e.g. loosening an assertion) to make BROWSER QA "pass".
