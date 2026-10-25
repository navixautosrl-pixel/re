// Item definitions, rarity tiers and random affixes.
// Item *instances* (owned by characters) live in PostgreSQL; this file is the
// catalogue they point at via def_id.

export const EQUIP_SLOTS = ['weapon', 'head', 'body', 'feet', 'ring'];

export const RARITIES = {
  common:   { id: 'common',   name: 'Common',   color: '#c9c6bd', affixes: 0, weight: 70 },
  uncommon: { id: 'uncommon', name: 'Uncommon', color: '#7fc77a', affixes: 1, weight: 22 },
  rare:     { id: 'rare',     name: 'Rare',     color: '#5aa6e8', affixes: 2, weight: 7 },
  epic:     { id: 'epic',     name: 'Epic',     color: '#b77be0', affixes: 3, weight: 1 },
};

// Value ranges are per item level; the roll is scaled by the item's levelReq.
export const AFFIXES = {
  str:     { name: 'Strength',       per: [0.3, 0.7], min: 1 },
  dex:     { name: 'Dexterity',      per: [0.3, 0.7], min: 1 },
  int:     { name: 'Intellect',      per: [0.3, 0.7], min: 1 },
  vit:     { name: 'Vitality',       per: [0.3, 0.7], min: 1 },
  hp:      { name: 'Max Health',     per: [3, 6],     min: 8 },
  mp:      { name: 'Max Mana',       per: [2, 4],     min: 6 },
  crit:    { name: 'Critical Chance', per: [0.15, 0.3], min: 1, suffix: '%' },
  defense: { name: 'Defense',        per: [0.4, 0.8], min: 1 },
};

const w = (id, name, classes, levelReq, attack, value, extra = {}) => ({
  id, name, type: 'weapon', slot: 'weapon', classes, levelReq, stats: { attack }, value, stack: 1, tradable: true, ...extra,
});
const mw = (id, name, classes, levelReq, magic, attack, value, extra = {}) => ({
  id, name, type: 'weapon', slot: 'weapon', classes, levelReq, stats: { magic, attack }, value, stack: 1, tradable: true, ...extra,
});
const a = (id, name, slot, levelReq, defense, value, extra = {}) => ({
  id, name, type: 'armor', slot, classes: null, levelReq, stats: { defense }, value, stack: 1, tradable: true, ...extra,
});

