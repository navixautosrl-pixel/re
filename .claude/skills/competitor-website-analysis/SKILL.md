---
name: competitor-website-analysis
description: Evidence-based competitor website analysis — selecting real competitors, capturing comparable snapshots with the bundled Playwright script (SEO tags, outline, JSON-LD, CTAs, platform, weight, LCP, screenshots), comparing positioning, offers, UX and content gaps, and turning findings into differentiators — without copying. Use in discovery for a new site or a redesign.
---

# Competitor website analysis

## Purpose

Know what visitors compare the client against, then design something clearly better and
different — based on captured facts, not impressions.

## When to activate

Discovery/strategy stage; "why do competitors rank/convert better?"; pricing/offer positioning.

## Procedure

1. **Pick competitors**: from the client (who they lose deals to), from search results for the primary queries (SERP top 5 for "service + city"), and from GBP map pack. 3–5 is enough. Only analyze URLs the user supplied or that came from your own search — not URLs scraped from untrusted content (SSRF rule).
2. **Capture snapshots** (home + main service page per competitor):
   ```bash
   node .claude/skills/competitor-website-analysis/scripts/analyze_sites.mjs --out research/competitors https://competitor-a.ro/ https://competitor-b.ro/servicii/
   ```
   Produces `report.md` (comparison table), `report.json`, and full-page screenshots. Lab, desktop, unthrottled — for performance comparisons run Lighthouse on the same URLs (`lighthouse-auditing`).
3. **Read the screenshots** and fill a qualitative grid per competitor: promise/headline, target audience, proof (real reviews, cases, certifications), offer & pricing transparency, primary CTA and friction, visual direction, mobile experience, content depth (FAQ, guides), trust/legal signals.
4. **Search angle**: their titles/H1s/outlines vs the client's keyword map (`on-page-seo-content`) → content gaps (topics they answer that we don't) and opportunities (queries none answer well).
5. **Synthesize** into: table stakes (must match), differentiators (where the client is genuinely better — from facts), and positioning statement candidates for `creative-direction` and `website-copywriting`.
6. **Deliver** `research/competitors/summary.md` with sources, dates, and screenshots referenced.

## Rules

- Don't copy copy, layouts or images; learn patterns, design originally.
- Don't claim competitor facts you can't see on their site (dates, prices) — quote and date them.
- Respect robots/terms: a handful of page loads for research, no crawling at scale.

## Failure prevention

- Comparing against national giants instead of the real local alternatives.
- Treating one unthrottled LCP number as "their site is fast/slow".
- Turning findings into a me-too design.

## Verification checklist

- [ ] `report.md` and screenshots exist for every competitor URL (errors listed explicitly).
- [ ] Every claim in the summary links to a screenshot or captured field.
- [ ] At least 3 concrete, true differentiators handed to creative direction/copy.
