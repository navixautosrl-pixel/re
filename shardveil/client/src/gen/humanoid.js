// Procedural humanoid generator: a smooth, proportioned, skinned body on the
// UE5-named skeleton, plus class outfits built as separate skinned layers.
// Output is { skeleton bones, parts: [{ name, geometry, mat }] } where `mat`
// is a material key resolved by materials.js (browser) at bake time.
//
// STATUS: procedural placeholder art. It exists so the GLB pipeline, skeleton,
// animation state machine and equipment layering are real and testable now.
// Artist-made GLBs that use the same bone names replace these files 1:1
// (see docs/ASSETS.md).
import * as THREE from 'three';
import { HUMANOID_BONES, BONE_POS } from './skeleton.js';
import { SkinBuilder, smooth, lerp, mix } from './loft.js';

export function buildSkeleton() {
  const bones = {};
  for (const [name, parent, p] of HUMANOID_BONES) {
    const b = new THREE.Bone();
    b.name = name;
    const pp = parent ? BONE_POS[parent] : [0, 0, 0];
    b.position.set(p[0] - pp[0], p[1] - pp[1], p[2] - pp[2]);
    if (parent) bones[parent].add(b);
    bones[name] = b;
  }
  return { root: bones.root, list: HUMANOID_BONES.map(([n]) => bones[n]), byName: bones };
}

// ---- Weight helpers ---------------------------------------------------------
const SPINE = [['pelvis', 0.96], ['spine_01', 1.05], ['spine_02', 1.18], ['spine_03', 1.32], ['neck_01', 1.5], ['head', 1.6]];
export function spineW(y) {
  if (y <= SPINE[0][1]) return { pelvis: 1 };
  for (let i = 0; i < SPINE.length - 1; i++) {
    const [a, ya] = SPINE[i], [b, yb] = SPINE[i + 1];
    if (y <= yb) return mix(a, b, (y - ya) / (yb - ya));
  }
  return { head: 1 };
}
// Skirts and robes: follow the thighs more the lower the cloth hangs.
export function skirtW(p, follow = 0.85) {
  if (p.y > 0.96) return spineW(p.y);
  const side = Math.min(1, Math.max(0, p.x / 0.16 * 0.5 + 0.5));
  const d = smooth(0.95, 0.35, p.y) * follow;
  return { pelvis: 1 - d, thigh_l: d * side, thigh_r: d * (1 - side) };
}
const P = BONE_POS;
const at = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// A tube that follows one limb chain. side: 'l' | 'r'; radii scaled by k.
function armRings(s, k = 1, extend = 0) {
  const sh = P[`upperarm_${s}`], el = P[`lowerarm_${s}`], wr = P[`hand_${s}`];
  const sx = s === 'l' ? 1 : -1;
  return [
    { c: [sh[0] - sx * 0.02, sh[1] + 0.005, sh[2]], rx: 0.058 * k, rz: 0.06 * k, w: { [`upperarm_${s}`]: 0.55, spine_03: 0.3, [`clavicle_${s}`]: 0.15 } },
    { c: at(sh, el, 0.15), rx: 0.056 * k, rz: 0.055 * k, w: { [`upperarm_${s}`]: 1 } },
    { c: at(sh, el, 0.5), rx: 0.047 * k, rz: 0.05 * k, w: { [`upperarm_${s}`]: 1 } },
    { c: at(sh, el, 0.9), rx: 0.04 * k, rz: 0.042 * k, w: mix(`upperarm_${s}`, `lowerarm_${s}`, 0.3) },
    { c: el, rx: 0.038 * k, rz: 0.04 * k, w: mix(`upperarm_${s}`, `lowerarm_${s}`, 0.55) },
    { c: at(el, wr, 0.25), rx: 0.042 * k, rz: 0.04 * k, w: { [`lowerarm_${s}`]: 1 } },
    { c: at(el, wr, 0.7), rx: 0.034 * k, rz: 0.031 * k, w: { [`lowerarm_${s}`]: 1 } },
    { c: at(el, wr, 1 + extend), rx: 0.028 * k, rz: 0.026 * k, w: mix(`lowerarm_${s}`, `hand_${s}`, 0.3) },
  ];
}
function legRings(s, k = 1, top = 0.93, bottom = 1) {
  const hip = P[`thigh_${s}`], kn = P[`calf_${s}`], an = P[`foot_${s}`];
  return [
    { c: [hip[0] * 0.9, top, hip[2]], rx: 0.082 * k, rz: 0.085 * k, w: { [`thigh_${s}`]: 0.6, pelvis: 0.4 } },
    { c: at(hip, kn, 0.3), rx: 0.075 * k, rz: 0.078 * k, w: { [`thigh_${s}`]: 1 } },
    { c: at(hip, kn, 0.7), rx: 0.06 * k, rz: 0.064 * k, w: { [`thigh_${s}`]: 1 } },
    { c: kn, rx: 0.05 * k, rz: 0.054 * k, w: mix(`thigh_${s}`, `calf_${s}`, 0.5) },
    { c: at(kn, an, 0.25), rx: 0.054 * k, rz: 0.06 * k, w: { [`calf_${s}`]: 1 } },
    { c: at(kn, an, 0.6), rx: 0.042 * k, rz: 0.044 * k, w: { [`calf_${s}`]: 1 } },
    { c: at(kn, an, bottom), rx: 0.034 * k, rz: 0.036 * k, w: mix(`calf_${s}`, `foot_${s}`, 0.5) },
  ];
}
function torsoRings(k = 1, from = 0.88, to = 1.47, add = 0) {
  const ys = [0.88, 0.96, 1.05, 1.15, 1.26, 1.36, 1.43, 1.47];
  const rx = [0.152, 0.158, 0.142, 0.148, 0.165, 0.172, 0.16, 0.11];
  const rz = [0.108, 0.112, 0.098, 0.104, 0.116, 0.114, 0.1, 0.08];
  const out = [];
  for (let i = 0; i < ys.length; i++) {
    if (ys[i] < from - 1e-6 || ys[i] > to + 1e-6) continue;
    const chest = ys[i] > 1.2 && ys[i] < 1.42;
    out.push({
      c: [0, ys[i], -0.005], rx: rx[i] * k + add, rz: rz[i] * k + add, w: spineW(ys[i]),
      shape: chest ? (a) => 1 + 0.07 * Math.max(0, Math.sin(a)) : null,
    });
  }
  return out;
}

