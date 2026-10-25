// Procedural models for characters, monsters, NPCs and ground loot, with
// procedural animation (walk, attack, cast, hit, death). Built from primitives
// so the project ships no third-party art; silhouettes are kept distinct per
// class and species so they read at a distance.
import * as THREE from 'three';
import { CLASSES } from '/shared/data/classes.js';
import { ITEMS, RARITIES } from '/shared/data/items.js';

const matCache = new Map();
function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.75, flatShading: true, ...opts }));
  return matCache.get(key);
}
function mesh(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}
const capsule = (r, len, seg = 6) => new THREE.CapsuleGeometry(r, len, 3, seg);

// ---------------------------------------------------------------------------
// Weapons
// ---------------------------------------------------------------------------
const TIER_COLORS = [
  { metal: '#9aa0a8', accent: '#6b4a2e' },  // tier 1: iron & wood
  { metal: '#c2c7cf', accent: '#a8824f' },  // tier 2: steel & bronze
  { metal: '#d6eef5', accent: '#8fd6e8' },  // tier 3: shard-tempered
];
function weaponTier(defId) {
  const lvl = ITEMS[defId]?.levelReq || 1;
  return lvl >= 7 ? 2 : lvl >= 4 ? 1 : 0;
}

export function buildWeapon(defId) {
  const g = new THREE.Group();
  const def = ITEMS[defId];
  if (!def) return g;
  const t = TIER_COLORS[weaponTier(defId)];
  const glow = weaponTier(defId) === 2 ? { emissive: '#3d9ab8', emissiveIntensity: 0.8 } : {};
  switch (def.icon) {
    case 'sword': {
      g.add(mesh(new THREE.BoxGeometry(0.07, 0.95, 0.025), mat(t.metal, { metalness: 0.6, roughness: 0.35, ...glow }), 0, -0.62, 0));
      g.add(mesh(new THREE.BoxGeometry(0.3, 0.05, 0.07), mat(t.accent, { metalness: 0.4 }), 0, -0.12, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 5), mat('#3b2a1c'), 0, 0.0, 0));
      break;
    }
    case 'daggers': {
      g.add(mesh(new THREE.ConeGeometry(0.035, 0.5, 4), mat(t.metal, { metalness: 0.6, roughness: 0.3, ...glow }), 0, -0.36, 0));
      g.children[0].rotation.x = Math.PI;
      g.add(mesh(new THREE.BoxGeometry(0.14, 0.035, 0.05), mat(t.accent), 0, -0.1, 0));
      break;
    }
    case 'staff': {
      const s = mesh(new THREE.CylinderGeometry(0.028, 0.035, 1.75, 6), mat(t.accent === '#6b4a2e' ? '#5a4330' : '#4a3a5a'), 0, -0.25, 0);
      g.add(s);
      const gem = mesh(new THREE.OctahedronGeometry(0.11, 0), mat('#8fd6e8', { emissive: '#4fb4d8', emissiveIntensity: 1.4, roughness: 0.2 }), 0, 0.7, 0);
      gem.name = 'gem';
      g.add(gem);
      break;
    }
    case 'rod': {
      g.add(mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.85, 6), mat('#6a5536'), 0, -0.25, 0));
      g.add(mesh(new THREE.ConeGeometry(0.1, 0.16, 8, 1, true), mat(t.metal, { metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide, ...glow }), 0, 0.22, 0));
      g.add(mesh(new THREE.SphereGeometry(0.06, 6, 4), mat('#b9e6a0', { emissive: '#6fbf5a', emissiveIntensity: 0.9 }), 0, 0.14, 0));
      break;
    }
  }
  return g;
}

