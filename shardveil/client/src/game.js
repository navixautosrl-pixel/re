// Client-side game session: owns the entities for one connection, predicts
// the local player's movement (validated by the server), interpolates
// everyone else, and turns input into requests. The server decides outcomes.
import * as THREE from '/vendor/three/three.module.js';
import { CLASSES, SKILLS } from '/shared/data/classes.js';
import { MONSTERS } from '/shared/data/monsters.js';
import { ITEMS, RARITIES } from '/shared/data/items.js';
import { PROGRESSION } from '/shared/data/progression.js';
import { buildHumanoid, buildMonster, buildLoot, animate, setWeapon } from './scene/models.js';
import { Fx } from './scene/fx.js';
import { Hud } from './ui/hud.js';
import { QuestUi } from './ui/quests.js';
import { settings, actionForCode } from './settings.js';
import { sfx, initAudio, setAmbientNight } from './audio.js';

const PLAYER_RADIUS = 0.4;
const MOVE_SEND_INTERVAL = 0.1;
const NPC_COLORS = {
  quest: { primary: '#5b6b7a', secondary: '#a8824f', cloth: '#3b4a58' },
  merchant: { primary: '#7a5a38', secondary: '#c9b48a', cloth: '#5a4330' },
  storage: { primary: '#4a4a5a', secondary: '#a8824f', cloth: '#2f3442' },
};
const damp = (k, dt) => 1 - Math.exp(-k * dt);
const angleLerp = (a, b, t) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return a + d * t;
};

export class Game {
  constructor({ app, scene, camera, renderer, terrain, connection, welcome }) {
    this.app = app;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.terrain = terrain;
    this.conn = connection;
    this.fx = new Fx(scene, terrain);
    this.entities = new Map();
    this.root = new THREE.Group();
    scene.add(this.root);

    this.keys = new Set();
    this.targetId = null;
    this.autoAttack = false;
    this.basicReadyAt = 0;
    this.potionReadyAt = {};
    this.moveTimer = 0;
    this.lastSent = { x: 0, z: 0, ry: 0 };
    this.cameraYaw = Math.PI;
    this.cameraPitch = 0.42;
    this.camDist = 9;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.pendingPickup = null;
    this.moveTarget = null;
    this.dayPhase = welcome.dayPhase;
    this.dayLength = welcome.dayLength;
    this.dayStart = performance.now() / 1000 - welcome.dayPhase * welcome.dayLength;

    this.applyWelcome(welcome);
    this.spawnNpcs();
    this.hud = new Hud(this);
    this.questUi = new QuestUi(this);
    this.hud.renderInventory();
    this.hud.chatLine('system', null, `Welcome to ${terrain.zone.name}. Press Enter to talk, Esc for settings.`);
    this.bindInput();
  }

  // ---- Setup ------------------------------------------------------------------
  applyWelcome(w) {
    const ch = w.character;
    this.myId = w.you;
    this.inventory = w.inventory;
    this.me = {
      name: ch.name, cls: ch.cls, level: ch.level, xp: ch.xp, xpn: Infinity, gold: ch.gold,
      hp: 1, mp: 0, mhp: 1, mmp: 1, dead: false, cd: {}, buffs: [], stats: null,
    };
    const weapon = this.inventory.find((i) => i.container === 'equip' && i.slot === 0)?.defId;
    const model = buildHumanoid({ cls: ch.cls, weaponDef: weapon });
    this.player = model.root;
    this.player.position.set(ch.x, this.terrain.heightAt(ch.x, ch.z), ch.z);
    this.player.rotation.y = ch.ry;
    this.cameraYaw = ch.ry + Math.PI;
    this.root.add(this.player);
    const ent = {
      id: this.myId, type: 'player', name: ch.name, level: ch.level, cls: ch.cls, hp: 1, mh: 1,
      x: ch.x, z: ch.z, model, anim: this.newAnim(), labelHeight: 2.15,
    };
    this.entities.set(this.myId, ent);
    this.myEnt = ent;
  }

