---
name: a-b-testing
description: A/B and split testing for websites — writing a falsifiable hypothesis, choosing one primary metric, computing required sample size and duration (bundled script), implementing variants without flicker or SEO harm, consent-aware assignment, analysis without peeking, and when traffic is too low to test. Use before running or interpreting any experiment.
---

# A/B testing

## Purpose

Decide changes with evidence — and recognize when a site doesn't have the traffic for
a valid test (most small-business sites don't).

## When to activate

"Test which headline converts better", pricing page experiments, CTA variants, after `conversion-optimization` produced hypotheses.

## Procedure

1. **Hypothesis**: "Because <observation>, changing <X> for <audience> will increase <primary metric>." One primary metric (e.g. lead form submission rate per session), guardrail metrics (bounce, revenue, page speed).
2. **Size it before building** — bundled script (stdlib only):
   ```bash
   python3 .claude/skills/a-b-testing/scripts/sample_size.py --baseline 0.03 --mde 0.20 --weekly-visitors 2000
   ```
   (`--mde` is the *relative* lift you want to detect; default α=0.05 two-sided, power 0.8.) If the required duration is > ~6–8 weeks, **don't A/B test** — do qualitative research (5-user tests, session recordings with consent, surveys) and ship the best-reasoned version.
3. **Implementation**:
   - Server/edge assignment (middleware, CDN) → no flicker; static sites: assign in a tiny inline script before paint, persist in a first-party cookie/localStorage, render both variants' CSS hidden-safe.
   - Same URL for both variants (or `rel=canonical` to the original if variant URLs exist); no cloaking (Googlebot sees what users see — a random variant is fine).
   - Respect consent: assignment cookies for experiments are generally non-essential → only after consent, or use cookieless hashing per session with no personal data (check with `gdpr-privacy`).
   - Log exposure (`experiment_impression` with `experiment_id`, `variant`) and conversions with the variant attached (GA4 custom dimension).
4. **Run** for the pre-computed sample and **whole weeks** (weekday effects); don't stop when it "looks significant" (peeking inflates false positives).
5. **Analyze**: two-proportion z-test / chi-square on the primary metric (script prints the formula); report the effect with a confidence interval, not just "won". Check guardrails and segments only as exploratory.
6. **Document**: hypothesis, dates, sample, result, decision — in the project docs.

## Failure prevention

- Testing 5 changes at once and attributing the result to one.
- Underpowered tests on 500 visitors/month declared winners.
- Flicker of original content (FOOC) biasing results.
- Leaving losing variants' code around.

## Verification checklist

- [ ] Script output saved in the plan (sample per variant, duration).
- [ ] Playwright: forced assignment (cookie) renders each variant; no layout shift; analytics event carries the variant.
- [ ] After the test: analysis with CI recorded; code cleaned up.