export const ITEMS = {
  // ---- Weapons -------------------------------------------------------------
  ironwood_blade:  w('ironwood_blade', 'Ironwood Blade', ['vanguard'], 1, [6, 9], 4, { icon: 'sword' }),
  harrow_longsword: w('harrow_longsword', 'Harrow Longsword', ['vanguard'], 4, [11, 16], 30, { icon: 'sword' }),
  greymaw_cleaver: w('greymaw_cleaver', "Greymaw's Cleaver", ['vanguard'], 7, [17, 24], 90, { icon: 'sword' }),

  twin_fangs:      w('twin_fangs', 'Twin Fangs', ['shadeblade'], 1, [5, 7], 4, { icon: 'daggers' }),
  thornspike_knives: w('thornspike_knives', 'Thornspike Knives', ['shadeblade'], 4, [9, 13], 30, { icon: 'daggers' }),
  duskfang_daggers: w('duskfang_daggers', 'Duskfang Daggers', ['shadeblade'], 7, [14, 19], 90, { icon: 'daggers' }),

  ash_staff:       mw('ash_staff', 'Ash Staff', ['arcanist'], 1, [7, 10], [2, 3], 4, { icon: 'staff' }),
  cinder_staff:    mw('cinder_staff', 'Cinder Staff', ['arcanist'], 4, [13, 18], [3, 5], 30, { icon: 'staff' }),
  shardglass_staff: mw('shardglass_staff', 'Shardglass Staff', ['arcanist'], 7, [20, 27], [4, 6], 90, { icon: 'staff' }),

  willow_rod:      mw('willow_rod', 'Willow Rod', ['wardweaver'], 1, [6, 9], [2, 4], 4, { icon: 'rod' }),
  bellwood_rod:    mw('bellwood_rod', 'Bellwood Rod', ['wardweaver'], 4, [11, 15], [3, 5], 30, { icon: 'rod' }),
  rootsong_rod:    mw('rootsong_rod', 'Rootsong Rod', ['wardweaver'], 7, [17, 23], [4, 7], 90, { icon: 'rod' }),

  // ---- Armor ---------------------------------------------------------------
  padded_vest:     a('padded_vest', 'Padded Vest', 'body', 1, 3, 3, { icon: 'body' }),
  boiled_leather:  a('boiled_leather', 'Boiled Leather Coat', 'body', 4, 7, 26, { icon: 'body' }),
  ridgeplate:      a('ridgeplate', 'Ridgeplate Hauberk', 'body', 7, 12, 80, { icon: 'body' }),
  felt_cap:        a('felt_cap', 'Felt Cap', 'head', 1, 1, 2, { icon: 'head' }),
  hide_hood:       a('hide_hood', 'Hide Hood', 'head', 3, 3, 18, { icon: 'head' }),
  wanderer_boots:  a('wanderer_boots', "Wanderer's Boots", 'feet', 1, 1, 2, { icon: 'feet' }),
  marsh_treads:    a('marsh_treads', 'Marsh Treads', 'feet', 3, 3, 18, { icon: 'feet' }),
  copper_band:     a('copper_band', 'Copper Band', 'ring', 2, 0, 15, { icon: 'ring', stats: { defense: 0, hp: 12 } }),
  shard_signet:    a('shard_signet', 'Shard Signet', 'ring', 6, 1, 70, { icon: 'ring', stats: { defense: 1, mp: 20 } }),

  // ---- Consumables ---------------------------------------------------------
  hp_draught: {
    id: 'hp_draught', name: 'Minor Healing Draught', type: 'consumable', stack: 50, value: 3, levelReq: 1,
    use: { heal: 80, cooldown: 8, group: 'potion_hp' }, icon: 'potion_red', tradable: true,
  },
  mp_draught: {
    id: 'mp_draught', name: 'Minor Mana Draught', type: 'consumable', stack: 50, value: 3, levelReq: 1,
    use: { mana: 60, cooldown: 8, group: 'potion_mp' }, icon: 'potion_blue', tradable: true,
  },

  warding_wax: {
    id: 'warding_wax', name: 'Warding Wax', type: 'material', stack: 20, value: 35, icon: 'wax', tradable: true,
    description: 'Rubbed into steel before tempering. If the tempering fails, the item keeps its level.',
  },

  // ---- Materials -----------------------------------------------------------
  wolf_pelt:      { id: 'wolf_pelt', name: 'Dusk Wolf Pelt', type: 'material', stack: 200, value: 2, icon: 'pelt', tradable: true },
  boar_tusk:      { id: 'boar_tusk', name: 'Thornback Tusk', type: 'material', stack: 200, value: 3, icon: 'tusk', tradable: true },
  toad_gland:     { id: 'toad_gland', name: 'Mire Gland', type: 'material', stack: 200, value: 2, icon: 'gland', tradable: true },
  thorn_heart:    { id: 'thorn_heart', name: 'Thornling Heartwood', type: 'material', stack: 200, value: 5, icon: 'wood', tradable: true },
  veil_fragment:  { id: 'veil_fragment', name: 'Veil Fragment', type: 'material', stack: 200, value: 12, icon: 'shard', tradable: true,
    description: 'A sliver of the shattered Veil. Smiths use it to temper equipment.' },
  greymaw_fang:   { id: 'greymaw_fang', name: "Greymaw's Fang", type: 'quest', stack: 1, value: 0, icon: 'tusk', tradable: false },
};

export function isEquipment(def) {
  return def && (def.type === 'weapon' || def.type === 'armor');
}

export function canClassUse(def, classId) {
  return !def.classes || def.classes.includes(classId);
}

export const STARTER_KITS = {
  vanguard:   { weapon: 'ironwood_blade', body: 'padded_vest', bag: [['hp_draught', 5]] },
  shadeblade: { weapon: 'twin_fangs', body: 'padded_vest', bag: [['hp_draught', 5]] },
  arcanist:   { weapon: 'ash_staff', body: 'padded_vest', bag: [['hp_draught', 3], ['mp_draught', 5]] },
  wardweaver: { weapon: 'willow_rod', body: 'padded_vest', bag: [['hp_draught', 3], ['mp_draught', 5]] },
};
