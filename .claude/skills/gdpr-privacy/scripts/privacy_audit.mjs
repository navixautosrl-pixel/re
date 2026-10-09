#!/usr/bin/env node
// What does a page send, and to whom, BEFORE the visitor consents?
// Loads the URL in a fresh profile, never clicks anything, and lists:
// third-party hosts contacted, cookies set (with domain/expiry), localStorage keys,
// and known tracker/embed hosts. Optionally clicks an "accept" button and diffs.
//
// Usage: node privacy_audit.mjs <url> [--accept "text=Accept"] [--wait 3000]
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const url = argv.find((a) => /^https?:\/\//.test(a));
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
if (!url) { console.error('Usage: privacy_audit.mjs <url> [--accept "text=Accept"] [--wait 3000]'); process.exit(2); }

async function load(mod) {
  for (const r of [process.cwd(), path.resolve(new URL(".", import.meta.url).pathname, "../../../..")]) {
    try { return await import(pathToFileURL(createRequire(path.join(r, "x.js")).resolve(mod)).href); } catch {}
  }
  return null;
}
const pw = await load("playwright");
if (!pw) { console.error("playwright not found — run npm install at the repo root"); process.exit(2); }
const { chromium } = pw.default ?? pw;

const KNOWN = [
  [/google-analytics\.com|analytics\.google\.com|googletagmanager\.com/, "Google Analytics/GTM"],
  [/doubleclick\.net|googlesyndication|googleadservices/, "Google Ads"],
  [/facebook\.net|facebook\.com\/tr/, "Meta Pixel"], [/connect\.facebook/, "Meta SDK"],
  [/fonts\.googleapis\.com|fonts\.gstatic\.com/, "Google Fonts CDN (IP transfer)"],
  [/youtube\.com|ytimg\.com|youtube-nocookie\.com/, "YouTube embed"], [/maps\.googleapis|maps\.gstatic/, "Google Maps"],
  [/hotjar|clarity\.ms/, "Session recording"], [/tawk\.to|intercom|crisp\.chat|tidio/, "Chat widget"],
  [/tiktok/, "TikTok pixel"], [/linkedin/, "LinkedIn Insight"],
];

const origin = new URL(url).host.replace(/^www\./, "");
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

async function snapshot(page, ctx) {
  const cookies = (await ctx.cookies()).map((c) => ({ name: c.name, domain: c.domain, expires: c.expires > 0 ? new Date(c.expires * 1000).toISOString().slice(0, 10) : "session", thirdParty: !c.domain.replace(/^\./, "").endsWith(origin) }));
  const storage = await page.evaluate(() => Object.keys(localStorage)).catch(() => []);
  return { cookies, storage };
}

const ctx = await browser.newContext();
const page = await ctx.newPage();
const hosts = new Map();
page.on("request", (r) => { const h = new URL(r.url()).host; if (!h.replace(/^www\./, "").endsWith(origin) && !r.url().startsWith("data:")) hosts.set(h, (hosts.get(h) || 0) + 1); });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(Number(opt("wait", 3000)));
const before = { hosts: new Map(hosts), ...(await snapshot(page, ctx)) };

let after = null;
const accept = opt("accept");
if (accept) {
  await page.locator(accept).first().click({ timeout: 5000 }).catch((e) => console.log(`! could not click ${accept}: ${String(e).split("\n")[0]}`));
  await page.waitForTimeout(Number(opt("wait", 3000)));
  after = { hosts: new Map(hosts), ...(await snapshot(page, ctx)) };
}
await browser.close();

const label = (h) => KNOWN.find(([re]) => re.test(h))?.[1] ?? "";
const print = (title, s) => {
  console.log(`\n## ${title}`);
  console.log(`Third-party hosts (${s.hosts.size}):`);
  for (const [h, n] of s.hosts) console.log(`  ${h} ×${n} ${label(h) ? "← " + label(h) : ""}`);
  console.log(`Cookies (${s.cookies.length}):`);
  for (const c of s.cookies) console.log(`  ${c.name} @ ${c.domain} (${c.expires})${c.thirdParty ? " ← third-party" : ""}`);
  console.log(`localStorage keys: ${s.storage.join(", ") || "none"}`);
};
print(`BEFORE any interaction — ${url}`, before);
if (after) print(`AFTER clicking ${accept}`, after);
const flagged = [...before.hosts.keys()].filter((h) => label(h));
console.log(`\nVERDICT (pre-consent): ${flagged.length ? "non-essential third parties contacted before consent → " + flagged.map((h) => `${h} (${label(h)})`).join(", ") : "no known tracker/embed hosts contacted before consent"}.`);
console.log("Technical evidence only — legal assessment belongs to the client's adviser.");
