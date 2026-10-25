// Class archetypes and their skills. All balance numbers live here; the
// server's combat code reads these rather than hard-coding values.
//
// Skill effect types understood by the server (server/world/skills.js):
//   damage  { mult, kind: 'physical'|'magical', shape: 'single'|'cone'|'circle', radius, angle, at: 'self'|'target' }
//   status  { id, duration, ...params }     applied to the struck target(s)
//   buff    { id, duration, ...params }     applied to the caster
//   heal    { mult, target: 'self'|'ally' }
//   dash    { distance }                     move caster toward the target

export const CLASSES = {
  vanguard: {
    id: 'vanguard',
    name: 'Vanguard',
    role: 'Melee bulwark',
    blurb: 'Shield-bearers of the ember-holds. Hard to kill, harder to move, built to stand between the Veil and everyone else.',
    baseStats: { str: 8, dex: 4, int: 2, vit: 8 },
    perLevel: { str: 2, dex: 1, int: 0, vit: 2 },
    hp: { base: 140, perVit: 9, perLevel: 14 },
    mp: { base: 40, perInt: 4, perLevel: 3 },
    basic: { range: 2.8, cooldown: 0.9, kind: 'physical', mult: 1.0 },
    weaponType: 'sword',
    colors: { primary: '#7d8794', secondary: '#b5793a', cloth: '#5b2c25' },
    skills: ['cleave', 'iron_will'],
  },
  shadeblade: {
    id: 'shadeblade',
    name: 'Shadeblade',
    role: 'Agile striker',
    blurb: 'Hunters who learned to move between heartbeats. Fragile, but few things survive their opening.',
    baseStats: { str: 5, dex: 9, int: 3, vit: 5 },
    perLevel: { str: 1, dex: 3, int: 0, vit: 1 },
    hp: { base: 110, perVit: 8, perLevel: 10 },
    mp: { base: 50, perInt: 4, perLevel: 3 },
    basic: { range: 2.4, cooldown: 0.65, kind: 'physical', mult: 0.8 },
    weaponType: 'daggers',
    colors: { primary: '#3c4a3f', secondary: '#9aa38f', cloth: '#22282a' },
    skills: ['shadowstep', 'venom_edge'],
  },
  arcanist: {
    id: 'arcanist',
    name: 'Arcanist',
    role: 'Ranged elementalist',
    blurb: 'Scholars who bind fallen shard-light into fire and frost. Devastating at range, exposed up close.',
    baseStats: { str: 2, dex: 4, int: 10, vit: 4 },
    perLevel: { str: 0, dex: 1, int: 3, vit: 1 },
    hp: { base: 95, perVit: 7, perLevel: 9 },
    mp: { base: 90, perInt: 7, perLevel: 6 },
    basic: { range: 15, cooldown: 1.15, kind: 'magical', mult: 0.9, projectile: 'ember_bolt' },
    weaponType: 'staff',
    colors: { primary: '#2f3d66', secondary: '#c9a24a', cloth: '#1d2442' },
    skills: ['ember_burst', 'frost_lance'],
  },
  wardweaver: {
    id: 'wardweaver',
    name: 'Wardweaver',
    role: 'Healer and controller',
    blurb: 'Keepers of the old ward-songs. They mend allies, root enemies in place, and outlast almost anything.',
    baseStats: { str: 3, dex: 4, int: 8, vit: 6 },
    perLevel: { str: 0, dex: 1, int: 2, vit: 2 },
    hp: { base: 115, perVit: 8, perLevel: 11 },
    mp: { base: 80, perInt: 6, perLevel: 5 },
    basic: { range: 12, cooldown: 1.05, kind: 'magical', mult: 0.75, projectile: 'ward_mote' },
    weaponType: 'rod',
    colors: { primary: '#4f6b58', secondary: '#d8d2b0', cloth: '#2c3f36' },
    skills: ['mending_light', 'binding_roots'],
  },
};

export const SKILLS = {
  cleave: {
    id: 'cleave', name: 'Cleave', unlockLevel: 1, cooldown: 6, mana: 18, range: 3.2,
    description: 'A wide swing that strikes every enemy in front of you.',
    needsTarget: false,
    effects: [{ type: 'damage', kind: 'physical', mult: 1.6, shape: 'cone', radius: 3.6, angle: Math.PI * 0.7, at: 'self' }],
    fx: 'arc',
  },
  iron_will: {
    id: 'iron_will', name: 'Iron Will', unlockLevel: 3, cooldown: 22, mana: 25, range: 0,
    description: 'Brace yourself: +40% defense and steady regeneration for 10 seconds.',
    needsTarget: false,
    effects: [{ type: 'buff', id: 'iron_will', duration: 10, defenseMult: 1.4, regenPerSec: 4 }],
    fx: 'aura_bronze',
  },
  shadowstep: {
    id: 'shadowstep', name: 'Shadowstep', unlockLevel: 1, cooldown: 8, mana: 20, range: 12,
    description: 'Vanish and reappear at your target, striking twice.',
    needsTarget: true,
    effects: [
      { type: 'dash', distance: 12 },
      { type: 'damage', kind: 'physical', mult: 1.1, shape: 'single', hits: 2 },
    ],
    fx: 'smoke',
  },
  venom_edge: {
    id: 'venom_edge', name: 'Venom Edge', unlockLevel: 3, cooldown: 10, mana: 22, range: 2.6,
    description: 'A poisoned cut that deals heavy damage over 6 seconds.',
    needsTarget: true,
    effects: [
      { type: 'damage', kind: 'physical', mult: 0.7, shape: 'single' },
      { type: 'status', id: 'poison', duration: 6, tickMult: 0.35, interval: 1 },
    ],
    fx: 'venom',
  },
  ember_burst: {
    id: 'ember_burst', name: 'Ember Burst', unlockLevel: 1, cooldown: 7, mana: 30, range: 15,
    description: 'Call down shard-fire on your target, scorching everything around it.',
    needsTarget: true,
    effects: [{ type: 'damage', kind: 'magical', mult: 1.5, shape: 'circle', radius: 4.2, at: 'target' }],
    fx: 'fire_burst',
  },
  frost_lance: {
    id: 'frost_lance', name: 'Frost Lance', unlockLevel: 3, cooldown: 5, mana: 24, range: 16,
    description: 'A spear of ice that hits hard and slows the target by 45% for 4 seconds.',
    needsTarget: true,
    effects: [
      { type: 'damage', kind: 'magical', mult: 1.9, shape: 'single' },
      { type: 'status', id: 'slow', duration: 4, speedMult: 0.55 },
    ],
    fx: 'frost',
  },
  mending_light: {
    id: 'mending_light', name: 'Mending Light', unlockLevel: 1, cooldown: 6, mana: 26, range: 14,
    description: 'Heal yourself or a targeted ally.',
    needsTarget: false,
    effects: [{ type: 'heal', mult: 2.4, target: 'ally' }],
    fx: 'heal',
  },
  binding_roots: {
    id: 'binding_roots', name: 'Binding Roots', unlockLevel: 3, cooldown: 12, mana: 28, range: 13,
    description: 'Roots erupt beneath the target, holding it in place for 3 seconds.',
    needsTarget: true,
    effects: [
      { type: 'damage', kind: 'magical', mult: 1.0, shape: 'single' },
      { type: 'status', id: 'root', duration: 3 },
    ],
    fx: 'roots',
  },
};

export const CLASS_IDS = Object.keys(CLASSES);
