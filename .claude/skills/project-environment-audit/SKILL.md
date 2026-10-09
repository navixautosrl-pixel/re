---
name: project-environment-audit
description: Inspecting the real environment before planning work — bundled env_audit.sh (runtimes, CLIs, browsers, network reachability, skills/plugins/MCP status, disk), plus project inspection (framework, scripts, git state, deploy target) and an honest can/can't summary. Use at the start of a session, a new project, or when a tool unexpectedly fails.
---

# Project & environment audit

## Purpose

Base every plan on what this machine can actually do today — not on what a previous
session, a README, or memory says.

## When to activate

Session start on a new task; "what can you do?"; before promising a deploy/integration; after a tool fails (blocked host, missing binary).

## Procedure

1. **Environment** (read-only, ~30 s):
   ```bash
   bash .claude/skills/project-environment-audit/scripts/env_audit.sh
   ```
   Reports: node/npm/pnpm/bun/python/php/composer/wp-cli/git/ffmpeg/jq/docker/claude/gh versions, Playwright browsers, HTTP reachability of key hosts (npm, GitHub, Vercel, Supabase/Stripe MCP, Sanity, Shopify, WordPress.org, Google dev), project skills count, enabled plugins, `skillListingBudgetFraction`, `.mcp.json` servers and whether local MCP binaries exist, disk.
2. **Project** (for the site you'll touch):
   ```bash
   git status -sb && git log --oneline -5
   cat <site>/package.json | head -40          # framework, versions, scripts
   ls <site>; cat <site>/next.config.* 2>/dev/null; ls <site>/node_modules >/dev/null 2>&1 || echo "deps not installed"
   ```
   Identify: framework + version, build/lint/test commands, output mode (static export?), base path, existing tests, deploy target (README/UPLOAD.md), environment variables (`.env.example`).
3. **MCP reality check**: servers listed in `.mcp.json` only load at session start; a server can be configured but failed (proxy 403) — the session's system notes list failed servers. Local MCPs need `npm install` at the repo root first.
4. **Summarize** for the user in two lists: *can execute now* / *needs X (exact action)*. Never claim a capability you didn't just observe.

## Facts observed on 2026-10-09 (re-run the script; these change)

- Present: Node 22, npm 10, pnpm 10, bun 1.4, Python 3.13, PHP 8.3 (+pdo_sqlite, mysqli), Composer 2.8, git, ffmpeg 6.1 (x264, vp9, av1), jq, gh, Chromium 1194; WP-CLI installable to `~/.local/bin` (checksum-verified phar).
- Missing/blocked: Firefox/WebKit browsers; Docker daemon; network to vercel.com, mcp.supabase.com, mcp.stripe.com, api.sanity.io, shopify.dev, wordpress.org, developers.google.com.
- Containers are ephemeral: tools installed outside the repo (`~/.local/bin`, global npm) disappear with the session.

## Failure prevention

- Planning a Vercel deploy without checking the host is reachable.
- Concluding "not installed" without `which`/`--version` (this happened with PHP — it was installed).
- Running `playwright install` here (browser downloads are disabled; use `/opt/pw-browsers`).

## Verification checklist

- [ ] Script output captured in the session (or summarized with exact values).
- [ ] Every capability claimed to the user maps to a line of that output or a test you ran.
- [ ] Blocked items listed with the exact unblock action (network policy, credential, OAuth, install).
