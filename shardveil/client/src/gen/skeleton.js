// The Shardveil humanoid skeleton. Bone names follow the Unreal Engine 5
// Mannequin convention so animations and outfits can be retargeted to UE5
// (and Mixamo / artist rigs mapped onto it) without renaming.
//
// Positions are bind-pose world positions in metres for a 1.78 m adult,
// facing +Z with +Y up. The character's left side is +X.

export const HUMANOID_BONES = [
  ['root', null, [0, 0, 0]],
  ['pelvis', 'root', [0, 0.96, 0]],
  ['spine_01', 'pelvis', [0, 1.05, -0.005]],
  ['spine_02', 'spine_01', [0, 1.18, -0.01]],
  ['spine_03', 'spine_02', [0, 1.32, -0.01]],
  ['neck_01', 'spine_03', [0, 1.5, -0.005]],
  ['head', 'neck_01', [0, 1.6, 0.01]],
  ['clavicle_l', 'spine_03', [0.035, 1.45, 0.0]],
  ['upperarm_l', 'clavicle_l', [0.175, 1.455, -0.01]],
  ['lowerarm_l', 'upperarm_l', [0.255, 1.175, -0.015]],
  ['hand_l', 'lowerarm_l', [0.29, 0.93, 0.02]],
  ['clavicle_r', 'spine_03', [-0.035, 1.45, 0.0]],
  ['upperarm_r', 'clavicle_r', [-0.175, 1.455, -0.01]],
  ['lowerarm_r', 'upperarm_r', [-0.255, 1.175, -0.015]],
  ['hand_r', 'lowerarm_r', [-0.29, 0.93, 0.02]],
  ['thigh_l', 'pelvis', [0.095, 0.92, 0.0]],
  ['calf_l', 'thigh_l', [0.105, 0.5, 0.02]],
  ['foot_l', 'calf_l', [0.11, 0.085, -0.01]],
  ['ball_l', 'foot_l', [0.11, 0.025, 0.12]],
  ['thigh_r', 'pelvis', [-0.095, 0.92, 0.0]],
  ['calf_r', 'thigh_r', [-0.105, 0.5, 0.02]],
  ['foot_r', 'calf_r', [-0.11, 0.085, -0.01]],
  ['ball_r', 'foot_r', [-0.11, 0.025, 0.12]],
];

export const BONE_POS = Object.fromEntries(HUMANOID_BONES.map(([n, , p]) => [n, p]));
export const BONE_INDEX = Object.fromEntries(HUMANOID_BONES.map(([n], i) => [n, i]));

// Attachment sockets: name -> [bone, local offset, local euler]. Weapons and
// rigid gear (hats, back items) attach here; skinned outfits bind to the bones.
export const SOCKETS = {
  hand_r: ['hand_r', [0, -0.075, 0.02], [0, 0, 0]],
  hand_l: ['hand_l', [0, -0.075, 0.02], [0, 0, 0]],
  back: ['spine_03', [0, 0.02, -0.17], [0, 0, 0]],
  head: ['head', [0, 0.0, 0], [0, 0, 0]],
};

// Bones driven by "upper body" actions (attacks, casts, hit reacts) while the
// legs keep their locomotion.
export const UPPER_BODY = new Set(['spine_02', 'spine_03', 'neck_01', 'head',
  'clavicle_l', 'upperarm_l', 'lowerarm_l', 'hand_l', 'clavicle_r', 'upperarm_r', 'lowerarm_r', 'hand_r']);
