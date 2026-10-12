import { test, expect } from "@playwright/test";

// Every URL in the sitemap: 200, one H1, unique title/description/H1, canonical = itself,
// title ≤ 65 chars, description 70–160, no internal link to a missing page.
test("all sitemap pages pass on-page SEO checks", async ({ page, request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  expect(urls.length).toBeGreaterThanOrEqual(15);
  const seen = { title: new Map<string, string>(), desc: new Map<string, string>(), h1: new Map<string, string>() };
  const links = new Set<string>();
  for (const path of urls) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    const info = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
      h1s: [...document.querySelectorAll("h1")].map((h) => h.textContent!.trim()),
      og: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "",
      links: [...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href")!.split(/[?#]/)[0]),
    }));
    expect(info.h1s, `${path} H1`).toHaveLength(1);
    expect(info.title.length, `${path} title "${info.title}"`).toBeLessThanOrEqual(65);
    expect(info.desc.length, `${path} description`).toBeGreaterThanOrEqual(70);
    expect(info.desc.length, `${path} description`).toBeLessThanOrEqual(160);
    expect(new URL(info.canonical).pathname, `${path} canonical`).toBe(path);
    expect(info.og, `${path} og:image`).toContain("/og.png");
    for (const [k, v] of [["title", info.title], ["desc", info.desc], ["h1", info.h1s[0]]] as const) {
      expect(seen[k].get(v), `${path} duplicates ${k} of ${seen[k].get(v)}`).toBeUndefined();
      seen[k].set(v, path);
    }
    info.links.forEach((l) => links.add(l));
  }
  for (const l of links) {
    const r = await request.get(l);
    expect(r.status(), `internal link ${l}`).toBe(200);
  }
});

const REF = [
  ["Motocicletă", "1.847,63 lei", 1823.34],
  ["Hatchback", "2.453,50 lei", 2462.45],
  ["Sedan", "2.910,50 lei", 2926.75],
  ["SUV", "4.098,88 lei", 4110.99],
  ["Microbuz", "5.778,88 lei", 5802.75],
  ["Autoutilitară", "6.054,38 lei", 6034.05],
] as const;

test("calculator in the browser, București → Cluj (457 km), all six vehicles", async ({ page }) => {
  await page.goto("/calculator/");
  await page.getByLabel("Distanța traseului (km)").fill("457");
  const total = page.locator("[aria-live=polite][aria-atomic=true]").last();
  for (const [name, shown, ref] of REF) {
    await page.getByRole("radio", { name: new RegExp(`^${name}`) }).check({ force: true });
    await expect(total).toContainText(shown);
    const value = Number(shown.replace(/[^\d,]/g, "").replace(",", "."));
    expect(Math.abs(value / ref - 1), `${name} vs reference ${ref}`).toBeLessThan(0.015);
  }
});
