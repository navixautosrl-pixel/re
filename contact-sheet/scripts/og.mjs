// Render public/og.png (1200×630) from the built home page's hero, final state.
import { chromium } from "../../node_modules/playwright/index.mjs";
const url = process.argv[2] ?? "http://127.0.0.1:4299/demo/contact-sheet/";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: "reduce", deviceScaleFactor: 1 });
await p.goto(url, { waitUntil: "networkidle" });
await p.addStyleTag({ content: "header,footer,main > :not(section[aria-labelledby=hero-title]){display:none!important} body{display:grid;align-content:center;min-height:630px} section[aria-labelledby=hero-title]{padding:0!important;width:min(100% - 96px,78rem)!important} .display{font-size:84px!important} section[aria-labelledby=hero-title] p, section[aria-labelledby=hero-title] a, figcaption{display:none!important}" });
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: "public/og.png" });
await b.close();