// ---- Body ---------------------------------------------------------------------
export function bodyParts({ build = 1 } = {}) {
  const parts = [];
  const skin = new SkinBuilder();
  skin.loft(torsoRings(build), { seg: 22, vScale: 1 });
  skin.loft([
    { c: [0, 1.45, -0.005], rx: 0.062, rz: 0.058, w: { spine_03: 0.5, neck_01: 0.5 } },
    { c: [0, 1.53, 0.0], rx: 0.052, rz: 0.05, w: { neck_01: 1 } },
    { c: [0, 1.6, 0.005], rx: 0.05, rz: 0.05, w: mix('neck_01', 'head', 0.6) },
  ], { seg: 14 });
  for (const s of ['l', 'r']) {
    skin.loft(armRings(s, build), { seg: 14 });
    const h = P[`hand_${s}`], sx = s === 'l' ? 1 : -1;
    skin.blob({ c: [h[0] + sx * 0.005, h[1] - 0.065, h[2] + 0.01], r: [0.03, 0.07, 0.046], wSeg: 12, hSeg: 8, w: { [`hand_${s}`]: 1 } });
    skin.blob({ c: [h[0] - sx * 0.006, h[1] - 0.04, h[2] + 0.045], r: [0.016, 0.04, 0.016], wSeg: 8, hSeg: 6, w: { [`hand_${s}`]: 1 } });
    skin.loft(legRings(s, build), { seg: 14 });
  }
  parts.push({ name: 'body', geometry: skin.build(), mat: 'skin' });

  // Head: an egg shape with jaw, cheekbones, brow and nose shaped in.
  const head = new SkinBuilder();
  head.blob({
    c: [0, 1.675, 0.012], r: [0.084, 0.112, 0.098], wSeg: 32, hSeg: 24, w: { head: 1 },
    deform: (d, p) => {
      const below = Math.max(0, -d.y);
      p.x *= 1 - 0.28 * below * below;                     // jaw tapers
      if (d.z > 0) p.z += 0.012 * Math.max(0, d.z) * (1 - Math.abs(d.y));
      if (d.z < -0.2 && d.y > -0.3) p.z -= 0.012 * (-d.z);   // back of skull
      if (d.y < -0.55 && d.z > 0.3) p.z += 0.01 * d.z;      // chin
      const nose = Math.exp(-((d.x / 0.13) ** 2) - (((d.y + 0.08) / 0.2) ** 2)) * Math.max(0, d.z);
      p.z += 0.022 * nose;
      const brow = Math.exp(-(((d.y - 0.22) / 0.08) ** 2)) * Math.max(0, d.z) * (1 - Math.abs(d.x));
      p.z += 0.006 * brow;
      for (const sx of [-1, 1]) {
        const eye = Math.exp(-(((d.x - sx * 0.32) / 0.12) ** 2) - (((d.y - 0.1) / 0.08) ** 2)) * Math.max(0, d.z);
        p.z -= 0.007 * eye;
        const cheek = Math.exp(-(((d.x - sx * 0.55) / 0.2) ** 2) - (((d.y + 0.05) / 0.15) ** 2)) * Math.max(0, d.z);
        p.x += sx * 0.004 * cheek;
      }
      return p;
    },
  });
  for (const sx of [-1, 1]) head.blob({ c: [sx * 0.086, 1.67, 0.0], r: [0.012, 0.028, 0.02], wSeg: 8, hSeg: 6, w: { head: 1 } });
  parts.push({ name: 'head', geometry: head.build(), mat: 'face' });
  return parts;
}

