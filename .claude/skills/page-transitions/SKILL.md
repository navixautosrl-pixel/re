---
name: page-transitions
description: Transitions between pages and views — cross-document View Transitions for multi-page/static sites (@view-transition), React ViewTransition in Next.js (details in vercel-react-view-transitions), shared-element morphs, AnimatePresence route fallbacks, and reduced-motion/unsupported-browser behavior. Use when navigation between pages should feel continuous.
---

# Page transitions

## Purpose

Communicate continuity between pages (the thumbnail *becomes* the hero) without
breaking navigation, history, focus, or performance.

## When to activate

Multi-page sites (portfolio → case study, catalog → product), tab/route changes inside one page, any "make navigation feel smooth" request.

## Choose the mechanism

| Site type | Mechanism |
|---|---|
| Static/MPA (plain HTML, or Next static export with full page loads) | Cross-document View Transitions: CSS only |
| Next.js App Router (client navigation) | React `<ViewTransition>` (React 19.3+, no config) — follow `vercel-react-view-transitions` |
| In-page state swaps (tabs, filters) | `document.startViewTransition()` or Motion `AnimatePresence`/`layout` |

## Procedure — cross-document (MPA)

1. Opt in on **both** pages:
   ```css
   @view-transition { navigation: auto; }
   ```
2. Name shared elements identically on both pages (unique per page):
   ```css
   .case-hero-img[data-slug="riviera"] { view-transition-name: case-riviera; }
   ```
   or inline `style="view-transition-name: case-riviera"` on the thumbnail and the hero.
3. Tune timing:
   ```css
   ::view-transition-group(*) { animation-duration: 380ms; animation-timing-function: cubic-bezier(.16,1,.3,1); }
   @media (prefers-reduced-motion: reduce) { ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; } }
   ```
4. Unsupported browsers simply navigate normally — no polyfill needed.

## Procedure — Next.js App Router

1. `import { ViewTransition } from "react"`; wrap the thumbnail and the destination hero with the same `name` (`name={\`work-${slug}\`}`), add `share="morph" default="none"` on both when customizing (without `share`, `default="none"` silently stops the morph — documented gotcha).
2. Route navigations are transitions automatically; plain `setState` doesn't trigger ViewTransition — use `startTransition`.
3. The morph only pairs when the destination renders in the same commit (prefetched/static pages) — static export + `<Link>` prefetch satisfies this.
4. Directional slides: `addTransitionType("nav-forward")` in the click handler + CSS `:active-view-transition-type(nav-forward)`.
5. Read the installed Next docs: `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`.

## Accessibility & UX rules

- Focus: after navigation, focus lands on the new page's `<h1>` or main (Next does route announcement; check it).
- Keep transitions ≤ 400ms; never delay content for an exit animation.
- Don't animate the whole page sliding on every navigation — shared elements + subtle crossfade.

## Failure prevention

- Duplicate `view-transition-name` on one page → transition aborts (console error "Unexpected duplicate view-transition-name").
- Naming elements that are off-screen → odd flying elements; name only what's visible.
- Images with different aspect ratios on both pages → distorted morph; set `object-fit` and matching `aspect-ratio` or animate the group only.

## Verification checklist

- [ ] Chromium: navigate thumbnail → detail and back; screenshot mid-transition (`page.waitForTimeout(150)`) shows morph; no console errors.
- [ ] Reduced motion: navigation instant.
- [ ] Back/forward buttons and deep links work; no duplicate-name errors.
- [ ] Lighthouse: no CLS from the transition (view transitions don't count, layout after does).
