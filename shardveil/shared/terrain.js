// Deterministic terrain + world layout for a zone. The server uses it for
// movement validation and monster pathing; the client uses the very same
// functions to build meshes, so the two can never disagree about the ground.
import { createNoise2D, fbm } from './noise.js';
import { mulberry32 } from './rng.js';

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

export function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz;
  let t = len2 > 0 ? ((px - ax) * dx + (pz - az) * dz) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cz = az + t * dz;
  return Math.hypot(px - cx, pz - cz);
}

export function createTerrain(zone) {
  const noise = createNoise2D(zone.seed);
  const detail = createNoise2D(zone.seed + 7);
  const { town, lake, ridge, roads } = zone;
  const half = zone.size / 2;

  const roadSegments = [];
  for (const road of roads) {
    for (let i = 0; i < road.length - 1; i++) {
      roadSegments.push([road[i][0], road[i][1], road[i + 1][0], road[i + 1][1]]);
    }
  }

  function roadDistance(x, z) {
    let best = Infinity;
    for (const s of roadSegments) {
      const d = distToSegment(x, z, s[0], s[1], s[2], s[3]);
      if (d < best) best = d;
    }
    return best;
  }

  function rawHeight(x, z) {
    let h = fbm(noise, x / 95, z / 95, 5) * 10 + 3;
    // Compress valleys so only the lake basin actually holds water.
    if (h < 0.8) h = 0.8 + (h - 0.8) * 0.15;
    h += fbm(detail, x / 22, z / 22, 3) * 1.2;

    // Northern ridge: sharp-ish mountains that rise with distance north.
    const rk = smoothstep(ridge.startZ, ridge.fullZ, z);
    if (rk > 0) {
      const r = 1 - Math.abs(fbm(detail, x / 55, z / 55, 4));
      h += rk * r * r * ridge.height;
    }

    // Mountain rim that closes the vale.
    const edge = Math.max(Math.abs(x), Math.abs(z));
    if (edge > zone.walkBound - 12) {
      const e = edge - (zone.walkBound - 12);
      h += Math.pow(e, 1.45) * 1.1 * (0.7 + 0.3 * noise(x / 30, z / 30));
    }
    return h;
  }

  function heightAt(x, z) {
    let h = rawHeight(x, z);

    // Lake basin.
    const ld = Math.hypot(x - lake.x, z - lake.z);
    if (ld < lake.radius * 1.4) {
      const k = smoothstep(lake.radius * 0.55, lake.radius * 1.35, ld);
      h = lerp(zone.waterLevel - lake.depth, h, k);
    }

    // Roads: soften toward a gentle grade.
    const rd = roadDistance(x, z);
    if (rd < 10) {
      const k = smoothstep(2.5, 10, rd);
      h = lerp(h * 0.45 + 0.6, h, k);
    }

    // Town plateau.
    const td = Math.hypot(x - town.x, z - town.z);
    if (td < town.blendRadius) {
      const k = smoothstep(town.flatRadius, town.blendRadius, td);
      h = lerp(town.height, h, k);
    }
    return h;
  }

  function slopeAt(x, z) {
    const e = 0.75;
    const dx = heightAt(x + e, z) - heightAt(x - e, z);
    const dz = heightAt(x, z + e) - heightAt(x, z - e);
    return Math.hypot(dx, dz) / (2 * e);
  }

  // ---- Layout: colliders and decoration -------------------------------
  const colliders = []; // { type: 'circle'|'box'|'seg', ... }
  const trees = [];     // { x, z, kind, scale, rot }
  const rocks = [];     // { x, z, scale, rot }

  for (const b of town.buildings) {
    colliders.push({ type: 'box', x: town.x + b.x, z: town.z + b.z, hw: b.w / 2, hd: b.d / 2, tag: b.id });
  }

  // Palisade ring with gate gaps, approximated as short wall segments.
  const palisade = [];
  const segCount = 72;
  for (let i = 0; i < segCount; i++) {
    const a0 = (i / segCount) * Math.PI * 2;
    const a1 = ((i + 1) / segCount) * Math.PI * 2;
    const mid = (a0 + a1) / 2;
    const inGate = town.gates.some((g) => {
      let d = Math.abs(((mid - g.angle) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
      return d < g.width / 2;
    });
    if (inGate) continue;
    const r = town.palisadeRadius;
    const seg = {
      type: 'seg',
      ax: town.x + Math.cos(a0) * r, az: town.z + Math.sin(a0) * r,
      bx: town.x + Math.cos(a1) * r, bz: town.z + Math.sin(a1) * r,
      r: 0.45,
    };
    palisade.push(seg);
    colliders.push(seg);
  }

  const rng = mulberry32(zone.seed ^ 0x9e3779b9);
  const step = 5.5;
  for (let gx = -half; gx < half; gx += step) {
    for (let gz = -half; gz < half; gz += step) {
      const x = gx + rng() * step;
      const z = gz + rng() * step;
      const roll = rng();
      const kindRoll = rng();
      const scale = 0.8 + rng() * 0.6;
      const rot = rng() * Math.PI * 2;

      const td = Math.hypot(x - town.x, z - town.z);
      if (td < town.blendRadius + 4) continue;
      if (roadDistance(x, z) < 6) continue;
      const h = heightAt(x, z);
      if (h < zone.waterLevel + 0.6) continue;
      if (Math.max(Math.abs(x), Math.abs(z)) > zone.walkBound + 6) continue;

      // Density field: thick in Thornwood (east), sparse in the meadows,
      // scattered pines on the ridge.
      const thorn = 1 - smoothstep(30, 95, Math.hypot(x - 125, z - 15));
      const ridgeK = smoothstep(ridge.startZ, ridge.fullZ, z);
      const forestNoise = 0.5 + 0.5 * noise(x / 40 + 100, z / 40 - 50);
      let density = 0.08 + 0.2 * forestNoise * forestNoise + thorn * 0.75 + ridgeK * 0.16;
      // Keep spawn centres open enough to fight in.
      for (const s of zone.spawns) {
        if (Math.hypot(x - s.x, z - s.z) < Math.min(10, s.radius * 0.5)) density *= 0.15;
      }

      if (roll < density) {
        let kind = 'oak';
        if (ridgeK > 0.3 || (thorn > 0.4 && kindRoll < 0.6)) kind = 'pine';
        else if (kindRoll < 0.25) kind = 'birch';
        if (z < -100 && kindRoll > 0.85) kind = 'dead';
        if (slopeAt(x, z) > 1.3) continue;
        trees.push({ x, z, kind, scale, rot });
        colliders.push({ type: 'circle', x, z, r: 0.55 * scale, tag: 'tree' });
      } else if (roll < density + 0.035 + ridgeK * 0.06) {
        const rs = 0.6 + rng() * (ridgeK > 0.3 ? 2.2 : 1.2);
        rocks.push({ x, z, scale: rs, rot });
        if (rs > 0.9) colliders.push({ type: 'circle', x, z, r: rs * 0.85, tag: 'rock' });
      }
    }
  }

  // Spatial hash for colliders.
  const CELL = 8;
  const grid = new Map();
  const key = (cx, cz) => cx * 73856093 ^ cz * 19349663;
  const bounds = (c) => {
    if (c.type === 'circle') return [c.x - c.r, c.z - c.r, c.x + c.r, c.z + c.r];
    if (c.type === 'box') return [c.x - c.hw, c.z - c.hd, c.x + c.hw, c.z + c.hd];
    return [Math.min(c.ax, c.bx) - c.r, Math.min(c.az, c.bz) - c.r, Math.max(c.ax, c.bx) + c.r, Math.max(c.az, c.bz) + c.r];
  };
  for (const c of colliders) {
    const [x0, z0, x1, z1] = bounds(c);
    for (let cx = Math.floor(x0 / CELL); cx <= Math.floor(x1 / CELL); cx++) {
      for (let cz = Math.floor(z0 / CELL); cz <= Math.floor(z1 / CELL); cz++) {
        const k = key(cx, cz);
        let list = grid.get(k);
        if (!list) grid.set(k, (list = []));
        list.push(c);
      }
    }
  }

  function nearbyColliders(x, z) {
    return grid.get(key(Math.floor(x / CELL), Math.floor(z / CELL))) || [];
  }

  // Push a circle of radius r at (x, z) out of any colliders. Returns the
  // corrected position. Two passes are enough for the sparse layouts here.
  function resolveCollision(x, z, r) {
    for (let pass = 0; pass < 2; pass++) {
      const list = nearbyColliders(x, z);
      for (const c of list) {
        if (c.type === 'circle') {
          const dx = x - c.x, dz = z - c.z;
          const d = Math.hypot(dx, dz);
          const min = c.r + r;
          if (d < min) {
            if (d < 1e-6) { x += min; continue; }
            x = c.x + (dx / d) * min;
            z = c.z + (dz / d) * min;
          }
        } else if (c.type === 'box') {
          const cx = Math.max(c.x - c.hw, Math.min(x, c.x + c.hw));
          const cz = Math.max(c.z - c.hd, Math.min(z, c.z + c.hd));
          const dx = x - cx, dz = z - cz;
          const d = Math.hypot(dx, dz);
          if (d < r) {
            if (d < 1e-6) {
              // Centre inside the box: push out along the shallowest axis.
              const px = c.hw - Math.abs(x - c.x) + r;
              const pz = c.hd - Math.abs(z - c.z) + r;
              if (px < pz) x += Math.sign(x - c.x || 1) * px;
              else z += Math.sign(z - c.z || 1) * pz;
            } else {
              x = cx + (dx / d) * r;
              z = cz + (dz / d) * r;
            }
          }
        } else {
          const sdx = c.bx - c.ax, sdz = c.bz - c.az;
          const len2 = sdx * sdx + sdz * sdz;
          let t = ((x - c.ax) * sdx + (z - c.az) * sdz) / len2;
          t = Math.max(0, Math.min(1, t));
          const px = c.ax + t * sdx, pz = c.az + t * sdz;
          const dx = x - px, dz = z - pz;
          const d = Math.hypot(dx, dz);
          const min = c.r + r;
          if (d < min && d > 1e-6) {
            x = px + (dx / d) * min;
            z = pz + (dz / d) * min;
          }
        }
      }
    }
    return { x, z };
  }

  function isWalkable(x, z) {
    if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
    if (Math.abs(x) > zone.walkBound || Math.abs(z) > zone.walkBound) return false;
    if (heightAt(x, z) < zone.waterLevel + 0.15) return false;
    return slopeAt(x, z) < 1.6;
  }

  function regionAt(x, z) {
    let best = null, bestD = Infinity;
    for (const r of zone.regions) {
      const d = Math.hypot(x - r.x, z - r.z) / r.radius;
      if (d < 1 && d < bestD) { best = r; bestD = d; }
    }
    return best;
  }

  function inSafeZone(x, z) {
    return Math.hypot(x - town.x, z - town.z) < town.safeRadius;
  }

  return {
    zone, heightAt, slopeAt, roadDistance, isWalkable, resolveCollision,
    regionAt, inSafeZone, colliders, trees, rocks, palisade,
  };
}
