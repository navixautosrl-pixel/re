// The authoritative world simulation for one zone: players, monsters, ground
// loot, the fixed-rate tick, interest-managed snapshots and persistence hooks.
import { performance } from 'node:perf_hooks';
import { ZONES } from '../../shared/data/zones.js';
import { MONSTERS } from '../../shared/data/monsters.js';
import { ITEMS, EQUIP_SLOTS } from '../../shared/data/items.js';
import { PROGRESSION, xpForLevel } from '../../shared/data/progression.js';
import { createTerrain } from '../../shared/terrain.js';
import { computeStats } from '../../shared/stats.js';
import { TICK_RATE, SNAPSHOT_RATE, INTEREST_RADIUS, S } from '../../shared/protocol.js';
import { mulberry32 } from '../../shared/rng.js';
import { Combat } from './combat.js';
import { QuestService } from './quests.js';
import { updateMonster } from './ai.js';
import * as repo from '../repo/characters.js';
import { log } from '../log.js';

const PLAYER_RADIUS = 0.4;
const PICKUP_RANGE = 3.5;
const SAY_RADIUS = 45;
const DAY_LENGTH_SEC = 1440; // one in-game day every 24 real minutes
const MAX_TEMPORARY_MONSTERS = 40;

const r2 = (v) => Math.round(v * 100) / 100;

export class World {
  constructor({ pool, zoneId = 'hollowmere', seed = Date.now() & 0xffffffff, saveIntervalSec = 15, hooks = {} }) {
    this.pool = pool;
    this.zone = ZONES[zoneId];
    this.terrain = createTerrain(this.zone);
    this.rng = mulberry32(seed);
    this.combat = new Combat(this);
    this.quests = new QuestService(this);
    this.hooks = hooks; // optional { onKill(player, monster) } for quests etc.

    this.players = new Map();     // entity id -> player
    this.byCharacter = new Map(); // character id -> player
    this.monsters = new Map();
    this.loot = new Map();
    this.nextId = 1;

    this.saveIntervalSec = saveIntervalSec;
    this.startedAt = performance.now();
    this.time = 0;
    this.tickCount = 0;
    this.metrics = { tickAvgMs: 0, tickMaxMs: 0, snapshotBytes: 0 };
    this.temporaryCount = 0;

    this.slots = [];
    this.buildSpawns();
  }

  // ---- Lifecycle -----------------------------------------------------------

  start() {
    this.timer = setInterval(() => this.tick(), 1000 / TICK_RATE);
  }

  async stop() {
    clearInterval(this.timer);
    const all = [...this.players.values()];
    for (const p of all) p.send({ t: S.KICK, reason: 'The server is shutting down. Your progress has been saved.' });
    await Promise.all(all.map((p) => this.removePlayer(p)));
  }

  tick() {
    const t0 = performance.now();
    const now = (t0 - this.startedAt) / 1000;
    const dt = Math.min(0.2, now - this.time);
    this.time = now;
    this.tickCount++;

    const slowTick = this.tickCount % TICK_RATE === 0; // once per second
    for (const p of this.players.values()) {
      this.updatePlayer(p, dt);
      if (slowTick && !p.dead) this.quests.checkExplore(p);
    }

    for (const m of this.monsters.values()) {
      if (m.dead) {
        if (now >= m.removeAt) this.monsters.delete(m.id);
        continue;
      }
      if (m.casting && now >= m.casting.resolveAt) this.combat.resolveMonsterCast(m);
      updateMonster(this, m, dt);
    }

    for (const slot of this.slots) {
      if (!slot.monster && now >= slot.respawnAt) this.spawnInSlot(slot);
    }

    for (const l of this.loot.values()) {
      if (now >= l.expiresAt && !l.claiming) this.loot.delete(l.id);
    }

    if (this.tickCount % Math.round(TICK_RATE / SNAPSHOT_RATE) === 0) this.sendSnapshots();
    for (const p of this.players.values()) {
      if (p.events.length) {
        p.send({ t: S.EVENT, e: p.events });
        p.events = [];
      }
      if (now - p.lastSaveAt >= this.saveIntervalSec) this.savePlayer(p);
    }

    const ms = performance.now() - t0;
    this.metrics.tickAvgMs = this.metrics.tickAvgMs * 0.98 + ms * 0.02;
    this.metrics.tickMaxMs = Math.max(this.metrics.tickMaxMs * 0.999, ms);
  }

