// In-game interface: unit frames, action bar, XP, chat, pack/character
// windows with drag and drop, tooltips, settings, nameplates, floating combat
// text and the minimap. DOM-based so text stays crisp at any UI scale.
import * as THREE from '/vendor/three/three.module.js';
import { CLASSES, SKILLS } from '/shared/data/classes.js';
import { ITEMS, RARITIES, EQUIP_SLOTS, isEquipment, canClassUse } from '/shared/data/items.js';
import { MONSTERS } from '/shared/data/monsters.js';
import { PROGRESSION } from '/shared/data/progression.js';
import { computeStats } from '/shared/stats.js';
import { itemIcon, skillIcon, paint } from './icons.js';
import { settings, saveSettings, ACTIONS, keyLabel, resetBindings, applyUiScale } from '../settings.js';
import { setVolume, sfx } from '../audio.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};
const SLOT_LABELS = { weapon: 'Weapon', head: 'Head', body: 'Body', feet: 'Feet', ring: 'Ring' };
const STATUS_NAMES = { poison: 'Poisoned', slow: 'Slowed', root: 'Rooted', iron_will: 'Iron Will' };

export class Hud {
  constructor(game) {
    this.game = game;
    this.root = $('hud');
    this.labels = $('labels');
    this.plates = new Map();
    this.floaters = [];
    this.v = new THREE.Vector3();
    this.chatFilter = 'all';
    this.buildActionBar();
    this.buildInventory();
    this.buildCharacter();
    this.buildChat();
    this.buildSettings();
    this.bindWindows();
    $('revive').addEventListener('click', () => game.send({ t: 'revive' }));
    setTimeout(() => $('help-hint').classList.add('fade'), 25000);
  }

  // ---- Action bar -----------------------------------------------------------
  buildActionBar() {
    const bar = $('actionbar');
    bar.textContent = '';
    this.slots = [];
    const cls = this.game.me.cls;
    const defs = [
      { action: 'attack', kind: 'basic', icon: skillIcon('basic', cls), name: 'Attack' },
      { action: 'slot1', kind: 'skill', skill: CLASSES[cls].skills[0] },
      { action: 'slot2', kind: 'skill', skill: CLASSES[cls].skills[1] },
      { sep: true },
      { action: 'slot3', kind: 'potion', item: 'hp_draught' },
      { action: 'slot4', kind: 'potion', item: 'mp_draught' },
    ];
    for (const d of defs) {
      if (d.sep) { bar.append(el('div', 'sep')); continue; }
      const b = el('button', 'slot');
      b.type = 'button';
      const cv = el('canvas');
      paint(cv, d.icon || (d.skill ? skillIcon(d.skill, cls) : itemIcon(d.item)));
      const key = el('span', 'key');
      const cd = el('span', 'cd'), cdt = el('span', 'cdt'), qty = el('span', 'qty');
      b.append(cv, cd, cdt, key, qty);
      b.addEventListener('click', () => this.game.triggerAction(d.action));
      b.addEventListener('mouseenter', (e) => this.showTooltip(e, d.skill ? this.skillTooltip(d.skill) : d.item ? this.itemTooltip({ defId: d.item }) : this.basicTooltip()));
      b.addEventListener('mouseleave', () => this.hideTooltip());
      bar.append(b);
      this.slots.push({ ...d, el: b, cd, cdt, key, qty });
    }
    this.refreshKeyLabels();
  }

  refreshKeyLabels() {
    for (const s of this.slots) s.key.textContent = keyLabel(settings.bindings[s.action]);
  }

  flashSlot(action) {
    const s = this.slots.find((x) => x.action === action);
    if (!s) return;
    s.el.classList.remove('flash');
    void s.el.offsetWidth;
    s.el.classList.add('flash');
  }

  // ---- Inventory --------------------------------------------------------------
  buildInventory() {
    const grid = $('inv-grid');
    grid.textContent = '';
    this.bagEls = [];
    for (let i = 0; i < PROGRESSION.inventorySlots; i++) {
      const s = el('button', 'slot');
      s.type = 'button';
      s.dataset.bag = i;
      s.setAttribute('aria-label', `Pack slot ${i + 1}`);
      s.append(el('canvas'), el('span', 'qty'));
      this.wireItemSlot(s, () => this.bagItem(i), { bag: i });
      grid.append(s);
      this.bagEls.push(s);
    }
  }

