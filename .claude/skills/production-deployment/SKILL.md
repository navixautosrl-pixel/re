---
name: production-deployment
description: Production readiness and deployment for websites — pre-flight checklist, environment variables, security headers, caching, static-export upload to shared hosting/cPanel (including subpath demos), Vercel deploys, DNS/HTTPS, redirects, post-deploy verification in a real browser, rollback, and git hygiene/debugging of failed builds. Use when a site is ready to ship, when a build or deploy fails, or when asked to "publish/put online". Deploys only with explicit user authorization.
---

# Production deployment

## Purpose

Ship a build that's verified before upload and verified again live — and be able to roll back.

## When to activate

"Deploy / publish / put it online", a failing build, a post-launch bug, a domain/HTTPS question.

## Authorization

Deploying is outward-facing. Confirm with the user **which target** (domain, subpath, Vercel project) unless already authorized for this exact site. Never deploy another client's site or overwrite an existing live site without confirmation and a backup.

## Pre-flight (all must pass locally)

```bash
git status                       # clean, or only intended changes
npm ci && npm run build          # from a clean install, zero errors
npx eslint .                     # if configured
node .claude/skills/site-qa-playwright/scripts/site_qa.mjs --dir <out> [--base-path <sub>]   # exit 0
node .claude/skills/structured-data/scripts/validate_jsonld.mjs <out>                         # exit 0
```
Plus: `site-quality-gate` passed; `.env.example` lists every variable the build needs; no secrets in `out/` (`grep -RniE "sk_live|sk_test|service_role|PRIVATE KEY" out/` → nothing); real domain in `metadataBase`, sitemap and canonical; `robots.txt` not `Disallow: /` on production (but **is** on staging/demo subpaths, plus `noindex`).

## Targets

### A. Static hosting / cPanel (RobixHost etc.)
1. Build with the right base path: `BASE_PATH=/sub/path npm run build` (empty for domain root).
2. Package: `cd out && zip -r ../site-$(date +%Y%m%d).zip .`
3. Upload & extract into the document root (or subfolder) via the user's cPanel File Manager/FTP/SFTP — we do this only if the user gives access; otherwise hand over the zip + steps.
4. `.htaccess` (Apache) for caching, HTTPS and 404:
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ErrorDocument 404 /404.html
   <IfModule mod_headers.c>
     <FilesMatch "\.(js|css|woff2|avif|webp|png|jpg|svg)$">
       Header set Cache-Control "public, max-age=31536000, immutable"
     </FilesMatch>
     <FilesMatch "\.html$">
       Header set Cache-Control "public, max-age=0, must-revalidate"
     </FilesMatch>
     Header always set X-Content-Type-Options "nosniff"
     Header always set Referrer-Policy "strict-origin-when-cross-origin"
     Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
     Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
   </IfModule>
   ```
   Only `immutable` on hashed filenames (`/_next/static/` is hashed; `public/` images are not — give those a shorter max-age or version their names). Under a subpath, `ErrorDocument` needs the subpath prefix.

### B. Vercel
- Vercel MCP/plugin (OAuth) or `vercel` CLI with a user-provided token (`VERCEL_TOKEN` in the environment, never committed).
- Set every `.env.example` variable in the Vercel project (Production + Preview) **before** deploying.
- Headers via `vercel.json` or `next.config.ts` `headers()` (not available with `output: "export"` — use `vercel.json`).
- In this sandbox vercel.com is blocked by the network policy → hand over instructions instead of claiming a deploy.

## Post-deploy verification (live URL)

1. `curl -sSI https://domain/` → 200, HTTPS, expected headers; `http://` → 301 to https; `www` ↔ apex redirect chosen and consistent.
2. `site_qa.mjs --url https://domain --pages <all>` → exit 0.
3. Open in the real browser, screenshot 375 + 1440, click primary CTA, submit the form (to a test inbox).
4. `https://domain/robots.txt` and `/sitemap.xml` correct; submit sitemap in Search Console (user access).
5. Lighthouse on the live URL (mobile) and Rich Results Test; record numbers.
6. Record the deployed commit SHA and timestamp in the delivery report.

## Rollback

Keep the previous zip / previous Vercel deployment. cPanel: re-extract the previous zip. Vercel: promote the previous deployment. Don't "fix forward" under pressure without a rollback ready.

## Debugging failed builds

1. Read the **first** error, not the last. Reproduce locally with the same Node version (`node -v`, `.nvmrc`).
2. Type errors → fix types, never `// @ts-ignore` to ship. Missing env → add to `.env.example` and the host.
3. Export errors ("dynamic server usage", Server Actions, `headers()`) → that route can't be static; refactor or change target.
4. Works locally, 404s live → base path / trailing slash / case-sensitive filenames on Linux hosts.
5. Use the `debugging` skill for anything deeper; document root cause in the commit message.

## Git hygiene

Small, descriptive commits; never commit `.env*` (except `.env.example`), `out/`, `node_modules/`, delivery zips; tag releases (`git tag site-name-v1.0`) when the user wants versioned deploys.

## Completion criteria

Pre-flight green, deploy authorized and performed (or handover package delivered), live verification steps executed with recorded results, rollback path documented.
