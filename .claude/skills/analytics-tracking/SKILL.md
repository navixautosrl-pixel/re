---
name: analytics-tracking
description: Consent-aware analytics and conversion tracking — measurement plan, GA4 (gtag.js or Google Tag Manager), Google Consent Mode v2 with a real consent banner, event naming for leads/CTA/e-commerce, UTM conventions, Search Console verification, privacy-friendly alternatives (Plausible/Umami), and verifying that events actually fire. Use when a site needs analytics, conversion tracking, or marketing tags. Only with user-provided IDs/accounts; never claims tracking is live without seeing hits.
---

# Analytics & conversion tracking

## Purpose

Measure the actions that matter, lawfully, without slowing the site — and prove it works.

## When to activate

User asks for analytics/GA4/GTM/pixels/conversion tracking, or the CRO measurement plan needs implementing.

## Inputs required from the user

GA4 Measurement ID (`G-XXXXXXX`) or GTM container ID (`GTM-XXXXXXX`), which ad platforms (if any), consent-banner preference, Search Console access. **Without IDs: implement the code path behind an env var, leave it disabled, and say so.**

## Workflow

1. **Measurement plan** (from `conversion-optimization`):
   ```
   | Event | Trigger | Params | Conversion? |
   | generate_lead | contact form success state | form_id, service | yes |
   | click_cta | primary CTA click | cta_label, location | no |
   | click_phone / click_whatsapp | tel:/wa.me link click | location | yes (micro) |
   | view_item / add_to_cart / begin_checkout / purchase | shop (GA4 recommended names) | items, value, currency, transaction_id | purchase=yes |
   ```
   Prefer GA4 *recommended* event names; snake_case; ≤ 40 chars; no PII in params (no emails, phones, names).
2. **Consent first (EU/GDPR + ePrivacy)**: default *denied* before any tag loads:
   ```html
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('consent', 'default', {
       ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
       analytics_storage: 'denied', wait_for_update: 500
     });
   </script>
   ```
   Banner with equal-weight "Accept" / "Refuz" buttons + "Settings", no pre-ticked boxes; on choice: `gtag('consent','update',{analytics_storage:'granted', …})` and persist the choice (cookie/localStorage, 6–12 months). Link to the cookie policy. A Google-certified CMP is required if the client runs Google Ads/remarketing in the EEA.
3. **Load the tag** after the consent default, non-blocking:
   - Next.js: `@next/third-parties/google` `<GoogleAnalytics gaId=… />` or `next/script` with `strategy="afterInteractive"`.
   - Static HTML: `<script async src="https://www.googletagmanager.com/gtag/js?id=G-…">`.
   - CSP: allow `https://www.googletagmanager.com` (script) and `https://*.google-analytics.com`, `https://*.analytics.google.com` (connect).
4. **Fire events from real success points** (form success handler, not button click; purchase from confirmation with `transaction_id` to dedupe):
   ```ts
   export const track = (name: string, params: Record<string, string | number> = {}) =>
     typeof window !== "undefined" && (window as any).gtag?.("event", name, params);
   ```
5. **UTMs**: lowercase, `utm_source` (google, facebook, newsletter), `utm_medium` (cpc, social, email), `utm_campaign` (spring-2026-detailing). Document them for the client.
6. **Search Console**: verify via DNS TXT (preferred) or HTML meta tag supplied by the user; submit `sitemap.xml`.
7. **Privacy-friendly alternative**: Plausible/Umami (cookieless) may not need a consent banner for analytics alone — confirm with the client's legal advisor; we don't give legal sign-off.

## Verification (required)

- Playwright: load page with consent denied → assert **no** request to `google-analytics.com/g/collect` (or that it's a cookieless ping with `gcs=G100`); accept → assert `collect` requests carrying `en=page_view`; trigger the form success → `en=generate_lead`.
- GA4 DebugView / Realtime with the user's account if they share access; otherwise state "verified in network log only".
- Lighthouse: tag load doesn't add long tasks before LCP.

## Never

Load trackers before consent where consent is required; send PII; claim "tracking is live" without seeing hits; invent dashboards or numbers.

## Completion criteria

Measurement plan implemented, consent default-denied with working banner, events verified in network requests for denied/granted paths, IDs supplied by the user (or code path disabled and disclosed).
