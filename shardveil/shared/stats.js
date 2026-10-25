// Character stat derivation and the damage formula. Pure functions shared by
// the server (authoritative) and the client (for tooltips and the stats panel).
import { CLASSES } from './data/classes.js';
import { ITEMS } from './data/items.js';

export const COMBAT = {
  mitigationK: 40,       // defense / (defense + K) of incoming damage is absorbed
  baseCrit: 5,           // percent
  critPerDex: 0.4,       // percent per point of dexterity
  critMult: 1.75,
  strToAttack: 0.6,
  intToMagic: 0.8,
  vitToDefense: 0.15,
  upgradeBonusPerLevel: 0.07, // +7% of an item's base stats per upgrade level
};

// equipment: array of { defId, affixes: {stat: value}, upgrade }
export function computeStats(classId, level, equipment = []) {
  const cls = CLASSES[classId];
  const s = {
    str: cls.baseStats.str + cls.perLevel.str * (level - 1),
    dex: cls.baseStats.dex + cls.perLevel.dex * (level - 1),
    int: cls.baseStats.int + cls.perLevel.int * (level - 1),
    vit: cls.baseStats.vit + cls.perLevel.vit * (level - 1),
  };
  let attackMin = 1, attackMax = 2, magicMin = 0, magicMax = 0;
  let defense = 0, bonusHp = 0, bonusMp = 0, bonusCrit = 0;

  for (const eq of equipment) {
    const def = ITEMS[eq.defId];
    if (!def || !def.stats) continue;
    const up = 1 + COMBAT.upgradeBonusPerLevel * (eq.upgrade || 0);
    const st = def.stats;
    if (st.attack) { attackMin += st.attack[0] * up; attackMax += st.attack[1] * up; }
    if (st.magic) { magicMin += st.magic[0] * up; magicMax += st.magic[1] * up; }
    if (st.defense) defense += st.defense * up;
    if (st.hp) bonusHp += st.hp * up;
    if (st.mp) bonusMp += st.mp * up;
    const af = eq.affixes || {};
    for (const k of ['str', 'dex', 'int', 'vit']) if (af[k]) s[k] += af[k];
    if (af.hp) bonusHp += af.hp;
    if (af.mp) bonusMp += af.mp;
    if (af.crit) bonusCrit += af.crit;
    if (af.defense) defense += af.defense;
  }

  defense += s.vit * COMBAT.vitToDefense;
  return {
    ...s,
    maxHp: Math.round(cls.hp.base + cls.hp.perVit * s.vit + cls.hp.perLevel * (level - 1) + bonusHp),
    maxMp: Math.round(cls.mp.base + cls.mp.perInt * s.int + cls.mp.perLevel * (level - 1) + bonusMp),
    attack: [Math.round(attackMin + s.str * COMBAT.strToAttack), Math.round(attackMax + s.str * COMBAT.strToAttack)],
    magic: [Math.round(magicMin + s.int * COMBAT.intToMagic), Math.round(magicMax + s.int * COMBAT.intToMagic)],
    defense: Math.round(defense),
    crit: Math.min(60, COMBAT.baseCrit + s.dex * COMBAT.critPerDex + bonusCrit),
  };
}

export function mitigate(amount, defense) {
  const d = Math.max(0, defense);
  return amount * (1 - d / (d + COMBAT.mitigationK));
}

// attacker: { attack:[min,max], magic:[min,max], crit }   defender: { defense }
export function rollDamage(rng, attacker, defenderDefense, kind, mult) {
  const range = kind === 'magical' ? attacker.magic : attacker.attack;
  const base = range[0] + (range[1] - range[0]) * rng();
  const crit = rng() * 100 < (attacker.crit || 0);
  let amount = mitigate(base * mult, defenderDefense);
  if (crit) amount *= COMBAT.critMult;
  return { amount: Math.max(1, Math.round(amount)), crit };
}
