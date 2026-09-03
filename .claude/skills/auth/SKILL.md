---
name: auth
description: Authentication and authorization for the Supabase-backed app — sign-up/in/out, session handling, route protection, roles. Use for the AUTH stage of an app-builder pipeline, or whenever a route/action needs to check who's calling it.
---

# Auth

Owns the AUTH stage of the `app-builder` pipeline: real sign-up/in/out and server-verified authorization, not a UI that merely hides a button from logged-out users.

## Stack

Supabase Auth via `@supabase/ssr` (the current supported package for Next.js — do not use the deprecated `@supabase/auth-helpers-nextjs`). Three client shapes, each for a specific context:
- `createBrowserClient` — client components
- `createServerClient` — Server Components, Server Actions, Route Handlers (reads/writes cookies)
- `middleware.ts` — refreshes the session cookie on every request; without this, sessions silently expire mid-use

## Process

1. **Confirm the auth model from the product spec** — open sign-up vs invite-only, roles (if any), what's public vs behind auth.
2. **Wire the three client shapes** per the Supabase/Next.js SSR pattern — `lib/supabase/client.ts`, `lib/supabase/server.ts`, and `middleware.ts` at the project root refreshing the session.
3. **Build the flows** (email/password minimum; magic link or OAuth providers only if the spec calls for them) using shadcn form components — real validation errors shown, not just a generic "something went wrong".
4. **Protect routes server-side.** `middleware.ts` redirecting unauthenticated requests away from protected route groups is the first layer; every Server Action and Route Handler that touches non-public data must independently re-check the session itself (`const { data: { user } } = await supabase.auth.getUser()`) rather than trusting that middleware already handled it — middleware can be bypassed or misconfigured, so treat each server boundary as its own checkpoint.
5. **Roles/authorization beyond "logged in or not"**: a `profiles` table (or similar) with a `role` column, joined against `auth.users` via `id`, referenced in RLS policies (`database` skill) and in server-side checks — never trust a role claimed by the client.

## The rule this stage exists to enforce

Hiding a nav link or a button for unauthenticated users is UX, not authorization. Every stage after this one must assume a malicious or curious user can call any Server Action or Route Handler directly, bypassing the UI entirely — the only real gate is the server-side session check plus RLS. If a page "looks" protected but its Server Action doesn't check the session itself, it isn't protected.

## Common mistakes to avoid

- Checking auth only in a client component (`useEffect` redirect) with no server-side enforcement — trivially bypassable.
- Forgetting `middleware.ts`, causing sessions to appear to randomly log out.
- Storing a role or permission in a client-readable cookie/localStorage and trusting it server-side.
- Using the anon key for privileged server-side operations that should use the service-role key (and vice versa — never ship the service-role key to the client; it bypasses RLS entirely, see `.env.example` and `security` skill).
- Building sign-up/in forms with no error states — wrong password, existing email, weak password all need real, visible feedback.
