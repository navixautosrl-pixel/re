---
name: lighthouse-auditing
description: Running and interpreting Lighthouse correctly — bundled runner (lh_runs.mjs) for repeated mobile/desktop runs with medians, CHROME_PATH setup, simulated vs devtools throttling, observed vs simulated LCP, reading insights (LCP breakdown, CLS culprits, render-blocking, unused JS), and reporting lab data honestly. Use whenever performance/a11y/SEO scores are measured or quoted.
---

# Lighthouse auditing

## Purpose

Numbers you can defend: repeated, labelled lab runs whose findings point at concrete
fixes — never a single lucky score, never presented as real-user data.

## When to activate

Performance stage, quality gate, before/after any perf fix, when a user asks "what's the score?".

## Run it (verified in this sandbox)

```bash
node .claude/skills/lighthouse-auditing/scripts/lh_runs.mjs http://localhost:4173/ --runs 3 --form mobile,desktop --out qa-report/lighthouse
node .claude/skills/lighthouse-auditing/scripts/lh_runs.mjs http://localhost:4173/ --runs 2 --form mobile --devtools   # real applied throttling
```
The runner sets `CHROME_PATH` (Lighthouse 13 **ignores** `--chrome-path`), runs `npx lighthouse@13`, reports the median, the score range, observed vs simulated LCP, and failing audits — and prints a NOTE when simulated LCP is far above observed (Lantern artifact against fast local servers).

Serve the **production build** (`npx serve@14 out -l 4173`, or `next start`), never `next dev`.

## Interpreting

| Signal | Action |
|---|---|
| `lcp-breakdown-insight`: large *element render delay* | LCP element waits on JS/CSS/font → inline critical CSS, preload font/image, remove render-blocking JS |
| *resource load delay/duration* on an image | `fetchpriority="high"`, correct size, AVIF (`image-optimization`) |
| `cls-culprits-insight` / `layout-shifts` | font swap (use `next/font`, metric fallback), images without dimensions, late-injected banners |
| TBT high / `bootup-time` | lazy-load heavy libraries (GSAP/Motion features/3D), split client components (`reduced-motion-accessibility`, `vercel-react-best-practices`) |
| `unused-javascript` | dynamic import, remove dependencies, check barrel imports |
| `cache-insight` against a local server | dev-server artifact — real caching is set in `production-deployment` |
| SEO `is-crawlable` failing | intentional `noindex` on demos/staging? Prove by building once with indexing on |

## Reporting template

```
Lighthouse 13 (lab), <date>, <url>, production build, N runs each, median:
mobile  (simulated): Perf 96 [96–96] · A11y 100 · BP 100 · SEO 66* — LCP 2.61s (observed 0.11s) · CLS 0 · TBT 97ms
mobile  (devtools):  … ; desktop: …
*SEO 66 = intentional noindex (100 with indexing enabled).
Not measured: field data (CrUX/RUM) — site not deployed / no traffic.
```

## Failure prevention

- One run quoted as "the score" (variance is ±5 points).
- Comparing runs from different machines/throttling modes.
- Chasing 100 on a metric that doesn't affect users while LCP on real phones is bad.
- Treating lab TBT as INP (it's a proxy).

## Verification checklist

- [ ] ≥ 2 runs per form factor, medians reported with mode labels.
- [ ] Every failing audit either fixed (with re-run evidence) or explained.
- [ ] Field data status stated explicitly (`web-vitals-monitoring` for RUM).
