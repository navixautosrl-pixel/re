// Shops, selling, storage and equipment tempering (upgrades). Server-side
// configuration: prices, chances and outcomes are decided only by the server.

export const SHOPS = {
  general: {
    id: 'general', name: 'Odd & Sundry',
    stock: [
      { item: 'hp_draught', price: 12 },
      { item: 'mp_draught', price: 12 },
      { item: 'felt_cap', price: 24 },
      { item: 'wanderer_boots', price: 24 },
      { item: 'copper_band', price: 110 },
    ],
  },
  smith: {
    id: 'smith', name: 'Harrow Forge',
    stock: [
      { item: 'warding_wax', price: 140 },
      { item: 'harrow_longsword', price: 190 },
      { item: 'thornspike_knives', price: 190 },
      { item: 'cinder_staff', price: 190 },
      { item: 'bellwood_rod', price: 190 },
      { item: 'boiled_leather', price: 160 },
      { item: 'hide_hood', price: 95 },
    ],
  },
};

// Equipment sells for more when it rolled better.
export const SELL_RARITY_MULT = { common: 1, uncommon: 1.6, rare: 2.8, epic: 5 };

export const STORAGE_SLOTS = 40;

// Tempering: index = current upgrade level (0 -> +1 uses row 0).
// Failure below FAIL_DOWNGRADE_FROM keeps the item as it was; from that level
// on a failure drops it one level unless Warding Wax is used. Items are never
// destroyed: progression should feel risky, not ruinous.
export const UPGRADE = {
  maxLevel: 9,
  failDowngradeFrom: 4,
  protectionItem: 'warding_wax',
  material: 'veil_fragment',
  levels: [
    { chance: 0.95, gold: 30, fragments: 1 },
    { chance: 0.9, gold: 60, fragments: 1 },
    { chance: 0.8, gold: 100, fragments: 2 },
    { chance: 0.7, gold: 160, fragments: 2 },
    { chance: 0.6, gold: 240, fragments: 3 },
    { chance: 0.5, gold: 340, fragments: 3 },
    { chance: 0.4, gold: 480, fragments: 4 },
    { chance: 0.3, gold: 650, fragments: 5 },
    { chance: 0.2, gold: 900, fragments: 6 },
  ],
};

export function sellPrice(def, rarity, qty = 1) {
  if (!def || !def.value || def.tradable === false) return 0;
  return Math.max(1, Math.floor(def.value * (SELL_RARITY_MULT[rarity] || 1))) * qty;
}
