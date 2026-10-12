import { defineConfig, devices } from "@playwright/test";

// `npm test` builds two exports first (scripts/test-build.sh): out/ (no Maps key → manual km)
// and out-maps/ (dummy key → address search; Google calls are mocked in the tests).
export default defineConfig({
  testDir: "tests",
  workers: 1,
  reporter: [["list"]],
  use: { launchOptions: { executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" } },
  projects: [
    { name: "unit", testMatch: /\.unit\.ts$/ },
    { name: "desktop", testMatch: /\.spec\.ts$/, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, baseURL: "http://localhost:3301" } },
    { name: "mobile", testMatch: /\.spec\.ts$/, grep: /@mobile/, use: { ...devices["Pixel 7"], baseURL: "http://localhost:3301" } },
  ],
  webServer: [
    { command: "node scripts/serve.mjs 3301 out", url: "http://localhost:3301", reuseExistingServer: false },
    { command: "node scripts/serve.mjs 3302 out-maps", url: "http://localhost:3302", reuseExistingServer: false },
  ],
});
