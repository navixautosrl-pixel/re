// Item and skill icons painted on canvas at runtime (no image assets).
import { ITEMS, RARITIES } from '/shared/data/items.js';

const S = 64;
const cache = new Map();

function base(ctx, rarity) {
  const g = ctx.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S * 0.7);
  const col = RARITIES[rarity]?.color || '#c9c6bd';
  g.addColorStop(0, rarity && rarity !== 'common' ? col + '55' : '#2a3445');
  g.addColorStop(1, '#0d1118');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
}

function line(ctx, pts, color, w) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.stroke();
}
function poly(ctx, pts, fill, stroke) {
  ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}
function circle(ctx, x, y, r, fill, stroke) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}

const tierMetal = (def) => ((def?.levelReq || 1) >= 7 ? '#d6eef5' : (def?.levelReq || 1) >= 4 ? '#c8cdd4' : '#9aa0a8');

const DRAW = {
  sword(ctx, def) {
    line(ctx, [[18, 46], [46, 18]], tierMetal(def), 6);
    line(ctx, [[18, 46], [46, 18]], '#ffffff55', 1.5);
    line(ctx, [[14, 38], [26, 50]], '#a8824f', 4);
    line(ctx, [[10, 54], [18, 46]], '#4b3524', 4);
  },
  daggers(ctx, def) {
    line(ctx, [[16, 48], [36, 20]], tierMetal(def), 4);
    line(ctx, [[48, 48], [28, 20]], tierMetal(def), 4);
    line(ctx, [[12, 44], [22, 52]], '#a8824f', 3);
    line(ctx, [[52, 44], [42, 52]], '#a8824f', 3);
  },
  staff(ctx) {
    line(ctx, [[18, 54], [42, 18]], '#6b4a2e', 4);
    poly(ctx, [[44, 6], [52, 16], [44, 26], [36, 16]], '#8fd6e8', '#d7f3fa');
  },
  rod(ctx) {
    line(ctx, [[20, 52], [38, 26]], '#6a5536', 4);
    poly(ctx, [[34, 14], [48, 14], [46, 28], [36, 28]], '#c8cdd4', '#ffffff88');
    circle(ctx, 41, 32, 3.5, '#b9e6a0');
  },
  body(ctx, def) {
    poly(ctx, [[20, 14], [44, 14], [52, 24], [46, 28], [46, 52], [18, 52], [18, 28], [12, 24]], def?.levelReq >= 7 ? '#8e98a6' : def?.levelReq >= 4 ? '#7a5a38' : '#9a8a6a', '#00000066');
    line(ctx, [[32, 16], [32, 50]], '#00000044', 2);
  },
  head(ctx) {
    ctx.beginPath(); ctx.arc(32, 36, 16, Math.PI, 0); ctx.lineTo(48, 42); ctx.lineTo(16, 42); ctx.closePath();
    ctx.fillStyle = '#7d6a52'; ctx.fill();
    line(ctx, [[14, 42], [50, 42]], '#4b3524', 3);
  },
  feet(ctx) {
    poly(ctx, [[18, 14], [30, 14], [30, 40], [44, 44], [44, 52], [18, 52]], '#5a4330', '#00000066');
  },
  ring(ctx, def) {
    ctx.beginPath(); ctx.arc(32, 36, 13, 0, Math.PI * 2); ctx.strokeStyle = def?.id === 'shard_signet' ? '#c8cdd4' : '#c08a4a'; ctx.lineWidth = 5; ctx.stroke();
    poly(ctx, [[32, 14], [38, 22], [32, 28], [26, 22]], def?.id === 'shard_signet' ? '#8fd6e8' : '#d0553d');
  },
  potion_red(ctx) { potion(ctx, '#d0553d'); },
  potion_blue(ctx) { potion(ctx, '#4a7fe0'); },
  pelt(ctx) {
    poly(ctx, [[14, 20], [26, 14], [40, 16], [52, 24], [48, 40], [52, 50], [36, 46], [24, 52], [14, 42], [18, 32]], '#5a5f68', '#2a2d33');
  },
  tusk(ctx) {
    ctx.beginPath(); ctx.moveTo(16, 50); ctx.quadraticCurveTo(20, 18, 50, 12); ctx.quadraticCurveTo(30, 26, 26, 52); ctx.closePath();
    ctx.fillStyle = '#eae0c8'; ctx.fill();
  },
  gland(ctx) { circle(ctx, 32, 34, 14, '#7a8a3e', '#3e4a1e'); circle(ctx, 27, 29, 4, '#c8d88a'); },
  wood(ctx) {
    poly(ctx, [[18, 46], [40, 14], [48, 20], [26, 52]], '#5a4330', '#2d2418');
    circle(ctx, 22, 49, 6, '#8a6f48', '#2d2418');
    circle(ctx, 42, 30, 3, '#8fe05a');
  },
  shard(ctx) {
    poly(ctx, [[32, 6], [44, 26], [36, 58], [22, 36]], '#8fd6e8', '#d7f3fa');
    poly(ctx, [[32, 6], [44, 26], [32, 30]], '#d7f3fa');
  },
  gold(ctx) {
    for (const [x, y] of [[24, 42], [38, 42], [31, 32]]) {
      circle(ctx, x, y, 10, '#e2b23f', '#7a5a16');
      circle(ctx, x - 3, y - 3, 3, '#fff2b8');
    }
  },
};

