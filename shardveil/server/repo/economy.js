// Buying, selling, storage and tempering. Every operation is one transaction
// that locks the character row, re-reads the items it touches, and writes a
// ledger entry, so gold and items can never be created or lost in between.
import { randomInt } from 'node:crypto';
import { tx } from '../db.js';
import { ITEMS, isEquipment, EQUIP_SLOTS } from '../../shared/data/items.js';
import { SHOPS, UPGRADE, STORAGE_SLOTS, sellPrice } from '../../shared/data/economy.js';
import { PROGRESSION } from '../../shared/data/progression.js';
import { GameError, lockCharacter, grantItemsTx, takeItemsTx, itemRowToDto } from './characters.js';

export async function buy(pool, characterId, shopId, defId, qty) {
  const shop = SHOPS[shopId];
  const entry = shop?.stock.find((s) => s.item === defId);
  if (!entry) throw new GameError('NOT_SOLD', 'That is not for sale here.');
  const def = ITEMS[defId];
  if (!Number.isInteger(qty) || qty < 1 || qty > def.stack) throw new GameError('BAD_QTY', 'Invalid quantity.');
  const cost = entry.price * qty;
  return tx(pool, async (c) => {
    const ch = await lockCharacter(c, characterId);
    if (ch.gold < cost) throw new GameError('NO_GOLD', 'You cannot afford that.');
    await c.query('UPDATE characters SET gold = gold - $2 WHERE id = $1', [characterId, cost]);
    await c.query('INSERT INTO item_ledger (character_id, action, def_id, qty, gold_delta, meta) VALUES ($1, $2, $3, $4, $5, $6)',
      [characterId, 'buy', defId, qty, -cost, { shop: shopId }]);
    await grantItemsTx(c, characterId, [{ defId, qty }], { action: 'buy_item', origin: `shop:${shopId}` });
    return ch.gold - cost;
  });
}

export async function sell(pool, characterId, bagSlot) {
  return tx(pool, async (c) => {
    await lockCharacter(c, characterId);
    const { rows: [it] } = await c.query(
      "SELECT id, def_id, qty, rarity, bound FROM items WHERE character_id = $1 AND container = 'bag' AND slot = $2", [characterId, bagSlot]);
    if (!it) throw new GameError('NO_ITEM', 'Nothing in that slot.');
    const def = ITEMS[it.def_id];
    const price = sellPrice(def, it.rarity, it.qty);
    if (!price) throw new GameError('NOT_SELLABLE', 'Merchants will not take that.');
    await c.query('DELETE FROM items WHERE id = $1', [it.id]);
    const { rows: [g] } = await c.query('UPDATE characters SET gold = gold + $2 WHERE id = $1 RETURNING gold', [characterId, price]);
    await c.query('INSERT INTO item_ledger (character_id, action, item_id, def_id, qty, gold_delta) VALUES ($1, $2, $3, $4, $5, $6)',
      [characterId, 'sell', it.id, it.def_id, -it.qty, price]);
    return { gold: g.gold, price, defId: it.def_id, qty: it.qty };
  });
}

export async function loadStorage(db, characterId) {
  const { rows } = await db.query(
    `SELECT id, def_id, qty, container, slot, rarity, affixes, upgrade, bound FROM items
      WHERE character_id = $1 AND container = 'storage' ORDER BY slot`, [characterId]);
  return rows.map(itemRowToDto);
}

