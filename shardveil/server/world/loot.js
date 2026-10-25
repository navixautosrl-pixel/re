// Server-side loot rolls. Clients never see the tables' outcome until the
// server has decided it.
import { LOOT_TABLES } from '../../shared/data/loot.js';
import { ITEMS, RARITIES, AFFIXES, isEquipment } from '../../shared/data/items.js';

const RARITY_LIST = Object.values(RARITIES);
const RARITY_TOTAL = RARITY_LIST.reduce((s, r) => s + r.weight, 0);

export function rollRarity(rng, bonus = 0) {
  // bonus shifts weight from common toward rarer tiers (elites, bosses).
  let roll = rng() * RARITY_TOTAL;
  roll = Math.min(RARITY_TOTAL - 1e-9, roll + bonus * RARITY_TOTAL);
  for (const r of RARITY_LIST) {
    if (roll < r.weight) return r.id;
    roll -= r.weight;
  }
  return 'common';
}

export function rollAffixes(rng, def, rarity) {
  const count = RARITIES[rarity].affixes;
  const pool = Object.keys(AFFIXES);
  const out = {};
  const level = def.levelReq || 1;
  for (let i = 0; i < count && pool.length; i++) {
    const key = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    const a = AFFIXES[key];
    const per = a.per[0] + (a.per[1] - a.per[0]) * rng();
    out[key] = Math.max(a.min, Math.round(per * (level + 2)));
  }
  return out;
}

export function rollLoot(rng, tableId, { rarityBonus = 0 } = {}) {
  const table = LOOT_TABLES[tableId];
  if (!table) return { gold: 0, items: [] };
  const gold = table.gold ? Math.round(table.gold[0] + (table.gold[1] - table.gold[0]) * rng()) : 0;
  const items = [];
  for (const e of table.entries) {
    if (rng() >= e.chance) continue;
    const def = ITEMS[e.item];
    const qty = e.qty[0] + Math.floor(rng() * (e.qty[1] - e.qty[0] + 1));
    if (isEquipment(def)) {
      const rarity = rollRarity(rng, rarityBonus);
      items.push({ defId: def.id, qty: 1, rarity, affixes: rollAffixes(rng, def, rarity) });
    } else {
      items.push({ defId: def.id, qty, rarity: 'common', affixes: {} });
    }
  }
  return { gold, items };
}
