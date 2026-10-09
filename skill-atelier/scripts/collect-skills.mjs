// Reads the real skill library (../.claude/skills/*/SKILL.md) and writes
// src/data/skills.json, so every number and name on the page comes from the repo.
// Runs before `next build` (see package.json "prebuild"). If the skills folder
// isn't there (the site copied elsewhere), the committed JSON is kept as-is.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../../.claude/skills");
const out = path.resolve(import.meta.dirname, "../src/data/skills.json");

if (!fs.existsSync(root)) {
  console.warn(`[collect-skills] ${root} not found — keeping existing ${path.basename(out)}`);
  process.exit(0);
}

// Which job each skill does on a website build. Skills that aren't about
// websites (e.g. the fishing consultant) are left out on purpose.
const STAGE = {
  plan: ["site-builder", "app-builder", "prompt-to-product", "creative-direction", "conversion-optimization", "on-page-seo-content", "website-copywriting", "brand"],
  design: ["ui-ux-pro-max", "design", "design-system", "ui-styling", "banner-design", "slides", "frontend-design"],
  build: ["modern-css-layout", "nextjs-site-architecture", "vercel-react-best-practices", "web-artifacts-builder", "database", "auth", "ecommerce-development"],
  motion: ["motion-react", "gsap-core", "gsap-timeline", "gsap-scrolltrigger", "gsap-react", "gsap-plugins", "gsap-utils", "gsap-performance", "interactive-visuals"],
  search: ["technical-seo", "structured-data", "seo", "analytics-tracking"],
  verify: ["site-qa-playwright", "webapp-testing", "browser-qa", "accessibility", "core-web-vitals", "web-performance", "performance", "web-quality-audit", "web-best-practices", "security", "debugging", "site-quality-gate"],
  ship: ["production-deployment"],
};
const CUSTOM = new Set(["site-builder", "creative-direction", "modern-css-layout", "nextjs-site-architecture", "motion-react", "interactive-visuals", "on-page-seo-content", "structured-data", "site-qa-playwright", "conversion-optimization", "website-copywriting", "ecommerce-development", "analytics-tracking", "production-deployment", "site-quality-gate"]);
const VENDOR = {
  greensock: ["gsap-core", "gsap-timeline", "gsap-scrolltrigger", "gsap-react", "gsap-plugins", "gsap-utils", "gsap-performance"],
  "web-quality-skills": ["accessibility", "core-web-vitals", "web-quality-audit", "technical-seo", "web-performance", "web-best-practices"],
  vercel: ["vercel-react-best-practices"],
};

const stageOf = Object.fromEntries(Object.entries(STAGE).flatMap(([s, names]) => names.map((n) => [n, s])));
const vendorOf = Object.fromEntries(Object.entries(VENDOR).flatMap(([v, names]) => names.map((n) => [n, v])));

function frontmatter(file) {
  const m = fs.readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const get = (k) => {
    const line = m[1].split("\n").find((l) => l.startsWith(`${k}:`));
    if (!line) return "";
    let v = line.slice(k.length + 1).trim();
    if (v.startsWith('"')) v = JSON.parse(v);
    return v;
  };
  return { name: get("name"), description: get("description") };
}

// First sentence, trimmed for a card; the full text stays in the title attribute.
const summary = (d) => {
  const first = d.split(/(?<=[a-z0-9)\]])\.\s|\s—\s/)[0].replace(/\.$/, "");
  return first.length > 150 ? first.slice(0, 147).replace(/\s+\S*$/, "") + "…" : first;
};

const skills = fs
  .readdirSync(root)
  .filter((d) => fs.existsSync(path.join(root, d, "SKILL.md")) && stageOf[d])
  .map((dir) => {
    const fm = frontmatter(path.join(root, dir, "SKILL.md"));
    const hasScripts = fs.existsSync(path.join(root, dir, "scripts"));
    return {
      name: fm.name || dir,
      stage: stageOf[dir],
      origin: CUSTOM.has(dir) ? "custom" : vendorOf[dir] ? "vendored" : "existing",
      vendor: vendorOf[dir] ?? null,
      summary: summary(fm.description || ""),
      description: fm.description || "",
      hasScripts,
    };
  })
  .sort((a, b) => Object.keys(STAGE).indexOf(a.stage) - Object.keys(STAGE).indexOf(b.stage) || a.name.localeCompare(b.name));

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generatedFrom: ".claude/skills", count: skills.length, skills }, null, 2) + "\n");
console.log(`[collect-skills] ${skills.length} skills → ${path.relative(process.cwd(), out)}`);
