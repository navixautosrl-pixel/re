// First playable milestone, exercised end to end over the real protocol:
// enter the world, fight a monster, kill it, gain XP and loot, use and equip
// items, log out, log back in, and find everything persisted.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, query } from '../helpers/server.js';
import { TestClient, createAccountWithCharacter, sleep } from '../helpers/client.js';

let srv, acct;
before(async () => {
  srv = await startTestServer();
  acct = await createAccountWithCharacter(srv.base, 'hero_one', 'vanguard', 'Hollis');
  // Start the test just outside the south gate, near the Greenhollow wolves.
  await query('UPDATE characters SET x = 0, z = 58 WHERE id = $1', [acct.characterId]);
});
after(async () => { await srv.close(); });

test('kill a monster, receive XP and loot, and have it all persist across reconnects', async () => {
  const c = new TestClient(srv.base);
  const welcome = await c.connect(acct.token, acct.characterId);
  assert.equal(welcome.character.name, 'Hollis');
  await c.waitFor((m) => m.t === 'snap');

  const wolf = c.nearestMonster('dusk_wolf');
  assert.ok(wolf, 'a Dusk Wolf is in view');
  const killed = await c.fight(wolf.i, 'vanguard', 45000);
  assert.ok(killed, 'monster died');
  await sleep(300);
  const xpEvent = c.events.find((e) => e.k === 'xp');
  assert.ok(xpEvent && xpEvent.a > 0, 'xp awarded');
  assert.ok(c.you.xp > 0 || c.you.lv > 1);

  const loot = [...c.entities.l.values()];
  assert.ok(loot.length >= 1, 'loot dropped (gold is always rolled for wolves)');
  for (const l of loot) {
    await c.walkTo(l.x, l.z, 1.2);
    c.send({ t: 'pickup', id: l.i });
    await c.waitFor((m) => m.t === 'ev' && m.e.some((e) => e.k === 'loot' && e.df === l.df) || m.t === 'error', 3000);
  }
  await sleep(200);
  const goldAfter = c.you.g;
  assert.ok(goldAfter > 25, `gold increased from starting 25 (now ${goldAfter})`);
  const ledger = await query("SELECT action FROM item_ledger WHERE character_id = $1 AND action LIKE 'loot%'", [acct.characterId]);
  assert.ok(ledger.length >= 1, 'pickups are recorded in the ledger');

  const level = c.you.lv, xp = c.you.xp;
  const posX = c.x, posZ = c.z;
  const invCount = c.inventory.length;
  await c.close();
  await sleep(300);

  const [row] = await query('SELECT level, xp, gold, x, z FROM characters WHERE id = $1', [acct.characterId]);
  assert.equal(row.level, level);
  assert.equal(Number(row.xp), xp);
  assert.equal(Number(row.gold), goldAfter);
  assert.ok(Math.hypot(row.x - posX, row.z - posZ) < 0.6, 'position saved on logout');

  const again = new TestClient(srv.base);
  const w2 = await again.connect(acct.token, acct.characterId);
  assert.equal(w2.character.level, level);
  assert.equal(w2.character.xp, xp);
  assert.equal(w2.character.gold, goldAfter);
  assert.equal(w2.inventory.length, invCount, 'inventory restored');
  await again.close();
});

test('use a potion and equip / unequip gear through the server', async () => {
  const c = new TestClient(srv.base);
  await c.connect(acct.token, acct.characterId);
  await c.waitFor((m) => m.t === 'snap');
  const potion = c.inventory.find((i) => i.defId === 'hp_draught');
  assert.ok(potion, 'starter potions present');
  c.send({ t: 'use', slot: potion.slot });
  await c.waitFor((m) => m.t === 'inv');
  const after = c.inventory.find((i) => i.id === potion.id);
  assert.equal(after ? after.qty : 0, potion.qty - 1, 'one potion consumed');
  // Potion cooldown is enforced server-side.
  c.send({ t: 'use', slot: potion.slot });
  const err = await c.waitFor((m) => m.t === 'error');
  assert.equal(err.code, 'COOLDOWN');

  const body = c.inventory.find((i) => i.container === 'equip' && i.slot === 2);
  assert.ok(body, 'padded vest equipped');
  c.send({ t: 'unequip', slot: 'body' });
  await c.waitFor((m) => m.t === 'inv');
  const moved = c.inventory.find((i) => i.id === body.id);
  assert.equal(moved.container, 'bag');
  const defBefore = c.self?.stats?.defense;
  c.send({ t: 'equip', slot: moved.slot });
  await c.waitFor((m) => m.t === 'inv');
  assert.equal(c.inventory.find((i) => i.id === body.id).container, 'equip');
  await sleep(100);
  if (defBefore !== undefined) assert.ok(c.self.stats.defense > defBefore, 'defense recalculated');

  // Class restriction enforced: give this Vanguard an Arcanist staff and try it.
  await query("INSERT INTO items (character_id, def_id, qty, container, slot) VALUES ($1, 'ash_staff', 1, 'bag', 39)", [acct.characterId]);
  c.send({ t: 'equip', slot: 39 });
  const wrong = await c.waitFor((m) => m.t === 'error');
  assert.equal(wrong.code, 'WRONG_CLASS');
  await c.close();
});

test('graceful shutdown saves every online player', async () => {
  const c = new TestClient(srv.base);
  await c.connect(acct.token, acct.characterId);
  await c.waitFor((m) => m.t === 'snap');
  await c.walkTo(c.x + 3, c.z + 2, 0.1);
  const x = c.x, z = c.z;
  await sleep(150);
  await srv.close();
  const [row] = await query('SELECT x, z FROM characters WHERE id = $1', [acct.characterId]);
  assert.ok(Math.hypot(row.x - x, row.z - z) < 0.6, 'position written during shutdown');
  // Restart for the after() hook (close is idempotent).
  srv = { close: async () => {} };
});
