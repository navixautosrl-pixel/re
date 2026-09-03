---
name: debugging
description: Systematic root-cause debugging for the app-builder stack (Next.js + Supabase + Stripe) — use whenever a build, test, or manual check turns up a real error, at any pipeline stage. Not a separate end-of-project phase; invoke it the moment something breaks.
---

# Debugging

Not a pipeline stage with a fixed position — it's invoked ad hoc, the moment anything from DATABASE through DEPLOYMENT breaks. The goal is a fixed root cause verified by the same repro that found it, not a suppressed symptom.

## Process

1. **Reproduce first.** Get the exact failing case (the request, the input, the route, the account state) before touching code. A fix for a bug you haven't reproduced is a guess.
2. **Read the actual error**, not a summary of it — full server log/terminal output, full browser console entry (expand the stack trace), full Playwright trace/error on a failed assertion. The real message usually names the layer (a Postgres error names the constraint; a Next.js error names the file and line; a Stripe error names the parameter).
3. **Isolate which stage introduced it** — did DATABASE change (a migration, a policy), did AUTH change (session shape), is this a BACKEND validation gap, or a UI state bug? `git log`/`git diff` on the relevant files narrows this fast if the bug is new.
4. **Fix the root cause, not the symptom.** Loosening a zod schema to stop a validation error, disabling RLS to stop a permission error, or catching-and-swallowing an exception to stop a crash are all symptom fixes that reintroduce the underlying bug (or a worse one) later — see `database`/`security` skills for why RLS specifically must never be the shortcut.
5. **Verify with the original repro**, then check for regressions in adjacent flows the fix could have touched.

## Stack-specific failure patterns worth recognizing immediately

- **Next.js hydration mismatch** — usually a Server/Client Component rendering different output (a `Date`, `Math.random()`, or browser-only API used during server render). Fix by moving the non-deterministic bit into a `useEffect` or marking the boundary correctly, not by suppressing the warning.
- **Supabase "permission denied for table X"** — a missing or wrong RLS policy, not a bug in the query. Go to `database` skill, fix the policy.
- **Supabase "JWT expired" / random logouts** — missing or misconfigured `middleware.ts` session refresh (`auth` skill).
- **Stripe webhook signature verification failing** — almost always the raw request body being parsed/transformed before `stripe.webhooks.constructEvent` sees it (Next.js Route Handlers must read the raw body, not a JSON-parsed one, for the webhook route specifically).
- **Env var is `undefined` in the browser** — missing the `NEXT_PUBLIC_` prefix (client-visible vars need it; secrets must never have it — see `.env.example`).
- **Env var is `undefined` only in production** — set locally but never added to the actual deployment target (Vercel project settings), or read at build time when it's only available at runtime (or vice versa).
- **CORS/cookie issues with SSR auth** — usually a mismatch between the Supabase client used (browser vs server) and where the code is actually running, or a cookie domain/`sameSite` misconfiguration.

## When the cause isn't obvious

Add targeted logging or a minimal reproduction script rather than guessing-and-checking against the full app repeatedly — narrow the search space before trying fixes.

## Never as a fix

Skipping/disabling a failing test, silencing a real error instead of handling it, or disabling a security control (RLS, webhook signature checks, auth middleware) to make an error disappear. These make the build "pass" without making the app correct — exactly the gap CLAUDE.md's "a green build is not done" rule exists to catch.
