---
name: nextjs-site-architecture
description: Next.js App Router architecture for marketing/content websites in this repo — when to choose Next vs plain HTML, project layout, static export (output "export") and subpath basePath deployment, Metadata API, sitemap/robots files, self-hosted fonts, images, Server vs Client Component boundaries for animated pages, and the production build check. Use when scaffolding or restructuring a site that will use Next.js. For app builds with auth/DB, follow app-builder + frontend-design instead.
---

# Next.js site architecture

## When to activate

Stage 4 of `site-builder`, or any time a Next.js site is created, restructured, or fails to build/export.

## Choose the stack (write the reason down)

| Situation | Choose |
|---|---|
| 1 page, no build step wanted, hosted as a single file | Plain HTML/CSS/JS (pattern: `website-v2/`) |
| Multi-page or component-heavy, premium motion, static hosting (cPanel/subpath) | Next.js + `output: "export"` (pattern: `riviera-padel/`, `pulsar-studio/`) |
| Needs server code (form handler, ISR, auth) | Next.js on Vercel/Node — not static export |
| Content edited by non-developers | Add a CMS (Sanity/WordPress headless) — confirm with user first |

## Scaffold

```bash
npx create-next-app@latest <dir> --ts --tailwind --app --eslint --src-dir --import-alias "@/*" --use-npm --disable-git --no-agent-feedback --yes
cd <dir> && npm i motion lucide-react clsx tailwind-merge @fontsource-variable/<font>
# only if the storyboard needs it: npm i gsap @gsap/react   |   npm i lenis
```

Check generated `package.json` versions; never hand-pin to a version you have not seen on npm (`npm view <pkg> version`).

## Layout

```
src/
  app/
    layout.tsx        # <html lang>, fonts, metadataBase, skip link, header/footer
    page.tsx          # Server Component — composes sections
    sitemap.ts        # MetadataRoute.Sitemap
    robots.ts         # MetadataRoute.Robots
    not-found.tsx
    opengraph-image.png (static) or opengraph-image.tsx (not with export+basePath, see gotchas)
  components/
    sections/         # Hero.tsx, Pricing.tsx … (Server by default)
    ui/               # Button, Accordion (Radix) …
    motion/           # client-only animation wrappers ('use client')
  lib/
    site.ts           # single source of truth: name, url, phone, address, socials
    base-path.ts      # withBasePath()
```

**Server/Client boundary**: sections stay Server Components; wrap only the animated or
interactive leaf in a small `'use client'` component that receives children/props.
Never put `'use client'` on `layout.tsx` or a whole page just to animate a heading.

## Routing & rendering strategies

- **File routing**: `app/<segment>/page.tsx`; shared chrome in `layout.tsx`; `loading.tsx` (Suspense fallback), `error.tsx` (client error boundary), `not-found.tsx`; route groups `(marketing)/` organize without changing URLs; dynamic `[slug]/`.
- **Choose per route**:
  | Strategy | When | How |
  |---|---|---|
  | Static (SSG) — default for sites | content known at build | Server Components fetch at build; with `output: "export"` this is the only mode |
  | Static dynamic routes | many pages from data (services, case studies) | `generateStaticParams()` + `export const dynamicParams = false` |
  | Revalidated (ISR) | content changes, server hosting (Vercel/Node) | `fetch(url, { next: { revalidate: 3600 } })` or on-demand `revalidatePath()` from a CMS webhook |
  | Dynamic (SSR) | per-request data, cookies/headers, auth | request-time APIs (`cookies()`, `headers()`); not available in static export |
  | Client-only | browser-only widgets | `next/dynamic(() => import(...), { ssr: false })` inside a Client Component |
- **Params are async** in current Next: `const { slug } = await params` in pages and `generateMetadata`.
- **Navigation**: `<Link>` for internal links (prefetch); plain `<a>` for hash links within a page.
- **Data**: fetch in the Server Component that needs it; parallelize independent fetches (`Promise.all`); pass only serializable, minimal props to Client Components (see `vercel-react-best-practices`).
- Always confirm details for the installed version in `node_modules/next/dist/docs/` (`official-documentation-research`).

## next.config.ts (static export, optional subpath)

