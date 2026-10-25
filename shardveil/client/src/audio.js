// Procedural sound: every effect is synthesised with WebAudio, so there are
// no audio files to license. Starts on the first user gesture (browser rule).
import { settings } from './settings.js';

let ctx = null, master = null, ambient = null, noiseBuf = null;

export function initAudio() {
  if (ctx) return;
  try { ctx = new AudioContext(); } catch { return; }
  master = ctx.createGain();
  master.gain.value = settings.volume;
  master.connect(ctx.destination);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  startAmbient();
}

export function setVolume(v) {
  if (master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
}

function env(node, t, a, peak, decay) {
  node.gain.setValueAtTime(0.0001, t);
  node.gain.exponentialRampToValueAtTime(peak, t + a);
  node.gain.exponentialRampToValueAtTime(0.0001, t + a + decay);
}

function tone(freq, { type = 'sine', a = 0.005, peak = 0.3, decay = 0.2, slide = 0, delay = 0, dest = master } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + a + decay);
  env(g, t, a, peak, decay);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + a + decay + 0.05);
}

function noise({ freq = 1200, q = 1, a = 0.005, peak = 0.3, decay = 0.15, type = 'bandpass', delay = 0, dest = master } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain();
  env(g, t, a, peak, decay);
  src.connect(f).connect(g).connect(dest);
  src.start(t, Math.random());
  src.stop(t + a + decay + 0.05);
}

export const sfx = {
  swing: () => noise({ freq: 900, q: 0.8, a: 0.02, peak: 0.18, decay: 0.12, type: 'bandpass' }),
  hit: (crit) => { noise({ freq: 500, q: 1.5, peak: crit ? 0.45 : 0.3, decay: 0.09 }); tone(crit ? 180 : 140, { type: 'triangle', peak: 0.2, decay: 0.12, slide: 0.5 }); },
  hurt: () => { noise({ freq: 300, q: 1, peak: 0.25, decay: 0.12 }); tone(110, { type: 'sawtooth', peak: 0.08, decay: 0.15, slide: 0.6 }); },
  cast: (fx) => {
    if (fx === 'frost') { tone(1400, { type: 'sine', peak: 0.12, decay: 0.35, slide: 1.6 }); noise({ freq: 5000, q: 2, peak: 0.08, decay: 0.3 }); }
    else if (fx === 'heal') { [523, 659, 784].forEach((f, i) => tone(f, { peak: 0.1, decay: 0.5, delay: i * 0.06 })); }
    else if (fx === 'roots') { noise({ freq: 180, q: 0.7, a: 0.05, peak: 0.35, decay: 0.4, type: 'lowpass' }); }
    else if (fx === 'aura_bronze') { tone(220, { type: 'triangle', peak: 0.18, decay: 0.6 }); tone(330, { type: 'triangle', peak: 0.1, decay: 0.6 }); }
    else { tone(320, { type: 'sawtooth', a: 0.03, peak: 0.08, decay: 0.3, slide: 2.2 }); noise({ freq: 1800, q: 1, a: 0.04, peak: 0.12, decay: 0.25 }); }
  },
  bolt: () => tone(600, { type: 'square', peak: 0.05, decay: 0.12, slide: 1.8 }),
  boom: () => { noise({ freq: 220, q: 0.6, a: 0.01, peak: 0.5, decay: 0.5, type: 'lowpass' }); tone(70, { type: 'sine', peak: 0.4, decay: 0.5, slide: 0.5 }); },
  coin: () => { tone(1320, { type: 'square', peak: 0.06, decay: 0.08 }); tone(1760, { type: 'square', peak: 0.06, decay: 0.15, delay: 0.06 }); },
  pickup: () => { tone(660, { type: 'triangle', peak: 0.12, decay: 0.12 }); tone(990, { type: 'triangle', peak: 0.1, decay: 0.15, delay: 0.05 }); },
  levelUp: () => [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, { type: 'triangle', peak: 0.16, decay: 0.7, delay: i * 0.09 })),
  death: () => [330, 262, 196].forEach((f, i) => tone(f, { type: 'sine', peak: 0.18, decay: 0.8, delay: i * 0.25 })),
  ui: () => tone(880, { type: 'sine', peak: 0.05, decay: 0.05 }),
  error: () => tone(160, { type: 'square', peak: 0.06, decay: 0.12 }),
  shard: () => { tone(1800, { peak: 0.08, decay: 1.2, slide: 0.5 }); tone(2400, { peak: 0.05, decay: 1.0, slide: 0.6, delay: 0.05 }); },
};

// Wind bed plus occasional birds by day, crickets by night.
function startAmbient() {
  const windGain = ctx.createGain();
  windGain.gain.value = 0.045;
  windGain.connect(master);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = 420; f.Q.value = 0.4;
  const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
  lfo.frequency.value = 0.07; lfoGain.gain.value = 220;
  lfo.connect(lfoGain).connect(f.frequency);
  src.connect(f).connect(windGain);
  src.start(); lfo.start();
  ambient = { windGain, night: 0 };
  const tick = () => {
    if (!ctx) return;
    if (ambient.night < 0.5) {
      if (Math.random() < 0.5) {
        const base = 2200 + Math.random() * 1600;
        for (let i = 0; i < 2 + Math.floor(Math.random() * 4); i++) tone(base * (0.9 + Math.random() * 0.25), { peak: 0.025, a: 0.01, decay: 0.07, slide: 1.3, delay: i * 0.11 });
      }
    } else {
      for (let i = 0; i < 6; i++) tone(4300, { type: 'square', peak: 0.008, a: 0.003, decay: 0.02, delay: i * 0.045 });
    }
    setTimeout(tick, 2500 + Math.random() * 5000);
  };
  setTimeout(tick, 3000);
}

export function setAmbientNight(n) {
  if (ambient) ambient.night = n;
}
