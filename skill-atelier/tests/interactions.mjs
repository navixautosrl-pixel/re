// Interaction checks the generic QA script can't know about. Run after a build:
//   node tests/interactions.mjs   (serves ./out under BASE_PATH, default /demo/skill-atelier)
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { chromium } from "../../node_modules/playwright/index.mjs";
const BP = process.env.BASE_PATH ?? "/demo/skill-atelier", root = path.resolve("out"), shots = path.resolve("qa-report");
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, "http://x").pathname);
  if (!p.startsWith(BP)) return r.writeHead(404).end(); p = p.slice(BP.length) || "/";
  let f = path.join(root, p); if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) return r.writeHead(404).end();
  const t = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" }[path.extname(f)];
  r.writeHead(200, t ? { "content-type": t } : {}).end(fs.readFileSync(f));
}).listen(0); const URL_ = `http://127.0.0.1:${srv.address().port}${BP}/`;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const results = []; const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });
const cards = (p) => p.locator("#tools li").count();

// Desktop
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
  const p = await ctx.newPage();
  await p.goto(URL_); await p.waitForTimeout(250);
  await p.screenshot({ path: `${shots}/hero-1440-mid-entrance.png` });
  // CTA usable during the entrance
  await p.click("text=Browse the tools", { timeout: 1000 }); await p.waitForTimeout(600);
  check("CTA clickable during hero entrance → scrolls to #tools", (await p.evaluate(() => document.querySelector("#tools").getBoundingClientRect().top)) < 200);
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1300);
  await p.screenshot({ path: `${shots}/hero-1440-settled.png` });
  check("collapsed wall shows 12 cards", (await cards(p)) === 12, await cards(p));
  await p.click("text=/Show all \\d+ skills/"); await p.waitForTimeout(500);
  check("Show all reveals 48", (await cards(p)) === 48, await cards(p));
  await p.click('#tools button[aria-pressed]:has-text("Motion")'); await p.waitForTimeout(600);
  check("Motion filter → 9 cards", (await cards(p)) === 9, await cards(p));
  check("Motion chip aria-pressed=true", await p.getAttribute('#tools button:has-text("Motion")', "aria-pressed") === "true");
  await p.click('#tools button[aria-pressed]:has-text("All")');
  await p.fill('input[type="search"]', "hreflang"); await p.waitForTimeout(500);
  const names = await p.locator("#tools li h3").allInnerTexts();
  check("search 'hreflang' finds on-page-seo-content", names.includes("on-page-seo-content"), names.join(", "));
  await p.fill('input[type="search"]', "zzzz-nothing"); await p.waitForTimeout(400);
  check("empty state shown", await p.isVisible("text=No skill matches"));
  await p.click("text=Clear filters"); await p.waitForTimeout(400);
  check("Clear filters resets", (await p.inputValue('input[type="search"]')) === "");
  // GSAP scrub mid-way through the pipeline
  await p.locator("#pipeline").scrollIntoViewIfNeeded();
  const list = await p.evaluate(() => { const r = document.querySelector(".stage-list").getBoundingClientRect(); return r.top + scrollY; });
  await p.evaluate((y) => scrollTo(0, y - innerHeight * 0.62 + 260), list); await p.waitForTimeout(1200);
  const lit = await p.$$eval(".stage", (els) => els.map((e) => e.dataset.lit));
  const off = await p.$eval(".wire", (e) => new DOMMatrix(getComputedStyle(e).transform).d);
  check("pipeline mid-scroll: some stages lit, some not", lit.includes("true") && lit.includes("false"), lit.join(","));
  check("pipeline wire partially drawn (scaleY)", off > 0.05 && off < 0.95, off.toFixed(2));
  await p.screenshot({ path: `${shots}/pipeline-1440-midscroll.png` });
  await p.evaluate(() => scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(1200);
  check("pipeline fully lit at bottom", (await p.$$eval(".stage", (els) => els.every((e) => e.dataset.lit === "true"))));
  // Copy button
  await p.locator("#use").scrollIntoViewIfNeeded();
  await p.click('#use button:has-text("Copy") >> nth=0'); await p.waitForTimeout(200);
  check("copy button copies 'npm install'", (await p.evaluate(() => navigator.clipboard.readText())) === "npm install");
  check("copy announces status", (await p.textContent('#use [role="status"] >> nth=0')).includes("copied"));
  await ctx.close();
}
// Mobile menu
{
  const p = await (await b.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true })).newPage();
  await p.goto(URL_); await p.waitForTimeout(1300);
  await p.screenshot({ path: `${shots}/hero-375-viewport.png` });
  const t = p.locator('button[aria-controls]');
  await t.click(); await p.waitForTimeout(350);
  check("menu opens, aria-expanded=true", (await t.getAttribute("aria-expanded")) === "true" && (await p.locator('nav:visible a', { hasText: 'Pipeline' }).count()) === 1);
  await p.screenshot({ path: `${shots}/menu-375-open.png` });
  await p.keyboard.press("Escape"); await p.waitForTimeout(350);
  check("Escape closes menu and returns focus to toggle", (await t.getAttribute("aria-expanded")) === "false" && (await p.evaluate(() => document.activeElement?.getAttribute("aria-controls"))) !== null);
  await t.click(); await p.waitForTimeout(300); await p.locator('nav:visible a', { hasText: 'Missing tools' }).click(); await p.waitForTimeout(900);
  check("menu link navigates and closes menu", (await t.getAttribute("aria-expanded")) === "false" && (await p.evaluate(() => Math.abs(document.querySelector("#gaps").getBoundingClientRect().top))) < 120);
}
// Reduced motion + no JS
{
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
  await p.goto(URL_); await p.locator("#pipeline").scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
  check("reduced motion: all stages lit, wire drawn", (await p.$$eval(".stage", (e) => e.every((x) => x.dataset.lit === "true"))) && (await p.$eval(".wire", (e) => getComputedStyle(e).transform)) === "none");
  check("reduced motion: hero line not transformed", (await p.$eval(".hero-line > span", (e) => getComputedStyle(e).transform)) === "none");
  const q = await (await b.newContext({ javaScriptEnabled: false })).newPage();
  await q.goto(URL_);
  check("no JS: all 48 cards in HTML", (await q.locator("#tools li").count()) === 48);
}
await b.close(); srv.close();
for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.detail !== "" ? `  [${r.detail}]` : ""}`);
const failed = results.filter((r) => !r.ok).length; console.log(`\n${results.length - failed}/${results.length} passed`); process.exit(failed ? 1 : 0);
