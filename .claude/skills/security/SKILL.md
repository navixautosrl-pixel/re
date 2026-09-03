---
name: security
description: OWASP-flavored security checklist for the Next.js + Supabase + Stripe app-builder stack — RLS as the real authorization boundary, input validation, webhook verification, secrets handling. Use throughout an app-builder build, and as a full pass before deployment; complements the always-on `security-guidance`/`claude-security` plugins.
---

# Security

Applies throughout the `app-builder` pipeline, not as a single stage — every BACKEND/API/AUTH change should pass this checklist before being considered done. This is the app-builder-specific complement to the repo-wide `security-guidance` (ambient review) and `claude-security` (on-demand scan) plugins already installed.

## Authorization boundary

- **RLS is the real boundary, not the UI.** Every table has RLS enabled and policies written before any client code touches it (`database` skill). A hidden button is not access control.
- **Server-side session checks on every Server Action / Route Handler** that touches non-public data — never assume `middleware.ts` alone covers it (`auth` skill).
- **Never ship the Supabase service-role key to the client.** It bypasses RLS entirely. It belongs only in server-only env vars, never `NEXT_PUBLIC_`-prefixed, never referenced from a client component.

## Input validation

- **Validate at every server boundary** — Server Actions, Route Handlers, webhook payloads — with zod (or equivalent), not just client-side form validation (which a direct API call bypasses entirely).
- Treat all client-supplied IDs as untrusted — a request claiming `userId: X` must be checked against the actual authenticated session, never taken at face value.

## Stripe

- **Verify webhook signatures** (`stripe.webhooks.constructEvent` with the raw body and `STRIPE_WEBHOOK_SECRET`) on every webhook route — an unverified webhook endpoint lets anyone POST fake payment events.
- Never trust client-reported payment state (a redirect back from Stripe saying "success") as the source of truth — the webhook-driven server-side update is the real state; the redirect is only UX.
- Test with Stripe's documented test card numbers only (the `stripe` plugin's `test-cards` command) — never real card data, in code, logs, or conversation.

## Secrets

- Real secrets live only in environment variables, never committed — `.env.example` documents names with placeholder values only; actual `.env`/`.env.local` are gitignored.
- Anything prefixed `NEXT_PUBLIC_` is shipped to the browser — audit before adding that prefix to anything that isn't genuinely safe to expose (a Supabase anon key is fine under RLS; a service-role key or Stripe secret key never is).
- Never ask the user for a credential value in chat, and never write one into a committed file — reference `${VAR}` in config, real values only in the environment (already this repo's standing rule).

## Dependencies and general OWASP hygiene

- Run `npm audit`/`pnpm audit` when adding dependencies or before a deploy; don't add a dependency without a reason.
- Use the Supabase client's query builder (parameterized) — never string-concatenate SQL.
- File uploads (Supabase Storage, if used): validate type/size server-side, default to private buckets with RLS/signed URLs rather than public buckets, unless the spec genuinely requires public content.
- Rate-limit public mutation endpoints where abuse is plausible (sign-up, contact forms, anything unauthenticated).

## What "fixing" a security finding means

The safer fix, always — per this repo's standing PR-review rules. Never resolve a security finding by disabling the control that caught it (RLS, webhook verification, auth middleware) — that turns a caught bug into a shipped vulnerability. See `debugging` skill's "never as a fix" section, which this rule is a specific case of.
