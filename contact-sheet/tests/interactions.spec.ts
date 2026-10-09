import { expect, test } from "@playwright/test";

test("filter chips narrow the sheet and announce the count", async ({ page }) => {
  await page.goto("./");
  const frames = page.locator("#sheet ol > li");
  await expect(frames).toHaveCount(9);
  await page.getByRole("button", { name: /^Next\.js/ }).click();
  await expect(frames).toHaveCount(4);
  await expect(page.getByRole("button", { name: /^Next\.js/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#sheet [role=status]")).toHaveText("4 sites shown");
  await page.getByRole("button", { name: /^Hand-written HTML/ }).click();
  await expect(frames).toHaveCount(5);
});

test("loupe opens a modal dialog, Escape closes it, focus returns", async ({ page }) => {
  await page.goto("./");
  const opener = page.getByRole("button", { name: /Loupe: view Riviera/ });
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading")).toHaveText(/Riviera Padel/);
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test("frame link navigates to case notes with facts from the repo", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("link", { name: /Cadru Digital/ }).first().click();
  await expect(page).toHaveURL(/\/work\/cadru-digital\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cadru Digital");
  await expect(page.locator("dl")).toContainText("Next.js 16.3.4");
  await page.getByRole("link", { name: "Sheet" }).first().click();
  await expect(page).toHaveURL(/\/demo\/contact-sheet\/$/);
});

test("page transition morphs the frame (view transition runs, no duplicate names)", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("./");
  await page.evaluate(() => {
    (window as unknown as { __vt: number }).__vt = 0;
    const orig = document.startViewTransition?.bind(document);
    if (orig) document.startViewTransition = ((arg: unknown) => { (window as unknown as { __vt: number }).__vt++; return orig(arg as never); }) as typeof document.startViewTransition;
  });
  await page.getByRole("link", { name: /Riviera Padel/ }).first().click();
  await expect(page).toHaveURL(/riviera-padel/);
  expect(await page.evaluate(() => (window as unknown as { __vt: number }).__vt)).toBeGreaterThan(0);
  expect(errors.filter((e) => /view-transition/i.test(e))).toEqual([]);
});

test("film strip: pinned horizontal scrub on desktop, native scroll on mobile", async ({ page }, info) => {
  await page.goto("./");
  const track = page.locator("#strip ol");
  await page.locator("#strip").scrollIntoViewIfNeeded();
  if (info.project.name === "desktop") {
    const top = await page.evaluate(() => document.querySelector("#strip")!.getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => scrollTo(0, y - 64 + 600), top);
    await page.waitForTimeout(1200);
    const x = await track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
    expect(x).toBeLessThan(-50); // moved left while pinned
  } else {
    const region = page.getByRole("region", { name: /Phone screenshots/ });
    await region.evaluate((el) => el.scrollBy(400, 0));
    expect(await region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
  }
});

test("mobile menu overlays, closes with Escape, links keep the base path", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "menu button is mobile-only");
  await page.goto("./");
  const toggle = page.getByRole("button", { name: "Open menu" });
  await toggle.click();
  const panel = page.locator("header nav[id]");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link", { name: "Sheet" })).toHaveAttribute("href", "/demo/contact-sheet/#sheet");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("hero is in its final state and nothing is pinned", async ({ page }) => {
    await page.goto("./");
    expect(await page.locator(".hero-word > span").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    await page.locator("#strip").scrollIntoViewIfNeeded();
    expect(await page.locator("#strip").evaluate((el) => el.parentElement!.classList.contains("pin-spacer"))).toBe(false);
  });
});

test.describe("no JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("all nine frames and the headline are in the HTML", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("#sheet ol > li")).toHaveCount(9);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Every site we build, on one sheet.");
  });
});