  // ---- Spawning ------------------------------------------------------------

  buildSpawns() {
    for (const group of this.zone.spawns) {
      if (!MONSTERS[group.monster]) throw new Error(`Unknown monster in spawn table: ${group.monster}`);
      for (let i = 0; i < group.count; i++) {
        let hx = group.x, hz = group.z;
        for (let tries = 0; tries < 12; tries++) {
          const a = this.rng() * Math.PI * 2, r = Math.sqrt(this.rng()) * group.radius;
          const cx = group.x + Math.cos(a) * r, cz = group.z + Math.sin(a) * r;
          const res = this.terrain.resolveCollision(cx, cz, 1);
          if (this.terrain.isWalkable(res.x, res.z) && !this.terrain.inSafeZone(res.x, res.z)) { hx = res.x; hz = res.z; break; }
        }
        const slot = { group, homeX: hx, homeZ: hz, monster: null, respawnAt: 0 };
        this.slots.push(slot);
        this.spawnInSlot(slot);
      }
    }
  }

  makeMonster(defId, x, z, spawn) {
    const def = MONSTERS[defId];
    const m = {
      kind: 'monster', id: this.nextId++, def, x, z, ry: this.rng() * Math.PI * 2,
      hp: def.hp, maxHp: def.hp, state: 'idle', targetId: null, spawn,
      damageBy: new Map(), statuses: [], attackReadyAt: 0, specialReadyAt: this.time + 4, casting: null,
      nextAggroCheck: 0, nextWander: this.time + this.rng() * 4, nextWakeCheck: 0, asleep: false,
      wanderTo: null, summonIndex: 0, dead: false, removeAt: 0, temporary: false, slot: null,
    };
    this.monsters.set(m.id, m);
    return m;
  }

  spawnInSlot(slot) {
    const g = slot.group;
    const m = this.makeMonster(g.monster, slot.homeX, slot.homeZ,
      { x: g.x, z: g.z, radius: g.radius, homeX: slot.homeX, homeZ: slot.homeZ });
    m.slot = slot;
    slot.monster = m;
  }

  spawnTemporary(defId, x, z) {
    if (this.temporaryCount >= MAX_TEMPORARY_MONSTERS) return null;
    const res = this.terrain.resolveCollision(x, z, 0.8);
    if (!this.terrain.isWalkable(res.x, res.z)) return null;
    const m = this.makeMonster(defId, res.x, res.z, { x: res.x, z: res.z, radius: 4, homeX: res.x, homeZ: res.z });
    m.temporary = true;
    this.temporaryCount++;
    return m;
  }

  despawnMonster(m) {
    if (m.dead) return;
    m.dead = true;
    m.removeAt = this.time;
    if (m.temporary) this.temporaryCount--;
    this.emit(m.x, m.z, { k: 'despawn', t: m.id });
  }

  onMonsterKilled(m, killer, contributors = []) {
    m.removeAt = this.time + 2.5; // leave the body briefly for the death animation
    if (m.temporary) this.temporaryCount--;
    if (m.slot) {
      m.slot.monster = null;
      m.slot.respawnAt = this.time + m.slot.group.respawn;
    }
    for (const p of contributors) this.quests.onKill(p, m);
    if (killer && this.hooks.onKill) this.hooks.onKill(killer, m);
  }

  // ---- Players -------------------------------------------------------------

