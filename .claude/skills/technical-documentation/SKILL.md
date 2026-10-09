---
name: technical-documentation
description: Documentation for website projects — project README (stack, commands, env vars, deploy), client handover/editor guides, decision records, runbooks, changelogs and delivery reports; written for the actual reader, kept next to the code, and verified by following it. Use at delivery, when adding config or integrations, or when a project lacks a README.
---

# Technical documentation

## Purpose

The next person (a developer, the client's editor, or Claude in a fresh session) can run,
change, deploy, and recover the site without asking.

## When to activate

Every delivered project; new env vars/integrations; after incidents; client handover.

## Documents and their readers

| Doc | Reader | Must contain |
|---|---|---|
| `README.md` (per site) | developers / Claude | what it is, stack + versions, `npm` commands, env vars table, build for subpath, deploy steps, QA commands, known gotchas (pattern: `skill-atelier/README.md`) |
| `.env.example` | developers | every variable, comment with purpose + where to get it, no real values |
| Editor guide (`docs/editare.md`, RO) | client staff | how to change texts/prices/images in the CMS, with screenshots; what not to touch |
| Handover note | client owner | live URL, hosting/domain/DNS ownership, accounts created and who owns them, monthly tasks, support contact |
| Decision record (`docs/decisions/NNN-title.md`) | future maintainers | context, decision, alternatives, consequences (e.g. "static export instead of Vercel server") |
| Runbook | whoever is on call | alerts → checks → rollback (see `monitoring-logging`, `production-deployment`) |
| Delivery report | user/client | per `site-builder` template — implemented/tested/limitations with evidence |

## Procedure

1. Write while building (commands are copied from what actually ran).
2. Lead with the task the reader came to do; use numbered steps and copy-pasteable commands.
3. Facts, not adjectives: versions, paths, URLs, owners, dates.
4. Mark anything unverified or pending explicitly (e.g. "not deployed; SITE_URL must be set before publishing").
5. Keep docs next to the code (same repo, same PR as the change); link rather than duplicate.
6. Romanian for client-facing docs (or the client's language); English OK for developer docs in this repo.

## Failure prevention

- READMEs listing commands that no longer exist (scaffold leftovers like "Create Next App" boilerplate — replace them).
- Secrets pasted into docs.
- Docs describing intended behavior that was never implemented.

## Verification checklist

- [ ] Follow the README from a clean clone: install → build → QA → (dry-run) deploy works as written.
- [ ] Every env var used in code (`grep -RhoE "process\.env\.[A-Z_]+" src | sort -u`) appears in `.env.example` and the README.
- [ ] No secrets: `grep -RniE "sk_live|password=|token=" docs README.md` → nothing.
- [ ] Editor guide tested by doing one real edit following it.
