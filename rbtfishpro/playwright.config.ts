import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;
export default defineConfig({
  testDir: "tests",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: { executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" },
  },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled" } },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
  // Production build, with the order/contact "file" sinks and placeholder prices allowed — test only.
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    env: { ORDER_SINK: "file", CONTACT_SINK: "file", ALLOW_PLACEHOLDER_ORDERS: "true", DATA_DIR: "test-results/data" },
  },
});
