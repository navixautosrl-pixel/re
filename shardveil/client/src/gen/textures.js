// Procedural PBR texture painter (browser, canvas). Produces albedo, normal
// and roughness/metalness maps that ship inside the baked GLBs.
//
// STATUS: procedural placeholder textures. Replacement targets are scanned or
// hand-painted texture sets (see docs/ASSETS.md); the material slots stay the same.
import * as THREE from 'three';
import { createNoise2D, fbm } from '/shared/noise.js';
import { mulberry32 } from '/shared/rng.js';

export function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

const hex = (c) => new THREE.Color(c);
const css = (col, a = 1) => `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)},${a})`;

// Height (grayscale canvas) -> tangent-space normal map canvas.
export function heightToNormal(hc, strength = 2) {
  const w = hc.width, h = hc.height;
  const src = hc.getContext('2d').getImageData(0, 0, w, h).data;
  const out = canvas(w, h);
  const ctx = out.getContext('2d');
  const img = ctx.createImageData(w, h);
  const H = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength;
      const dy = (H(x, y + 1) - H(x, y - 1)) * strength;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      img.data[i] = (-dx / l * 0.5 + 0.5) * 255;
      img.data[i + 1] = (dy / l * 0.5 + 0.5) * 255;
      img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

function tex(c, { srgb = true, repeat = null } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(...repeat);
  t.anisotropy = 4;
  t.userData.mimeType = 'image/jpeg'; // GLTFExporter: far smaller than PNG for noisy maps
  return t;
}

// glTF packs roughness in G and metalness in B of one texture.
function ormCanvas(w, h, rough, metal) {
  const c = canvas(w, h);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    img.data[i] = 255; img.data[i + 1] = rough(x, y) * 255; img.data[i + 2] = metal(x, y) * 255; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// A stylised cloud-scroll motif used in embroidery and carvings.
function cloudScroll(ctx, x, y, s, color, width = 2) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y, s * 0.5, Math.PI * 0.2, Math.PI * 1.9);
  ctx.arc(x + s * 0.32, y - s * 0.05, s * 0.22, Math.PI * 1.2, Math.PI * 0.4, true);
  ctx.moveTo(x - s * 0.5, y + s * 0.12);
  ctx.quadraticCurveTo(x - s * 0.9, y + s * 0.5, x - s * 1.2, y + s * 0.2);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(x + s * 0.32, y - s * 0.05, s * 0.07, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// ---- Fabric -------------------------------------------------------------------
// trims: [{ v0, v1, color, motif }] in UV v (0 = top of the garment).
// front: width of a front placket band around u = 0.5 (0 = none).
export function fabric({ base, size = 512, weave = 64, damask = null, trims = [], front = 0, frontColor = null, seed = 1, sheen = 0.3, wear = 0.35 }) {
  // Garment UVs run v = 0 at the top edge; canvas rows map to v inverted
  // (flipY), so trims given in garment v are mirrored here.
  trims = trims.map((t) => ({ ...t, v0: 1 - t.v1, v1: 1 - t.v0 }));
  const col = hex(base);
  const noise = createNoise2D(seed), noise2 = createNoise2D(seed + 9);
  const a = canvas(size), h = canvas(size);
  const actx = a.getContext('2d'), hctx = h.getContext('2d');
  const aimg = actx.createImageData(size, size), himg = hctx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const wx = Math.sin(u * weave * Math.PI * 2), wy = Math.sin(v * weave * Math.PI * 2);
    const thread = (wx > 0) === (wy > 0) ? Math.abs(wx) : Math.abs(wy);
    const mottle = fbm(noise, u * 6, v * 6, 3) * 0.08 + fbm(noise2, u * 40, v * 40, 2) * 0.04;
    const fold = Math.sin(u * Math.PI * 14 + fbm(noise, u * 3, v * 2, 2) * 4) * 0.03 * v;
    const k = 0.9 + thread * 0.1 + mottle + fold - wear * Math.max(0, fbm(noise2, u * 3, v * 3, 3)) * 0.2;
    const i = (y * size + x) * 4;
    aimg.data[i] = col.r * 255 * k; aimg.data[i + 1] = col.g * 255 * k; aimg.data[i + 2] = col.b * 255 * k; aimg.data[i + 3] = 255;
    himg.data[i] = himg.data[i + 1] = himg.data[i + 2] = (0.5 + thread * 0.35 + mottle) * 255; himg.data[i + 3] = 255;
  }
  actx.putImageData(aimg, 0, 0);
  hctx.putImageData(himg, 0, 0);

  // Tone-on-tone damask pattern.
  if (damask) {
    const r = mulberry32(seed);
    for (let i = 0; i < 26; i++) {
      const x = r() * size, y = r() * size;
      cloudScroll(actx, x, y, size * 0.05, damask, size / 256);
    }
  }
  const metalMask = canvas(size); const mctx = metalMask.getContext('2d');
  mctx.fillStyle = '#000'; mctx.fillRect(0, 0, size, size);
  const drawBand = (x0, y0, w, hgt, t) => {
    const g = actx.createLinearGradient(0, y0, 0, y0 + hgt);
    const c1 = hex(t.color);
    g.addColorStop(0, css(c1.clone().multiplyScalar(0.7))); g.addColorStop(0.5, css(c1)); g.addColorStop(1, css(c1.clone().multiplyScalar(0.7)));
    actx.fillStyle = g; actx.fillRect(x0, y0, w, hgt);
    hctx.fillStyle = 'rgba(255,255,255,0.6)'; hctx.fillRect(x0, y0, w, hgt);
    if (t.metal) { mctx.fillStyle = '#fff'; mctx.fillRect(x0, y0, w, hgt); }
    if (t.motif) {
      const step = Math.max(hgt * 1.6, 10);
      for (let x = x0 + step / 2; x < x0 + w; x += step) {
        cloudScroll(actx, x, y0 + hgt * 0.55, hgt * 0.42, t.motif, Math.max(1, hgt / 14));
        cloudScroll(hctx, x, y0 + hgt * 0.55, hgt * 0.42, 'rgba(255,255,255,0.9)', Math.max(1, hgt / 14));
      }
    }
    actx.fillStyle = 'rgba(0,0,0,0.35)';
    actx.fillRect(x0, y0, w, Math.max(1, hgt * 0.06)); actx.fillRect(x0, y0 + hgt * 0.94, w, Math.max(1, hgt * 0.06));
  };
  for (const t of trims) drawBand(0, t.v0 * size, size, (t.v1 - t.v0) * size, t);
  if (front) {
    const t = { color: frontColor || trims[0]?.color || '#c9a24a', motif: trims[0]?.motif, metal: trims[0]?.metal };
    actx.save(); hctx.save(); mctx.save();
    for (const c2 of [actx, hctx, mctx]) { c2.translate(size * 0.5, 0); c2.rotate(Math.PI / 2); c2.translate(0, -front * size / 2); }
    drawBand(0, 0, size, front * size, t);
    actx.restore(); hctx.restore(); mctx.restore();
  }
  const mdata = mctx.getImageData(0, 0, size, size).data;
  const rough = (x, y) => (mdata[(y * size + x) * 4] > 128 ? 0.38 : 0.92 - sheen * 0.3);
  const metal = (x, y) => (mdata[(y * size + x) * 4] > 128 ? 0.85 : 0.0);
  return { map: tex(a), normalMap: tex(heightToNormal(h, 2.2), { srgb: false }), ormMap: tex(ormCanvas(size, size, rough, metal), { srgb: false }) };
}

// ---- Leather ------------------------------------------------------------------
export function leather({ base, size = 256, seed = 3 }) {
  const col = hex(base);
  const n = createNoise2D(seed);
  const a = canvas(size), h = canvas(size);
  const actx = a.getContext('2d'), hctx = h.getContext('2d');
  const ai = actx.createImageData(size, size), hi = hctx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const grain = Math.abs(fbm(n, u * 30, v * 30, 3));
    const wear = fbm(n, u * 4, v * 4, 3);
    const k = 0.85 + grain * 0.2 + wear * 0.15;
    const i = (y * size + x) * 4;
    ai.data[i] = col.r * 255 * k; ai.data[i + 1] = col.g * 255 * k; ai.data[i + 2] = col.b * 255 * k; ai.data[i + 3] = 255;
    hi.data[i] = hi.data[i + 1] = hi.data[i + 2] = (0.5 + grain * 0.5) * 255; hi.data[i + 3] = 255;
  }
  actx.putImageData(ai, 0, 0); hctx.putImageData(hi, 0, 0);
  // Stitch line.
  actx.strokeStyle = 'rgba(220,200,160,0.5)'; actx.setLineDash([3, 3]); actx.lineWidth = 1;
  actx.beginPath(); actx.moveTo(0, size * 0.08); actx.lineTo(size, size * 0.08); actx.stroke();
  return {
    map: tex(a), normalMap: tex(heightToNormal(h, 3), { srgb: false }),
    ormMap: tex(ormCanvas(size, size, (x, y) => 0.6 + 0.2 * Math.abs(n(x / 20, y / 20)), () => 0), { srgb: false }),
  };
}

