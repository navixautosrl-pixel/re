// Skinned geometry builder: lofted tubes along a centre line with per-ring
// radii and bone weights, plus deformed ellipsoids. Produces smooth, UV-mapped,
// skinned BufferGeometry. Pure geometry (no DOM), so it also runs in Node.
import * as THREE from 'three';
import { BONE_INDEX } from './skeleton.js';

const TAU = Math.PI * 2;

export class SkinBuilder {
  constructor() {
    this.pos = []; this.uv = []; this.idx = []; this.si = []; this.sw = [];
  }

  vertex(p, uv, weights) {
    const i = this.pos.length / 3;
    this.pos.push(p[0], p[1], p[2]);
    this.uv.push(uv[0], uv[1]);
    const entries = Object.entries(weights).filter(([, w]) => w > 0.001).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const total = entries.reduce((s, [, w]) => s + w, 0) || 1;
    for (let k = 0; k < 4; k++) {
      const e = entries[k];
      this.si.push(e ? BONE_INDEX[e[0]] : 0);
      this.sw.push(e ? e[1] / total : 0);
    }
    return i;
  }

  // rings: [{ c:[x,y,z], rx, rz, w:{bone:weight}, shape?:(angle)=>mult, off?:[x,y,z] }]
  // opts: { seg, vScale, capStart, capEnd, up:[x,y,z] reference "forward" }
  loft(rings, { seg = 16, vScale = 1, capStart = false, capEnd = false, fwdRef = [0, 0, 1], uOffset = 0 } = {}) {
    const n = rings.length;
    const frames = [];
    let vAcc = 0;
    const base = this.pos.length / 3;
    for (let i = 0; i < n; i++) {
      const c = new THREE.Vector3(...rings[i].c);
      const prev = new THREE.Vector3(...rings[Math.max(0, i - 1)].c);
      const next = new THREE.Vector3(...rings[Math.min(n - 1, i + 1)].c);
      const t = next.clone().sub(prev).normalize();
      const f = new THREE.Vector3(...fwdRef);
      let side = new THREE.Vector3().crossVectors(t, f);
      if (side.lengthSq() < 1e-6) side = new THREE.Vector3(1, 0, 0);
      side.normalize();
      const fwd = new THREE.Vector3().crossVectors(side, t).normalize();
      if (i > 0) vAcc += c.distanceTo(new THREE.Vector3(...rings[i - 1].c));
      frames.push({ c, side, fwd, v: vAcc });
    }
    for (let i = 0; i < n; i++) {
      const r = rings[i], fr = frames[i];
      for (let j = 0; j <= seg; j++) {
        const a = -Math.PI / 2 + (j / seg) * TAU;
        const m = r.shape ? r.shape(a) : 1;
        const p = fr.c.clone()
          .addScaledVector(fr.side, Math.cos(a) * r.rx * m)
          .addScaledVector(fr.fwd, Math.sin(a) * r.rz * m);
        if (r.off) p.add(new THREE.Vector3(...r.off));
        const w = typeof r.w === 'function' ? r.w(a, p) : r.w;
        this.vertex([p.x, p.y, p.z], [j / seg + uOffset, fr.v * vScale], w);
      }
    }
    const row = seg + 1;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < seg; j++) {
        const a = base + i * row + j, b = a + 1, c = a + row, d = c + 1;
        this.idx.push(a, c, b, b, c, d);
      }
    }
    const cap = (ringI, flip) => {
      const r = rings[ringI], fr = frames[ringI];
      const centre = this.vertex([fr.c.x + (r.off?.[0] || 0), fr.c.y + (r.off?.[1] || 0), fr.c.z + (r.off?.[2] || 0)], [0.5, fr.v * vScale],
        typeof r.w === 'function' ? r.w(0, fr.c) : r.w);
      for (let j = 0; j < seg; j++) {
        const a = base + ringI * row + j, b = a + 1;
        if (flip) this.idx.push(centre, a, b); else this.idx.push(centre, b, a);
      }
    };
    if (capStart) cap(0, true);
    if (capEnd) cap(n - 1, false);
    return this;
  }

  // Ellipsoid deformed by fn(dir, p) -> new point; weights by fn too.
  // UV: u around (front at 0.5), v from bottom (0) to top (1).
  blob({ c, r, wSeg = 24, hSeg = 16, deform = null, w, vRange = [0, 1] }) {
    const base = this.pos.length / 3;
    for (let i = 0; i <= hSeg; i++) {
      const v = vRange[0] + (vRange[1] - vRange[0]) * (i / hSeg);
      const theta = Math.PI * (1 - v); // 0 at top
      for (let j = 0; j <= wSeg; j++) {
        const u = j / wSeg;
        const phi = -Math.PI / 2 + u * TAU - Math.PI / 2; // u=0.5 -> front (+z)
        const dir = new THREE.Vector3(Math.sin(theta) * Math.sin(phi + Math.PI), Math.cos(theta), Math.sin(theta) * -Math.cos(phi + Math.PI));
        let p = new THREE.Vector3(c[0] + dir.x * r[0], c[1] + dir.y * r[1], c[2] + dir.z * r[2]);
        if (deform) p = deform(dir, p) || p;
        this.vertex([p.x, p.y, p.z], [u, v], typeof w === 'function' ? w(dir, p) : w);
      }
    }
    const row = wSeg + 1;
    for (let i = 0; i < hSeg; i++) {
      for (let j = 0; j < wSeg; j++) {
        const a = base + i * row + j, b = a + 1, c2 = a + row, d = c2 + 1;
        this.idx.push(a, c2, b, b, c2, d);
      }
    }
    return this;
  }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(this.si, 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(this.sw, 4));
    g.setIndex(this.idx);
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// Blend two bones by t (0 -> a, 1 -> b).
export const mix = (a, b, t) => (a === b ? { [a]: 1 } : { [a]: 1 - t, [b]: t });