// Hair: a cap over the skull plus a bound topknot with a pin.
function hair(style = 'topknot', color = 'hair') {
  const h = new SkinBuilder();
  h.blob({
    c: [0, 1.682, 0.006], r: [0.091, 0.118, 0.104], wSeg: 28, hSeg: 14, vRange: [0.42, 1], w: { head: 1 },
    deform: (d, p) => {
      // Hairline: pull the front-lower edge back so the face shows.
      if (d.z > 0.25 && d.y < 0.5) { p.z -= 0.03 * (d.z - 0.25) * (0.5 - d.y) * 6; p.y += 0.01; }
      return p;
    },
  });
  if (style === 'topknot') h.blob({ c: [0, 1.81, -0.02], r: [0.04, 0.045, 0.042], wSeg: 14, hSeg: 10, w: { head: 1 } });
  if (style === 'long') {
    h.loft([
      { c: [0, 1.7, -0.07], rx: 0.085, rz: 0.04, w: { head: 1 } },
      { c: [0, 1.55, -0.1], rx: 0.08, rz: 0.035, w: { head: 0.5, neck_01: 0.5 } },
      { c: [0, 1.38, -0.13], rx: 0.07, rz: 0.03, w: { spine_03: 1 } },
    ], { seg: 12 });
  }
  return { name: 'hair', geometry: h.build(), mat: color };
}

