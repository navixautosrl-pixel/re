---
name: official-documentation-research
description: Getting current, version-correct technical facts before writing code — reading docs bundled in node_modules (e.g. next/dist/docs), installed .d.ts types, package READMEs and changelogs, npm view metadata, official sites via web fetch when reachable, and recording sources. Use whenever an API, flag, version, or behavior is uncertain, after major upgrades, or when a scaffold warns that APIs changed.
---

# Official documentation research

## Purpose

Code against the version actually installed, not against memory. This repo's history has
concrete cases where memory was wrong and the installed sources were right.

## When to activate

Any API you're not certain about; new major versions (Next 16, React 19.3, Tailwind 4, Motion 14, GSAP 3.15…); CLI flags; config keys; when a tool behaves unexpectedly.

## Source order (most reliable first)

1. **Docs shipped with the installed package**: `ls node_modules/<pkg>/dist/docs` (Next.js ships its full docs — its scaffolded `AGENTS.md` says to read them), `node_modules/<pkg>/README.md`, `CHANGELOG.md`.
2. **Installed type definitions**: `grep -rhoE "export (declare )?(function|const|class) <Name>[^;{]{0,200}" node_modules/<pkg>/dist/**/*.d.ts` — exact signatures and option names.
3. **The CLI itself**: `<tool> --help`, `npx <pkg>@<version> --help`.
4. **Registry metadata**: `npm view <pkg> version time.modified license exports --json`.
5. **Official websites / repos** (web fetch or `git clone --depth 1`) when the network allows — prefer the vendor's domain and repo over blogs.
6. **Running a minimal experiment** in the scratchpad (install, call the API, print the result).
Memory/training data is the last resort and must be verified by one of the above.

## Procedure

1. State the question precisely ("Does Lighthouse 13 honor `--chrome-path`?").
2. Check the installed version (`node -p "require('<pkg>/package.json').version"`).
3. Read the narrowest authoritative source; run a tiny experiment when cheap.
4. Record the answer *with source and date* where it's used (skill text, code comment, README).

## Cases from this repo (all verified)

- Next 16.4 scaffold enables `cacheComponents`, which conflicts with `output: "export"` robots/sitemap — found by building, confirmed in `node_modules/next/dist/docs`.
- Lighthouse 13 ignores `--chrome-path`; `CHROME_PATH` env works.
- `license-checker-rseidelmann` doesn't exist on npm — caught by `npm view` before shipping a fabricated command.
- zod 4 error flattening is `z.flattenError(err)`; Rive React re-exports `Layout/Fit/Alignment` from `@rive-app/canvas` — checked in `.d.ts`.
- PHP 8.3 *is* installed in this sandbox (an initial claim that it wasn't was wrong — `which php`).

## Failure prevention

- Copying API usage from a blog for a different major version.
- Inventing package names, flags, or config keys that "sound right".
- Treating the absence of evidence as evidence ("it's not installed") without checking.

## Verification checklist

- [ ] Every non-trivial API/flag in new code or skills traced to an installed source or official doc.
- [ ] Version noted next to version-sensitive instructions.
- [ ] Experiments run in the scratchpad, not in the project.
