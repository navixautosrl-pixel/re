// Weapon models. Convention (also required of artist-made weapon GLBs):
// the grip is at the origin and +Y runs along the blade / shaft.
//
// STATUS: procedural placeholder models (lathe/extrude based, PBR textured).
import * as THREE from 'three';
import { material } from './materials.js';

const lathe = (profile, seg = 16) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const mesh = (geo, mat) => { const m = new THREE.Mesh(geo, material(mat)); m.castShadow = true; m.name = mat; return m; };

function crystal(h, r, mat) {
  return mesh(lathe([[0, -h * 0.35], [r, 0], [r * 0.85, h * 0.25], [0, h * 0.65]], 6), mat);
}

function tassel(y, length, mat = 'tassel') {
  const g = new THREE.Group();
  const cord = mesh(new THREE.CylinderGeometry(0.004, 0.004, length * 0.5, 5), mat);
  cord.position.y = y - length * 0.25;
  g.add(cord);
  const knot = mesh(new THREE.SphereGeometry(0.012, 8, 6), 'gold');
  knot.position.y = y - length * 0.5;
  g.add(knot);
  const fringe = mesh(lathe([[0.004, 0], [0.018, -length * 0.15], [0.022, -length * 0.5], [0, -length * 0.5]], 10), mat);
  fringe.position.y = y - length * 0.5;
  g.add(fringe);
  return g;
}

export function staff(tier = 0) {
  const g = new THREE.Group();
  const shaftMat = ['wood_dark', 'wood_lacquer', 'wood_lacquer'][tier];
  const metal = ['bronze', 'bronze', 'gold'][tier];
  const shaft = mesh(lathe([[0.0, -0.8], [0.016, -0.8], [0.02, -0.75], [0.017, -0.2], [0.019, 0], [0.017, 0.5], [0.02, 0.86], [0, 0.86]], 12), shaftMat);
  g.add(shaft);
  for (const y of [-0.74, -0.12, 0.12, 0.55, 0.82]) {
    const ring = mesh(new THREE.TorusGeometry(0.021, 0.006, 6, 16), metal);
    ring.rotation.x = Math.PI / 2; ring.position.y = y;
    g.add(ring);
  }
  // Head: an open crescent cradle holding the crystal.
  const cradle = mesh(new THREE.TorusGeometry(0.11, 0.012, 8, 32, Math.PI * 1.55), metal);
  cradle.position.y = 0.98; cradle.rotation.z = Math.PI * 1.22;
  g.add(cradle);
  for (const s of [-1, 1]) {
    const curl = mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 16, Math.PI * 1.4), metal);
    curl.position.set(s * 0.1, 1.04, 0); curl.rotation.z = s > 0 ? -0.6 : Math.PI + 0.6;
    g.add(curl);
  }
  const gemMat = tier === 1 ? 'gem_ember' : 'gem_veil';
  const gem = crystal(0.17, 0.045, gemMat);
  gem.position.y = 0.98; gem.name = 'gem';
  g.add(gem);
  g.add(tassel(0.86, 0.22));
  return g;
}

function bladeShape(len, width, curve) {
  const s = new THREE.Shape();
  s.moveTo(-width * 0.5, 0);
  s.quadraticCurveTo(-width * 0.5 + curve * 0.4, len * 0.6, -width * 0.15 + curve, len);
  s.lineTo(width * 0.05 + curve, len * 1.02);
  s.quadraticCurveTo(width * 0.55 + curve * 0.6, len * 0.75, width * 0.5, 0);
  s.closePath();
  return s;
}

