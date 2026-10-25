// Quest UI: NPC conversations with offers and turn-ins, the journal, the
// on-screen tracker and quest-giver markers. Progress comes from the server;
// collect objectives are counted from the pack like the server does.
import { QUESTS } from '/shared/data/quests.js';
import { ITEMS } from '/shared/data/items.js';
import { MONSTERS } from '/shared/data/monsters.js';
import { NPC_DIALOGUE } from '/shared/data/npcs.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

export class QuestUi {
  constructor(game) {
    this.game = game;
    this.state = new Map();
    this.openNpcId = null;
  }

  update(list) {
    this.state = new Map(list.map((q) => [q.id, q]));
    this.refresh();
  }

  refresh() {
    this.renderTracker();
    if (!$('win-quests').hidden) this.renderJournal();
    if (this.openNpcId && !$('win-dialog').hidden) this.openNpc(this.openNpcId, true);
  }

  available(q) {
    const me = this.game.me;
    return !this.state.has(q.id) && me.level >= q.level && q.requires.every((r) => this.state.get(r)?.state === 'completed');
  }

  status(q) {
    const s = this.state.get(q.id);
    return q.objectives.map((o, i) => {
      let have = s?.progress?.[i] || 0;
      if (o.type === 'collect') {
        have = this.game.inventory.filter((it) => it.container === 'bag' && it.defId === o.item).reduce((a, it) => a + it.qty, 0);
      }
      const need = o.type === 'explore' ? 1 : o.count;
      return { o, have: Math.min(have, need), need, done: have >= need };
    });
  }

  ready(q) { return this.state.get(q.id)?.state === 'active' && this.status(q).every((x) => x.done); }

  objectiveText({ o, have, need }) {
    if (o.type === 'kill') return `${MONSTERS[o.monster].name} slain: ${have}/${need}`;
    if (o.type === 'collect') return `${ITEMS[o.item].name}: ${have}/${need}`;
    return o.label;
  }

  objectiveList(q) {
    const ul = el('ul', 'objectives');
    for (const st of this.status(q)) ul.append(el('li', st.done ? 'done' : '', this.objectiveText(st)));
    return ul;
  }

  rewardLine(q) {
    const r = q.rewards;
    const p = el('p', 'rewards');
    p.append('Reward: ');
    const parts = [];
    if (r.xp) parts.push(`${r.xp} XP`);
    if (r.gold) parts.push(`${r.gold} gold`);
    for (const [id, n] of r.items || []) parts.push(`${ITEMS[id].name}${n > 1 ? ` ×${n}` : ''}`);
    const ci = r.classItems?.[this.game.me.cls];
    if (ci) parts.push(ITEMS[ci].name);
    const b = el('b', null, parts.join(', '));
    p.append(b);
    return p;
  }

  // '!' when this NPC has something new, '?' when a task is ready to hand in.
  markerFor(npcId) {
    let mark = '';
    for (const q of Object.values(QUESTS)) {
      if (q.giver !== npcId) continue;
      if (this.ready(q)) return '?';
      if (this.available(q)) mark = '!';
    }
    return mark;
  }