  // Called on reconnect: same session, fresh server-side state.
  rewelcome(w) {
    this.myId = w.you;
    for (const [id, e] of this.entities) {
      if (e.type !== 'npc' && e !== this.myEnt) this.removeEntity(id);
    }
    this.entities.delete(this.myEnt.id);
    this.myEnt.id = w.you;
    this.entities.set(w.you, this.myEnt);
    this.inventory = w.inventory;
    this.player.position.set(w.character.x, this.terrain.heightAt(w.character.x, w.character.z), w.character.z);
    this.myEnt.x = w.character.x; this.myEnt.z = w.character.z;
    this.hud.renderInventory();
  }

  newAnim() { return { attackT: 9, castT: 9, hitT: 9, deathT: 0, speed: 0 }; }

  spawnNpcs() {
    let id = -1;
    for (const n of this.terrain.zone.npcs) {
      const model = buildHumanoid({ cls: null, npcRole: n.role, colors: NPC_COLORS[n.role] });
      model.root.position.set(n.x, this.terrain.heightAt(n.x, n.z), n.z);
      model.root.rotation.y = n.ry;
      this.root.add(model.root);
      this.entities.set(id, {
        id, type: 'npc', name: n.name, npc: n, x: n.x, z: n.z, model, anim: this.newAnim(), labelHeight: 2.2, hp: 1, mh: 1,
      });
      id--;
    }
  }

  // ---- Networking ---------------------------------------------------------
  send(msg) { this.conn.send(msg); }

  handle(msg) {
    switch (msg.t) {
      case 'welcome': return this.rewelcome(msg);
      case 'snap': return this.onSnapshot(msg);
      case 'ev': for (const e of msg.e) this.onEvent(e); return undefined;
      case 'inv':
        this.inventory = msg.items;
        this.refreshMyWeapon();
        this.questUi.refresh();
        return this.hud.renderInventory();
      case 'quests': return this.questUi.update(msg.q);
      case 'self':
        Object.assign(this.me, { stats: msg.stats, gold: msg.gold, level: msg.level, xp: msg.xp, xpn: msg.xpNext });
        return this.hud.renderStats();
      case 'correct':
        this.myEnt.x = msg.x; this.myEnt.z = msg.z;
        this.player.position.set(msg.x, this.terrain.heightAt(msg.x, msg.z), msg.z);
        this.lastSent.x = msg.x; this.lastSent.z = msg.z;
        if (msg.tp) this.moveTarget = null;
        return undefined;
      case 'chat': return this.hud.chatLine(msg.ch, msg.from, msg.text, msg.ch);
      case 'notice': return this.hud.chatLine('system', null, msg.text, 'system');
      case 'error':
        if (msg.code === 'OUT_OF_RANGE' && this.autoAttack) return undefined; // auto-attack closes the gap itself
        this.hud.notice(msg.message, 'error');
        sfx.error();
        return undefined;
      default: return undefined;
    }
  }

  refreshMyWeapon() {
    const w = this.inventory.find((i) => i.container === 'equip' && i.slot === 0)?.defId || null;
    setWeapon(this.myEnt.model, w);
  }

