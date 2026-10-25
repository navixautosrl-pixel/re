// Player-side settings: graphics preset, UI scale, volume and key bindings.
// Stored in localStorage (a per-machine convenience, never game state).

export const QUALITY = {
  low:    { pixelRatio: 0.75, shadows: false, shadowSize: 0,    terrainSegments: 140, grass: 0,     viewDistance: 150, antialias: false },
  medium: { pixelRatio: 1,    shadows: true,  shadowSize: 1024, terrainSegments: 200, grass: 7000,  viewDistance: 210, antialias: false },
  high:   { pixelRatio: 1.25, shadows: true,  shadowSize: 2048, terrainSegments: 256, grass: 16000, viewDistance: 260, antialias: true },
  ultra:  { pixelRatio: 2,    shadows: true,  shadowSize: 4096, terrainSegments: 320, grass: 30000, viewDistance: 320, antialias: true },
};

export const ACTIONS = [
  ['forward', 'Move forward', 'KeyW'],
  ['back', 'Move back', 'KeyS'],
  ['left', 'Strafe left', 'KeyA'],
  ['right', 'Strafe right', 'KeyD'],
  ['attack', 'Attack target', 'Space'],
  ['slot1', 'Action slot 1', 'Digit1'],
  ['slot2', 'Action slot 2', 'Digit2'],
  ['slot3', 'Action slot 3', 'Digit3'],
  ['slot4', 'Action slot 4', 'Digit4'],
  ['nextTarget', 'Next target', 'Tab'],
  ['pickup', 'Pick up loot', 'KeyZ'],
  ['inventory', 'Pack', 'KeyI'],
  ['character', 'Character', 'KeyC'],
  ['journal', 'Quest journal', 'KeyL'],
];

const DEFAULTS = {
  quality: 'medium',
  uiScale: 1,
  volume: 0.6,
  damageNumbers: true,
  bindings: Object.fromEntries(ACTIONS.map(([id, , key]) => [id, key])),
};

const KEY = 'shardveil.settings.v1';

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && typeof raw === 'object') {
      return { ...DEFAULTS, ...raw, bindings: { ...DEFAULTS.bindings, ...(raw.bindings || {}) } };
    }
  } catch { /* storage unavailable or corrupted: fall back to defaults */ }
  return structuredClone(DEFAULTS);
}

export const settings = load();
if (!QUALITY[settings.quality]) settings.quality = 'medium';

export function saveSettings() {
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ignore */ }
}

export function resetBindings() {
  settings.bindings = { ...DEFAULTS.bindings };
  saveSettings();
}

export function actionForCode(code) {
  for (const [id, key] of Object.entries(settings.bindings)) if (key === code) return id;
  return null;
}

export function keyLabel(code) {
  if (!code) return '—';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Arrow')) return code.slice(5) + ' arrow';
  return { Space: 'Space', Tab: 'Tab', ShiftLeft: 'L-Shift', ShiftRight: 'R-Shift', ControlLeft: 'L-Ctrl', Backquote: '`' }[code] || code;
}

export function applyUiScale() {
  document.documentElement.style.setProperty('--ui-scale', String(settings.uiScale));
}