function boots(mat = 'leather_dark', height = 0.36) {
  const b = new SkinBuilder();
  for (const s of ['l', 'r']) {
    const f = P[`foot_${s}`], kn = P[`calf_${s}`];
    b.blob({
      c: [f[0], 0.055, f[2] + 0.045], r: [0.052, 0.058, 0.13], wSeg: 16, hSeg: 10,
      w: (d, p) => (p.z > 0.08 ? mix(`foot_${s}`, `ball_${s}`, smooth(0.08, 0.15, p.z)) : { [`foot_${s}`]: 1 }),
      deform: (d, p) => { if (p.y < 0.01) p.y = 0.01; return p; },
    });
    b.loft([
      { c: [f[0], 0.07, f[2]], rx: 0.05, rz: 0.058, w: { [`foot_${s}`]: 1 } },
      { c: at(f, kn, 0.4), rx: 0.052, rz: 0.054, w: { [`calf_${s}`]: 1 } },
      { c: [kn[0], height, kn[2]], rx: 0.058, rz: 0.062, w: { [`calf_${s}`]: 1 } },
    ], { seg: 14, capStart: false });
  }
  return { name: 'boots', geometry: b.build(), mat };
}

function trousers(mat) {
  const b = new SkinBuilder();
  b.loft(torsoRings(1.04, 0.88, 1.05, 0.006), { seg: 22 });
  for (const s of ['l', 'r']) b.loft(legRings(s, 1.12, 0.95, 0.75), { seg: 14 });
  return { name: 'trousers', geometry: b.build(), mat };
}

function sleeves(mat, { flare = 0, k = 1.12 } = {}) {
  const b = new SkinBuilder();
  for (const s of ['l', 'r']) {
    const rings = armRings(s, k, flare > 0 ? 0.06 : 0);
    if (flare) {
      // Wide hanging sleeves: radius grows toward the cuff, hanging lower.
      rings.forEach((r, i) => {
        const t = i / (rings.length - 1);
        r.rx += flare * t * t * 0.8; r.rz += flare * t * t;
      });
    }
    b.loft(rings, { seg: 16, vScale: 1.55 });
  }
  return { name: 'sleeves', geometry: b.build(), mat };
}

// Long robe from chest to ankle, flaring at the hem.
function robe(mat, { hem = 0.1, flare = 0.36, top = 1.45, name = 'robe', open = 0 } = {}) {
  const b = new SkinBuilder();
  const rings = [];
  const ys = [top, 1.36, 1.26, 1.15, 1.05, 0.96, 0.82, 0.6, 0.36, hem];
  for (const y of ys) {
    let rx, rz;
    if (y > 1.0) {
      const tr = torsoRings(1, 0.88, 1.47).reduce((best, r) => (Math.abs(r.c[1] - y) < Math.abs(best.c[1] - y) ? r : best));
      rx = tr.rx + 0.022; rz = tr.rz + 0.026;
    } else {
      const t = smooth(1.0, hem, y);
      rx = lerp(0.18, flare, t); rz = lerp(0.135, flare * 0.82, t);
    }
    rings.push({ c: [0, y, -0.005], rx, rz, w: (a, p) => skirtW(p), shape: y > 1.2 ? (a) => 1 + 0.07 * Math.max(0, Math.sin(a)) : null });
  }
  b.loft(rings, { seg: 30, vScale: 1 / (top - hem) });
  return { name, geometry: b.build(), mat, doubleSided: true };
}

function band(mat, y0, y1, r0, r1, name, { seg = 26 } = {}) {
  const b = new SkinBuilder();
  b.loft([
    { c: [0, y0, -0.005], rx: r0[0], rz: r0[1], w: spineW(y0) },
    { c: [0, (y0 + y1) / 2, -0.005], rx: (r0[0] + r1[0]) / 2 + 0.004, rz: (r0[1] + r1[1]) / 2 + 0.004, w: spineW((y0 + y1) / 2) },
    { c: [0, y1, -0.005], rx: r1[0], rz: r1[1], w: spineW(y1) },
  ], { seg, vScale: 1 / Math.abs(y1 - y0) });
  return { name, geometry: b.build(), mat, doubleSided: true };
}

