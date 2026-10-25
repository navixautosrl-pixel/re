// Real-browser end-to-end check: two headless Chromium pages play together on
// one locally started server. Writes screenshots to test-artifacts/.
//   npm run test:browser
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { startTestServer, query } from '../helpers/server.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const OUT = path.resolve('test-artifacts');
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const failures = [];
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failures.push(msg); };

const srv = await startTestServer();
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

// Screenshots are taken at a fixed time of day; the real game follows the server clock.
function setTimeOfDay(page, phase) {
  return page.evaluate((ph) => { const g = window.shardveil.game; g.dayStart = performance.now() / 1000 - ph * g.dayLength; }, phase);
}

async function openPlayer(name, user, cls, viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('/api/')) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(srv.base + '/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('#login-form:not([hidden])', { timeout: 90000 });
  if (user === 'browser_a') { await sleep(1500); await page.screenshot({ path: path.join(OUT, '00-login.png') }); }
  await page.click('#show-register');
  await page.fill('#register-form [name=username]', user);
  await page.fill('#register-form [name=password]', 'correct-horse-9');
  await page.fill('#register-form [name=password2]', 'correct-horse-9');
  await page.click('#register-form [type=submit]');
  await page.waitForSelector('#screen-select:not([hidden])');
  await page.click('#new-char');
  await page.click(`#class-options input[value=${cls}] + .cl-name`);
  await page.fill('#create-form [name=name]', name);
  await page.click('#create-form [type=submit]');
  await page.waitForSelector('#screen-select:not([hidden]) #enter-world:not([disabled])');
  return { page, errors };
}

