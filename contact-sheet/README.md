# Contact Sheet

A proof sheet of the websites built in this repository. Each site is a frame on a dark film strip, with real screenshots of its own production build. Its stack, typefaces, commit count and latest change are read from the repo. This is the practical test of the skill library's second round (see `../.claude/SKILLS_INVENTORY.md`).

Stack: Next.js 16.4 static export, React 19.3 (built-in `ViewTransition` for the frame → case-page morph), Tailwind CSS 4, GSAP 3.15 ScrollTrigger (lazy-loaded, ≥900px only), and Bricolage Grotesque (opsz+wght, subset to 47KB + 3.5KB Romanian glyphs) via `next/font/local`. There's no animation library on the main path.

## Commands

```bash
npm install
npm run capture          # rebuild screenshots + src/data/projects.json from the repo's sites (build the Next ones first: <site>/out)
#   then optimize: node ../.claude/skills/image-optimization/scripts/optimize_images.mjs raw/desktop --out public/shots --widths 320,640,960,1280
#                  node ../.claude/skills/image-optimization/scripts/optimize_images.mjs raw/mobile  --out public/shots --widths 390
BASE_PATH=/demo/contact-sheet npm run build
npm test                 # Playwright: interactions + visual regression (serves out/ under /demo/contact-sheet)
npm run qa               # generic site QA across widths, SEO, a11y (axe), reduced motion, no-JS
node scripts/og.mjs      # re-render public/og.png from the built hero (needs scripts/serve.mjs running)
```

Build-time env: `BASE_PATH`, `SITE_URL` (canonical origin, defaults to localhost) and `SITE_INDEXABLE=true` (off by default, so the demo ships `noindex`).

## Verified (2026-10-09)

- Build, `tsc` and ESLint are clean. There are 14 static routes, including 9 `/work/[slug]/` pages from `generateStaticParams`.
- `site_qa.mjs` gives 0 critical / 0 warnings across 10 pages × 6 widths, with axe (WCAG 2.2 AA tags) clean.
- Playwright: 21 passed, 1 skipped (the mobile-menu test is mobile-only). Covered: filter, loupe dialog focus return, page-transition call, film-strip pin mid-scroll, mobile menu with base-path links, reduced motion, no-JS, and visual baselines.
- JSON-LD: 13 files, 0 errors, 0 warnings. Privacy audit: 0 third-party hosts and 0 cookies before consent.
- Lighthouse 13, lab, 3 runs, medians:
  - mobile, simulated: Perf 98 / A11y 100 / BP 100, CLS 0, TBT 64ms, LCP 2.44s (observed 156ms)
  - mobile, devtools throttling: Perf 95, LCP 1.73s, CLS 0, TBT 222ms
  - desktop: 100 / 100 / 100
  - SEO is 69 only because of the deliberate `noindex`

## Known limitations

- Not deployed. Screenshots are lab captures of local builds.
- Mobile TBT under real 4× CPU throttling (210–222ms) is slightly over the 200ms lab target. It comes from React hydration; field INP is unknown until there's real traffic.
- Cookie banners were declined via each site's own reject button (or hidden when it had none) before capture. This is recorded per site as `hiddenCookieBanner` and noted under the screenshots.
- `→` isn't in the subset font and isn't used in the page copy.
