---
name: motion-react
description: Motion for React (the `motion` package, formerly Framer Motion) for component-level animation — mount/unmount with AnimatePresence, whileInView reveals, layout/shared-layout transitions, gestures, useScroll/useTransform, variants and stagger, MotionConfig reducedMotion, LazyMotion bundle trimming, and SSR-safe patterns in Next.js. Use when animating React components, menus, accordions, tabs, modals, reveals, or hover/press feedback. For pinned/scrubbed scroll choreography use the gsap-scrolltrigger skill instead.
---

# Motion for React

## Purpose

Component-state animation that stays declarative, interruptible, accessible and small.

## When to activate

Menus, dialogs, tabs, accordions, toasts, list add/remove, hover/press feedback, simple
in-view reveals, layout changes. **Not** for multi-element pinned/scrubbed timelines → GSAP.

## Setup

```bash
npm i motion        # import from "motion/react"
```
```tsx
"use client";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "motion/react";
```
Older code importing `framer-motion` works the same; don't install both.

## Workflow

1. **Take the storyboard** (CLAUDE.md Motion standard) — each Motion animation must map to a line in it (Primary / Secondary / Ambient).
2. **Define shared tokens once** (`lib/motion.ts`):
   ```ts
   export const ease = { out: [0.16, 1, 0.3, 1], inOut: [0.65, 0, 0.35, 1] } as const;
   export const dur = { micro: 0.18, ui: 0.32, reveal: 0.6, hero: 1.1 };
   export const reveal = {
     hidden: { opacity: 0, y: 24 },
     show: { opacity: 1, y: 0, transition: { duration: dur.reveal, ease: ease.out } },
   };
   ```
3. **Wrap the app once** so every animation respects the OS setting:
   ```tsx
   <MotionConfig reducedMotion="user" transition={{ ease: ease.out }}>{children}</MotionConfig>
   ```
   `reducedMotion="user"` disables transform/layout animations but keeps opacity — check that what remains still makes sense.
4. **Client leaf components only**: `components/motion/Reveal.tsx` with `'use client'`, used from Server Component sections.
5. **Reveals that don't hide content without JS**: render final state in SSR and only animate after hydration:
   ```tsx
   "use client";
   export function Reveal({ children }: { children: React.ReactNode }) {
     return (
       <motion.div initial={false /* SSR = final state */} whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={reveal}>
         {children}
       </motion.div>
     );
   }
   ```
   `initial={false}` means no entrance at all; if you want the entrance, use `initial="hidden"` **and** add a `<noscript><style>[data-reveal]{opacity:1!important;transform:none!important}</style></noscript>` in the layout, then verify with the QA script's no-JS pass.
6. **Exit animations**: `AnimatePresence` must wrap the conditional, children need a stable `key`.
   ```tsx
   <AnimatePresence>{open && <motion.nav key="menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} />}</AnimatePresence>
   ```
7. **Stagger** with parent variants: `show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }`.
8. **Layout transitions**: `layout` prop for size/position changes, `layoutId` for shared elements (tab underline). Keep layout-animated subtrees small.
9. **Scroll-linked (light)**: `const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] }); const y = useTransform(scrollYProgress, [0, 1], [40, -40]);` — transform only, disable when `useReducedMotion()` is true.
10. **Bundle**: wrap the app in `LazyMotion` with **async** features and use `m.*` everywhere:
    ```tsx
    // motion-features.ts
    import { domMax } from "motion/react"; export default domMax;   // domAnimation if no layout animations
    // MotionProvider.tsx
    const load = () => import("./motion-features").then((m) => m.default);
    <LazyMotion features={load} strict><MotionConfig reducedMotion="user">{children}</MotionConfig></LazyMotion>
    ```
    On skill-atelier, this plus lazy-loading GSAP took mobile Lighthouse TBT from 260–420ms to 110–160ms. `strict` throws if a full `motion.*` component slips in.

## Best practices

- Animate `opacity`, `x`, `y`, `scale`, `rotate`, `clipPath` — never `width/height/top/left` (use `layout` if size must change).
- Hover effects with `whileHover` only matter on hover devices; give keyboard users the same via `whileFocus` or CSS `:focus-visible`.
- `whileTap={{ scale: 0.97 }}` for press feedback on buttons — ambient, ≤150ms.
- Don't animate on every section; one orchestrated hero + consistent secondary reveals.

## Common failure modes

- Content at `opacity: 0` in SSR HTML → invisible without JS, delayed LCP, SEO crawl of blank sections.
- `'use client'` on whole page → large hydration cost; move it to leaves.
- Missing `key` in AnimatePresence → no exit animation.
- Hero entrance that blocks CTA clicks (overlay with pointer-events) — CTA must be usable at t=0.
- Re-creating variants objects inside render → unnecessary work; define at module scope.

## Verification

- QA script passes (`reduced-motion` and `no-js` checks find no invisible content).
- Screenshot mid-entrance (`page.waitForTimeout(300)`) and settled to confirm the storyboard.
- Performance trace: no long tasks > 50ms from animation init; CLS unchanged (transforms don't shift layout).

## Completion criteria

Every Motion animation maps to the storyboard, respects reduced motion, never hides SSR content, and lives in a client leaf component.
