import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("home above the fold", async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("home-fold.png");
});

test("sheet filtered to Next.js", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: /^Next\.js/ }).click();
  await expect(page.locator("#sheet ol > li")).toHaveCount(4);
  await expect(page.locator("#sheet")).toHaveScreenshot("sheet-next.png");
});

test("case notes page", async ({ page }) => {
  await page.goto("./work/pulsar-studio/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("main")).toHaveScreenshot("case-pulsar.png");
});
