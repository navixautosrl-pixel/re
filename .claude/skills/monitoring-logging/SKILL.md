---
name: monitoring-logging
description: Production monitoring for websites — uptime and SSL/domain expiry checks, JavaScript error tracking (Sentry or equivalent) with source maps and PII scrubbing, server/serverless logging that is structured and privacy-safe, form/conversion health alerts, and incident runbooks. Use when a site goes live or when "it broke and nobody noticed".
---

# Monitoring & logging

## Purpose

Find out that something broke before the client (or their customers) do — without
logging personal data.

## When to activate

Launch checklist; after an incident; any site with forms, payments, or bookings.

## Procedure

1. **Uptime & certificates**: external monitor (UptimeRobot/Better Stack/Cronitor — client account) on: home, a key landing page, the form endpoint/health route; 1–5 min interval; alerts to email + phone. Also SSL expiry and domain expiry reminders.
2. **Health endpoint** (if there's server code): `GET /api/health` returns 200 + version/commit, checks critical dependencies (DB, email API) cheaply.
3. **Front-end errors** (Sentry example — verified package `@sentry/nextjs` 11.x):
   ```bash
   npx @sentry/wizard@latest -i nextjs   # or manual setup per docs
   ```
   - `sendDefaultPii: false`; scrub emails/phones in `beforeSend`; sample rate for performance traces low (e.g. 0.1).
   - Upload **source maps** in CI with an auth token from the environment (never commit it); don't serve source maps publicly unless intended.
   - Static/plain sites: lightweight `window.addEventListener("error")` + `unhandledrejection` → `sendBeacon` to an endpoint you control.
   - Only after consent if the tool sets cookies/collects identifiers (`gdpr-privacy`).
4. **Structured server logs**: JSON lines `{ ts, level, msg, route, status, durationMs, requestId }`; never log request bodies of forms, tokens, passwords, full IPs (truncate) or emails.
5. **Business-signal alerts**: e.g. "0 form submissions in 72h when usual is 10/day", "payment webhook failures > 0" — catch silent breakage.
6. **Runbook** (in project docs): where alerts go, how to check status, rollback steps (`production-deployment`), who to contact at the host.

## Failure prevention

- Monitoring only the homepage while the form endpoint is down.
- Error tracker flooded by browser-extension noise → filter by `allowUrls` (own domain).
- PII in breadcrumbs/logs (form field values, URLs with emails).
- Alerts to an inbox nobody reads.

## Verification checklist

- [ ] Trigger a test error in staging → appears in the tracker with readable stack (source maps) and no PII.
- [ ] Take the staging site down briefly (or point the monitor at a 404 URL) → alert received.
- [ ] `grep -RniE "authToken|SENTRY_AUTH_TOKEN" out/ .next/static` → nothing.
- [ ] Runbook exists and names the alert recipients.

## External dependencies

Monitoring/error-tracking accounts (client-owned), auth tokens as CI secrets, a deployed site.
