// Geometry helpers for building low-poly props out of primitives with baked
// vertex colours, merged into one geometry per prop for cheap instancing.
import * as THREE from '/vendor/three/three.module.js';

// parts: [{ geo, color, pos?: [x,y,z], rot?: [x,y,z], scale?: [x,y,z] }]
export function mergeColored(parts) {
  const positions = [], normals = [], colors = [];
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const nm = new THREE.Matrix3();
  const c = new THREE.Color();
  const v = new THREE.Vector3();
  for (const p of parts) {
    const g = p.geo.index ? p.geo.toNonIndexed() : p.geo;
    if (!g.attributes.normal) g.computeVertexNormals();
    e.set(...(p.rot || [0, 0, 0]));
    q.setFromEuler(e);
    m.compose(new THREE.Vector3(...(p.pos || [0, 0, 0])), q, new THREE.Vector3(...(p.scale || [1, 1, 1])));
    nm.getNormalMatrix(m);
    c.set(p.color);
    const pa = g.attributes.position, na = g.attributes.normal;
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i).applyMatrix4(m);
      positions.push(v.x, v.y, v.z);
      v.fromBufferAttribute(na, i).applyMatrix3(nm).normalize();
      normals.push(v.x, v.y, v.z);
      // Slight per-face shade variation reads as hand-made, not plastic.
      const shade = p.flat === false ? 1 : 0.94 + 0.06 * Math.sin(i * 12.9898);
      colors.push(c.r * shade, c.g * shade, c.b * shade);
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  out.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  out.computeBoundingSphere();
  return out;
}

// A gable roof prism: width w (x), depth d (z), height h, base at y = 0.
export function gableRoof(w, d, h) {
  const hw = w / 2, hd = d / 2;
  const v = [
    // left slope
    -hw, 0, -hd, 0, h, -hd, 0, h, hd, -hw, 0, -hd, 0, h, hd, -hw, 0, hd,
    // right slope
    hw, 0, hd, 0, h, hd, 0, h, -hd, hw, 0, hd, 0, h, -hd, hw, 0, -hd,
    // front gable (+z)
    -hw, 0, hd, 0, h, hd, hw, 0, hd,
    // back gable (-z)
    hw, 0, -hd, 0, h, -hd, -hw, 0, -hd,
  ];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

export function jitterGeometry(geo, amount, seed = 1) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  const p = g.attributes.position;
  // Jitter by position hash so shared vertices move together (no cracks).
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const h = Math.sin(x * 12.99 + y * 78.23 + z * 37.71 + seed) * 43758.5453;
    const r = (h - Math.floor(h)) - 0.5;
    const h2 = Math.sin(x * 93.98 + y * 17.13 + z * 51.37 + seed) * 24634.6345;
    const r2 = (h2 - Math.floor(h2)) - 0.5;
    p.setXYZ(i, x * (1 + r * amount), y * (1 + r2 * amount), z * (1 + (r + r2) * 0.5 * amount));
  }
  g.computeVertexNormals();
  return g;
}

export function canvasTexture(size, draw) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  draw(cv.getContext('2d'), size);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
