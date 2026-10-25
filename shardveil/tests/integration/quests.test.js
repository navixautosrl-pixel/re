import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, query } from '../helpers/server.js';
import { TestClient, createAccountWithCharacter, sleep } from '../helpers/client.js';

let srv, acct, c;
const WARDEN = { x: 3, z: 9 }, BRAM = { x: -10, z: -8 };
before(async () => {
  srv = await startTestServer();
  acct = await createAccountWithCharacter(srv.base, 'questor', 'shadeblade', 'Quill');
  await query('UPDATE characters SET x = 3, z = 7 WHERE id = $1', [acct.characterId]);
  c = new TestClient(srv.base);
  await c.connect(acct.token, acct.characterId);
  await c.waitFor((m) => m.t === 'snap');
});
after(async () => { await c.close(); await srv.close(); });

const questState = (id) => c.messages.filter((m) => m.t === 'quests').at(-1)?.q.find((q) => q.id === id);

test('accept rules: must be at the giver, prerequisites and level enforced', async () => {
  c.send({ t: 'questAccept', quest: 'pelts_for_the_hall' });
  assert.equal((await c.waitFor((m) => m.t === 'error')).code, 'QUEST_UNAVAILABLE');
  c.send({ t: 'questAccept', quest: 'thornback_trouble' }); // level 4
  assert.equal((await c.waitFor((m) => m.t === 'error')).code, 'QUEST_UNAVAILABLE');
  c.send({ t: 'questAccept', quest: 'the_mires_bounty' }); // level 3
  assert.equal((await c.waitFor((m) => m.t === 'error')).code, 'QUEST_UNAVAILABLE');

  c.send({ t: 'questAccept', quest: 'embers_at_the_gate' });
  c.send({ t: 'questAccept', quest: 'embers_at_the_gate' }); // duplicate is ignored
  await c.waitFor((m) => m.t === 'quests' && m.q.some((q) => q.id === 'embers_at_the_gate'));
  const rows = await query('SELECT state FROM quest_progress WHERE character_id = $1', [acct.characterId]);
  assert.deepEqual(rows.map((r) => r.state), ['active']);
});

test('kills by the character advance the objective and persist', async () => {
  await c.walkTo(0, 40, 0.5);
  await c.walkTo(0, 62, 0.5);
  await sleep(300);
  const wolf = c.nearestMonster('dusk_wolf');
  assert.ok(await c.fight(wolf.i, 'shadeblade', 45000));
  await c.waitFor((m) => m.t === 'quests' && m.q.find((q) => q.id === 'embers_at_the_gate')?.progress?.[0] === 1, 5000, true);
  const [row] = await query("SELECT progress FROM quest_progress WHERE character_id = $1 AND quest_id = 'embers_at_the_gate'", [acct.characterId]);
  assert.equal(row.progress['0'], 1);
});

test('turn-in pays rewards exactly once, only at the giver, only when complete', async () => {
  c.send({ t: 'questTurnIn', quest: 'embers_at_the_gate' });
  assert.equal((await c.waitFor((m) => m.t === 'error')).code, 'TOO_FAR');

  await c.walkTo(0, 40, 0.5);
  await c.walkTo(WARDEN.x, WARDEN.z - 2, 0.5);
  c.send({ t: 'questTurnIn', quest: 'embers_at_the_gate' });
  assert.equal((await c.waitFor((m) => m.t === 'error')).code, 'QUEST_INCOMPLETE');

  // Test shortcut: credit the remaining four kills directly on the server
  // (killing five wolves is covered by the objective test above at 1/5).
  const p = srv.world.byCharacter.get(acct.characterId);
  const fakeWolf = { def: { id: 'dusk_wolf' } };
  for (let i = 0; i < 4; i++) srv.world.quests.onKill(p, fakeWolf);
  await sleep(300);

  const goldBefore = c.you.g, xpBefore = c.you.xp, lvBefore = c.you.lv;
  const potionsBefore = c.inventory.filter((i) => i.defId === 'hp_draught').reduce((s, i) => s + i.qty, 0);
  for (let i = 0; i < 5; i++) c.send({ t: 'questTurnIn', quest: 'embers_at_the_gate' });
  await c.waitFor((m) => m.t === 'ev' && m.e.some((e) => e.k === 'qdone'));
  await sleep(500);
  assert.equal(c.you.g - goldBefore, 20);
  assert.ok(c.you.xp > xpBefore || c.you.lv > lvBefore);
  const potionsAfter = c.inventory.filter((i) => i.defId === 'hp_draught').reduce((s, i) => s + i.qty, 0);
  assert.equal(potionsAfter - potionsBefore, 3);
  const ledger = await query("SELECT count(*)::int AS n FROM item_ledger WHERE character_id = $1 AND action = 'quest_reward_gold'", [acct.characterId]);
  assert.equal(ledger[0].n, 1, 'reward gold granted once despite five requests');
  assert.equal(questState('embers_at_the_gate').state, 'completed');
});

test('collect quest consumes the items and grants the reward atomically', async () => {
  const p = srv.world.byCharacter.get(acct.characterId);
  p.level = Math.max(p.level, 2);
  await c.walkTo(BRAM.x + 2, BRAM.z + 1, 0.3);
  c.send({ t: 'questAccept', quest: 'pelts_for_the_hall' });
  await c.waitFor((m) => m.t === 'quests' && m.q.some((q) => q.id === 'pelts_for_the_hall'));
  // Give 7 pelts in two stacks (test setup), then refresh the server's view.
  await query("INSERT INTO items (character_id, def_id, qty, container, slot) VALUES ($1, 'wolf_pelt', 4, 'bag', 30), ($1, 'wolf_pelt', 3, 'bag', 31)", [acct.characterId]);
  await srv.world.refreshInventory(p);
  c.send({ t: 'questTurnIn', quest: 'pelts_for_the_hall' });
  await c.waitFor((m) => m.t === 'ev' && m.e.some((e) => e.k === 'qdone' && e.q === 'pelts_for_the_hall'));
  await sleep(200);
  const pelts = (await query("SELECT coalesce(sum(qty), 0)::int AS n FROM items WHERE character_id = $1 AND def_id = 'wolf_pelt'", [acct.characterId]))[0].n;
  assert.equal(pelts, 1, 'six of seven pelts consumed');
  assert.ok(c.inventory.some((i) => i.defId === 'hide_hood'), 'hood granted');
});

test('quest state survives reconnecting', async () => {
  await c.close();
  c = new TestClient(srv.base);
  await c.connect(acct.token, acct.characterId);
  const q = await c.waitFor((m) => m.t === 'quests', 5000, true);
  assert.equal(q.q.find((x) => x.id === 'embers_at_the_gate').state, 'completed');
  assert.equal(q.q.find((x) => x.id === 'pelts_for_the_hall').state, 'completed');
});
