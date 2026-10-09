---
name: website-migration
description: Migrating a website (redesign, platform change, domain/HTTPS/structure change) and its content without losing traffic — crawl and inventory, URL mapping, 301 redirect plans, content migration and cleanup, parity checks for metadata/schema/analytics, launch-day checklist, and post-launch monitoring. Use for any redesign that changes URLs, CMS, or domain.
---

# Website & content migration

## Purpose

Change the site without throwing away what it already earned in search, analytics and
user habits — and prove it with before/after evidence.

## When to activate

Redesigns, WordPress → Next.js (or reverse), new domain, http→https, merging sites, URL structure changes, content moves between CMSes.

## Procedure

1. **Baseline (before touching anything)**:
   - Crawl the old site: every URL with status, title, meta description, H1, canonical, indexability, word count, inbound internal links. (Playwright crawler from sitemap + link following, or Screaming Frog if the user has it.)
   - Export GSC top pages/queries (last 12 months) and GA4 landing pages; note backlinked URLs if a backlink tool is available.
   - Save `baseline/urls.csv` in the project.
2. **Content inventory & decisions** per URL: keep / merge / rewrite / drop (410) — with reason. Never drop pages with traffic or backlinks without a redirect target.
3. **URL map** `old → new` (1:1 where possible; most relevant equivalent otherwise; homepage only as last resort):
   ```csv
   old,new,type
   /servicii/polish.html,/servicii/polish-auto/,301
   /blog/?p=123,/blog/ceramica-vs-ceara/,301
   /promo-2023/,,410
   ```
4. **Redirect implementation** (match the host): Apache `.htaccess` (`Redirect 301 /old /new` or RewriteRule), Nginx `return 301`, Vercel `redirects` in `vercel.json` (not `next.config` with static export), WordPress Redirection plugin. One hop only — no chains; preserve query strings where meaningful.
5. **Content migration**: scripted export/import (WP REST API / CSV / CMS import tools); clean HTML (no inline styles, fix headings), migrate images with alt text, re-link internal links to new URLs (not via redirects).
6. **Parity checks on staging** (noindex, password or IP-limited):
   - Titles/descriptions/H1 per mapped URL, canonical, hreflang, JSON-LD, analytics tags + consent, forms work, 404 page.
7. **Launch**: deploy; apply redirects; remove staging noindex/robots blocks on production; update sitemap; submit in GSC; for domain moves use GSC **Change of Address**; update GBP/social links.
8. **Post-launch**: crawl the old URL list → every one returns 301 → 200 at the mapped target (or intended 410); monitor GSC indexing + 404s, GA4 landing pages, rankings for top queries for 4–8 weeks; fix stragglers.

## Failure prevention

- Redirecting everything to the homepage (treated as soft 404).
- Launch with `noindex`/`Disallow: /` copied from staging.
- Losing UTM/analytics on new templates; forms silently broken.
- Redirect chains from old migrations stacked on new ones.

## Verification checklist

- [ ] Script: for each `old` in the map, fetch with redirects disabled → status 301/308/410 as planned and `Location` = `new`; then `new` → 200. (Attach the result table.)
- [ ] 0 internal links pointing to redirected URLs (crawl the new site).
- [ ] Metadata parity report for top 20 traffic pages.
- [ ] GSC check scheduled at +1, +2, +4 weeks.

## External dependencies

Old site access (crawlable URL or export), GSC/GA4 access, DNS/hosting access for redirects.
