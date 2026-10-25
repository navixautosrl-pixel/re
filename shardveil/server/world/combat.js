// Authoritative combat: attacks, skills, status effects, deaths, XP and loot.
// Clients only ever *request* an action; every outcome is decided here.
import { CLASSES, SKILLS } from '../../shared/data/classes.js';
import { PROGRESSION, xpForLevel, xpLevelMultiplier } from '../../shared/data/progression.js';
import { rollDamage, mitigate } from '../../shared/stats.js';
import { rollLoot } from './loot.js';
import { engage } from './ai.js';

// Extra reach granted to absorb network latency between what the client saw
// and where the server has the target now.
const RANGE_SLACK = 1.2;
const COOLDOWN_SLACK = 0.08;
const XP_SHARE_RADIUS = 60;

export class Combat {
  constructor(world) {
    this.world = world;
  }

  // ---- Player actions ----------------------------------------------------

  basicAttack(p, targetId) {
    const w = this.world;
    if (p.dead) return;
    const m = w.monsters.get(targetId);
    if (!m || m.dead) return;
    const basic = CLASSES[p.cls].basic;
    if (w.time + COOLDOWN_SLACK < p.basicReadyAt) return;
    if (this.distance(p, m) > basic.range + m.def.radius + RANGE_SLACK) {
      w.sendError(p, 'OUT_OF_RANGE', 'Target is out of range.');
      return;
    }
    p.basicReadyAt = w.time + basic.cooldown;
    p.ry = Math.atan2(m.x - p.x, m.z - p.z);
    this.markCombat(p);
    const { amount, crit } = rollDamage(w.rng, p.stats, m.def.defense, basic.kind, basic.mult);
    w.emit(p.x, p.z, { k: 'atk', s: p.id, t: m.id, pr: basic.projectile || null });
    this.damageMonster(p, m, amount, crit, 'basic');
  }

  useSkill(p, skillId, targetId) {
    const w = this.world;
    if (p.dead) return;
    const skill = SKILLS[skillId];
    const cls = CLASSES[p.cls];
    if (!skill || !cls.skills.includes(skillId)) return w.sendError(p, 'BAD_SKILL', 'You do not know that skill.');
    if (p.level < skill.unlockLevel) return w.sendError(p, 'SKILL_LOCKED', `${skill.name} unlocks at level ${skill.unlockLevel}.`);
    if (w.time + COOLDOWN_SLACK < (p.cooldowns.get(skillId) || 0)) return w.sendError(p, 'COOLDOWN', `${skill.name} is not ready.`);
    if (p.mp < skill.mana) return w.sendError(p, 'NO_MANA', 'Not enough mana.');

    let target = null;
    const healsAlly = skill.effects.some((e) => e.type === 'heal' && e.target === 'ally');
    if (healsAlly) {
      target = w.players.get(targetId) || p;
      if (target.dead) target = p;
    } else if (targetId != null) {
      target = w.monsters.get(targetId) || null;
      if (target && target.dead) target = null;
    }
    if (skill.needsTarget && !target) return w.sendError(p, 'NO_TARGET', 'You need a target.');
    if (target && target !== p) {
      const reach = skill.range + (target.def ? target.def.radius : 0.5) + RANGE_SLACK;
      if (this.distance(p, target) > reach) return w.sendError(p, 'OUT_OF_RANGE', 'Target is out of range.');
      p.ry = Math.atan2(target.x - p.x, target.z - p.z);
    }

    p.mp -= skill.mana;
    p.cooldowns.set(skillId, w.time + skill.cooldown);
    this.markCombat(p);
    w.emit(p.x, p.z, { k: 'cast', s: p.id, sk: skillId, t: target ? target.id : null, x: round(target ? target.x : p.x), z: round(target ? target.z : p.z), ry: round(p.ry) });

    for (const e of skill.effects) {
      switch (e.type) {
        case 'damage': {
          for (const m of this.skillTargets(p, target, e)) {
            for (let h = 0; h < (e.hits || 1); h++) {
              if (m.dead) break;
              const { amount, crit } = rollDamage(w.rng, p.stats, m.def.defense, e.kind, e.mult);
              this.damageMonster(p, m, amount, crit, skillId);
            }
          }
          break;
        }
        case 'status': {
          if (target && target.def && !target.dead) this.applyStatus(target, e, p);
          break;
        }
        case 'buff': {
          p.buffs = p.buffs.filter((b) => b.id !== e.id);
          p.buffs.push({ ...e, until: w.time + e.duration });
          w.emit(p.x, p.z, { k: 'buff', t: p.id, b: e.id, d: e.duration });
          break;
        }
        case 'heal': {
          const t = target || p;
          const power = (p.stats.magic[0] + p.stats.magic[1]) / 2;
          this.healPlayer(p, t, Math.round(power * e.mult + 10));
          break;
        }
        case 'dash': {
          if (!target || target === p) break;
          const dx = target.x - p.x, dz = target.z - p.z;
          const d = Math.hypot(dx, dz);
          const stop = (target.def ? target.def.radius : 0.5) + 1.0;
          if (d > stop) {
            const nx = target.x - (dx / d) * stop, nz = target.z - (dz / d) * stop;
            const res = w.terrain.resolveCollision(nx, nz, 0.4);
            if (w.terrain.isWalkable(res.x, res.z)) w.teleportPlayer(p, res.x, res.z);
          }
          break;
        }
      }
    }
  }

