// App shell: renderer and world (alive for the whole page), the front-end
// screens (login, character select/create), and entering/leaving the game.
import * as THREE from '/vendor/three/three.module.js';
import { createTerrain } from '/shared/terrain.js';
import { ZONES, DEFAULT_ZONE } from '/shared/data/zones.js';
import { CLASSES, CLASS_IDS } from '/shared/data/classes.js';
import { buildWorld } from './scene/world.js';
import { buildHumanoid, animate } from './scene/models.js';
import { STARTER_KITS } from '/shared/data/items.js';
import { api, ApiError } from './api.js';
import { Connection } from './net.js';
import { Game } from './game.js';
import { settings, QUALITY, applyUiScale } from './settings.js';
import { initAudio } from './audio.js';

const $ = (id) => document.getElementById(id);

class App {
  constructor() {
    applyUiScale();
    this.canvas = $('world');
    this.canvas.tabIndex = 0;
    this.terrain = createTerrain(ZONES[DEFAULT_ZONE]);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 1200);
    this.createRenderer();
    this.world = buildWorld(this.scene, this.terrain, QUALITY[settings.quality]);
    this.clock = new THREE.Clock();
    this.game = null;
    this.attract = { angle: 0.6 };
    this.dayStart = performance.now() / 1000 - 0.42 * 1440; // late morning until the server tells us otherwise
    addEventListener('resize', () => this.resize());
    this.resize();
    this.buildPreview();
    this.loop();
    this.bindFront();
    requestAnimationFrame(() => $('boot').classList.add('done'));
  }

  createRenderer() {
    const q = QUALITY[settings.quality];
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: q.antialias, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.applyRendererQuality();
  }

  applyRendererQuality() {
    const q = QUALITY[settings.quality];
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, q.pixelRatio));
    this.renderer.shadowMap.enabled = q.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.camera.far = q.viewDistance + 900;
    this.camera.updateProjectionMatrix();
  }

  // Rebuild world geometry at the new quality. Antialiasing is fixed when the
  // WebGL context is created, so that one setting takes effect on reload.
  applyQuality() {
    this.applyRendererQuality();
    this.scene.remove(this.world.group);
    this.world = buildWorld(this.scene, this.terrain, QUALITY[settings.quality]);
    this.scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  }

  resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight, false);
  }

  loop() {
    const tick = () => {
      requestAnimationFrame(tick);
      const dt = Math.min(0.25, this.clock.getDelta());
      const time = this.clock.elapsedTime;
      let focus, phase;
      if (this.game) {
        this.game.update(dt, time);
        focus = this.game.player.position;
        phase = this.game.dayPhase;
      } else {
        // Attract mode: a slow pass over Emberford behind the menus.
        this.attract.angle += dt * 0.03;
        const a = this.attract.angle, town = this.terrain.zone.town;
        const cx = town.x + Math.cos(a) * 52, cz = town.z + Math.sin(a) * 52;
        this.camera.position.set(cx, this.terrain.heightAt(cx, cz) + 17, cz);
        this.camera.lookAt(town.x - Math.sin(a) * 6, town.height + 3, town.z + Math.cos(a) * 6);
        focus = new THREE.Vector3(town.x, town.height, town.z);
        phase = ((performance.now() / 1000 - this.dayStart) / 1440) % 1;
        if (this.preview) animate(this.preview, { attackT: 9, castT: 9, hitT: 9, speed: 0 }, dt, time);
      }
      this.world.update(dt, time, focus, phase);
      const ember = this.world.group.userData.ember;
      if (ember) {
        const fl = 0.85 + Math.sin(time * 9.1) * 0.08 + Math.sin(time * 23.7) * 0.05;
        this.world.group.userData.fire.intensity = 30 * fl;
        ember.scale.setScalar(0.95 + fl * 0.1);
      }
      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }

  // A character model standing by the brazier for the select/create screens.
  buildPreview(cls = 'vanguard') {
    if (this.previewRoot) this.scene.remove(this.previewRoot);
    this.preview = buildHumanoid({ cls, weaponDef: STARTER_KITS[cls].weapon });
    this.previewRoot = this.preview.root;
    this.previewRoot.position.set(4.5, this.terrain.heightAt(4.5, 4.5), 4.5);
    this.previewRoot.visible = false;
    this.scene.add(this.previewRoot);
  }

  // ---- Front end --------------------------------------------------------------
  show(screen) {
    for (const id of ['screen-login', 'screen-select', 'screen-create']) $(id).hidden = id !== screen;
    $('front').hidden = false;
    if (this.previewRoot) this.previewRoot.visible = screen !== 'screen-login';
    const first = $(screen).querySelector('input, button');
    if (first) setTimeout(() => first.focus(), 0);
  }

  formError(form, msg) {
    const p = form.querySelector('.form-error') || form.parentElement.querySelector('.form-error');
    p.textContent = msg || '';
    p.hidden = !msg;
  }

  async refreshServerLine() {
    const line = $('server-line');
    try {
      const s = await api.status();
      line.innerHTML = '';
      const dot = document.createElement('span');
      dot.className = 'dot on';
      line.append(dot, `${s.name}, ${s.online} online, version ${s.version}`);
    } catch {
      line.innerHTML = '';
      const dot = document.createElement('span');
      dot.className = 'dot off';
      line.append(dot, 'Server unreachable. Start it with npm start.');
    }
  }

  bindFront() {
    this.refreshServerLine();
    setInterval(() => { if (!this.game) this.refreshServerLine(); }, 15000);

    const login = $('login-form'), register = $('register-form');
    $('show-register').addEventListener('click', () => { login.hidden = true; register.hidden = false; register.querySelector('input').focus(); });
    $('show-login').addEventListener('click', () => { register.hidden = true; login.hidden = false; login.querySelector('input').focus(); });

    login.addEventListener('submit', async (e) => {
      e.preventDefault();
      initAudio();
      const f = new FormData(login);
      this.formError(login, '');
      const btn = login.querySelector('[type=submit]');
      btn.disabled = true;
      try {
        await api.login(String(f.get('username')), String(f.get('password')));
        login.reset();
        await this.openSelect();
      } catch (err) {
        this.formError(login, err.message);
      } finally { btn.disabled = false; }
    });

    register.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(register);
      const u = String(f.get('username')), p = String(f.get('password'));
      if (!/^[A-Za-z0-9_]{3,20}$/.test(u)) return this.formError(register, 'Account names are 3–20 letters, digits or underscores.');
      if (p.length < 8) return this.formError(register, 'Passwords need at least 8 characters.');
      if (p !== f.get('password2')) return this.formError(register, 'The passwords do not match.');
      this.formError(register, '');
      const btn = register.querySelector('[type=submit]');
      btn.disabled = true;
      try {
        await api.register(u, p);
        await api.login(u, p);
        register.reset();
        register.hidden = true; login.hidden = false;
        await this.openSelect();
      } catch (err) {
        this.formError(register, err.message);
      } finally { btn.disabled = false; }
    });

    $('logout').addEventListener('click', async () => {
      await api.logout().catch(() => {});
      this.show('screen-login');
    });
    $('new-char').addEventListener('click', () => this.openCreate());
    $('cancel-create').addEventListener('click', () => this.openSelect());
    $('enter-world').addEventListener('click', () => { if (this.selected) this.enterWorld(this.selected); });

    const opts = $('class-options');
    for (const id of CLASS_IDS) {
      const c = CLASSES[id];
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio'; input.name = 'cls'; input.value = id; input.required = true;
      input.addEventListener('change', () => {
        this.buildPreview(id);
        this.previewRoot.visible = true;
      });
      const n = document.createElement('span'); n.className = 'cl-name'; n.textContent = c.name;
      const r = document.createElement('span'); r.className = 'cl-role'; r.textContent = c.role;
      const b = document.createElement('span'); b.className = 'cl-blurb'; b.textContent = c.blurb;
      label.append(input, n, r, b);
      opts.append(label);
    }
    opts.querySelector('input').checked = true;

    const create = $('create-form');
    create.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(create);
      const name = String(f.get('name') || '');
      if (!/^[A-Za-z]{3,16}$/.test(name)) return this.formError(create, 'Names are 3–16 letters, with no spaces or digits.');
      const btn = create.querySelector('[type=submit]');
      btn.disabled = true;
      try {
        const r = await api.createCharacter(name, String(f.get('cls')));
        create.reset();
        opts.querySelector('input').checked = true;
        this.formError(create, '');
        await this.openSelect(r.character.id);
      } catch (err) {
        this.formError(create, err.message);
      } finally { btn.disabled = false; }
    });

    if (api.token()) this.openSelect().catch(() => this.show('screen-login'));
    else this.show('screen-login');
  }

  async openSelect(selectId) {
    let list;
    try { ({ characters: list } = await api.characters()); }
    catch (err) {
      if (err instanceof ApiError && err.status === 401) { this.show('screen-login'); return; }
      throw err;
    }
    this.show('screen-select');
    const ul = $('char-list');
    ul.textContent = '';
    this.selected = null;
    $('enter-world').disabled = true;
    if (!list.length) {
      const p = document.createElement('p');
      p.className = 'empty-note';
      p.textContent = 'No one yet. Create a character to begin in Emberford.';
      ul.append(p);
      $('new-char').focus();
      return;
    }
    const select = (c, btn) => {
      this.selected = c.id;
      for (const b of ul.querySelectorAll('button[aria-pressed]')) b.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-pressed', 'true');
      $('enter-world').disabled = false;
      this.buildPreview(c.class);
      this.previewRoot.visible = true;
    };
    for (const c of list) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', 'false');
      const crest = document.createElement('span'); crest.className = 'crest'; crest.textContent = CLASSES[c.class].name[0];
      const info = document.createElement('span');
      const nm = document.createElement('div'); nm.className = 'cname'; nm.textContent = c.name;
      const meta = document.createElement('div'); meta.className = 'cmeta'; meta.textContent = `Level ${c.level} ${CLASSES[c.class].name}`;
      info.append(nm, meta);
      const del = document.createElement('span');
      del.className = 'del'; del.textContent = 'Delete'; del.setAttribute('role', 'button'); del.tabIndex = 0;
      btn.append(crest, info, del);
      btn.addEventListener('click', (e) => {
        if (e.target === del) return;
        select(c, btn);
      });
      btn.addEventListener('dblclick', (e) => { if (e.target !== del) this.enterWorld(c.id); });
      const doDelete = async (e) => {
        e.stopPropagation();
        if (!confirm(`Delete ${c.name} permanently?`)) return;
        try { await api.deleteCharacter(c.id); await this.openSelect(); }
        catch (err) { this.formError($('screen-select'), err.message); }
      };
      del.addEventListener('click', doDelete);
      del.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') doDelete(e); });
      li.append(btn);
      ul.append(li);
      if (c.id === selectId || (!selectId && c === list[0])) select(c, btn);
    }
    ul.querySelector('button[aria-pressed=true]')?.focus();
  }

  openCreate() {
    this.show('screen-create');
    this.buildPreview(new FormData($('create-form')).get('cls') || 'vanguard');
    this.previewRoot.visible = true;
  }

  // ---- In-world ---------------------------------------------------------------
  enterWorld(characterId) {
    const errBox = $('screen-select');
    this.formError(errBox, '');
    $('enter-world').disabled = true;
    const conn = new Connection({
      token: api.token(),
      characterId,
      onMessage: (msg) => {
        if (msg.t === 'welcome' && !this.game) {
          this.startGame(conn, msg);
          return;
        }
        if (this.game) this.game.handle(msg);
        else if (msg.t === 'error') this.formError(errBox, msg.message);
      },
      onState: (state, detail) => {
        const rc = $('reconnect');
        if (state === 'online') { rc.hidden = true; return; }
        if (state === 'reconnecting' && this.game) {
          rc.hidden = false;
          $('reconnect-text').textContent = `Reconnecting (attempt ${detail.attempt})…`;
          return;
        }
        if (state === 'closed') {
          rc.hidden = true;
          if (this.game) this.leaveGame(detail?.code === 'AUTH' ? 'login' : 'select', detail?.message);
          else {
            this.formError(errBox, detail?.message || 'Could not connect.');
            $('enter-world').disabled = false;
          }
        }
      },
    });
    this.conn = conn;
    conn.open();
    $('reconnect-give-up').onclick = () => this.leaveGame('login');
  }

  startGame(conn, welcome) {
    $('front').hidden = true;
    if (this.previewRoot) this.previewRoot.visible = false;
    $('hud').hidden = false;
    this.game = new Game({ app: this, scene: this.scene, camera: this.camera, renderer: this.renderer, terrain: this.terrain, connection: conn, welcome });
    this.canvas.focus();
  }

  async leaveGame(where, message) {
    if (this.conn) { this.conn.close(); this.conn = null; }
    if (this.game) { this.game.destroy(); this.game = null; }
    $('hud').hidden = true;
    $('enter-world').disabled = false;
    if (where === 'login') {
      await api.logout().catch(() => {});
      this.show('screen-login');
      if (message) this.formError($('login-form'), message);
    } else {
      await this.openSelect().catch(() => this.show('screen-login'));
      if (message) this.formError($('screen-select'), message);
    }
  }
}

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

if (hasWebGL()) {
  window.shardveil = new App();
} else {
  $('boot').querySelector('p').textContent = 'Shardveil needs WebGL. Please update your browser or graphics drivers.';
}