// Move one stack between bag and storage. Stackables merge into a matching
// stack on the other side when there is room; otherwise they take a free slot.
export async function transfer(pool, characterId, from, slot) {
  const to = from === 'bag' ? 'storage' : 'bag';
  const capacity = to === 'bag' ? PROGRESSION.inventorySlots : STORAGE_SLOTS;
  return tx(pool, async (c) => {
    await lockCharacter(c, characterId);
    const { rows: [it] } = await c.query(
      'SELECT id, def_id, qty, bound FROM items WHERE character_id = $1 AND container = $2 AND slot = $3', [characterId, from, slot]);
    if (!it) throw new GameError('NO_ITEM', 'Nothing in that slot.');
    const def = ITEMS[it.def_id];
    const { rows: dest } = await c.query(
      'SELECT id, def_id, qty, slot, bound FROM items WHERE character_id = $1 AND container = $2', [characterId, to]);
    let left = it.qty;
    if (def.stack > 1) {
      for (const d of dest) {
        if (left <= 0) break;
        if (d.def_id !== it.def_id || d.bound !== it.bound || d.qty >= def.stack) continue;
        const add = Math.min(def.stack - d.qty, left);
        await c.query('UPDATE items SET qty = qty + $2 WHERE id = $1', [d.id, add]);
        left -= add;
      }
    }
    if (left === 0) {
      await c.query('DELETE FROM items WHERE id = $1', [it.id]);
    } else {
      const used = new Set(dest.map((d) => d.slot));
      let free = -1;
      for (let i = 0; i < capacity; i++) if (!used.has(i)) { free = i; break; }
      if (free < 0) throw new GameError(to === 'bag' ? 'INVENTORY_FULL' : 'STORAGE_FULL', to === 'bag' ? 'Your bags are full.' : 'The vault is full.');
      await c.query('UPDATE items SET container = $2, slot = $3, qty = $4 WHERE id = $1', [it.id, to, free, left]);
    }
    await c.query('INSERT INTO item_ledger (character_id, action, item_id, def_id, qty) VALUES ($1, $2, $3, $4, $5)',
      [characterId, to === 'storage' ? 'deposit' : 'withdraw', it.id, it.def_id, it.qty]);
  });
}

export function upgradeCost(level) {
  return UPGRADE.levels[level] || null;
}

// container: 'bag' | 'equip'; slot: bag index or EQUIP_SLOTS index.
export async function temper(pool, characterId, container, slot, useProtection, rollFn = () => randomInt(1_000_000) / 1_000_000) {
  if (container !== 'bag' && container !== 'equip') throw new GameError('BAD_SLOT', 'Invalid slot.');
  if (!Number.isInteger(slot) || slot < 0 || slot >= (container === 'bag' ? PROGRESSION.inventorySlots : EQUIP_SLOTS.length)) {
    throw new GameError('BAD_SLOT', 'Invalid slot.');
  }
  return tx(pool, async (c) => {
    const ch = await lockCharacter(c, characterId);
    const { rows: [it] } = await c.query(
      'SELECT id, def_id, upgrade FROM items WHERE character_id = $1 AND container = $2 AND slot = $3 FOR UPDATE',
      [characterId, container, slot]);
    if (!it) throw new GameError('NO_ITEM', 'Nothing in that slot.');
    if (!isEquipment(ITEMS[it.def_id])) throw new GameError('NOT_UPGRADABLE', 'Only weapons and armour can be tempered.');
    if (it.upgrade >= UPGRADE.maxLevel) throw new GameError('MAX_LEVEL', 'That item cannot be tempered further.');
    const cost = upgradeCost(it.upgrade);
    if (ch.gold < cost.gold) throw new GameError('NO_GOLD', `Tempering costs ${cost.gold} gold.`);
    await takeItemsTx(c, characterId, UPGRADE.material, cost.fragments, 'temper_cost', { item: it.id });
    if (useProtection) await takeItemsTx(c, characterId, UPGRADE.protectionItem, 1, 'temper_cost', { item: it.id });
    await c.query('UPDATE characters SET gold = gold - $2 WHERE id = $1', [characterId, cost.gold]);

    const roll = rollFn();
    const success = roll < cost.chance;
    let to = it.upgrade;
    if (success) to = it.upgrade + 1;
    else if (it.upgrade >= UPGRADE.failDowngradeFrom && !useProtection) to = it.upgrade - 1;
    if (to !== it.upgrade) await c.query('UPDATE items SET upgrade = $2, bound = true WHERE id = $1', [it.id, to]);
    await c.query('INSERT INTO item_ledger (character_id, action, item_id, def_id, gold_delta, meta) VALUES ($1, $2, $3, $4, $5, $6)',
      [characterId, 'temper', it.id, it.def_id, -cost.gold,
        { from: it.upgrade, to, success, roll: Math.round(roll * 1e6) / 1e6, chance: cost.chance, protected: !!useProtection }]);
    return { success, from: it.upgrade, to, defId: it.def_id, gold: ch.gold - cost.gold };
  });
}
