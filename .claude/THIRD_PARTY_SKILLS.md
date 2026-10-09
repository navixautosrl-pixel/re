# Third-party skills vendored in `.claude/skills/`

Snapshots are pinned to a reviewed commit and checked into the repo, so they can't change under us.
To update one: clone the upstream repo, diff it against the copy here, review the changes the same way (look for scripts, network fetches, credential requests and install steps), then copy it over and update the commit hash below.

| Skill dir | Upstream | Commit reviewed | License | Local changes |
|---|---|---|---|---|
| `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-react`, `gsap-plugins`, `gsap-utils`, `gsap-performance` | github.com/greensock/gsap-skills (official, GreenSock) | `aed9cfd3277740755f6bfc1155c7aa645403b760` | MIT (`LICENSE.txt` in each dir) | `gsap-scrolltrigger`: the horizontal-scroll example was broken (`Max.max` typo, a pixel value fed to `xPercent`, `scrub` missing). Fixed and marked `[local patch]`. `gsap-frameworks` (Vue/Svelte) not vendored, since this repo uses React. |
| `accessibility`, `core-web-vitals`, `web-quality-audit` | github.com/addyosmani/web-quality-skills (self-described as unofficial, by Addy Osmani) | `afa8da942115f2961fdbfa80807ea0b232ff6c00` | MIT | none |
| `technical-seo` (upstream `seo`), `web-performance` (upstream `performance`), `web-best-practices` (upstream `best-practices`) | same | same | MIT | Renamed (`name:` field and directory) so they don't collide with this repo's app-builder `seo`/`performance` skills. Relative `../seo/`, `../performance/` and `../best-practices/` links updated to match. |
| `vercel-react-best-practices` (upstream dir `react-best-practices`) | github.com/vercel-labs/agent-skills | `063bee94c3f4df8453406c830b0a7df0f2860278` | MIT (declared in the skill's frontmatter; the repo itself has no LICENSE file) | Directory renamed to match its `name:` field. |

## Reviewed and deliberately not vendored

| Candidate | Why not |
|---|---|
| `vercel-labs/agent-skills/web-design-guidelines` | On every run it fetches its rules from `raw.githubusercontent.com/.../main/command.md`, so its instructions are mutable remote content we can't pin or review. |
| `vercel-labs/agent-skills/deploy-to-vercel`, `vercel-cli-with-tokens` | They ship shell scripts plus a zip, and need a Vercel token. vercel.com is blocked by this sandbox's network policy anyway. `production-deployment` covers Vercel with OAuth/MCP instead. |
| `anthropics/skills` frontend-design / webapp-testing / web-artifacts-builder | Already present: `webapp-testing` and `web-artifacts-builder` are in `.claude/skills/`, and `frontend-design` comes from the project-scoped plugin. |
| `anthropics/claude-plugins-official` playwright plugin | It duplicates the repo's `playwright-local` MCP server, and its default `chrome` channel isn't installed in this sandbox. |

## Project-scoped plugins (`.claude/settings.json`)

Installed from `anthropics/claude-plugins-official` with `--scope project`. Anyone who opens the repo in Claude Code is offered the same set.

- `frontend-design`: one SKILL.md of anti-slop design guidance. No code.
- `security-guidance`: runs hooks. At SessionStart it creates `~/.claude/security/agent-sdk-venv` and pip-installs the Claude Agent SDK. On Edit/Write it runs regex pattern warnings. On Stop and on git commit/push it **sends the diff to the Claude API for review**, which uses your API/subscription quota. Kill switch: `SECURITY_GUIDANCE_DISABLE=1`. Per-layer switches are listed in its README.
- `typescript-lsp`: needs `typescript-language-server` on PATH (`npm i -g typescript-language-server typescript`).
