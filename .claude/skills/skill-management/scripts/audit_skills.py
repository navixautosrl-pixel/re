#!/usr/bin/env python3
"""Audit a Claude Code skill library: format, duplicates, conflicts, broken references, budget.

Checks, for every .claude/skills/<dir>/SKILL.md (and optionally plugin skills):
  FORMAT     YAML frontmatter parses; name == dir; name ≤ 64 chars, lowercase-hyphen;
             description present, ≤ 1024 chars; unknown keys reported (Claude Code also
             accepts argument-hint, allowed-tools, disable-model-invocation, hooks …)
  DUPLICATE  same `name` twice (project vs plugin skills too)
  OVERLAP    description pairs with high word overlap (possible duplicate skills)
  REFS       relative markdown links / paths to files that don't exist;
             `backticked-skill-names` that look like skills but aren't installed
  RISK       hooks in frontmatter, `!` load-time command syntax, scripts present
  BUDGET     total listing size vs Claude Code's skill-listing budget
             (default 1% of context window × 4 chars/token)

Usage: python3 audit_skills.py [.claude/skills] [--plugins] [--context 200000] [--json out.json]
Exit 1 if any ERROR.
"""
from __future__ import annotations

import argparse
import itertools
import json
import os
import re
import sys
from pathlib import Path

import yaml

KNOWN_KEYS = {"name", "description", "license", "allowed-tools", "metadata", "compatibility",
              "argument-hint", "disable-model-invocation", "user-invocable", "model", "hooks", "context", "agent"}
STOP = set("a an and are as at be by for from in into is it of on or the to use used using when with your you this that skill skills".split())


def parse(path: Path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.S)
    if not m:
        return None, text, "no YAML frontmatter"
    try:
        fm = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as e:
        return None, m.group(2), f"invalid YAML: {str(e).splitlines()[0]}"
    return fm, m.group(2), None