export function sword(tier = 0) {
  const g = new THREE.Group();
  const len = [0.78, 0.88, 0.95][tier];
  const blade = new THREE.ExtrudeGeometry(bladeShape(len, 0.05, [0.0, 0.04, 0.06][tier]), {
    depth: 0.004, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.008, bevelSegments: 2, curveSegments: 10,
  });
  blade.translate(0, 0.1, -0.002);
  g.add(mesh(blade, tier === 2 ? 'steel_veil' : 'steel'));
  const guard = mesh(lathe([[0, -0.01], [0.055, -0.01], [0.06, 0], [0.055, 0.012], [0, 0.012]], 8), ['bronze', 'gold', 'gold'][tier]);
  guard.scale.set(1, 1, 0.55); guard.position.y = 0.085;
  g.add(guard);
  const grip = mesh(lathe([[0, -0.13], [0.016, -0.13], [0.017, -0.06], [0.016, 0.0], [0.017, 0.07], [0, 0.07]], 10), 'leather_dark');
  g.add(grip);
  for (let y = -0.11; y < 0.07; y += 0.03) {
    const wrap = mesh(new THREE.TorusGeometry(0.017, 0.003, 4, 12), 'leather_brown');
    wrap.rotation.x = Math.PI / 2; wrap.rotation.y = 0.3; wrap.position.y = y;
    g.add(wrap);
  }
  const pommel = mesh(new THREE.TorusGeometry(0.02, 0.006, 6, 14), ['bronze', 'gold', 'gold'][tier]);
  pommel.position.y = -0.15;
  g.add(pommel);
  g.add(tassel(-0.17, 0.16));
  return g;
}

export function dagger(tier = 0) {
  const g = new THREE.Group();
  const blade = new THREE.ExtrudeGeometry(bladeShape([0.26, 0.3, 0.32][tier], 0.04, 0.05), {
    depth: 0.003, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.006, bevelSegments: 2, curveSegments: 8,
  });
  blade.translate(0, 0.06, -0.0015);
  g.add(mesh(blade, tier === 2 ? 'steel_veil' : 'steel'));
  const guard = mesh(new THREE.BoxGeometry(0.07, 0.012, 0.02), ['bronze', 'gold', 'gold'][tier]);
  guard.position.y = 0.052;
  g.add(guard);
  g.add(mesh(lathe([[0, -0.09], [0.014, -0.09], [0.016, -0.02], [0.014, 0.05], [0, 0.05]], 10), 'leather_dark'));
  return g;
}

export function rod(tier = 0) {
  const g = new THREE.Group();
  g.add(mesh(lathe([[0, -0.4], [0.014, -0.4], [0.016, 0], [0.014, 0.42], [0, 0.42]], 10), ['wood_dark', 'wood_dark', 'wood_lacquer'][tier]));
  const metal = ['bronze', 'gold', 'gold'][tier];
  const bell = lathe([[0, 0.1], [0.012, 0.1], [0.04, 0.05], [0.05, 0.0], [0.052, -0.01], [0.044, -0.008]], 18);
  for (let i = 0; i < 3; i++) {
    const b = mesh(bell, metal);
    const a = (i / 3) * Math.PI * 2;
    b.position.set(Math.cos(a) * 0.05, 0.42, Math.sin(a) * 0.05);
    b.scale.setScalar(0.7);
    g.add(b);
  }
  const top = mesh(bell, metal);
  top.position.y = 0.52;
  g.add(top);
  const jade = crystal(0.06, 0.025, 'gem_jade');
  jade.position.y = 0.6;
  g.add(jade);
  g.add(tassel(0.4, 0.2, 'tassel_jade'));
  return g;
}

// Item def id -> builder (tiers match ITEMS levelReq bands).
export const WEAPON_BUILDERS = {
  ash_staff: () => staff(0), cinder_staff: () => staff(1), shardglass_staff: () => staff(2),
  ironwood_blade: () => sword(0), harrow_longsword: () => sword(1), greymaw_cleaver: () => sword(2),
  twin_fangs: () => dagger(0), thornspike_knives: () => dagger(1), duskfang_daggers: () => dagger(2),
  willow_rod: () => rod(0), bellwood_rod: () => rod(1), rootsong_rod: () => rod(2),
};
