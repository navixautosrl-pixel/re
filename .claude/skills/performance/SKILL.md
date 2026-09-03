---
name: performance
description: Core Web Vitals and general performance for the Next.js + Supabase app-builder stack — image/font optimization, bundle size, query efficiency, caching. Use for the PERFORMANCE stage of an app-builder pipeline, applied per feature and again as a full pass before deployment.
---

# Performance

Owns the PERFORMANCE stage of the `app-builder` pipeline. A design constraint applied as the app is built, not a cleanup pass at the end.

## Core Web Vitals

- **LCP** — the largest above-the-fold element (usually a hero image or heading) should not depend on client-side data fetching; use Server Components and `next/image` with `priority` on the actual LCP image.
- **CLS** — always set explicit width/height (or `fill` with a sized container) on images; reserve space for anything that loads async (ads, embeds, late-arriving data) instead of letting it shift layout in.
- **INP** — keep client components' event handlers cheap; move heavy computation off the main thread or behind a loading state; avoid large client-side JS bundles blocking interactivity.

## Next.js specifics

- **Server Components by default.** Add `'use client'` only where interactivity genuinely requires it (forms, anything with local state/effects) — every unnecessary client component ships extra JS to the browser.
- **`next/image`** for all real content images — automatic sizing/format/lazy-loading. **`next/font`** for web fonts — self-hosted, no render-blocking external font request (this also sidesteps the Google Fonts network dependency this repo has hit in sandboxed testing before).
- **Dynamic imports** (`next/dynamic`) for heavy client-only components not needed on initial render (rich editors, charts, modals).
- **Streaming/Suspense** for slow data — show the shell immediately, stream in the slow part, rather than blocking the whole page on the slowest query.
- **Avoid fetch waterfalls** — parallelize independent data fetches (`Promise.all`, or Next's own request deduplication) instead of awaiting them one after another.

## Database/query side

- Select only the columns actually used, not `select('*')` by habit.
- Confirm indexes exist for columns used in frequent `where`/`order by`/joins (coordinate with `database` skill — don't add indexes speculatively before real query patterns exist).
- Use `revalidate`/cache options deliberately on `fetch` calls and Server Components — static where content doesn't change per-request, revalidated/dynamic where it must.

## Bundle size

Watch what gets added — a new dependency for something a few lines of code could do is a bundle-size cost with no functional gain (also CLAUDE.md's general "no dependency added without a reason"). If a page's JS looks unexpectedly large, check for an accidentally client-bundled heavy library (a full date library, an icon set imported in bulk instead of per-icon) before assuming it's unavoidable.

## Verify, don't guess

Check actual Lighthouse/PageSpeed-style metrics (via the Vercel plugin's performance tooling if connected, or a Playwright + Lighthouse run) against a real build, not an assumption that "Server Components are fast so it's fine." No micro-optimization for its own sake — optimize what's actually shown to be slow.
