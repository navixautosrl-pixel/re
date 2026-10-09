---
name: ci-cd-automation
description: "CI/CD for website projects with GitHub Actions — install/lint/typecheck/build, browser QA and visual tests in CI, Lighthouse budgets, deploying static exports to cPanel/SFTP or Vercel with secrets, CMS rebuild webhooks, caching, least-privilege permissions, and workflow security review. Use when automating checks or deploys for a site. Template: assets/site-ci.yml."
---

# CI/CD automation

## Purpose

Every push proves the site still builds and passes QA; deploys are repeatable,
authorized, and reversible.

## When to activate

A project that will be maintained; multiple contributors; client wants "publish from the CMS"; recurring manual deploys.

## Procedure

1. **Start from the template**: `.claude/skills/ci-cd-automation/assets/site-ci.yml` → copy to `.github/workflows/<site>-ci.yml` and set `working-directory` / paths. Adding a workflow to a repo is an outward-facing change — confirm with the user first.
2. **Pipeline stages** (fail fast):
   1. `npm ci` (lockfile) with npm cache
   2. `npx eslint .` + `npx tsc --noEmit`
   3. `npm run build` (with `BASE_PATH` if deploying to a subpath)
   4. Browser QA: install Chromium via `npx playwright install --with-deps chromium` (CI runners have no pre-installed browsers) → `site_qa.mjs --dir out`, JSON-LD validator, visual tests (baselines generated **in CI's environment**)
   5. Upload `out/` + `qa-report/` as artifacts
   6. Deploy job (only on `main`, only after all checks, with an environment requiring approval for production)
3. **Deploy targets**:
   - cPanel/SFTP: `rsync`/`lftp mirror` over SSH/SFTP with `secrets.SFTP_HOST/USER/KEY`; deploy to a new directory then switch a symlink if the host allows (instant rollback), otherwise keep the previous zip as a release artifact.
   - Vercel: `vercel deploy --prebuilt --prod --token ${{ secrets.VERCEL_TOKEN }}` or Vercel's Git integration.
4. **Triggers**: `push`/`pull_request` for checks; `workflow_dispatch` + `repository_dispatch` for CMS publish webhooks; `paths:` filters so one site's change doesn't rebuild all 13 sites in this monorepo.
5. **Security** (also run `gha-security-review`):
   - `permissions: contents: read` at top; grant more per job only when needed.
   - Pin third-party actions to a commit SHA (`uses: actions/checkout@<sha> # v4`).
   - Never use `pull_request_target` with checkout of PR code; never interpolate `${{ github.event.* }}` text into `run:` (expression injection) — pass via `env:`.
   - Secrets only in deploy jobs, environments with required reviewers for production.
6. **Speed**: cache npm (`actions/setup-node` `cache: npm`), cache Playwright browsers keyed on version, run sites' jobs in a matrix.

## Failure prevention

- `npm install` instead of `npm ci`.
- Deploying from PRs or forks.
- Visual baselines created on a laptop, compared in CI (font rendering differs).
- Long-lived personal tokens with broad scopes.

## Verification checklist

- [ ] YAML parses (`python3 -c "import yaml,sys;yaml.safe_load(open(sys.argv[1]))" file.yml`); `actionlint` if available.
- [ ] First run green on a branch; a deliberately broken commit turns it red at the right step.
- [ ] Deploy job: dry-run/staging first; live URL verified after (`production-deployment`).
- [ ] `gha-security-review` run on the workflow — no injection or over-permission findings.