def words(s: str) -> set[str]:
    return {w for w in re.findall(r"[a-z][a-z0-9+.-]{2,}", s.lower()) if w not in STOP}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("root", nargs="?", default=".claude/skills")
    ap.add_argument("--plugins", action="store_true", help="also index installed plugin skills for name collisions")
    ap.add_argument("--context", type=int, default=200_000, help="context window in tokens for the budget estimate")
    ap.add_argument("--budget-fraction", type=float, default=None, help="override; default reads .claude/settings.json or 0.01")
    ap.add_argument("--overlap", type=float, default=0.3, help="Jaccard threshold for OVERLAP warnings")
    ap.add_argument("--json")
    a = ap.parse_args()

    root = Path(a.root)
    findings: list[tuple[str, str, str]] = []  # (level, skill, message)
    skills: dict[str, dict] = {}

    for d in sorted(p for p in root.iterdir() if p.is_dir()):
        sk = d / "SKILL.md"
        if not sk.exists():
            findings.append(("WARN", d.name, "directory without SKILL.md"))
            continue
        fm, body, err = parse(sk)
        if err:
            findings.append(("ERROR", d.name, err))
            continue
        name, desc = str(fm.get("name", "")), str(fm.get("description", "") or "")
        if name != d.name:
            findings.append(("ERROR", d.name, f"name '{name}' != directory '{d.name}'"))
        if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", name) or len(name) > 64:
            findings.append(("ERROR", d.name, "name must be lowercase-hyphen, ≤ 64 chars"))
        if not desc.strip():
            findings.append(("ERROR", d.name, "missing description"))
        elif len(desc) > 1024:
            findings.append(("ERROR", d.name, f"description {len(desc)} chars > 1024"))
        unknown = set(fm) - KNOWN_KEYS
        if unknown:
            findings.append(("WARN", d.name, f"unknown frontmatter keys: {sorted(unknown)}"))
        if "hooks" in fm:
            findings.append(("RISK", d.name, "defines hooks (commands run automatically) — review before trusting"))
        if re.search(r"(?m)^!`[^`]+`", body):
            findings.append(("RISK", d.name, "uses !`cmd` load-time command execution"))
        scripts = [p for p in d.rglob("*") if p.suffix in {".sh", ".py", ".mjs", ".js", ".ps1"}]
        # relative links/paths
        for f in d.rglob("*.md"):
            txt = f.read_text(encoding="utf-8", errors="ignore")
            for link in re.findall(r"\]\((?![a-z][a-z0-9+.-]*:|#)([^)\s]+)\)", txt):  # skip any URL scheme
                target = (f.parent / link.split("#")[0]).resolve()
                if link.split("#")[0] and not target.exists():
                    # SKILL.md is what Claude reads; companion docs (AGENTS.md, references) are secondary
                    lvl = "ERROR" if f.name == "SKILL.md" else "WARN"
                    findings.append((lvl, d.name, f"broken link in {f.relative_to(root)}: {link}"))
        skills[name or d.name] = {"dir": str(d), "desc": desc, "words": words(desc), "body": body, "scripts": len(scripts), "source": "project"}

    # plugin skills (name collisions only)
    plugin_names: dict[str, str] = {}
    if a.plugins:
        for base in [Path.home() / ".claude/plugins"]:
            for sk in base.rglob("skills/*/SKILL.md"):
                fm, _, err = parse(sk)
                if fm and fm.get("name"):
                    plugin_names[str(fm["name"])] = str(sk)
        for n in sorted(set(plugin_names) & set(skills)):
            findings.append(("WARN", n, f"same name as plugin skill {plugin_names[n]} (plugin skills are namespaced, but triggering may be ambiguous)"))

    # mentions of non-installed skills: `foo-bar` patterns that look like skill names referenced as skills
    known = set(skills) | set(plugin_names)
    for n, s in skills.items():
        for ref in set(re.findall(r"`([a-z0-9]+(?:-[a-z0-9]+)+)`(?:\s*(?:skill|→|\)|,|;))", s["body"])):
            if ref not in known and ref.startswith(("wp-", "gsap-", "vercel-", "sanity-", "stripe-", "supabase-", "web-", "site-")):
                findings.append(("INFO", n, f"references `{ref}` which is not installed"))

    # overlap between descriptions
    for (n1, s1), (n2, s2) in itertools.combinations(skills.items(), 2):
        if not s1["words"] or not s2["words"]:
            continue
        j = len(s1["words"] & s2["words"]) / len(s1["words"] | s2["words"])
        if j >= a.overlap:
            findings.append(("OVERLAP", f"{n1} ~ {n2}", f"description word overlap {j:.2f} — confirm they have distinct jobs"))

    # budget
    frac = a.budget_fraction
    if frac is None:
        try:
            frac = json.load(open(".claude/settings.json")).get("skillListingBudgetFraction", 0.01)
        except Exception:
            frac = 0.01
    listing = sum(len(n) + len(s["desc"]) + 4 for n, s in skills.items())
    budget = int(a.context * 4 * frac)
    level = "WARN" if listing > budget else "INFO"
    findings.append((level, "(listing)", f"{len(skills)} skills, ~{listing:,} chars of name+description vs budget {budget:,} "
                     f"({frac:g} × {a.context:,} tokens × 4){' — descriptions will be shortened; raise skillListingBudgetFraction or trim' if listing > budget else ''}"))

    order = {"ERROR": 0, "RISK": 1, "WARN": 2, "OVERLAP": 3, "INFO": 4}
    for lvl, who, msg in sorted(findings, key=lambda f: (order[f[0]], f[1])):
        print(f"{lvl:8} {who}: {msg}")
    counts = {k: sum(1 for f in findings if f[0] == k) for k in order}
    print("\nsummary:", counts, f"| skills with scripts: {sum(1 for s in skills.values() if s['scripts'])}")
    if a.json:
        json.dump([{"level": l, "skill": w, "message": m} for l, w, m in findings], open(a.json, "w"), indent=2)
    return 1 if counts["ERROR"] else 0


if __name__ == "__main__":
    sys.exit(main())
