#!/usr/bin/env node
// Browser QA for marketing / static sites. Read-only against the target: it never
// submits forms or mutates anything, it only loads pages, scrolls, tabs and reads.
//
// Usage:
//   node site_qa.mjs --dir out [--base-path /demo] [--pages /,/contact] [--out qa-report]
//   node site_qa.mjs --url http://localhost:3000 [--pages /,/pricing]
//
// --dir serves a static export locally (optionally under a subpath, to catch
// unprefixed-asset bugs that `next dev` at the root never shows).
// Exit code: 0 = no critical findings, 1 = critical findings, 2 = usage/setup error.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "true"]);
    return acc;
  }, [])
);
if (!args.dir && !args.url) {
  console.error("Usage: site_qa.mjs (--dir <static-dir> [--base-path /sub] | --url <http://...>) [--pages /,/a] [--out dir] [--widths 320,375,768,1024,1440,1920]");
  process.exit(2);
}

// Resolve Playwright from the project, then from this repo's root install.
async function load(mod) {
  const roots = [process.cwd(), path.resolve(new URL(".", import.meta.url).pathname, "../../../..")];
  for (const r of roots) {
    try {
      const req = createRequire(path.join(r, "noop.js"));
      return await import(pathToFileURL(req.resolve(mod)).href);
    } catch {}
  }
  return null;
}
const pw = (await load("playwright")) || (await load("playwright-core"));
if (!pw) {
  console.error("playwright not found. Run `npm install` at the repo root (it pins @playwright/mcp, which ships playwright).");
  process.exit(2);
}
const { chromium } = pw.default ?? pw;
const axeMod = await load("@axe-core/playwright"); // optional

const executablePath =
  process.env.CHROMIUM_PATH ||
  ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find((p) => fs.existsSync(p));

const widths = (args.widths || "320,375,768,1024,1440,1920").split(",").map(Number);
const pages = (args.pages || "/").split(",");
const outDir = path.resolve(args.out || "qa-report");
fs.mkdirSync(outDir, { recursive: true });

