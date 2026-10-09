// Capture real screenshots of the sites in this repo (their actual builds), plus the
// facts we can verify from the repo itself: package.json stack/fonts, page count,
// last commit date and message. Output: raw/*.png (git-ignored) + src/data/projects.json.
// Run from contact-sheet/: node scripts/capture.mjs   (needs the Next projects built: <dir>/out)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "../../node_modules/playwright/index.mjs";

const REPO = path.resolve(import.meta.dirname, "../..");
const RAW = path.resolve(import.meta.dirname, "../raw");
const DATA = path.resolve(import.meta.dirname, "../src/data/projects.json");
fs.mkdirSync(RAW, { recursive: true });

// slug → folder that is served (static sites: the folder itself; Next: its export)
const PROJECTS = [
  { slug: "riviera-padel", dir: "riviera-padel", serve: "riviera-padel/out", kind: "next" },
  { slug: "pulsar-studio", dir: "pulsar-studio", serve: "pulsar-studio/out", kind: "next" },
  { slug: "autospa-detailing-v2", dir: "autospa-detailing-v2", serve: "autospa-detailing-v2/out", kind: "next" },
  { slug: "cadru-digital", dir: "cadru-digital", serve: "cadru-digital/out", kind: "next" },
  { slug: "robixhost-site", dir: "robixhost-site", serve: "robixhost-site", kind: "static" },
  { slug: "website-robixhost", dir: "website-robixhost", serve: "website-robixhost", kind: "static" },
  { slug: "website-rbtpro", dir: "website-rbtpro", serve: "website-rbtpro", kind: "static" },
  { slug: "website-v2", dir: "website-v2", serve: "website-v2", kind: "static" },
  { slug: "website", dir: "website", serve: "website", kind: "static" },
];

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".woff2": "font/woff2", ".json": "application/json", ".ico": "image/x-icon", ".mp4": "video/mp4" };
function serve(root) {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      let f = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
      if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
      if (!fs.existsSync(f)) { res.writeHead(404).end(); return; }
      res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }).end(fs.readFileSync(f));
    }).listen(0, "127.0.0.1", () => resolve(s));
  });
}

const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8" }).trim();
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const out = [];

for (const p of PROJECTS) {
  const root = path.join(REPO, p.serve);
  if (!fs.existsSync(path.join(root, "index.html"))) { console.warn(`skip ${p.slug}: ${p.serve}/index.html missing (build it first)`); continue; }
  const server = await serve(root);
  const url = `http://127.0.0.1:${server.address().port}/`;
  let title = "";
  let hiddenBanner = false;
  for (const [label, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "no-preference", isMobile: label === "mobile", hasTouch: label === "mobile" });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(2600); // let entrance animations settle (some sites hide their h1 under reduced motion — see suggested fix)
    // Hide fixed/sticky overlays that talk about cookies so the frame shows the site itself.
    // Recorded per project in projects.json (hiddenCookieBanner), not hidden silently.
    // Prefer what a visitor would do: decline via the site's own button (removes banner AND backdrop).
    const reject = page.getByRole("button", { name: /respinge|refuz|reject|doar (cele )?necesare|decline/i }).first();
    if (await reject.isVisible().catch(() => false)) { await reject.click().catch(() => {}); await page.waitForTimeout(700); hiddenBanner = true; }
    const hid = await page.evaluate(() => {
      let n = 0;
      for (const el of document.querySelectorAll("body *")) {
        const cs = getComputedStyle(el);
        if ((cs.position === "fixed" || cs.position === "sticky") && /cookie/i.test(el.textContent || "") && el.getBoundingClientRect().height < innerHeight * 0.6) { el.style.setProperty("display", "none", "important"); n++; }
      }
      return n > 0;
    }).catch(() => false);
    hiddenBanner ||= hid;
    title ||= await page.title();
    await page.screenshot({ path: path.join(RAW, `${p.slug}-${label}.png`) });
    await ctx.close();
  }
  server.close();

  const pkgPath = path.join(REPO, p.dir, "package.json");
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, "utf8")) : null;
  const deps = pkg ? Object.keys(pkg.dependencies ?? {}) : [];
  const html = fs.readdirSync(path.join(REPO, p.dir)).filter((f) => f.endsWith(".html")).length;
  const stack = pkg
    ? [`Next.js ${pkg.dependencies.next}`, deps.includes("gsap") && "GSAP", (deps.includes("framer-motion") || deps.includes("motion")) && "Motion", deps.some((d) => d.startsWith("@radix-ui")) && "Radix UI", deps.includes("three") && "Three.js", "Tailwind CSS"].filter(Boolean)
    : ["HTML", "CSS", "JavaScript"];
  out.push({
    slug: p.slug, kind: p.kind, title,
    stack,
    fonts: deps.filter((d) => d.startsWith("@fontsource")).map((d) => d.replace(/^@fontsource(-variable)?\//, "").split("-").map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))).join(" ")),
    htmlPages: p.kind === "static" ? html : null,
    commits: Number(git("rev-list", "--count", "HEAD", "--", p.dir)),
    firstCommit: git("log", "--reverse", "--format=%cs", "--", p.dir).split("\n")[0],
    lastCommit: git("log", "-1", "--format=%cs", "--", p.dir),
    lastMessage: git("log", "-1", "--format=%s", "--", p.dir),
    hiddenCookieBanner: hiddenBanner,
  });
  console.log(`captured ${p.slug}: "${title}"`);
}
await browser.close();
fs.mkdirSync(path.dirname(DATA), { recursive: true });
fs.writeFileSync(DATA, JSON.stringify({ capturedAt: new Date().toISOString().slice(0, 10), projects: out }, null, 2) + "\n");
console.log(`${out.length} projects → ${path.relative(process.cwd(), DATA)}`);
