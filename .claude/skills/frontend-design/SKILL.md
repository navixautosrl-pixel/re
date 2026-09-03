---
name: frontend-design
description: Implementation-level UI conventions for this repo's Next.js + Tailwind + shadcn/ui app-builder stack — Server/Client Component boundaries, component patterns, forms, states. Use for the UI stage of an app-builder pipeline. For the visual-design anti-slop checklist (what NOT to do), see CLAUDE.md's Design standard and the installed `frontend-design` plugin — this project-scoped skill is about how to build the UI correctly in this specific stack, not a duplicate of that list.
---

# Frontend Design (implementation)

Owns the UI stage of the `app-builder` pipeline. This is deliberately narrower than the installed `frontend-design` plugin and CLAUDE.md's Design standard — those cover visual-design judgment (palette, typography, avoiding AI-slop tells); this skill covers how to actually build the UI in this repo's stack without introducing structural bugs.

## Server vs Client Component boundary

Default every component to a Server Component. Add `'use client'` only at the boundary where it's actually needed — a form, anything with `useState`/`useEffect`/event handlers, anything using a browser-only API. Push `'use client'` as far down the tree as possible (wrap just the interactive part, not the whole page) so the rest of the page stays server-rendered — this is a performance requirement (`performance` skill) as much as a correctness one.

## shadcn/ui usage

- Add components via the CLI (`npx shadcn@latest add <component>`), don't hand-copy component code — the CLI wires up the right Radix dependency and keeps the component in the project's own `components/ui/` for further customization.
- Check `components/ui/` for an existing component before adding a new one or hand-rolling a Tailwind approximation of something shadcn already provides.
- Theme through the CSS custom properties in `globals.css` (`--background`, `--primary`, etc., consumed as `hsl(var(--x))`) — set the palette there once per project (query `ui-ux-pro-max` fresh, per CLAUDE.md), don't override colors ad hoc per component.
- Radix primitives underlying shadcn components are already keyboard/screen-reader accessible — don't fight them by overriding focus handling or adding conflicting ARIA; extend, don't replace.

## Forms

`react-hook-form` + `zod` (via `@hookform/resolvers`) + shadcn's `Form` components. The zod schema used for client-side validation should be the same one (or a shared source) used for server-side validation in the Server Action — one schema, not two that can drift apart.

## Layout composition

Use route groups to separate layout concerns — e.g. `app/(marketing)/` for public pages with the marketing nav/footer, `app/(app)/` for the authenticated dashboard shell — rather than one layout trying to conditionally render both.

## Required states, every data-driven view

Loading, error, and empty states are not optional polish — build all three alongside the happy path, not after:
- **Loading**: a skeleton or spinner matching the eventual content's shape, not a layout jump when data arrives.
- **Error**: a real message, not a blank screen or an uncaught exception reaching the user.
- **Empty**: what a list/dashboard looks like with zero rows — this is often the *first* thing a new signed-up user actually sees, so it needs to guide them to the primary action, not just say "no data".

## Icons and assets

`lucide-react` (already a shadcn/ui dependency) for icons — don't add a second icon library. Real content only per CLAUDE.md — no placeholder images pretending to be final, no invented logos/testimonials.

## Responsive

Mobile-first Tailwind classes (`className="text-sm md:text-base"` style — base styles for mobile, `md:`/`lg:` overrides upward), verified at actual breakpoints in `browser-qa`, not just assumed from the class names used.