try {
  const A = await openPlayer('Wren', 'browser_a', 'arcanist', { width: 1440, height: 900 });
  await A.page.screenshot({ path: path.join(OUT, '01-character-select.png') });
  // Put A just outside the south gate so a fight is a short walk away.
  const [{ id: aId }] = await query("SELECT id FROM characters WHERE name = 'Wren'");
  // Start beside Warden Ilsa, facing her.
  await query('UPDATE characters SET x = 3, z = 4.5, ry = 0 WHERE id = $1', [aId]);
  await A.page.click('#enter-world');
  await A.page.waitForSelector('#hud:not([hidden])', { timeout: 15000 });
  await setTimeOfDay(A.page, 0.42);
  await sleep(2500);
  const mark = await A.page.evaluate(() => window.shardveil.game.questUi.markerFor('warden_ilsa'));
  check(mark === '!', 'Warden Ilsa shows an available-quest marker');
  // Click on the NPC model where it is drawn on screen.
  const spot = await A.page.evaluate(() => {
    const g = window.shardveil.game;
    const npc = [...g.entities.values()].find((e) => e.type === 'npc' && e.npc.id === 'warden_ilsa');
    const v = npc.model.root.position.clone(); v.y += 1.1; v.project(g.camera);
    return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight };
  });
  await A.page.mouse.click(spot.x, spot.y);
  await A.page.waitForSelector('#win-dialog:not([hidden]) .quest .btn.primary', { timeout: 10000 });
  await A.page.screenshot({ path: path.join(OUT, '02a-quest-offer.png') });
  await A.page.click('#win-dialog .quest .btn.primary');
  await A.page.waitForFunction(() => document.querySelector('#tracker')?.textContent.includes('Embers at the Gate'), null, { timeout: 10000 });
  check(true, 'quest accepted through the NPC dialogue and shown in the tracker');
  await A.page.keyboard.press('Escape');
  // Server-side teleport (test setup) to the wolf meadow.
  srv.world.teleportPlayer(srv.world.byCharacter.get(aId), 0, 60);
  await sleep(1500);
  await A.page.screenshot({ path: path.join(OUT, '02-in-world.png') });
  check(await A.page.$eval('#self-name', (e) => e.textContent) === 'Wren', 'HUD shows the character name');

  const startPos = await A.page.evaluate(() => { const p = window.shardveil.game.player.position; return [p.x, p.z]; });
  await A.page.keyboard.down('KeyW');
  await sleep(1500);
  await A.page.keyboard.up('KeyW');
  await sleep(400);
  const endPos = await A.page.evaluate(() => { const p = window.shardveil.game.player.position; return [p.x, p.z]; });
  const moved = Math.hypot(endPos[0] - startPos[0], endPos[1] - startPos[1]);
  check(moved > 4, `W key moves the character (${moved.toFixed(1)} m)`);
  const serverPos = srv.world.byCharacter.get(aId);
  check(Math.hypot(serverPos.x - endPos[0], serverPos.z - endPos[1]) < 1, 'server accepted the predicted position');

  // Target the nearest wolf with Tab and attack with Space until it dies.
  await A.page.keyboard.press('Tab');
  await sleep(200);
  const targetId = await A.page.evaluate(() => window.shardveil.game.targetId);
  check(targetId !== null, 'Tab selects a target');
  await A.page.screenshot({ path: path.join(OUT, '03-targeted.png') });
  await A.page.keyboard.press('Space');
  let killed = false;
  for (let i = 0; i < 120 && !killed; i++) {
    await sleep(500);
    killed = !srv.world.monsters.get(targetId) || srv.world.monsters.get(targetId).dead;
    if (i === 6) await A.page.screenshot({ path: path.join(OUT, '04-combat.png') });
    if (i % 10 === 9) await A.page.keyboard.press('Space');
  }
  check(killed, 'auto-attack kills the targeted monster');
  await sleep(600);
  const xp = await A.page.evaluate(() => window.shardveil.game.me.xp);
  check(xp > 0, `XP shown in the client (${xp})`);
  await A.page.waitForFunction(() => document.querySelector('#tracker')?.textContent.includes('1/5'), null, { timeout: 10000 }).catch(() => {});
  check((await A.page.$eval('#tracker', (e) => e.textContent)).includes('Dusk Wolf slain: 1/5'), 'quest tracker counts the kill');
  await A.page.keyboard.press('KeyZ');
  await sleep(2500);
  await A.page.keyboard.press('KeyZ');
  await sleep(1500);
  await A.page.keyboard.press('KeyI');
  await sleep(300);
  await A.page.screenshot({ path: path.join(OUT, '05-loot-and-pack.png') });
  const chat = await A.page.$eval('#chat-log', (e) => e.textContent);
  check(/pick up \d+ gold|You receive/.test(chat), 'loot pickup reported in chat');
  await A.page.keyboard.press('KeyI');
  await A.page.keyboard.press('KeyC');
  await sleep(300);
  await A.page.screenshot({ path: path.join(OUT, '06-character.png') });
  await A.page.keyboard.press('KeyC');

  // Second player joins and they see each other.
  const B = await openPlayer('Tamsin', 'browser_b', 'vanguard', { width: 1280, height: 720 });
  const [{ id: bId }] = await query("SELECT id FROM characters WHERE name = 'Tamsin'");
  const aSrv = srv.world.byCharacter.get(aId);
  await query('UPDATE characters SET x = $2, z = $3 WHERE id = $1', [bId, aSrv.x + 3, aSrv.z + 3]);
  await B.page.click('#enter-world');
  await B.page.waitForSelector('#hud:not([hidden])', { timeout: 30000 });
  await setTimeOfDay(B.page, 0.7);
  await sleep(2500);
  const bSeesA = await B.page.evaluate(() => [...window.shardveil.game.entities.values()].some((e) => e.type === 'player' && e.name === 'Wren'));
  const aSeesB = await A.page.evaluate(() => [...window.shardveil.game.entities.values()].some((e) => e.type === 'player' && e.name === 'Tamsin'));
  check(bSeesA && aSeesB, 'two browser clients see each other');
  await B.page.keyboard.press('Enter');
  await B.page.keyboard.type('Well met, Wren.');
  await B.page.keyboard.press('Enter');
  await sleep(600);
  const aChat = await A.page.$eval('#chat-log', (e) => e.textContent);
  check(aChat.includes('Tamsin: Well met, Wren.'), 'chat from B appears for A');
  await B.page.screenshot({ path: path.join(OUT, '07-second-player-view.png') });
  await A.page.screenshot({ path: path.join(OUT, '08-first-player-view.png') });

  // Night-time look at Emberford.
  await setTimeOfDay(A.page, 0.93);
  await sleep(800);
  await A.page.screenshot({ path: path.join(OUT, '09-night.png') });

  // Responsive: a narrow window must not overflow horizontally.
  await A.page.setViewportSize({ width: 1024, height: 640 });
  await sleep(400);
  const overflow = await A.page.evaluate(() => { scrollTo(9999, 0); return scrollX; });
  check(overflow === 0, 'no horizontal overflow at 1024px');
  await A.page.screenshot({ path: path.join(OUT, '10-1024px.png') });

  // Frame rate under software rendering (no GPU in this environment).
  const fps = await A.page.evaluate(() => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(n / 3); };
    requestAnimationFrame(f);
  }));
  console.log(`INFO  frame rate with SwiftShader software rendering: ${fps.toFixed(1)} fps`);

  for (const [who, p] of [['A', A], ['B', B]]) {
    check(p.errors.length === 0, `no console errors or failed requests (${who})${p.errors.length ? ': ' + p.errors.slice(0, 3).join(' | ') : ''}`);
  }
} catch (err) {
  failures.push(String(err));
  console.error(err);
} finally {
  await browser.close();
  await srv.close();
}
console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll browser checks passed');
process.exit(failures.length ? 1 : 0);