  skillTargets(p, target, e) {
    const w = this.world;
    if (e.shape === 'single') return target && target.def ? [target] : [];
    const cx = e.at === 'target' && target ? target.x : p.x;
    const cz = e.at === 'target' && target ? target.z : p.z;
    const out = [];
    for (const m of w.monsters.values()) {
      if (m.dead) continue;
      const dx = m.x - cx, dz = m.z - cz;
      const d = Math.hypot(dx, dz);
      if (d > e.radius + m.def.radius) continue;
      if (e.shape === 'cone' && d > 0.5) {
        const ang = Math.atan2(dx, dz);
        let diff = Math.abs(ang - p.ry) % (Math.PI * 2);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff > e.angle / 2) continue;
      }
      out.push(m);
    }
    return out;
  }

  usePotion(p, def) {
    if (def.use.heal) this.healPlayer(p, p, def.use.heal);
    if (def.use.mana) p.mp = Math.min(p.stats.maxMp, p.mp + def.use.mana);
  }

  healPlayer(source, target, amount) {
    if (target.dead) return;
    const before = target.hp;
    target.hp = Math.min(target.stats.maxHp, target.hp + amount);
    this.world.emit(target.x, target.z, { k: 'heal', s: source.id, t: target.id, a: Math.round(target.hp - before) });
  }

  markCombat(p) {
    p.lastCombatAt = this.world.time;
  }

  distance(a, b) {
    return Math.hypot(a.x - b.x, a.z - b.z);
  }

  // ---- Damage, statuses, deaths ------------------------------------------

  damageMonster(p, m, amount, crit, source) {
    const w = this.world;
    if (m.dead) return;
    if (m.state === 'return') amount = 0; // leashing monsters shrug off hits
    m.hp -= amount;
    m.damageBy.set(p.id, (m.damageBy.get(p.id) || 0) + amount);
    w.emit(m.x, m.z, { k: 'dmg', s: p.id, t: m.id, a: amount, c: crit ? 1 : 0, f: source });
    if (!m.targetId && !m.def.stationary && m.state !== 'return') engage(m, p);
    if (m.def.summon) this.checkSummons(p, m);
    if (m.hp <= 0) this.killMonster(m);
  }

  applyStatus(m, e, source) {
    const now = this.world.time;
    m.statuses = m.statuses.filter((s) => s.id !== e.id);
    const s = { id: e.id, until: now + e.duration, sourceId: source.id };
    if (e.id === 'poison') {
      const avg = (source.stats.attack[0] + source.stats.attack[1]) / 2;
      s.tickDamage = Math.max(1, Math.round(mitigate(avg * e.tickMult, m.def.defense)));
      s.interval = e.interval;
      s.nextTick = now + e.interval;
    }
    if (e.speedMult) s.speedMult = e.speedMult;
    m.statuses.push(s);
    this.world.emit(m.x, m.z, { k: 'status', t: m.id, st: e.id, d: e.duration });
  }

  tickStatuses(m, now) {
    for (const s of m.statuses) {
      if (s.tickDamage && now >= s.nextTick && now <= s.until + 0.01) {
        s.nextTick += s.interval;
        const src = this.world.players.get(s.sourceId);
        if (src) this.damageMonster(src, m, s.tickDamage, false, 'poison');
        else m.hp -= s.tickDamage;
        if (m.dead) return;
      }
    }
    m.statuses = m.statuses.filter((s) => s.until > now);
  }

  checkSummons(p, m) {
    const sum = m.def.summon;
    const frac = m.hp / m.maxHp;
    while (m.summonIndex < sum.atHpFractions.length && frac <= sum.atHpFractions[m.summonIndex]) {
      m.summonIndex++;
      for (let i = 0; i < sum.count; i++) {
        const a = this.world.rng() * Math.PI * 2;
        const minion = this.world.spawnTemporary(sum.monster, m.x + Math.cos(a) * 4, m.z + Math.sin(a) * 4);
        if (minion) engage(minion, p);
      }
      this.world.emit(m.x, m.z, { k: 'summon', s: m.id });
    }
  }

  killMonster(m) {
    const w = this.world;
    m.dead = true;
    m.hp = 0;
    w.emit(m.x, m.z, { k: 'die', t: m.id });

    // XP split by damage share among contributors still nearby.
    let total = 0;
    const shares = [];
    for (const [pid, dmg] of m.damageBy) {
      const pl = w.players.get(pid);
      if (!pl || pl.dead || Math.hypot(pl.x - m.x, pl.z - m.z) > XP_SHARE_RADIUS) continue;
      shares.push([pl, dmg]);
      total += dmg;
    }
    let top = null, topDmg = 0;
    for (const [pl, dmg] of shares) {
      const xp = Math.max(1, Math.round(m.def.xp * (dmg / total) * xpLevelMultiplier(pl.level, m.def.level)));
      this.grantXp(pl, xp);
      if (dmg > topDmg) { top = pl; topDmg = dmg; }
    }

    if (top) {
      const loot = rollLoot(w.rng, m.def.loot, { rarityBonus: m.def.elite ? 0.12 : 0 });
      w.dropLoot(m, loot, top);
    }
    w.onMonsterKilled(m, top);
  }

  grantXp(p, amount) {
    const w = this.world;
    p.xp += amount;
    w.emitTo(p, { k: 'xp', a: amount });
    let leveled = false;
    while (p.level < PROGRESSION.maxLevel && p.xp >= xpForLevel(p.level)) {
      p.xp -= xpForLevel(p.level);
      p.level++;
      leveled = true;
    }
    if (p.level >= PROGRESSION.maxLevel) p.xp = 0;
    if (leveled) {
      w.recomputeStats(p);
      p.hp = p.stats.maxHp;
      p.mp = p.stats.maxMp;
      w.emit(p.x, p.z, { k: 'lvl', t: p.id, l: p.level });
      w.savePlayer(p); // progression milestones are persisted immediately
    }
  }

  monsterAttack(m, p) {
    const w = this.world;
    const atk = { attack: m.def.attack, magic: [0, 0], crit: m.def.elite ? 8 : 3 };
    const { amount, crit } = rollDamage(w.rng, atk, this.playerDefense(p), 'physical', 1);
    w.emit(m.x, m.z, { k: 'matk', s: m.id, t: p.id });
    this.damagePlayer(m, p, amount, crit);
  }

  startMonsterSpecial(m, p) {
    const sp = m.def.special;
    m.specialReadyAt = this.world.time + sp.every;
    m.casting = { x: p.x, z: p.z, r: sp.radius, resolveAt: this.world.time + sp.windup, mult: sp.mult };
    this.world.emit(m.x, m.z, { k: 'tele', s: m.id, x: round(p.x), z: round(p.z), r: sp.radius, d: sp.windup, sp: sp.id });
  }

  resolveMonsterCast(m) {
    const c = m.casting;
    m.casting = null;
    const w = this.world;
    w.emit(c.x, c.z, { k: 'slam', s: m.id, x: round(c.x), z: round(c.z), r: c.r });
    for (const p of w.players.values()) {
      if (p.dead || Math.hypot(p.x - c.x, p.z - c.z) > c.r) continue;
      const atk = { attack: m.def.attack, magic: [0, 0], crit: 0 };
      const { amount } = rollDamage(w.rng, atk, this.playerDefense(p), 'physical', c.mult);
      this.damagePlayer(m, p, amount, false);
    }
  }

  playerDefense(p) {
    let mult = 1;
    for (const b of p.buffs) if (b.defenseMult) mult *= b.defenseMult;
    return p.stats.defense * mult;
  }

  damagePlayer(m, p, amount, crit) {
    const w = this.world;
    if (p.dead) return;
    p.hp -= amount;
    this.markCombat(p);
    w.emit(p.x, p.z, { k: 'dmg', s: m.id, t: p.id, a: amount, c: crit ? 1 : 0 });
    if (p.hp <= 0) this.playerDie(p, m);
  }

  playerDie(p, killer) {
    const w = this.world;
    p.hp = 0;
    p.dead = true;
    p.diedAt = w.time;
    p.buffs = [];
    let lost = 0;
    if (p.level >= PROGRESSION.deathXpLossFromLevel) {
      lost = Math.min(p.xp, Math.round(xpForLevel(p.level) * PROGRESSION.deathXpLossFraction));
      p.xp -= lost;
    }
    w.emit(p.x, p.z, { k: 'pdie', t: p.id, by: killer ? killer.def.name : null, xl: lost });
    // Monsters chasing a dead player go home.
    for (const m of w.monsters.values()) if (m.targetId === p.id) m.targetId = null;
    w.savePlayer(p);
  }
}

const round = (v) => Math.round(v * 100) / 100;

