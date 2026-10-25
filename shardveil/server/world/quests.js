// Quest logic: availability, accept/abandon, kill and explore credit, and
// transactional turn-in. Collect objectives are counted from the bag and the
// items are consumed in the same transaction that pays the rewards.
import { QUESTS } from '../../shared/data/quests.js';
import { ITEMS } from '../../shared/data/items.js';
import { tx } from '../db.js';
import * as repo from '../repo/characters.js';

const MAX_ACTIVE = 10;
const NPC_RANGE = 7;

export class QuestService {
  constructor(world) {
    this.world = world;
    this.pool = world.pool;
  }

  init(p, rows) {
    p.quests = new Map(rows.filter((r) => QUESTS[r.quest_id]).map((r) => [r.quest_id, { state: r.state, progress: r.progress }]));
  }

  send(p) {
    p.send({ t: 'quests', q: [...p.quests].map(([id, s]) => ({ id, state: s.state, progress: s.progress })) });
  }

  isAvailable(p, q) {
    return !p.quests.has(q.id) && p.level >= q.level && q.requires.every((r) => p.quests.get(r)?.state === 'completed');
  }

  nearGiver(p, q) {
    const npc = this.world.zone.npcs.find((n) => n.id === q.giver);
    return npc && Math.hypot(npc.x - p.x, npc.z - p.z) <= NPC_RANGE;
  }

  // [{ have, need, done }] per objective, from progress and the bag.
  status(p, q, state = p.quests.get(q.id)) {
    return q.objectives.map((o, i) => {
      let have = state?.progress?.[i] || 0;
      if (o.type === 'collect') {
        have = p.items.filter((it) => it.container === 'bag' && it.defId === o.item).reduce((s, it) => s + it.qty, 0);
      }
      const need = o.type === 'explore' ? 1 : o.count;
      return { have: Math.min(have, need), need, done: have >= need };
    });
  }

  accept(p, questId) {
    const q = QUESTS[questId];
    const w = this.world;
    if (!q) return;
    if (!this.isAvailable(p, q)) return w.sendError(p, 'QUEST_UNAVAILABLE', 'That task is not available to you.');
    if (!this.nearGiver(p, q)) return w.sendError(p, 'TOO_FAR', 'You need to be with the quest giver.');
    if ([...p.quests.values()].filter((s) => s.state === 'active').length >= MAX_ACTIVE) {
      return w.sendError(p, 'QUEST_LOG_FULL', 'Your quest journal is full.');
    }
    p.quests.set(q.id, { state: 'active', progress: {} }); // claim now so a double request is ignored
    w.enqueue(p, async () => {
      try {
        await this.pool.query(
          "INSERT INTO quest_progress (character_id, quest_id, state) VALUES ($1, $2, 'active')", [p.characterId, q.id]);
      } catch (err) {
        p.quests.delete(q.id);
        throw err;
      }
      w.emitTo(p, { k: 'qaccept', q: q.id });
      this.send(p);
    });
  }

  abandon(p, questId) {
    const s = p.quests.get(questId);
    if (!s || s.state !== 'active') return;
    p.quests.delete(questId);
    this.world.enqueue(p, async () => {
      await this.pool.query("DELETE FROM quest_progress WHERE character_id = $1 AND quest_id = $2 AND state = 'active'", [p.characterId, questId]);
      this.send(p);
    });
  }

  onKill(p, monster) {
    for (const [id, s] of p.quests) {
      if (s.state !== 'active') continue;
      const q = QUESTS[id];
      let changed = false;
      q.objectives.forEach((o, i) => {
        if (o.type !== 'kill' || o.monster !== monster.def.id) return;
        const cur = s.progress[i] || 0;
        if (cur >= o.count) return;
        s.progress = { ...s.progress, [i]: cur + 1 };
        changed = true;
      });
      if (changed) this.persistProgress(p, id, s);
    }
  }

  checkExplore(p) {
    for (const [id, s] of p.quests) {
      if (s.state !== 'active') continue;
      QUESTS[id].objectives.forEach((o, i) => {
        if (o.type !== 'explore' || s.progress[i]) return;
        if (Math.hypot(p.x - o.x, p.z - o.z) <= o.radius) {
          s.progress = { ...s.progress, [i]: 1 };
          this.world.emitTo(p, { k: 'qexplore', q: id, label: o.label });
          this.persistProgress(p, id, s);
        }
      });
    }
  }

  persistProgress(p, questId, s) {
    const progress = s.progress;
    this.world.enqueue(p, async () => {
      await this.pool.query(
        "UPDATE quest_progress SET progress = $3 WHERE character_id = $1 AND quest_id = $2 AND state = 'active'",
        [p.characterId, questId, progress]);
      this.send(p);
    });
  }

  turnIn(p, questId) {
    const q = QUESTS[questId];
    const w = this.world;
    const s = p.quests.get(questId);
    if (!q || !s || s.state !== 'active' || s.turningIn) return;
    if (!this.nearGiver(p, q)) return w.sendError(p, 'TOO_FAR', 'Return to the quest giver to finish this.');
    if (!this.status(p, q).every((o) => o.done)) return w.sendError(p, 'QUEST_INCOMPLETE', 'You have not finished that yet.');
    s.turningIn = true;
    w.enqueue(p, async () => {
      try {
        const r = q.rewards;
        const items = (r.items || []).map(([defId, qty]) => ({ defId, qty }));
        if (r.classItems?.[p.cls]) items.push({ defId: r.classItems[p.cls], qty: 1 });
        const result = await tx(this.pool, async (c) => {
          await repo.lockCharacter(c, p.characterId);
          // The state flip is the guard: a quest row can only leave 'active' once.
          const flip = await c.query(
            "UPDATE quest_progress SET state = 'completed', completed_at = now() WHERE character_id = $1 AND quest_id = $2 AND state = 'active'",
            [p.characterId, questId]);
          if (!flip.rowCount) throw new repo.GameError('QUEST_DONE', 'That task is already complete.');
          for (const o of q.objectives) {
            if (o.type === 'collect') await repo.takeItemsTx(c, p.characterId, o.item, o.count, 'quest_turnin', { quest: q.id });
          }
          return repo.grantItemsTx(c, p.characterId, items, { action: 'quest_reward', origin: `quest:${q.id}`, gold: r.gold || 0, meta: { quest: q.id } });
        });
        s.state = 'completed';
        if (result.gold !== null) p.gold = result.gold;
        if (r.xp) w.combat.grantXp(p, r.xp);
        await w.refreshInventory(p);
        w.emitTo(p, { k: 'qdone', q: q.id, xp: r.xp || 0, g: r.gold || 0, items: items.map((i) => [i.defId, i.qty]) });
        w.sendSelf(p);
        this.send(p);
        w.savePlayer(p);
      } finally {
        s.turningIn = false;
      }
    });
  }
}

export function questRewardItemsValid() {
  for (const q of Object.values(QUESTS)) {
    for (const [id] of q.rewards.items || []) if (!ITEMS[id]) return `${q.id}: ${id}`;
    for (const id of Object.values(q.rewards.classItems || {})) if (!ITEMS[id]) return `${q.id}: ${id}`;
    for (const o of q.objectives) if (o.type === 'collect' && !ITEMS[o.item]) return `${q.id}: ${o.item}`;
  }
  return null;
}
