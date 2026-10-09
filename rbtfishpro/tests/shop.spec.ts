import { readFileSync, existsSync, rmSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ORDERS = "test-results/data/orders.jsonl";
const CONTACT = "test-results/data/contact.jsonl";

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}
const cartCount = (page: Page) => page.getByRole("banner").getByRole("link", { name: /^Coș/ });

test.beforeAll(() => {
  for (const f of [ORDERS, CONTACT]) if (existsSync(f)) rmSync(f);
});

test("home renders, hero CTA works, no console errors @mobile", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Boilies\s*pentru crap/i);
  await expect(page.getByRole("link", { name: "Descoperă boiliesurile" }).first()).toBeVisible();
  await expect(page.locator("#gama article")).toHaveCount(4);
  await page.getByRole("link", { name: "Descoperă boiliesurile" }).first().click();
  await expect(page).toHaveURL(/\/magazin$/);
  expect(errors).toEqual([]);
});

test("cart: variant, quantity, maths, persistence, remove", async ({ page }) => {
  await page.goto("/produse/boilies-birdfood-scopex");
  await page.getByText("24 mm", { exact: true }).click();
  await page.getByRole("button", { name: "Crește cantitatea" }).click();
  await page.getByRole("button", { name: "Adaugă în coș" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Adăugat" })).toContainText("2 × Birdfood Scopex, 24 mm");
  await expect(cartCount(page)).toHaveAccessibleName("Coș: 2 pungi");

  await page.goto("/produse/boilies-fishmeal");
  await page.getByRole("button", { name: "Adaugă în coș" }).click(); // 20 mm default
  await expect(cartCount(page)).toHaveAccessibleName("Coș: 3 pungi");

  await page.reload(); // persisted in localStorage
  await expect(cartCount(page)).toHaveAccessibleName("Coș: 3 pungi");

  await page.goto("/cos");
  const main = page.getByRole("main");
  await expect(main.getByText("Birdfood Scopex", { exact: true })).toBeVisible();
  await expect(main.getByText("24 mm · 55,00 RON / pungă")).toBeVisible();
  // 2 × 55 + 1 × 50 = 160
  await expect(main.getByRole("definition").filter({ hasText: "160,00" }).first()).toBeVisible();
  await page.getByRole("group", { name: /Fishmeal 20 mm/ }).getByRole("button", { name: "Crește cantitatea" }).click();
  await expect(main.getByRole("definition").filter({ hasText: "210,00" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Elimină Fishmeal 20 mm" }).click();
  await page.getByRole("button", { name: "Elimină Birdfood Scopex 24 mm" }).click();
  await expect(main.getByText("Coșul e gol.")).toBeVisible();
  await expect(cartCount(page)).toHaveAccessibleName("Coș: gol");
});

test("shop: search, range filter, sort, empty state, URL", async ({ page }) => {
  await page.goto("/magazin");
  const cards = page.locator("main article");
  await expect(cards).toHaveCount(4);
  await page.getByLabel("Caută").fill("capsuna"); // diacritic-insensitive
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Birdfood Căpșună");
  await page.getByLabel("Caută").fill("");
  await page.getByRole("button", { name: /^Birdfood/ }).click();
  await expect(cards).toHaveCount(2);
  await expect(page).toHaveURL(/baza=birdfood/);
  await page.getByRole("button", { name: /^Toate/ }).click();
  await page.getByLabel("Ordonează").selectOption("pret-asc");
  await expect(cards.first()).toContainText("Fishmeal");
  await expect(cards.first()).toContainText("50,00");
  await page.getByLabel("Caută").fill("somon");
  await expect(page.getByText("Nicio rețetă nu se potrivește")).toBeVisible();
  await page.getByRole("button", { name: "Arată toate" }).click();
  await expect(cards).toHaveCount(4);
  await page.goto("/magazin?baza=fishmeal");
  await expect(cards).toHaveCount(2);
});

test("checkout: validation errors, then a successful order", async ({ page }) => {
  await page.goto("/produse/boilies-fishmeal-squid-pruna");
  await page.getByRole("button", { name: "Adaugă în coș" }).click();
  await page.goto("/finalizare-comanda");
  await page.getByRole("button", { name: "Trimite comanda" }).click();
  await expect(page.getByText("Verifică câmpurile marcate:")).toBeVisible();
  await expect(page.getByLabel("Nume și prenume")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Alege județul.").first()).toBeVisible();

  await page.getByLabel("Nume și prenume").fill("Test Pescar");
  await page.getByLabel("Telefon").fill("0712 345 678");
  await page.getByLabel("E-mail").fill("test@example.com");
  await page.getByLabel("Județ").selectOption("Teleorman");
  await page.getByLabel("Localitate").fill("Alexandria");
  await page.getByLabel("Adresă").fill("Str. Test nr. 1");
  await page.getByLabel(/Am citit și accept/).check();
  await page.getByRole("button", { name: "Trimite comanda" }).click();

  await expect(page).toHaveURL(/\/comanda-trimisa$/);
  await expect(page.getByText(/^RBT-\d{6}-[0-9A-F]{6}$/)).toBeVisible();
  await expect(page.getByText("1 × Fishmeal Squid & Prună, 20 mm")).toBeVisible();
  await expect(cartCount(page)).toHaveAccessibleName("Coș: gol");

  const order = JSON.parse(readFileSync(ORDERS, "utf8").trim().split("\n").at(-1)!);
  expect(order.totalBani).toBe(5500);
  expect(order.customer.county).toBe("Teleorman");
  expect(order.pricesConfirmed).toBe(false);
});

test("orders API: server prices, rejects cross-site and invalid input", async ({ request, baseURL }) => {
  const base = {
    name: "Test Pescar", phone: "0712345678", email: "t@example.com", county: "Olt", city: "Slatina",
    address: "Str. Test nr. 2", payment: "ramburs", terms: true,
  };
  const forged = await request.post("/api/orders", { headers: { origin: "https://evil.example" }, data: { ...base, items: [{ slug: "boilies-fishmeal", diameter: 20, qty: 1 }] } });
  expect(forged.status()).toBe(403);
  const tooMany = await request.post("/api/orders", { headers: { origin: baseURL! }, data: { ...base, items: [{ slug: "boilies-fishmeal", diameter: 20, qty: 99 }] } });
  expect(tooMany.status()).toBe(422);
  // A client-sent price is ignored: the server prices from the catalogue.
  const ok = await request.post("/api/orders", { headers: { origin: baseURL! }, data: { ...base, items: [{ slug: "boilies-fishmeal", diameter: 24, qty: 2, price: 1 }] } });
  expect(ok.status()).toBe(200);
  expect((await ok.json()).summary.totalBani).toBe(10000);
});

test("contact form: validation and success", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Trimite mesajul" }).click();
  await expect(page.getByText("Scrie numele complet.")).toBeVisible();
  await expect(page.getByLabel("Nume", { exact: true })).toBeFocused();
  await page.getByLabel("Nume", { exact: true }).fill("Ion Test");
  await page.getByLabel("E-mail").fill("ion@example.com");
  await page.getByLabel("Mesaj").fill("Ce diametru recomandați pentru Dunăre?");
  await page.getByLabel(/Sunt de acord/).check();
  await page.getByRole("button", { name: "Trimite mesajul" }).click();
  await expect(page.getByText("Mesaj trimis. Mulțumim!")).toBeVisible();
  expect(readFileSync(CONTACT, "utf8")).toContain("Dunăre");
});

test("mobile menu opens, navigates and closes @mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  await page.getByRole("button", { name: "Meniu" }).click();
  const menu = page.getByRole("dialog", { name: "Meniu" });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await page.getByRole("button", { name: "Meniu" }).click();
  await menu.getByRole("link", { name: "Contact" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(menu).toBeHidden();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("everything visible without animation @mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const h of ["Patru rețete", "Ce scrie pe pungă", "Ce rețetă iei la apă?"]) {
      const el = page.getByRole("heading", { name: new RegExp(h) });
      await el.scrollIntoViewIfNeeded();
      expect(await el.evaluate((n) => getComputedStyle(n.closest("[data-reveal]") ?? n).opacity)).toBe("1");
    }
    await page.locator("[data-story-fact]").first().scrollIntoViewIfNeeded();
    expect(await page.locator("[data-story-fact]").first().evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("catalogue and content are readable", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#gama article")).toHaveCount(4);
    expect(await page.locator("[data-story-fact]").first().evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    expect(await page.locator("[data-reveal]").first().evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    await page.goto("/magazin");
    await expect(page.locator("main article")).toHaveCount(4);
  });
});

for (const path of ["/", "/magazin", "/produse/boilies-fishmeal", "/cos", "/finalizare-comanda", "/contact", "/despre-noi", "/intrebari-frecvente", "/termeni-si-conditii"]) {
  test(`axe: no serious violations on ${path} @mobile`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(600);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
  });
}

test("visual baseline: product page", async ({ page }) => {
  await page.goto("/produse/boilies-birdfood-capsuni");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("product-capsuni.png");
});