// ---- Lamellar armour: rows of small laced plates -------------------------------
export function lamellar({ plate = '#5b5f66', lace = '#7d2a22', size = 512, rows = 10, cols = 22, lacquer = false }) {
  const a = canvas(size), h = canvas(size);
  const actx = a.getContext('2d'), hctx = h.getContext('2d');
  const pc = hex(plate);
  actx.fillStyle = '#1a1a1c'; actx.fillRect(0, 0, size, size);
  hctx.fillStyle = '#000'; hctx.fillRect(0, 0, size, size);
  const ph = size / rows, pw = size / cols;
  const r = mulberry32(5);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols + 1; col++) {
      const x = col * pw - (row % 2) * pw * 0.5, y = row * ph;
      const k = 0.85 + r() * 0.25;
      const g = actx.createLinearGradient(x, y, x, y + ph);
      g.addColorStop(0, css(pc.clone().multiplyScalar(1.25 * k)));
      g.addColorStop(0.55, css(pc.clone().multiplyScalar(k)));
      g.addColorStop(1, css(pc.clone().multiplyScalar(0.55 * k)));
      actx.fillStyle = g;
      const rr = pw * 0.35;
      actx.beginPath(); actx.roundRect(x + 1, y + 1, pw - 2, ph * 0.9, [rr, rr, 2, 2]); actx.fill();
      const hg = hctx.createLinearGradient(x, y, x, y + ph);
      hg.addColorStop(0, '#fff'); hg.addColorStop(1, '#555');
      hctx.fillStyle = hg;
      hctx.beginPath(); hctx.roundRect(x + 1, y + 1, pw - 2, ph * 0.9, [rr, rr, 2, 2]); hctx.fill();
      // Rivets.
      actx.fillStyle = '#c9a24a';
      actx.beginPath(); actx.arc(x + pw / 2, y + ph * 0.25, Math.max(1, pw * 0.08), 0, Math.PI * 2); actx.fill();
    }
    // Lacing across each row.
    actx.fillStyle = lace;
    actx.fillRect(0, row * ph + ph * 0.78, size, ph * 0.12);
    hctx.fillStyle = '#ccc'; hctx.fillRect(0, row * ph + ph * 0.78, size, ph * 0.12);
  }
  const rough = (x, y) => (Math.floor(y / ph * 100) % 100 > 78 ? 0.9 : lacquer ? 0.35 : 0.42);
  const metal = (x, y) => (Math.floor(y / ph * 100) % 100 > 78 ? 0 : lacquer ? 0.1 : 0.75);
  return { map: tex(a), normalMap: tex(heightToNormal(h, 4), { srgb: false }), ormMap: tex(ormCanvas(size, size, rough, metal), { srgb: false }) };
}

