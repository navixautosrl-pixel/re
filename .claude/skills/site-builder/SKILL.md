---
name: site-builder
description: Orchestrates a complete marketing/brochure/portfolio/landing website build or redesign — inspect → discover → strategy → creative direction → implement → SEO/perf → test → polish → deliver — and routes each stage to the right skill. Use when asked to build, redesign, or substantially improve a website that has no user accounts or database. For anything with login, a database or server-side business logic, use app-builder instead.
---

# Site builder (orchestrator)

The site-workflow counterpart of `app-builder`. It owns **sequence and gates**, not
technique — each stage delegates to a specialist skill. Read CLAUDE.md first; its
Design / Motion / Testing standards are the rules this pipeline enforces.

## When to activate

- "Build me a website / landing page / portfolio for …", "redesign this site", "make this site premium".
- An existing site in this repo needs more than a one-file fix.
- Not for: a single CSS bug (just fix it), a SaaS/app (→ `app-builder`), slides (→ `slides`).

## Pipeline

| # | Stage | Owning skill(s) | Done when |
|---|---|---|---|
| 0 | Inspect | — (Bash/Read) | You can name: framework, build/test commands, existing pages + features that must keep working, assets available, deploy target (domain root or subpath). |
| 1 | Discover | `on-page-seo-content` (intent), `website-copywriting` (facts inventory) | Business, audience, primary CTA, languages, real facts (prices, address, reviews) listed — unknowns marked, not guessed. |
| 2 | Strategy | `conversion-optimization`, `on-page-seo-content` | Sitemap, one job per page, keyword→page map, success metric per page. |
| 3 | Creative direction | `creative-direction` → `ui-ux-pro-max` (query fresh), `design-system` | Written concept, tokens (color/type/space/radius/motion), motion storyboard per CLAUDE.md Motion standard. |
| 4 | Architecture | `nextjs-site-architecture` (or plain HTML when no build step is warranted) | Stack chosen with a one-line reason; project scaffolded and building. |
| 5 | Implement | `modern-css-layout`, `motion-react`, `gsap-*`, `interactive-visuals`, `vercel-react-best-practices` | Every page and interaction from stage 2 works; loading/empty/error/success states exist for every form. |
| 6 | Content | `website-copywriting` | No lorem, no invented numbers/testimonials/logos; placeholders visibly tagged. |
| 7 | SEO | `technical-seo`, `structured-data`, `on-page-seo-content` | Metadata/canonical/OG per page, sitemap, robots, JSON-LD validated by `structured-data/scripts/validate_jsonld.mjs`. |
| 8 | Performance | `core-web-vitals`, `web-performance` | Lighthouse run on the production build, numbers recorded (not estimated). |
| 9 | Accessibility | `accessibility` | Keyboard pass + automated pass clean of serious/critical. |
| 10 | Analytics (if asked) | `analytics-tracking` | Consent-gated, events verified firing in the browser. |
| 11 | QA | `site-qa-playwright` | `site_qa.mjs` exits 0 on the production build, served the way it will be deployed. |
| 12 | Polish loop | `creative-direction` (critique), `frontend-design` plugin | Screenshots reviewed at 375 / 768 / 1440; every issue found is fixed and re-screenshotted. |
| 13 | Gate | `site-quality-gate` | 100-point score ≥ 90 with evidence; every CLAUDE.md rubric line ≥ 8. |
| 14 | Deliver / deploy | `production-deployment` | Build artifact or verified live URL; delivery report written. |

E-commerce sites insert `ecommerce-development` between 4 and 5.

## Rules that hold across stages

1. **Inspect before editing.** Run `git status`; read the existing page before replacing anything. Preserve working behavior unless told otherwise.
2. **Ask only blocking questions** (brand name, real contact data, language, whether to deploy). Assume and continue on everything else — record the assumption in the delivery report.
3. **One stage's output is the next stage's input.** Don't write components before tokens exist; don't write copy before the facts inventory exists.
4. **Verify in a real browser** after every significant change, not only at the end.
5. **Never fabricate**: tests you didn't run, scores you didn't measure, integrations without credentials, business facts.

## Delivery report template

```
## Delivered
- Pages: … (status: implemented+tested / partial / not implemented)
- Features: …
- Stack: … (why)
## Evidence
- Build: <command> → <result>
- QA: site_qa.mjs → N critical / M warnings (attach report.json path)
- Lighthouse (lab, mobile): Perf / A11y / BP / SEO = … ; LCP … CLS … TBT …
- JSON-LD: validate_jsonld.mjs → …
## Assumptions & placeholders
## Known limitations / not tested (and why)
## Config required (env vars, DNS, accounts)
## Deploy steps
## Next improvements
## Quality score: NN/100 (deductions explained)
```

## Common failure modes

- Polishing the hero for hours while inner pages, footer links and forms stay broken.
- Testing `next dev` at `/` when the deploy is a static export under a subpath (see CLAUDE.md gotcha).
- Declaring "done" from a green build without screenshots.
- Re-using the previous project's palette/fonts — creative direction must be fresh.

## Completion criteria

All stage "done when" columns satisfied, `site-quality-gate` passed, delivery report written with evidence for every claim.