  // `ch` comes from repo.loadCharacter; `send` writes one message to the socket.
  addPlayer(ch, send, close) {
    const p = {
      kind: 'player', id: this.nextId++, characterId: ch.id, accountId: ch.account_id,
      name: ch.name, cls: ch.class, level: ch.level, xp: ch.xp, gold: ch.gold,
      hp: ch.hp, mp: ch.mp, x: ch.x, z: ch.z, ry: ch.ry, playSeconds: ch.play_seconds,
      items: ch.items, stats: null, send, close,
      known: new Set(), events: [], cooldowns: new Map(), potionReady: new Map(),
      basicReadyAt: 0, buffs: [], dead: false, diedAt: 0, lastCombatAt: -999,
      moveBudget: 0, lastMoveAt: this.time, violations: 0,
      queue: Promise.resolve(), saveChain: Promise.resolve(), lastSaveAt: this.time,
      chatTimes: [], removed: false, joinedAt: this.time,
    };
    this.recomputeStats(p);
    this.quests.init(p, ch.quests || []);
    if (p.hp <= 0 || !this.terrain.isWalkable(p.x, p.z)) {
      // Logged out dead (or somewhere invalid): wake up at the brazier.
      p.x = this.zone.respawn.x; p.z = this.zone.respawn.z;
      p.hp = Math.max(1, Math.round(p.stats.maxHp * PROGRESSION.reviveHpFraction));
    }
    this.players.set(p.id, p);
    this.byCharacter.set(p.characterId, p);

    send({
      t: S.WELCOME,
      you: p.id,
      character: { id: p.characterId, name: p.name, cls: p.cls, level: p.level, xp: p.xp, gold: p.gold, x: p.x, z: p.z, ry: p.ry },
      inventory: p.items,
      serverTime: this.time,
      zone: this.zone.id,
      dayPhase: (Date.now() / 1000 % DAY_LENGTH_SEC) / DAY_LENGTH_SEC,
      dayLength: DAY_LENGTH_SEC,
    });
    this.sendSelf(p);
    this.quests.send(p);
    this.broadcastNotice(`${p.name} has entered ${this.zone.name}.`, 'system', p);
    log.info('player joined', { character: p.characterId, name: p.name, online: this.players.size });
    return p;
  }

  async removePlayer(p) {
    if (p.removed) return p.finalSave;
    p.removed = true;
    this.players.delete(p.id);
    if (this.byCharacter.get(p.characterId) === p) this.byCharacter.delete(p.characterId);
    for (const m of this.monsters.values()) if (m.targetId === p.id) m.targetId = null;
    // Let in-flight item operations land before the final state write.
    p.finalSave = p.queue.then(() => this.savePlayer(p)).catch((err) => log.error('final save failed', { err: err.message }));
    log.info('player left', { character: p.characterId, online: this.players.size });
    return p.finalSave;
  }

  playerByAccount(accountId) {
    for (const p of this.players.values()) if (p.accountId === accountId) return p;
    return null;
  }

  savePlayer(p) {
    p.lastSaveAt = this.time;
    const state = { id: p.characterId, level: p.level, xp: p.xp, hp: p.hp, mp: p.mp, x: p.x, z: p.z, ry: p.ry, playSeconds: p.playSeconds };
    p.saveChain = p.saveChain
      .then(() => repo.saveCharacterState(this.pool, state))
      .catch((err) => log.error('save failed', { character: p.characterId, err: err.message }));
    return p.saveChain;
  }

  recomputeStats(p) {
    const eq = p.items.filter((i) => i.container === 'equip').map((i) => ({ defId: i.defId, affixes: i.affixes, upgrade: i.upgrade }));
    p.stats = computeStats(p.cls, p.level, eq);
    p.hp = Math.min(p.hp, p.stats.maxHp);
    p.mp = Math.min(p.mp, p.stats.maxMp);
  }

  updatePlayer(p, dt) {
    const now = this.time;
    p.playSeconds += dt;
    if (p.dead) return;
    if (p.buffs.length) {
      for (const b of p.buffs) if (b.regenPerSec) p.hp = Math.min(p.stats.maxHp, p.hp + b.regenPerSec * dt);
      p.buffs = p.buffs.filter((b) => b.until > now);
    }
    const rg = PROGRESSION.regen;
    if (now - p.lastCombatAt > rg.outOfCombatDelay) {
      p.hp = Math.min(p.stats.maxHp, p.hp + p.stats.maxHp * rg.hpPerSecFraction * dt);
      p.mp = Math.min(p.stats.maxMp, p.mp + p.stats.maxMp * rg.mpPerSecFraction * dt);
    } else {
      p.mp = Math.min(p.stats.maxMp, p.mp + p.stats.maxMp * rg.mpPerSecFraction * 0.25 * dt);
    }
  }

  teleportPlayer(p, x, z) {
    p.x = x; p.z = z;
    p.moveBudget = 0;
    p.send({ t: S.CORRECT, x: r2(x), z: r2(z), tp: 1 });
  }

  // ---- Message handling ----------------------------------------------------

