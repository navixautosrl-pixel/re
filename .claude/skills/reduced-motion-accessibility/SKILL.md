---
name: reduced-motion-accessibility
description: Making motion safe and fast for everyone — prefers-reduced-motion strategies per animation type (CSS, Motion, GSAP, Lottie/Rive, video, scroll scenes), pause controls (WCAG 2.2.2), no-JS final states, flashing limits, and mobile motion budgets (no pinning, battery, INP). Use whenever a page has animation, and in QA.
---

# Reduced motion & mobile motion

## Purpose

Every animated page must be fully usable — and nothing important hidden — when motion is
reduced, JavaScript is off, or the device is a mid-range phone.

## When to activate

Any time animation is added; motion QA; WCAG audits; mobile performance issues tied to animation.

## Rules (non-negotiable, from CLAUDE.md Motion standard)

1. Content is in its **final layout and visible** without JS and under `prefers-reduced-motion: reduce`.
2. Reduced motion removes: parallax, scrub, pinning, large translations/scales, auto-playing loops, smooth-scroll. It may keep: opacity fades ≤ 200ms, color changes, essential state changes made instant.
3. Anything that moves/blinks/auto-updates for > 5s gets a pause/stop control (WCAG 2.2.2) — carousels, background video, Lottie loops, marquee.
4. Nothing flashes more than 3 times per second (WCAG 2.3.1).

## Implementation per tool

| Tool | Pattern |
|---|---|
| CSS | wrap keyframes in `@media (prefers-reduced-motion: no-preference)`; or a global reset `@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}` — ensure final keyframe state is the resting style |
| Motion for React | `<MotionConfig reducedMotion="user">` at the root (disables transform/layout, keeps opacity); `useReducedMotion()` for custom logic |
| GSAP | `gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", …)` — reduced users simply never get the tweens; `gsap.matchMediaRefresh()` after an in-page toggle |
| Lottie / Rive | don't autoplay; show first/last frame or the static poster; play on user action |
| Video | `autoplay muted loop playsinline` only when not reduced; otherwise `poster` + play button |
| View Transitions | disable via `::view-transition-*` animation: none in the reduced media query |

An optional **in-page motion toggle** (stored in `localStorage`, applied as `data-motion="reduce"` on `<html>`) helps users who don't know the OS setting; GSAP must call `matchMediaRefresh` / your hooks must read the attribute.

## Mobile motion budget

- No pinning/scrub below ~768px by default; replace with stacked content + short reveals.
- Don't download motion libraries on devices that won't run them (dynamic `import("gsap")` after `matchMedia` matches — cut skill-atelier mobile TBT from ~400ms to ~140ms with LazyMotion).
- Pause canvases/WebGL/Lottie off-screen (IntersectionObserver) and on `visibilitychange`.
- Touch targets stay put during animations (no moving buttons).

## Failure prevention

- `opacity: 0` set in CSS for reveal elements, un-hidden only by JS → blank sections for no-JS and reduced users.
- Reduced-motion branch that *skips setting the final state* → elements stuck mid-animation.
- Autoplaying background video with no pause.

## Verification checklist

- [ ] `site_qa.mjs` "reduced-motion" and "no-js" passes: 0 invisible content.
- [ ] Playwright with `reducedMotion: 'reduce'`: computed `transform` of animated elements is `none`, pinned sections not pinned.
- [ ] Every auto-moving element > 5s has a reachable pause control.
- [ ] Mobile Lighthouse (2–3 runs): TBT ≤ 200ms; no animation-related long tasks in the trace.
