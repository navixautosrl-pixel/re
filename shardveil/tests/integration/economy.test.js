import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, query } from '../helpers/server.js';
import { TestClient, createAccountWithCharacter, sleep } from '../helpers/client.js';
import * as eco from '../../server/repo/economy.js';
import { UPGRADE } from '../../shared/data/economy.js';

let srv, acct, c;
const MERCHANT = { x: 16, z: 9 }, SMITH = { x: 15, z: -9 }, KEEPER = { x: -10, z: -8 };
const gold = async () => Number((await query('SELECT gold FROM characters WHERE id = $1', [acct.characterId]))[0].gold);
const setGold = (g) => query('UPDATE characters SET gold = $2 WHERE id = $1', [acct.characterId, g]);
const count = async (defId, container = 'bag') => Number((await query(
  'SELECT coalesce(sum(qty), 0) AS n FROM items WHERE character_id = $1 AND def_id = $2 AND container = $3', [acct.characterId, defId, container]))[0].n);

before(async () => {
  srv = await startTestServer();
  acct = await createAccountWithCharacter(srv.base, 'trader', 'vanguard', 'Marrow');
  await query('UPDATE characters SET x = 0, z = 6, gold = 100 WHERE id = $1', [acct.characterId]);
  c = new TestClient(srv.base);
  await c.connect(acct.token, acct.characterId);
  await c.waitFor((m) => m.t === 'snap');
});
after(async () => { await c.close(); await srv.close(); });

const lastError = () => c.waitFor((m) => m.t === 'error');

test('buying: must be at the shop, item must be stocked, gold must cover it', async () => {
  c.send({ t: 'buy', shop: 'general', item: 'hp_draught', qty: 2 });
  assert.equal((await lastError()).code, 'TOO_FAR');
  await c.walkTo(MERCHANT.x - 2, MERCHANT.z - 2, 0.3);
  c.send({ t: 'buy', shop: 'general', item: 'greymaw_cleaver', qty: 1 });
  assert.equal((await lastError()).code, 'NOT_SOLD');
  c.send({ t: 'buy', shop: 'smith', item: 'warding_wax', qty: 1 }); // wrong NPC
  assert.equal((await lastError()).code, 'TOO_FAR');

  const before = await count('hp_draught');
  c.send({ t: 'buy', shop: 'general', item: 'hp_draught', qty: 2 });
  await c.waitFor((m) => m.t === 'ev' && m.e.some((e) => e.k === 'bought'));
  assert.equal(await gold(), 100 - 24);
  assert.equal(await count('hp_draught'), before + 2);

  c.send({ t: 'buy', shop: 'general', item: 'copper_band', qty: 1 }); // 110 gold
  assert.equal((await lastError()).code, 'NO_GOLD');
  assert.equal(await gold(), 76, 'failed purchase costs nothing');
});

test('buying into a full pack fails without taking gold', async () => {
  const p = srv.world.byCharacter.get(acct.characterId);
  const used = new Set(p.items.filter((i) => i.container === 'bag').map((i) => i.slot));
  const values = [];
  for (let i = 0; i < 40; i++) if (!used.has(i)) values.push(`(${acct.characterId}, 'wolf_pelt', 1, 'bag', ${i}, true)`);
  await query(`INSERT INTO items (character_id, def_id, qty, container, slot, bound) VALUES ${values.join(',')}`);
  await srv.world.refreshInventory(p);
  c.send({ t: 'buy', shop: 'general', item: 'felt_cap', qty: 1 });
  assert.equal((await lastError()).code, 'INVENTORY_FULL');
  assert.equal(await gold(), 76);
  await query("DELETE FROM items WHERE character_id = $1 AND def_id = 'wolf_pelt'", [acct.characterId]);
  await srv.world.refreshInventory(p);
});

test('selling pays the item value; quest items cannot be sold', async () => {
  const p = srv.world.byCharacter.get(acct.characterId);
  await query("INSERT INTO items (character_id, def_id, qty, container, slot) VALUES ($1, 'boar_tusk', 5, 'bag', 20), ($1, 'greymaw_fang', 1, 'bag', 21)", [acct.characterId]);
  await srv.world.refreshInventory(p);
  const g0 = await gold();
  c.send({ t: 'sell', slot: 20 });
  const ev = await c.waitFor((m) => m.t === 'ev' && m.e.some((e) => e.k === 'sold'));
  assert.equal(ev.e.find((e) => e.k === 'sold').g, 15);
  assert.equal(await gold(), g0 + 15);
  c.send({ t: 'sell', slot: 21 });
  assert.equal((await lastError()).code, 'NOT_SELLABLE');
  assert.equal(await count('greymaw_fang'), 1);
});

