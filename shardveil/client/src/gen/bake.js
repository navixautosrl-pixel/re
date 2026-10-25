// Bakes generated characters, outfits and weapons into binary glTF (.glb)
// files, exactly the format artist-made assets will be delivered in.
// Driven by scripts/bake-assets.mjs through client/tools/bake.html.
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { buildSkeleton, bodyParts, OUTFITS } from './humanoid.js';
import { buildClips } from './anims.js';
import { material } from './materials.js';
import { WEAPON_BUILDERS } from './weapons.js';

function skinnedScene(name, parts) {
  const sk = buildSkeleton();
  const group = new THREE.Group();
  group.name = name;
  group.add(sk.root);
  group.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(sk.list);
  for (const p of parts) {
    const m = new THREE.SkinnedMesh(p.geometry, material(p.mat));
    m.name = p.name;
    m.castShadow = true;
    group.add(m);
    m.updateMatrixWorld(true);
    m.bind(skeleton);
  }
  return group;
}

async function glb(scene, animations = []) {
  const exporter = new GLTFExporter();
  return exporter.parseAsync(scene, { binary: true, animations, onlyVisible: false, maxTextureSize: 1024 });
}

function toBase64(buf) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export async function bakeAll(log = () => {}) {
  const out = {};
  out['characters/humanoid_base.glb'] = toBase64(await glb(skinnedScene('humanoid_base', bodyParts()), buildClips()));
  log('base');
  for (const [key, fn] of Object.entries(OUTFITS)) {
    out[`outfits/${key}.glb`] = toBase64(await glb(skinnedScene(key, fn())));
    log(key);
  }
  for (const [key, fn] of Object.entries(WEAPON_BUILDERS)) {
    const g = fn();
    g.name = key;
    out[`weapons/${key}.glb`] = toBase64(await glb(g));
    log(key);
  }
  return out;
}

window.bakeAll = bakeAll;