  openNpc(npcId, keepScroll = false) {
    const npc = this.game.terrain.zone.npcs.find((n) => n.id === npcId);
    if (!npc) return;
    this.openNpcId = npcId;
    $('dlg-title').textContent = npc.name;
    const body = $('dlg-body');
    const scroll = body.scrollTop;
    body.textContent = '';
    const quests = Object.values(QUESTS).filter((q) => q.giver === npcId);
    const ready = quests.filter((q) => this.ready(q));
    const offers = quests.filter((q) => this.available(q));
    const active = quests.filter((q) => this.state.get(q.id)?.state === 'active' && !this.ready(q));
    if (!ready.length && !offers.length) {
      for (const line of NPC_DIALOGUE[npcId] || []) body.append(el('p', null, line));
    }
    for (const q of ready) {
      const box = el('section', 'quest');
      box.append(el('h4', null, q.name), el('p', 'offer', q.complete), this.rewardLine(q));
      const row = el('div', 'row');
      const btn = el('button', 'btn primary', 'Complete task');
      btn.type = 'button';
      btn.addEventListener('click', () => { btn.disabled = true; this.game.send({ t: 'questTurnIn', quest: q.id }); });
      row.append(btn);
      box.append(row);
      body.append(box);
    }
    for (const q of offers) {
      const box = el('section', 'quest');
      box.append(el('h4', null, q.name), el('p', 'offer', q.offer), this.objectiveList(q), this.rewardLine(q));
      const row = el('div', 'row');
      const btn = el('button', 'btn primary', 'Accept');
      btn.type = 'button';
      btn.addEventListener('click', () => { btn.disabled = true; this.game.send({ t: 'questAccept', quest: q.id }); });
      row.append(btn);
      box.append(row);
      body.append(box);
    }
    for (const q of active) {
      const box = el('section', 'quest');
      box.append(el('h4', null, q.name), el('p', null, q.summary), this.objectiveList(q));
      body.append(box);
    }
    const locked = quests.filter((q) => !this.state.has(q.id) && !this.available(q) && q.requires.every((r) => this.state.get(r)?.state === 'completed'));
    for (const q of locked) body.append(el('p', 'rewards', `Come back at level ${q.level}: ${q.name}.`));
    const close = el('button', 'btn ghost', 'Farewell');
    close.type = 'button';
    close.addEventListener('click', () => { $('win-dialog').hidden = true; this.openNpcId = null; });
    body.append(close);
    if ($('win-dialog').hidden) this.game.hud.openWindow('win-dialog');
    if (keepScroll) body.scrollTop = scroll;
  }

  renderJournal() {
    const box = $('journal');
    box.textContent = '';
    const active = [...this.state.values()].filter((s) => s.state === 'active').map((s) => QUESTS[s.id]).filter(Boolean);
    if (!active.length) {
      box.append(el('p', 'empty-note', 'No tasks right now. People with a gold mark over their heads in Emberford have work for you.'));
    }
    const npcName = (id) => this.game.terrain.zone.npcs.find((n) => n.id === id)?.name || id;
    for (const q of active) {
      const s = el('section', 'quest');
      s.append(el('h4', null, q.name), el('span', 'giver', `${this.ready(q) ? 'Return to' : 'From'} ${npcName(q.giver)}`), el('p', null, q.summary), this.objectiveList(q), this.rewardLine(q));
      const row = el('div', 'row');
      const ab = el('button', 'btn ghost', 'Abandon');
      ab.type = 'button';
      ab.addEventListener('click', () => { if (confirm(`Abandon "${q.name}"? Progress will be lost.`)) this.game.send({ t: 'questAbandon', quest: q.id }); });
      row.append(ab);
      s.append(row);
      box.append(s);
    }
    const done = [...this.state.values()].filter((s) => s.state === 'completed').length;
    if (done) box.append(el('p', 'rewards', `Completed: ${done}`));
  }

  renderTracker() {
    const box = $('tracker');
    box.textContent = '';
    const active = [...this.state.values()].filter((s) => s.state === 'active').map((s) => QUESTS[s.id]).filter(Boolean).slice(0, 4);
    for (const q of active) {
      const ready = this.ready(q);
      const d = el('div', `tq${ready ? ' ready' : ''}`);
      d.append(el('div', 'tq-name', q.name));
      if (ready) d.append(el('div', 'ready-note', `Return to ${this.game.terrain.zone.npcs.find((n) => n.id === q.giver)?.name}`));
      else d.append(this.objectiveList(q));
      box.append(d);
    }
  }

  onEvent(e) {
    const q = QUESTS[e.q];
    if (!q) return;
    const hud = this.game.hud;
    if (e.k === 'qaccept') hud.chatLine('system', null, `Task accepted: ${q.name}.`, 'loot');
    if (e.k === 'qexplore') hud.notice(`${e.label}: done`);
    if (e.k === 'qdone') {
      hud.banner('Task complete', q.name);
      const parts = [];
      if (e.xp) parts.push(`${e.xp} XP`);
      if (e.g) parts.push(`${e.g} gold`);
      for (const [id, n] of e.items) parts.push(`${ITEMS[id]?.name}${n > 1 ? ` ×${n}` : ''}`);
      hud.chatLine('system', null, `${q.name} complete. Received ${parts.join(', ')}.`, 'loot');
      if (q.rewards.classItems?.[this.game.me.cls]) hud.chatLine('system', null, 'Your new weapon is in your pack. Press I and right-click it to equip.', 'system');
    }
  }
}