  onSnapshot(s) {
    const seen = new Set();
    for (const p of s.p) {
      seen.add(p.i);
      if (p.i === this.myId) {
        Object.assign(this.myEnt, { hp: p.hp, mh: p.mh, level: p.lv, dead: !!p.d });
        continue;
      }
      let e = this.entities.get(p.i);
      if (!e) {
        if (!p.n) continue; // we'll get the full record next time
        const model = buildHumanoid({ cls: p.c, weaponDef: p.w });
        model.root.position.set(p.x, this.terrain.heightAt(p.x, p.z), p.z);
        this.root.add(model.root);
        e = { id: p.i, type: 'player', name: p.n, cls: p.c, model, anim: this.newAnim(), labelHeight: 2.15, x: p.x, z: p.z, ry: p.r };
        this.entities.set(p.i, e);
      }
      if (p.w !== undefined) setWeapon(e.model, p.w);
      if (p.d && !e.dead) e.anim.deathT = 0;
      Object.assign(e, { tx: p.x, tz: p.z, tr: p.r, hp: p.hp, mh: p.mh, level: p.lv, dead: !!p.d });
    }
    for (const m of s.m) {
      seen.add(m.i);
      let e = this.entities.get(m.i);
      if (!e) {
        const def = MONSTERS[m.df];
        if (!def) continue;
        const model = buildMonster(def);
        model.root.position.set(m.x, this.terrain.heightAt(m.x, m.z), m.z);
        model.root.rotation.y = m.r;
        this.root.add(model.root);
        e = {
          id: m.i, type: 'monster', def, name: def.name, level: def.level, model, anim: this.newAnim(),
          labelHeight: (def.model === 'shard' ? 5.6 : def.model === 'treant' ? 2.7 : 1.7) * (def.scale || 1), x: m.x, z: m.z, ry: m.r,
        };
        this.entities.set(m.i, e);
      }
      if (m.d && !e.dead) { e.anim.deathT = 0; if (this.targetId === e.id) this.clearTarget(); }
      Object.assign(e, { tx: m.x, tz: m.z, tr: m.r, hp: m.hp, mh: m.mh, dead: !!m.d, aggro: !!m.s, statuses: m.st || [] });
    }
    for (const l of s.l) {
      seen.add(l.i);
      let e = this.entities.get(l.i);
      if (!e) {
        const model = buildLoot(l.df, l.ra);
        model.root.position.set(l.x, this.terrain.heightAt(l.x, l.z), l.z);
        this.root.add(model.root);
        const name = l.df === 'gold' ? `${l.q} gold` : `${ITEMS[l.df]?.name || l.df}${l.q > 1 ? ` ×${l.q}` : ''}`;
        e = { id: l.i, type: 'loot', defId: l.df, qty: l.q, name, model, x: l.x, z: l.z, labelHeight: 0.7, color: RARITIES[l.ra]?.color };
        this.entities.set(l.i, e);
      }
      e.mine = !!l.o;
    }
    for (const [id, e] of this.entities) {
      if (e.type === 'npc' || id === this.myId) continue;
      if (!seen.has(id)) this.removeEntity(id);
    }

    const y = s.you;
    const wasDead = this.me.dead;
    const prevLevel = this.me.level;
    Object.assign(this.me, { hp: y.hp, mp: y.mp, mhp: y.mhp, mmp: y.mmp, xp: y.xp, xpn: y.xpn ?? Infinity, level: y.lv, gold: y.g, dead: !!y.d, cd: y.cd, buffs: y.bf });
    if (this.me.dead && !wasDead) this.onDeath();
    if (!this.me.dead && wasDead) this.onRevive();
    if (prevLevel !== y.lv) { this.hud.renderStats(); this.questUi.refresh(); }
    if (y.rg !== this.region) {
      const prev = this.region;
      this.region = y.rg;
      const r = this.terrain.zone.regions.find((x) => x.id === y.rg);
      if (r && prev !== undefined) this.hud.banner(r.name, r.level[1] > 1 ? `Levels ${r.level[0]}–${r.level[1]}` : 'Sanctuary');
    }
  }

  removeEntity(id) {
    const e = this.entities.get(id);
    if (!e) return;
    this.root.remove(e.model.root);
    this.entities.delete(id);
    if (this.targetId === id) this.clearTarget();
  }

