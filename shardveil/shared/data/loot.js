// Loot tables. Each entry rolls independently:
//   { item, chance (0..1), qty: [min, max] }
// Equipment drops additionally roll a rarity tier and affixes on the server.

export const LOOT_TABLES = {
  dusk_wolf: {
    gold: [2, 6],
    entries: [
      { item: 'wolf_pelt', chance: 0.55, qty: [1, 2] },
      { item: 'hp_draught', chance: 0.12, qty: [1, 1] },
      { item: 'felt_cap', chance: 0.04, qty: [1, 1] },
      { item: 'wanderer_boots', chance: 0.04, qty: [1, 1] },
    ],
  },
  old_greymaw: {
    gold: [60, 110],
    entries: [
      { item: 'greymaw_fang', chance: 1, qty: [1, 1] },
      { item: 'wolf_pelt', chance: 1, qty: [3, 6] },
      { item: 'veil_fragment', chance: 0.6, qty: [1, 2] },
      { item: 'greymaw_cleaver', chance: 0.25, qty: [1, 1] },
      { item: 'duskfang_daggers', chance: 0.25, qty: [1, 1] },
      { item: 'hide_hood', chance: 0.4, qty: [1, 1] },
      { item: 'copper_band', chance: 0.35, qty: [1, 1] },
    ],
  },
  mire_toad: {
    gold: [4, 9],
    entries: [
      { item: 'toad_gland', chance: 0.6, qty: [1, 2] },
      { item: 'mp_draught', chance: 0.15, qty: [1, 1] },
      { item: 'marsh_treads', chance: 0.05, qty: [1, 1] },
      { item: 'bellwood_rod', chance: 0.025, qty: [1, 1] },
    ],
  },
  thornback_boar: {
    gold: [6, 12],
    entries: [
      { item: 'boar_tusk', chance: 0.55, qty: [1, 2] },
      { item: 'hp_draught', chance: 0.15, qty: [1, 2] },
      { item: 'boiled_leather', chance: 0.04, qty: [1, 1] },
      { item: 'harrow_longsword', chance: 0.025, qty: [1, 1] },
      { item: 'thornspike_knives', chance: 0.025, qty: [1, 1] },
    ],
  },
  thornling: {
    gold: [8, 15],
    entries: [
      { item: 'thorn_heart', chance: 0.5, qty: [1, 1] },
      { item: 'cinder_staff', chance: 0.03, qty: [1, 1] },
      { item: 'bellwood_rod', chance: 0.03, qty: [1, 1] },
      { item: 'hide_hood', chance: 0.05, qty: [1, 1] },
    ],
  },
  shardtouched_wolf: {
    gold: [9, 18],
    entries: [
      { item: 'wolf_pelt', chance: 0.5, qty: [1, 2] },
      { item: 'veil_fragment', chance: 0.12, qty: [1, 1] },
      { item: 'ridgeplate', chance: 0.02, qty: [1, 1] },
      { item: 'shard_signet', chance: 0.02, qty: [1, 1] },
    ],
  },
  veilshard: {
    gold: [40, 80],
    entries: [
      { item: 'veil_fragment', chance: 1, qty: [2, 4] },
      { item: 'shardglass_staff', chance: 0.12, qty: [1, 1] },
      { item: 'rootsong_rod', chance: 0.12, qty: [1, 1] },
      { item: 'greymaw_cleaver', chance: 0.08, qty: [1, 1] },
      { item: 'duskfang_daggers', chance: 0.08, qty: [1, 1] },
      { item: 'ridgeplate', chance: 0.1, qty: [1, 1] },
      { item: 'shard_signet', chance: 0.1, qty: [1, 1] },
    ],
  },
};
