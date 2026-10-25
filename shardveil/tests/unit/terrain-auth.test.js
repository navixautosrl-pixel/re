import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTerrain } from '../../shared/terrain.js';
import { ZONES } from '../../shared/data/zones.js';
import { hashPassword, verifyPassword, validateCredentials } from '../../server/auth.js';
import { validateCharacterName } from '../../server/repo/characters.js';

const zone = ZONES.hollowmere;

test('terrain is deterministic: two builds produce the same world', () => {
  const a = createTerrain(zone), b = createTerrain(zone);
  assert.equal(a.trees.length, b.trees.length);
  assert.deepEqual(a.trees.slice(0, 20), b.trees.slice(0, 20));
  for (const [x, z] of [[0, 0], [50, -30], [-120, 80], [170, 170]]) assert.equal(a.heightAt(x, z), b.heightAt(x, z));
});

test('town, NPCs, spawn groups and revive point are reachable ground', () => {
  const t = createTerrain(zone);
  assert.ok(t.inSafeZone(0, 0));
  assert.ok(t.isWalkable(zone.respawn.x, zone.respawn.z));
  for (const n of zone.npcs) assert.ok(t.isWalkable(n.x, n.z), n.id);
  for (const s of zone.spawns) assert.ok(t.isWalkable(s.x, s.z), `${s.monster} at ${s.x},${s.z}`);
  assert.ok(!t.isWalkable(zone.lake.x, zone.lake.z), 'lake centre is water');
  assert.ok(!t.isWalkable(195, 0), 'beyond the rim is blocked');
  assert.ok(t.trees.length > 300, 'world has real vegetation');
});

test('collision pushes bodies out of trees and buildings', () => {
  const t = createTerrain(zone);
  const tree = t.trees[0];
  const r = t.resolveCollision(tree.x + 0.05, tree.z, 0.4);
  assert.ok(Math.hypot(r.x - tree.x, r.z - tree.z) >= 0.55 * tree.scale + 0.4 - 1e-6);
  const inn = zone.town.buildings.find((b) => b.id === 'inn');
  const out = t.resolveCollision(inn.x, inn.z, 0.4);
  const inside = Math.abs(out.x - inn.x) < inn.w / 2 && Math.abs(out.z - inn.z) < inn.d / 2;
  assert.ok(!inside, 'pushed out of the inn');
});

test('passwords are salted scrypt hashes and verify correctly', async () => {
  const h1 = await hashPassword('correct horse');
  const h2 = await hashPassword('correct horse');
  assert.notEqual(h1, h2, 'salted');
  assert.ok(h1.startsWith('scrypt$'));
  assert.ok(!h1.includes('correct horse'));
  assert.equal(await verifyPassword('correct horse', h1), true);
  assert.equal(await verifyPassword('wrong horse', h1), false);
  assert.equal(await verifyPassword('x', 'garbage'), false);
});

test('credential and name validation', () => {
  assert.equal(validateCredentials('ok_name', 'longenough'), null);
  assert.ok(validateCredentials('a', 'longenough'));
  assert.ok(validateCredentials('bad name', 'longenough'));
  assert.ok(validateCredentials('okname', 'short'));
  assert.equal(validateCharacterName('Ardent'), null);
  assert.ok(validateCharacterName('A1'));
  assert.ok(validateCharacterName("Robert'); DROP TABLE"));
});
