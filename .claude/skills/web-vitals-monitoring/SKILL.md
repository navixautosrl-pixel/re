---
name: web-vitals-monitoring
description: Real-user Core Web Vitals monitoring — web-vitals v6 (onLCP/onINP/onCLS with attribution) sending to GA4 or a beacon endpoint, p75 reporting by page and device, CrUX/PageSpeed field data, consent rules, and turning field data into fixes. Use after launch or when lab and real performance disagree. Needs a deployed site with traffic.
---

# Web Vitals monitoring (field data)

## Purpose

Know how real visitors experience LCP, INP and CLS (p75), and which page/element causes
problems — something no lab tool can tell you.

## When to activate

Post-launch; performance complaints; before/after a perf project; when Lighthouse looks fine but GSC's CWV report doesn't.

## Sources

| Source | What | Needs |
|---|---|---|
| CrUX (via PageSpeed Insights, CrUX API, GSC CWV report) | Chrome users, 28-day p75, URL or origin | enough traffic; public site |
| First-party RUM (`web-vitals` library) | every consenting visitor, any browser supporting the APIs, real-time, with attribution | code + endpoint/GA4 |

## Procedure (first-party RUM, verified API: web-vitals 6.2 exports `onLCP`, `onINP`, `onCLS`, `onFCP`, `onTTFB`; attribution build at `web-vitals/attribution`)

```ts
"use client";
import { useEffect } from "react";

export function WebVitals() {
  useEffect(() => {
    import("web-vitals/attribution").then(({ onLCP, onINP, onCLS }) => {
      const send = (m: { name: string; value: number; rating: string; id: string; navigationType: string; attribution?: unknown }) => {
        const body = {
          name: m.name, value: Math.round(m.name === "CLS" ? m.value * 1000 : m.value), rating: m.rating, id: m.id,
          page: location.pathname, nav: m.navigationType,
          // web-vitals 6 attribution: LCP → target, INP → interactionTarget, CLS → largestShiftTarget
          target: (() => { const a = (m.attribution ?? {}) as { target?: string; interactionTarget?: string; largestShiftTarget?: string };
            return a.target ?? a.interactionTarget ?? a.largestShiftTarget; })(),
        };
        // GA4 (only after analytics consent) or your own endpoint:
        if (typeof window.gtag === "function") window.gtag("event", m.name, { value: body.value, metric_id: m.id, metric_rating: m.rating, debug_target: body.target });
        else navigator.sendBeacon?.("/api/vitals", JSON.stringify(body));
      };
      onLCP(send); onINP(send); onCLS(send);
    });
  }, []);
  return null;
}
```
- Load it lazily (dynamic import) and only when consent rules allow sending (`gdpr-privacy`); vitals data itself is not personal if no identifiers are attached.
- Static export: no `/api` route → send to GA4, a serverless function, or a tiny PHP endpoint on the host.
- Report **p75 per page template and device class**, weekly; segment INP by `debug_target` to find the slow interaction.

## Turning data into fixes

- LCP bad on mobile for one template → `lighthouse-auditing` + `debug-optimize-lcp` on that template with mobile throttling.
- INP bad → the attribution target (button/selector) → long task in its handler; yield (`scheduler.yield()`/`setTimeout`), split work, lazy-load heavy libs.
- CLS bad → attribution `largestShiftTarget` → reserve space, fonts, late banners.

## Failure prevention

- Reporting averages instead of p75.
- Sending vitals before consent where analytics consent is required.
- Mixing soft-navigation metrics from SPAs without the `navigationType` field.

## Verification checklist

- [ ] In the browser, after interactions and page hide, beacons/GA4 events fire with name/value/rating (Playwright: intercept `/api/vitals` or GA `collect` with `en=LCP|INP|CLS`).
- [ ] Dashboard/report shows p75 by page with sample counts.
- [ ] Field vs lab discrepancy documented.

## External dependencies

Deployed site with real traffic; GA4 property or endpoint; consent implementation. Not measurable in this sandbox (no public deployment).
