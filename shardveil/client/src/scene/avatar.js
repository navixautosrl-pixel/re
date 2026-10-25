// Avatar: a skinned character assembled from GLB assets.
//   base body (skeleton + animations)  + outfit layers (skinned, rebound to the
//   base skeleton by bone name)        + weapons on sockets.
// Animation is an AnimationMixer state machine: locomotion blended by speed on
// the lower body, upper-body one-shots (attack, cast, hit) layered on top, and
// a full-body death. Works unchanged with artist GLBs that use the same bone
// and clip names.
import * as THREE from 'three';
import { assets } from '../assets/library.js';
import { SOCKETS, UPPER_BODY } from '../gen/skeleton.js';
import { ITEMS } from '/shared/data/items.js';

const WALK_SPEED = 1.5;  // metres/second the Walk clip was authored for
const RUN_SPEED = 5.6;   // ... and the Run clip
const FADE = 0.12;

// How each weapon type sits in the right-hand socket (grip at origin, +Y along blade).
// The ready pose bends the forearm ~0.75 rad forward, so grips compensate:
// staves stand upright, blades point forward and a little up.
const GRIP = {
  staff: { pos: [0, -0.07, 0.02], rot: [0.72, 0, 0] },
  rod: { pos: [0, -0.07, 0.02], rot: [0.72, 0, 0] },
  sword: { pos: [0, -0.07, 0.03], rot: [1.95, 0, 0] },
  daggers: { pos: [0, -0.07, 0.03], rot: [1.9, 0, 0] },
};

function splitClip(clip, upper) {
  const tracks = clip.tracks.filter((t) => UPPER_BODY.has(t.name.split('.')[0]) === upper);
  return new THREE.AnimationClip(`${clip.name}_${upper ? 'upper' : 'lower'}`, clip.duration, tracks);
}

export class Avatar {
  constructor({ outfit, weapon = null, scale = 1 }) {
    this.isAvatar = true;
    this.root = new THREE.Group();
    this.root.scale.setScalar(scale);
    const base = assets.cloneLoaded('characters', 'humanoid_base');
    if (!base) throw new Error('Character assets not loaded');
    this.body = base.scene;
    this.root.add(this.body);
    this.bones = {};
    this.body.traverse((o) => { if (o.isBone) this.bones[o.name] = o; });
    this.skinned = [];
    this.body.traverse((o) => { if (o.isSkinnedMesh) this.skinned.push(o); });
    this.skeleton = this.skinned[0].skeleton;

    this.sockets = {};
    for (const [name, [bone, pos, rot]] of Object.entries(SOCKETS)) {
      const s = new THREE.Group();
      s.name = `socket_${name}`;
      s.position.set(...pos);
      s.rotation.set(...rot);
      this.bones[bone].add(s);
      this.sockets[name] = s;
    }

    this.outfitMeshes = [];
    this.setOutfit(outfit);
    this.weaponDef = undefined;
    this.setWeapon(weapon);
    this.buildAnimation(base.animations);
  }

  // ---- Equipment layers ----------------------------------------------------
  setOutfit(key) {
    if (this.outfitKey === key) return;
    for (const m of this.outfitMeshes) m.parent?.remove(m);
    this.outfitMeshes = [];
    this.outfitKey = key;
    const o = assets.cloneLoaded('outfits', key);
    if (!o) return;
    const meshes = [];
    o.scene.traverse((m) => { if (m.isSkinnedMesh) meshes.push(m); });
    for (const m of meshes) {
      // Rebind to our skeleton by bone name: outfits never carry their own rig.
      const bones = m.skeleton.bones.map((b) => this.bones[b.name]);
      const skel = new THREE.Skeleton(bones, m.skeleton.boneInverses);
      m.removeFromParent();
      this.body.add(m);
      m.bind(skel, m.bindMatrix);
      this.outfitMeshes.push(m);
    }
  }

  setWeapon(defId) {
    if (this.weaponDef === defId) return;
    this.weaponDef = defId;
    this.sockets.hand_r.clear();
    this.sockets.hand_l.clear();
    this.weaponType = ITEMS[defId]?.icon || null;
    if (!defId) return;
    const attach = (socket) => {
      const w = assets.cloneLoaded('weapons', defId);
      if (!w) return;
      const g = GRIP[this.weaponType] || GRIP.sword;
      w.scene.position.set(...g.pos);
      w.scene.rotation.set(...g.rot);
      socket.add(w.scene);
      this.gem = w.scene.getObjectByName('gem') || this.gem;
    };
    attach(this.sockets.hand_r);
    if (this.weaponType === 'daggers') attach(this.sockets.hand_l);
  }