  handle(p, msg) {
    if (p.removed || !msg || typeof msg.t !== 'string') return;
    switch (msg.t) {
      case 'move': return this.handleMove(p, msg);
      case 'attack': return Number.isInteger(msg.target) && this.combat.basicAttack(p, msg.target);
      case 'skill': return typeof msg.skill === 'string' && this.combat.useSkill(p, msg.skill, Number.isInteger(msg.target) ? msg.target : null);
      case 'pickup': return Number.isInteger(msg.id) && this.handlePickup(p, msg.id);
      case 'equip': return this.slotOp(p, msg.slot, (s) => repo.equipItem(this.pool, p.characterId, s, p.level));
      case 'unequip': return EQUIP_SLOTS.includes(msg.slot) && this.inventoryOp(p, () => repo.unequipItem(this.pool, p.characterId, msg.slot));
      case 'use': return this.handleUse(p, msg.slot);
      case 'moveItem': return this.inventoryOp(p, () => repo.moveBagItem(this.pool, p.characterId, msg.from, msg.to));
      case 'drop': return this.slotOp(p, msg.slot, (s) => repo.destroyBagItem(this.pool, p.characterId, s));
      case 'chat': return this.handleChat(p, msg);
      case 'revive': return this.handleRevive(p);
      case 'questAccept': return typeof msg.quest === 'string' && this.quests.accept(p, msg.quest);
      case 'questTurnIn': return typeof msg.quest === 'string' && this.quests.turnIn(p, msg.quest);
      case 'questAbandon': return typeof msg.quest === 'string' && this.quests.abandon(p, msg.quest);
      case 'ping': return p.send({ t: S.PONG, t0: msg.t0, serverTime: this.time });
      default: return undefined;
    }
  }

  handleMove(p, msg) {
    const { x, z, ry } = msg;
    if (!Number.isFinite(x) || !Number.isFinite(z)) return;
    const now = this.time;
    const speed = PROGRESSION.moveSpeed;
    p.moveBudget = Math.min(speed * 1.5, p.moveBudget + speed * (now - p.lastMoveAt) * 1.25);
    p.lastMoveAt = now;
    if (Number.isFinite(ry)) p.ry = ry;
    if (p.dead) return this.correct(p);

    const d = Math.hypot(x - p.x, z - p.z);
    if (d > p.moveBudget + 0.35) {
      p.violations++;
      if (p.violations % 20 === 1) log.warn('movement rejected', { character: p.characterId, dist: r2(d), budget: r2(p.moveBudget) });
      return this.correct(p);
    }
    const res = this.terrain.resolveCollision(x, z, PLAYER_RADIUS);
    if (!this.terrain.isWalkable(res.x, res.z)) return this.correct(p);
    p.moveBudget -= d;
    p.x = res.x;
    p.z = res.z;
    if (Math.hypot(res.x - x, res.z - z) > 0.3) this.correct(p);
  }

  correct(p) {
    p.send({ t: S.CORRECT, x: r2(p.x), z: r2(p.z) });
  }

  handleRevive(p) {
    if (!p.dead || this.time - p.diedAt < 3) return;
    p.dead = false;
    p.hp = Math.round(p.stats.maxHp * PROGRESSION.reviveHpFraction);
    p.mp = Math.round(p.stats.maxMp * PROGRESSION.reviveHpFraction);
    const sp = this.zone.respawn;
    this.teleportPlayer(p, sp.x, sp.z);
    this.emit(p.x, p.z, { k: 'revive', t: p.id });
  }

  handleChat(p, msg) {
    const channel = msg.channel === 'global' ? 'global' : 'say';
    const text = String(msg.text ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 200);
    if (!text) return;
    const now = this.time;
    p.chatTimes = p.chatTimes.filter((t) => now - t < 5);
    if (p.chatTimes.length >= 5) return this.sendError(p, 'CHAT_RATE', 'You are sending messages too quickly.');
    p.chatTimes.push(now);
    const out = { t: S.CHAT, ch: channel, from: p.name, text };
    for (const q of this.players.values()) {
      if (channel === 'global' || Math.hypot(q.x - p.x, q.z - p.z) <= SAY_RADIUS) q.send(out);
    }
  }

