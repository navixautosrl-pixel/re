#!/usr/bin/env bash
# One-shot, read-only inventory of what this environment can actually do.
# Prints runtimes, CLIs, browsers, network reachability of key hosts, Claude Code
# skills/plugins/MCP config, and disk. Safe to run any time; changes nothing.
# Usage: bash .claude/skills/project-environment-audit/scripts/env_audit.sh [repo-root]
set -uo pipefail
ROOT="${1:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$ROOT" || exit 2

ver() { command -v "$1" >/dev/null 2>&1 && { "$@" 2>&1 | head -1; } || echo "missing"; }
row() { printf "  %-22s %s\n" "$1" "$2"; }

echo "## Runtimes & CLIs"
row node "$(ver node -v)"; row npm "$(ver npm -v)"; row pnpm "$(ver pnpm -v)"; row bun "$(ver bun -v)"
row python3 "$(ver python3 --version)"; row php "$(ver php -r 'echo PHP_VERSION;')"; row composer "$(command -v composer >/dev/null && (composer --version 2>/dev/null | grep -m1 "^Composer") || echo missing)"
row wp-cli "$( (command -v wp >/dev/null || [ -x ~/.local/bin/wp ]) && (wp --version --allow-root 2>/dev/null || ~/.local/bin/wp --version --allow-root) || echo missing)"
row git "$(ver git --version)"; row ffmpeg "$(ver ffmpeg -version | cut -c1-30)"; row jq "$(ver jq --version)"
row docker "$(command -v docker >/dev/null && (docker info >/dev/null 2>&1 && echo 'daemon up' || echo 'cli only, daemon down') || echo missing)"
row claude "$(ver claude --version)"; row gh "$(ver gh --version)"

echo "## Browsers"
for b in /opt/pw-browsers/*/; do row "$(basename "$b")" "present"; done 2>/dev/null
row playwright-pkg "$(node -p "require('$ROOT/node_modules/playwright/package.json').version" 2>/dev/null || echo 'not installed (npm install at repo root)')"
row firefox/webkit "$(ls -d /opt/pw-browsers/firefox* /opt/pw-browsers/webkit* 2>/dev/null | wc -l | sed 's/^0$/not installed/')"

echo "## Network (HTTP status; 000 = blocked/unreachable)"
for h in registry.npmjs.org github.com pypi.org fonts.googleapis.com vercel.com api.vercel.com mcp.supabase.com mcp.stripe.com api.sanity.io shopify.dev wordpress.org developers.google.com pagespeedonline.googleapis.com; do
  row "$h" "$(curl -s -o /dev/null -m 6 -w '%{http_code}' "https://$h" 2>/dev/null)"
done

echo "## Claude Code configuration"
row "project skills" "$(ls -d .claude/skills/*/ 2>/dev/null | wc -l) dirs in .claude/skills"
row "agents" "$(ls .claude/agents/*.md 2>/dev/null | wc -l) in .claude/agents"
row "settings.json" "$( [ -f .claude/settings.json ] && python3 -c "import json;d=json.load(open('.claude/settings.json'));print('plugins:',','.join(k.split('@')[0] for k,v in d.get('enabledPlugins',{}).items() if v),'| skillListingBudgetFraction:',d.get('skillListingBudgetFraction','default 0.01'))" || echo missing)"
row ".mcp.json servers" "$( [ -f .mcp.json ] && python3 -c "import json;print(', '.join(json.load(open('.mcp.json'))['mcpServers']))" || echo none)"
for s in $( [ -f .mcp.json ] && python3 -c "import json;[print(v.get('command','')) for v in json.load(open('.mcp.json'))['mcpServers'].values() if v.get('command','').startswith('./')]" ); do
  row "  local MCP bin" "$s $( [ -x "$s" ] && echo ok || echo 'MISSING (run npm install)')"
done
command -v claude >/dev/null && { echo "  installed plugins:"; claude plugin list 2>/dev/null | grep -E "^\s+>" | sed 's/^/    /'; }

echo "## Disk"
df -h "$ROOT" 2>/dev/null | tail -1 | awk '{print "  used "$3" of "$2" ("$5"), avail "$4}'
echo
echo "Read-only audit. Blocked hosts mean integrations needing them (deploys, MCP OAuth, CMS APIs) can be coded but not tested here."
