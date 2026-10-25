// Keyframed animation clips for the humanoid skeleton, sampled from pose
// functions at 30 fps into real AnimationClips (exported into the GLB).
// Rotations are local Euler XYZ offsets from the bind pose (identity).
// Conventions on this rig: limbs hang along -Y; a negative X rotation swings
// an arm or leg forward (+Z); a positive X rotation on a calf bends the knee.
//
// STATUS: hand-authored procedural motion. Replace with motion-captured or
// animator-made clips using the same names (see docs/ASSETS.md).
import * as THREE from 'three';

const FPS = 30;
const S = Math.sin, C = Math.cos, PI = Math.PI;
const ease = (t) => t * t * (3 - 2 * t);
const env = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const bump = (t, a, peak, b) => (t < a || t > b ? 0 : t < peak ? ease(env(t, a, peak)) : 1 - ease(env(t, peak, b)));

function clip(name, duration, poseFn, { loop = true } = {}) {
  const frames = Math.max(2, Math.round(duration * FPS) + 1);
  const times = [];
  const rot = {};
  const pos = [];
  const q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < frames; i++) {
    const t = (i / (frames - 1)) * duration;
    times.push(t);
    const pose = poseFn(loop ? t / duration : t);
    for (const [bone, r] of Object.entries(pose.r)) {
      (rot[bone] ||= []);
      e.set(r[0] || 0, r[1] || 0, r[2] || 0);
      q.setFromEuler(e);
      rot[bone].push(q.x, q.y, q.z, q.w);
    }
    const p = pose.p || [0, 0, 0];
    pos.push(p[0], 0.96 + p[1], p[2]);
  }
  const tracks = Object.entries(rot).map(([bone, v]) => new THREE.QuaternionKeyframeTrack(`${bone}.quaternion`, times, v));
  // Pelvis translation is an offset from its bind position (0, 0.96, 0).
  tracks.push(new THREE.VectorKeyframeTrack('pelvis.position', times, pos));
  return new THREE.AnimationClip(name, duration, tracks);
}

// Relaxed arms: hanging slightly out from the body with soft elbows.
const relaxed = (sway = 0) => ({
  upperarm_l: [0.05 + sway, 0, 0.1], upperarm_r: [0.05 - sway, 0, -0.1],
  lowerarm_l: [-0.25, 0, 0], lowerarm_r: [-0.35, 0, 0],
});

// Staff / weapon hand pose held in front: right forearm forward.
const ready = { upperarm_r: [-0.15, 0, -0.12], lowerarm_r: [-0.85, 0.2, 0], hand_r: [0.25, 0, 0] };

