---
name: conversion-optimization
description: Conversion rate optimization for websites and landing pages — defining one job and one success metric per page, value proposition and hero strategy, CTA hierarchy, trust signals built only from real proof, objection handling, pricing-page and form design, lead funnels, measurement plan, and ethical A/B testing. Use in strategy (page jobs, funnel), during layout/copy decisions, and when auditing why a page doesn't convert. Rejects dark patterns, fake urgency, and fabricated social proof.
---

# Conversion optimization (CRO)

## Purpose

Make the desired action obvious, low-friction, and credible — measurably, and honestly.

## When to activate

Strategy stage; hero/pricing/contact/landing page design; "the site doesn't bring leads" audits.

## Workflow

1. **Page job sheet** (one per page):
   ```
   Page: /            Audience: owners of new/premium cars in Brașov
   Job: get a booking request     Primary CTA: "Programează o evaluare"   Secondary: call
   Success metric: booking form submits / sessions (event: generate_lead)
   Top 3 objections: price? how long? is it safe for my paint?
   Proof available: before/after photos (real), 2 Google reviews (real, quoted with permission?)
   ```
2. **5-second test for the hero** — a stranger must get: what it is, for whom, why this one, what to do next. Headline = outcome, subhead = how/for whom, one primary button, one low-commitment alternative (phone, WhatsApp, see prices).
3. **CTA hierarchy**: one visually dominant action per viewport; secondary actions styled as secondary; the same primary CTA label site-wide; sticky mobile CTA only when it doesn't cover content.
4. **Page shape** (adapt, don't apply mechanically): Hero → value/benefits → proof → how it works → offer/pricing → objections/FAQ → final CTA. Put proof *next to* the claim it supports.
5. **Trust signals — real only**: client logos with permission, verbatim reviews with name/source/date, certifications with verifiable numbers, guarantees the business actually offers. Missing proof → leave the slot out or tag it visibly as a placeholder for the client (`<span class="example-tag">exemplu — de înlocuit</span>`, pattern used in this repo).
6. **Forms**: only fields you'll use (name + phone/email + one qualifying question often beats 8 fields); labels above fields; inline validation on blur; error text says how to fix; success state says what happens next and when; spam protection that's invisible (honeypot + server-side rate limit) before CAPTCHAs.
7. **Pricing pages**: anchor with the most-chosen plan, show what's included in plain language, show the real price incl. VAT where B2C law requires, a comparison table that scans on mobile (stacked cards < 768px).
8. **Friction audit**: every click/field/scroll between landing and conversion — remove, merge, or justify.
9. **Measurement plan** → hand to `analytics-tracking`: conversion event names, micro-conversions (CTA click, form start, phone click), funnel steps.
10. **Testing**: hypothesis ("Because X, changing Y will increase Z for audience W"), one primary metric, run until the pre-computed sample size (not until it looks good), then document. Low-traffic sites: prefer qualitative tests (5 users, session recordings with consent) over underpowered A/B tests.

## Never (dark patterns)

Fake countdowns/scarcity, pre-ticked consent, confirmshaming ("No, I don't want to save money"), hidden costs, invented "X people are viewing", fake reviews, disguised ads, roach-motel cancellation.

## Common failure modes

- Three equal-weight buttons in the hero.
- CTA that says "Submit"/"Trimite" instead of the outcome.
- Proof dumped in a carousel no one sees.
- Contact form with no success/error state, or one that silently fails (no backend).

## Verification

- Screenshot the hero at 375 and 1440 → primary CTA visible without scrolling, contrast ≥ 3:1 against its background.
- Click every CTA in the browser → reaches the right destination/state.
- Form: submit empty, invalid, valid → correct states; endpoint actually receives (or explicitly mocked and disclosed).

## Completion criteria

Job sheet per page, each page has exactly one dominant CTA path that works, every trust element is real or tagged as placeholder, measurement plan handed off.