// ---- Skin, face and hair --------------------------------------------------------
export function skin({ base = '#c99a76', size = 256, seed = 11 }) {
  const col = hex(base);
  const n = createNoise2D(seed);
  const a = canvas(size), h = canvas(size);
  const actx = a.getContext('2d'), hctx = h.getContext('2d');
  const ai = actx.createImageData(size, size), hi = hctx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const pore = fbm(n, u * 60, v * 60, 2);
    const blush = fbm(n, u * 3, v * 3, 2) * 0.06;
    const i = (y * size + x) * 4;
    ai.data[i] = Math.min(255, col.r * 255 * (1 + blush + 0.04)); ai.data[i + 1] = col.g * 255 * (1 + blush * 0.5); ai.data[i + 2] = col.b * 255 * (1 + blush * 0.3);
    ai.data[i + 3] = 255;
    hi.data[i] = hi.data[i + 1] = hi.data[i + 2] = (0.5 + pore * 0.3) * 255; hi.data[i + 3] = 255;
  }
  actx.putImageData(ai, 0, 0); hctx.putImageData(hi, 0, 0);
  return { map: tex(a), normalMap: tex(heightToNormal(h, 1), { srgb: false }) };
}

// Face texture on the head's cylindrical UVs (front at u = 0.5).
// Feature positions are derived from the head geometry (see humanoid.js).
export function face({ base = '#c99a76', size = 1024, brow = '#2a1d16', lips = '#9a5a4e', eye = '#2b2420', age = 0 }) {
  const { map: skinMap } = skin({ base, size: 256 });
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.drawImage(skinMap.image, 0, 0, size, size);
  const X = (u) => u * size, Y = (v) => (1 - v) * size;
  // Subtle shading: darker under the jaw, warmer cheeks.
  const jaw = ctx.createLinearGradient(0, Y(0.45), 0, Y(0.25));
  jaw.addColorStop(0, 'rgba(0,0,0,0)'); jaw.addColorStop(1, 'rgba(60,30,20,0.25)');
  ctx.fillStyle = jaw; ctx.fillRect(0, Y(0.45), size, Y(0.25) - Y(0.45));
  for (const s of [-1, 1]) {
    const cx = X(0.5 + s * 0.075), cy = Y(0.47);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.04);
    g.addColorStop(0, 'rgba(190,90,80,0.18)'); g.addColorStop(1, 'rgba(190,90,80,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - size * 0.05, cy - size * 0.05, size * 0.1, size * 0.1);
  }
  // Eyes.
  for (const s of [-1, 1]) {
    const cx = X(0.5 + s * 0.052), cy = Y(0.532);
    const w = size * 0.022, hh = size * 0.0085;
    ctx.fillStyle = 'rgba(60,35,30,0.35)';
    ctx.beginPath(); ctx.ellipse(cx, cy - hh * 0.4, w * 1.25, hh * 2.0, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8e0d4';
    ctx.beginPath(); ctx.moveTo(cx - w, cy); ctx.quadraticCurveTo(cx, cy - hh * 1.6, cx + w, cy - hh * 0.2);
    ctx.quadraticCurveTo(cx, cy + hh * 1.2, cx - w, cy); ctx.fill();
    ctx.fillStyle = eye;
    ctx.beginPath(); ctx.arc(cx + s * w * 0.05, cy - hh * 0.1, hh * 1.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0c0a09';
    ctx.beginPath(); ctx.arc(cx + s * w * 0.05, cy - hh * 0.1, hh * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(cx + s * w * 0.05 + hh * 0.3, cy - hh * 0.45, hh * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1b130f'; ctx.lineWidth = size * 0.003;
    ctx.beginPath(); ctx.moveTo(cx - w * 1.05, cy + hh * 0.1); ctx.quadraticCurveTo(cx, cy - hh * 1.7, cx + w * 1.08, cy - hh * 0.3); ctx.stroke();
    // Brows: angled, thicker toward the centre.
    ctx.fillStyle = brow;
    const by = Y(0.575);
    ctx.beginPath();
    ctx.moveTo(cx - s * w * 1.1, by + hh * 0.6); ctx.quadraticCurveTo(cx, by - hh * 1.6, cx + s * w * 1.2, by + hh * 0.4);
    ctx.quadraticCurveTo(cx, by - hh * 0.4, cx - s * w * 1.1, by + hh * 1.8); ctx.fill();
  }
  // Nose shading and mouth.
  ctx.fillStyle = 'rgba(80,40,30,0.25)';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(X(0.5 + s * 0.012), Y(0.462), size * 0.006, size * 0.004, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = lips;
  ctx.beginPath(); ctx.moveTo(X(0.47), Y(0.41)); ctx.quadraticCurveTo(X(0.5), Y(0.418), X(0.53), Y(0.41));
  ctx.quadraticCurveTo(X(0.5), Y(0.395), X(0.47), Y(0.41)); ctx.fill();
  ctx.strokeStyle = 'rgba(60,25,20,0.7)'; ctx.lineWidth = size * 0.002;
  ctx.beginPath(); ctx.moveTo(X(0.468), Y(0.41)); ctx.quadraticCurveTo(X(0.5), Y(0.406), X(0.532), Y(0.41)); ctx.stroke();
  if (age) {
    ctx.strokeStyle = 'rgba(70,40,30,0.25)'; ctx.lineWidth = size * 0.0015;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(X(0.5 + s * 0.03), Y(0.44)); ctx.quadraticCurveTo(X(0.5 + s * 0.045), Y(0.42), X(0.5 + s * 0.04), Y(0.4)); ctx.stroke(); }
  }
  return { map: tex(c) };
}

export function hairTex({ base = '#1a1412', size = 256, seed = 4 }) {
  const col = hex(base);
  const n = createNoise2D(seed);
  const a = canvas(size), h = canvas(size);
  const actx = a.getContext('2d'), hctx = h.getContext('2d');
  const ai = actx.createImageData(size, size), hi = hctx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const strand = 0.5 + 0.5 * Math.sin(u * 220 + fbm(n, u * 4, v * 8, 3) * 12);
    const k = 0.7 + strand * 0.5;
    const i = (y * size + x) * 4;
    ai.data[i] = col.r * 255 * k; ai.data[i + 1] = col.g * 255 * k; ai.data[i + 2] = col.b * 255 * k; ai.data[i + 3] = 255;
    hi.data[i] = hi.data[i + 1] = hi.data[i + 2] = strand * 255; hi.data[i + 3] = 255;
  }
  actx.putImageData(ai, 0, 0); hctx.putImageData(hi, 0, 0);
  return { map: tex(a), normalMap: tex(heightToNormal(h, 2), { srgb: false }) };
}

// ---- Wood, metal, feathers ---------------------------------------------------------
export function wood({ base = '#4a3222', size = 256, seed = 7, lacquer = false }) {
  const col = hex(base);
  const n = createNoise2D(seed);
  const a = canvas(size), h = canvas(size);
  const actx = a.getContext('2d'), hctx = h.getContext('2d');
  const ai = actx.createImageData(size, size), hi = hctx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const ring = Math.sin((u * 18 + fbm(n, u * 2, v * 6, 4) * 3) * Math.PI);
    const k = 0.75 + ring * 0.12 + fbm(n, u * 20, v * 3, 2) * 0.12;
    const i = (y * size + x) * 4;
    ai.data[i] = col.r * 255 * k; ai.data[i + 1] = col.g * 255 * k; ai.data[i + 2] = col.b * 255 * k; ai.data[i + 3] = 255;
    hi.data[i] = hi.data[i + 1] = hi.data[i + 2] = (0.5 + ring * 0.25) * 255; hi.data[i + 3] = 255;
  }
  actx.putImageData(ai, 0, 0); hctx.putImageData(hi, 0, 0);
  return {
    map: tex(a), normalMap: tex(heightToNormal(h, 1.5), { srgb: false }),
    ormMap: tex(ormCanvas(size, size, () => (lacquer ? 0.3 : 0.75), () => 0), { srgb: false }),
  };
}

export function metal({ base = '#8a8f96', size = 256, seed = 2, rough = 0.35, scratches = 60 }) {
  const col = hex(base);
  const n = createNoise2D(seed);
  const a = canvas(size), h = canvas(size);
  const actx = a.getContext('2d'), hctx = h.getContext('2d');
  const ai = actx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const k = 0.85 + fbm(n, x / 30, y / 30, 3) * 0.2;
    const i = (y * size + x) * 4;
    ai.data[i] = col.r * 255 * k; ai.data[i + 1] = col.g * 255 * k; ai.data[i + 2] = col.b * 255 * k; ai.data[i + 3] = 255;
  }
  actx.putImageData(ai, 0, 0);
  hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, size, size);
  const r = mulberry32(seed);
  hctx.strokeStyle = 'rgba(40,40,40,0.6)'; actx.strokeStyle = 'rgba(255,255,255,0.12)';
  for (let i = 0; i < scratches; i++) {
    const x = r() * size, y = r() * size, l = 4 + r() * 20, ang = r() * Math.PI;
    for (const c2 of [hctx, actx]) { c2.beginPath(); c2.moveTo(x, y); c2.lineTo(x + Math.cos(ang) * l, y + Math.sin(ang) * l); c2.stroke(); }
  }
  return {
    map: tex(a), normalMap: tex(heightToNormal(h, 1.2), { srgb: false }),
    ormMap: tex(ormCanvas(size, size, (x, y) => rough + 0.15 * Math.abs(n(x / 25, y / 25)), () => 1), { srgb: false }),
  };
}