test('vault: deposit and withdraw move stacks, persist, and merge', async () => {
  const p = srv.world.byCharacter.get(acct.characterId);
  await c.walkTo(KEEPER.x + 2, KEEPER.z + 2, 0.3);
  c.send({ t: 'storageOpen' });
  await c.waitFor((m) => m.t === 'storage');
  await query("INSERT INTO items (character_id, def_id, qty, container, slot) VALUES ($1, 'toad_gland', 3, 'bag', 22), ($1, 'toad_gland', 2, 'bag', 23)", [acct.characterId]);
  await srv.world.refreshInventory(p);
  c.send({ t: 'deposit', slot: 22 });
  await c.waitFor((m) => m.t === 'storage' && m.items.some((i) => i.defId === 'toad_gland'));
  c.send({ t: 'deposit', slot: 23 });
  const st = await c.waitFor((m) => m.t === 'storage' && m.items.some((i) => i.defId === 'toad_gland' && i.qty === 5));
  assert.equal(st.items.filter((i) => i.defId === 'toad_gland').length, 1, 'merged into one stack');
  assert.equal(await count('toad_gland', 'bag'), 0);
  assert.equal(await count('toad_gland', 'storage'), 5);
  const slot = st.items.find((i) => i.defId === 'toad_gland').slot;
  c.send({ t: 'withdraw', slot });
  await c.waitFor((m) => m.t === 'storage' && !m.items.some((i) => i.defId === 'toad_gland'));
  assert.equal(await count('toad_gland', 'bag'), 5);
  const ledger = await query("SELECT action FROM item_ledger WHERE character_id = $1 AND action IN ('deposit', 'withdraw') ORDER BY id", [acct.characterId]);
  assert.deepEqual(ledger.map((r) => r.action), ['deposit', 'deposit', 'withdraw']);
});

test('tempering outcomes follow the configured rules (deterministic rolls)', async () => {
  const id = acct.characterId;
  await query("INSERT INTO items (character_id, def_id, qty, container, slot, upgrade) VALUES ($1, 'harrow_longsword', 1, 'bag', 30, 0), ($1, 'veil_fragment', 50, 'bag', 31, 0), ($1, 'warding_wax', 2, 'bag', 32, 0)", [id]);
  await setGold(10_000);
  const up = async () => Number((await query("SELECT upgrade FROM items WHERE character_id = $1 AND slot = 30 AND container = 'bag'", [id]))[0].upgrade);
  const succeed = () => 0, fail = () => 0.999999;

  let r = await eco.temper(srv.pool, id, 'bag', 30, false, succeed);
  assert.equal(r.success, true); assert.equal(await up(), 1);
  r = await eco.temper(srv.pool, id, 'bag', 30, false, fail);
  assert.equal(r.success, false); assert.equal(await up(), 1, 'low-level failure keeps the level');
  await query("UPDATE items SET upgrade = $2 WHERE character_id = $1 AND slot = 30 AND container = 'bag'", [id, UPGRADE.failDowngradeFrom]);
  r = await eco.temper(srv.pool, id, 'bag', 30, false, fail);
  assert.equal(await up(), UPGRADE.failDowngradeFrom - 1, 'high-level failure drops one level');
  await query("UPDATE items SET upgrade = $2 WHERE character_id = $1 AND slot = 30 AND container = 'bag'", [id, UPGRADE.failDowngradeFrom]);
  const wax0 = await count('warding_wax');
  r = await eco.temper(srv.pool, id, 'bag', 30, true, fail);
  assert.equal(await up(), UPGRADE.failDowngradeFrom, 'warding wax prevents the drop');
  assert.equal(await count('warding_wax'), wax0 - 1, 'and is consumed');

  await query("UPDATE items SET upgrade = $2 WHERE character_id = $1 AND slot = 30 AND container = 'bag'", [id, UPGRADE.maxLevel]);
  await assert.rejects(eco.temper(srv.pool, id, 'bag', 30, false, succeed), /cannot be tempered further/);
  await assert.rejects(eco.temper(srv.pool, id, 'bag', 31, false, succeed), /Only weapons and armour/);

  await setGold(5);
  await query("UPDATE items SET upgrade = 2 WHERE character_id = $1 AND slot = 30 AND container = 'bag'", [id]);
  const frags = await count('veil_fragment');
  await assert.rejects(eco.temper(srv.pool, id, 'bag', 30, false, succeed), /costs/);
  assert.equal(await count('veil_fragment'), frags, 'nothing consumed when gold is short');
  assert.equal(await up(), 2);
});

test('tempering through the forge NPC updates an equipped weapon and the stats', async () => {
  const p = srv.world.byCharacter.get(acct.characterId);
  await setGold(1000);
  await query("UPDATE items SET upgrade = 0 WHERE character_id = $1 AND container = 'equip' AND slot = 0", [acct.characterId]);
  await srv.world.refreshInventory(p);
  p.gold = 1000;
  c.send({ t: 'temper', container: 'equip', slot: 0, protect: false });
  assert.equal((await lastError()).code, 'TOO_FAR');
  await c.walkTo(SMITH.x - 2, SMITH.z + 2, 0.3);
  const atkBefore = p.stats.attack[1];
  c.send({ t: 'temper', container: 'equip', slot: 0, protect: false });
  const ev = (await c.waitFor((m) => m.t === 'ev' && m.e.some((e) => e.k === 'temper'))).e.find((e) => e.k === 'temper');
  await sleep(200);
  const [w] = await query("SELECT upgrade FROM items WHERE character_id = $1 AND container = 'equip' AND slot = 0", [acct.characterId]);
  assert.equal(w.upgrade, ev.to);
  if (ev.ok) assert.ok(p.stats.attack[1] >= atkBefore, 'stats recomputed after tempering');
  const [l] = await query("SELECT gold_delta, meta FROM item_ledger WHERE character_id = $1 AND action = 'temper' ORDER BY id DESC LIMIT 1", [acct.characterId]);
  assert.equal(Number(l.gold_delta), -UPGRADE.levels[0].gold);
  assert.equal(l.meta.success, !!ev.ok);
});
