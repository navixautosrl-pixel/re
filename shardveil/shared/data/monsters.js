// Monster catalogue. `model` names a procedural archetype the client knows
// how to build; `loot` names an entry in LOOT_TABLES.

export const MONSTERS = {
  dusk_wolf: {
    id: 'dusk_wolf', name: 'Dusk Wolf', level: 2, hp: 70, attack: [5, 8], defense: 1,
    attackRange: 2.0, attackCooldown: 1.4, moveSpeed: 5.4, aggroRadius: 0, aggressive: false,
    leashRadius: 32, xp: 22, loot: 'dusk_wolf', model: 'wolf', scale: 1.0, color: '#4b4f57', radius: 0.7,
  },
  old_greymaw: {
    id: 'old_greymaw', name: 'Old Greymaw', title: 'Pack Elder', level: 6, hp: 900, attack: [14, 22], defense: 6,
    attackRange: 2.8, attackCooldown: 1.6, moveSpeed: 6.0, aggroRadius: 12, aggressive: true,
    leashRadius: 38, xp: 420, loot: 'old_greymaw', model: 'wolf', scale: 1.7, color: '#8d8b86', radius: 1.2,
    elite: true,
    // Telegraphed ground slam: a warned circle, then damage to all inside.
    special: { id: 'howling_slam', every: 9, windup: 1.4, radius: 5, mult: 1.8 },
  },
  mire_toad: {
    id: 'mire_toad', name: 'Mire Toad', level: 4, hp: 120, attack: [8, 12], defense: 2,
    attackRange: 2.2, attackCooldown: 1.7, moveSpeed: 4.0, aggroRadius: 0, aggressive: false,
    leashRadius: 28, xp: 40, loot: 'mire_toad', model: 'toad', scale: 1.0, color: '#5f6e3a', radius: 0.8,
  },
  thornback_boar: {
    id: 'thornback_boar', name: 'Thornback Boar', level: 5, hp: 170, attack: [11, 16], defense: 4,
    attackRange: 2.2, attackCooldown: 1.6, moveSpeed: 5.8, aggroRadius: 8, aggressive: true,
    leashRadius: 32, xp: 58, loot: 'thornback_boar', model: 'boar', scale: 1.0, color: '#5a4030', radius: 0.9,
  },
  thornling: {
    id: 'thornling', name: 'Thornling', level: 7, hp: 210, attack: [14, 20], defense: 6,
    attackRange: 2.4, attackCooldown: 1.5, moveSpeed: 4.6, aggroRadius: 10, aggressive: true,
    leashRadius: 30, xp: 80, loot: 'thornling', model: 'treant', scale: 1.0, color: '#3f5a2c', radius: 0.8,
  },
  shardtouched_wolf: {
    id: 'shardtouched_wolf', name: 'Shard-touched Wolf', level: 8, hp: 260, attack: [17, 24], defense: 6,
    attackRange: 2.1, attackCooldown: 1.3, moveSpeed: 5.8, aggroRadius: 11, aggressive: true,
    leashRadius: 34, xp: 98, loot: 'shardtouched_wolf', model: 'wolf', scale: 1.15, color: '#3e4760', radius: 0.8,
    glow: '#79d0ff',
  },
  // Veilshards are the zone's "living stones": they don't move or attack, but
  // when struck they call corrupted beasts to defend them.
  veilshard: {
    id: 'veilshard', name: 'Veilshard', level: 8, hp: 1600, attack: [0, 0], defense: 10,
    attackRange: 0, attackCooldown: 99, moveSpeed: 0, aggroRadius: 0, aggressive: false,
    leashRadius: 0, xp: 520, loot: 'veilshard', model: 'shard', scale: 1.0, color: '#7fd4ff', radius: 1.6,
    stationary: true,
    summon: { monster: 'shardtouched_wolf', atHpFractions: [0.8, 0.55, 0.3], count: 2 },
  },
};
