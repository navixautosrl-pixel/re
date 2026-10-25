// Screenshot the dev asset viewer: node scripts/shot-viewer.mjs out.png "anim=Run&t=0.3"
import { createRequire } from 'node:module';
import http from 'node:http';
import { serveStatic } from '../server/http.js';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [out = 'viewer.png', query = '', size = '1400x800'] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
const server = http.createServer((req, res) => serveStatic(req, res, { allowTools: true }));
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error(m.type(), m.text()); });
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/viewer.html?${query}`);
  await page.waitForFunction(() => window.viewerReady, null, { timeout: 120000 });
  await page.screenshot({ path: out });
  console.log('wrote', out);
} finally { await browser.close(); server.close(); }
