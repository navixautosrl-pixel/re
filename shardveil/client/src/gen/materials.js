// Material library for generated characters and props: key -> PBR material.
// Colours follow the East Asian dark-fantasy palette: lacquer black and
// deep indigo cloth, aged gold embroidery, crimson silk, jade, weathered steel.
import * as THREE from 'three';
import * as T from './textures.js';

const GOLD = '#c39a48', GOLD_MOTIF = '#e6c77a';
const cache = new Map();

function std(maps, extra = {}) {
  const m = new THREE.MeshStandardMaterial({
    map: maps.map || null, normalMap: maps.normalMap || null,
    roughnessMap: maps.ormMap || null, metalnessMap: maps.ormMap || null,
    roughness: maps.ormMap ? 1 : extra.roughness ?? 0.8, metalness: maps.ormMap ? 1 : extra.metalness ?? 0,
    ...extra,
  });
  if (maps.normalMap) m.normalScale = new THREE.Vector2(0.8, 0.8);
  return m;
}
function silk(maps, sheenColor, extra = {}) {
  const m = new THREE.MeshPhysicalMaterial({
    map: maps.map, normalMap: maps.normalMap, roughnessMap: maps.ormMap, metalnessMap: maps.ormMap,
    roughness: 1, metalness: 1, sheen: 0.6, sheenRoughness: 0.45, sheenColor: new THREE.Color(sheenColor), ...extra,
  });
  m.normalScale = new THREE.Vector2(0.6, 0.6);
  return m;
}

