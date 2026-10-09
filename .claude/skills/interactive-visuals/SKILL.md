---
name: interactive-visuals
description: Decision guide and implementation patterns for rich visuals beyond CSS — inline SVG animation (path drawing, morphing, masks), Lottie (dotLottie), Rive state machines, Canvas 2D, and Three.js / React Three Fiber 3D scenes — including lazy loading, mobile fallbacks, reduced-motion behavior, and performance budgets. Use when a design calls for illustration animation, an interactive product demo, a 3D hero, particles/shaders, or animated icons.
---

# Interactive visuals (SVG · Lottie · Rive · Canvas · WebGL)

## Purpose

Pick the lightest technology that genuinely serves the story, and ship it without
hurting LCP, INP, battery, or accessibility.

## When to activate

Storyboard includes illustration motion, a product configurator/demo, a 3D object,
particles/shaders, or animated icons. First answer: *does this subject actually have a
3D/illustrative nature?* If not, don't add it (CLAUDE.md: a 3D hero that doesn't serve
the subject is AI slop).

## Decision table

| Need | Use | Cost |
|---|---|---|
| Icons/line art draw-on, logo reveal, simple morph | Inline SVG + CSS `stroke-dashoffset`, or GSAP DrawSVG/MorphSVG (`gsap-plugins`) | ~0 KB extra (CSS) |
| Designer-made After Effects animation | dotLottie: `@lottiefiles/dotlottie-react` + `.lottie` file | player ~ tens of KB + file |
| Interactive, stateful illustration (hover/click states, inputs) | Rive: `@rive-app/react-canvas` + `.riv` | runtime (WASM) ~ hundreds of KB — lazy-load |
| Many moving 2D particles, generative pattern | Canvas 2D + `requestAnimationFrame` | your code only |
| Real 3D object, camera moves, shaders | `three` + `@react-three/fiber` (+ `@react-three/drei`) | large — never on LCP path |

Check current versions with `npm view <pkg> version` before installing.

## Workflow

1. Write the storyboard line for the visual (trigger, duration, loop?, reduced-motion state, mobile state).
2. Produce the **static fallback first** (SVG/AVIF poster) — that is what LCP, no-JS, reduced-motion and low-power devices get.
3. Implement with the chosen tech, **lazy-loaded**:
   ```tsx
   // Server Component page
   import dynamic from "next/dynamic";
   const Scene = dynamic(() => import("@/components/visuals/Scene"), { ssr: false, loading: () => <Poster /> });
   ```
   Mount only when near viewport (IntersectionObserver) and only when `!matchMedia('(prefers-reduced-motion: reduce)').matches`.
4. **Pause when off-screen / tab hidden**: R3F `frameloop="demand"` (invalidate on change) or toggle `frameloop` via IntersectionObserver; Lottie/Rive `pause()` on exit; Canvas cancel rAF on `visibilitychange`.
5. **Cap cost**: R3F `dpr={[1, 1.75]}`, Draco/meshopt-compressed GLB, KTX2/WebP textures ≤ 2048px, ≤ ~100k triangles for a hero object; Lottie avoid huge raster layers.
6. **Accessibility**: decorative → `aria-hidden="true"` on the container; informative → visible text equivalent nearby (not only `aria-label` on a canvas). Interactive 3D must have keyboard-operable controls or a non-3D alternative.
7. **Mobile**: default to the poster or a reduced scene below 768px or when `navigator.hardwareConcurrency <= 4`; no scroll-hijacking.

## SVG path draw (no library)

```css
.draw path { stroke-dasharray: var(--len); stroke-dashoffset: var(--len); }
@media (prefers-reduced-motion: no-preference) {
  .draw.is-in path { transition: stroke-dashoffset 1.2s var(--ease-out-expo); stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) { .draw path { stroke-dashoffset: 0; } }
```
Set `--len` from `path.getTotalLength()` in JS, or use `pathLength="1"` on the path and `--len: 1`.

## Lazy-load GSAP too

If a ScrollTrigger set piece only runs on desktop, import GSAP inside the effect *after* `matchMedia` matches (`const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")])`), so phones never download it. Use `gsap.context()` + `ctx.revert()` for cleanup. Also call `ScrollTrigger.refresh()` from a debounced `ResizeObserver` on `document.body` whenever content above the trigger can change height (filters, "show all", accordions). Otherwise trigger positions go stale, a bug verified on skill-atelier.

## Common failure modes

- 3D canvas as LCP element → 4–8 s LCP on mid phones.
- WebGL context left running in a hidden tab → battery drain, INP regression.
- Lottie JSON with embedded PNGs (MBs).
- No fallback → blank box when WebGL is unavailable (check `WebGLRenderingContext` / R3F `fallback` prop).

## Verification

- Lighthouse mobile: LCP element is the poster/text, not the canvas; TBT not regressed vs. without the visual.
- QA script with `reducedMotion: reduce` → poster shown, no rAF loop (check `performance` trace or a counter).
- Real-browser screenshot of the visual at 375 and 1440, and with WebGL disabled (`--disable-webgl` launch arg) to see the fallback.

## Completion criteria

Visual justified by the subject, lazy, paused off-screen, has a static fallback used for reduced motion/no-JS/no-WebGL, and measured to not regress LCP/INP.
