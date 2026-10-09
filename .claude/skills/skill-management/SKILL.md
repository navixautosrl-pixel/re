---
name: skill-management
description: "Discovering, vetting, installing, verifying and de-conflicting Claude Code skills — official vendor repos first, security review (skill-scanner + manual read), vendoring pinned snapshots with provenance, writing custom SKILL.md files, the audit script (format, duplicates, overlap, broken refs, hooks, listing budget), and conflict resolution. Use whenever skills are added, updated, or audited."
---

# Skill management (discovery · installation · verification · conflicts)

## Purpose

A skill library that is trustworthy, non-redundant, valid, and actually visible to the
model — with every third-party skill traceable to a reviewed commit.

## When to activate

Adding or updating skills; "install skills for X"; periodic library audit; a skill isn't triggering; two skills give conflicting instructions.

## 1. Discovery (official sources first)

1. Check what's installed: `ls .claude/skills`, `claude plugin list`, the session's skill listing.
2. Vendor repos (probe with `git ls-remote https://github.com/<org>/<repo> HEAD`), verified to exist on 2026-10-09: `anthropics/skills`, `anthropics/claude-plugins-official`, `vercel-labs/agent-skills`, `greensock/gsap-skills`, `WordPress/agent-skills`, `Automattic/agent-skills`, `Shopify/shopify-ai-toolkit`, `sanity-io/agent-toolkit`, `stripe/ai`, `supabase/agent-skills`, `getsentry/skills`, `ChromeDevTools/chrome-devtools-mcp` (skills/), `addyosmani/web-quality-skills`.
3. Prefer the vendor of the technology (GreenSock for GSAP, Stripe for Stripe…) over community collections.

## 2. Vetting (every candidate, before copying)

1. `git clone --depth 1` into the scratchpad; record the commit SHA and licence.
2. Automated scan: `python3 -I .claude/skills/skill-scanner/scripts/scan_skill.py <dir>` (Sentry's scanner; needs PyYAML, present). Expect false positives on security-tool skills themselves.
3. Manual review — read SKILL.md fully; grep scripts for `fetch(|https?://|child_process|spawn|exec|subprocess|requests|socket|writeFile|rm -rf`; check frontmatter for `hooks:` and bodies for `` !`cmd` `` load-time execution.
4. Reject when: it fetches mutable remote instructions at runtime (Vercel `web-design-guidelines`), sends prompts/telemetry to third parties (Shopify AI Toolkit `shopify` skill: PostToolUse hook + prompt upload), requires credentials it doesn't need, or **conflicts with repo conventions** (Sentry `commit` skill: "use for every commit" + conventional-commit format ≠ this repo's style).
5. Check cross-references to skills you won't install (record them).

## 3. Installation

- Project scope (versioned, shared): `cp -r <skill> .claude/skills/<name>`; keep `name:` == directory; copy the licence as `LICENSE.txt`; rename on collision (and fix relative links) — record every local change.
- Plugins (bundles with hooks/MCP/agents): `claude plugin marketplace add <owner/repo> --scope project` + `claude plugin install <plugin>@<marketplace> --scope project` → lands in `.claude/settings.json` `enabledPlugins`.
- Update `.claude/THIRD_PARTY_SKILLS.md` (source, SHA, licence, local changes, rejected candidates and why).
- Skills appear in the live session immediately (watch for the system skill-list update) — that is the first proof of discovery.

## 4. Creating custom skills

Use when no trustworthy skill exists. Frontmatter: `name` (lowercase-hyphen = dir), `description` (what + when, ≤ ~300 chars — every char counts against the listing budget; **quote it** if it contains `: `). Body: purpose, when to activate, procedure with real commands/code verified against installed versions, best practices, failure prevention, verification checklist, external dependencies. Bundle scripts in `scripts/` and test them on a real project before claiming they work.

## 5. Verification (run after every change)

```bash
python3 -I .claude/skills/skill-management/scripts/audit_skills.py .claude/skills --plugins
python3 -I <anthropics/skills>/skills/skill-creator/scripts/quick_validate.py .claude/skills/<name>   # strict Agent Skills spec
```
The audit checks YAML validity, name/dir match, lengths, unknown keys, hooks / `!cmd` risk, broken relative links (ERROR in SKILL.md, WARN in companion docs), references to non-installed skills, description overlap (word Jaccard ≥ 0.3 — semantic duplicates still need a human read), name collisions with plugin skills, and the **listing budget**.

## 6. Listing budget (verified in the Claude Code 2.1.295 binary)

Claude Code reserves `skillListingBudgetFraction` (default **0.01**) of the context window × 4 chars for skill names+descriptions; beyond that, descriptions are shortened. Per-skill cap `skillListingMaxDescChars` (default 1536). With ~100 skills (~40k chars) the default 200k-token budget (8k chars) is far exceeded → set `"skillListingBudgetFraction": 0.05` in `.claude/settings.json` (costs ~10k tokens/turn) or reduce/shorten skills. Changing settings is a configuration change the user must approve.

## 7. Conflicts

Resolve by precedence: user instructions > CLAUDE.md > project skills > plugins. When two skills overlap, narrow their descriptions so each states its scope ("for the app-builder stack" vs "for marketing sites") and cross-link them; delete true duplicates.

## Verification checklist

- [ ] Audit: 0 ERROR; every WARN understood and recorded.
- [ ] Every vendored skill listed in THIRD_PARTY_SKILLS.md with SHA + licence.
- [ ] New skills visible in the session listing.
- [ ] Bundled scripts executed successfully at least once (evidence in the report).