// ---------- optional static server (emulates subpath hosting) ----------
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".webmanifest": "application/manifest+json", ".mp4": "video/mp4", ".lottie": "application/zip", ".riv": "application/octet-stream" };
let server, base;
if (args.dir) {
  const root = path.resolve(args.dir);
  const bp = (args["base-path"] || "").replace(/\/$/, "");
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (bp) {
      if (!p.startsWith(bp + "/") && p !== bp) { res.writeHead(404).end("outside base path"); return; }
      p = p.slice(bp.length) || "/";
    }
    let f = path.join(root, p);
    if (!f.startsWith(root)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
    if (!fs.existsSync(f)) {
      const nf = path.join(root, "404.html");
      res.writeHead(404, { "content-type": MIME[".html"] }).end(fs.existsSync(nf) ? fs.readFileSync(nf) : "404");
      return;
    }
    res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }).end(fs.readFileSync(f));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}${bp}`;
} else {
  base = args.url.replace(/\/$/, "");
}

const report = { base, startedAt: new Date().toISOString(), pages: {}, critical: [], warnings: [] };
const crit = (page, msg) => report.critical.push(`${page}: ${msg}`);
const warn = (page, msg) => report.warnings.push(`${page}: ${msg}`);
const slug = (p) => (p === "/" ? "home" : p.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, ""));

const browser = await chromium.launch({ executablePath });

async function newPage(opts = {}) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const log = { console: [], pageErrors: [], failed: [] };
  page.on("console", (m) => m.type() === "error" && log.console.push(m.text()));
  page.on("pageerror", (e) => log.pageErrors.push(String(e)));
  // ERR_ABORTED = cancelled by the page (e.g. Next.js <Link> prefetches torn down on close), not a failure.
  page.on("requestfailed", (r) => { const e = r.failure()?.errorText ?? ""; if (!/ERR_ABORTED/.test(e)) log.failed.push(`${e} ${r.url()}`); });
  page.on("response", (r) => r.status() >= 400 && log.failed.push(`${r.status()} ${r.url()}`));
  return { ctx, page, log };
}

// Scroll top→bottom in steps so IntersectionObserver / ScrollTrigger reveals fire.
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 400));
  });
}

for (const p of pages) {
  const url = base + (p.startsWith("/") ? p : "/" + p);
  const r = (report.pages[p] = { url, viewports: {} });

  // 1) Responsive pass at every width
  for (const w of widths) {
    const { ctx, page, log } = await newPage({ viewport: { width: w, height: w < 768 ? 800 : 900 } });
    const resp = await page.goto(url, { waitUntil: "networkidle" }).catch((e) => (log.pageErrors.push(String(e)), null));
    if (!resp || resp.status() >= 400) crit(p, `HTTP ${resp?.status() ?? "load failed"} at ${w}px`);
    await scrollThrough(page);
    const overflowX = await page.evaluate(() => { scrollTo(9999, 0); const x = scrollX; scrollTo(0, 0); return x; });
    const wide = overflowX
      ? await page.evaluate(() => [...document.querySelectorAll("body *")]
          .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
          .slice(0, 5).map((el) => el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : "")))
      : [];
    const smallTargets = await page.evaluate(() => [...document.querySelectorAll("a[href],button,input,select,textarea,[role=button]")]
      .filter((el) => { const b = el.getBoundingClientRect(); return b.width > 1 && b.height > 1 && (b.width < 24 || b.height < 24) && getComputedStyle(el).display !== "inline"; })
      .map((el) => { const b = el.getBoundingClientRect(); return `${el.tagName.toLowerCase()} "${(el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 30)}" ${Math.round(b.width)}×${Math.round(b.height)}`; }));
    await page.screenshot({ path: path.join(outDir, `${slug(p)}-${w}.png`), fullPage: true });
    if (overflowX) crit(p, `horizontal overflow ${overflowX}px at ${w}px (${wide.join(", ")})`);
    if (log.pageErrors.length) crit(p, `page errors at ${w}px: ${log.pageErrors.slice(0, 3).join(" | ")}`);
    if (log.console.length) warn(p, `console errors at ${w}px: ${log.console.slice(0, 3).join(" | ")}`);
    if (log.failed.length) crit(p, `failed/4xx requests at ${w}px: ${[...new Set(log.failed)].slice(0, 5).join(" | ")}`);
    if (smallTargets.length && w <= 375) warn(p, `${smallTargets.length} interactive targets under 24×24px at ${w}px (WCAG 2.5.8): ${smallTargets.slice(0, 4).join("; ")}`);
    r.viewports[w] = { status: resp?.status(), overflowX, smallTargets, ...log };
    await ctx.close();
  }

  // 2) SEO + semantics (desktop)
  {
    const { ctx, page } = await newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(url, { waitUntil: "networkidle" });
    const seo = await page.evaluate(() => {
      const m = (s) => document.querySelector(s)?.getAttribute("content") ?? null;
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
        try { return { ok: true, types: [].concat(JSON.parse(s.textContent)).flatMap((o) => o["@graph"] ? o["@graph"].map((g) => g["@type"]) : [o["@type"]]) }; }
        catch (e) { return { ok: false, error: String(e) }; }
      });
      const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]);
      const skips = headings.filter((lvl, i) => i && lvl - headings[i - 1] > 1).length;
      return {
        title: document.title, titleLen: document.title.length,
        description: m('meta[name="description"]'),
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
        robots: m('meta[name="robots"]'),
        ogTitle: m('meta[property="og:title"]'), ogImage: m('meta[property="og:image"]'),
        lang: document.documentElement.lang, viewport: m('meta[name="viewport"]'),
        h1: document.querySelectorAll("h1").length, headingSkips: skips,
        imgsNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
        imgsNoDims: [...document.images].filter((i) => !i.getAttribute("width") && !i.style.aspectRatio && getComputedStyle(i).aspectRatio === "auto").length,
        emptyLinks: [...document.querySelectorAll("a")].filter((a) => !a.getAttribute("href") || a.getAttribute("href") === "#").length,
        unnamedControls: [...document.querySelectorAll("a[href],button")].filter((el) => !((el.innerText || el.textContent).trim() || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.querySelector("img[alt]:not([alt=''])") || el.title)).length,
        unlabeledInputs: [...document.querySelectorAll("input:not([type=hidden]):not([type=submit]),select,textarea")].filter((el) => !(el.labels?.length || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby"))).length,
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href")).filter((h) => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1)))),
        internalLinks: [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => h.startsWith(location.origin)).map((h) => h.split("#")[0]))],
        jsonLd: ld,
      };
    });
    r.seo = seo;
    if (!seo.title) crit(p, "missing <title>"); else if (seo.titleLen > 65) warn(p, `title ${seo.titleLen} chars (may truncate)`);
    if (!seo.description) crit(p, "missing meta description");
    if (!seo.canonical) warn(p, "missing canonical");
    if (!seo.ogTitle || !seo.ogImage) warn(p, "missing og:title / og:image");
    if (!seo.lang) crit(p, "missing <html lang>");
    if (!seo.viewport) crit(p, "missing viewport meta");
    if (seo.h1 !== 1) crit(p, `${seo.h1} <h1> elements (expected 1)`);
    if (seo.headingSkips) warn(p, `${seo.headingSkips} skipped heading levels`);
    if (seo.imgsNoAlt) crit(p, `${seo.imgsNoAlt} <img> without alt`);
    if (seo.imgsNoDims) warn(p, `${seo.imgsNoDims} <img> without width/height or aspect-ratio (CLS risk)`);
    if (seo.emptyLinks) crit(p, `${seo.emptyLinks} links with empty or "#" href`);
    if (seo.unnamedControls) crit(p, `${seo.unnamedControls} links/buttons without an accessible name`);
    if (seo.unlabeledInputs) crit(p, `${seo.unlabeledInputs} form fields without a label`);
    if (seo.brokenAnchors.length) crit(p, `in-page anchors with no target: ${seo.brokenAnchors.join(", ")}`);
    seo.jsonLd.filter((j) => !j.ok).forEach((j) => crit(p, `invalid JSON-LD: ${j.error}`));

    // internal link check
    for (const l of seo.internalLinks) {
      const res = await ctx.request.get(l).catch(() => null);
      if (!res || res.status() >= 400) crit(p, `broken internal link ${l} (${res?.status() ?? "error"})`);
    }

    // keyboard: tab through and verify a visible focus indicator
    const focus = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      focus.push(await page.evaluate(() => {
        const el = document.activeElement; if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const visible = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== "none";
        return { el: el.tagName.toLowerCase() + (el.id ? "#" + el.id : ""), text: (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 40), visible };
      }));
    }
    r.keyboard = focus;
    const noRing = focus.filter((f) => f && !f.visible);
    if (!focus.some(Boolean)) crit(p, "Tab does not move focus to any element");
    if (noRing.length) warn(p, `${noRing.length} focused elements with no outline/box-shadow (check :focus-visible): ${noRing.map((f) => f.el).join(", ")}`);

    // axe (optional dependency)
    if (axeMod) {
      const AxeBuilder = axeMod.default?.default ?? axeMod.default ?? axeMod.AxeBuilder;
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      r.axe = axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
      r.axe.forEach((v) => (v.impact === "critical" || v.impact === "serious" ? crit : warn)(p, `axe ${v.impact} ${v.id} ×${v.nodes}: ${v.help}`));
    } else {
      report.axe = "skipped: @axe-core/playwright not installed in the project (npm i -D @axe-core/playwright)";
    }
    await ctx.close();
  }

  // 3) Reduced motion: after scrolling, nothing meaningful should still be invisible
  for (const [label, opts] of [["reduced-motion", { reducedMotion: "reduce" }], ["no-js", { javaScriptEnabled: false }]]) {
    const { ctx, page } = await newPage({ viewport: { width: 1440, height: 900 }, ...opts });
    await page.goto(url, { waitUntil: "networkidle" });
    if (label === "reduced-motion") await scrollThrough(page);
    const hidden = await page.evaluate(() => {
      const isHidden = (el) => { for (let n = el; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (parseFloat(cs.opacity) < 0.05 || cs.visibility === "hidden") return true; } return false; };
      return [...document.querySelectorAll("main h1, main h2, main h3, main p, main a, main button, main img, h1")]
        .filter((el) => el.getBoundingClientRect().height > 0 && !el.closest("[aria-hidden=true],[hidden],dialog:not([open])") && isHidden(el))
        .slice(0, 8).map((el) => el.tagName.toLowerCase() + ": " + (el.innerText || el.alt || "").trim().slice(0, 40));
    });
    await page.screenshot({ path: path.join(outDir, `${slug(p)}-${label}.png`), fullPage: true });
    r[label] = { hidden };
    if (hidden.length) crit(p, `${label}: content still invisible → ${hidden.join(" | ")}`);
    await ctx.close();
  }
}

await browser.close();
server?.close();
report.finishedAt = new Date().toISOString();
fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));

console.log(`\nQA ${base}  pages=${pages.join(",")}  widths=${widths.join(",")}`);
console.log(`Screenshots + report.json → ${outDir}`);
console.log(`\nCRITICAL (${report.critical.length})`); report.critical.forEach((c) => console.log("  ✗ " + c));
console.log(`\nWARNINGS (${report.warnings.length})`); report.warnings.forEach((w) => console.log("  ! " + w));
if (report.axe) console.log("\n" + report.axe);
process.exit(report.critical.length ? 1 : 0);
