// Calm seaside sound, synthesised with the Web Audio API. No audio files, so nothing to license or fail to load.
// Nothing starts until the first tap (browsers block autoplay) and everything pauses when the tab is hidden.
let ctx = null, master, musicBus, sfxBus, duck, noiseBuf;
let unlocked = false, wantMusic = true, wantSfx = true, mood = 'day';
let musicTimer = null, ambTimer = null, nextBeat = 0, beat = 0;
const voices = [];

const pent = [0, 2, 4, 7, 9]; // major pentatonic
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const CHORDS = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]; // C Am F G

function makeNoise() {
  const len = ctx.sampleRate * 2;
  const b = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

function tone({ f, f2, type = 'sine', t = 0, dur = 0.2, vol = 0.2, atk = 0.005, bus = sfxBus }) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  const s = ctx.currentTime + t;
  o.type = type;
  o.frequency.setValueAtTime(f, s);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + dur);
  g.gain.setValueAtTime(0.0001, s);
  g.gain.exponentialRampToValueAtTime(vol, s + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
  o.connect(g); g.connect(bus);
  o.start(s); o.stop(s + dur + 0.05);
  return g;
}
function noise({ t = 0, dur = 0.1, freq = 800, f2, q = 1, type = 'bandpass', vol = 0.2, bus = sfxBus }) {
  const src = ctx.createBufferSource(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
  const s = ctx.currentTime + t;
  src.buffer = noiseBuf;
  flt.type = type; flt.Q.value = q;
  flt.frequency.setValueAtTime(freq, s);
  if (f2) flt.frequency.exponentialRampToValueAtTime(f2, s + dur);
  g.gain.setValueAtTime(0.0001, s);
  g.gain.exponentialRampToValueAtTime(vol, s + Math.min(0.01, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
  src.connect(flt); flt.connect(g); g.connect(bus);
  src.start(s, Math.random()); src.stop(s + dur + 0.05);
  return g;
}

// ---- effects ----
const SFX = {
  click: () => tone({ f: 900, f2: 700, dur: 0.03, vol: 0.04 }),
  pop: () => tone({ f: 500, f2: 900, dur: 0.07, vol: 0.12 }),
  pick: () => { noise({ freq: 420, q: 4, dur: 0.07, vol: 0.25 }); tone({ f: 190, f2: 120, dur: 0.09, vol: 0.2, type: 'triangle' }); },
  drop: () => { tone({ f: 140, f2: 70, dur: 0.14, vol: 0.3 }); noise({ type: 'lowpass', freq: 500, dur: 0.06, vol: 0.12 }); },
  correct: () => [523, 659, 784].forEach((f, i) => tone({ f, t: i * 0.08, dur: 0.4, vol: 0.16, type: 'triangle' })),
  wrong: () => {
    tone({ f: 160, f2: 85, dur: 0.24, vol: 0.34 });
    [0.08, 0.14, 0.2].forEach((t) => noise({ t, freq: 650, q: 6, dur: 0.05, vol: 0.12 }));
  },
  hint: () => { tone({ f: 2400, dur: 0.18, vol: 0.1 }); tone({ f: 3200, t: 0.03, dur: 0.12, vol: 0.05 }); },
  reveal: () => noise({ freq: 300, f2: 1400, q: 0.8, dur: 0.28, vol: 0.1 }),
  coin: () => { tone({ f: 1760, dur: 0.14, vol: 0.1 }); tone({ f: 2349, t: 0.05, dur: 0.2, vol: 0.09 }); },
  coinRich: () => [1760, 2349, 2794].forEach((f, i) => tone({ f, t: i * 0.06, dur: 0.22, vol: 0.09 })),
  sparkle: () => [1047, 1319, 1568, 2093].forEach((f, i) => tone({ f, t: i * 0.06, dur: 0.25, vol: 0.07 })),
  fanfare: () => { [523, 659, 784, 1047].forEach((f, i) => tone({ f, t: i * 0.1, dur: 0.5, vol: 0.12, type: 'triangle' })); tone({ f: 1568, t: 0.4, dur: 0.6, vol: 0.06 }); },
  streak: () => { noise({ freq: 400, f2: 3000, q: 0.7, dur: 0.3, vol: 0.12 }); tone({ f: 1318, t: 0.28, dur: 0.5, vol: 0.12 }); },
  build: () => { [0, 0.12, 0.24, 0.36].forEach((t) => { noise({ t, freq: 700, q: 3, dur: 0.05, vol: 0.2 }); tone({ f: 320, f2: 200, t, dur: 0.06, vol: 0.12, type: 'square' }); }); tone({ f: 880, t: 0.5, dur: 0.9, vol: 0.14 }); tone({ f: 1320, t: 0.5, dur: 0.7, vol: 0.06 }); },
  stamp: () => { tone({ f: 95, f2: 45, dur: 0.22, vol: 0.4 }); noise({ type: 'lowpass', freq: 700, dur: 0.1, vol: 0.2 }); },
  horn: () => {
    [110, 165].forEach((f) => { const g = tone({ f, type: 'sawtooth', dur: 0.7, vol: 0.07, atk: 0.06 }); });
    noise({ type: 'lowpass', freq: 300, f2: 1200, q: 0.5, t: 0.1, dur: 0.7, vol: 0.12 });
  },
};

export const Sound = {
  init(profile) { wantMusic = profile.music; wantSfx = profile.sfx; },
  // call from the first user gesture
  unlock() {
    if (unlocked) { if (ctx && ctx.state === 'suspended' && !document.hidden) ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      duck = ctx.createGain(); duck.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = wantMusic ? 1 : 0; musicBus.connect(duck);
      sfxBus = ctx.createGain(); sfxBus.gain.value = wantSfx ? 1 : 0; sfxBus.connect(master);
      noiseBuf = makeNoise();
      unlocked = true;
      startAmbience();
      startMusic();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { unlocked = false; ctx = null; } // stay silent, never block play
  },
  play(name) {
    if (!unlocked || !wantSfx || !ctx || ctx.state !== 'running' || !SFX[name]) return;
    try {
      const now = ctx.currentTime;
      while (voices.length && voices[0] < now) voices.shift();
      if (voices.length >= 4) { sfxBus.gain.cancelScheduledValues(now); sfxBus.gain.setValueAtTime(sfxBus.gain.value, now); sfxBus.gain.linearRampToValueAtTime(0.55, now + 0.03); sfxBus.gain.linearRampToValueAtTime(1, now + 0.4); voices.shift(); }
      voices.push(now + 0.5);
      SFX[name]();
    } catch (e) {}
  },
  setMusic(on, sample) {
    wantMusic = on;
    if (ctx) musicBus.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.15);
    if (on && sample) this.play('pop');
  },
  setSfx(on, sample) {
    wantSfx = on;
    if (ctx) sfxBus.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.02);
    if (on && sample) setTimeout(() => this.play('correct'), 30);
  },
  duck(on) { if (ctx) duck.gain.setTargetAtTime(on ? 0.3 : 1, ctx.currentTime, 0.25); },
  setMood(m) { mood = m; },
  pause() { if (ctx && ctx.state === 'running') ctx.suspend(); },
  resume() { if (ctx && ctx.state === 'suspended' && unlocked) ctx.resume(); },
};

// ---- ambience: slow waves, now and then a gull and a bell buoy ----
function startAmbience() {
  const src = ctx.createBufferSource(), flt = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
  src.buffer = noiseBuf; src.loop = true;
  flt.type = 'lowpass'; flt.frequency.value = 520;
  g.gain.value = 0.05;
  lfo.frequency.value = 0.11; lg.gain.value = 0.035;
  lfo.connect(lg); lg.connect(g.gain);
  src.connect(flt); flt.connect(g); g.connect(musicBus);
  src.start(); lfo.start();
  const scheduleBit = () => {
    if (ctx.state === 'running' && wantMusic) {
      if (Math.random() < 0.55) { // gull
        const t0 = ctx.currentTime;
        for (let i = 0; i < 2; i++) tone({ f: 1900, f2: 1250, t: i * 0.22, dur: 0.2, vol: 0.018, type: 'triangle', bus: musicBus });
        void t0;
      } else { // bell buoy
        tone({ f: 523, dur: 1.6, vol: 0.03, bus: musicBus });
        tone({ f: 1568, dur: 1.0, vol: 0.012, bus: musicBus });
      }
    }
    ambTimer = setTimeout(scheduleBit, 7000 + Math.random() * 9000);
  };
  ambTimer = setTimeout(scheduleBit, 3500);
}

// ---- music: marimba arpeggios over a four-chord loop, slower at night ----
function startMusic() {
  nextBeat = ctx.currentTime + 0.3; beat = 0;
  const step = () => {
    const spb = 60 / (mood === 'night' ? 62 : mood === 'market' ? 96 : 80);
    while (nextBeat < ctx.currentTime + 0.4) {
      if (wantMusic && ctx.state === 'running') playBeat(nextBeat - ctx.currentTime, spb);
      nextBeat += spb; beat++;
    }
  };
  musicTimer = setInterval(step, 120);
}
function playBeat(t, spb) {
  const chord = CHORDS[Math.floor(beat / 4) % 4];
  const b = beat % 4;
  const lift = mood === 'night' ? -12 : 0;
  if (b === 0 || b === 2) tone({ f: hz(chord[0] - 24 + lift), t, dur: spb * 1.6, vol: 0.09, type: 'triangle', bus: musicBus }); // pizzicato bass
  if (Math.random() < 0.8) { // marimba
    const n = b % 2 ? chord[Math.floor(Math.random() * 3)] + 12 : 72 + pent[Math.floor(Math.random() * 5)]; // pentatonic fits all four chords
    tone({ f: hz(n + lift), t, dur: spb * 1.2, vol: 0.06, atk: 0.003, bus: musicBus });
    tone({ f: hz(n + lift) * 4, t, dur: spb * 0.3, vol: 0.012, bus: musicBus });
  }
  if (b === 0 && Math.floor(beat / 4) % 2 === 0) { // soft ukulele strum
    chord.forEach((m, i) => tone({ f: hz(m + 12 + lift), t: t + i * 0.025, dur: spb * 0.9, vol: 0.03, type: 'triangle', bus: musicBus }));
  }
}

document.addEventListener('visibilitychange', () => (document.hidden ? Sound.pause() : Sound.resume()));
window.addEventListener('pagehide', () => Sound.pause());