export function feathers({ base = '#3d4a3a', tip = '#c9c2a8', size = 256 }) {
  const a = canvas(size), h = canvas(size);
  const actx = a.getContext('2d'), hctx = h.getContext('2d');
  actx.fillStyle = base; actx.fillRect(0, 0, size, size);
  hctx.fillStyle = '#000'; hctx.fillRect(0, 0, size, size);
  const rows = 8, cols = 10;
  for (let row = 0; row < rows; row++) for (let col = 0; col <= cols; col++) {
    const x = (col + (row % 2) * 0.5) * size / cols, y = row * size / rows;
    const w = size / cols * 0.55, hh = size / rows * 1.35;
    const g = actx.createLinearGradient(x, y, x, y + hh);
    g.addColorStop(0, base); g.addColorStop(0.75, base); g.addColorStop(1, tip);
    actx.fillStyle = g;
    actx.beginPath(); actx.ellipse(x, y + hh / 2, w, hh / 2, 0, 0, Math.PI * 2); actx.fill();
    actx.strokeStyle = 'rgba(0,0,0,0.35)'; actx.lineWidth = 1;
    actx.beginPath(); actx.moveTo(x, y); actx.lineTo(x, y + hh); actx.stroke();
    const hg = hctx.createLinearGradient(x - w, 0, x + w, 0);
    hg.addColorStop(0, '#333'); hg.addColorStop(0.5, '#fff'); hg.addColorStop(1, '#333');
    hctx.fillStyle = hg; hctx.beginPath(); hctx.ellipse(x, y + hh / 2, w, hh / 2, 0, 0, Math.PI * 2); hctx.fill();
  }
  return { map: tex(a), normalMap: tex(heightToNormal(h, 2.5), { srgb: false }) };
}

export { tex, ormCanvas, cloudScroll, css, hex };
