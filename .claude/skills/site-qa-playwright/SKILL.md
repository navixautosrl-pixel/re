---
name: site-qa-playwright
description: Automated real-browser QA for marketing/static websites using the bundled Playwright script — serves a static export (optionally under a subpath), loads every page at 6 widths from 320 to 1920px, and reports horizontal overflow, console/page errors, failed/4xx requests, broken internal links and anchors, missing SEO tags, h1/heading issues, images without alt or dimensions, unlabeled controls, small touch targets, keyboard focus visibility, axe WCAG violations (when installed), and content left invisible under reduced motion or with JavaScript disabled. Use after every significant change to a site and before calling it done. For apps with login/CRUD, use browser-qa.
---

# Site QA with Playwright

## Purpose

Replace "looks fine to me" with a repeatable, evidence-producing browser pass.

## When to activate

After implementing or changing a page; before the `site-quality-gate`; after a deploy (against the live URL).

## Prerequisites (verified in this repo)

- `npm install` at the repo root → provides `playwright` (via the pinned `@playwright/mcp`).
- Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (override with `CHROMIUM_PATH`). Never run `playwright install` here.
- Optional, recommended: `npm i -D @axe-core/playwright` in the site project → enables the WCAG scan.

## Run

```bash
# static export, served exactly as it will be deployed
node .claude/skills/site-qa-playwright/scripts/site_qa.mjs --dir <site>/out --base-path /demo/sub --pages /,/contact/ --out <site>/qa-report

# running server (next start / live URL)
node .claude/skills/site-qa-playwright/scripts/site_qa.mjs --url http://localhost:3000 --pages /,/pricing

# custom widths
... --widths 320,375,768,1024,1440,1920
```

Output: `report.json` + full-page screenshots per page × width + `-reduced-motion.png` + `-no-js.png`. Exit code 1 if any critical finding.

## Workflow

1. Build production output first (`npm run build`) — QA the artifact, not `dev`.
2. Run the script with all real pages. Read **every** critical and warning.
3. **Look at the screenshots** (Read tool on the PNGs) at 375, 768 and 1440 at minimum. The script can't judge hierarchy, spacing, awkward wraps, or ugliness — you must.
4. Interaction checks the script doesn't do (write a small one-off Playwright script when needed):
   - open/close the mobile menu with mouse and keyboard; Escape closes it; focus returns to the toggle
   - every form: empty submit shows errors linked via `aria-describedby`; valid submit reaches its success state (mock the endpoint if it's external)
   - accordion/tabs operable with keyboard
   - primary CTA clickable during the hero animation (click at t≈200ms)
5. Fix → rebuild → re-run until 0 critical. Remaining warnings: fix, or list with a reason.
6. Paste the summary lines (not a paraphrase) into the delivery report.

## What each check catches

| Check | Real bug it has caught |
|---|---|
| overflow at 320px | decorative elements / `100vw` / un-shrinkable grid columns |
| failed requests under `--base-path` | unprefixed `next/image` preload and icon URLs (CLAUDE.md gotcha) |
| reduced-motion invisible content | reveal animations that never fire when motion is reduced |
| no-JS invisible content | SSR HTML shipped at `opacity:0` waiting for a script |
| focus without outline | `outline: none` resets with no `:focus-visible` replacement |

## Limits (be honest in reports)

- Static heuristics, not a full WCAG audit — screen reader testing remains manual.
- No Lighthouse: run it separately (`web-performance` / `core-web-vitals`): `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx lighthouse@13 <url> --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=lh.json`. Lighthouse 13 ignores `--chrome-path`, so the `CHROME_PATH` env var is required here.
- It doesn't test site-specific interactions (filters, menus, scroll set pieces). Write a per-site `tests/interactions.mjs`, see `skill-atelier/tests/interactions.mjs`. That suite caught 3 real bugs the generic pass couldn't: a dashed scroll wire, a menu that shifted its own anchor target, and stale ScrollTrigger positions after content expanded.
- External links aren't fetched (avoid hammering third parties); spot-check them manually.

## Security

The script only reads pages. Don't point it at URLs taken from untrusted content (SSRF rule in CLAUDE.md).

## Completion criteria

Exit 0 on the production build served at its real path, screenshots reviewed, interaction checks done, results quoted verbatim in the delivery report.