const DEFS = {
  skin: () => std(T.skin({ base: '#c4a088' }), { roughness: 0.62 }),
  face: () => std({ ...T.face({ base: '#c4a088' }), normalMap: T.skin({ base: '#c4a088' }).normalMap }, { roughness: 0.6 }),
  face_old: () => std(T.face({ base: '#bb977f', age: 1 }), { roughness: 0.65 }),
  hair: () => std(T.hairTex({ base: '#17110e' }), { roughness: 0.55 }),
  hair_grey: () => std(T.hairTex({ base: '#6d6a66' }), { roughness: 0.6 }),

  cloth_charcoal: () => std(T.fabric({ base: '#26262b', weave: 90, seed: 2 })),
  cloth_shadow: () => std(T.fabric({ base: '#1b1d22', weave: 90, seed: 3, trims: [{ v0: 0.94, v1: 0.99, color: '#3a3f48' }] })),
  cloth_shadow_mask: () => std(T.fabric({ base: '#15161a', weave: 120, seed: 4 })),
  cloth_moss: () => std(T.fabric({ base: '#3a4234', weave: 90, seed: 5 })),

  robe_arcanist: () => silk(T.fabric({
    base: '#1f2546', weave: 110, seed: 21, damask: 'rgba(120,140,220,0.13)', front: 0.045,
    trims: [{ v0: 0.9, v1: 0.975, color: GOLD, motif: '#2a1d10', metal: true }, { v0: 0.84, v1: 0.855, color: '#7d2a22' }],
  }), '#6f7fd8'),
  robe_arcanist_sleeve: () => silk(T.fabric({
    base: '#1f2546', weave: 110, seed: 22, damask: 'rgba(120,140,220,0.13)',
    trims: [{ v0: 0.84, v1: 0.93, color: GOLD, motif: '#2a1d10', metal: true }],
  }), '#6f7fd8', { side: THREE.DoubleSide }),
  mantle_arcanist: () => silk(T.fabric({
    base: '#121424', weave: 100, seed: 23, damask: 'rgba(200,170,90,0.12)',
    trims: [{ v0: 0.82, v1: 0.96, color: GOLD, motif: '#2a1d10', metal: true }],
  }), '#4a4f80', { side: THREE.DoubleSide }),
  collar_gold: () => std(T.fabric({ base: '#7d2a22', weave: 60, seed: 24, trims: [{ v0: 0.1, v1: 0.9, color: GOLD, motif: '#2a1d10', metal: true }] }), { side: THREE.DoubleSide }),
  sash_crimson: () => silk(T.fabric({ base: '#7a1f1c', weave: 80, seed: 25, trims: [{ v0: 0.05, v1: 0.15, color: GOLD, metal: true }] }), '#ff8a7a', { side: THREE.DoubleSide }),
  sash_bone: () => std(T.fabric({ base: '#8c8573', weave: 80, seed: 26 }), { side: THREE.DoubleSide }),
  sash_jade: () => silk(T.fabric({ base: '#2f6b55', weave: 80, seed: 27, trims: [{ v0: 0.1, v1: 0.2, color: '#d8d2b0' }] }), '#9fe0c0', { side: THREE.DoubleSide }),

  tunic_crimson: () => std(T.fabric({ base: '#5e1d1a', weave: 80, seed: 31, front: 0.03, trims: [{ v0: 0.92, v1: 0.98, color: '#2a2a2e' }] }), { side: THREE.DoubleSide }),
  tunic_slate: () => std(T.fabric({ base: '#343a46', weave: 80, seed: 32, front: 0.03, trims: [{ v0: 0.92, v1: 0.98, color: '#7d2a22' }] }), { side: THREE.DoubleSide }),
  jacket_shadow: () => std(T.fabric({ base: '#1d2026', weave: 100, seed: 33, front: 0.025, frontColor: '#3a3f48', trims: [{ v0: 0.93, v1: 0.99, color: '#3a3f48' }] }), { side: THREE.DoubleSide }),
  robe_ward_inner: () => silk(T.fabric({ base: '#c9c4ae', weave: 120, seed: 34 }), '#ffffff', { side: THREE.DoubleSide }),
  robe_ward_outer: () => silk(T.fabric({
    base: '#2c4a3c', weave: 110, seed: 35, damask: 'rgba(200,230,200,0.1)', front: 0.06, frontColor: '#d8d2b0',
    trims: [{ v0: 0.9, v1: 0.97, color: '#d8d2b0', motif: '#2c4a3c' }],
  }), '#9fe0c0', { side: THREE.DoubleSide }),
  robe_merchant: () => std(T.fabric({ base: '#5a4630', weave: 80, seed: 36, front: 0.04, frontColor: '#7a1f1c', trims: [{ v0: 0.92, v1: 0.97, color: '#7a1f1c' }] }), { side: THREE.DoubleSide }),
  robe_keeper: () => std(T.fabric({ base: '#2a2d36', weave: 80, seed: 37, damask: 'rgba(200,170,90,0.08)', trims: [{ v0: 0.9, v1: 0.96, color: GOLD, motif: '#2a1d10', metal: true }] }), { side: THREE.DoubleSide }),
  apron_leather: () => std(T.leather({ base: '#4a3322' }), { side: THREE.DoubleSide }),

  leather_dark: () => std(T.leather({ base: '#2a201a' })),
  leather_brown: () => std(T.leather({ base: '#5a3e28', seed: 5 })),
  belt_leather: () => std(T.leather({ base: '#3a281c', seed: 6 }), { side: THREE.DoubleSide }),
  lamellar: () => std(T.lamellar({ plate: '#4c5058', lace: '#6e1f1b' })),
  steel_dark: () => std(T.metal({ base: '#4a4e55', rough: 0.4 }), { side: THREE.DoubleSide }),
  plume: () => std(T.fabric({ base: '#8a1d18', weave: 40, seed: 41 })),
  mantle_feather: () => std(T.feathers({ base: '#33443a', tip: '#cfc8ad' }), { side: THREE.DoubleSide, roughness: 0.8 }),

  gold: () => std(T.metal({ base: GOLD, rough: 0.3, scratches: 20 }), { side: THREE.DoubleSide }),
  gem_ember: () => new THREE.MeshStandardMaterial({ color: '#ffb46a', emissive: '#ff6a2a', emissiveIntensity: 2.2, roughness: 0.1, metalness: 0.1 }),
  gem_jade: () => new THREE.MeshStandardMaterial({ color: '#8fe0b0', emissive: '#2f9a6a', emissiveIntensity: 1.2, roughness: 0.15, metalness: 0.05 }),
  steel_veil: () => std(T.metal({ base: '#c6dfe8', rough: 0.2 }), { emissive: new THREE.Color('#2f7f9a'), emissiveIntensity: 0.25 }),
  tassel_jade: () => std(T.fabric({ base: '#2f6b55', weave: 30, seed: 52 }), { side: THREE.DoubleSide }),
  gem_veil: () => new THREE.MeshStandardMaterial({ color: '#a8ecff', emissive: '#4fc4ef', emissiveIntensity: 2.2, roughness: 0.1, metalness: 0.1 }),
  wood_dark: () => std(T.wood({ base: '#3b2619' })),
  wood_lacquer: () => std(T.wood({ base: '#3a0f0d', lacquer: true })),
  steel: () => std(T.metal({ base: '#a3a9b2', rough: 0.25 })),
  bronze: () => std(T.metal({ base: '#8a6234', rough: 0.4 })),
  tassel: () => std(T.fabric({ base: '#8a1d18', weave: 30, seed: 51 }), { side: THREE.DoubleSide }),
};

export function material(key) {
  if (!cache.has(key)) {
    const def = DEFS[key];
    if (!def) throw new Error(`Unknown material ${key}`);
    const m = def();
    m.name = key;
    cache.set(key, m);
  }
  return cache.get(key);
}

export const GOLD_COLOR = GOLD;
