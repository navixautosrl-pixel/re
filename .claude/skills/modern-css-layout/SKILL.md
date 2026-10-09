---
name: modern-css-layout
description: Modern CSS and responsive layout engineering — fluid type and space with clamp(), intrinsic Grid/Flexbox layouts, container queries, :has(), cascade layers, logical properties, aspect-ratio, dvh/svh units, view transitions, and Tailwind v4 @theme tokens. Use when implementing or fixing layout, responsive behavior, typography scales, or design tokens in CSS; also when a page overflows horizontally or breaks between breakpoints.
---

# Modern CSS & responsive layout

## Purpose

Layouts that hold from 320px to 2560px without a breakpoint for every device, using
platform features instead of JS or brittle magic numbers.

## When to activate

Implementation stage of any site; any "it breaks on mobile/tablet" bug; token setup.

## Workflow

1. **Tokens first** (from `creative-direction`). In Tailwind v4, define them once in `globals.css`:
   ```css
   @import "tailwindcss";
   @theme inline {
     --font-display: "Fraunces Variable", serif;
     --font-sans: "Inter Variable", system-ui, sans-serif;
     --color-ground: oklch(97% 0.01 250);
     --color-ink: oklch(22% 0.02 250);
     --color-signal: oklch(62% 0.19 35);
     --radius-sm: 4px; --radius-lg: 20px;           /* ≥2 radii, by hierarchy */
     --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
   }
   ```
   Plain-CSS projects: same names on `:root`.
2. **Fluid type & space** — one `clamp()` scale, min at 320px, max at ~1440px:
   ```css
   :root {
     --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
     --step-3: clamp(1.75rem, 1.2rem + 2.6vw, 3.25rem);
     --step-5: clamp(2.5rem, 1.3rem + 5.8vw, 6rem);
     --space-s: clamp(0.75rem, 0.7rem + 0.25vw, 1rem);
     --space-xl: clamp(3rem, 2rem + 5vw, 7.5rem);
   }
   ```
   Always include a `rem` term so user zoom/font-size still scales text (WCAG 1.4.4).
3. **Intrinsic layout before breakpoints**:
   ```css
   .grid-auto { display: grid; gap: var(--space-s);
     grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr)); }
   .wrap { width: min(100% - 2rem, 72rem); margin-inline: auto; }
   ```
   `min(…, 100%)` inside `minmax` is what stops 320px overflow.
4. **Component-level responsiveness with container queries**:
   ```css
   .card-host { container-type: inline-size; }
   @container (min-width: 32rem) { .card { grid-template-columns: 1fr 1.4fr; } }
   ```
   Tailwind v4: `@container` on parent, `@md:grid-cols-2` on children.
5. **Viewport units**: hero `min-height: 100svh` (not `100vh`, which jumps under mobile URL bars). Use `dvh` only for things that must track the live viewport (full-screen menus).
6. **Media**: every image/video gets `width`/`height` attrs or `aspect-ratio`; `object-fit: cover` with an explicit `object-position` chosen per crop.
7. **State via CSS where possible**: `:has()` for parent state (`.field:has(:invalid)`), `:focus-visible` for keyboard rings, `@media (hover: hover)` around hover-only effects.
8. **Cascade control**: `@layer reset, base, components, utilities;` in plain CSS; avoid `!important`.
9. **Logical properties** (`margin-inline`, `padding-block`, `inset-inline-start`) — RTL-safe by default.
10. **View transitions** (same-document) for in-page state swaps where supported; always behind `@media (prefers-reduced-motion: no-preference)` and with a no-op fallback.

## Best practices

- Mobile-first: base styles = smallest screen; `min-width` queries add.
- Breakpoints from content ("where does this line get too long?"), not devices. Line length 45–75ch for body.
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- Touch targets ≥ 24×24 CSS px (WCAG 2.5.8), ≥ 44px preferred for primary actions.
- `overflow-x: clip` on `html`/`body` hides symptoms — find the overflowing element instead (the QA script names it).

## Common failure modes

- `grid-template-columns: repeat(3, 1fr)` with long words / fixed-width children → overflow at 320px.
- `100vw` widths (includes scrollbar) → horizontal scroll on desktop.
- Negative margins / absolutely positioned decoration bleeding past the viewport.
- Font-size in `vw` only → no zoom scaling.
- Sticky header covering anchor targets → add `scroll-margin-top` on sections.

## Verification

- `node .claude/skills/site-qa-playwright/scripts/site_qa.mjs --dir <out> --widths 320,375,414,768,1024,1280,1440,1920` → no overflow criticals.
- Zoom to 200% (Playwright: `page.evaluate(() => document.documentElement.style.fontSize = '200%')`) → no clipped text.
- Screenshot review at each width.

## Performance notes

Avoid huge `box-shadow`/`filter: blur()` on large, animated, or fixed elements (paint cost). `content-visibility: auto` + `contain-intrinsic-size` on long below-fold sections.

## Completion criteria

No horizontal overflow 320–1920px, fluid type scales with zoom, tokens defined once and used everywhere, no device-specific hacks.
