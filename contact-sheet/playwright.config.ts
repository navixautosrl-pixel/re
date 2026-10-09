import { defineConfig, devices } from "@playwright/test";

// Tests run against the static export served under the real subpath (BASE_PATH build).
const BASE_PATH = process.env.BASE_PATH ?? "/demo/contact-sheet";
const PORT = 4299;

export default defineConfig({
  testDir: "tests",
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  fullyParallel: true,
  reporter: [["list"]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide" } },
  use: {
    baseURL: `http://127.0.0.1:${PORT}${BASE_PATH}/`,
    launchOptions: { executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" },
  },
  webServer: { command: `node scripts/serve.mjs ${PORT} ${BASE_PATH}`, port: PORT, reuseExistingServer: true },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
