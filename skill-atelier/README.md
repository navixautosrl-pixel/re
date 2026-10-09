# Skill Atelier

A one-page site that presents this repo's website-building skill library (`../.claude/skills/`) as a workshop shadow board. Every tool hangs on its outline, and the empty outlines are capabilities this environment can't reach yet.

It's the practical capability test for the skill setup. Every name and count on the page is read from the real `SKILL.md` files at build time (`scripts/collect-skills.mjs`), so nothing on it is invented.

Stack: Next.js 16.4 (App Router, `output: "export"`), React 19.3, TypeScript, Tailwind CSS 4, Motion 14 (`LazyMotion`, async features), GSAP 3.15 + ScrollTrigger (lazy-loaded, desktop only), and Archivo variable (wght + wdth axes) through `next/font/local`, subset to 43KB.

## Commands

```bash
npm install
npm run build                               # prebuild regenerates src/data/skills.json
BASE_PATH=/demo/skill-atelier npm run build # same, for hosting under a subpath
npm run qa                                  # generic browser QA (6 widths, SEO, a11y, reduced motion, no-JS)
node tests/interactions.mjs                 # site-specific interaction suite (needs the subpath build)
node ../.claude/skills/structured-data/scripts/validate_jsonld.mjs out
```

Environment variables (build time): `SITE_URL` (canonical origin, defaults to `http://localhost:3000`), `SITE_INDEXABLE=true` (to allow indexing; it is **off by default**, so the demo ships `noindex`), and `BASE_PATH`.

## Font subset

```bash
python3 -m fontTools.subset node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2 \
  --unicodes="U+0020-007E,U+00A0,U+00B7,U+00D7,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2192" \
  --layout-features='kern,liga,calt' --flavor=woff2 --output-file=src/fonts/archivo-wdth-wght-basic.woff2
```

`→` and `ș` aren't in the upstream Latin file. They appear only inside expandable skill descriptions and render in the fallback font.

## Not deployed

There's no production domain, and vercel.com is blocked from the build sandbox. To publish, set `SITE_URL` and `SITE_INDEXABLE=true`, build, and upload `out/` (see `../.claude/skills/production-deployment/SKILL.md`).
