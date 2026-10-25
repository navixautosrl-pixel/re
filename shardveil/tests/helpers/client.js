// A headless protocol client for integration tests. It speaks the real wire
// protocol to a real server over a real socket, and moves at legal speed.
import WebSocket from 'ws';
import { PROTOCOL_VERSION } from '../../shared/protocol.js';
import { PROGRESSION } from '../../shared/data/progression.js';
import { CLASSES } from '../../shared/data/classes.js';

export async function api(base, method, path, body, token) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
}

export async function createAccountWithCharacter(base, username, cls, name) {
  await api(base, 'POST', '/api/register', { username, password: 'correct-horse-9' });
  const login = await api(base, 'POST', '/api/login', { username, password: 'correct-horse-9' });
  const token = login.body.token;
  const created = await api(base, 'POST', '/api/characters', { name, cls }, token);
  return { token, characterId: created.body.character.id };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class TestClient {
  constructor(base) {
    this.wsUrl = base.replace(/^http/, 'ws') + '/ws';
    this.messages = [];
    this.waiters = [];
    this.entities = { p: new Map(), m: new Map(), l: new Map() };
    this.events = [];
    this.inventory = [];
    this.you = null;
    this.self = null;
  }

  connect(token, characterId) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', () => this.send({ t: 'hello', v: PROTOCOL_VERSION, token, characterId }));
      this.ws.on('message', (d) => this.onMessage(JSON.parse(d.toString())));
      this.ws.on('error', reject);
      this.closed = new Promise((r) => this.ws.on('close', (code) => r(code)));
      this.waitFor((m) => m.t === 'welcome' || m.t === 'error', 5000).then((m) => {
        if (m.t === 'error') reject(new Error(m.message));
        else resolve(m);
      }, reject);
    });
  }

  onMessage(m) {
    this.messages.push(m);
    if (m.t === 'welcome') {
      this.welcome = m;
      this.id = m.you;
      this.x = m.character.x; this.z = m.character.z;
      this.inventory = m.inventory;
    } else if (m.t === 'snap') {
      for (const k of ['p', 'm', 'l']) {
        const map = this.entities[k];
        const ids = new Set();
        for (const e of m[k]) { ids.add(e.i); map.set(e.i, { ...(map.get(e.i) || {}), ...e }); }
        for (const id of map.keys()) if (!ids.has(id)) map.delete(id);
      }
      this.you = m.you;
    } else if (m.t === 'ev') {
      this.events.push(...m.e);
    } else if (m.t === 'inv') {
      this.inventory = m.items;
    } else if (m.t === 'self') {
      this.self = m;
    } else if (m.t === 'correct') {
      this.x = m.x; this.z = m.z;
      this.corrections = (this.corrections || 0) + 1;
    }
    for (const w of [...this.waiters]) {
      if (w.pred(m)) { this.waiters.splice(this.waiters.indexOf(w), 1); w.resolve(m); }
    }
  }

  // includePast: also match messages that already arrived (newest first).
  waitFor(pred, timeout = 5000, includePast = false) {
    if (includePast) {
      const hit = [...this.messages].reverse().find(pred);
      if (hit) return Promise.resolve(hit);
    }
    return new Promise((resolve, reject) => {
      const w = { pred, resolve };
      this.waiters.push(w);
      setTimeout(() => {
        const i = this.waiters.indexOf(w);
        if (i >= 0) { this.waiters.splice(i, 1); reject(new Error('waitFor timed out')); }
      }, timeout);
    });
  }

  send(m) { this.ws.send(JSON.stringify(m)); }

  // Walk in a straight line at 95% of the legal run speed, 10 updates/second.
  async walkTo(tx, tz, stopAt = 0.5) {
    const speed = PROGRESSION.moveSpeed * 0.95;
    const maxSteps = Math.ceil(Math.hypot(tx - this.x, tz - this.z) / (speed * 0.1)) + 30;
    const startCorrections = this.corrections || 0;
    for (let i = 0; i < maxSteps; i++) {
      if (this.you?.d || (this.corrections || 0) - startCorrections > 10) return false;
      const dx = tx - this.x, dz = tz - this.z;
      const d = Math.hypot(dx, dz);
      if (d <= stopAt) return true;
      const step = Math.min(d - stopAt, speed * 0.1);
      this.x += (dx / d) * step;
      this.z += (dz / d) * step;
      this.send({ t: 'move', x: this.x, z: this.z, ry: Math.atan2(dx, dz) });
      await sleep(100);
    }
    return false;
  }

  nearestMonster(defId) {
    let best = null, bd = Infinity;
    for (const m of this.entities.m.values()) {
      if (m.d || (defId && m.df !== defId)) continue;
      const d = Math.hypot(m.x - this.x, m.z - this.z);
      if (d < bd) { best = m; bd = d; }
    }
    return best;
  }

  // Chase and basic-attack a monster until it dies. Returns true on kill.
  async fight(monsterId, cls, timeoutMs = 60000) {
    const basic = CLASSES[cls].basic;
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) {
      const m = this.entities.m.get(monsterId);
      if (!m || m.d) return this.events.some((e) => e.k === 'die' && e.t === monsterId);
      const d = Math.hypot(m.x - this.x, m.z - this.z);
      if (d > basic.range) {
        const speed = PROGRESSION.moveSpeed * 0.95;
        const step = Math.min(d - basic.range * 0.7, speed * 0.1);
        this.x += ((m.x - this.x) / d) * step;
        this.z += ((m.z - this.z) / d) * step;
        this.send({ t: 'move', x: this.x, z: this.z, ry: 0 });
      } else {
        this.send({ t: 'attack', target: monsterId });
      }
      await sleep(100);
    }
    return false;
  }

  close() {
    this.ws.close();
    return this.closed;
  }
}

export { sleep };
