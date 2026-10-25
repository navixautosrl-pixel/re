import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, query } from '../helpers/server.js';
import { api, TestClient } from '../helpers/client.js';

let srv;
before(async () => { srv = await startTestServer(); });
after(async () => { await srv.close(); });

test('register validates input and rejects duplicate usernames (case-insensitive)', async () => {
  assert.equal((await api(srv.base, 'POST', '/api/register', { username: 'ab', password: 'longenough1' })).status, 400);
  assert.equal((await api(srv.base, 'POST', '/api/register', { username: 'valid_one', password: 'short' })).status, 400);
  assert.equal((await api(srv.base, 'POST', '/api/register', { username: 'valid_one', password: 'longenough1' })).status, 201);
  assert.equal((await api(srv.base, 'POST', '/api/register', { username: 'VALID_ONE', password: 'longenough1' })).status, 409);
  const [row] = await query("SELECT password_hash FROM accounts WHERE username = 'valid_one'");
  assert.ok(row.password_hash.startsWith('scrypt$') && !row.password_hash.includes('longenough1'), 'no plaintext password stored');
});

test('login issues a session token; only its hash is stored', async () => {
  assert.equal((await api(srv.base, 'POST', '/api/login', { username: 'valid_one', password: 'wrong-password' })).status, 401);
  assert.equal((await api(srv.base, 'POST', '/api/login', { username: 'nobody_here', password: 'whatever12' })).status, 401);
  const ok = await api(srv.base, 'POST', '/api/login', { username: 'Valid_One', password: 'longenough1' });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.token.length >= 40);
  const rows = await query('SELECT token_hash FROM sessions');
  assert.ok(rows.every((r) => !r.token_hash.toString().includes(ok.body.token)));
});

test('character API: auth required, validation, unique names, per-account cap, ownership', async () => {
  const { body: { token } } = await api(srv.base, 'POST', '/api/login', { username: 'valid_one', password: 'longenough1' });
  assert.equal((await api(srv.base, 'GET', '/api/characters')).status, 401);
  assert.equal((await api(srv.base, 'GET', '/api/characters', null, 'not-a-real-token-at-all-xx')).status, 401);
  assert.equal((await api(srv.base, 'POST', '/api/characters', { name: 'Bad Name', cls: 'vanguard' }, token)).status, 400);
  assert.equal((await api(srv.base, 'POST', '/api/characters', { name: 'Okname', cls: 'necromancer' }, token)).status, 400);

  const names = ['Aldra', 'Brisk', 'Cerys', 'Dunmor'];
  const classes = ['vanguard', 'shadeblade', 'arcanist', 'wardweaver'];
  for (let i = 0; i < 4; i++) {
    const r = await api(srv.base, 'POST', '/api/characters', { name: names[i], cls: classes[i] }, token);
    assert.equal(r.status, 201, JSON.stringify(r.body));
  }
  const fifth = await api(srv.base, 'POST', '/api/characters', { name: 'Eamon', cls: 'vanguard' }, token);
  assert.equal(fifth.status, 400);
  assert.equal(fifth.body.code, 'TOO_MANY');
  const list = await api(srv.base, 'GET', '/api/characters', null, token);
  assert.equal(list.body.characters.length, 4);

  // Starter kit was granted transactionally.
  const items = await query('SELECT def_id, container FROM items WHERE character_id = $1', [list.body.characters[0].id]);
  assert.ok(items.some((i) => i.def_id === 'ironwood_blade' && i.container === 'equip'));

  // A second account cannot take the name (any casing) or touch these characters.
  await api(srv.base, 'POST', '/api/register', { username: 'other_acc', password: 'longenough2' });
  const other = (await api(srv.base, 'POST', '/api/login', { username: 'other_acc', password: 'longenough2' })).body.token;
  assert.equal((await api(srv.base, 'POST', '/api/characters', { name: 'aLDRA', cls: 'vanguard' }, other)).body.code, 'NAME_TAKEN');
  const victim = list.body.characters[0].id;
  assert.equal((await api(srv.base, 'DELETE', `/api/characters/${victim}`, null, other)).status, 404);
  const c = new TestClient(srv.base);
  await assert.rejects(c.connect(other, victim), /Character not found/);

  // Owner can delete; the name becomes free again.
  assert.equal((await api(srv.base, 'DELETE', `/api/characters/${victim}`, null, token)).status, 200);
  assert.equal((await api(srv.base, 'POST', '/api/characters', { name: 'Aldra', cls: 'arcanist' }, other)).status, 201);
});

test('logout revokes the session', async () => {
  const { body: { token } } = await api(srv.base, 'POST', '/api/login', { username: 'valid_one', password: 'longenough1' });
  assert.equal((await api(srv.base, 'GET', '/api/characters', null, token)).status, 200);
  await api(srv.base, 'POST', '/api/logout', null, token);
  assert.equal((await api(srv.base, 'GET', '/api/characters', null, token)).status, 401);
});

test('static client is served with security headers and no path traversal', async () => {
  const res = await fetch(srv.base + '/');
  assert.equal(res.status, 200);
  assert.ok(res.headers.get('content-security-policy').includes("script-src 'self'"));
  const trav = await fetch(srv.base + '/..%2f..%2fpackage.json');
  assert.equal(trav.status, 404);
  const shared = await fetch(srv.base + '/shared/protocol.js');
  assert.equal(shared.status, 200);
});
