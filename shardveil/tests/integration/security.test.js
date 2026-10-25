// Server authority: clients that lie about position, range, cooldowns or
// loot get corrected or refused, and nothing is granted twice.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, query } from '../helpers/server.js';
import { TestClient, createAccountWithCharacter, sleep } from '../helpers/client.js';
import { PROTOCOL_VERSION } from '../../shared/protocol.js';

let srv, acct, c;
before(async () => {
  srv = await startTestServer();
  acct = await createAccountWithCharacter(srv.base, 'cheater', 'vanguard', 'Crook');
  await query('UPDATE characters SET x = 0, z = 58');
  c = new TestClient(srv.base);
  await c.connect(acct.token, acct.characterId);
  await c.waitFor((m) => m.t === 'snap');
});
after(async () => { await c.close(); await srv.close(); });

test('teleport / speed hack is corrected back to the server position', async () => {
  const before = { x: c.x, z: c.z };
  c.send({ t: 'move', x: before.x + 60, z: before.z + 10, ry: 0 });
  const fix = await c.waitFor((m) => m.t === 'correct');
  assert.ok(Math.hypot(fix.x - before.x, fix.z - before.z) < 1, 'snapped back');
  const p = srv.world.byCharacter.get(acct.characterId);
  assert.ok(Math.hypot(p.x - before.x, p.z - before.z) < 1, 'server never accepted the jump');
});

test('walking into water or out of the world is refused', async () => {
  c.send({ t: 'move', x: Number.NaN, z: 5, ry: 0 });
  c.send({ t: 'move', x: 1e9, z: 5, ry: 0 });
  await c.waitFor((m) => m.t === 'correct');
  const p = srv.world.byCharacter.get(acct.characterId);
  assert.ok(Number.isFinite(p.x) && Math.abs(p.x) < 200);
});

test('attacking out of range is refused and does no damage', async () => {
  const far = [...c.entities.m.values()].find((m) => Math.hypot(m.x - c.x, m.z - c.z) > 8);
  const target = far || c.nearestMonster();
  const hpBefore = srv.world.monsters.get(target.i).hp;
  c.send({ t: 'attack', target: target.i });
  const err = await c.waitFor((m) => m.t === 'error');
  assert.equal(err.code, 'OUT_OF_RANGE');
  assert.equal(srv.world.monsters.get(target.i).hp, hpBefore);
});

test('attack spam is limited by the server-side cooldown', async () => {
  const wolf = c.nearestMonster('dusk_wolf');
  await c.walkTo(wolf.x, wolf.z, 2);
  await sleep(100);
  const start = c.events.length;
  for (let i = 0; i < 30; i++) c.send({ t: 'attack', target: wolf.i }); // 30 requests in one burst
  await sleep(1200);
  const hits = c.events.slice(start).filter((e) => e.k === 'dmg' && e.s === c.id && e.t === wolf.i);
  assert.ok(hits.length <= 2, `only cooldown-permitted hits landed (${hits.length})`);
});

test('a loot pile can only be granted once, even when requested in a burst', async () => {
  const wolf = c.nearestMonster('dusk_wolf');
  await c.fight(wolf.i, 'vanguard', 45000);
  await sleep(300);
  const pile = [...c.entities.l.values()].find((l) => l.df === 'gold');
  assert.ok(pile, 'gold dropped');
  await c.walkTo(pile.x, pile.z, 1);
  const goldBefore = (await query('SELECT gold FROM characters WHERE id = $1', [acct.characterId]))[0].gold;
  for (let i = 0; i < 10; i++) c.send({ t: 'pickup', id: pile.i });
  await sleep(800);
  const goldAfter = (await query('SELECT gold FROM characters WHERE id = $1', [acct.characterId]))[0].gold;
  assert.equal(Number(goldAfter) - Number(goldBefore), pile.q, 'granted exactly once');
  const rows = await query("SELECT count(*)::int AS n FROM item_ledger WHERE meta->>'lootId' = $1", [String(pile.i)]);
  assert.equal(rows[0].n, 1);
});

test('using, equipping or destroying slots you do not own does nothing', async () => {
  const goldBefore = c.you.g;
  c.send({ t: 'use', slot: 35 });
  c.send({ t: 'equip', slot: 36 });
  c.send({ t: 'drop', slot: -1 });
  c.send({ t: 'moveItem', from: 0, to: 9999 });
  const err = await c.waitFor((m) => m.t === 'error');
  assert.ok(['NO_ITEM', 'BAD_SLOT'].includes(err.code));
  await sleep(200);
  assert.equal(c.you.g, goldBefore);
});

test('handshake rejects bad tokens and stale protocol versions', async () => {
  const { default: WebSocket } = await import('ws');
  const tryHello = (hello) => new Promise((resolve) => {
    const ws = new WebSocket(srv.base.replace('http', 'ws') + '/ws');
    ws.on('open', () => ws.send(JSON.stringify(hello)));
    ws.on('message', (d) => { const m = JSON.parse(d); if (m.t === 'error') { resolve(m.code); ws.close(); } });
  });
  assert.equal(await tryHello({ t: 'hello', v: PROTOCOL_VERSION, token: 'x'.repeat(43), characterId: acct.characterId }), 'AUTH');
  assert.equal(await tryHello({ t: 'hello', v: 0, token: acct.token, characterId: acct.characterId }), 'VERSION');
});
