---
name: scroll-storytelling
description: Designing and building scroll-driven narratives — choosing which section earns a pinned/scrubbed set piece, scene scripting, GSAP ScrollTrigger and CSS scroll-driven animations, cinematic hero sequences, text mask reveals, mobile and reduced-motion fallbacks, and QA of pin release. Use when a brief asks for cinematic, immersive or storytelling scroll.
---

# Scroll storytelling & cinematic sequences

## Purpose

Make scrolling *mean* something: one or two scenes where motion explains the product
or story, everything else calm. Implementation details of the APIs live in
`gsap-scrolltrigger`, `gsap-timeline`, `gsap-react`; this skill is the direction + recipe layer.

## When to activate

Briefs with "immersive", "cinematic", "storytelling", "Apple-style", product reveals, process explanations, before/after.

## Procedure

1. **Script the story first** (in the CLAUDE.md motion storyboard): for each candidate section write *what changes on screen* and *what the visitor learns*. If nothing is learned, it's decoration → no scroll scene.
2. **Pick at most 1–2 PRIMARY scenes** per page. Good fits: a process with ordered steps, a transformation (before→after), a product assembling/rotating, a timeline, a number that builds. Bad fits: testimonials, pricing, forms, FAQ.
3. **Choose the technique** (lightest that works):
   | Effect | Tool |
   |---|---|
   | progress bar, parallax-lite, fade/scale tied to scroll on modern browsers | CSS `animation-timeline: view()` / `scroll()` inside `@supports (animation-timeline: view())` |
   | pinned section with a choreographed timeline, scrub | GSAP `ScrollTrigger` (`pin: true`, `scrub: 0.5–1`) |
   | discrete step changes (step 1→2→3) | ScrollTrigger `onEnter/onLeaveBack` toggling state, or `snap` |
   | horizontal gallery driven by vertical scroll | `containerAnimation` (ease `"none"` mandatory) |
4. **Build the scene as a timeline**:
   ```js
   const mm = gsap.matchMedia();
   mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
     const tl = gsap.timeline({ defaults: { ease: "none" },
       scrollTrigger: { trigger: ".scene", start: "top top", end: "+=180%", pin: true, scrub: 0.8, invalidateOnRefresh: true } });
     tl.from(".scene .step-1", { autoAlpha: 0, y: 40 })
       .to(".scene .device", { rotateY: -18, scale: 0.9 }, "<")
       .from(".scene .step-2", { autoAlpha: 0, y: 40 }, "+=0.2");
   });
   ```
   Desktop-only pin by default; mobile gets the same content stacked, with simple reveals.
5. **Text mask reveals** (headlines only): wrap each line in `overflow:hidden` + inner span translated `yPercent: 100 → 0`; pad the mask (`padding-bottom: .14em; margin-bottom: -.14em`) so descenders aren't clipped (bug found on skill-atelier). Put a real space between the line spans (`</span>{" "}<span>` in JSX) — otherwise the accessible name reads "boardfor building" (also found on skill-atelier, by `competitor-website-analysis`). GSAP `SplitText` (free since 3.13) for word/char splits — revert on resize.
6. **Pin hygiene**: pin a wrapper, animate children; `pinSpacing: true` unless layout handles it; create triggers top-to-bottom; `ScrollTrigger.refresh()` after fonts/images load and when content above changes height (ResizeObserver on `document.body`, debounced).
7. **Lenis / smooth scroll**: only if the storyboard needs inertia; wire `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add((t) => lenis.raf(t * 1000))`; disable for reduced motion.
8. **Reduced motion & no-JS**: the final state of every scene is the default HTML/CSS; the scene only *adds* motion. Under `prefers-reduced-motion: reduce` no pinning, no scrub.
9. **Performance**: transforms/opacity only; no layout properties in scrubbed tweens; `will-change` only on the moving elements during the scene; lazy-load heavy media in the scene.

## Failure prevention

- Pin that never releases on fast scroll / anchor jumps → test `scrollTo` straight past the scene.
- Scroll-jacking (blocking wheel) — never; scrub follows native scroll.
- Scenes on mobile with 300% pin length → endless thumb scrolling.
- Markers (`markers: true`) left in production.

## Verification checklist

- [ ] Interaction test: scroll to 25/50/75% of the scene, assert intermediate states (pattern: `skill-atelier/tests/interactions.mjs` "pipeline mid-scroll").
- [ ] Jump past the scene with `scrollTo(0, document.body.scrollHeight)` → layout below is correct, pin released.
- [ ] 375px: no pin, content readable in order.
- [ ] `reducedMotion: 'reduce'` run → final states, no transforms.
- [ ] Console: no GSAP "target not found" warnings; performance trace shows no long tasks during scrub.