// Sash tails hanging from a knot at the hip.
function sashTails(mat, x = 0.07) {
  const b = new SkinBuilder();
  for (const [dx, len] of [[0, 0.5], [0.05, 0.42]]) {
    b.loft([
      { c: [x + dx, 1.0, 0.13], rx: 0.03, rz: 0.006, w: { pelvis: 1 } },
      { c: [x + dx + 0.01, 1.0 - len * 0.5, 0.16], rx: 0.034, rz: 0.006, w: (a, p) => skirtW(p, 0.6) },
      { c: [x + dx + 0.015, 1.0 - len, 0.17], rx: 0.036, rz: 0.006, w: (a, p) => skirtW(p, 0.8) },
    ], { seg: 6, vScale: 1 / len, fwdRef: [0, 0, 1] });
  }
  return { name: 'sash_tails', geometry: b.build(), mat: mat, doubleSided: true };
}

// Shoulder mantle: a short cape that drapes over the shoulders.
function mantle(mat, { length = 0.22, width = 0.27 } = {}) {
  const b = new SkinBuilder();
  const w = (a, p) => {
    const side = p.x / 0.25;
    const arm = smooth(0.12, 0.24, Math.abs(p.x));
    const s = side > 0 ? 'l' : 'r';
    return { spine_03: 1 - arm * 0.6, [`clavicle_${s}`]: arm * 0.3, [`upperarm_${s}`]: arm * 0.3 };
  };
  // Follows the shoulder slope from the collar down over the deltoids.
  b.loft([
    { c: [0, 1.52, -0.01], rx: 0.078, rz: 0.074, w },
    { c: [0, 1.49, -0.01], rx: 0.13, rz: 0.11, w },
    { c: [0, 1.45, -0.012], rx: 0.2, rz: 0.135, w },
    { c: [0, 1.4, -0.012], rx: width, rz: 0.155, w },
    { c: [0, 1.4 - length, -0.012], rx: width + 0.025, rz: 0.17, w },
  ], { seg: 32, vScale: 1 / (length + 0.14) });
  return { name: 'mantle', geometry: b.build(), mat, doubleSided: true };
}

// Lamellar cuirass and skirt for armoured classes.
function cuirass(mat) {
  const b = new SkinBuilder();
  b.loft(torsoRings(1.12, 0.96, 1.43, 0.012), { seg: 26, vScale: 2.2 });
  return { name: 'cuirass', geometry: b.build(), mat };
}
function tassets(mat) {
  const b = new SkinBuilder();
  b.loft([
    { c: [0, 1.0, -0.005], rx: 0.185, rz: 0.14, w: (a, p) => skirtW(p) },
    { c: [0, 0.82, -0.005], rx: 0.21, rz: 0.165, w: (a, p) => skirtW(p) },
    { c: [0, 0.62, -0.005], rx: 0.235, rz: 0.19, w: (a, p) => skirtW(p) },
  ], { seg: 28, vScale: 2.6 });
  return { name: 'tassets', geometry: b.build(), mat, doubleSided: true };
}
function pauldrons(mat) {
  const b = new SkinBuilder();
  for (const s of ['l', 'r']) {
    const sh = P[`upperarm_${s}`], sx = s === 'l' ? 1 : -1;
    b.blob({
      c: [sh[0] + sx * 0.025, sh[1] - 0.01, sh[2]], r: [0.105, 0.085, 0.11], wSeg: 18, hSeg: 10, vRange: [0.35, 1],
      w: { [`upperarm_${s}`]: 0.75, [`clavicle_${s}`]: 0.25 },
      deform: (d, p) => { p.y -= 0.02 * Math.abs(d.x); return p; },
    });
  }
  return { name: 'pauldrons', geometry: b.build(), mat };
}
function bracers(mat) {
  const b = new SkinBuilder();
  for (const s of ['l', 'r']) {
    const el = P[`lowerarm_${s}`], wr = P[`hand_${s}`];
    b.loft([
      { c: at(el, wr, 0.35), rx: 0.05, rz: 0.048, w: { [`lowerarm_${s}`]: 1 } },
      { c: at(el, wr, 0.95), rx: 0.04, rz: 0.038, w: { [`lowerarm_${s}`]: 1 } },
    ], { seg: 14, vScale: 4 });
  }
  return { name: 'bracers', geometry: b.build(), mat };
}

