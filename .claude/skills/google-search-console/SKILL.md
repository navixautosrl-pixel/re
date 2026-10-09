---
name: google-search-console
description: Google Search Console for website launches and SEO work — property types and verification (DNS/meta), sitemap submission, URL Inspection, Page indexing reasons, Performance report analysis (queries/pages/CTR/position), Core Web Vitals and HTTPS reports, removals, and the Search Console API. Use at launch, after migrations, and when diagnosing indexing or traffic. Needs the owner's access.
---

# Google Search Console (GSC)

## Purpose

Turn "is Google seeing the site correctly?" into evidence, and find the queries/pages
worth improving — using the client's own GSC data, never estimates presented as data.

## When to activate

Launch, migration, traffic drop, "why isn't page X indexed?", content prioritization.

## Procedure

1. **Property**: prefer a **Domain property** (covers http/https, www/non-www, subdomains) verified by **DNS TXT** at the registrar; URL-prefix + HTML meta tag (`<meta name="google-site-verification" content="…">`) when DNS isn't accessible. Add the developer as a user with the owner's account — never ask for their Google password.
2. **Sitemaps**: submit `https://domain/sitemap.xml`; check "Success" and discovered URL count matches the sitemap.
3. **URL Inspection** for key URLs after launch: "URL is on Google" / "Request indexing"; check the rendered HTML and the **user-declared vs Google-selected canonical**.
4. **Page indexing report** — common reasons and fixes:
   | Reason | Usually means |
   |---|---|
   | Crawled – currently not indexed | thin/duplicate content, weak internal links → improve or consolidate |
   | Discovered – currently not indexed | crawl budget/priority; add internal links, sitemap |
   | Duplicate, Google chose different canonical | inconsistent canonicals, parameter URLs |
   | Excluded by 'noindex' | check it's intentional (staging leftovers!) |
   | Blocked by robots.txt | robots.txt too broad |
   | Page with redirect / Not found (404) | expected after migration if redirects are right; fix internal links |
5. **Performance report**: filter by page → see queries; compare 28 days vs previous; find **striking-distance** queries (avg position 5–20, decent impressions) → improve that page's title/H1/section for them; low CTR at good position → rewrite title/meta.
6. **Experience**: Core Web Vitals report (field data, needs traffic), HTTPS report.
7. **Removals**: temporary hide for urgent leaks; permanent fix = 404/410 or noindex + remove from sitemap.
8. **API** (optional automation): Search Console API (`searchanalytics.query`) with a service account added as a user to the property; export to CSV for reporting.
9. **Bing Webmaster Tools**: import from GSC in one click; submit the sitemap there too.

## Reporting rules

- Separate: implemented changes / GSC observations (with date range) / recommendations.
- No ranking promises; changes take days–weeks to reflect.

## Failure prevention

- Verifying a URL-prefix property for the wrong protocol/host and missing data.
- Leaving `noindex` from staging on production.
- Reading 3 days of data as a trend.

## Verification checklist

- [ ] Property verified (screenshot/confirmation from the owner).
- [ ] Sitemap status Success; indexed count trending toward sitemap count.
- [ ] Key URLs inspected: indexable, correct canonical, mobile rendering OK.

## External dependencies

The site owner's Google account access; a public, deployed site. search.google.com / developers.google.com are not reachable from this sandbox (checked 2026-10-09).