// ---------------------------------------------------------------------------
// Humanoids (player classes and NPCs)
// ---------------------------------------------------------------------------
export function buildHumanoid({ cls, colors, npcRole, weaponDef }) {
  const root = new THREE.Group();
  const body = new THREE.Group(); // everything that bobs and leans
  root.add(body);
  const c = colors || CLASSES[cls]?.colors || { primary: '#6b6e73', secondary: '#9b8a6a', cloth: '#4a3a2a' };
  const skin = mat('#d6b18c');
  const primary = mat(c.primary, { metalness: cls === 'vanguard' ? 0.45 : 0.05, roughness: cls === 'vanguard' ? 0.45 : 0.8 });
  const secondary = mat(c.secondary, { metalness: 0.3 });
  const cloth = mat(c.cloth);
  const boots = mat('#3b2b1f');

  const legs = [];
  for (const side of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.13, 0.98, 0);
    hip.add(mesh(capsule(0.085, 0.62), cloth, 0, -0.42, 0));
    hip.add(mesh(new THREE.BoxGeometry(0.17, 0.16, 0.27), boots, 0, -0.9, 0.04));
    body.add(hip);
    legs.push(hip);
  }
  const torso = new THREE.Group();
  torso.position.y = 1.02;
  body.add(torso);
  torso.add(mesh(capsule(0.21, 0.42), primary, 0, 0.36, 0));
  torso.children[0].scale.set(1, 1, 0.72);
  torso.add(mesh(new THREE.CylinderGeometry(0.23, 0.2, 0.1, 8), secondary, 0, 0.05, 0)); // belt

  const head = new THREE.Group();
  head.position.y = 0.8;
  torso.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.155, 10, 8), skin, 0, 0, 0));
  head.add(mesh(new THREE.BoxGeometry(0.2, 0.03, 0.02), mat('#20160f'), 0, 0.02, 0.145)); // brow line reads as eyes at range

  const arms = [];
  for (const side of [-1, 1]) {
    const sh = new THREE.Group();
    sh.position.set(side * 0.3, 0.58, 0);
    sh.add(mesh(capsule(0.068, 0.44), cls === 'vanguard' ? primary : cloth, 0, -0.27, 0));
    sh.add(mesh(new THREE.SphereGeometry(0.07, 6, 5), skin, 0, -0.58, 0));
    torso.add(sh);
    arms.push(sh);
  }

  // Class / role silhouettes.
  if (cls === 'vanguard') {
    for (const side of [-1, 1]) torso.add(mesh(new THREE.SphereGeometry(0.15, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), secondary, side * 0.3, 0.62, 0));
    head.add(mesh(new THREE.SphereGeometry(0.17, 10, 6, 0, Math.PI * 2, 0, Math.PI / 1.8), primary, 0, 0.02, 0));
    const shield = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 12), secondary, 0, 0.4, -0.22);
    shield.rotation.x = Math.PI / 2;
    torso.add(shield);
    torso.add(mesh(new THREE.BoxGeometry(0.5, 0.55, 0.04), cloth, 0, 0.1, 0.18)); // tabard
  } else if (cls === 'shadeblade') {
    const hood = mesh(new THREE.ConeGeometry(0.22, 0.42, 8), cloth, 0, 0.12, -0.03);
    head.add(hood);
    torso.add(mesh(new THREE.TorusGeometry(0.17, 0.05, 5, 10), secondary, 0, 0.66, 0)); // scarf
    torso.children.at(-1).rotation.x = Math.PI / 2;
  } else if (cls === 'arcanist' || cls === 'wardweaver' || npcRole === 'storage' || npcRole === 'quest') {
    const skirt = mesh(new THREE.CylinderGeometry(0.22, 0.4, 0.95, 10, 1, true), cloth, 0, 0.52, 0);
    skirt.material = mat(c.cloth, { side: THREE.DoubleSide });
    body.add(skirt);
    if (cls === 'arcanist') {
      head.add(mesh(new THREE.ConeGeometry(0.2, 0.5, 8), primary, 0, 0.28, 0));
      head.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 12), primary, 0, 0.08, 0));
    }
    if (cls === 'wardweaver') {
      const crown = new THREE.Group();
      crown.position.y = 0.12;
      for (let i = 0; i < 5; i++) {
        const twig = mesh(new THREE.ConeGeometry(0.02, 0.22, 4), mat('#8a6f48'), Math.cos(i * 1.25) * 0.13, 0.08, Math.sin(i * 1.25) * 0.13);
        twig.rotation.z = Math.cos(i * 1.25) * -0.4;
        twig.rotation.x = Math.sin(i * 1.25) * 0.4;
        crown.add(twig);
      }
      head.add(crown);
    }
  }
  if (npcRole === 'merchant') {
    torso.add(mesh(new THREE.BoxGeometry(0.42, 0.6, 0.04), mat('#c9b48a'), 0, 0.1, 0.17)); // apron
    head.add(mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 10), mat('#5a4330'), 0, 0.1, 0));
    head.add(mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.14, 10), mat('#5a4330'), 0, 0.17, 0));
  }
  if (npcRole === 'quest') {
    const cape = mesh(new THREE.PlaneGeometry(0.6, 1.1), mat('#6e2a22', { side: THREE.DoubleSide }), 0, -0.05, -0.2);
    torso.add(cape);
  }

  const hand = new THREE.Group();
  hand.position.set(0, -0.58, 0.04);
  hand.rotation.x = -Math.PI / 2 + 0.25;
  arms[1].add(hand);
  const offHand = new THREE.Group();
  offHand.position.set(0, -0.58, 0.04);
  offHand.rotation.x = -Math.PI / 2 + 0.25;
  arms[0].add(offHand);

  const model = { root, body, torso, head, legs, arms, hand, offHand, kind: 'humanoid', cls, weaponDef: null, phase: 0 };
  setWeapon(model, weaponDef);
  return model;
}