function potion(ctx, color) {
  ctx.fillStyle = '#c9c6bd';
  ctx.fillRect(28, 10, 8, 10);
  ctx.beginPath(); ctx.arc(32, 38, 16, 0, Math.PI * 2); ctx.fillStyle = '#ffffff22'; ctx.fill();
  ctx.beginPath(); ctx.arc(32, 40, 13, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  circle(ctx, 27, 35, 3, '#ffffff99');
  ctx.fillStyle = '#6b4a2e'; ctx.fillRect(27, 7, 10, 5);
}

const SKILL_DRAW = {
  basic(ctx, cls) {
    const ic = { vanguard: 'sword', shadeblade: 'daggers', arcanist: 'staff', wardweaver: 'rod' }[cls] || 'sword';
    DRAW[ic](ctx, { levelReq: 1 });
  },
  cleave(ctx) {
    ctx.beginPath(); ctx.arc(32, 44, 26, Math.PI * 1.1, Math.PI * 1.9); ctx.strokeStyle = '#ffe1b0'; ctx.lineWidth = 7; ctx.stroke();
    line(ctx, [[20, 50], [44, 22]], '#c8cdd4', 5);
  },
  iron_will(ctx) {
    poly(ctx, [[32, 8], [52, 16], [48, 40], [32, 56], [16, 40], [12, 16]], '#a8824f', '#ffe1b0');
    poly(ctx, [[32, 16], [44, 21], [41, 38], [32, 47], [23, 38], [20, 21]], '#6b5232');
  },
  shadowstep(ctx) {
    for (let i = 0; i < 3; i++) circle(ctx, 18 + i * 13, 34, 9 - i * 1.5, `rgba(120,135,160,${0.3 + i * 0.3})`);
    line(ctx, [[38, 46], [54, 18]], '#c8cdd4', 4);
  },
  venom_edge(ctx) {
    line(ctx, [[16, 48], [44, 18]], '#c8cdd4', 5);
    for (const [x, y] of [[44, 34], [50, 44], [40, 48]]) circle(ctx, x, y, 4, '#9ad64a');
  },
  ember_burst(ctx) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      line(ctx, [[32 + Math.cos(a) * 8, 34 + Math.sin(a) * 8], [32 + Math.cos(a) * 24, 34 + Math.sin(a) * 24]], '#ffb25a', 4);
    }
    circle(ctx, 32, 34, 10, '#ffd27a');
  },
  frost_lance(ctx) {
    poly(ctx, [[10, 54], [46, 18], [56, 8], [50, 22], [16, 58]], '#bfeeff', '#ffffff');
  },
  mending_light(ctx) {
    circle(ctx, 32, 32, 18, '#9ff09a55');
    ctx.fillStyle = '#d6ffd0';
    ctx.fillRect(28, 16, 8, 32); ctx.fillRect(16, 28, 32, 8);
  },
  binding_roots(ctx) {
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(12 + i * 13, 56); ctx.quadraticCurveTo(4 + i * 15, 30, 18 + i * 10, 10);
      ctx.strokeStyle = '#8a6f48'; ctx.lineWidth = 4; ctx.stroke();
    }
  },
};

function render(key, fn) {
  if (cache.has(key)) return cache.get(key);
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  fn(cv.getContext('2d'));
  cache.set(key, cv);
  return cv;
}

export function itemIcon(defId, rarity = 'common') {
  return render(`i:${defId}:${rarity}`, (ctx) => {
    base(ctx, rarity);
    const def = ITEMS[defId];
    const draw = DRAW[defId === 'gold' ? 'gold' : def?.icon];
    if (draw) draw(ctx, def);
  });
}

export function skillIcon(skillId, cls) {
  return render(`s:${skillId}:${cls}`, (ctx) => {
    base(ctx, null);
    (SKILL_DRAW[skillId] || SKILL_DRAW.basic)(ctx, cls);
  });
}

// Copy a cached icon into a visible canvas element.
export function paint(canvas, source) {
  canvas.width = S;
  canvas.height = S;
  canvas.getContext('2d').drawImage(source, 0, 0);
}