  onEvent(e) {
    const src = this.entities.get(e.s), tgt = this.entities.get(e.t);
    switch (e.k) {
      case 'atk': {
        if (src) src.anim.attackT = 0;
        if (src && tgt && e.pr) {
          const from = src.model.root.position.clone().add(new THREE.Vector3(0, 1.5, 0));
          this.fx.projectile(from, () => tgt.model.root.position.clone().add(new THREE.Vector3(0, 0.9 * (tgt.def?.scale || 1), 0)), e.pr);
          sfx.bolt();
        } else if (src && (src === this.myEnt || this.near(src, 25))) sfx.swing();
        if (src === this.myEnt) this.basicReadyAt = performance.now() / 1000 + CLASSES[this.me.cls].basic.cooldown;
        break;
      }
      case 'matk': if (src) src.anim.attackT = 0; break;
      case 'dmg': {
        if (!tgt) break;
        tgt.anim.hitT = 0;
        const pos = tgt.model.root.position;
        const mine = e.s === this.myId, onMe = e.t === this.myId;
        if (mine || onMe || this.near(tgt, 30)) {
          this.hud.floatText(pos, String(e.a), onMe ? 'taken' : e.c ? 'crit' : '');
          this.fx.sparks(pos.clone().setY(pos.y + 1 * (tgt.def?.scale || 1)), onMe ? '#ff9a7a' : e.c ? '#ffe08a' : '#ffd9a0', e.c ? 14 : 7);
        }
        if (mine || onMe) { onMe ? sfx.hurt() : sfx.hit(e.c); }
        if (mine && tgt.type === 'monster' && !this.targetId) this.setTarget(tgt.id);
        break;
      }
      case 'heal':
        if (tgt) this.hud.floatText(tgt.model.root.position, `+${e.a}`, 'heal');
        break;
      case 'cast': {
        const sk = SKILLS[e.sk];
        if (src) { src.anim.castT = 0; if (sk.fx === 'arc' || sk.fx === 'venom' || sk.fx === 'smoke') src.anim.attackT = 0; }
        if (src && sk) {
          if (sk.fx === 'frost' && tgt) {
            this.fx.projectile(src.model.root.position.clone().setY(src.model.root.position.y + 1.5), () => tgt.model.root.position.clone().setY(tgt.model.root.position.y + 1), 'frost');
          } else this.fx.skill(sk.fx, src.model.root, tgt ? tgt.model.root : null);
          if (src === this.myEnt || this.near(src, 25)) sfx.cast(sk.fx);
        }
        break;
      }
      case 'qaccept': case 'qexplore': case 'qdone':
        this.questUi.onEvent(e);
        if (e.k === 'qdone') sfx.levelUp();
        else sfx.pickup();
        break;
      case 'status': break;
      case 'buff': break;
      case 'die':
        if (tgt) {
          tgt.dead = true; tgt.anim.deathT = 0;
          if (tgt.def?.model === 'shard') sfx.shard();
          if (this.targetId === tgt.id) this.clearTarget();
        }
        break;
      case 'despawn': break;
      case 'xp':
        this.hud.floatText(this.player.position, `+${e.a} XP`, 'xp');
        break;
      case 'lvl':
        if (tgt) this.fx.levelUp(tgt.model.root.position);
        if (e.t === this.myId) {
          sfx.levelUp();
          this.hud.banner(`Level ${e.l}`, this.unlockText(e.l));
          this.hud.chatLine('system', null, `You reached level ${e.l}.`, 'loot');
        }
        break;
      case 'loot': {
        const def = ITEMS[e.df];
        const text = e.df === 'gold' ? `You pick up ${e.q} gold.` : `You receive ${def?.name || e.df}${e.q > 1 ? ` ×${e.q}` : ''}.`;
        this.hud.chatLine('system', null, text, 'loot');
        e.df === 'gold' ? sfx.coin() : sfx.pickup();
        break;
      }
      case 'tele':
        this.fx.telegraph(e.x, e.z, e.r, e.d);
        if (src) { src.anim.castT = 0; }
        break;
      case 'slam':
        this.fx.ringPulse(e.x, e.z, e.r * 1.1, '#ffb27a', 0.5, true);
        this.fx.sparks(new THREE.Vector3(e.x, this.terrain.heightAt(e.x, e.z) + 0.2, e.z), '#d8c0a0', 24, 6);
        if (src) src.anim.attackT = 0;
        if (this.player.position.distanceTo(new THREE.Vector3(e.x, this.player.position.y, e.z)) < 30) sfx.boom();
        break;
      case 'summon':
        if (src) this.fx.ringPulse(src.model.root.position.x, src.model.root.position.z, 6, '#8fd6e8', 0.9);
        this.hud.notice('The Veilshard calls for defenders!');
        break;
      case 'pdie':
        if (tgt) { tgt.dead = true; tgt.anim.deathT = 0; }
        if (e.t === this.myId) this.deathInfo = e;
        break;
      case 'revive':
        if (tgt) { tgt.dead = false; this.fx.pillar(tgt.model.root.position, '#ffd9a0', 1, 0.5); }
        break;
      default: break;
    }
  }

  unlockText(level) {
    const sk = CLASSES[this.me.cls].skills.map((s) => SKILLS[s]).find((s) => s.unlockLevel === level);
    return sk ? `New skill: ${sk.name}` : 'You feel stronger.';
  }

  near(ent, r) { return ent.model.root.position.distanceTo(this.player.position) < r; }

  onDeath() {
    sfx.death();
    this.autoAttack = false;
    this.moveTarget = null;
    const d = document.getElementById('death');
    d.hidden = false;
    const info = this.deathInfo;
    document.getElementById('death-text').textContent = info?.by
      ? `Struck down by ${info.by}.${info.xl ? ` You lost ${info.xl} experience.` : ''}`
      : 'Your strength gave out.';
    const btn = document.getElementById('revive');
    btn.disabled = true;
    setTimeout(() => { btn.disabled = false; btn.focus(); }, 3000);
  }