// Rigid headgear is skinned 100% to the head bone so it rides the animation.
function helm(mat, trimMat) {
  const b = new SkinBuilder();
  b.blob({ c: [0, 1.7, 0.0], r: [0.106, 0.112, 0.118], wSeg: 26, hSeg: 12, vRange: [0.45, 1], w: { head: 1 } });
  b.loft([
    { c: [0, 1.66, -0.01], rx: 0.11, rz: 0.12, w: { head: 1 } },
    { c: [0, 1.6, -0.03], rx: 0.13, rz: 0.13, w: { head: 1 } },
  ], { seg: 26, vScale: 4, fwdRef: [0, 0, 1] });
  const crest = new SkinBuilder();
  crest.blob({ c: [0, 1.83, -0.01], r: [0.012, 0.05, 0.07], wSeg: 10, hSeg: 8, w: { head: 1 } });
  return [{ name: 'helm', geometry: b.build(), mat, doubleSided: true }, { name: 'helm_crest', geometry: crest.build(), mat: trimMat }];
}
function crown(mat, gemMat) {
  const b = new SkinBuilder();
  b.loft([
    { c: [0, 1.745, 0.0], rx: 0.095, rz: 0.106, w: { head: 1 } },
    { c: [0, 1.77, 0.0], rx: 0.098, rz: 0.109, w: { head: 1 } },
  ], { seg: 28, vScale: 10 });
  // Front ornament rising from the band.
  b.blob({ c: [0, 1.8, 0.1], r: [0.032, 0.05, 0.01], wSeg: 12, hSeg: 8, w: { head: 1 } });
  const gem = new SkinBuilder().blob({ c: [0, 1.795, 0.112], r: [0.016, 0.022, 0.012], wSeg: 10, hSeg: 8, w: { head: 1 } });
  const pin = new SkinBuilder().loft([
    { c: [-0.07, 1.815, -0.02], rx: 0.004, rz: 0.004, w: { head: 1 } },
    { c: [0.07, 1.815, -0.02], rx: 0.004, rz: 0.004, w: { head: 1 } },
  ], { seg: 6, capStart: true, capEnd: true, fwdRef: [0, 1, 0] });
  return [
    { name: 'crown', geometry: b.build(), mat, doubleSided: true },
    { name: 'crown_gem', geometry: gem.build(), mat: gemMat },
    { name: 'hairpin', geometry: pin.build(), mat },
  ];
}
function hood(mat) {
  const b = new SkinBuilder();
  b.blob({
    c: [0, 1.665, -0.01], r: [0.108, 0.135, 0.12], wSeg: 28, hSeg: 16, vRange: [0.2, 1], w: (d, p) => (p.y < 1.55 ? mix('neck_01', 'head', 0.6) : { head: 1 }),
    deform: (d, p) => { if (d.z > 0.45 && d.y < 0.55 && d.y > -0.45) p.z -= 0.06 * (d.z - 0.45); return p; },
  });
  return { name: 'hood', geometry: b.build(), mat, doubleSided: true };
}
function mask(mat) {
  const b = new SkinBuilder();
  b.blob({ c: [0, 1.625, 0.03], r: [0.088, 0.06, 0.085], wSeg: 22, hSeg: 8, vRange: [0.1, 0.62], w: { head: 1 } });
  return { name: 'mask', geometry: b.build(), mat, doubleSided: true };
}