  // ---- Animation state machine ---------------------------------------------
  buildAnimation(clips) {
    this.mixer = new THREE.AnimationMixer(this.body);
    const byName = Object.fromEntries(clips.map((c) => [c.name, c]));
    const act = (clip, { once = false } = {}) => {
      const a = this.mixer.clipAction(clip);
      if (once) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
      a.enabled = true;
      a.setEffectiveWeight(0);
      a.play();
      return a;
    };
    this.loco = {};
    for (const n of ['Idle', 'Walk', 'Run']) {
      this.loco[n] = { lower: act(splitClip(byName[n], false)), upper: act(splitClip(byName[n], true)) };
    }
    this.oneShots = {};
    for (const n of ['Attack', 'AttackStaff', 'Cast', 'Hit']) this.oneShots[n] = act(splitClip(byName[n], true), { once: true });
    this.death = act(byName.Death, { once: true });
    this.current = null;   // active one-shot action
    this.oneShotWeight = 0;
    this.deathWeight = 0;
    this.last = { attackT: 99, castT: 99, hitT: 99 };
    this.wasDead = false;
  }

  play(name) {
    const a = this.oneShots[name];
    if (!a) return;
    if (this.current && this.current !== a) this.current.setEffectiveWeight(0);
    a.reset();
    a.play();
    this.current = a;
    this.currentEnd = a.getClip().duration;
  }

  // st: { speed, attackT, castT, hitT, dead } from the game layer.
  update(st, dt) {
    if (st.attackT < this.last.attackT) this.play(this.weaponType === 'staff' || this.weaponType === 'rod' ? 'AttackStaff' : 'Attack');
    if (st.castT < this.last.castT) this.play('Cast');
    if (st.hitT < this.last.hitT && (!this.current || this.current === this.oneShots.Hit || this.current.time > this.currentEnd * 0.8)) this.play('Hit');
    this.last = { attackT: st.attackT, castT: st.castT, hitT: st.hitT };
    if (st.dead && !this.wasDead) { this.death.reset(); this.death.play(); }
    this.wasDead = !!st.dead;

    // Locomotion blend weights from ground speed.
    const v = st.speed || 0;
    let wIdle = 0, wWalk = 0, wRun = 0;
    if (v < 0.15) wIdle = 1;
    else if (v < WALK_SPEED) { const t = v / WALK_SPEED; wIdle = 1 - t; wWalk = t; }
    else if (v < RUN_SPEED) { const t = (v - WALK_SPEED) / (RUN_SPEED - WALK_SPEED); wWalk = 1 - t; wRun = t; }
    else wRun = 1;
    this.loco.Walk.lower.timeScale = this.loco.Walk.upper.timeScale = Math.max(0.6, v / WALK_SPEED);
    this.loco.Run.lower.timeScale = this.loco.Run.upper.timeScale = Math.max(0.7, v / RUN_SPEED);
    // Keep walk and run phase-locked so blending never scissors the legs.
    if (wWalk && wRun) this.loco.Run.lower.time = (this.loco.Walk.lower.time / this.loco.Walk.lower.getClip().duration) * this.loco.Run.lower.getClip().duration;

    const active = this.current && this.current.isRunning() && this.current.time < this.currentEnd - 0.02;
    this.oneShotWeight += ((active ? 1 : 0) - this.oneShotWeight) * Math.min(1, dt / FADE);
    if (!active && this.oneShotWeight < 0.01) this.current = null;
    this.deathWeight += ((st.dead ? 1 : 0) - this.deathWeight) * Math.min(1, dt / 0.15);

    const alive = 1 - this.deathWeight;
    for (const [n, w] of [['Idle', wIdle], ['Walk', wWalk], ['Run', wRun]]) {
      this.loco[n].lower.setEffectiveWeight(w * alive);
      this.loco[n].upper.setEffectiveWeight(w * alive * (1 - this.oneShotWeight));
    }
    for (const a of Object.values(this.oneShots)) a.setEffectiveWeight(a === this.current ? this.oneShotWeight * alive : 0);
    this.death.setEffectiveWeight(this.deathWeight);
    this.mixer.update(dt);
    if (this.gem) this.gem.rotation.y += dt * 1.5;
  }
}

// Outfit for a class or NPC role.
export function outfitFor(cls, npcRole) {
  if (npcRole) return { quest: 'npc_warden', merchant: 'npc_merchant', smith: 'npc_smith', storage: 'npc_keeper' }[npcRole] || 'npc_merchant';
  return cls;
}

export function avatarAssetList() {
  const m = assets.manifest;
  return [
    ['characters', 'humanoid_base'],
    ...Object.keys(m.outfits).map((k) => ['outfits', k]),
    ...Object.keys(m.weapons).map((k) => ['weapons', k]),
  ];
}