export function setWeapon(model, defId) {
  if (model.weaponDef === defId) return;
  model.weaponDef = defId;
  model.hand.clear();
  model.offHand.clear();
  if (!defId) return;
  const icon = ITEMS[defId]?.icon;
  // Blades point forward from the fist; staves and rods are held upright.
  const upright = icon === 'staff' || icon === 'rod';
  model.hand.rotation.x = upright ? 0.15 : -Math.PI / 2 - 0.35;
  model.hand.add(buildWeapon(defId));
  if (icon === 'daggers') model.offHand.add(buildWeapon(defId));
}

// ---------------------------------------------------------------------------
// Monsters
// ---------------------------------------------------------------------------
export function buildMonster(def) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const base = mat(def.color);
  const dark = mat(new THREE.Color(def.color).multiplyScalar(0.6).getStyle());
  const eye = mat('#ffd27a', { emissive: def.glow || '#ff8a3a', emissiveIntensity: 2.0 });
  const legs = [];
  let head = null, extra = {};

  if (def.model === 'wolf') {
    const torso = mesh(capsule(0.28, 0.75, 7), base, 0, 0.72, 0);
    torso.rotation.x = Math.PI / 2;
    torso.scale.set(1, 1, 0.95);
    body.add(torso);
    body.add(mesh(new THREE.SphereGeometry(0.3, 7, 5), dark, 0, 0.82, 0.32)); // shoulders / ruff
    head = new THREE.Group();
    head.position.set(0, 0.95, 0.62);
    head.add(mesh(new THREE.BoxGeometry(0.3, 0.27, 0.32), base, 0, 0, 0));
    const snout = mesh(new THREE.BoxGeometry(0.17, 0.14, 0.26), dark, 0, -0.05, 0.25);
    head.add(snout);
    for (const s of [-1, 1]) {
      const ear = mesh(new THREE.ConeGeometry(0.06, 0.16, 4), dark, s * 0.1, 0.18, -0.06);
      head.add(ear);
      head.add(mesh(new THREE.SphereGeometry(0.03, 5, 4), eye, s * 0.08, 0.04, 0.16));
    }
    body.add(head);
    for (const [x, z] of [[-0.17, 0.42], [0.17, 0.42], [-0.17, -0.42], [0.17, -0.42]]) {
      const hip = new THREE.Group();
      hip.position.set(x, 0.62, z);
      hip.add(mesh(capsule(0.065, 0.42), dark, 0, -0.3, 0));
      body.add(hip);
      legs.push(hip);
    }
    const tail = mesh(new THREE.ConeGeometry(0.09, 0.55, 5), dark, 0, 0.8, -0.72);
    tail.rotation.x = -2.2;
    body.add(tail);
    extra.tail = tail;
    if (def.glow) {
      for (let i = 0; i < 3; i++) {
        const shard = mesh(new THREE.OctahedronGeometry(0.09, 0), mat('#a8e6f5', { emissive: def.glow, emissiveIntensity: 1.6 }), 0, 1.02, 0.25 - i * 0.28);
        shard.scale.y = 2;
        body.add(shard);
      }
    }
  } else if (def.model === 'boar') {
    const torso = mesh(new THREE.SphereGeometry(0.55, 9, 7), base, 0, 0.72, 0);
    torso.scale.set(0.95, 0.85, 1.35);
    body.add(torso);
    head = new THREE.Group();
    head.position.set(0, 0.68, 0.78);
    head.add(mesh(new THREE.BoxGeometry(0.42, 0.38, 0.42), base));
    head.add(mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 8), dark, 0, -0.06, 0.24));
    head.children.at(-1).rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) {
      const tusk = mesh(new THREE.ConeGeometry(0.035, 0.24, 5), mat('#eae0c8'), s * 0.15, -0.12, 0.22);
      tusk.rotation.x = -2.4;
      head.add(tusk);
      head.add(mesh(new THREE.SphereGeometry(0.035, 5, 4), eye, s * 0.13, 0.08, 0.2));
    }
    body.add(head);
    for (let i = 0; i < 6; i++) {
      const spine = mesh(new THREE.ConeGeometry(0.05, 0.32, 4), mat('#3a2a1c'), 0, 1.15 - Math.abs(i - 2.5) * 0.03, 0.45 - i * 0.18);
      spine.rotation.x = -0.4;
      body.add(spine);
    }
    for (const [x, z] of [[-0.26, 0.45], [0.26, 0.45], [-0.26, -0.45], [0.26, -0.45]]) {
      const hip = new THREE.Group();
      hip.position.set(x, 0.45, z);
      hip.add(mesh(capsule(0.08, 0.22), dark, 0, -0.2, 0));
      body.add(hip);
      legs.push(hip);
    }
  } else if (def.model === 'toad') {
    const torso = mesh(new THREE.SphereGeometry(0.55, 10, 8), base, 0, 0.45, 0);
    torso.scale.set(1.15, 0.75, 1.05);
    body.add(torso);
    body.add(mesh(new THREE.SphereGeometry(0.42, 8, 6), mat('#b3a76a'), 0, 0.32, 0.2)); // pale belly
    head = new THREE.Group();
    head.position.set(0, 0.72, 0.32);
    for (const s of [-1, 1]) {
      head.add(mesh(new THREE.SphereGeometry(0.14, 8, 6), base, s * 0.22, 0.05, 0));
      head.add(mesh(new THREE.SphereGeometry(0.08, 6, 5), eye, s * 0.24, 0.1, 0.09));
    }
    body.add(head);
    for (const [x, z] of [[-0.45, 0.25], [0.45, 0.25], [-0.5, -0.3], [0.5, -0.3]]) {
      const hip = new THREE.Group();
      hip.position.set(x, 0.3, z);
      hip.add(mesh(capsule(0.09, 0.2), dark, 0, -0.15, 0));
      body.add(hip);
      legs.push(hip);
    }
  } else if (def.model === 'treant') {
    const trunk = mesh(new THREE.CylinderGeometry(0.28, 0.42, 1.5, 7), mat('#4a3826'), 0, 0.95, 0);
    body.add(trunk);
    head = new THREE.Group();
    head.position.set(0, 1.85, 0);
    head.add(mesh(new THREE.IcosahedronGeometry(0.5, 0), base));
    for (const s of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(0.06, 5, 4), mat('#d8ff8a', { emissive: '#8fe05a', emissiveIntensity: 2 }), s * 0.14, -0.05, 0.38));
    body.add(head);
    for (let i = 0; i < 9; i++) {
      const thorn = mesh(new THREE.ConeGeometry(0.04, 0.3, 4), mat('#2d2418'), Math.cos(i * 0.7) * 0.36, 0.5 + (i % 5) * 0.22, Math.sin(i * 0.7) * 0.36);
      thorn.rotation.z = Math.cos(i * 0.7) * -1.3;
      thorn.rotation.x = Math.sin(i * 0.7) * 1.3;
      body.add(thorn);
    }
    const arms = [];
    for (const side of [-1, 1]) {
      const sh = new THREE.Group();
      sh.position.set(side * 0.36, 1.45, 0);
      const arm = mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.95, 5), mat('#4a3826'), 0, -0.45, 0);
      sh.add(arm);
      sh.rotation.z = side * 0.5;
      body.add(sh);
      arms.push(sh);
    }
    extra.arms = arms;
    for (const side of [-1, 1]) {
      const hip = new THREE.Group();
      hip.position.set(side * 0.18, 0.3, 0);
      hip.add(mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.4, 5), mat('#3d2e1f'), 0, -0.12, 0));
      body.add(hip);
      legs.push(hip);
    }
  } else if (def.model === 'shard') {
    const crystalMat = new THREE.MeshStandardMaterial({ color: '#9fe2f2', emissive: '#3d9ab8', emissiveIntensity: 1.2, roughness: 0.15, metalness: 0.1, flatShading: true, transparent: true, opacity: 0.92 });
    const core = mesh(new THREE.OctahedronGeometry(1, 0), crystalMat, 0, 2.6, 0);
    core.scale.set(0.9, 2.2, 0.9);
    body.add(core);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const s = mesh(new THREE.OctahedronGeometry(0.5, 0), crystalMat, Math.cos(a) * 0.9, 0.7, Math.sin(a) * 0.9);
      s.scale.set(0.6, 1.6, 0.6);
      s.rotation.z = Math.cos(a) * 0.5;
      s.rotation.x = Math.sin(a) * 0.5;
      body.add(s);
    }
    body.add(mesh(new THREE.CylinderGeometry(1.5, 1.9, 0.5, 8), mat('#4d4b4a'), 0, 0.15, 0));
    const orbit = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const f = mesh(new THREE.TetrahedronGeometry(0.22, 0), crystalMat, Math.cos(i * 1.57) * 1.8, 2.4 + (i % 2) * 0.8, Math.sin(i * 1.57) * 1.8);
      orbit.add(f);
    }
    body.add(orbit);
    const light = new THREE.PointLight('#7fd4ff', 6, 14, 1.8);
    light.position.y = 2.6;
    body.add(light);
    extra = { core, orbit, crystalMat, light };
  }
  root.scale.setScalar(def.scale || 1);
  return { root, body, head, legs, kind: def.model, def, extra, phase: Math.random() * 6 };
}