  handlePickup(p, lootId) {
    if (p.dead) return;
    const l = this.loot.get(lootId);
    if (!l || l.claiming) return;
    if (Math.hypot(l.x - p.x, l.z - p.z) > PICKUP_RANGE) return this.sendError(p, 'OUT_OF_RANGE', 'Move closer to pick that up.');
    if (l.ownerCharacterId && l.ownerCharacterId !== p.characterId && this.time < l.ownerUntil) {
      return this.sendError(p, 'NOT_YOURS', 'That loot belongs to another adventurer for now.');
    }
    // Claim synchronously so a second pickup request in the same tick cannot
    // also be granted while the first is still in the database.
    l.claiming = true;
    const isGold = l.defId === 'gold';
    this.enqueue(p, async () => {
      try {
        const res = await repo.grantItems(this.pool, p.characterId,
          isGold ? [] : [{ defId: l.defId, qty: l.qty, rarity: l.rarity, affixes: l.affixes }],
          { action: 'loot', origin: `loot:${l.source}`, gold: isGold ? l.qty : 0, meta: { monster: l.source, lootId: l.id } });
        this.loot.delete(l.id);
        if (res.gold !== null) p.gold = res.gold;
        if (!isGold) await this.refreshInventory(p);
        this.emitTo(p, { k: 'loot', df: l.defId, q: l.qty, ra: l.rarity });
        this.sendSelf(p);
      } catch (err) {
        l.claiming = false;
        throw err;
      }
    });
  }

  handleUse(p, slot) {
    if (!Number.isInteger(slot) || p.dead) return;
    const it = p.items.find((i) => i.container === 'bag' && i.slot === slot);
    if (!it) return;
    const def = ITEMS[it.defId];
    if (!def || def.type !== 'consumable') return this.sendError(p, 'NOT_USABLE', 'That cannot be used.');
    const group = def.use.group;
    if (this.time < (p.potionReady.get(group) || 0)) return this.sendError(p, 'COOLDOWN', `${def.name} is not ready.`);
    p.potionReady.set(group, this.time + def.use.cooldown);
    this.enqueue(p, async () => {
      try {
        const used = await repo.consumeItem(this.pool, p.characterId, slot);
        if (!p.dead) this.combat.usePotion(p, used);
      } catch (err) {
        p.potionReady.delete(group);
        throw err;
      }
      await this.refreshInventory(p);
    });
  }

  slotOp(p, slot, fn) {
    if (!Number.isInteger(slot) || slot < 0 || slot >= PROGRESSION.inventorySlots) return;
    this.inventoryOp(p, () => fn(slot));
  }

  inventoryOp(p, fn) {
    this.enqueue(p, async () => {
      await fn();
      await this.refreshInventory(p);
    });
  }

  // Item operations for one player run strictly one after another.
  enqueue(p, fn) {
    p.queue = p.queue.then(fn).catch((err) => {
      if (err instanceof repo.GameError) this.sendError(p, err.code, err.message);
      else {
        log.error('player operation failed', { character: p.characterId, err: err.message });
        this.sendError(p, 'SERVER', 'Something went wrong. Please try again.');
      }
    });
    return p.queue;
  }

  async refreshInventory(p) {
    p.items = await repo.loadItems(this.pool, p.characterId);
    const wasEquip = JSON.stringify(p.stats);
    this.recomputeStats(p);
    p.send({ t: S.INVENTORY, items: p.items });
    if (JSON.stringify(p.stats) !== wasEquip) this.sendSelf(p);
  }

  sendSelf(p) {
    p.send({ t: S.SELF, stats: p.stats, gold: p.gold, level: p.level, xp: p.xp, xpNext: xpForLevel(p.level) });
  }

  sendError(p, code, message) {
    p.send({ t: S.ERROR, code, message });
  }

  broadcastNotice(text, kind = 'system', except = null) {
    for (const q of this.players.values()) if (q !== except) q.send({ t: S.NOTICE, text, kind });
  }

  // ---- Loot ----------------------------------------------------------------

  dropLoot(m, loot, owner) {
    const drops = [];
    if (loot.gold > 0) drops.push({ defId: 'gold', qty: loot.gold, rarity: 'common', affixes: {} });
    drops.push(...loot.items);
    for (const d of drops) {
      const a = this.rng() * Math.PI * 2, r = 0.6 + this.rng() * 1.4;
      const l = {
        kind: 'loot', id: this.nextId++, x: m.x + Math.cos(a) * r, z: m.z + Math.sin(a) * r,
        defId: d.defId, qty: d.qty, rarity: d.rarity, affixes: d.affixes, source: m.def.id,
        ownerCharacterId: owner.characterId, ownerUntil: this.time + PROGRESSION.lootOwnershipSeconds,
        expiresAt: this.time + PROGRESSION.lootDespawnSeconds, claiming: false,
      };
      this.loot.set(l.id, l);
    }
  }