```ts
import type { NextConfig } from "next";
import path from "node:path";
const basePath = process.env.BASE_PATH || "";
const config: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,          // /about/ → about/index.html — works on any static host
  images: { unoptimized: true },// next/image default loader needs a server
  env: { BASE_PATH: basePath },
  // This repo has a package-lock.json at its root; without this, Next infers the
  // repo root as the workspace root and warns / resolves deps from the wrong place.
  turbopack: { root: path.resolve(__dirname) },
};
export default config;
```

```ts
// lib/base-path.ts
export const withBasePath = (p: string) => `${process.env.BASE_PATH ?? ""}${p}`;
```

## Metadata

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(site.url),            // absolute OG/canonical URLs
  title: { default: `${site.name} — <value prop>`, template: `%s · ${site.name}` },
  description: "...",                          // 140–160 chars, page-specific
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "ro_RO", siteName: site.name, images: ["/og.png"] },
  robots: { index: true, follow: true },
};
```

Every route exports its own `metadata` (title, description, canonical). JSON-LD goes in a
`<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />` — the `<` escape prevents script-breakout if any value is ever user-supplied.

## Fonts

Prefer **`next/font/local` pointing at the `@fontsource-variable/*` woff2**. It preloads the file and generates a metric-matched fallback. On skill-atelier, swapping from the plain `@fontsource` CSS import to `next/font/local` took desktop CLS from 0.154 to 0:
```ts
const display = localFont({
  src: "../fonts/archivo-wdth-wght-basic.woff2",   // or node_modules/@fontsource-variable/<font>/files/<font>-latin-wght-normal.woff2
  variable: "--font-display", weight: "100 900", display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],   // only for fonts with a wdth axis
});
```
Then `<html className={display.variable}>` and `--font-sans: var(--font-display), …` in `@theme`.
**Subset big variable fonts** to the glyphs the site uses, keeping the axes: `python3 -m fontTools.subset in.woff2 --unicodes="U+0020-007E,U+00A0,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026" --layout-features='kern,liga,calt' --flavor=woff2 --output-file=src/fonts/x.woff2` (`pip install fonttools brotli`). That took Archivo from 90KB to 43KB. Romanian sites must add `U+0102,U+0103,U+00C2,U+00E2,U+00CE,U+00EE,U+0218-U+021B` from the `latin-ext` file. List the non-ASCII characters the content actually uses before choosing ranges.
`next/font/google` is fine when the build machine can reach Google. In this sandbox, check first.

## Gotchas (verified in this repo)

- Under a subpath, `next/image` `priority` preload and the `icon.tsx` metadata route emit **unprefixed** URLs → 404. Use `loading="eager"` + `fetchPriority="high"` instead of `priority`, and static `public/` icons referenced through `withBasePath()`.
- `output: "export"` disallows: route handlers with dynamic behavior, `cookies()/headers()`, Server Actions, middleware/proxy, ISR, default image optimization.
- Test the **export served from the real subpath** (`site_qa.mjs --dir out --base-path /sub`) — `next dev` at `/` hides these bugs.
- Next 16: Turbopack is the default bundler; `next lint` was removed — run `npx eslint .` directly.
- Next 16.4's `create-next-app` turns on `cacheComponents: true` and `partialPrefetching: true`. Combined with `output: "export"`, `robots.ts`/`sitemap.ts` fail both ways: without `export const dynamic = "force-static"` the export rejects them, and with it `cacheComponents` rejects the segment config. Adding `"use cache"` doesn't help either. Verified 2026-10-09 while building `skill-atelier/`. For a fully static site, remove both flags. The alternative is plain `public/robots.txt` / `public/sitemap.xml` files.
- The scaffold ships an `AGENTS.md` warning that APIs differ from training data, and the docs for the installed version are in `node_modules/next/dist/docs/`. Read the relevant guide there before relying on memory.

## Verification

```bash
npm run build                          # must pass with zero type errors
npx eslint .                           # if configured
node ../.claude/skills/site-qa-playwright/scripts/site_qa.mjs --dir out [--base-path /sub]
node ../.claude/skills/structured-data/scripts/validate_jsonld.mjs out
```

Inspect `out/index.html`: title, description, canonical, OG tags present in raw HTML (SEO must not depend on JS).

## Completion criteria

Builds cleanly; exported HTML contains final content and metadata; every asset loads when served from the real deploy path; client JS limited to interactive leaves.
