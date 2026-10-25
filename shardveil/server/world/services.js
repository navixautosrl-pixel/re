// NPC services: shops, the vault and the forge. The player must actually be
// standing with the NPC that offers the service.
import * as eco from '../repo/economy.js';
import { ITEMS } from '../../shared/data/items.js';

const SERVICE_RANGE = 7;

function nearNpc(world, p, pred) {
  return world.zone.npcs.some((n) => pred(n) && Math.hypot(n.x - p.x, n.z - p.z) <= SERVICE_RANGE);
}

export function handleService(world, p, msg) {
  const tooFar = (what) => world.sendError(p, 'TOO_FAR', `You need to be at ${what}.`);
  switch (msg.t) {
    case 'buy': {
      if (typeof msg.shop !== 'string' || typeof msg.item !== 'string') return true;
      if (!nearNpc(world, p, (n) => n.shop === msg.shop)) return tooFar('the shop'), true;
      const qty = Number.isInteger(msg.qty) ? msg.qty : 1;
      world.enqueue(p, async () => {
        p.gold = await eco.buy(world.pool, p.characterId, msg.shop, msg.item, qty);
        await world.refreshInventory(p);
        world.sendSelf(p);
        world.emitTo(p, { k: 'bought', df: msg.item, q: qty });
      });
      return true;
    }
    case 'sell': {
      if (!Number.isInteger(msg.slot)) return true;
      if (!nearNpc(world, p, (n) => n.shop)) return tooFar('a merchant'), true;
      world.enqueue(p, async () => {
        const r = await eco.sell(world.pool, p.characterId, msg.slot);
        p.gold = r.gold;
        await world.refreshInventory(p);
        world.sendSelf(p);
        world.emitTo(p, { k: 'sold', df: r.defId, q: r.qty, g: r.price });
      });
      return true;
    }
    case 'storageOpen': {
      if (!nearNpc(world, p, (n) => n.storage)) return tooFar('the vault'), true;
      world.enqueue(p, async () => sendStorage(world, p));
      return true;
    }
    case 'deposit':
    case 'withdraw': {
      if (!Number.isInteger(msg.slot)) return true;
      if (!nearNpc(world, p, (n) => n.storage)) return tooFar('the vault'), true;
      world.enqueue(p, async () => {
        await eco.transfer(world.pool, p.characterId, msg.t === 'deposit' ? 'bag' : 'storage', msg.slot);
        await world.refreshInventory(p);
        await sendStorage(world, p);
      });
      return true;
    }
    case 'temper': {
      if (!nearNpc(world, p, (n) => n.upgrades)) return tooFar('the forge'), true;
      world.enqueue(p, async () => {
        const r = await eco.temper(world.pool, p.characterId, msg.container, msg.slot, !!msg.protect);
        p.gold = r.gold;
        await world.refreshInventory(p);
        world.sendSelf(p);
        world.emit(p.x, p.z, { k: 'temper', s: p.id, ok: r.success ? 1 : 0, df: r.defId, from: r.from, to: r.to });
        if (r.success && r.to >= 7) world.broadcastNotice(`${p.name} tempered ${ITEMS[r.defId].name} to +${r.to}!`, 'system');
      });
      return true;
    }
    default:
      return false;
  }
}

async function sendStorage(world, p) {
  p.send({ t: 'storage', items: await eco.loadStorage(world.pool, p.characterId) });
}
