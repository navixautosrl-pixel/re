// Multiplayer milestone: two independent clients on one dedicated server see
// each other move, chat, fight the same monster and share XP, and loot
// ownership is enforced between them.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, query } from '../helpers/server.js';
import { TestClient, createAccountWithCharacter, sleep } from '../helpers/client.js';

let srv, a, b, A, B;
before(async () => {
  srv = await startTestServer();
  a = await createAccountWithCharacter(srv.base, 'player_a', 'vanguard', 'Anwen');
  b = await createAccountWithCharacter(srv.base, 'player_b', 'arcanist', 'Bastian');
  await query('UPDATE characters SET x = 0, z = 58');
  A = new TestClient(srv.base);
  B = new TestClient(srv.base);
  await A.connect(a.token, a.characterId);
  await B.connect(b.token, b.characterId);
  await Promise.all([A.waitFor((m) => m.t === 'snap'), B.waitFor((m) => m.t === 'snap')]);
});
after(async () => { await A.close(); await B.close(); await srv.close(); });

test('each client sees the other, with name and class, and sees movement', async () => {
  await sleep(250);
  const seenByB = B.entities.p.get(A.id);
  assert.ok(seenByB, 'B sees A');
  assert.equal(seenByB.n, 'Anwen');
  assert.equal(seenByB.c, 'vanguard');
  assert.ok(A.entities.p.get(B.id), 'A sees B');

  await A.walkTo(A.x + 6, A.z, 0.1);
  await sleep(250);
  const moved = B.entities.p.get(A.id);
  assert.ok(Math.abs(moved.x - A.x) < 0.3 && Math.abs(moved.z - A.z) < 0.3, `B sees A at ${moved.x},${moved.z}, A at ${A.x},${A.z}`);
});

test('local and global chat reach the other player', async () => {
  A.send({ t: 'chat', channel: 'say', text: 'Wolves to the south.' });
  const msg = await B.waitFor((m) => m.t === 'chat');
  assert.equal(msg.from, 'Anwen');
  assert.equal(msg.text, 'Wolves to the south.');
  B.send({ t: 'chat', channel: 'global', text: 'On my way\u0007' });
  const g = await A.waitFor((m) => m.t === 'chat' && m.ch === 'global');
  assert.equal(g.text, 'On my way', 'control characters stripped');
});

test('both fight one monster: both see the fight, XP is shared, loot belongs to the top damage dealer', async () => {
  const wolf = A.nearestMonster('dusk_wolf');
  assert.ok(wolf);
  // B (ranged) chips in a couple of hits; A does the bulk of the damage.
  const bHits = (async () => {
    for (let i = 0; i < 2; i++) {
      const m = B.entities.m.get(wolf.i);
      if (!m || m.d) break;
      await B.walkTo(m.x, m.z, 10);
      B.send({ t: 'attack', target: wolf.i });
      await sleep(1250);
    }
  })();
  const killed = await A.fight(wolf.i, 'vanguard', 45000);
  await bHits;
  assert.ok(killed);
  await sleep(300);
  assert.ok(B.events.some((e) => e.k === 'die' && e.t === wolf.i), 'B saw the death');
  assert.ok(B.events.some((e) => e.k === 'dmg' && e.s === A.id && e.t === wolf.i), 'B saw A hit the wolf');
  const xpA = A.events.filter((e) => e.k === 'xp').reduce((s, e) => s + e.a, 0);
  const xpB = B.events.filter((e) => e.k === 'xp').reduce((s, e) => s + e.a, 0);
  assert.ok(xpA > 0, 'A got XP');
  if (B.events.some((e) => e.k === 'dmg' && e.s === B.id && e.t === wolf.i)) {
    assert.ok(xpB > 0, 'B got a share for its damage');
    assert.ok(xpA > xpB, 'larger share for larger damage');
  }

  const loot = [...B.entities.l.values()];
  assert.ok(loot.length > 0);
  const l = loot[0];
  assert.equal(l.o, 0, 'B is told the loot is not B\'s yet');
  await B.walkTo(l.x, l.z, 1);
  B.send({ t: 'pickup', id: l.i });
  const err = await B.waitFor((m) => m.t === 'error');
  assert.equal(err.code, 'NOT_YOURS');
  await A.walkTo(l.x, l.z, 1);
  A.send({ t: 'pickup', id: l.i });
  await A.waitFor((m) => m.t === 'ev' && m.e.some((e) => e.k === 'loot'));
});

test('logging in again on the same account kicks the old session without forking state', async () => {
  const A2 = new TestClient(srv.base);
  const kicked = A.waitFor((m) => m.t === 'kick');
  await A2.connect(a.token, a.characterId);
  const k = await kicked;
  assert.match(k.reason, /another location/);
  assert.ok(srv.world.players.size === 2, 'still exactly two players online');
  await A2.close();
  A = { close: async () => {} };
});