// ---------------------------------------------------------------------------
// Ground loot
// ---------------------------------------------------------------------------
export function buildLoot(defId, rarity) {
  const root = new THREE.Group();
  if (defId === 'gold') {
    const gold = mat('#e2b23f', { metalness: 0.8, roughness: 0.3, emissive: '#5a3d08', emissiveIntensity: 0.5 });
    for (let i = 0; i < 6; i++) {
      const coin = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 10), gold, Math.cos(i * 2.1) * 0.1, 0.02 + i * 0.022, Math.sin(i * 2.1) * 0.1);
      coin.rotation.z = (i % 3) * 0.2;
      root.add(coin);
    }
  } else {
    const col = RARITIES[rarity]?.color || '#c9c6bd';
    const pouch = mesh(new THREE.SphereGeometry(0.2, 8, 6), mat('#7a5a38'), 0, 0.18, 0);
    pouch.scale.y = 0.85;
    root.add(pouch);
    root.add(mesh(new THREE.ConeGeometry(0.1, 0.14, 6), mat('#7a5a38'), 0, 0.38, 0));
    root.add(mesh(new THREE.TorusGeometry(0.08, 0.02, 4, 8), mat(col, { emissive: col, emissiveIntensity: 0.8 }), 0, 0.33, 0));
    root.children.at(-1).rotation.x = Math.PI / 2;
    if (rarity && rarity !== 'common') {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 3.5, 8, 1, true),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      beam.position.y = 1.75;
      root.add(beam);
    }
  }
  return { root, kind: 'loot' };
}

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------
// st: { speed, attackT, castT, hitT, dead, deathT }   (times in seconds since event, or large)
export function animate(model, st, dt, time) {
  const r = model.root;
  if (model.kind === 'loot') {
    r.rotation.y += dt * 1.2;
    return;
  }
  if (st.dead) {
    const k = Math.min(1, st.deathT / 0.6);
    model.body.rotation.x = 0;
    model.body.rotation.z = k * (model.kind === 'humanoid' ? Math.PI / 2 : Math.PI / 2.2);
    model.body.position.y = model.kind === 'humanoid' ? k * 0.2 : k * 0.15;
    if (model.kind === 'shard') {
      model.body.scale.setScalar(Math.max(0.01, 1 - k));
    }
    return;
  }
  model.body.rotation.z = 0;
  model.body.scale.setScalar(1);

  const speed = st.speed || 0;
  const moving = Math.min(1, speed / 3);
  model.phase += dt * (3 + speed * 1.55);
  const s = Math.sin(model.phase), c2 = Math.cos(model.phase * 2);
  const hit = st.hitT < 0.25 ? Math.sin((st.hitT / 0.25) * Math.PI) : 0;

  if (model.kind === 'humanoid') {
    model.legs[0].rotation.x = s * 0.75 * moving;
    model.legs[1].rotation.x = -s * 0.75 * moving;
    model.body.position.y = Math.abs(c2) * 0.05 * moving + Math.sin(time * 1.8) * 0.008;
    model.torso.rotation.x = 0.08 * moving - hit * 0.25;
    let ra = -s * 0.55 * moving, la = s * 0.55 * moving;
    let rz = 0;
    if (st.attackT < 0.42) {
      // Wind up then a fast cross-body swing.
      const t = st.attackT / 0.42;
      const swing = t < 0.35 ? -2.5 * (t / 0.35) : -2.5 + 3.2 * Math.min(1, (t - 0.35) / 0.3);
      ra = swing;
      rz = -0.35 * Math.sin(t * Math.PI);
      model.torso.rotation.y = -0.5 * Math.sin(t * Math.PI);
    } else if (st.castT < 0.6) {
      const t = st.castT / 0.6;
      const lift = Math.sin(Math.min(1, t * 1.6) * Math.PI / 2) * (1 - Math.max(0, t - 0.6) / 0.4);
      ra = -1.9 * lift; la = -1.6 * lift;
      model.torso.rotation.y = 0;
    } else {
      model.torso.rotation.y *= 0.8;
    }
    model.arms[1].rotation.x = ra;
    model.arms[1].rotation.z = rz;
    model.arms[0].rotation.x = la;
    const gem = model.hand.getObjectByName('gem');
    if (gem) gem.rotation.y = time * 2;
    return;
  }

  if (model.kind === 'shard') {
    model.extra.orbit.rotation.y = time * 0.6;
    model.extra.core.rotation.y = time * 0.25;
    const pulse = 1.0 + Math.sin(time * 2.2) * 0.25 + hit * 2.5;
    model.extra.crystalMat.emissiveIntensity = pulse;
    model.extra.light.intensity = 5 + pulse * 2;
    model.body.position.y = Math.sin(time * 1.1) * 0.05;
    return;
  }

  // Quadrupeds / treant: gait plus a lunge on attack.
  const gait = model.kind === 'treant' ? 0.5 : 0.85;
  model.legs.forEach((leg, i) => { leg.rotation.x = Math.sin(model.phase + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * gait * moving; });
  model.body.position.y = Math.abs(c2) * 0.04 * moving;
  let lunge = 0;
  if (st.attackT < 0.45) lunge = Math.sin((st.attackT / 0.45) * Math.PI);
  model.body.position.z = lunge * 0.35;
  model.body.rotation.x = -lunge * 0.15 + hit * 0.12;
  if (model.head) model.head.rotation.x = -lunge * 0.3 + Math.sin(time * 1.3) * 0.04 * (1 - moving);
  if (model.extra.tail) model.extra.tail.rotation.z = Math.sin(time * 4) * 0.25;
  if (model.extra.arms) {
    model.extra.arms[0].rotation.x = -lunge * 1.6 + s * 0.3 * moving;
    model.extra.arms[1].rotation.x = -lunge * 1.2 - s * 0.3 * moving;
  }
}
