// Bake procedural placeholder assets to GLB: `npm run assets:bake`
// Starts a static-only server (no database needed), runs the generators in
// headless Chromium, and writes the GLBs to client/assets/gen/.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { ROOT } from '../server/config.js';
import { serveStatic } from '../server/http.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const OUT = path.join(ROOT, 'client', 'assets', 'gen');

const server = http.createServer((req, res) => serveStatic(req, res, { allowTools: true }));
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e));
  page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(`${base}/tools/bake.html`);
  await page.waitForFunction(() => typeof window.bakeAll === 'function', null, { timeout: 60000 });
  const files = await page.evaluate(() => window.bakeAll());
  let total = 0;
  for (const [rel, b64] of Object.entries(files)) {
    const file = path.join(OUT, rel);
    mkdirSync(path.dirname(file), { recursive: true });
    const buf = Buffer.from(b64, 'base64');
    writeFileSync(file, buf);
    total += buf.length;
    console.log(`${rel.padEnd(36)} ${(buf.length / 1024).toFixed(0).padStart(6)} KB`);
  }
  console.log(`${Object.keys(files).length} files, ${(total / 1048576).toFixed(1)} MB`);
} finally {
  await browser.close();
  server.close();
}
