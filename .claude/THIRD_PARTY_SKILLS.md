# Third-party skills vendored in `.claude/skills/`

Snapshots are pinned to a reviewed commit and checked into the repo, so they can't change under us.
To update one: clone the upstream repo, diff it against the copy here, review the changes the same way (look for scripts, network fetches, credential requests and install steps), then copy it over and update the commit hash below.

| Skill dir | Upstream | Commit reviewed | License | Local changes |
|---|---|---|---|---|
| `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-react`, `gsap-plugins`, `gsap-utils`, `gsap-performance` | github.com/greensock/gsap-skills (official, GreenSock) | `aed9cfd3277740755f6bfc1155c7aa645403b760` | MIT (`LICENSE.txt` in each dir) | `gsap-scrolltrigger`: the horizontal-scroll example was broken (`Max.max` typo, a pixel value fed to `xPercent`, `scrub` missing). Fixed and marked `[local patch]`. `gsap-frameworks` (Vue/Svelte) not vendored, since this repo uses React. |
| `accessibility`, `core-web-vitals`, `web-quality-audit` | github.com/addyosmani/web-quality-skills (self-described as unofficial, by Addy Osmani) | `afa8da942115f2961fdbfa80807ea0b232ff6c00` | MIT | none |
| `technical-seo` (upstream `seo`), `web-performance` (upstream `performance`), `web-best-practices` (upstream `best-practices`) | same | same | MIT | Renamed (`name:` field and directory) so they don't collide with this repo's app-builder `seo`/`performance` skills. Relative `../seo/`, `../performance/` and `../best-practices/` links updated to match. |
| `vercel-react-best-practices` (upstream dir `react-best-practices`) | github.com/vercel-labs/agent-skills | `063bee94c3f4df8453406c830b0a7df0f2860278` | MIT (declared in the skill's frontmatter; the repo itself has no LICENSE file) | Directory renamed to match its `name:` field. |

### Added in round 2 (2026-10-09), each scanned with `skill-scanner` and read manually

| Skill dir | Upstream | Commit reviewed | License | Local changes |
|---|---|---|---|---|
| `wordpress-router`, `wp-project-triage`, `wp-block-themes`, `wp-block-development`, `wp-plugin-development`, `wp-interactivity-api`, `wp-performance`, `wp-rest-api`, `wp-wpcli-and-ops` | github.com/WordPress/agent-skills (official) | `3cf7f6f701300d80166cc0b7e6ebc667501c353d` | GPL-2.0-or-later | none. Scripts are read-only `wp` CLI calls. `wordpress-router` also names skills that weren't vendored (`wp-abilities-api`, `wp-phpstan`, `wp-playground`, `wp-env`, `wp-patterns`, `blueprint`). They're optional, and their absence is reported by the `skill-management` audit. |
| `content-modeling-best-practices`, `sanity-best-practices` | github.com/sanity-io/agent-toolkit (official) | `88d6cdfa7cb06c99edd5f376efa4dac21ae3f877` | MIT | none |
| `stripe-best-practices` | github.com/stripe/ai (official) | `9bdda30e3caf8d512dd41c7304035ee891db5140` | MIT | none |
| `supabase-postgres-best-practices` | github.com/supabase/agent-skills (official) | `c9be0e931b7930f7d02126d04774d904c381e7d7` | MIT | none |
| `skill-scanner`, `gha-security-review` | github.com/getsentry/skills | `d18b7aa8ba878354e5c348310230e652f7690f9c` | Apache-2.0 | none. `skill-scanner` runs with `python3 -I` (needs PyYAML, which is present) rather than the `uv` its docs mention. |
| `debug-optimize-lcp`, `a11y-debugging` | github.com/ChromeDevTools/chrome-devtools-mcp (official) | `2744afa8922e2f28a3c512a7aaf6f72d88bbd9a0` | Apache-2.0 | none. They need the `chrome-devtools` MCP server, now configured in `.mcp.json` (see below). |
| `vercel-react-view-transitions` (upstream `react-view-transitions`), `vercel-composition-patterns` (upstream `composition-patterns`) | github.com/vercel-labs/agent-skills | `063bee94c3f4df8453406c830b0a7df0f2860278` | MIT (frontmatter) | Directories renamed to match `name:`. The view-transitions description had `<ViewTransition>`, which breaks the Agent Skills spec's no-angle-brackets rule, so it was rewritten as `` `ViewTransition` component ``. Known upstream issue: the bundled `AGENTS.md` files link to files that don't exist (reported as WARN by the audit; the `SKILL.md` files are fine). |

### MCP server added: `chrome-devtools`

`chrome-devtools-mcp@1.10.1` (Apache-2.0) is pinned exactly in the root `package.json`. It's launched from `./node_modules/.bin` with `--executablePath` (the pre-installed Chromium), `--headless`, `--isolated`, `--usageStatistics=false` (otherwise usage data goes to Google) and `--performanceCrux=false` (otherwise trace URLs go to Google's CrUX API, which would leak private or staging URLs). Verified with a real MCP stdio handshake: 30 tools, including `lighthouse_audit` and `performance_start_trace`, and it opened a page in the sandbox Chromium. Its tools appear in the next session.