// ---- Outfits --------------------------------------------------------------
// Each outfit is a list of skinned layers. Equipment visuals swap layers by
// name, so new armour is a new layer set, not a new character.
export const OUTFITS = {
  arcanist: () => [
    trousers('cloth_charcoal'), boots('leather_dark', 0.3),
    robe('robe_arcanist', { flare: 0.37 }),
    sleeves('robe_arcanist_sleeve', { flare: 0.075 }),
    mantle('mantle_arcanist', { length: 0.2, width: 0.25 }),
    band('collar_gold', 1.455, 1.565, [0.074, 0.07], [0.064, 0.061], 'collar'),
    band('sash_crimson', 0.99, 1.08, [0.172, 0.13], [0.165, 0.122], 'sash'),
    sashTails('sash_crimson'),
    hair('topknot', 'hair'),
    ...crown('gold', 'gem_veil'),
  ],
  vanguard: () => [
    trousers('cloth_charcoal'), boots('leather_brown', 0.42),
    robe('tunic_crimson', { flare: 0.26, hem: 0.5, name: 'tunic' }),
    sleeves('tunic_crimson'),
    cuirass('lamellar'), tassets('lamellar'), pauldrons('lamellar'), bracers('leather_brown'),
    band('belt_leather', 0.99, 1.06, [0.19, 0.142], [0.186, 0.138], 'belt'),
    hair('topknot', 'hair'), ...helm('steel_dark', 'plume'),
  ],
  shadeblade: () => [
    trousers('cloth_shadow'), boots('leather_dark', 0.44),
    robe('jacket_shadow', { flare: 0.24, hem: 0.62, name: 'jacket' }),
    sleeves('cloth_shadow'), bracers('leather_dark'),
    band('sash_bone', 0.99, 1.07, [0.17, 0.128], [0.165, 0.122], 'sash'), sashTails('sash_bone', -0.08),
    hair('long', 'hair'), hood('cloth_shadow'), mask('cloth_shadow_mask'),
  ],
  wardweaver: () => [
    trousers('cloth_moss'), boots('leather_brown', 0.28),
    robe('robe_ward_inner', { flare: 0.33 }),
    robe('robe_ward_outer', { flare: 0.4, hem: 0.36, top: 1.42, name: 'overrobe' }),
    sleeves('robe_ward_outer', { flare: 0.06 }),
    mantle('mantle_feather', { length: 0.26, width: 0.27 }),
    band('sash_jade', 0.99, 1.08, [0.19, 0.15], [0.183, 0.142], 'sash'),
    hair('long', 'hair_grey'),
  ],
  // Townsfolk reuse the same parts with plainer cloth.
  npc_warden: () => [trousers('cloth_charcoal'), boots('leather_brown', 0.42), robe('tunic_slate', { flare: 0.3, hem: 0.45, name: 'tunic' }), sleeves('tunic_slate'),
    cuirass('lamellar'), pauldrons('lamellar'), band('belt_leather', 0.99, 1.06, [0.19, 0.142], [0.186, 0.138], 'belt'), hair('topknot', 'hair_grey')],
  npc_merchant: () => [trousers('cloth_moss'), boots('leather_brown', 0.3), robe('robe_merchant', { flare: 0.34 }), sleeves('robe_merchant', { flare: 0.05 }),
    band('sash_crimson', 0.99, 1.08, [0.185, 0.14], [0.18, 0.135], 'sash'), hair('topknot', 'hair')],
  npc_smith: () => [trousers('cloth_charcoal'), boots('leather_dark', 0.36), robe('apron_leather', { flare: 0.25, hem: 0.45, name: 'apron' }),
    bracers('leather_dark'), band('belt_leather', 0.99, 1.06, [0.19, 0.142], [0.186, 0.138], 'belt'), hair('topknot', 'hair')],
  npc_keeper: () => [trousers('cloth_charcoal'), boots('leather_dark', 0.3), robe('robe_keeper', { flare: 0.36 }), sleeves('robe_keeper', { flare: 0.07 }),
    mantle('mantle_arcanist', { length: 0.16, width: 0.24 }), hair('long', 'hair_grey')],
};

export const BODY_BUILD = { vanguard: 1.06, shadeblade: 0.97, arcanist: 0.97, wardweaver: 1.0 };
