#!/usr/bin/env python3
"""Generate .claude/SKILLS_INVENTORY.md: the 91 requested capability areas → status + real paths.

Every referenced skill must exist as .claude/skills/<name>/SKILL.md (or be a project plugin);
the script fails loudly otherwise, so the inventory can't claim a skill that isn't there.
Statuses:
  VERIFIED_INSTALLED                 third-party skill vendored, reviewed, validated, visible
  CUSTOM_SKILL_CREATED_AND_VALIDATED written for this repo, validated (and scripts run, where present)
  COVERED_BY_VERIFIED_EXISTING_SKILL an existing validated skill covers it (no duplicate created)
  REQUIRES_EXTERNAL_TOOL             guidance installed, but doing the work needs something missing here
  NOT_AVAILABLE                      nothing usable
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]  # scripts → skill-management → skills → .claude → repo
SK = ROOT / ".claude/skills"
PLUGINS = {"frontend-design (plugin)", "security-guidance (plugin)"}

V, C, COV, EXT = "VERIFIED_INSTALLED", "CUSTOM_SKILL_CREATED_AND_VALIDATED", "COVERED_BY_VERIFIED_EXISTING_SKILL", "REQUIRES_EXTERNAL_TOOL"

# (n, requested name, status, [skills], evidence / missing dependency)
ROWS = [
  # 1 — core website
  (1, "premium-web-design", COV, ["creative-direction", "premium-typography", "ui-ux-pro-max", "site-builder", "frontend-design (plugin)"], "Applied end-to-end on contact-sheet/ (original art direction, screenshot critique loop)."),
  (2, "ui-ux-design", COV, ["ui-ux-pro-max", "micro-interactions", "conversion-optimization"], "—"),
  (3, "design-systems", COV, ["design-system", "ui-styling"], "Pre-existing skills (validated)."),
  (4, "responsive-web-design", COV, ["modern-css-layout", "site-qa-playwright"], "site_qa.mjs: 0 overflow at 320–1920px on contact-sheet (10 pages)."),
  (5, "html-css-javascript", C, ["html-css-javascript"], "Patterns from website-v2/; QA script ran on website-v2."),
  (6, "typescript", C, ["typescript"], "zod 4 API (`z.flattenError`, `z.literal` messages) verified by running it."),
  (7, "react-development", C, ["react-development", "vercel-react-best-practices", "vercel-composition-patterns"], "useSyncExternalStore hydration pattern used and lint-clean in both demos."),
  (8, "nextjs-development", COV, ["nextjs-site-architecture", "app-builder", "frontend-design"], "Extended with routing/rendering strategies; Next 16.4 static export + generateStaticParams built (contact-sheet: 14 static routes)."),
  (9, "modern-css", COV, ["modern-css-layout"], "—"),
  (10, "frontend-architecture", COV, ["nextjs-site-architecture", "vercel-composition-patterns", "react-development"], "—"),
  (11, "gsap-animation", V, ["gsap-core", "gsap-timeline", "gsap-scrolltrigger", "gsap-react", "gsap-plugins", "gsap-utils", "gsap-performance"], "Official GreenSock skills; ScrollTrigger pin/scrub verified mid-scroll by Playwright on both demos."),
  (12, "motion-for-react", C, ["motion-react"], "LazyMotion/MotionConfig used in skill-atelier (TBT 420→~140ms)."),
  (13, "technical-seo", V, ["technical-seo", "seo"], "Lighthouse SEO 100 with indexing enabled (skill-atelier)."),
  (14, "on-page-seo", C, ["on-page-seo-content"], "—"),
  (15, "structured-data", C, ["structured-data"], "validate_jsonld.mjs: 0 errors / 0 warnings on contact-sheet (13 files)."),
  (16, "seo-content-strategy", COV, ["on-page-seo-content"], "Extended with pillar/cluster + editorial calendar section."),
  (17, "web-performance", V, ["web-performance", "core-web-vitals", "performance"], "Lab-measured on both demos (medians reported)."),
  (18, "web-accessibility", V, ["accessibility", "a11y-debugging"], "axe (WCAG 2.2 AA tags) 0 violations on contact-sheet, 10 pages."),
  (19, "playwright-testing", C, ["site-qa-playwright", "visual-regression-testing", "webapp-testing", "browser-qa"], "contact-sheet: 21 Playwright tests pass (1 skipped by design)."),
  (20, "git-version-control", C, ["git-version-control"], "Encodes this repo's observed commit style."),
  (21, "debugging", COV, ["debugging"], "Extended with front-end failure patterns found in this repo."),
  (22, "production-builds", COV, ["production-deployment", "nextjs-site-architecture"], "4 existing Next sites + 2 demos built clean."),
  (23, "web-security", COV, ["security", "web-best-practices", "security-guidance (plugin)"], "—"),
  (24, "conversion-optimization", C, ["conversion-optimization"], "—"),
  (25, "website-copywriting", C, ["website-copywriting"], "—"),
  (26, "deployment", EXT, ["production-deployment"], "Needs hosting credentials (cPanel/SFTP) or Vercel access; vercel.com is blocked by this sandbox's network policy."),
  # 2 — premium design & animation
  (27, "creative-direction", C, ["creative-direction"], "Extended with image art direction."),
  (28, "premium-typography", C, ["premium-typography"], "Subsetting recipe run (131KB→47KB); font CLS 0.236→0 measured."),
  (29, "advanced-layouts", COV, ["modern-css-layout"], "Extended with editorial grid, subgrid, bento, overlap, sticky split."),
  (30, "scroll-storytelling", C, ["scroll-storytelling"], "Pinned film strip verified mid-scroll (contact-sheet)."),
  (31, "svg-motion", COV, ["interactive-visuals", "gsap-plugins"], "Grease-pencil stroke draw implemented in contact-sheet hero."),
  (32, "cinematic-web-animation", COV, ["scroll-storytelling", "gsap-timeline", "reduced-motion-accessibility"], "Plus CLAUDE.md Motion standard."),
  (33, "micro-interactions", C, ["micro-interactions"], "Loupe dialog focus return verified by Playwright."),
  (34, "page-transitions", C, ["page-transitions", "vercel-react-view-transitions"], "React ViewTransition morph: startViewTransition called on navigation (test)."),
  (35, "threejs-webgl", C, ["threejs-webgl"], "APIs checked against three 0.186 / R3F 9.8 / drei 10.7 on npm; no 3D scene built (not justified by the demo brief)."),
  (36, "react-three-fiber", COV, ["threejs-webgl"], "R3F covered inside threejs-webgl."),
  (37, "rive-interactive-animation", C, ["rive-interactive-animation"], "Hook/class exports verified in @rive-app/react-canvas 4.36 .d.ts; no .riv asset available to run."),
  (38, "lottie-animation", C, ["lottie-animation"], "Props verified in @lottiefiles/dotlottie-react 0.20 .d.ts; no .lottie asset available to run."),
  (39, "interactive-product-design", C, ["interactive-product-design"], "—"),
  (40, "creative-image-art-direction", COV, ["creative-direction"], "Image art-direction section added."),
  (41, "video-optimization", C, ["video-optimization"], "ffmpeg 6.1 present with libx264, libvpx-vp9, libaom-av1, libsvtav1."),
  (42, "mobile-motion-optimization", COV, ["reduced-motion-accessibility", "gsap-performance"], "GSAP lazy-loaded only ≥900px in contact-sheet."),
  (43, "reduced-motion-accessibility", C, ["reduced-motion-accessibility"], "Found a real bug: autospa-detailing-v2 hides its h1 under reduced motion (fix suggested as a separate task)."),
  # 3 — backend & e-commerce
  (44, "backend-development", EXT, ["app-builder", "api-integration", "security"], "Server code can be written/built; live Supabase is blocked (MCP 403) and no database runs here."),
  (45, "database-design", EXT, ["database", "supabase-postgres-best-practices"], "Needs a Supabase project/Postgres (none reachable here)."),
  (46, "authentication-authorization", EXT, ["auth"], "Needs Supabase Auth (blocked here)."),
  (47, "cms-integration", EXT, ["cms-integration", "content-modeling-best-practices", "sanity-best-practices"], "api.sanity.io blocked; needs a CMS project + tokens."),
  (48, "wordpress-development", EXT, ["wordpress-router", "wp-project-triage", "wp-block-themes", "wp-block-development", "wp-plugin-development", "wp-interactivity-api", "wp-performance", "wp-rest-api", "wp-wpcli-and-ops"], "Official skills installed; PHP 8.3 + WP-CLI 2.12 work, but wordpress.org is blocked so no WordPress core can be installed here."),
  (49, "shopify-development", EXT, ["shopify-development"], "Needs Shopify CLI + a (dev) store; shopify.dev blocked."),
  (50, "woocommerce-development", EXT, ["woocommerce-development"], "Needs a WordPress + WooCommerce install (wordpress.org blocked)."),
  (51, "ecommerce-optimization", COV, ["ecommerce-development", "conversion-optimization"], "—"),
  (52, "payment-integrations", EXT, ["ecommerce-development", "stripe-best-practices", "security"], "Needs Stripe test keys; Stripe MCP blocked (403)."),
  (53, "email-automation", EXT, ["email-automation"], "Needs an email provider account + DNS access."),
  (54, "form-validation", C, ["form-validation"], "Schema code verified with zod 4; real submission back-end depends on the host."),
  (55, "api-integration", C, ["api-integration"], "—"),
  (56, "webhook-development", COV, ["api-integration", "stripe-best-practices"], "Webhook receiver section (HMAC, replay, idempotency)."),
  # 4 — SEO & marketing
  (57, "analytics-ga4", EXT, ["analytics-tracking"], "Needs the client's GA4 Measurement ID."),
  (58, "google-tag-manager", EXT, ["analytics-tracking"], "GTM section added; needs a GTM container ID/access."),
  (59, "google-search-console", EXT, ["google-search-console"], "Needs owner access to a deployed site; Google hosts blocked here."),
  (60, "local-seo", C, ["local-seo"], "GBP changes need the owner's access."),
  (61, "international-seo", COV, ["technical-seo", "on-page-seo-content"], "—"),
  (62, "programmatic-seo", C, ["programmatic-seo"], "—"),
  (63, "content-migration", COV, ["website-migration"], "—"),
  (64, "a-b-testing", C, ["a-b-testing"], "sample_size.py matches the textbook value (10%→12%: 3,841/variant)."),
  (65, "sales-funnel-optimization", COV, ["conversion-optimization"], "—"),
  (66, "competitor-website-analysis", C, ["competitor-website-analysis"], "analyze_sites.mjs run on two local sites; 3 bugs in it found and fixed."),
  # 5 — accessibility, security, performance
  (67, "accessibility-auditing", COV, ["accessibility", "a11y-debugging", "site-qa-playwright", "web-quality-audit"], "axe via @axe-core/playwright in site_qa."),
  (68, "lighthouse-auditing", C, ["lighthouse-auditing"], "lh_runs.mjs: medians over 3 runs, simulated + devtools modes, on both demos."),
  (69, "cross-browser-testing", EXT, ["cross-browser-testing"], "Only Chromium is installed; Firefox/WebKit need `npx playwright install firefox webkit` on a machine/CI that allows browser downloads."),
  (70, "visual-regression-testing", C, ["visual-regression-testing"], "Baselines stable on rerun; a 1px letter-spacing change fails (3,420 px diff)."),
  (71, "security-auditing", COV, ["security", "web-best-practices", "skill-scanner", "gha-security-review", "security-guidance (plugin)"], "—"),
  (72, "dependency-auditing", C, ["dependency-auditing"], "npm query licence summary run (flagged LGPL libvips + GSAP licence on skill-atelier)."),
  (73, "gdpr-privacy", C, ["gdpr-privacy"], "privacy_audit.mjs: contact-sheet contacts 0 third parties; website-v2 loads Google Fonts pre-consent (fix suggested)."),
  (74, "image-optimization", C, ["image-optimization"], "optimize_images.mjs: 5.8MB of PNG captures → AVIF/WebP variants; Lighthouse image waste 100KB→17KB."),
  (75, "web-vitals-monitoring", EXT, ["web-vitals-monitoring"], "Needs a deployed site with real traffic (field data)."),
  (76, "monitoring-logging", EXT, ["monitoring-logging"], "Needs monitoring/error-tracking accounts and a deployed site."),
  # 6 — engineering & deployment
  (77, "website-migration", C, ["website-migration"], "—"),
  (78, "ci-cd-automation", C, ["ci-cd-automation"], "Workflow template parses as YAML and one artifact-path bug was fixed on review; it has not run on GitHub Actions (adding a workflow is left to the user)."),
  (79, "technical-documentation", C, ["technical-documentation"], "READMEs for both demos written by it."),
  (80, "skill-discovery", COV, ["skill-management"], "Probed 15 vendor repos with git ls-remote."),
  (81, "skill-installation-verification", COV, ["skill-management", "skill-scanner"], "audit_skills.py + quick_validate + skill-scanner run over the whole library."),
  (82, "skill-conflict-detection", COV, ["skill-management"], "Detected: Sentry `commit` style conflict, frontend-design name collision, description overlaps."),
  (83, "official-documentation-research", C, ["official-documentation-research"], "Caught 3 wrong assumptions (cacheComponents, Lighthouse flag, fabricated npm package)."),
  (84, "project-environment-audit", C, ["project-environment-audit"], "env_audit.sh run."),
  (85, "automated-test-execution", COV, ["site-qa-playwright", "visual-regression-testing", "ci-cd-automation"], "—"),
  (86, "browser-based-visual-qa", COV, ["site-qa-playwright", "creative-direction"], "Screenshot review loop fixed 4 visual bugs in contact-sheet."),
  (87, "mobile-responsive-qa", COV, ["site-qa-playwright", "modern-css-layout"], "—"),
  (88, "seo-release-checklist", COV, ["technical-seo", "structured-data", "production-deployment"], "—"),
  (89, "production-readiness-audit", COV, ["site-quality-gate", "production-deployment"], "—"),
  (90, "deployment-verification", EXT, ["production-deployment"], "Post-deploy checks need a live URL; nothing was deployed (no authorization/credentials)."),
  (91, "final-delivery-report", COV, ["site-builder", "site-quality-gate"], "—"),
]


def main() -> int:
    assert len(ROWS) == 91 and [r[0] for r in ROWS] == list(range(1, 92)), "rows must be 1..91"
    missing = [(n, s) for n, _, _, skills, _ in ROWS for s in skills if s not in PLUGINS and not (SK / s / "SKILL.md").exists()]
    if missing:
        print("MISSING skill references:", missing)
        return 1
    counts: dict[str, int] = {}
    for r in ROWS:
        counts[r[2]] = counts.get(r[2], 0) + 1
    sections = [(1, "Core website"), (27, "Premium design & animation"), (44, "Backend & e-commerce"), (57, "SEO & digital marketing"), (67, "Accessibility, security & performance"), (77, "Engineering & deployment")]
    out = ["# Website skill inventory (91 requested areas)", "",
           "Generated by `.claude/skills/skill-management/scripts/inventory_91.py`, which fails if any referenced skill is missing.",
           "Every path below exists as `.claude/skills/<name>/SKILL.md`. \"(plugin)\" entries are project-scoped plugins from `.claude/settings.json`.", "",
           "**Totals:** " + " · ".join(f"{k}: {v}" for k, v in sorted(counts.items())), "",
           "`REQUIRES_EXTERNAL_TOOL` means the guidance is installed and validated, but doing that work for real needs something missing from this sandbox (an account, credentials, a blocked host, or a browser). The last column names exactly what.", ""]
    for i, (start, title) in enumerate(sections):
        end = sections[i + 1][0] if i + 1 < len(sections) else 92
        out += [f"## {title}", "", "| # | Requested | Status | Skill(s) | Evidence / missing dependency |", "|---|---|---|---|---|"]
        for n, name, status, skills, note in ROWS:
            if start <= n < end:
                links = ", ".join(f"`{s}`" for s in skills)
                out.append(f"| {n} | {name} | {status} | {links} | {note} |")
        out.append("")
    (ROOT / ".claude/SKILLS_INVENTORY.md").write_text("\n".join(out), encoding="utf-8")
    print("wrote .claude/SKILLS_INVENTORY.md", counts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
