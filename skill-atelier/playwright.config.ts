import { defineConfig, devices } from "@playwright/test";

// Visual regression + smoke tests against the static export, served exactly as deployed.
const BASE_PATH = process.env.BASE_PATH ?? "";
const PORT = 4199;

export default defineConfig({
  testDir: "tests/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  fullyParallel: true,
  reporter: [["list"]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide" } },
  use: {
    baseURL: `http://127.0.0.1:${PORT}${BASE_PATH}/`,
    launchOptions: { executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" },
  },
  webServer: { command: `npx --yes serve@14 out -l ${PORT} --no-clipboard`, port: PORT, reuseExistingServer: true },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
