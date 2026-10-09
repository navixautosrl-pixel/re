#!/usr/bin/env node
// Capture comparable, factual snapshots of competitor (or own) pages:
// SEO tags, heading outline, word count, JSON-LD types, CTAs, forms, detected platform,
// request count, transfer size, LCP (lab, unthrottled), and full-page screenshots.
// Read-only: loads pages like a browser, never submits forms.
//
// Usage: node analyze_sites.mjs --out report-dir https://a.ro/ https://b.ro/servicii/ ...
// Only analyze URLs the user supplied (CLAUDE.md SSRF rule) and respect site terms.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const outIdx = argv.indexOf("--out");
const outDir = path.resolve(outIdx >= 0 ? argv[outIdx + 1] : "competitor-report");
const urls = argv.filter((a, i) => /^https?:\/\//.test(a) && argv[i - 1] !== "--out");
if (!urls.length) { console.error("Usage: analyze_sites.mjs [--out dir] <url> [url...]"); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });

async function load(mod) {
  for (const r of [process.cwd(), path.resolve(new URL(".", import.meta.url).pathname, "../../../..")]) {
    try { return await import(pathToFileURL(createRequire(path.join(r, "x.js")).resolve(mod)).href); } catch {}
  }
  return null;
}
const pw = await load("playwright");
if (!pw) { console.error("playwright not found — run npm install at the repo root"); process.exit(2); }
const { chromium } = pw.default ?? pw;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

const rows = [];
for (const url of urls) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: undefined });
  const page = await ctx.newPage();
  let requests = 0, bytes = 0;
  // Decoded body size per response. (requestfinished/sizes() proved unreliable here: only 2 of 13
  // requests reported finishing against a local static server, so we read bodies instead.)
  const pending = [];
  page.on("response", (r) => { requests++; pending.push(r.body().then((buf) => { bytes += buf.length; }).catch(() => {})); });
  await page.addInitScript(() => {
    window.__lcp = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  let status = 0, err = "";
  try { status = (await page.goto(url, { waitUntil: "networkidle", timeout: 45000 }))?.status() ?? 0; }
  catch (e) { err = String(e).split("\n")[0]; }
  if (err) { rows.push({ url, error: err }); await ctx.close(); continue; }
  await page.waitForTimeout(800);
  await Promise.all(pending);
  const data = await page.evaluate(() => {
    const m = (s) => document.querySelector(s)?.getAttribute("content") ?? "";
    const text = (document.querySelector("main") || document.body).innerText;
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => {
      try { const j = JSON.parse(s.textContent); return [].concat(j).flatMap((o) => o["@graph"] ? o["@graph"].map((g) => g["@type"]) : [o["@type"]]); } catch { return ["(invalid)"]; }
    });
    const scripts = [...document.scripts].map((s) => s.src).join(" ") + " " + document.documentElement.outerHTML.slice(0, 200000);
    const platform = [
      [/wp-content|wp-includes/, "WordPress"], [/cdn\.shopify|Shopify\.theme/, "Shopify"], [/\/_next\//, "Next.js"],
      [/wix\.com|wixstatic/, "Wix"], [/squarespace/, "Squarespace"], [/webflow/, "Webflow"], [/gtm\.js|googletagmanager/, "GTM/GA"],
      [/woocommerce/, "WooCommerce"], [/elementor/, "Elementor"],
    ].filter(([re]) => re.test(scripts)).map(([, n]) => n);
    return {
      title: document.title, description: m('meta[name="description"]'), canonical: document.querySelector('link[rel="canonical"]')?.href ?? "",
      robots: m('meta[name="robots"]'), lang: document.documentElement.lang,
      outline: [...document.querySelectorAll("h1,h2,h3")].slice(0, 30).map((h) => `${h.tagName}: ${h.innerText.replace(/\s+/g, " ").trim().slice(0, 80)}`),
      words: text.split(/\s+/).filter(Boolean).length,
      jsonLd: [...new Set(ld)],
      ctas: [...document.querySelectorAll("a,button")].filter((el) => /suna|sună|programe|rezerv|cere|ofert|contact|book|call|quote|buy|cumpără|comandă|whatsapp/i.test(el.innerText) || /^tel:|wa\.me/.test(el.getAttribute("href") || "")).slice(0, 8).map((el) => el.innerText.trim().slice(0, 40) || el.getAttribute("href")),
      forms: document.forms.length,
      images: document.images.length,
      imgNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
      platform,
      lcpMs: Math.round(window.__lcp),
    };
  });
  const u = new URL(url);
  const slug = (u.host.replace(/^www\./, "") + u.pathname).replace(/[^a-z0-9]+/gi, "-").replace(/-+$/, "");
  await page.screenshot({ path: path.join(outDir, `${slug}.png`), fullPage: true });
  rows.push({ url, status, requests, transferKB: Math.round(bytes / 1024), ...data, screenshot: `${slug}.png` });
  await ctx.close();
}
await browser.close();

fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(rows, null, 2));
const md = [
  `# Site comparison (${new Date().toISOString().slice(0, 10)}, lab snapshot, desktop 1440px, unthrottled)`, "",
  "| URL | Status | Title (len) | Desc len | H1 | Words | JSON-LD | CTAs | Forms | Platform | Req | KB decoded* | LCP ms |",
  "|---|---|---|---|---|---|---|---|---|---|---|---|---|",
  ...rows.map((r) => r.error ? `| ${r.url} | error: ${r.error} |` :
    `| ${r.url} | ${r.status} | ${r.title.slice(0, 50)} (${r.title.length}) | ${r.description.length} | ${(r.outline.find((o) => o.startsWith("H1")) || "—").slice(4, 50)} | ${r.words} | ${r.jsonLd.join(", ") || "—"} | ${r.ctas.slice(0, 3).join(" / ") || "—"} | ${r.forms} | ${r.platform.join(", ") || "?"} | ${r.requests} | ${r.transferKB} | ${r.lcpMs} |`),
  "", "*KB = decoded (uncompressed) response bodies loaded until network idle — larger than transfer size. Use Lighthouse for authoritative page weight and CWV.",
];
fs.writeFileSync(path.join(outDir, "report.md"), md.join("\n") + "\n");
console.log(md.join("\n"));
