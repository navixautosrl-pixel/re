// Character persistence. All writes go through parameterised queries; every
// function that changes items or gold runs in a transaction that locks the
// character row first, so concurrent operations on one character serialise.
import { tx } from '../db.js';
import { CLASSES } from '../../shared/data/classes.js';
import { ITEMS, EQUIP_SLOTS, STARTER_KITS } from '../../shared/data/items.js';
import { PROGRESSION } from '../../shared/data/progression.js';
import { computeStats } from '../../shared/stats.js';
import { ZONES, DEFAULT_ZONE } from '../../shared/data/zones.js';

export class GameError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function validateCharacterName(name) {
  if (typeof name !== 'string' || !/^[A-Za-z][A-Za-z]{2,15}$/.test(name)) {
    return 'Names are 3–16 letters, no spaces or digits.';
  }
  return null;
}

// Capitalise consistently: "aRwEn" -> "Arwen".
const normaliseName = (n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();

export function itemRowToDto(r) {
  return {
    id: r.id, defId: r.def_id, qty: r.qty, container: r.container, slot: r.slot,
    rarity: r.rarity, affixes: r.affixes, upgrade: r.upgrade, bound: r.bound,
  };
}

export async function listCharacters(pool, accountId) {
  const { rows } = await pool.query(
    `SELECT id, name, class, level, zone, created_at FROM characters
      WHERE account_id = $1 AND deleted_at IS NULL ORDER BY id`,
    [accountId],
  );
  return rows;
}

export async function createCharacter(pool, accountId, name, classId) {
  const problem = validateCharacterName(name);
  if (problem) throw new GameError('BAD_NAME', problem);
  if (!CLASSES[classId]) throw new GameError('BAD_CLASS', 'Unknown class.');
  name = normaliseName(name);

  return tx(pool, async (c) => {
    // Lock the account row so two parallel creates can't both pass the cap.
    await c.query('SELECT id FROM accounts WHERE id = $1 FOR UPDATE', [accountId]);
    const { rows: countRows } = await c.query(
      'SELECT count(*)::int AS n FROM characters WHERE account_id = $1 AND deleted_at IS NULL', [accountId]);
    if (countRows[0].n >= PROGRESSION.maxCharactersPerAccount) {
      throw new GameError('TOO_MANY', `An account can hold at most ${PROGRESSION.maxCharactersPerAccount} characters.`);
    }

    const kit = STARTER_KITS[classId];
    const equipped = [kit.weapon, kit.body].map((defId) => ({ defId, affixes: {}, upgrade: 0 }));
    const stats = computeStats(classId, 1, equipped);
    const spawn = ZONES[DEFAULT_ZONE].respawn;

    let row;
    try {
      ({ rows: [row] } = await c.query(
        `INSERT INTO characters (account_id, name, class, hp, mp, gold, x, z)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, class, level`,
        [accountId, name, classId, stats.maxHp, stats.maxMp, PROGRESSION.startingGold, spawn.x, spawn.z],
      ));
    } catch (err) {
      if (err.code === '23505') throw new GameError('NAME_TAKEN', 'That name is already taken.');
      throw err;
    }

    await c.query(
      `INSERT INTO items (character_id, def_id, qty, container, slot, bound, origin)
       VALUES ($1, $2, 1, 'equip', $3, true, 'starter'), ($1, $4, 1, 'equip', $5, true, 'starter')`,
      [row.id, kit.weapon, EQUIP_SLOTS.indexOf('weapon'), kit.body, EQUIP_SLOTS.indexOf('body')],
    );
    let slot = 0;
    for (const [defId, qty] of kit.bag) {
      await c.query(
        `INSERT INTO items (character_id, def_id, qty, container, slot, bound, origin)
         VALUES ($1, $2, $3, 'bag', $4, true, 'starter')`,
        [row.id, defId, qty, slot++],
      );
    }
    await c.query(
      `INSERT INTO item_ledger (character_id, action, gold_delta, meta) VALUES ($1, 'starter', $2, $3)`,
      [row.id, PROGRESSION.startingGold, { kit: classId }],
    );
    return row;
  });
}

export async function deleteCharacter(pool, accountId, characterId) {
  const { rowCount } = await pool.query(
    'UPDATE characters SET deleted_at = now() WHERE id = $1 AND account_id = $2 AND deleted_at IS NULL',
    [characterId, accountId],
  );
  return rowCount > 0;
}

// Loads a character for play. Scoped by account so a session can only ever
// load its own characters.
export async function loadCharacter(pool, accountId, characterId) {
  const { rows } = await pool.query(
    `SELECT id, account_id, name, class, level, xp, gold, hp, mp, zone, x, z, ry, play_seconds
       FROM characters WHERE id = $1 AND account_id = $2 AND deleted_at IS NULL`,
    [characterId, accountId],
  );
  if (!rows[0]) return null;
  const items = await loadItems(pool, characterId);
  const { rows: quests } = await pool.query(
    'SELECT quest_id, state, progress FROM quest_progress WHERE character_id = $1', [characterId]);
  return { ...rows[0], items, quests };
}

export async function loadItems(db, characterId) {
  const { rows } = await db.query(
    `SELECT id, def_id, qty, container, slot, rarity, affixes, upgrade, bound
       FROM items WHERE character_id = $1 AND container IN ('bag', 'equip') ORDER BY container, slot`,
    [characterId],
  );
  return rows.map(itemRowToDto);
}

// Periodic / logout save of volatile state. Gold and items are NOT written
// here — they are only ever changed by their own transactional operations.
export async function saveCharacterState(pool, ch) {
  await pool.query(
    `UPDATE characters SET level = $2, xp = $3, hp = $4, mp = $5, x = $6, z = $7, ry = $8,
            play_seconds = $9, updated_at = now() WHERE id = $1`,
    [ch.id, ch.level, ch.xp, Math.max(0, Math.round(ch.hp)), Math.max(0, Math.round(ch.mp)),
      ch.x, ch.z, ch.ry, Math.round(ch.playSeconds)],
  );
}

// ---- Inventory operations ----------------------------------------------

async function lockCharacter(c, characterId) {
  const { rows } = await c.query('SELECT id, gold, class, level FROM characters WHERE id = $1 FOR UPDATE', [characterId]);
  if (!rows[0]) throw new GameError('NO_CHARACTER', 'Character not found.');
  return rows[0];
}

async function bagRows(c, characterId) {
  const { rows } = await c.query(
    "SELECT id, def_id, qty, slot, rarity, affixes, upgrade, bound FROM items WHERE character_id = $1 AND container = 'bag'",
    [characterId],
  );
  return rows;
}

function freeSlots(rows, total) {
  const used = new Set(rows.map((r) => r.slot));
  const free = [];
  for (let i = 0; i < total; i++) if (!used.has(i)) free.push(i);
  return free;
}

// Adds items atomically: either every item fits and is written, or nothing
// is written and INVENTORY_FULL is thrown. Stackables merge into existing
// unbound stacks first.
// items: [{ defId, qty, rarity?, affixes? }]
export async function grantItems(pool, characterId, items, opts) {
  return tx(pool, async (c) => {
    await lockCharacter(c, characterId);
    return grantItemsTx(c, characterId, items, opts);
  });
}

// Same as grantItems, inside a transaction the caller already holds (with the
// character row locked).
export async function grantItemsTx(c, characterId, items, { action, origin, gold = 0, meta = {} }) {
  {
    // Plan against a working copy of the bag, then write the differences.
    const work = (await bagRows(c, characterId)).map((r) => ({ ...r, added: 0 }));
    const free = freeSlots(work, PROGRESSION.inventorySlots);

    for (const it of items) {
      const def = ITEMS[it.defId];
      if (!def) throw new GameError('BAD_ITEM', `Unknown item ${it.defId}`);
      let remaining = it.qty;
      if (def.stack > 1) {
        for (const r of work) {
          if (remaining <= 0) break;
          if (r.def_id !== def.id || r.bound || r.qty >= def.stack) continue;
          const add = Math.min(def.stack - r.qty, remaining);
          r.qty += add;
          r.added += add;
          remaining -= add;
        }
      }
      while (remaining > 0) {
        const slot = free.shift();
        if (slot === undefined) throw new GameError('INVENTORY_FULL', 'Your bags are full.');
        const qty = Math.min(def.stack, remaining);
        work.push({ id: null, def_id: def.id, qty, slot, bound: false, added: qty,
          rarity: it.rarity || 'common', affixes: it.affixes || {} });
        remaining -= qty;
      }
    }

    const created = [];
    for (const r of work) {
      if (!r.added) continue;
      let id = r.id;
      if (id === null) {
        ({ rows: [{ id }] } = await c.query(
          `INSERT INTO items (character_id, def_id, qty, container, slot, rarity, affixes, origin)
           VALUES ($1, $2, $3, 'bag', $4, $5, $6, $7) RETURNING id`,
          [characterId, r.def_id, r.qty, r.slot, r.rarity, r.affixes, origin],
        ));
        created.push(id);
      } else {
        await c.query('UPDATE items SET qty = $2 WHERE id = $1', [id, r.qty]);
      }
      await c.query(
        'INSERT INTO item_ledger (character_id, action, item_id, def_id, qty, meta) VALUES ($1, $2, $3, $4, $5, $6)',
        [characterId, action, id, r.def_id, r.added, meta],
      );
    }

    let newGold = null;
    if (gold) {
      const { rows: [g] } = await c.query(
        'UPDATE characters SET gold = gold + $2 WHERE id = $1 RETURNING gold', [characterId, gold]);
      newGold = g.gold;
      await c.query(
        'INSERT INTO item_ledger (character_id, action, gold_delta, meta) VALUES ($1, $2, $3, $4)',
        [characterId, `${action}_gold`, gold, meta],
      );
    }
    return { created, gold: newGold };
  }
}

// Removes `qty` units of defId from the bag (any stacks), or throws.
export async function takeItemsTx(c, characterId, defId, qty, action, meta = {}) {
  const { rows } = await c.query(
    "SELECT id, qty FROM items WHERE character_id = $1 AND container = 'bag' AND def_id = $2 ORDER BY qty, slot",
    [characterId, defId]);
  const have = rows.reduce((s, r) => s + r.qty, 0);
  if (have < qty) throw new GameError('MISSING_ITEMS', `You need ${qty} × ${ITEMS[defId]?.name || defId}.`);
  let left = qty;
  for (const r of rows) {
    if (left <= 0) break;
    const take = Math.min(left, r.qty);
    if (take === r.qty) await c.query('DELETE FROM items WHERE id = $1', [r.id]);
    else await c.query('UPDATE items SET qty = qty - $2 WHERE id = $1', [r.id, take]);
    await c.query('INSERT INTO item_ledger (character_id, action, item_id, def_id, qty, meta) VALUES ($1, $2, $3, $4, $5, $6)',
      [characterId, action, r.id, defId, -take, meta]);
    left -= take;
  }
}

export { lockCharacter };

export async function changeGold(pool, characterId, delta, action, meta = {}) {
  return tx(pool, async (c) => {
    const ch = await lockCharacter(c, characterId);
    if (ch.gold + delta < 0) throw new GameError('NO_GOLD', 'Not enough gold.');
    const { rows: [g] } = await c.query('UPDATE characters SET gold = gold + $2 WHERE id = $1 RETURNING gold', [characterId, delta]);
    await c.query('INSERT INTO item_ledger (character_id, action, gold_delta, meta) VALUES ($1, $2, $3, $4)',
      [characterId, action, delta, meta]);
    return g.gold;
  });
}

// Equip the item in bag slot `bagSlot`; whatever was in that equip slot goes
// back into the same bag slot (a swap), so this never needs a free slot.
export async function equipItem(pool, characterId, bagSlot, level) {
  return tx(pool, async (c) => {
    const ch = await lockCharacter(c, characterId);
    const { rows: [it] } = await c.query(
      "SELECT id, def_id FROM items WHERE character_id = $1 AND container = 'bag' AND slot = $2", [characterId, bagSlot]);
    if (!it) throw new GameError('NO_ITEM', 'Nothing in that slot.');
    const def = ITEMS[it.def_id];
    if (!def || (def.type !== 'weapon' && def.type !== 'armor')) throw new GameError('NOT_EQUIPPABLE', 'That cannot be equipped.');
    if (def.classes && !def.classes.includes(ch.class)) throw new GameError('WRONG_CLASS', `Only ${def.classes.map((k) => CLASSES[k].name).join(', ')} can use that.`);
    if ((def.levelReq || 1) > level) throw new GameError('LEVEL_TOO_LOW', `Requires level ${def.levelReq}.`);
    const eqSlot = EQUIP_SLOTS.indexOf(def.slot);
    // Move the current piece out of the way via a temporary slot to dodge the unique constraint.
    await c.query("UPDATE items SET container = 'bag', slot = 100000 + $3 WHERE character_id = $1 AND container = 'equip' AND slot = $2",
      [characterId, eqSlot, bagSlot]);
    await c.query("UPDATE items SET container = 'equip', slot = $2, bound = true WHERE id = $1", [it.id, eqSlot]);
    await c.query("UPDATE items SET slot = $3 WHERE character_id = $1 AND container = 'bag' AND slot = 100000 + $2", [characterId, bagSlot, bagSlot]);
    return true;
  });
}

export async function unequipItem(pool, characterId, slotName) {
  const eqSlot = EQUIP_SLOTS.indexOf(slotName);
  if (eqSlot < 0) throw new GameError('BAD_SLOT', 'Unknown equipment slot.');
  return tx(pool, async (c) => {
    await lockCharacter(c, characterId);
    const { rows: [it] } = await c.query(
      "SELECT id FROM items WHERE character_id = $1 AND container = 'equip' AND slot = $2", [characterId, eqSlot]);
    if (!it) throw new GameError('NO_ITEM', 'Nothing equipped there.');
    const free = freeSlots(await bagRows(c, characterId), PROGRESSION.inventorySlots);
    if (!free.length) throw new GameError('INVENTORY_FULL', 'Your bags are full.');
    await c.query("UPDATE items SET container = 'bag', slot = $2 WHERE id = $1", [it.id, free[0]]);
    return true;
  });
}

// Consumes one unit from a bag slot and returns the item definition.
export async function consumeItem(pool, characterId, bagSlot) {
  return tx(pool, async (c) => {
    await lockCharacter(c, characterId);
    const { rows: [it] } = await c.query(
      "SELECT id, def_id, qty FROM items WHERE character_id = $1 AND container = 'bag' AND slot = $2", [characterId, bagSlot]);
    if (!it) throw new GameError('NO_ITEM', 'Nothing in that slot.');
    const def = ITEMS[it.def_id];
    if (!def || def.type !== 'consumable') throw new GameError('NOT_USABLE', 'That cannot be used.');
    if (it.qty > 1) await c.query('UPDATE items SET qty = qty - 1 WHERE id = $1', [it.id]);
    else await c.query('DELETE FROM items WHERE id = $1', [it.id]);
    await c.query('INSERT INTO item_ledger (character_id, action, item_id, def_id, qty) VALUES ($1, $2, $3, $4, -1)',
      [characterId, 'use', it.id, it.def_id]);
    return def;
  });
}

export async function moveBagItem(pool, characterId, from, to) {
  const n = PROGRESSION.inventorySlots;
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= n || to >= n || from === to) {
    throw new GameError('BAD_SLOT', 'Invalid slot.');
  }
  return tx(pool, async (c) => {
    await lockCharacter(c, characterId);
    const { rows } = await c.query(
      "SELECT id, def_id, qty, slot, bound FROM items WHERE character_id = $1 AND container = 'bag' AND slot IN ($2, $3)",
      [characterId, from, to]);
    const src = rows.find((r) => r.slot === from);
    const dst = rows.find((r) => r.slot === to);
    if (!src) throw new GameError('NO_ITEM', 'Nothing in that slot.');
    const def = ITEMS[src.def_id];
    if (dst && dst.def_id === src.def_id && def.stack > 1 && dst.bound === src.bound && dst.qty < def.stack) {
      const move = Math.min(def.stack - dst.qty, src.qty);
      await c.query('UPDATE items SET qty = qty + $2 WHERE id = $1', [dst.id, move]);
      if (move === src.qty) await c.query('DELETE FROM items WHERE id = $1', [src.id]);
      else await c.query('UPDATE items SET qty = qty - $2 WHERE id = $1', [src.id, move]);
      return true;
    }
    if (dst) await c.query('UPDATE items SET slot = 100000 WHERE id = $1', [dst.id]);
    await c.query('UPDATE items SET slot = $2 WHERE id = $1', [src.id, to]);
    if (dst) await c.query('UPDATE items SET slot = $2 WHERE id = $1', [dst.id, from]);
    return true;
  });
}

export async function destroyBagItem(pool, characterId, bagSlot) {
  return tx(pool, async (c) => {
    await lockCharacter(c, characterId);
    const { rows: [it] } = await c.query(
      "DELETE FROM items WHERE character_id = $1 AND container = 'bag' AND slot = $2 RETURNING id, def_id, qty",
      [characterId, bagSlot]);
    if (!it) throw new GameError('NO_ITEM', 'Nothing in that slot.');
    await c.query('INSERT INTO item_ledger (character_id, action, item_id, def_id, qty) VALUES ($1, $2, $3, $4, $5)',
      [characterId, 'destroy', it.id, it.def_id, -it.qty]);
    return it;
  });
}
