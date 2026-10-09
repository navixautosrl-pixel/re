// Full-page screenshots at desktop + mobile, with console errors and horizontal-overflow check.
// Usage: node scripts/shots.mjs <outDir> /,/magazin [baseUrl]
import { chromium } from "@playwright/test";
const [out, list, base = "http://localhost:3100"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [w, h, tag] of [[1440, 900, "d"], [390, 844, "m"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => ["error", "warning"].includes(m.type()) && errs.push(m.text()));
  page.on("pageerror", (e) => errs.push(String(e)));
  for (const path of list.split(",")) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)); } scrollTo(0, 0); });
    await page.waitForTimeout(900);
    const name = path.replace(/^\/|\/$/g, "").replaceAll("/", "_").replace(/\?.*/, "") || "home";
    await page.screenshot({ path: `${out}/${name}-${tag}.png`, fullPage: true });
    const sx = await page.evaluate(() => { scrollTo(9999, 0); return scrollX; });
    console.log(tag, path, "scrollX", sx, "errors", JSON.stringify(errs.splice(0)));
  }
  await ctx.close();
}
await browser.close();