  onRevive() {
    document.getElementById('death').hidden = true;
    this.myEnt.anim.deathT = 0;
  }

  // ---- Targeting & actions -----------------------------------------------------
  setTarget(id) {
    this.targetId = id;
    const e = this.entities.get(id);
    if (!this.ring) {
      this.ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.9, 40), new THREE.MeshBasicMaterial({ color: '#e0644a', transparent: true, opacity: 0.85, depthWrite: false }));
      this.ring.rotation.x = -Math.PI / 2;
      this.scene.add(this.ring);
    }
    this.ring.visible = !!e;
    if (e) {
      this.ring.material.color.set(e.type === 'monster' ? (e.def.elite ? '#e9c46a' : '#e0644a') : e.type === 'npc' ? '#f2d48c' : '#7fb6ff');
      const r = e.type === 'monster' ? (e.def.radius || 0.8) * 1.3 : 0.8;
      this.ring.scale.setScalar(r);
    }
  }

  clearTarget() {
    this.targetId = null;
    this.autoAttack = false;
    if (this.ring) this.ring.visible = false;
  }

  target() { return this.entities.get(this.targetId); }

  triggerAction(action) {
    if (this.me.dead) return;
    initAudio();
    this.hud.flashSlot(action);
    const cls = CLASSES[this.me.cls];
    if (action === 'attack') {
      let t = this.target();
      if (!t || t.type !== 'monster' || t.dead) {
        t = this.nearestMonster(20);
        if (t) this.setTarget(t.id);
      }
      if (t && t.type === 'monster') this.autoAttack = true;
      return;
    }
    if (action === 'slot1' || action === 'slot2') {
      const skillId = cls.skills[action === 'slot1' ? 0 : 1];
      const sk = SKILLS[skillId];
      if (this.me.level < sk.unlockLevel) return this.hud.notice(`${sk.name} unlocks at level ${sk.unlockLevel}.`, 'error');
      if ((this.me.cd?.[skillId] || 0) > 0.1) return this.hud.notice(`${sk.name} is not ready.`, 'error');
      if (this.me.mp < sk.mana) return this.hud.notice('Not enough mana.', 'error');
      let t = this.target();
      const healsAlly = sk.effects.some((x) => x.type === 'heal');
      if (healsAlly) {
        this.send({ t: 'skill', skill: skillId, target: t && t.type === 'player' ? t.id : this.myId });
        return;
      }
      if (sk.needsTarget && (!t || t.type !== 'monster' || t.dead)) {
        t = this.nearestMonster(sk.range + 4);
        if (!t) return this.hud.notice('You need a target.', 'error');
        this.setTarget(t.id);
      }
      if (t && t.type === 'monster') {
        this.faceTowards(t);
        this.autoAttack = true;
      }
      this.send({ t: 'skill', skill: skillId, target: t && t.type === 'monster' ? t.id : null });
      return;
    }
    if (action === 'slot3' || action === 'slot4') {
      const item = action === 'slot3' ? 'hp_draught' : 'mp_draught';
      const stack = this.inventory.find((i) => i.container === 'bag' && i.defId === item);
      if (!stack) return this.hud.notice(`No ${ITEMS[item].name} left.`, 'error');
      const group = ITEMS[item].use.group;
      const now = performance.now() / 1000;
      if ((this.potionReadyAt[group] || 0) > now) return;
      this.potionReadyAt[group] = now + ITEMS[item].use.cooldown;
      this.send({ t: 'use', slot: stack.slot });
    }
  }

  faceTowards(e) {
    this.player.rotation.y = Math.atan2(e.model.root.position.x - this.player.position.x, e.model.root.position.z - this.player.position.z);
  }

  nearestMonster(range, skip = null) {
    let best = null, bd = range;
    for (const e of this.entities.values()) {
      if (e.type !== 'monster' || e.dead || e === skip) continue;
      const d = e.model.root.position.distanceTo(this.player.position);
      if (d < bd) { best = e; bd = d; }
    }
    return best;
  }

  cycleTarget() {
    const list = [...this.entities.values()]
      .filter((e) => e.type === 'monster' && !e.dead && e.model.root.position.distanceTo(this.player.position) < 30)
      .sort((a, b) => a.model.root.position.distanceTo(this.player.position) - b.model.root.position.distanceTo(this.player.position));
    if (!list.length) return;
    const i = list.findIndex((e) => e.id === this.targetId);
    this.setTarget(list[(i + 1) % list.length].id);
    this.autoAttack = false;
  }

  pickupNearest() {
    let best = null, bd = 8;
    for (const e of this.entities.values()) {
      if (e.type !== 'loot' || !e.mine) continue;
      const d = e.model.root.position.distanceTo(this.player.position);
      if (d < bd) { best = e; bd = d; }
    }
    if (!best) return;
    this.requestPickup(best);
  }

  requestPickup(e) {
    if (e.model.root.position.distanceTo(this.player.position) <= 3) this.send({ t: 'pickup', id: e.id });
    else { this.pendingPickup = e.id; this.moveTarget = { x: e.x, z: e.z, stop: 1.5 }; }
  }

  interact(e, attack) {
    if (!e) return;
    if (e.type === 'loot') return this.requestPickup(e);
    this.setTarget(e.id);
    if (e.type === 'monster' && attack) this.autoAttack = true;
    if (e.type === 'npc') {
      const d = e.model.root.position.distanceTo(this.player.position);
      if (d > 5) { this.moveTarget = { x: e.x, z: e.z, stop: 2.5, npc: e.id }; return; }
      this.talkTo(e);
    }
  }

  talkTo(e) {
    this.questUi.openNpc(e.npc.id);
  }

  // ---- Input -----------------------------------------------------------------------
  bindInput() {
    const canvas = this.renderer.domElement;
    this.listeners = [];
    const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); this.listeners.push([target, type, fn, opts]); };
    const typing = () => { const a = document.activeElement; return a && (a.tagName === 'INPUT' || a.tagName === 'SELECT' || a.tagName === 'TEXTAREA'); };

    on(window, 'keydown', (e) => {
      if (this.hud.listening) { e.preventDefault(); this.hud.listening(e.code); return; }
      if (typing()) return;
      initAudio();
      if (e.code === 'Enter') { e.preventDefault(); this.hud.focusChat(); return; }
      if (e.code === 'Escape') {
        if (!this.hud.closeTopWindow()) this.hud.toggleWindow('win-settings');
        return;
      }
      const action = actionForCode(e.code);
      if (!action) return;
      if (action === 'nextTarget' || action === 'attack') e.preventDefault();
      if (['forward', 'back', 'left', 'right'].includes(action)) { this.keys.add(action); this.moveTarget = null; this.pendingPickup = null; return; }
      if (e.repeat) return;
      if (action === 'inventory') return this.hud.toggleWindow('win-inventory');
      if (action === 'character') return this.hud.toggleWindow('win-character');
      if (action === 'journal') { this.hud.toggleWindow('win-quests'); return this.questUi.renderJournal(); }
      if (action === 'nextTarget') return this.cycleTarget();
      if (action === 'pickup') return this.pickupNearest();
      this.triggerAction(action);
    });
    on(window, 'keyup', (e) => {
      const action = actionForCode(e.code);
      if (action) this.keys.delete(action);
    });
    on(window, 'blur', () => this.keys.clear());

    let drag = null;
    on(canvas, 'pointerdown', (e) => {
      initAudio();
      canvas.focus();
      drag = { x: e.clientX, y: e.clientY, button: e.button, moved: 0 };
      canvas.setPointerCapture(e.pointerId);
    });
    on(canvas, 'pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      drag.x = e.clientX; drag.y = e.clientY;
      if (drag.moved > 4) {
        this.cameraYaw -= dx * 0.006;
        this.cameraPitch = Math.max(0.05, Math.min(1.25, this.cameraPitch + dy * 0.005));
      }
    });
    on(canvas, 'pointerup', (e) => {
      if (drag && drag.moved <= 4) this.click(e, drag.button);
      drag = null;
    });
    on(canvas, 'contextmenu', (e) => e.preventDefault());
    on(canvas, 'wheel', (e) => {
      e.preventDefault();
      this.camDist = Math.max(3.5, Math.min(22, this.camDist * (1 + Math.sign(e.deltaY) * 0.1)));
    }, { passive: false });
  }

  click(e, button) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const roots = [];
    for (const ent of this.entities.values()) if (ent.id !== this.myId && !(ent.dead && ent.type !== 'player')) roots.push(ent.model.root);
    const hits = this.raycaster.intersectObjects(roots, true);
    if (hits.length) {
      let o = hits[0].object;
      while (o.parent && !roots.includes(o)) o = o.parent;
      const ent = [...this.entities.values()].find((x) => x.model.root === o);
      this.interact(ent, button === 2);
      return;
    }
    if (button === 0) this.clearTarget();
  }

  unbindInput() {
    for (const [t, type, fn, opts] of this.listeners) t.removeEventListener(type, fn, opts);
  }

  // ---- Frame update -------------------------------------------------------------------
  update(dt, time) {
    this.dayPhase = ((performance.now() / 1000 - this.dayStart) / this.dayLength) % 1;
    const me = this.myEnt;
    const pos = this.player.position;

    // Local movement prediction.
    let mx = 0, mz = 0;
    if (!this.me.dead) {
      const f = (this.keys.has('forward') ? 1 : 0) - (this.keys.has('back') ? 1 : 0);
      const r = (this.keys.has('right') ? 1 : 0) - (this.keys.has('left') ? 1 : 0);
      if (f || r) {
        const fx = -Math.sin(this.cameraYaw), fz = -Math.cos(this.cameraYaw);
        mx = fx * f - fz * r;
        mz = fz * f + fx * r;
        this.autoAttack = false; // manual movement cancels auto-attack
      } else {
        const t = this.target();
        let goal = null;
        if (this.autoAttack && t && t.type === 'monster' && !t.dead) {
          const range = CLASSES[this.me.cls].basic.range + (t.def.radius || 0.7) * 0.6;
          const d = t.model.root.position.distanceTo(pos);
          if (d > range) goal = { x: t.model.root.position.x, z: t.model.root.position.z, stop: range * 0.85 };
          else {
            this.faceTowards(t);
            const now = performance.now() / 1000;
            if (now >= this.basicReadyAt - 0.02 && now - (this.lastAttackSend || 0) > 0.2) {
              this.lastAttackSend = now;
              this.send({ t: 'attack', target: t.id });
            }
          }
        } else if (this.moveTarget) goal = this.moveTarget;
        if (goal) {
          const dx = goal.x - pos.x, dz = goal.z - pos.z, d = Math.hypot(dx, dz);
          if (d > (goal.stop || 0.5)) { mx = dx / d; mz = dz / d; }
          else if (goal === this.moveTarget) {
            this.moveTarget = null;
            if (goal.npc) { const n = this.entities.get(goal.npc); if (n) this.talkTo(n); }
            if (this.pendingPickup) { this.send({ t: 'pickup', id: this.pendingPickup }); this.pendingPickup = null; }
          }
        }
      }
    }
    let speed = 0;
    if (mx || mz) {
      const len = Math.hypot(mx, mz);
      const total = PROGRESSION.moveSpeed * dt;
      // Sub-step so a slow frame can't carry the player through a fence post.
      const steps = Math.max(1, Math.ceil(total / 0.3));
      const sx = pos.x, sz = pos.z;
      for (let i = 0; i < steps; i++) {
        const nx = pos.x + (mx / len) * (total / steps), nz = pos.z + (mz / len) * (total / steps);
        const res = this.terrain.resolveCollision(nx, nz, PLAYER_RADIUS);
        if (!this.terrain.isWalkable(res.x, res.z)) break;
        pos.x = res.x; pos.z = res.z;
      }
      speed = Math.hypot(pos.x - sx, pos.z - sz) / dt;
      this.player.rotation.y = angleLerp(this.player.rotation.y, Math.atan2(mx, mz), damp(14, dt));
    }
    pos.y = this.terrain.heightAt(pos.x, pos.z);
    me.x = pos.x; me.z = pos.z;
    me.anim.speed = speed;

    this.moveTimer += dt;
    if (this.moveTimer >= MOVE_SEND_INTERVAL) {
      this.moveTimer = 0;
      const ry = this.player.rotation.y;
      if (Math.hypot(pos.x - this.lastSent.x, pos.z - this.lastSent.z) > 0.01 || Math.abs(ry - this.lastSent.ry) > 0.02) {
        this.send({ t: 'move', x: Math.round(pos.x * 100) / 100, z: Math.round(pos.z * 100) / 100, ry: Math.round(ry * 100) / 100 });
        this.lastSent = { x: pos.x, z: pos.z, ry };
      }
    }

    // Remote entities: smooth toward the latest snapshot.
    for (const e of this.entities.values()) {
      const a = e.anim;
      if (a) { a.attackT += dt; a.castT += dt; a.hitT += dt; if (e.dead) a.deathT += dt; }
      if (e === me || e.type === 'npc' || e.type === 'loot') {
        if (e.model && a) animate(e.model, { ...a, dead: e === me ? this.me.dead : false }, dt, time);
        else if (e.type === 'loot') animate(e.model, {}, dt, time);
        continue;
      }
      const root = e.model.root;
      if (e.tx !== undefined) {
        const k = damp(10, dt);
        const ox = root.position.x, oz = root.position.z;
        if (Math.hypot(e.tx - ox, e.tz - oz) > 12) root.position.set(e.tx, 0, e.tz);
        else { root.position.x += (e.tx - ox) * k; root.position.z += (e.tz - oz) * k; }
        a.speed = a.speed * 0.8 + (Math.hypot(root.position.x - ox, root.position.z - oz) / dt) * 0.2;
        root.rotation.y = angleLerp(root.rotation.y, e.tr, damp(10, dt));
        e.x = root.position.x; e.z = root.position.z;
      }
      root.position.y = this.terrain.heightAt(root.position.x, root.position.z);
      animate(e.model, { ...a, dead: e.dead }, dt, time);
    }

    const t = this.target();
    if (this.ring && t) {
      this.ring.position.set(t.model.root.position.x, this.terrain.heightAt(t.model.root.position.x, t.model.root.position.z) + 0.07, t.model.root.position.z);
      this.ring.rotation.z += dt * 0.6;
    }

    // Camera: orbit behind the player, never below the ground.
    const head = new THREE.Vector3(pos.x, pos.y + 1.6, pos.z);
    const cp = Math.cos(this.cameraPitch), sp = Math.sin(this.cameraPitch);
    const cam = new THREE.Vector3(head.x + Math.sin(this.cameraYaw) * cp * this.camDist, head.y + sp * this.camDist, head.z + Math.cos(this.cameraYaw) * cp * this.camDist);
    const ground = this.terrain.heightAt(cam.x, cam.z) + 0.6;
    if (cam.y < ground) cam.y = ground;
    this.keepCameraOutOfBuildings(head, cam);
    this.camera.position.lerp(cam, damp(18, dt));
    this.camera.lookAt(head);

    this.fx.update(dt);
    setAmbientNight(this.app.world.night);
    this.hud.update(dt);
  }

  // March from the head toward the desired camera spot and stop short of the
  // first building volume, so walls and roofs never fill the screen.
  keepCameraOutOfBuildings(head, cam) {
    const town = this.terrain.zone.town;
    if (Math.hypot(head.x - town.x, head.z - town.z) > town.palisadeRadius + 25) return;
    const dir = cam.clone().sub(head);
    const len = dir.length();
    dir.divideScalar(len);
    const p = new THREE.Vector3();
    for (let t = 0.5; t <= len; t += 0.25) {
      p.copy(head).addScaledVector(dir, t);
      for (const b of town.buildings) {
        const roof = b.h + Math.min(b.w, b.d) * 0.45 + 1.2;
        if (Math.abs(p.x - (town.x + b.x)) < b.w / 2 + 0.8 && Math.abs(p.z - (town.z + b.z)) < b.d / 2 + 0.8 && p.y < town.height + roof) {
          cam.copy(head).addScaledVector(dir, Math.max(1.2, t - 0.5));
          return;
        }
      }
    }
  }

  leave(where) { this.app.leaveGame(where); }

  applyQuality() { this.app.applyQuality(); }

  destroy() {
    this.unbindInput();
    this.hud.destroy();
    this.scene.remove(this.root);
    if (this.ring) this.scene.remove(this.ring);
    for (const it of this.fx.items) this.scene.remove(it.obj);
    for (const id of ['win-inventory', 'win-character', 'win-settings', 'win-dialog', 'death', 'reconnect']) document.getElementById(id).hidden = true;
  }
}
