---
name: git-version-control
description: Git workflow for this repo — inspect before changing, branch per task, small descriptive commits in the repo's own style, safe merge-conflict resolution, never rewriting shared history, recovering lost work, and keeping secrets and build output out of commits. Use for any commit, branch, merge, rebase, revert, or "I lost my changes" situation.
---

# Git version control

## Purpose

A history that explains itself and never loses anyone's work.

## When to activate

Before committing, branching, merging, resolving conflicts, reverting, or anything that could discard work.

## Repo conventions (observed in `git log`)

- **Commit subject**: plain imperative sentence that says what changed *and why*, no `feat:` prefixes — e.g. "Send the contact form to WhatsApp, start the chat on load, stop the cookie banner stealing clicks".
- **Body**: what was wrong before, what changed, how it was verified. Wrap ~72–100 cols.
- **Trailers**: when Claude authors, end with the `Co-Authored-By` / `Claude-Session` lines the session provides.
- One logical change per commit (a vendored skill set, a feature, a fix) — not "update files".
- (Don't import external "conventional commit" skills here — they conflict with this style; see `skill-management` conflict notes.)

## Procedure

1. **Inspect first**: `git status`, `git branch --show-current`, `git log --oneline -10`, `git diff --stat`. Never start destructive work on a dirty tree without understanding it.
2. **Branch**: work on the designated feature branch; never commit directly to `main` unless told to.
3. **Stage deliberately**: `git add <paths>` (not `git add -A` blindly); review `git diff --cached`.
4. **Pre-commit checks**: build/lint/tests for the touched project; `git diff --cached | grep -nE "sk_live|sk_test|PRIVATE KEY|service_role|password="` → nothing.
5. **Commit**: `git commit -m "Subject" -m "Body…"` (separate `-m` per paragraph; no interactive editor).
6. **Sync**: `git fetch origin <branch>`; integrate with `git merge origin/<branch>` on shared branches (merge commits keep others' checkouts valid). Rebase only branches nobody else has pulled.
7. **Push**: `git push -u origin <branch>`; on network failure retry with backoff (2s, 4s, 8s, 16s).
8. **Conflicts**: read both sides; keep behavior from both where possible; regenerate lockfiles (`npm install`) instead of hand-merging them; build + test before committing the merge.
9. **Undo safely**:
   - unstaged change: `git restore <file>` (destructive — confirm first)
   - last commit not pushed: `git reset --soft HEAD~1`
   - pushed commit: `git revert <sha>` (never force-push shared branches)
   - "lost" commits: `git reflog` → `git branch rescue <sha>`
10. **Large/binary files**: don't commit build output (`out/`, `.next/`, `node_modules/`), delivery zips, raw uploads; check `.gitignore` covers them (`git status --short --ignored`).

## Failure prevention

- `git push --force` on a shared branch, `git reset --hard` / `git clean -fd` without looking → lost work. Always `git status` + `git stash` first.
- Committing `.env*` → rotate the secret, don't just delete the file (it stays in history).
- Giant mixed commits → impossible to revert one part.

## Verification checklist

- [ ] `git status` clean after commit; `git log -1 --stat` shows only intended files.
- [ ] Branch pushed and tracking: `git status -sb` shows `...origin/<branch>` with no ahead/behind.
- [ ] No secrets or build output in `git show --stat HEAD`.
