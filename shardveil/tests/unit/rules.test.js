import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats, rollDamage, mitigate, COMBAT } from '../../shared/stats.js';
import { xpForLevel, xpLevelMultiplier, PROGRESSION } from '../../shared/data/progression.js';
import { CLASSES, SKILLS, CLASS_IDS } from '../../shared/data/classes.js';
import { ITEMS, STARTER_KITS, RARITIES } from '../../shared/data/items.js';
import { MONSTERS } from '../../shared/data/monsters.js';
import { LOOT_TABLES } from '../../shared/data/loot.js';
import { ZONES } from '../../shared/data/zones.js';
import { mulberry32 } from '../../shared/rng.js';
import { rollLoot, rollAffixes } from '../../server/world/loot.js';

test('every class has sane level-1 stats and four distinct identities', () => {
  assert.equal(CLASS_IDS.length, 4);
  for (const id of CLASS_IDS) {
    const kit = STARTER_KITS[id];
    const s = computeStats(id, 1, [{ defId: kit.weapon }, { defId: kit.body }]);
    assert.ok(s.maxHp > 50 && s.maxHp < 400, `${id} hp ${s.maxHp}`);
    assert.ok(s.maxMp > 20, `${id} mp`);
    assert.ok(s.attack[1] >= s.attack[0]);
    for (const sk of CLASSES[id].skills) assert.ok(SKILLS[sk], `${id} skill ${sk} defined`);
  }
  const tank = computeStats('vanguard', 10);
  const mage = computeStats('arcanist', 10);
  assert.ok(tank.maxHp > mage.maxHp, 'vanguard is tankier than arcanist');
  assert.ok(mage.magic[1] > tank.magic[1], 'arcanist hits harder with magic');
  assert.ok(computeStats('shadeblade', 10).crit > tank.crit, 'shadeblade crits more');
});

test('equipment, affixes and upgrade levels raise stats', () => {
  const bare = computeStats('vanguard', 5);
  const geared = computeStats('vanguard', 5, [{ defId: 'harrow_longsword', affixes: { str: 3, hp: 20 } }]);
  assert.ok(geared.attack[0] > bare.attack[0]);
  assert.equal(geared.maxHp, bare.maxHp + 20);
  const plus3 = computeStats('vanguard', 5, [{ defId: 'harrow_longsword', affixes: { str: 3, hp: 20 }, upgrade: 3 }]);
  assert.ok(plus3.attack[1] > geared.attack[1], 'upgrade +3 adds attack');
  assert.ok(Math.abs((plus3.attack[1] - geared.attack[1]) - 16 * 3 * COMBAT.upgradeBonusPerLevel) < 1.01);
});

test('damage formula: mitigation, minimum 1, crits multiply', () => {
  assert.equal(mitigate(100, 0), 100);
  assert.ok(mitigate(100, 40) === 50);
  const rng = mulberry32(1);
  const weak = { attack: [1, 1], magic: [0, 0], crit: 0 };
  assert.equal(rollDamage(rng, weak, 10_000, 'physical', 1).amount, 1);
  const always = { attack: [100, 100], magic: [0, 0], crit: 100 };
  const r = rollDamage(rng, always, 0, 'physical', 1);
  assert.equal(r.crit, true);
  assert.equal(r.amount, Math.round(100 * COMBAT.critMult));
  const magic = rollDamage(rng, { attack: [1, 1], magic: [50, 50], crit: 0 }, 0, 'magical', 2);
  assert.equal(magic.amount, 100);
});

test('xp curve is strictly increasing and level gap reduces xp', () => {
  for (let l = 1; l < PROGRESSION.maxLevel - 1; l++) assert.ok(xpForLevel(l + 1) > xpForLevel(l));
  assert.equal(xpForLevel(PROGRESSION.maxLevel), Infinity);
  assert.equal(xpLevelMultiplier(5, 5), 1);
  assert.equal(xpLevelMultiplier(5, 2), 1);
  assert.ok(xpLevelMultiplier(10, 2) < 1);
  assert.ok(xpLevelMultiplier(30, 1) >= PROGRESSION.xpLevelPenalty.floor);
});

test('all data references resolve (monsters, loot tables, items, spawns)', () => {
  for (const m of Object.values(MONSTERS)) {
    assert.ok(LOOT_TABLES[m.loot], `loot table for ${m.id}`);
    if (m.summon) assert.ok(MONSTERS[m.summon.monster]);
  }
  for (const t of Object.values(LOOT_TABLES)) for (const e of t.entries) assert.ok(ITEMS[e.item], `item ${e.item}`);
  for (const z of Object.values(ZONES)) for (const s of z.spawns) assert.ok(MONSTERS[s.monster], `spawn ${s.monster}`);
  for (const k of Object.values(STARTER_KITS)) {
    assert.ok(ITEMS[k.weapon] && ITEMS[k.body]);
    for (const [id] of k.bag) assert.ok(ITEMS[id]);
  }
});

test('loot rolls are deterministic per seed and respect tables', () => {
  const a = rollLoot(mulberry32(99), 'veilshard');
  const b = rollLoot(mulberry32(99), 'veilshard');
  assert.deepEqual(a, b);
  assert.ok(a.gold >= 40 && a.gold <= 80);
  assert.ok(a.items.some((i) => i.defId === 'veil_fragment'), 'guaranteed drop present');
  assert.deepEqual(rollLoot(mulberry32(1), 'nope'), { gold: 0, items: [] });
});

test('rarity tiers roll the right number of affixes, roughly at the configured odds', () => {
  const rng = mulberry32(7);
  for (const r of Object.keys(RARITIES)) {
    assert.equal(Object.keys(rollAffixes(rng, ITEMS.harrow_longsword, r)).length, RARITIES[r].affixes);
  }
  const counts = {};
  const N = 20000;
  for (let i = 0; i < N; i++) {
    const loot = rollLoot(rng, 'old_greymaw');
    for (const it of loot.items) if (ITEMS[it.defId].type === 'armor' || ITEMS[it.defId].type === 'weapon') counts[it.rarity] = (counts[it.rarity] || 0) + 1;
  }
  assert.ok(counts.common > counts.uncommon && counts.uncommon > counts.rare && counts.rare > counts.epic);
});

test('quest data: rewards, objectives and givers all resolve', async () => {
  const { questRewardItemsValid } = await import('../../server/world/quests.js');
  const { QUESTS } = await import('../../shared/data/quests.js');
  assert.equal(questRewardItemsValid(), null);
  for (const q of Object.values(QUESTS)) {
    assert.ok(ZONES.hollowmere.npcs.some((n) => n.id === q.giver), `giver for ${q.id}`);
    for (const r of q.requires) assert.ok(QUESTS[r], `${q.id} requires ${r}`);
    for (const o of q.objectives) if (o.type === 'kill') assert.ok(MONSTERS[o.monster], `${q.id} monster ${o.monster}`);
  }
});
