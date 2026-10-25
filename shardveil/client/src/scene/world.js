// Builds Hollowmere Vale from the shared deterministic terrain: ground mesh,
// lake, forests, rocks, grass, the town of Emberford, sky and lighting with a
// day/night cycle. Everything is procedural; no external art assets.
import * as THREE from '/vendor/three/three.module.js';
import { createNoise2D } from '/shared/noise.js';
import { mulberry32 } from '/shared/rng.js';
import { mergeColored, gableRoof, jitterGeometry, canvasTexture } from './geo.js';

const C = (hex) => new THREE.Color(hex);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function buildWorld(scene, terrain, quality) {
  const zone = terrain.zone;
  const group = new THREE.Group();
  scene.add(group);
  const wind = { value: 0 };
  const nightGlow = []; // materials whose emissive brightens at night

  // ---- Ground ------------------------------------------------------------
  const seg = quality.terrainSegments;
  const size = zone.size;
  const groundGeo = new THREE.PlaneGeometry(size, size, seg, seg);
  groundGeo.rotateX(-Math.PI / 2);
  const pos = groundGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const tint = createNoise2D(zone.seed + 31);
  const grassA = C('#4c6a33'), grassB = C('#6a8240'), dry = C('#8b8a4f'), dirt = C('#7a6247'),
    road = C('#8d7658'), rock = C('#6f6b66'), rockHi = C('#9b978f'), sand = C('#b2a074'), town = C('#806b52'),
    moss = C('#3e5a33'), shard = C('#4e6a78');
  const col = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = terrain.heightAt(x, z);
    pos.setY(i, h);
    const slope = terrain.slopeAt(x, z);
    const n = 0.5 + 0.5 * tint(x / 28, z / 28);
    col.copy(grassA).lerp(grassB, n);
    col.lerp(dry, smooth(0.55, 0.9, 0.5 + 0.5 * tint(x / 70 + 9, z / 70)) * 0.6);
    // Forest floor under Thornwood is darker and mossier.
    const thorn = 1 - smooth(30, 90, Math.hypot(x - 125, z - 15));
    col.lerp(moss, thorn * 0.7);
    // The ridge is scarred blue-grey near the fallen shards.
    col.lerp(shard, smooth(-100, -140, z) * 0.45);
    if (h < zone.waterLevel + 0.9) col.lerp(sand, smooth(zone.waterLevel + 0.9, zone.waterLevel + 0.2, h));
    col.lerp(rock, smooth(0.65, 1.1, slope));
    col.lerp(rockHi, smooth(16, 26, h) * 0.8);
    const rd = terrain.roadDistance(x, z);
    col.lerp(road, smooth(4.2, 1.8, rd + tint(x / 3, z / 3) * 0.8));
    const td = Math.hypot(x - zone.town.x, z - zone.town.z);
    col.lerp(town, smooth(zone.town.palisadeRadius + 2, zone.town.palisadeRadius - 6, td) * 0.85);
    col.lerp(dirt, smooth(0.6, 1, tint(x / 9 + 40, z / 9)) * 0.25);
    colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
  }
  groundGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  groundGeo.computeVertexNormals();
  const detail = canvasTexture(256, (ctx, s) => {
    const r = mulberry32(5);
    const img = ctx.createImageData(s, s);
    for (let i = 0; i < s * s; i++) {
      const v = 205 + r() * 50;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  });
  detail.wrapS = detail.wrapT = THREE.RepeatWrapping;
  detail.repeat.set(size / 6, size / 6);
  const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ vertexColors: true, map: detail, roughness: 0.96, metalness: 0 }));
  ground.receiveShadow = true;
  ground.name = 'ground';
  group.add(ground);

  // ---- Water ---------------------------------------------------------------
  const lake = zone.lake;
  const waterMat = new THREE.MeshStandardMaterial({ color: '#2b5666', roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.86 });
  waterMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = wind;
    shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace('#include <begin_vertex>',
      `#include <begin_vertex>
       transformed.z += sin(position.x * 0.35 + uTime * 1.3) * 0.06 + cos(position.y * 0.29 + uTime * 0.9) * 0.05;`);
  };
  const water = new THREE.Mesh(new THREE.CircleGeometry(lake.radius * 1.45, 64, 0, Math.PI * 2), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(lake.x, zone.waterLevel, lake.z);
  group.add(water);

  // ---- Trees -------------------------------------------------------------
  const trunk = '#4a3826', trunkLight = '#d8d2c2';
  const treeGeos = {
    pine: mergeColored([
      { geo: new THREE.CylinderGeometry(0.16, 0.28, 2.4, 6), color: trunk, pos: [0, 1.2, 0] },
      { geo: new THREE.ConeGeometry(1.7, 2.8, 7), color: '#2d4a2c', pos: [0, 2.6, 0] },
      { geo: new THREE.ConeGeometry(1.3, 2.4, 7), color: '#335331', pos: [0, 3.8, 0], rot: [0, 0.4, 0] },
      { geo: new THREE.ConeGeometry(0.85, 2.0, 7), color: '#3a5c35', pos: [0, 4.9, 0], rot: [0, 0.9, 0] },
    ]),
    oak: mergeColored([
      { geo: new THREE.CylinderGeometry(0.24, 0.4, 2.8, 7), color: trunk, pos: [0, 1.4, 0] },
      { geo: jitterGeometry(new THREE.IcosahedronGeometry(1.8, 1), 0.18, 1), color: '#4b6b2f', pos: [0, 3.6, 0] },
      { geo: jitterGeometry(new THREE.IcosahedronGeometry(1.3, 1), 0.2, 2), color: '#557a35', pos: [1.0, 3.1, 0.4] },
      { geo: jitterGeometry(new THREE.IcosahedronGeometry(1.2, 1), 0.2, 3), color: '#456530', pos: [-0.9, 3.3, -0.5] },
    ]),
    birch: mergeColored([
      { geo: new THREE.CylinderGeometry(0.1, 0.16, 4.2, 6), color: trunkLight, pos: [0, 2.1, 0] },
      { geo: jitterGeometry(new THREE.IcosahedronGeometry(1.0, 1), 0.2, 4), color: '#86a24c', pos: [0, 4.3, 0], scale: [1, 1.5, 1] },
      { geo: jitterGeometry(new THREE.IcosahedronGeometry(0.7, 1), 0.2, 5), color: '#9cb35a', pos: [0.4, 3.4, 0.2], scale: [1, 1.4, 1] },
    ]),
    dead: mergeColored([
      { geo: new THREE.CylinderGeometry(0.12, 0.3, 3.6, 6), color: '#5d5550', pos: [0, 1.8, 0] },
      { geo: new THREE.CylinderGeometry(0.05, 0.1, 1.6, 5), color: '#5d5550', pos: [0.5, 2.9, 0], rot: [0, 0, -0.9] },
      { geo: new THREE.CylinderGeometry(0.05, 0.09, 1.3, 5), color: '#5d5550', pos: [-0.4, 2.4, 0.2], rot: [0.3, 0, 0.8] },
    ]),
  };
  const treeMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true });
  const byKind = {};
  for (const t of terrain.trees) (byKind[t.kind] ||= []).push(t);
  const dummy = new THREE.Object3D();
  const rng = mulberry32(77);
  for (const [kind, list] of Object.entries(byKind)) {
    const inst = new THREE.InstancedMesh(treeGeos[kind], treeMat, list.length);
    list.forEach((t, i) => {
      dummy.position.set(t.x, terrain.heightAt(t.x, t.z) - 0.15, t.z);
      dummy.rotation.set(0, t.rot, 0);
      dummy.scale.setScalar(t.scale * (kind === 'pine' ? 1.15 : 1));
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      const v = 0.85 + rng() * 0.3;
      inst.setColorAt(i, new THREE.Color(v, v * (0.95 + rng() * 0.1), v * 0.95));
    });
    inst.castShadow = quality.shadows;
    inst.receiveShadow = false;
    group.add(inst);
  }

  // ---- Rocks -------------------------------------------------------------
  const rockGeo = jitterGeometry(new THREE.IcosahedronGeometry(1, 0), 0.35, 9);
  const rockMat = new THREE.MeshStandardMaterial({ color: '#7d7a74', roughness: 0.95, flatShading: true });
  const rocks = new THREE.InstancedMesh(rockGeo, rockMat, terrain.rocks.length);
  terrain.rocks.forEach((r, i) => {
    dummy.position.set(r.x, terrain.heightAt(r.x, r.z) - r.scale * 0.25, r.z);
    dummy.rotation.set(r.rot * 0.3, r.rot, 0);
    dummy.scale.set(r.scale, r.scale * 0.62, r.scale * 0.9);
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);
    const v = 0.75 + rng() * 0.35;
    rocks.setColorAt(i, new THREE.Color(v, v, v * 1.02));
  });
  rocks.castShadow = quality.shadows;
  rocks.receiveShadow = true;
  group.add(rocks);

  // Shard crystals jutting from the ridge: the zone's signature landmark.
  const crystalGeo = new THREE.OctahedronGeometry(1, 0);
  crystalGeo.scale(0.35, 1.6, 0.35);
  const crystalMat = new THREE.MeshStandardMaterial({ color: '#8fd6e8', emissive: '#3d9ab8', emissiveIntensity: 0.9, roughness: 0.2, metalness: 0.1, flatShading: true });
  nightGlow.push({ mat: crystalMat, day: 0.5, night: 1.6 });
  const crystals = [];
  const cr = mulberry32(404);
  for (let i = 0; i < 260; i++) {
    const x = -150 + cr() * 300, z = -175 + cr() * 80;
    if (!terrain.isWalkable(x, z) && cr() > 0.3) continue;
    if (terrain.roadDistance(x, z) < 4) continue;
    crystals.push({ x, z, s: 0.4 + cr() * 1.1, rx: (cr() - 0.5) * 0.7, rz: (cr() - 0.5) * 0.7 });
  }
  const crystalInst = new THREE.InstancedMesh(crystalGeo, crystalMat, crystals.length);
  crystals.forEach((c, i) => {
    dummy.position.set(c.x, terrain.heightAt(c.x, c.z) + c.s * 0.6, c.z);
    dummy.rotation.set(c.rx, cr() * 6, c.rz);
    dummy.scale.setScalar(c.s);
    dummy.updateMatrix();
    crystalInst.setMatrixAt(i, dummy.matrix);
  });
  group.add(crystalInst);

  // ---- Grass -----------------------------------------------------------
  if (quality.grass > 0) {
    const blade = new THREE.BufferGeometry();
    const bv = [];
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI + 0.3, ox = Math.cos(a) * 0.12, oz = Math.sin(a) * 0.12;
      const lean = 0.12 + 0.08 * k;
      bv.push(ox - 0.05, 0, oz, ox + 0.05, 0, oz, ox + Math.cos(a + 1.5) * lean, 0.55 + 0.12 * (k % 2), oz + Math.sin(a + 1.5) * lean);
    }
    blade.setAttribute('position', new THREE.Float32BufferAttribute(bv, 3));
    blade.computeVertexNormals();
    const grassMat = new THREE.MeshStandardMaterial({ color: '#7b9a48', roughness: 1, side: THREE.DoubleSide });
    grassMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = wind;
      shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vec4 wp = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float sway = sin(uTime * 1.7 + wp.x * 0.21 + wp.z * 0.17) * 0.5 + sin(uTime * 3.1 + wp.x * 0.7) * 0.15;
          transformed.x += sway * position.y * 0.35;
          transformed.z += sway * position.y * 0.2;`)
        .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n objectNormal = vec3(0.0, 1.0, 0.0);');
      // Blades are lit like the ground beneath them from both sides; the
      // default double-sided flip would turn every back face black.
      shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_begin>',
        'float faceDirection = 1.0;\nvec3 normal = normalize( vNormal );\nvec3 nonPerturbedNormal = normal;');
    };
    const grass = new THREE.InstancedMesh(blade, grassMat, quality.grass);
    const gr = mulberry32(12);
    let placed = 0;
    for (let tries = 0; placed < quality.grass && tries < quality.grass * 6; tries++) {
      // Denser near the town and along the meadows where players start.
      const near = gr() < 0.55;
      const x = near ? (gr() - 0.5) * 220 : (gr() - 0.5) * 360;
      const z = near ? (gr() - 0.5) * 220 + 40 : (gr() - 0.5) * 360;
      const h = terrain.heightAt(x, z);
      if (h < zone.waterLevel + 0.5 || terrain.slopeAt(x, z) > 0.7 || terrain.roadDistance(x, z) < 3) continue;
      if (Math.hypot(x, z) < zone.town.palisadeRadius - 2) continue;
      if (z < -105 && gr() < 0.7) continue;
      dummy.position.set(x, h - 0.02, z);
      dummy.rotation.set(0, gr() * 6.28, 0);
      dummy.scale.setScalar(0.7 + gr() * 0.9);
      dummy.updateMatrix();
      grass.setMatrixAt(placed, dummy.matrix);
      const v = 0.75 + gr() * 0.4;
      grass.setColorAt(placed, new THREE.Color(v * 0.95, v, v * 0.8));
      placed++;
    }
    grass.count = placed;
    group.add(grass);
  }

  // ---- Emberford ---------------------------------------------------------
  buildTown(group, terrain, quality, nightGlow);

  // ---- Sky, sun, fog -----------------------------------------------------
  const skyUniforms = {
    top: { value: C('#5d8fc7') }, horizon: { value: C('#bcd3e0') }, sunDir: { value: new THREE.Vector3(0, 1, 0) },
    sunColor: { value: C('#fff3dc') }, sunSize: { value: 0.9993 },
  };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({
    uniforms: skyUniforms, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 sunDir; uniform vec3 sunColor; uniform float sunSize; varying vec3 vDir;
      void main() {
        float h = clamp(vDir.y, -0.2, 1.0);
        vec3 c = mix(horizon, top, pow(max(h, 0.0), 0.55));
        float s = dot(normalize(vDir), normalize(sunDir));
        c += sunColor * smoothstep(sunSize, 1.0, s) * 1.5;
        c += sunColor * pow(max(s, 0.0), 24.0) * 0.18;
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  sky.renderOrder = -10;
  group.add(sky);

  const starGeo = new THREE.BufferGeometry();
  const sr = mulberry32(3), starPos = [];
  for (let i = 0; i < 1400; i++) {
    const u = sr() * 2 - 1, th = sr() * Math.PI * 2, rr = Math.sqrt(1 - u * u);
    if (u < 0.05) continue;
    starPos.push(Math.cos(th) * rr * 850, u * 850, Math.sin(th) * rr * 850);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: '#dfe8ff', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const stars = new THREE.Points(starGeo, starMat);
  group.add(stars);

  scene.fog = new THREE.Fog('#bcd3e0', 40, quality.viewDistance);
  const hemi = new THREE.HemisphereLight('#c9dcef', '#4a4434', 1.0);
  group.add(hemi);
  const sun = new THREE.DirectionalLight('#fff3dc', 2.4);
  sun.castShadow = quality.shadows;
  if (quality.shadows) {
    sun.shadow.mapSize.set(quality.shadowSize, quality.shadowSize);
    const s = 48;
    Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 260 });
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.04;
  }
  group.add(sun, sun.target);

  const P = {
    night: { top: C('#0a1324'), horizon: C('#26344f'), light: C('#a9bde6'), hemiSky: C('#56688f'), hemiGround: C('#262a22'), sun: 0.95, hemi: 0.95 },
    dusk: { top: C('#36446f'), horizon: C('#e09a70'), light: C('#ffb27a'), hemiSky: C('#b49a90'), hemiGround: C('#3d3326'), sun: 1.4, hemi: 0.75 },
    day: { top: C('#4f86c4'), horizon: C('#bcd3e0'), light: C('#fff3dc'), hemiSky: C('#c9dcef'), hemiGround: C('#4a4434'), sun: 2.5, hemi: 1.0 },
  };
  const tmp = { top: new THREE.Color(), horizon: new THREE.Color(), light: new THREE.Color(), hemiSky: new THREE.Color(), hemiGround: new THREE.Color() };
  const mixPal = (a, b, t) => {
    for (const k of Object.keys(tmp)) tmp[k].copy(a[k]).lerp(b[k], t);
    return { sun: a.sun + (b.sun - a.sun) * t, hemi: a.hemi + (b.hemi - a.hemi) * t };
  };

  let currentNight = 0;
  function update(dt, time, focus, dayPhase) {
    wind.value = time;
    // phase 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset
    const ang = (dayPhase - 0.25) * Math.PI * 2;
    const elev = Math.sin(ang);
    const sunVec = new THREE.Vector3(Math.cos(ang) * 0.8, elev, 0.45).normalize();
    let k;
    if (elev > 0.2) k = mixPal(P.dusk, P.day, smooth(0.2, 0.5, elev));
    else if (elev > -0.12) k = mixPal(P.night, P.dusk, smooth(-0.12, 0.2, elev));
    else k = mixPal(P.night, P.night, 0);
    const isNight = elev < 0;
    // At night the key light is the moon, opposite the sun.
    const lightDir = isNight ? sunVec.clone().multiplyScalar(-1) : sunVec;
    if (lightDir.y < 0.25) lightDir.y = 0.25;
    lightDir.normalize();

    skyUniforms.top.value.copy(tmp.top);
    skyUniforms.horizon.value.copy(tmp.horizon);
    skyUniforms.sunDir.value.copy(lightDir);
    skyUniforms.sunColor.value.copy(tmp.light).multiplyScalar(isNight ? 0.35 : 1);
    skyUniforms.sunSize.value = isNight ? 0.9997 : 0.9993;
    scene.fog.color.copy(tmp.horizon);
    hemi.color.copy(tmp.hemiSky);
    hemi.groundColor.copy(tmp.hemiGround);
    hemi.intensity = k.hemi;
    sun.color.copy(tmp.light);
    sun.intensity = k.sun;
    sun.position.copy(focus).addScaledVector(lightDir, 120);
    sun.target.position.copy(focus);
    sky.position.copy(focus);
    stars.position.copy(focus);
    currentNight = smooth(0.1, -0.2, elev);
    starMat.opacity = currentNight * 0.9;
    for (const g of nightGlow) g.mat.emissiveIntensity = g.day + (g.night - g.day) * currentNight;
  }

  return { group, ground, update, sun, get night() { return currentNight; } };
}

function buildTown(group, terrain, quality, nightGlow) {
  const town = terrain.zone.town;
  const baseY = town.height;
  const stone = '#6c665d', plaster = '#cfc2a4', timber = '#4b3524', slate = '#4b505b', thatch = '#8c7446';
  const windowMat = new THREE.MeshStandardMaterial({ color: '#2b2118', emissive: '#ffb45e', emissiveIntensity: 0.2, roughness: 0.6 });
  nightGlow.push({ mat: windowMat, day: 0.05, night: 1.8 });
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, flatShading: true });

  for (const b of town.buildings) {
    const parts = [];
    const { w, d, h } = b;
    parts.push({ geo: new THREE.BoxGeometry(w + 0.3, 1.0, d + 0.3), color: stone, pos: [0, 0.5, 0] });
    parts.push({ geo: new THREE.BoxGeometry(w, h - 1, d), color: plaster, pos: [0, 1 + (h - 1) / 2, 0] });
    // Timber frame: corner posts and a mid band.
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      parts.push({ geo: new THREE.BoxGeometry(0.28, h - 1, 0.28), color: timber, pos: [sx * w / 2, 1 + (h - 1) / 2, sz * d / 2] });
    }
    parts.push({ geo: new THREE.BoxGeometry(w + 0.1, 0.22, d + 0.1), color: timber, pos: [0, 1 + (h - 1) * 0.55, 0] });
    parts.push({ geo: new THREE.BoxGeometry(w + 0.1, 0.22, d + 0.1), color: timber, pos: [0, h, 0] });
    const roofColor = b.id === 'smithy' || b.id === 'hall' ? slate : thatch;
    if (b.roof === 'shed') {
      parts.push({ geo: new THREE.BoxGeometry(w + 1.2, 0.35, d + 1.2), color: roofColor, pos: [0, h + 0.8, 0], rot: [0.18, 0, 0] });
    } else {
      parts.push({ geo: gableRoof(w + 1.2, d + 1.0, Math.min(w, d) * 0.45 + 1), color: roofColor, pos: [0, h, 0] });
    }
    if (b.id === 'inn' || b.id === 'smithy' || b.id === 'house1') {
      parts.push({ geo: new THREE.BoxGeometry(0.9, 2.6, 0.9), color: stone, pos: [w * 0.28, h + 1.2, -d * 0.2] });
    }
    // Door faces the plaza.
    const doorSide = b.z > 0 ? -1 : 1;
    parts.push({ geo: new THREE.BoxGeometry(1.4, 2.3, 0.2), color: '#3a2a1c', pos: [0, 1.15 + 0.5, doorSide * (d / 2 + 0.05)] });
    const mesh = new THREE.Mesh(mergeColored(parts), mat);
    mesh.position.set(town.x + b.x, baseY - 0.05, town.z + b.z);
    mesh.castShadow = quality.shadows;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Windows glow at night.
    for (const sx of [-0.3, 0.3]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.12), windowMat);
      win.position.set(town.x + b.x + sx * w, baseY + 1 + (h - 1) * 0.75, town.z + b.z + doorSide * (d / 2 + 0.03));
      group.add(win);
    }
  }

  // Palisade: sharpened posts around the town, broken by gates.
  const postGeo = mergeColored([
    { geo: new THREE.CylinderGeometry(0.2, 0.24, 3.0, 6), color: '#5b4330', pos: [0, 1.5, 0] },
    { geo: new THREE.ConeGeometry(0.2, 0.6, 6), color: '#6b513a', pos: [0, 3.3, 0] },
  ]);
  const postsPos = [];
  for (const s of terrain.palisade) {
    const len = Math.hypot(s.bx - s.ax, s.bz - s.az);
    const n = Math.max(1, Math.round(len / 0.46));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      postsPos.push([s.ax + (s.bx - s.ax) * t, s.az + (s.bz - s.az) * t]);
    }
  }
  const posts = new THREE.InstancedMesh(postGeo, mat, postsPos.length);
  const dummy = new THREE.Object3D();
  const r = mulberry32(8);
  postsPos.forEach(([x, z], i) => {
    dummy.position.set(x, terrain.heightAt(x, z) - 0.2, z);
    dummy.rotation.set((r() - 0.5) * 0.06, r() * 6, (r() - 0.5) * 0.06);
    dummy.scale.set(1, 0.9 + r() * 0.25, 1);
    dummy.updateMatrix();
    posts.setMatrixAt(i, dummy.matrix);
  });
  posts.castShadow = quality.shadows;
  group.add(posts);

  // Gate towers and banners.
  const bannerTex = canvasTexture(64, (ctx, s) => {
    ctx.fillStyle = '#6e2a22'; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#d9b77e';
    ctx.beginPath(); ctx.moveTo(s / 2, s * 0.18); ctx.quadraticCurveTo(s * 0.78, s * 0.5, s / 2, s * 0.82);
    ctx.quadraticCurveTo(s * 0.22, s * 0.5, s / 2, s * 0.18); ctx.fill();
    ctx.fillStyle = '#ffdf9e'; ctx.beginPath(); ctx.arc(s / 2, s * 0.58, s * 0.1, 0, Math.PI * 2); ctx.fill();
  });
  const bannerMat = new THREE.MeshStandardMaterial({ map: bannerTex, side: THREE.DoubleSide, roughness: 0.9 });
  const towerGeo = mergeColored([
    { geo: new THREE.BoxGeometry(2.2, 5.5, 2.2), color: '#5b4330', pos: [0, 2.75, 0] },
    { geo: new THREE.BoxGeometry(2.8, 0.4, 2.8), color: '#4b3524', pos: [0, 5.6, 0] },
    { geo: new THREE.ConeGeometry(2.1, 1.8, 4), color: slate, pos: [0, 6.7, 0], rot: [0, Math.PI / 4, 0] },
  ]);
  for (const g of town.gates) {
    for (const side of [-1, 1]) {
      const a = g.angle + side * (g.width / 2 + 0.02);
      const x = town.x + Math.cos(a) * town.palisadeRadius, z = town.z + Math.sin(a) * town.palisadeRadius;
      const tower = new THREE.Mesh(towerGeo, mat);
      tower.position.set(x, terrain.heightAt(x, z) - 0.2, z);
      tower.rotation.y = -a;
      tower.castShadow = quality.shadows;
      group.add(tower);
      const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.2), bannerMat);
      const bx = town.x + Math.cos(a) * (town.palisadeRadius + 1.15), bz = town.z + Math.sin(a) * (town.palisadeRadius + 1.15);
      banner.position.set(bx, terrain.heightAt(x, z) + 3.6, bz);
      banner.rotation.y = -a + Math.PI / 2;
      group.add(banner);
    }
  }

  // The Ember Brazier at the heart of the plaza.
  const brazier = new THREE.Mesh(mergeColored([
    { geo: new THREE.CylinderGeometry(2.4, 2.7, 0.6, 10), color: '#5e5850', pos: [0, 0.3, 0] },
    { geo: new THREE.CylinderGeometry(0.5, 0.8, 1.6, 8), color: '#4a443d', pos: [0, 1.4, 0] },
    { geo: new THREE.CylinderGeometry(1.3, 0.6, 0.7, 10, 1, true), color: '#3b2a1c', pos: [0, 2.5, 0] },
  ]), mat);
  brazier.position.set(town.x, baseY, town.z);
  brazier.castShadow = quality.shadows;
  group.add(brazier);
  const emberMat = new THREE.MeshStandardMaterial({ color: '#ff9a4a', emissive: '#ff7a2a', emissiveIntensity: 2.2, roughness: 0.4 });
  const ember = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 1), emberMat);
  ember.position.set(town.x, baseY + 2.7, town.z);
  group.add(ember);
  const fire = new THREE.PointLight('#ff9a4a', 30, 26, 1.6);
  fire.position.set(town.x, baseY + 3.4, town.z);
  group.add(fire);
  group.userData.fire = fire;
  group.userData.ember = ember;

  const forge = new THREE.PointLight('#ff7a3a', 12, 12, 1.8);
  const smithy = town.buildings.find((b) => b.id === 'smithy');
  forge.position.set(town.x + smithy.x - 2, baseY + 1.5, town.z + smithy.z + smithy.d / 2 + 1.2);
  group.add(forge);

  // A few props so the plaza reads as lived-in.
  const crate = mergeColored([{ geo: new THREE.BoxGeometry(0.9, 0.9, 0.9), color: '#7a5a38', pos: [0, 0.45, 0] }]);
  const barrel = mergeColored([{ geo: new THREE.CylinderGeometry(0.42, 0.42, 1.0, 10), color: '#6b4a2e', pos: [0, 0.5, 0] },
    { geo: new THREE.CylinderGeometry(0.44, 0.44, 0.08, 10), color: '#3b3b3b', pos: [0, 0.75, 0] }]);
  const props = [[crate, 11, 11], [crate, 11.8, 11.6], [barrel, 12.6, 10.4], [barrel, 9.5, -12.5], [crate, -7.5, -11.2], [barrel, -21, -8.6], [crate, 21.5, 7], [barrel, 3.5, -22]];
  for (const [geo, x, z] of props) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(town.x + x, baseY, town.z + z);
    m.rotation.y = x * 1.3;
    m.castShadow = quality.shadows;
    group.add(m);
  }
}
