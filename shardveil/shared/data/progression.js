// Leveling curve and general balance knobs. Server-controlled configuration:
// tune here, restart the server, every client picks the values up.

export const PROGRESSION = {
  maxLevel: 30,
  xpBase: 80,
  xpExponent: 1.75,
  // Monsters far below the killer's level give reduced XP.
  xpLevelPenalty: { freeGap: 3, perLevel: 0.2, floor: 0.1 },
  deathXpLossFraction: 0.03, // of the XP needed for the current level
  deathXpLossFromLevel: 6,   // no XP loss before this level
  reviveHpFraction: 0.5,
  regen: { outOfCombatDelay: 5, hpPerSecFraction: 0.02, mpPerSecFraction: 0.03 },
  moveSpeed: 6.2,            // metres per second, base player run speed
  inventorySlots: 40,
  startingGold: 25,
  lootOwnershipSeconds: 25,  // only the top-damage player may loot early
  lootDespawnSeconds: 120,
  maxCharactersPerAccount: 4,
};

export function xpForLevel(level) {
  // XP required to advance FROM `level` to level + 1.
  if (level >= PROGRESSION.maxLevel) return Infinity;
  return Math.round(PROGRESSION.xpBase * Math.pow(level, PROGRESSION.xpExponent));
}

export function xpLevelMultiplier(playerLevel, monsterLevel) {
  const { freeGap, perLevel, floor } = PROGRESSION.xpLevelPenalty;
  const gap = playerLevel - monsterLevel;
  if (gap <= freeGap) return 1;
  return Math.max(floor, 1 - (gap - freeGap) * perLevel);
}
