// Zone definitions. Everything about the starting zone's shape lives here as
// data: terrain features, the town, roads, regions, monster spawns and NPCs.
// Server and client both read it, so a layout change is a one-file edit.

export const ZONES = {
  hollowmere: {
    id: 'hollowmere',
    name: 'Hollowmere Vale',
    seed: 1337,
    size: 400,            // world spans [-200, 200] on x and z
    walkBound: 182,       // beyond this the vale is closed in by mountains
    waterLevel: -1.0,
    respawn: { x: 0, z: 6 }, // revive point, beside Emberford's brazier

    town: {
      id: 'emberford',
      name: 'Emberford',
      x: 0, z: 0,
      flatRadius: 34,     // ground is levelled inside this radius
      blendRadius: 58,
      height: 2.0,
      safeRadius: 44,     // no monster aggro or PvP inside
      palisadeRadius: 36,
      // gates are gaps in the palisade, given as angles in radians (0 = +x / east)
      gates: [
        { angle: 0, width: 0.32 },            // east road -> Thornwood
        { angle: -Math.PI / 2, width: 0.32 }, // north road -> Shardscar Ridge
        { angle: Math.PI, width: 0.32 },      // west road -> Hollowmere shore
        { angle: Math.PI / 2, width: 0.26 },  // south lane -> Greenhollow
      ],
      buildings: [
        { id: 'inn', name: 'The Banked Coal', x: -16, z: -14, w: 12, d: 9, h: 6, roof: 'gable', rot: 0 },
        { id: 'smithy', name: 'Harrow Forge', x: 17, z: -15, w: 10, d: 8, h: 5, roof: 'shed', rot: 0 },
        { id: 'merchant', name: 'Odd & Sundry', x: 18, z: 14, w: 9, d: 8, h: 5, roof: 'gable', rot: 0 },
        { id: 'hall', name: 'Hall of Embers', x: -17, z: 15, w: 13, d: 10, h: 7, roof: 'gable', rot: 0 },
        { id: 'house1', x: -26, z: 0, w: 6, d: 7, h: 4, roof: 'gable', rot: 0 },
        { id: 'house2', x: 27, z: 1, w: 6, d: 6, h: 4, roof: 'gable', rot: 0 },
        { id: 'house3', x: 4, z: -27, w: 7, d: 5, h: 4, roof: 'gable', rot: 0 },
      ],
    },

    // Roads are flattened, dirt-coloured strips. Polylines in world space.
    roads: [
      [[0, 0], [60, -8], [110, -4], [150, 10]],
      [[0, 0], [6, -60], [-10, -110], [0, -150]],
      [[0, 0], [-55, 10], [-70, 40]],
      [[0, 0], [-4, 60], [10, 120]],
    ],

    lake: { x: -105, z: 70, radius: 34, depth: 5 },
    ridge: { startZ: -95, fullZ: -150, height: 26 }, // mountains rising to the north

    regions: [
      { id: 'emberford', name: 'Emberford', x: 0, z: 0, radius: 44, level: [1, 1], pvp: false },
      { id: 'greenhollow', name: 'Greenhollow Meadows', x: 0, z: 85, radius: 75, level: [1, 4], pvp: false },
      { id: 'hollowmere-shore', name: 'Hollowmere Shore', x: -100, z: 50, radius: 60, level: [3, 6], pvp: false },
      { id: 'thornwood', name: 'Thornwood', x: 120, z: 20, radius: 70, level: [4, 8], pvp: false },
      { id: 'shardscar', name: 'Shardscar Ridge', x: 0, z: -125, radius: 70, level: [6, 10], pvp: false },
    ],

    // Monster spawn groups. count monsters wander within radius of (x, z).
    spawns: [
      { monster: 'dusk_wolf', x: 0, z: 75, radius: 22, count: 6, respawn: 12 },
      { monster: 'dusk_wolf', x: -40, z: 95, radius: 20, count: 5, respawn: 12 },
      { monster: 'dusk_wolf', x: 40, z: 100, radius: 20, count: 5, respawn: 12 },
      { monster: 'old_greymaw', x: 25, z: 140, radius: 8, count: 1, respawn: 180 },
      { monster: 'mire_toad', x: -70, z: 55, radius: 16, count: 5, respawn: 15 },
      { monster: 'mire_toad', x: -120, z: 25, radius: 16, count: 5, respawn: 15 },
      { monster: 'thornback_boar', x: 95, z: 15, radius: 22, count: 6, respawn: 15 },
      { monster: 'thornback_boar', x: 140, z: -25, radius: 20, count: 5, respawn: 15 },
      { monster: 'thornling', x: 130, z: 50, radius: 18, count: 5, respawn: 18 },
      { monster: 'shardtouched_wolf', x: -30, z: -120, radius: 22, count: 5, respawn: 18 },
      { monster: 'shardtouched_wolf', x: 35, z: -110, radius: 22, count: 5, respawn: 18 },
      { monster: 'veilshard', x: 10, z: -135, radius: 30, count: 3, respawn: 90 },
      { monster: 'veilshard', x: 120, z: -60, radius: 15, count: 1, respawn: 90 },
    ],

    npcs: [
      { id: 'warden_ilsa', name: 'Warden Ilsa', role: 'quest', x: 3, z: 9, ry: Math.PI },
      { id: 'merchant_odd', name: 'Pell Oddery', role: 'merchant', shop: 'general', x: 16, z: 9, ry: Math.PI },
      { id: 'smith_harrow', name: 'Dagny Harrow', role: 'merchant', shop: 'smith', x: 15, z: -9, ry: 0 },
      { id: 'keeper_bram', name: 'Keeper Bram', role: 'storage', x: -10, z: -8, ry: 0 },
    ],
  },
};

export const DEFAULT_ZONE = 'hollowmere';
