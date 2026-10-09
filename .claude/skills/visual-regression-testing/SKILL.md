---
name: visual-regression-testing
description: Screenshot-based visual regression testing with Playwright Test toHaveScreenshot — config for static exports, stable snapshots (fonts ready, reduced motion, masked dynamic content), per-project baselines, thresholds, updating baselines deliberately, and CI usage. Use to protect a finished design from accidental CSS/layout changes. Proven on skill-atelier (catches a 1px letter-spacing change).
---

# Visual regression testing

## Purpose

Catch unintended visual changes (spacing, wraps, colors, broken components) automatically,
with low noise.

## When to activate

After a design is approved; before refactors/dependency upgrades; in CI for sites that keep evolving.

## Setup (working reference: `skill-atelier/playwright.config.ts`, `skill-atelier/tests/visual/pages.spec.ts`)

```bash
npm i -D -E @playwright/test@<same version as the repo's playwright>   # 1.64.0 here
```
```ts
// playwright.config.ts (key parts)
export default defineConfig({
  testDir: "tests/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide" } },
  use: { baseURL: "http://127.0.0.1:4199/", launchOptions: { executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" } },
  webServer: { command: "npx --yes serve@14 out -l 4199 --no-clipboard", port: 4199, reuseExistingServer: true },
  projects: [{ name: "desktop", use: { viewport: { width: 1440, height: 900 } } }, { name: "mobile", use: devices["Pixel 7"] }],
});
```

## Writing stable tests

1. Test the **production build** served like production (subpath via `BASE_PATH` if needed).
2. Freeze motion: `page.emulateMedia({ reducedMotion: "reduce" })` + `animations: "disabled"`.
3. Wait for fonts: `await page.evaluate(() => document.fonts.ready)`.
4. Mask dynamic content: `toHaveScreenshot({ mask: [page.locator(".clock"), page.locator("iframe")] })`; stub dates (`page.clock.setFixedTime`) and network data (`page.route`).
5. Prefer **component/section screenshots** (`locator.toHaveScreenshot()`) over full pages — smaller diffs, clearer failures; plus one above-the-fold page shot per key page.
6. Capture meaningful states too (filtered list, open menu, form errors).
7. Name snapshots explicitly (`"tools-motion.png"`).

## Workflow

- Create/update baselines **only intentionally**: `npx playwright test --update-snapshots` after a reviewed design change; commit the PNGs with the change.
- On failure, open `test-results/**/` (`*-expected.png`, `*-actual.png`, `*-diff.png`) and decide: bug → fix; intended → update baseline.
- **Baselines are OS/browser specific**: generate them in the same environment that runs them (CI container or this sandbox's Chromium 1194). Don't mix baselines from macOS and Linux.

## Failure prevention

- Thresholds so loose they miss real regressions, or so tight antialiasing flakes fail daily (start at 0.2% of pixels).
- Screenshots during animations or before web fonts load.
- Updating baselines to "make CI green" without looking.

## Verification checklist

- [ ] Fresh baseline run passes twice in a row (stability).
- [ ] A deliberate small CSS change makes the relevant test fail (proved on skill-atelier: 3,420 px diff from 1px letter-spacing), then restore → pass.
- [ ] `test-results/` and `playwright-report/` git-ignored; `__screenshots__/` committed.