  buildCharacter() {
    const grid = $('equip-grid');
    grid.textContent = '';
    this.equipEls = {};
    for (const slot of EQUIP_SLOTS) {
      const row = el('div', 'eslot');
      const s = el('button', 'slot');
      s.type = 'button';
      s.setAttribute('aria-label', `${SLOT_LABELS[slot]} slot`);
      s.append(el('canvas'));
      this.wireItemSlot(s, () => this.equipItem(slot), { equip: slot });
      row.append(s, el('span', null, SLOT_LABELS[slot]));
      grid.append(row);
      this.equipEls[slot] = s;
    }
  }

  bagItem(i) { return this.game.inventory.find((it) => it.container === 'bag' && it.slot === i); }
  equipItem(slot) { return this.game.inventory.find((it) => it.container === 'equip' && it.slot === EQUIP_SLOTS.indexOf(slot)); }

  wireItemSlot(s, getItem, where) {
    s.draggable = true;
    s.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const it = getItem();
      if (!it) return;
      if (where.equip) this.game.send({ t: 'unequip', slot: where.equip });
      else if (ITEMS[it.defId]?.type === 'consumable') this.game.send({ t: 'use', slot: it.slot });
      else if (isEquipment(ITEMS[it.defId])) this.game.send({ t: 'equip', slot: it.slot });
      sfx.ui();
      this.hideTooltip();
    });
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); s.dispatchEvent(new MouseEvent('contextmenu')); }
    });
    s.addEventListener('dragstart', (e) => {
      const it = getItem();
      if (!it) { e.preventDefault(); return; }
      e.dataTransfer.setData('text/plain', JSON.stringify(where));
      e.dataTransfer.effectAllowed = 'move';
      this.dragging = where;
      this.hideTooltip();
    });
    s.addEventListener('dragend', (e) => {
      // Dropped outside any window: offer to destroy (bag items only).
      if (this.dragging && e.dataTransfer.dropEffect === 'none' && where.bag !== undefined) {
        const over = document.elementFromPoint(e.clientX, e.clientY);
        if (over && over.id === 'world') this.confirmDestroy(where.bag);
      }
      this.dragging = null;
    });
    s.addEventListener('dragover', (e) => { e.preventDefault(); s.classList.add('drag-over'); });
    s.addEventListener('dragleave', () => s.classList.remove('drag-over'));
    s.addEventListener('drop', (e) => {
      e.preventDefault();
      s.classList.remove('drag-over');
      let from;
      try { from = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
      if (from.bag !== undefined && where.bag !== undefined && from.bag !== where.bag) this.game.send({ t: 'moveItem', from: from.bag, to: where.bag });
      else if (from.bag !== undefined && where.equip) this.game.send({ t: 'equip', slot: from.bag });
      else if (from.equip && where.bag !== undefined) this.game.send({ t: 'unequip', slot: from.equip });
      this.dragging = null;
    });
    s.addEventListener('mouseenter', (e) => { const it = getItem(); if (it) this.showTooltip(e, this.itemTooltip(it)); });
    s.addEventListener('mouseleave', () => this.hideTooltip());
  }

  confirmDestroy(bagSlot) {
    const it = this.bagItem(bagSlot);
    if (!it) return;
    const def = ITEMS[it.defId];
    const body = $('dlg-body');
    body.textContent = '';
    body.append(el('p', null, `Destroy ${def.name}${it.qty > 1 ? ` ×${it.qty}` : ''}? This cannot be undone.`));
    const row = el('div', 'row');
    const yes = el('button', 'btn primary', 'Destroy');
    const no = el('button', 'btn ghost', 'Keep it');
    yes.addEventListener('click', () => { this.game.send({ t: 'drop', slot: bagSlot }); this.closeWindow('win-dialog'); });
    no.addEventListener('click', () => this.closeWindow('win-dialog'));
    row.append(yes, no);
    body.append(row);
    $('dlg-title').textContent = 'Destroy item';
    this.openWindow('win-dialog');
    no.focus();
  }

  renderInventory() {
    const inv = this.game.inventory;
    for (let i = 0; i < this.bagEls.length; i++) {
      const s = this.bagEls[i];
      const it = inv.find((x) => x.container === 'bag' && x.slot === i);
      const cv = s.querySelector('canvas');
      s.className = 'slot' + (it ? ` r-${it.rarity}` : '');
      if (it) paint(cv, itemIcon(it.defId, it.rarity));
      else cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
      s.querySelector('.qty').textContent = it && it.qty > 1 ? it.qty : '';
      s.setAttribute('aria-label', it ? `${ITEMS[it.defId]?.name}${it.qty > 1 ? ' ×' + it.qty : ''}` : `Empty pack slot ${i + 1}`);
    }
    for (const slot of EQUIP_SLOTS) {
      const s = this.equipEls[slot];
      const it = this.equipItem(slot);
      const cv = s.querySelector('canvas');
      s.className = 'slot' + (it ? ` r-${it.rarity}` : '');
      if (it) paint(cv, itemIcon(it.defId, it.rarity));
      else cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
    }
    for (const sl of this.slots) {
      if (sl.kind !== 'potion') continue;
      const n = inv.filter((x) => x.defId === sl.item && x.container === 'bag').reduce((a, x) => a + x.qty, 0);
      sl.qty.textContent = n || '';
      sl.el.classList.toggle('locked', n === 0);
    }
    this.renderStats();
  }

  renderStats() {
    const me = this.game.me;
    const st = me.stats;
    $('inv-gold').textContent = `${me.gold ?? 0}`;
    if (!st) return;
    const dl = $('stat-list');
    dl.textContent = '';
    const rows = [
      ['Calling', CLASSES[me.cls].name], ['Level', me.level], null,
      ['Strength', st.str], ['Dexterity', st.dex], ['Intellect', st.int], ['Vitality', st.vit], null,
      ['Health', st.maxHp], ['Mana', st.maxMp], ['Attack', `${st.attack[0]}–${st.attack[1]}`],
      ['Spell power', `${st.magic[0]}–${st.magic[1]}`], ['Defense', st.defense], ['Critical', `${st.crit.toFixed(1)}%`],
    ];
    for (const r of rows) {
      if (!r) { dl.append(el('div', 'sep')); continue; }
      dl.append(el('dt', null, r[0]), el('dd', null, String(r[1])));
    }
  }

  // ---- Tooltips ---------------------------------------------------------------
  itemTooltip(it) {
    const def = ITEMS[it.defId];
    if (!def) return null;
    const me = this.game.me;
    const frag = document.createDocumentFragment();
    const rarity = RARITIES[it.rarity || 'common'];
    const name = el('div', 't-name', `${def.name}${it.upgrade ? ` +${it.upgrade}` : ''}`);
    name.style.color = rarity.color;
    frag.append(name);
    const sub = [rarity.name];
    if (def.slot) sub.push(SLOT_LABELS[def.slot]);
    else sub.push({ consumable: 'Consumable', material: 'Material', quest: 'Quest item' }[def.type] || def.type);
    frag.append(el('div', 't-sub', sub.join(', ')));
    if (def.levelReq && def.levelReq > 1) frag.append(el('div', def.levelReq > me.level ? 't-bad' : 't-sub', `Requires level ${def.levelReq}`));
    if (def.classes) frag.append(el('div', canClassUse(def, me.cls) ? 't-sub' : 't-bad', `${def.classes.map((c) => CLASSES[c].name).join(', ')} only`));
    const up = 1 + 0.07 * (it.upgrade || 0);
    const st = def.stats || {};
    if (st.attack) frag.append(el('div', 't-stat', `Attack ${Math.round(st.attack[0] * up)}–${Math.round(st.attack[1] * up)}`));
    if (st.magic) frag.append(el('div', 't-stat', `Spell power ${Math.round(st.magic[0] * up)}–${Math.round(st.magic[1] * up)}`));
    if (st.defense) frag.append(el('div', 't-stat', `Defense ${Math.round(st.defense * up)}`));
    if (st.hp) frag.append(el('div', 't-stat', `+${st.hp} Health`));
    if (st.mp) frag.append(el('div', 't-stat', `+${st.mp} Mana`));
    for (const [k, v] of Object.entries(it.affixes || {})) {
      const names = { str: 'Strength', dex: 'Dexterity', int: 'Intellect', vit: 'Vitality', hp: 'Health', mp: 'Mana', crit: 'Critical chance', defense: 'Defense' };
      frag.append(el('div', 't-affix', `+${v}${k === 'crit' ? '%' : ''} ${names[k] || k}`));
    }
    if (def.use?.heal) frag.append(el('div', 't-stat', `Restores ${def.use.heal} health`));
    if (def.use?.mana) frag.append(el('div', 't-stat', `Restores ${def.use.mana} mana`));
    if (def.description) frag.append(el('div', 't-desc', def.description));

    // Comparison against what's equipped in that slot.
    if (isEquipment(def) && it.container !== 'equip' && me.stats) {
      const eq = this.game.inventory.filter((x) => x.container === 'equip' && x.slot !== EQUIP_SLOTS.indexOf(def.slot))
        .map((x) => ({ defId: x.defId, affixes: x.affixes, upgrade: x.upgrade }));
      const withIt = computeStats(me.cls, me.level, [...eq, { defId: it.defId, affixes: it.affixes, upgrade: it.upgrade }]);
      const cur = me.stats;
      const diffs = [];
      const avg = (a) => (a[0] + a[1]) / 2;
      const d = (label, a, b) => { const x = Math.round((a - b) * 10) / 10; if (x) diffs.push([label, x]); };
      d('Attack', avg(withIt.attack), avg(cur.attack));
      d('Spell power', avg(withIt.magic), avg(cur.magic));
      d('Defense', withIt.defense, cur.defense);
      d('Health', withIt.maxHp, cur.maxHp);
      d('Mana', withIt.maxMp, cur.maxMp);
      d('Critical', withIt.crit, cur.crit);
      if (diffs.length) {
        frag.append(el('div', 't-sub', 'If equipped:'));
        for (const [label, x] of diffs) frag.append(el('div', x > 0 ? 't-better' : 't-worse', `${x > 0 ? '+' : ''}${x} ${label}`));
      }
    }
    if (def.value) frag.append(el('div', 't-sub', `Sells for ${def.value} gold`));
    return frag;
  }

  skillTooltip(id) {
    const sk = SKILLS[id];
    const frag = document.createDocumentFragment();
    frag.append(el('div', 't-name', sk.name));
    frag.append(el('div', 't-sub', `${sk.mana} mana, ${sk.cooldown}s cooldown${sk.range ? `, ${sk.range} m` : ''}`));
    if (sk.unlockLevel > this.game.me.level) frag.append(el('div', 't-bad', `Unlocks at level ${sk.unlockLevel}`));
    frag.append(el('div', 't-desc', sk.description));
    return frag;
  }

  basicTooltip() {
    const b = CLASSES[this.game.me.cls].basic;
    const frag = document.createDocumentFragment();
    frag.append(el('div', 't-name', 'Attack'));
    frag.append(el('div', 't-sub', `${b.kind === 'magical' ? 'Spell' : 'Weapon'} strike, ${b.range} m`));
    frag.append(el('div', 't-desc', 'Attacks your target repeatedly, moving into range if needed.'));
    return frag;
  }

  showTooltip(e, content) {
    if (!content) return;
    const tt = $('tooltip');
    tt.textContent = '';
    tt.append(content);
    tt.hidden = false;
    const r = e.currentTarget.getBoundingClientRect();
    const w = tt.offsetWidth, h = tt.offsetHeight;
    let x = r.right + 8, y = r.top;
    if (x + w > innerWidth - 8) x = r.left - w - 8;
    if (y + h > innerHeight - 8) y = innerHeight - h - 8;
    tt.style.left = `${Math.max(8, x)}px`;
    tt.style.top = `${Math.max(8, y)}px`;
  }
  hideTooltip() { $('tooltip').hidden = true; }

  // ---- Windows --------------------------------------------------------------
  bindWindows() {
    for (const w of document.querySelectorAll('.window')) {
      w.querySelector('[data-close]')?.addEventListener('click', () => this.closeWindow(w.id));
    }
  }
  toggleWindow(id) {
    const w = $(id);
    if (w.hidden) this.openWindow(id); else this.closeWindow(id);
  }
  openWindow(id) {
    $(id).hidden = false;
    if (id === 'win-inventory' || id === 'win-character') this.renderInventory();
    sfx.ui();
  }
  closeWindow(id) { $(id).hidden = true; this.hideTooltip(); }
  closeTopWindow() {
    const open = [...document.querySelectorAll('.window')].filter((w) => !w.hidden);
    if (!open.length) return false;
    this.closeWindow(open.at(-1).id);
    return true;
  }
  anyWindowOpen() { return [...document.querySelectorAll('.window')].some((w) => !w.hidden); }

  showDialog(title, paragraphs) {
    $('dlg-title').textContent = title;
    const body = $('dlg-body');
    body.textContent = '';
    for (const p of paragraphs) body.append(el('p', null, p));
    const close = el('button', 'btn', 'Farewell');
    close.addEventListener('click', () => this.closeWindow('win-dialog'));
    body.append(close);
    this.openWindow('win-dialog');
  }

  // ---- Chat -----------------------------------------------------------------
  buildChat() {
    const form = $('chat-form'), input = $('chat-input');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (text) this.game.send({ t: 'chat', channel: $('chat-channel').value, text });
      input.value = '';
      input.blur();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { input.value = ''; input.blur(); }
      e.stopPropagation();
    });
    for (const tab of document.querySelectorAll('.chat-tabs button')) {
      tab.addEventListener('click', () => {
        this.chatFilter = tab.dataset.ch;
        for (const t of document.querySelectorAll('.chat-tabs button')) t.setAttribute('aria-selected', String(t === tab));
        for (const li of $('chat-log').children) li.hidden = !this.chatVisible(li.dataset.ch);
      });
    }
  }
  chatVisible(ch) { return this.chatFilter === 'all' || ch === this.chatFilter || ch === 'system'; }
  focusChat() { $('chat-input').focus(); }
  chatLine(ch, from, text, kind) {
    const log = $('chat-log');
    const li = el('li', kind || ch);
    li.dataset.ch = from ? ch : 'system';
    if (from) { li.append(el('span', 'from', `${from}: `)); }
    li.append(document.createTextNode(text));
    li.hidden = !this.chatVisible(li.dataset.ch);
    const atBottom = log.scrollTop + log.clientHeight >= log.scrollHeight - 4;
    log.append(li);
    while (log.children.length > 150) log.firstChild.remove();
    if (atBottom) log.scrollTop = log.scrollHeight;
  }

  // ---- Settings -------------------------------------------------------------
  buildSettings() {
    const q = $('set-quality');
    q.value = settings.quality;
    q.addEventListener('change', () => { settings.quality = q.value; saveSettings(); this.game.applyQuality(); });
    const ui = $('set-uiscale'), uiOut = $('set-uiscale-out');
    ui.value = settings.uiScale; uiOut.textContent = `${Math.round(settings.uiScale * 100)}%`;
    ui.addEventListener('input', () => { settings.uiScale = Number(ui.value); uiOut.textContent = `${Math.round(settings.uiScale * 100)}%`; applyUiScale(); saveSettings(); });
    const vol = $('set-volume'), volOut = $('set-volume-out');
    vol.value = settings.volume; volOut.textContent = `${Math.round(settings.volume * 100)}%`;
    vol.addEventListener('input', () => { settings.volume = Number(vol.value); volOut.textContent = `${Math.round(settings.volume * 100)}%`; setVolume(settings.volume); saveSettings(); });
    const dmg = $('set-damage');
    dmg.checked = settings.damageNumbers;
    dmg.addEventListener('change', () => { settings.damageNumbers = dmg.checked; saveSettings(); });
    $('reset-bindings').addEventListener('click', () => { resetBindings(); this.renderBindings(); this.refreshKeyLabels(); });
    $('to-select').addEventListener('click', () => this.game.leave('select'));
    this.renderBindings();
  }

  renderBindings() {
    const box = $('bindings');
    box.textContent = '';
    for (const [id, label] of ACTIONS) {
      const b = el('button', null, keyLabel(settings.bindings[id]));
      b.type = 'button';
      b.addEventListener('click', () => {
        b.classList.add('listening');
        b.textContent = 'Press a key…';
        this.listening = (code) => {
          b.classList.remove('listening');
          this.listening = null;
          if (code !== 'Escape') {
            // A key can only do one thing: unbind it elsewhere first.
            for (const [other, key] of Object.entries(settings.bindings)) if (key === code && other !== id) settings.bindings[other] = null;
            settings.bindings[id] = code;
            saveSettings();
          }
          this.renderBindings();
          this.refreshKeyLabels();
        };
      });
      box.append(el('span', null, label), b);
    }
  }

  // ---- Notices ----------------------------------------------------------------
  notice(text, kind) {
    const n = el('div', `notice ${kind || ''}`, text);
    $('notices').append(n);
    setTimeout(() => n.remove(), 2600);
    while ($('notices').children.length > 4) $('notices').firstChild.remove();
  }
  banner(big, small) {
    const b = $('banner');
    b.textContent = '';
    b.append(el('div', 'big', big));
    if (small) b.append(el('div', 'small', small));
  }

  // ---- Floating combat text ---------------------------------------------------
  floatText(worldPos, text, cls) {
    if (!settings.damageNumbers && cls !== 'xp') return;
    const e = el('div', `dmg ${cls || ''}`, text);
    this.labels.append(e);
    this.floaters.push({ e, pos: worldPos.clone(), age: 0, dx: (Math.random() - 0.5) * 30 });
    if (this.floaters.length > 40) this.floaters.shift().e.remove();
  }

  // ---- Per-frame update -------------------------------------------------------
  update(dt) {
    const g = this.game, me = g.me;
    this.bar($('self-hp'), me.hp, me.mhp);
    this.bar($('self-mp'), me.mp, me.mmp);
    $('self-name').textContent = me.name;
    $('self-level').textContent = `Level ${me.level}`;
    this.chips($('self-buffs'), (me.buffs || []).map((b) => [b.id, `${STATUS_NAMES[b.id] || b.id} ${Math.ceil(b.r)}s`]));
    const xb = $('xpbar');
    const frac = me.xpn && Number.isFinite(me.xpn) ? me.xp / me.xpn : 1;
    xb.style.setProperty('--fill', String(Math.min(1, frac)));
    xb.querySelector('span').textContent = Number.isFinite(me.xpn) ? `${me.xp} / ${me.xpn} XP (${(frac * 100).toFixed(1)}%)` : 'Maximum level';

    const t = g.entities.get(g.targetId);
    const tf = $('target-frame');
    if (t && t.type !== 'loot') {
      tf.hidden = false;
      $('target-name').textContent = t.name + (t.def?.title ? `, ${t.def.title}` : '');
      $('target-level').textContent = t.level ? `Level ${t.level}` : '';
      tf.classList.toggle('elite', !!t.def?.elite);
      if (t.type === 'npc') { $('target-hp').hidden = true; }
      else { $('target-hp').hidden = false; this.bar($('target-hp'), t.hp, t.mh); }
      this.chips($('target-status'), (t.statuses || []).map((s) => [s, STATUS_NAMES[s] || s]));
    } else tf.hidden = true;

    // Cooldowns, mana and lock state on the action bar.
    const now = performance.now() / 1000;
    for (const s of this.slots) {
      let remain = 0, total = 1;
      if (s.kind === 'skill') {
        const sk = SKILLS[s.skill];
        remain = me.cd?.[s.skill] || 0; total = sk.cooldown;
        s.el.classList.toggle('locked', me.level < sk.unlockLevel);
        s.el.classList.toggle('nomana', me.mp < sk.mana);
      } else if (s.kind === 'basic') {
        remain = Math.max(0, g.basicReadyAt - now); total = CLASSES[me.cls].basic.cooldown;
        s.el.classList.toggle('active', g.autoAttack);
      } else if (s.kind === 'potion') {
        const group = ITEMS[s.item].use.group;
        remain = Math.max(0, (g.potionReadyAt[group] || 0) - now); total = ITEMS[s.item].use.cooldown;
      }
      s.cd.style.setProperty('--cd', String(remain > 0 ? remain / total : 0));
      s.cdt.textContent = remain > 1 ? Math.ceil(remain) : '';
    }

    this.updatePlates();
    this.updateFloaters(dt);
    this.drawMinimap();
    const region = g.terrain.regionAt(g.player.position.x, g.player.position.z);
    $('region-name').textContent = region ? region.name : g.terrain.zone.name;
    const hours = (g.dayPhase * 24) % 24;
    $('clock').textContent = `${String(Math.floor(hours)).padStart(2, '0')}:${String(Math.floor((hours % 1) * 60)).padStart(2, '0')}`;
  }

  bar(node, v, max) {
    const f = max ? Math.max(0, Math.min(1, v / max)) : 0;
    node.style.setProperty('--fill', f.toFixed(3));
    const label = `${Math.max(0, Math.ceil(v || 0))} / ${max || 0}`;
    const span = node.querySelector('span');
    if (span.textContent !== label) span.textContent = label;
    node.setAttribute('aria-valuenow', String(Math.ceil(v || 0)));
    node.setAttribute('aria-valuemax', String(max || 0));
  }

  chips(container, list) {
    const key = list.map((x) => x.join(':')).join('|');
    if (container.dataset.key === key) return;
    container.dataset.key = key;
    container.textContent = '';
    for (const [id, text] of list) container.append(el('span', `chip ${id}`, text));
  }

  updatePlates() {
    const g = this.game;
    const cam = g.camera;
    const w = innerWidth, h = innerHeight;
    const seen = new Set();
    const ppos = g.player.position;
    for (const ent of g.entities.values()) {
      if (!ent.model || ent.id === g.myId) continue;
      const d = ent.model.root.position.distanceTo(ppos);
      const range = ent.type === 'loot' ? 14 : ent.type === 'monster' ? 38 : 55;
      if (d > range || (ent.dead && ent.type !== 'player')) continue;
      this.v.copy(ent.model.root.position);
      this.v.y += ent.labelHeight || 2.1;
      this.v.project(cam);
      if (this.v.z > 1 || Math.abs(this.v.x) > 1.1 || Math.abs(this.v.y) > 1.1) continue;
      seen.add(ent.id);
      let p = this.plates.get(ent.id);
      if (!p) {
        p = { e: el('div', `nameplate ${ent.type}${ent.def?.elite ? ' elite' : ''}`), n: el('div', 'n'), hb: null };
        p.e.append(p.n);
        if (ent.type === 'monster' || ent.type === 'player') {
          p.hb = el('div', 'hpb');
          p.hbi = el('i');
          p.hb.append(p.hbi);
          p.e.append(p.hb);
        }
        this.labels.append(p.e);
        this.plates.set(ent.id, p);
      }
      if (p.n.textContent !== ent.name) p.n.textContent = ent.name;
      if (ent.level && ent.type !== 'loot') {
        if (!p.lv) { p.lv = el('span', 'lv'); p.e.prepend(p.lv); }
        const lv = String(ent.level);
        if (p.lv.textContent !== lv) p.lv.textContent = lv;
        p.lv.classList.toggle('danger', ent.type === 'monster' && ent.level >= g.me.level + 3);
      }
      if (ent.type === 'loot') p.n.style.color = ent.color || '';
      if (p.hb) {
        const show = ent.type === 'monster' ? ent.hp < ent.mh || g.targetId === ent.id : ent.id !== g.myId;
        p.hb.hidden = !show;
        p.hbi.style.setProperty('--fill', String(Math.max(0, ent.hp / (ent.mh || 1))));
      }
      p.e.classList.toggle('targeted', g.targetId === ent.id);
      const x = (this.v.x * 0.5 + 0.5) * w, y = (-this.v.y * 0.5 + 0.5) * h;
      p.e.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
      p.e.style.opacity = d > range * 0.75 ? String(1 - (d - range * 0.75) / (range * 0.25)) : '1';
    }
    for (const [id, p] of this.plates) {
      if (!seen.has(id)) { p.e.remove(); this.plates.delete(id); }
    }
  }

  updateFloaters(dt) {
    const cam = this.game.camera;
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.age += dt;
      if (f.age > 1.1) { f.e.remove(); this.floaters.splice(i, 1); continue; }
      this.v.copy(f.pos);
      this.v.y += 2.2 + f.age * 1.4;
      this.v.project(cam);
      if (this.v.z > 1) { f.e.style.opacity = '0'; continue; }
      const x = (this.v.x * 0.5 + 0.5) * innerWidth + f.dx * f.age, y = (-this.v.y * 0.5 + 0.5) * innerHeight;
      const s = f.age < 0.12 ? 1.4 - f.age * 3 : 1;
      f.e.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%) scale(${s.toFixed(2)})`;
      f.e.style.opacity = String(f.age > 0.7 ? 1 - (f.age - 0.7) / 0.4 : 1);
    }
  }

  // ---- Minimap ----------------------------------------------------------------
  buildMinimapBase() {
    const t = this.game.terrain, zone = t.zone;
    const N = 200, cv = document.createElement('canvas');
    cv.width = cv.height = N;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(N, N);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x = (i / N - 0.5) * zone.size, z = (j / N - 0.5) * zone.size;
        const hgt = t.heightAt(x, z);
        let r = 74, gg = 102, b = 52;
        if (hgt < zone.waterLevel) { r = 38; gg = 78; b = 96; }
        else if (t.roadDistance(x, z) < 2.6) { r = 141; gg = 118; b = 88; }
        else if (Math.hypot(x, z) < zone.town.palisadeRadius) { r = 128; gg = 107; b = 82; }
        else if (hgt > 14 || Math.max(Math.abs(x), Math.abs(z)) > zone.walkBound) { r = 112; gg = 110; b = 104; }
        const shade = 0.8 + Math.min(0.35, hgt / 60);
        const k = (j * N + i) * 4;
        img.data[k] = r * shade; img.data[k + 1] = gg * shade; img.data[k + 2] = b * shade; img.data[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = 'rgba(20,30,20,0.35)';
    for (const tr of t.trees) ctx.fillRect((tr.x / zone.size + 0.5) * N, (tr.z / zone.size + 0.5) * N, 1, 1);
    this.minimapBase = cv;
  }

  drawMinimap() {
    if (!this.minimapBase) this.buildMinimapBase();
    const cv = $('minimap'), ctx = cv.getContext('2d');
    const S = cv.width, g = this.game, zone = g.terrain.zone;
    const p = g.player.position;
    const pxPerM = 1.9, mapScale = this.minimapBase.width / zone.size;
    ctx.save();
    ctx.clearRect(0, 0, S, S);
    ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); ctx.clip();
    ctx.translate(S / 2, S / 2);
    ctx.rotate(g.cameraYaw);
    ctx.scale(pxPerM / mapScale, pxPerM / mapScale);
    ctx.drawImage(this.minimapBase, -(p.x / zone.size + 0.5) * this.minimapBase.width, -(p.z / zone.size + 0.5) * this.minimapBase.width);
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); ctx.clip();
    const rot = g.cameraYaw, cs = Math.cos(rot), sn = Math.sin(rot);
    for (const ent of g.entities.values()) {
      if (ent.id === g.myId || ent.dead) continue;
      const dx = (ent.x - p.x) * pxPerM, dz = (ent.z - p.z) * pxPerM;
      const sx = S / 2 + dx * cs - dz * sn, sy = S / 2 + dx * sn + dz * cs;
      if (Math.hypot(sx - S / 2, sy - S / 2) > S / 2 - 3) continue;
      ctx.fillStyle = ent.type === 'monster' ? (ent.def?.elite ? '#e9c46a' : ent.def?.stationary ? '#8fd6e8' : '#e0644a')
        : ent.type === 'npc' ? '#f2d48c' : ent.type === 'loot' ? '#ffffff' : '#7fb6ff';
      ctx.beginPath(); ctx.arc(sx, sy, ent.type === 'loot' ? 1.6 : ent.def?.elite || ent.def?.stationary ? 3.5 : 2.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // The player is always the centre arrow, pointing where the character faces.
    ctx.save();
    ctx.translate(S / 2, S / 2);
    ctx.rotate(-(g.player.rotation.y - g.cameraYaw) + Math.PI);
    ctx.fillStyle = '#fff7e0';
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 5); ctx.lineTo(0, 2.5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  destroy() {
    for (const p of this.plates.values()) p.e.remove();
    for (const f of this.floaters) f.e.remove();
    this.plates.clear();
    this.floaters = [];
    $('chat-log').textContent = '';
  }
}

export function monsterName(defId) { return MONSTERS[defId]?.name || defId; }
