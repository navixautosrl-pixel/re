---
name: site-quality-gate
description: Final evidence-based quality gate for a website before delivery — runs the automated checks (build, site_qa.mjs, JSON-LD validator, Lighthouse), reviews screenshots, then scores the 100-point rubric (visual 20, UX/responsive/a11y 15, motion 15, technical SEO 15, performance 10, code 10, copy/CRO 10, security 5) and the CLAUDE.md 11-dimension rubric, with a deduction and evidence for every point lost. Use as the last step before telling the user a site is done, or when asked to audit/score a site.
---

# Site quality gate

## Purpose

A score you can defend. Every number comes from something you ran or looked at;
anything unmeasured is marked "not measured", never guessed upward.

## When to activate

Stage 13 of `site-builder`; "audit/score/review this website"; before any deploy.

## Step 1 — Collect evidence (run, don't recall)

```bash
cd <site> && npm run build 2>&1 | tail -20
node ../.claude/skills/site-qa-playwright/scripts/site_qa.mjs --dir out [--base-path /sub] --pages <all> --out qa-report
node ../.claude/skills/structured-data/scripts/validate_jsonld.mjs out
# Lighthouse (lab, mobile emulation is the default):
CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx lighthouse@13 http://127.0.0.1:<port>/ \
  --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=qa-report/lh-mobile.json --quiet
# Lighthouse 13 ignores --chrome-path; CHROME_PATH env is what works. Run mobile 2–3× (scores vary run to run).
```
(Serve `out/` first, e.g. `npx serve out -l <port>` or the QA script's server.) Then **Read** the screenshots at 375, 768, 1440, reduced-motion and no-JS.

For a deeper review use `web-quality-audit` (category-by-category) and `accessibility` (manual checks).

## Step 2 — 100-point score

| Area | Pts | Full marks require | Typical deductions |
|---|---|---|---|
| Visual design & differentiation | 20 | creative-direction critique passes; no CLAUDE.md "never" patterns; clear hierarchy at every width | −3 per generic pattern; −5 if it could be any brand |
| UX, responsive, accessibility | 15 | QA exit 0; keyboard path complete; axe 0 serious/critical; touch targets ok | −3 per critical a11y issue; −2 per broken breakpoint |
| Motion & interaction | 15 | storyboard implemented; reduced-motion & no-JS content visible; CTA usable during hero; no jank | −5 if content hidden w/o JS; −3 per gratuitous effect |
| Technical SEO | 15 | unique title/desc/canonical/OG per page; sitemap+robots; JSON-LD valid & truthful; 1 h1; no broken links | −2 per missing element per page type |
| Performance | 10 | Lighthouse mobile lab LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 200ms (INP proxy) | −2 per metric out of range; "not measured" = 0/10 |
| Code quality & architecture | 10 | builds clean; Server/Client boundary right; tokens not hard-coded; no dead code | −2 per issue class |
| Copy & conversion | 10 | job sheet met; one dominant CTA; no invented facts; placeholders tagged | −5 per fabricated claim (and fix it) |
| Security & maintainability | 5 | no secrets; safe JSON-LD/HTML injection; deps reasonable; headers documented | −2 per issue |

Target ≥ 90. **Do not adjust weights or evidence to hit the target.** Under 90 → fix and re-run, or deliver with the score and the reasons.

## Step 3 — CLAUDE.md rubric

Score each of the 11 dimensions /10 (Visual Design, Motion, UX, Responsive, Accessibility, SEO, Performance, Code Quality, Security, Conversion, Overall Polish). Anything < 8 is fixed before delivery (CLAUDE.md rule), not "noted for later".

## Step 4 — Report

```
## Quality gate — <site> @ <commit>
Evidence: build ✓ | QA: 0 critical / N warnings | JSON-LD: 0 errors | Lighthouse mobile: P xx A xx BP xx SEO xx, LCP x.xs CLS 0.0x TBT xxms
Score: NN/100
- Visual 18/20 — −2: pricing cards share one radius/shadow (screenshot pricing-1440.png)
- …
Not measured: field CWV (no real traffic), screen reader (manual, not run)
CLAUDE.md rubric: Visual 9, Motion 8, …
```

## Reading Lighthouse honestly (learned on skill-atelier)

- Against a local server, simulated throttling (Lantern, the default) can report an LCP far later than what was observed. Compare `metrics.observedLargestContentfulPaint` with `observedFirstContentfulPaint`. If they're equal, re-measure with `--throttling-method=devtools` and report both numbers, labelled.
- A noindex demo scores SEO ≈ 66 because of `is-crawlable`. Prove the rest is clean by building once with indexing on, and report it that way rather than hiding the 66.
- Caching findings against `npx serve` reflect the dev server, not the site. Real cache headers come from `production-deployment`.

## Common failure modes

- Scoring from memory of the code instead of the screenshots.
- Treating a Lighthouse lab score as real-user performance (it's lab only — say so).
- Rounding up "almost passes".

## Completion criteria

All evidence commands run with outputs recorded, both rubrics scored with per-deduction reasons, every <8 dimension fixed or explicitly escalated to the user.
