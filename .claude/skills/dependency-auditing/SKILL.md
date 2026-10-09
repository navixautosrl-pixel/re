---
name: dependency-auditing
description: Auditing and managing npm (and Composer) dependencies — necessity review before adding, npm audit triage, lockfile hygiene with npm ci, pinning tooling, supply-chain checks (maintainers, install scripts, typosquats, provenance), licence checks, update strategy, and bundle impact. Use before adding a package, before release, and when audit reports vulnerabilities.
---

# Dependency auditing

## Purpose

Every dependency is needed, maintained, licensed compatibly, free of known exploitable
vulnerabilities, and installed reproducibly.

## When to activate

Adding a package; pre-release; `npm audit` warnings; Dependabot/Renovate PRs; supply-chain news.

## Before adding a package

1. Can the platform do it (CSS, native API, existing dependency)? If yes, don't add.
2. Check: `npm view <pkg> version time.modified license repository.url maintainers --json`; weekly downloads; open issues; last release; TypeScript types; ESM support; size impact (bundlephobia.com, or build before/after and compare `out/_next/static/chunks` sizes).
3. Watch for typosquats (exact name from the official docs), `postinstall` scripts (`npm view <pkg> scripts`), and unusually new versions published minutes ago.
4. Pin tools that execute with privileges (MCP servers, CLIs) to exact versions (`npm i -D -E`) — the pattern used for `@playwright/mcp` and `chrome-devtools-mcp` in this repo.

## Audit procedure

```bash
npm ci                                   # reproducible install from the lockfile
npm audit --omit=dev                     # production-impacting vulns first
npm audit --json > audit.json            # full report for triage
npm outdated                             # what's behind
# licence overview with npm's built-in query (no extra package):
npm query '.prod' | node -e 'const p=JSON.parse(require("fs").readFileSync(0));const t={};for(const x of p){const l=x.license||"UNKNOWN";(t[l]??=[]).push(x.name)}for(const [l,n] of Object.entries(t))console.log(l.padEnd(14),n.length,/GPL|SSPL|UNKNOWN/.test(l)?"review: "+n.slice(0,5).join(","):"")'
# (on skill-atelier this flagged LGPL libvips via Next's optional image dep and GSAP's own "standard no-charge" licence — both fine, but now known)
```
Triage each advisory: is the vulnerable code path reachable in *our* usage (build-time-only dev tools vs shipped runtime)? Fix order: runtime + reachable + high/critical → patch/minor update → `overrides` in package.json for transitive fixes → replace the package. Never blindly run `npm audit fix --force` (major upgrades).

## Lockfile hygiene

- Commit `package-lock.json`; CI uses `npm ci`; never hand-edit the lockfile; regenerate on conflicts with `npm install`.
- One package manager per project (don't mix npm/pnpm lockfiles).

## Updates

- Patch/minor regularly (Renovate/Dependabot grouped weekly); majors deliberately with changelog review and full QA (`site-qa-playwright`, build, typecheck).
- Framework majors (Next/React/Tailwind): read the upgrade guide in `node_modules/<pkg>/dist/docs` or official docs (`official-documentation-research`).

## Composer (PHP/WordPress)

`composer audit`, `composer outdated`, commit `composer.lock`; WordPress plugins: only from wordpress.org or reputable vendors, auto-update minors.

## Failure prevention

- Adding a 200 KB library for one helper function.
- `npm install` in CI (lockfile drift).
- Ignoring `npm audit` entirely, or "fixing" with breaking majors before release.
- Copyleft licences in proprietary client code without the client knowing.

## Verification checklist

- [ ] `npm ci && npm run build` succeeds from clean.
- [ ] `npm audit --omit=dev` → 0 high/critical, or each listed with reachability reasoning.
- [ ] New dependencies justified in the commit message (why, size, alternative considered).
