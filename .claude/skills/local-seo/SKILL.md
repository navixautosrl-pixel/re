---
name: local-seo
description: Local SEO for businesses serving a city or region (Romania-focused) — Google Business Profile optimization, NAP consistency, LocalBusiness subtype schema, location and service-area pages without doorway spam, local citations (RO directories), review acquisition within platform rules, and local rank/insights reporting. Use for any business with a physical location or service area.
---

# Local SEO

## Purpose

Show up in the map pack and local organic results for "service + city" — honestly,
with consistent business data everywhere.

## When to activate

Car detailing, clinics, salons, padel clubs, contractors, restaurants, any "near me" business; multi-location brands.

## Procedure

1. **Facts inventory (from the client, never invented)**: legal + trading name, address, phone, hours (incl. holidays), service area, categories, services with prices, photos, booking link, CUI.
2. **Google Business Profile** (client owns it; we advise or get manager access):
   - Primary category = the most specific true category ("Car detailing service"), 2–4 secondary.
   - Description: what/where/for whom, no keyword stuffing, no URLs.
   - Services & products with prices; attributes; booking/website link with UTM (`?utm_source=google&utm_medium=organic&utm_campaign=gbp`).
   - Real photos regularly (exterior for wayfinding, interior, team, work).
   - Posts for offers/news; Q&A seeded with real FAQs.
3. **NAP consistency**: one canonical format, used identically in the site footer, contact page, JSON-LD, GBP, Facebook, directories. Phone in `tel:` links with country code.
4. **Website**:
   - Contact page with embedded map (lazy-loaded facade), directions, parking/landmarks, hours.
   - **LocalBusiness subtype** JSON-LD (`AutoWash`, `SportsActivityLocation`, `Dentist`…) with address, geo (from the real pin), openingHoursSpecification, telephone, url, sameAs (real profiles) — validate with `structured-data`.
   - Title/H1 include service + city naturally ("Detailing auto în Brașov").
5. **Location pages**: one page per **real** location (address, staff, photos, directions, local proof). Service-area pages only when there is genuinely local content (projects done there, local specifics). Never city-name swaps of the same text (doorway pages — spam policy).
6. **Citations (RO)**: consistent listings on relevant directories/platforms (e.g. Facebook, Apple Business Connect, Bing Places, industry directories, local chamber/business listings). Quality > quantity.
7. **Reviews**: ask every real customer (QR code, follow-up message with the GBP review link). Respond to all reviews. **Never** incentivize, gate (ask only happy customers), or write reviews; don't mark up Google reviews as your own schema `aggregateRating` (self-serving).
8. **Measure**: GBP Insights (calls, direction requests, website clicks), GSC queries containing city names, UTM-tagged GBP traffic in GA4.

## Failure prevention

- Different phone numbers/addresses across platforms.
- Virtual office / P.O. box as GBP address (suspension risk).
- Keyword-stuffed business name in GBP ("Detailing Brașov Cel Mai Bun") — violates guidelines.
- 30 thin city pages.

## Verification checklist

- [ ] NAP string identical across site (grep the build), JSON-LD and GBP (owner screenshot).
- [ ] JSON-LD validator 0 errors; geo coordinates match the map pin.
- [ ] Each location page has unique local content (diff two pages: < 30% shared body text).
- [ ] UTM on GBP link visible in GA4 acquisition after launch.

## External dependencies

GBP owner/manager access, directory accounts, real photos and review links from the client.