  // ---- Queries used by AI / combat ------------------------------------------

  anyPlayerWithin(x, z, r) {
    for (const p of this.players.values()) if (Math.hypot(p.x - x, p.z - z) <= r) return true;
    return false;
  }

  nearestAggroTarget(m, radius) {
    let best = null, bestD = radius;
    for (const p of this.players.values()) {
      if (p.dead) continue;
      const d = Math.hypot(p.x - m.x, p.z - m.z);
      if (d <= bestD && !this.terrain.inSafeZone(p.x, p.z)) { best = p; bestD = d; }
    }
    return best;
  }

  // ---- Events & snapshots ---------------------------------------------------

  emit(x, z, ev) {
    for (const p of this.players.values()) {
      if (Math.hypot(p.x - x, p.z - z) <= INTEREST_RADIUS) p.events.push(ev);
    }
  }

  emitTo(p, ev) {
    p.events.push(ev);
  }

  sendSnapshots() {
    let bytes = 0;
    for (const p of this.players.values()) {
      const seen = new Set();
      const ps = [], ms = [], ls = [];
      for (const q of this.players.values()) {
        if (Math.hypot(q.x - p.x, q.z - p.z) > INTEREST_RADIUS) continue;
        seen.add(q.id);
        const e = { i: q.id, x: r2(q.x), z: r2(q.z), r: r2(q.ry), hp: Math.ceil(q.hp), mh: q.stats.maxHp, lv: q.level, d: q.dead ? 1 : 0 };
        if (!p.known.has(q.id)) { e.n = q.name; e.c = q.cls; }
        e.w = q.items.find((i) => i.container === 'equip' && i.slot === 0)?.defId || null;
        ps.push(e);
      }
      for (const m of this.monsters.values()) {
        if (Math.hypot(m.x - p.x, m.z - p.z) > INTEREST_RADIUS) continue;
        seen.add(m.id);
        const e = { i: m.id, x: r2(m.x), z: r2(m.z), r: r2(m.ry), hp: Math.ceil(Math.max(0, m.hp)), mh: m.maxHp, s: m.state === 'chase' ? 1 : 0, d: m.dead ? 1 : 0 };
        if (!p.known.has(m.id)) e.df = m.def.id;
        if (m.statuses.length) e.st = m.statuses.map((s) => s.id);
        ms.push(e);
      }
      for (const l of this.loot.values()) {
        if (l.claiming || Math.hypot(l.x - p.x, l.z - p.z) > INTEREST_RADIUS) continue;
        seen.add(l.id);
        const mine = !l.ownerCharacterId || l.ownerCharacterId === p.characterId || this.time >= l.ownerUntil;
        ls.push({ i: l.id, x: r2(l.x), z: r2(l.z), df: l.defId, q: l.qty, ra: l.rarity, o: mine ? 1 : 0 });
      }
      p.known = seen;

      const cd = {};
      for (const [k, until] of p.cooldowns) if (until > this.time) cd[k] = r2(until - this.time);
      const you = {
        hp: Math.ceil(p.hp), mp: Math.floor(p.mp), mhp: p.stats.maxHp, mmp: p.stats.maxMp,
        xp: p.xp, xpn: xpForLevel(p.level), lv: p.level, g: p.gold, d: p.dead ? 1 : 0, cd,
        bf: p.buffs.map((b) => ({ id: b.id, r: r2(b.until - this.time) })),
        rg: this.terrain.regionAt(p.x, p.z)?.id || null,
      };
      const json = JSON.stringify({ t: S.SNAPSHOT, st: r2(this.time), p: ps, m: ms, l: ls, you });
      bytes += json.length;
      p.send(json);
    }
    this.metrics.snapshotBytes = bytes;
  }

  stats() {
    return {
      zone: this.zone.id,
      players: this.players.size,
      monsters: this.monsters.size,
      loot: this.loot.size,
      tickAvgMs: r2(this.metrics.tickAvgMs),
      tickMaxMs: r2(this.metrics.tickMaxMs),
      snapshotBytesPerSend: this.metrics.snapshotBytes,
      uptimeSec: Math.round(this.time),
    };
  }
}