export function buildClips() {
  const idle = clip('Idle', 3.2, (u) => {
    const b = S(u * 2 * PI);
    return {
      r: {
        spine_01: [0.02 * b, 0, 0], spine_03: [0.025 * b, 0, 0], neck_01: [-0.02 * b, 0.05 * S(u * 2 * PI + 1), 0],
        head: [0.02 * b, 0.08 * S(u * 2 * PI), 0],
        ...relaxed(0.02 * b), ...ready,
        upperarm_r: [-0.15 + 0.02 * b, 0, -0.12],
        clavicle_l: [0, 0, 0.02 * b], clavicle_r: [0, 0, -0.02 * b],
        thigh_l: [0, 0, 0.03], thigh_r: [0, 0, -0.03], calf_l: [0.02, 0, 0], calf_r: [0.02, 0, 0],
      },
      p: [0, -0.004 + 0.004 * b, 0],
    };
  });

  const gait = (name, dur, amp, lean, armAmp, bob) => clip(name, dur, (u) => {
    const ph = u * 2 * PI;
    const l = S(ph), r = S(ph + PI);
    const kneeL = Math.max(0, S(ph + PI * 0.55)) * amp * 1.6 + 0.08;
    const kneeR = Math.max(0, S(ph + PI * 1.55)) * amp * 1.6 + 0.08;
    return {
      r: {
        pelvis: [0, 0.08 * l * amp, 0.03 * C(ph * 2) * amp],
        spine_01: [lean * 0.5, -0.06 * l * amp, 0], spine_02: [lean * 0.3, -0.08 * l * amp, 0], spine_03: [lean * 0.2, -0.06 * l * amp, 0],
        neck_01: [-lean * 0.6, 0.1 * l * amp, 0], head: [-lean * 0.2, 0.05 * l * amp, 0],
        thigh_l: [-l * amp, 0, 0.02], thigh_r: [-r * amp, 0, -0.02],
        calf_l: [kneeL, 0, 0], calf_r: [kneeR, 0, 0],
        foot_l: [-0.25 * Math.max(0, -l) * amp + 0.15 * Math.max(0, l) * amp, 0, 0],
        foot_r: [-0.25 * Math.max(0, -r) * amp + 0.15 * Math.max(0, r) * amp, 0, 0],
        upperarm_l: [r * armAmp, 0, 0.1], upperarm_r: [l * armAmp * 0.6 - 0.15, 0, -0.12],
        lowerarm_l: [-0.35 - armAmp * 0.8 * Math.max(0, -r), 0, 0], lowerarm_r: [-0.85 - armAmp * 0.4, 0.2, 0], hand_r: [0.25, 0, 0],
      },
      p: [0, -Math.abs(C(ph)) * bob + bob * 0.3, 0],
    };
  });
  const walk = gait('Walk', 1.05, 0.42, 0.04, 0.32, 0.03);
  const run = gait('Run', 0.68, 0.72, 0.2, 0.7, 0.06);

  // Overhead strike with the weapon hand: wind-up, release, recover.
  const attack = clip('Attack', 0.72, (t) => {
    const wind = bump(t, 0, 0.22, 0.34), strike = bump(t, 0.22, 0.36, 0.72);
    return {
      r: {
        spine_02: [-0.15 * wind + 0.25 * strike, 0.35 * wind - 0.45 * strike, 0],
        spine_03: [-0.1 * wind + 0.15 * strike, 0.25 * wind - 0.3 * strike, 0],
        upperarm_r: [-0.15 - 2.6 * wind + 1.2 * strike - 1.2 * strike * wind, 0, -0.12 - 0.3 * wind],
        lowerarm_r: [-0.85 - 0.6 * wind + 0.5 * strike, 0.2, 0], hand_r: [0.25 + 0.4 * wind - 0.6 * strike, 0, 0],
        upperarm_l: [0.05 - 0.6 * wind + 0.3 * strike, 0, 0.25 * wind + 0.1], lowerarm_l: [-0.25 - 0.7 * wind, 0, 0],
        head: [0.05 * strike, -0.2 * wind + 0.25 * strike, 0],
      },
    };
  }, { loop: false });

  // Staff thrust: both hands drive the staff forward, crystal first.
  const staffAttack = clip('AttackStaff', 0.7, (t) => {
    const wind = bump(t, 0, 0.2, 0.3), thrust = bump(t, 0.2, 0.32, 0.7);
    return {
      r: {
        spine_02: [-0.08 * wind + 0.2 * thrust, 0.3 * wind - 0.25 * thrust, 0],
        upperarm_r: [-0.15 - 0.5 * wind - 1.1 * thrust, 0, -0.12 + 0.2 * thrust], lowerarm_r: [-0.85 - 0.3 * wind + 0.45 * thrust, 0.2, 0],
        hand_r: [0.25 + 1.0 * thrust, 0, 0],
        upperarm_l: [0.05 - 0.9 * thrust, 0, 0.1 - 0.35 * thrust], lowerarm_l: [-0.25 - 0.9 * thrust, 0, 0],
      },
    };
  }, { loop: false });

  // Spell cast: gather energy low, then raise both hands outward.
  const cast = clip('Cast', 0.95, (t) => {
    const gather = bump(t, 0, 0.3, 0.45), release = bump(t, 0.35, 0.5, 0.95);
    return {
      r: {
        spine_02: [-0.1 * release + 0.12 * gather, 0, 0], spine_03: [-0.12 * release, 0, 0], head: [-0.12 * release, 0, 0],
        upperarm_l: [0.05 - 0.6 * gather - 1.5 * release, 0, 0.1 + 0.35 * release], lowerarm_l: [-0.25 - 1.0 * gather + 0.6 * release, 0, 0],
        upperarm_r: [-0.15 - 0.4 * gather - 1.6 * release, 0, -0.12 - 0.3 * release], lowerarm_r: [-0.85 - 0.3 * gather + 0.5 * release, 0.2, 0],
        hand_r: [0.25 - 0.3 * release, 0, 0],
      },
    };
  }, { loop: false });

  const hit = clip('Hit', 0.42, (t) => {
    const k = bump(t, 0, 0.08, 0.42);
    return {
      r: {
        spine_02: [-0.22 * k, 0.1 * k, 0], spine_03: [-0.15 * k, 0, 0], head: [-0.3 * k, -0.1 * k, 0],
        upperarm_l: [0.05 + 0.3 * k, 0, 0.1 + 0.25 * k], upperarm_r: [-0.15 + 0.2 * k, 0, -0.12 - 0.2 * k],
        lowerarm_l: [-0.25, 0, 0], lowerarm_r: [-0.85, 0.2, 0], hand_r: [0.25, 0, 0],
      },
    };
  }, { loop: false });

  // Knees buckle, then the body falls back and settles.
  const death = clip('Death', 1.5, (t) => {
    const buckle = ease(env(t, 0, 0.45)), fall = ease(env(t, 0.3, 1.05)), settle = bump(t, 1.0, 1.15, 1.4);
    return {
      r: {
        pelvis: [-1.35 * fall, 0.2 * fall, 0.1 * fall],
        spine_01: [0.25 * buckle - 0.1 * fall, 0, 0], spine_02: [0.15 * buckle, 0, 0], head: [0.3 * buckle - 0.5 * fall + 0.1 * settle, 0.3 * fall, 0],
        thigh_l: [-1.2 * buckle + 0.9 * fall, 0, 0.15], thigh_r: [-0.9 * buckle + 0.7 * fall, 0, -0.2],
        calf_l: [1.6 * buckle - 1.2 * fall, 0, 0], calf_r: [1.3 * buckle - 0.9 * fall, 0, 0],
        upperarm_l: [-0.4 * buckle - 1.2 * fall, 0, 0.3 + 0.6 * fall], upperarm_r: [-0.4 * buckle - 1.0 * fall, 0, -0.3 - 0.7 * fall],
        lowerarm_l: [-0.6 * buckle + 0.4 * fall, 0, 0], lowerarm_r: [-0.85 + 0.5 * fall, 0.2, 0],
      },
      p: [0, -0.45 * buckle - 0.32 * fall + 0.02 * settle, -0.25 * fall],
    };
  }, { loop: false });

  return [idle, walk, run, attack, staffAttack, cast, hit, death];
}
