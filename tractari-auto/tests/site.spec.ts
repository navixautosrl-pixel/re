import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const errorsOf = (page: Page) => {
  const e: string[] = [];
  page.on("console", (m) => m.type() === "error" && e.push(m.text()));
  page.on("pageerror", (x) => e.push(String(x)));
  return e;
};
const total = (page: Page) => page.locator("[aria-live=polite][aria-atomic=true]").last();

test("calculator: same inputs as the reference give the expected totals @mobile", async ({ page }) => {
  const errors = errorsOf(page);
  await page.goto("/calculator/");
  await page.getByLabel("Distanța traseului (km)").fill("457");
  await expect(total(page)).toContainText("2.453,50 lei"); // hatchback (reference 2.462,45)
  await expect(page.getByText("427 km × 4,4 lei")).toBeVisible();
  await expect(page.getByText("30 km × 2,8 lei")).toBeVisible();
  await page.getByText("SUV", { exact: true }).first().click();
  await expect(total(page)).toContainText("4.098,88 lei"); // reference 4.110,99
  await page.getByText("Autoutilitară", { exact: true }).first().click();
  await expect(total(page)).toContainText("6.054,38 lei"); // reference 6.034,05
  expect(errors).toEqual([]);
});

test("calculator: validation, damaged note, duration, shareable URL", async ({ page }) => {
  await page.goto("/calculator/?vehicul=microbuz&km=100");
  await expect(page.getByRole("radio", { name: /Microbuz/ })).toBeChecked();
  await expect(page.getByLabel("Distanța traseului (km)")).toHaveValue("100");
  // mid tariff: 200 + 130 + 99 × 8.9 + 1 × 7.5 = 1218.6 → × 1.25 = 1523.25
  await expect(total(page)).toContainText("1.523,25 lei");
  await expect(page.getByText(/aprox\. 1 h 17 min/)).toBeVisible();
  await page.getByLabel("Mașină avariată (roți blocate)").check();
  await page.getByLabel("Câte roți sunt blocate?").selectOption("2");
  await expect(page.getByText(/se adaugă un supliment, confirmat telefonic/)).toBeVisible();
  await page.getByLabel("Distanța traseului (km)").fill("99999");
  await expect(page.getByText("Introdu o distanță între 1 și 3000 km.")).toBeVisible();
  await expect(page.getByLabel("Distanța traseului (km)")).toHaveAttribute("aria-invalid", "true");
});

test("calculator with address search (Google mocked): pick both places → route → total", async ({ page }) => {
  let routeBody = "";
  await page.route("https://places.googleapis.com/**", async (r) => {
    const input = JSON.parse(r.request().postData() || "{}").input as string;
    const city = input.toLowerCase().startsWith("buc") ? "București, România" : "Cluj-Napoca, România";
    await r.fulfill({ json: { suggestions: [{ placePrediction: { placeId: `id-${city}`, text: { text: city } } }] } });
  });
  await page.route("https://routes.googleapis.com/**", async (r) => {
    routeBody = r.request().postData() || "";
    await r.fulfill({ json: { routes: [{ distanceMeters: 457000, duration: "21024s" }] } });
  });
  await page.goto("http://localhost:3302/calculator/");
  const from = page.getByRole("combobox", { name: "Încărcare" });
  await from.fill("Bucu");
  await page.getByRole("option", { name: "București, România" }).click();
  const to = page.getByRole("combobox", { name: "Destinație" });
  await to.fill("Cluj");
  await expect(page.getByRole("option", { name: "Cluj-Napoca, România" })).toBeVisible();
  await to.press("ArrowDown");
  await to.press("Enter");
  await expect(total(page)).toContainText("2.453,50 lei");
  await expect(page.getByText("aprox. 5 h 50 min")).toBeVisible();
  expect(routeBody).toContain("id-București, România");
});

test("no Google request is made before typing an address", async ({ page }) => {
  const hosts: string[] = [];
  page.on("request", (r) => hosts.push(new URL(r.url()).host));
  await page.goto("http://localhost:3302/calculator/");
  await page.waitForLoadState("networkidle");
  expect(hosts.filter((h) => h.endsWith("googleapis.com"))).toEqual([]);
});

test("mobile menu and sticky call bar @mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Calculează prețul" }).last()).toBeVisible();
  await page.getByRole("button", { name: "Meniu" }).click();
  const menu = page.getByRole("dialog", { name: "Meniu" });
  await menu.getByRole("link", { name: "Servicii" }).click();
  await expect(page).toHaveURL(/\/servicii\/$/);
  await expect(menu).toBeHidden();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("content is static and visible @mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const name of ["Cum funcționează", "Tarife pe kilometru", "Întrebări frecvente"]) {
      const h = page.getByRole("heading", { name });
      await h.scrollIntoViewIfNeeded();
      expect(await h.evaluate((n) => getComputedStyle(n.closest("[data-reveal]") ?? n).opacity)).toBe("1");
    }
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("headline, rates and FAQ are readable", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("cell", { name: "4,4", exact: true })).toBeVisible();
    expect(await page.locator("[data-reveal]").first().evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
  });
});

for (const path of ["/", "/calculator/", "/servicii/", "/contact/", "/termeni/", "/politica-de-confidentialitate/"]) {
  test(`axe: no serious violations on ${path} @mobile`, async ({ page }) => {
    await page.goto(path);
    if (path === "/calculator/") await page.getByLabel("Distanța traseului (km)").fill("120");
    await page.waitForTimeout(500);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("short trips show load/unload fees @mobile", async ({ page }) => {
  await page.goto("/calculator/");
  await page.getByLabel("Distanța traseului (km)").fill("3"); // hatchback: 1,25 × (100 + 100 + 3 × 5,3) = 269,88
  const total = page.locator("[aria-live=polite][aria-atomic=true]").last();
  await expect(total).toContainText("269,88 lei");
  await expect(page.getByText("Taxă încărcare")).toBeVisible();
  await expect(page.getByText("3 km × 5,3 lei")).toBeVisible();
  await page.getByLabel("Distanța traseului (km)").fill("457");
  await expect(total).toContainText("2.453,50 lei");
  await expect(page.getByText("Taxă încărcare")).toBeHidden();
});

test("switching vehicle updates the total on the first click, immediately @mobile", async ({ page }) => {
  await page.goto("/calculator/");
  await page.getByLabel("Distanța traseului (km)").fill("100");
  const total = page.locator("[aria-live=polite][aria-atomic=true]").last();
  const expected: Record<string, string> = { SUV: "1.036,38 lei", Sedan: "773,88 lei", Motocicletă: "536,88 lei", Hatchback: "686,25 lei" };
  for (const [name, value] of Object.entries(expected)) {
    await page.locator("label", { hasText: name }).first().click();
    await expect(total).toContainText(value, { timeout: 300 }); // no counting animation: correct at once
  }
});
