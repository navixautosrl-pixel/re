import { expect, test } from "@playwright/test";

// Freeze everything that legitimately changes between runs before comparing pixels.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); // final states, no mid-animation frames
});

test("home: above the fold", async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("home-fold.png");
});

test("tool wall: filtered state", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: /^Motion/ }).click();
  const wall = page.locator("#tools");
  await expect(wall.locator("li")).toHaveCount(9);
  await expect(wall).toHaveScreenshot("tools-motion.png");
});

test("usage section", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("#use")).toHaveScreenshot("usage.png");
});