## Reviewed and deliberately not vendored

| Candidate | Why not |
|---|---|
| `vercel-labs/agent-skills/web-design-guidelines` | On every run it fetches its rules from `raw.githubusercontent.com/.../main/command.md`, so its instructions are mutable remote content we can't pin or review. |
| `vercel-labs/agent-skills/deploy-to-vercel`, `vercel-cli-with-tokens` | They ship shell scripts plus a zip, and need a Vercel token. vercel.com is blocked by this sandbox's network policy anyway. `production-deployment` covers Vercel with OAuth/MCP instead. |
| `anthropics/skills` frontend-design / webapp-testing / web-artifacts-builder | Already present: `webapp-testing` and `web-artifacts-builder` are in `.claude/skills/`, and `frontend-design` comes from the project-scoped plugin. |
| `Shopify/shopify-ai-toolkit` `skills/shopify` (official) | Its frontmatter registers a PostToolUse **hook** that posts telemetry to `shopify.dev/mcp/usage`, and it tells the agent to send the user's prompt (base64) with every validation call. That's prompt data leaving the session, plus shopify.dev is blocked here anyway. The custom `shopify-development` skill covers Shopify instead. |
| `Shopify/agent-skills` | The per-area skills there are marked deprecated in the toolkit repo. |
| `getsentry/skills` `commit` | **Conflicts with repo conventions.** It says to use it "for every request to commit" and enforces `type(scope):` conventional commits, while this repo uses plain descriptive sentences. (The scanner's load-time-command flag on it was a false positive.) `git-version-control` covers this instead. |
| `Automattic/agent-skills` | Duplicates the WordPress org repo's skills (same names). The `WordPress/agent-skills` copy was chosen because it's more complete. |
| `anthropics/claude-plugins-official` playwright plugin | It duplicates the repo's `playwright-local` MCP server, and its default `chrome` channel isn't installed in this sandbox. |

## Project-scoped plugins (`.claude/settings.json`)

Installed from `anthropics/claude-plugins-official` with `--scope project`. Anyone who opens the repo in Claude Code is offered the same set.

- `frontend-design`: one SKILL.md of anti-slop design guidance. No code.
- `security-guidance`: runs hooks. At SessionStart it creates `~/.claude/security/agent-sdk-venv` and pip-installs the Claude Agent SDK. On Edit/Write it runs regex pattern warnings. On Stop and on git commit/push it **sends the diff to the Claude API for review**, which uses your API/subscription quota. Kill switch: `SECURITY_GUIDANCE_DISABLE=1`. Per-layer switches are listed in its README.
- `typescript-lsp`: needs `typescript-language-server` on PATH (`npm i -g typescript-language-server typescript`).
