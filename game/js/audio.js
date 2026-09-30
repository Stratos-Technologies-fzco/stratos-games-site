// Audio: synthesized sound effects and music (no files needed), Kiki's voice
// and question read-aloud. Recorded voice files listed in dialogue.json
// "voiceFiles" are used first; otherwise the browser's built-in English
// speech voice is used. Nothing plays until the player's first tap
// (browser autoplay policy).

import { state } from './state.js';
import { content } from './content.js';

let ctx = null;
let unlocked = false;
let musicTimer = null;
let musicGain = null;
let currentVoice = null;

function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  const c = audioCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
  if (state.settings.music) startMusic();
}

export function isAudioUnlocked() {
  return unlocked;
}

function tone(freq, start, dur, { type = 'sine', gain = 0.15, dest } = {}) {
  const c = audioCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g).connect(dest || c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.05);
}

const SFX = {
  tap: () => tone(660, 0, 0.08, { type: 'triangle', gain: 0.08 }),
  correct: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.25, { type: 'triangle' })),
  wrong: () => {
    tone(330, 0, 0.18, { type: 'sine', gain: 0.12 });
    tone(262, 0.15, 0.25, { type: 'sine', gain: 0.12 });
  },
  star: () => [784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.3, { type: 'sine', gain: 0.12 })),
  coin: () => [988, 1319].forEach((f, i) => tone(f, i * 0.06, 0.15, { type: 'square', gain: 0.05 })),
  fanfare: () =>
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.35, { type: 'triangle', gain: 0.13 })),
  pop: () => tone(880, 0, 0.06, { type: 'sine', gain: 0.1 }),
  flash: (i = 0) => tone([392, 494, 587, 698, 784, 880, 988, 1047, 1175][i % 9], 0, 0.3, { type: 'sine', gain: 0.14 })
};

export function sfx(name, arg) {
  if (!state.settings.sound || !unlocked) return;
  try {
    SFX[name] && SFX[name](arg);
  } catch {
    /* audio is never allowed to break gameplay */
  }
}

// Gentle pentatonic loop, very quiet.
export function startMusic() {
  if (musicTimer || !unlocked) return;
  const c = audioCtx();
  if (!c) return;
  musicGain = c.createGain();
  musicGain.gain.value = 0.35;
  musicGain.connect(c.destination);
  const notes = [262, 294, 330, 392, 440, 523];
  const bass = [131, 147, 175, 196];
  let step = 0;
  const play = () => {
    if (!state.settings.music) return;
    const n = notes[(step * 7 + (step >> 2)) % notes.length];
    tone(n, 0, 0.5, { type: 'sine', gain: 0.035, dest: musicGain });
    if (step % 4 === 0) tone(bass[(step >> 2) % bass.length], 0, 1.4, { type: 'triangle', gain: 0.03, dest: musicGain });
    step++;
  };
  musicTimer = setInterval(play, 420);
}

export function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
  if (musicGain) {
    try {
      musicGain.disconnect();
    } catch {
      /* already disconnected */
    }
    musicGain = null;
  }
}

export function stopVoice() {
  if (currentVoice) {
    currentVoice.pause();
    currentVoice = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

let cachedVoice = null;
function englishVoice() {
  if (cachedVoice || !('speechSynthesis' in window)) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice =
    voices.find((v) => /en[-_](IN|GB)/i.test(v.lang) && /female|zira|samantha|heera|google/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null;
  return cachedVoice;
}

function speakTts(text, asKiki) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text.replace(/[\p{Extended_Pictographic}\u{FE0F}]/gu, ''));
  u.lang = 'en';
  const v = englishVoice();
  if (v) u.voice = v;
  u.rate = 0.92;
  u.pitch = asKiki ? 1.35 : 1.05;
  window.speechSynthesis.speak(u);
}

// Speak a line. `key` is an optional voice clip id from dialogue.json voiceFiles.
export function speak(text, { key = null, kiki = false } = {}) {
  if (!state.settings.voice || !unlocked || !text) return;
  stopVoice();
  try {
    const files = (content.dialogue && content.dialogue.voiceFiles) || {};
    if (key && files[key]) {
      currentVoice = new Audio(files[key]);
      currentVoice.play().catch(() => speakTts(text, kiki));
      return;
    }
    speakTts(text, kiki);
  } catch {
    /* audio is never allowed to break gameplay */
  }
}
