// Visual effects: projectiles, hit sparks, skill visuals, boss telegraphs,
// level-up light. Each effect is short-lived and owns its own transparent
// material so it can fade independently.
import * as THREE from '/vendor/three/three.module.js';

const GEO = {
  spark: new THREE.TetrahedronGeometry(0.07, 0),
  orb: new THREE.IcosahedronGeometry(0.22, 1),
  ring: new THREE.RingGeometry(0.85, 1, 48),
  disc: new THREE.CircleGeometry(1, 48),
  lance: (() => { const g = new THREE.OctahedronGeometry(0.2, 0); g.scale(0.6, 0.6, 3.2); return g; })(),
  spike: (() => { const g = new THREE.ConeGeometry(0.12, 1.1, 5); g.translate(0, 0.55, 0); return g; })(),
  pillar: new THREE.CylinderGeometry(0.9, 0.9, 8, 24, 1, true),
  arc: new THREE.RingGeometry(1.2, 3.4, 24, 1, -Math.PI * 0.35, Math.PI * 0.7),
};

const glow = (color, opacity = 1) => new THREE.MeshBasicMaterial({
  color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
});

export class Fx {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;
    this.items = [];
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  add(obj, life, update) {
    this.scene.add(obj);
    this.items.push({ obj, life, age: 0, update });
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.age += dt;
      const k = it.age / it.life;
      if (k >= 1) {
        this.scene.remove(it.obj);
        it.obj.traverse((o) => { if (o.material && o.material !== it.shared) o.material.dispose?.(); });
        this.items.splice(i, 1);
        continue;
      }
      it.update?.(k, dt, it);
    }
  }

  groundY(x, z) { return this.terrain.heightAt(x, z) + 0.06; }

  sparks(pos, color = '#ffd9a0', count = 10, speed = 4) {
    if (this.reduced) count = Math.ceil(count / 3);
    const g = new THREE.Group();
    const m = glow(color);
    const parts = [];
    for (let i = 0; i < count; i++) {
      const s = new THREE.Mesh(GEO.spark, m);
      s.position.copy(pos);
      const v = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.9 + 0.3, Math.random() - 0.5).normalize().multiplyScalar(speed * (0.5 + Math.random()));
      parts.push([s, v]);
      g.add(s);
    }
    this.add(g, 0.55, (k, dt) => {
      for (const [s, v] of parts) { v.y -= 9 * dt; s.position.addScaledVector(v, dt); s.rotation.x += dt * 10; }
      m.opacity = 1 - k;
    });
  }

  projectile(from, toFn, kind, onHit) {
    const color = kind === 'ward_mote' ? '#b8f0a0' : kind === 'frost' ? '#bfeeff' : '#ffb25a';
    const obj = new THREE.Mesh(kind === 'frost' ? GEO.lance : GEO.orb, glow(color));
    const core = new THREE.Mesh(GEO.orb, glow('#ffffff', 0.9));
    core.scale.setScalar(0.45);
    obj.add(core);
    obj.position.copy(from);
    const dist = from.distanceTo(toFn());
    const life = Math.max(0.12, Math.min(0.5, dist / 32));
    let trail = 0;
    this.add(obj, life, (k, dt) => {
      const to = toFn();
      obj.position.lerpVectors(from, to, k);
      obj.lookAt(to);
      trail += dt;
      if (trail > 0.04) { trail = 0; this.sparks(obj.position.clone(), color, 2, 0.8); }
      if (k > 0.95 && onHit) { onHit(); onHit = null; }
    });
  }

  ringPulse(x, z, radius, color, life = 0.6, fill = false) {
    const m = glow(color, 0.9);
    const obj = new THREE.Mesh(fill ? GEO.disc : GEO.ring, m);
    obj.rotation.x = -Math.PI / 2;
    obj.position.set(x, this.groundY(x, z), z);
    this.add(obj, life, (k) => {
      obj.scale.setScalar(radius * (0.3 + 0.7 * Math.sqrt(k)));
      m.opacity = 0.9 * (1 - k);
    });
  }

  // Skill visuals keyed by SKILLS[].fx
  skill(fxId, caster, target) {
    const c = caster.position.clone();
    switch (fxId) {
      case 'arc': {
        const m = glow('#ffe1b0', 0.85);
        const obj = new THREE.Mesh(GEO.arc, m);
        obj.rotation.x = -Math.PI / 2;
        obj.rotation.z = -caster.rotation.y + Math.PI / 2;
        obj.position.set(c.x, c.y + 1.0, c.z);
        this.add(obj, 0.3, (k) => { m.opacity = 0.85 * (1 - k); obj.scale.setScalar(0.8 + k * 0.35); });
        break;
      }
      case 'aura_bronze':
        this.ringPulse(c.x, c.z, 2.2, '#e0b878', 0.8);
        this.pillar(c, '#e0b878', 0.7, 0.5);
        break;
      case 'smoke':
        this.sparks(c.clone().setY(c.y + 1), '#556070', 14, 3);
        break;
      case 'venom':
        if (target) this.sparks(target.position.clone().setY(target.position.y + 1), '#9ad64a', 12, 3);
        break;
      case 'fire_burst':
        if (target) {
          const p = target.position;
          this.ringPulse(p.x, p.z, 4.2, '#ff8a3a', 0.6, true);
          this.ringPulse(p.x, p.z, 4.6, '#ffd27a', 0.5);
          this.sparks(p.clone().setY(p.y + 0.5), '#ffb25a', 26, 7);
        }
        break;
      case 'heal':
        this.pillar((target || caster).position, '#9ff09a', 0.8, 0.35);
        this.sparks((target || caster).position.clone().setY((target || caster).position.y + 0.6), '#c8ffb0', 14, 2.5);
        break;
      case 'roots':
        if (target) this.roots(target.position);
        break;
      default:
        break;
    }
  }

  pillar(pos, color, life = 1.2, opacity = 0.5) {
    const m = glow(color, opacity);
    const obj = new THREE.Mesh(GEO.pillar, m);
    obj.position.set(pos.x, pos.y + 4, pos.z);
    this.add(obj, life, (k) => { m.opacity = opacity * (1 - k); obj.scale.set(1 - k * 0.5, 1, 1 - k * 0.5); });
  }

  roots(pos) {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: '#5a4a2a', roughness: 0.9, flatShading: true, transparent: true });
    for (let i = 0; i < 7; i++) {
      const s = new THREE.Mesh(GEO.spike, m);
      const a = (i / 7) * Math.PI * 2;
      s.position.set(pos.x + Math.cos(a) * 0.7, this.terrain.heightAt(pos.x, pos.z), pos.z + Math.sin(a) * 0.7);
      s.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
      g.add(s);
    }
    this.add(g, 3, (k) => {
      const grow = Math.min(1, k * 8);
      g.children.forEach((s) => s.scale.set(1, grow, 1));
      m.opacity = k > 0.85 ? (1 - k) / 0.15 : 1;
    });
  }

  telegraph(x, z, radius, duration) {
    const m = glow('#ff5a3a', 0.25);
    const fill = new THREE.Mesh(GEO.disc, m);
    fill.rotation.x = -Math.PI / 2;
    fill.position.set(x, this.groundY(x, z), z);
    const edgeMat = glow('#ff7a5a', 0.9);
    const edge = new THREE.Mesh(GEO.ring, edgeMat);
    edge.rotation.x = -Math.PI / 2;
    edge.position.copy(fill.position);
    edge.position.y += 0.01;
    edge.scale.setScalar(radius);
    const g = new THREE.Group();
    g.add(fill, edge);
    this.add(g, duration, (k) => {
      fill.scale.setScalar(radius * k);
      edgeMat.opacity = 0.6 + 0.4 * Math.sin(k * 30);
    });
  }

  levelUp(pos) {
    this.pillar(pos, '#8fd6e8', 1.6, 0.6);
    this.ringPulse(pos.x, pos.z, 3.5, '#d7f3fa', 1.0);
    this.sparks(pos.clone().setY(pos.y + 1), '#d7f3fa', 30, 5);
  }
}
