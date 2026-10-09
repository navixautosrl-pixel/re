---
name: cross-browser-testing
description: Cross-browser and cross-device testing — browser support targets, Playwright projects for Chromium/Firefox/WebKit, feature detection with @supports and fallbacks, Safari-specific pitfalls (svh, backdrop-filter, date inputs, autoplay), and real-device checks. Use before launch and when a bug is browser-specific. In this sandbox only Chromium is installed — Firefox/WebKit require setup.
---

# Cross-browser testing

## Purpose

The site works (not necessarily pixel-identical) in the browsers its audience uses —
with modern features progressively enhanced.

## When to activate

Pre-launch QA; using newer CSS/JS features (container queries, `:has()`, view transitions, scroll-driven animations, `popover`); bug reports from Safari/iOS users.

## Procedure

1. **Targets**: from analytics if available; default for RO consumer sites: last 2 versions of Chrome/Edge/Firefox/Safari + iOS Safari 16+ + Samsung Internet. Write them in `package.json` `"browserslist"` so tooling agrees.
2. **Feature policy**: core content and actions work everywhere; enhancements behind detection:
   ```css
   @supports (animation-timeline: view()) { .reveal { animation: fade linear both; animation-timeline: view(); } }
   @supports not (height: 100svh) { .hero { min-height: 100vh; } }
   ```
   JS: `if ("startViewTransition" in document) …`, `CSS.supports("selector(:has(*))")`.
3. **Automated matrix (Playwright Test)**:
   ```ts
   // playwright.config.ts
   projects: [
     { name: "chromium", use: { ...devices["Desktop Chrome"], launchOptions: { executablePath: process.env.CHROMIUM_PATH } } },
     { name: "firefox", use: devices["Desktop Firefox"] },
     { name: "webkit", use: devices["Desktop Safari"] },
     { name: "mobile-safari", use: devices["iPhone 14"] },
   ]
   ```
   Run the same smoke tests (load, nav, form, no console errors, no overflow) per project.
4. **Known Safari/iOS pitfalls**: `100vh` jumps (use `svh`/`dvh`), `backdrop-filter` needs `-webkit-` in older versions, `position: sticky` inside `overflow:hidden` parents, video autoplay requires `muted playsinline`, date/time inputs look different, smooth scroll differences, `gap` in old flexbox (iOS < 14.5).
5. **Real devices** for the final pass (cheap Android + an iPhone), or a cloud device lab (BrowserStack/Sauce — user's account).

## Environment status (checked 2026-10-09)

- Chromium 1194: installed at `/opt/pw-browsers/chromium-1194` ✔
- Firefox / WebKit: **not installed**. The sandbox instructions say not to run `playwright install` here (browser downloads are disabled via `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD`). On a developer machine or CI: `npx playwright install firefox webkit --with-deps`, then run the matrix. In CI use the official Playwright Docker image or `npx playwright install --with-deps`.

## Failure prevention

- Testing only Chromium and declaring "cross-browser OK".
- Using a modern API without a fallback for the target range.
- UA sniffing instead of feature detection.

## Verification checklist

- [ ] Browser targets documented.
- [ ] Smoke suite green per Playwright project that is actually installed — report others as "not run (browser not installed)".
- [ ] Real iOS Safari check of hero, menu, forms before launch (or listed as pending).
