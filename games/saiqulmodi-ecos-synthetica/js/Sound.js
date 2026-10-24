// Sound.js - short sounds that play only on actions (no music, no loops).
export class Sound {
  constructor() {
    this.ctx = null;
    this.on = true;
    this.last = {};
  }

  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  // One shaped oscillator note. gap = minimum seconds between repeats of the same key.
  tone(key, freq, dur, { type = 'sine', vol = 0.12, slide = 1, delay = 0, gap = 0 } = {}) {
    if (!this.on) return;
    const c = this.ensure();
    if (!c) return;
    const now = c.currentTime;
    if (gap && this.last[key] && now - this.last[key] < gap) return;
    this.last[key] = now;
    const t = now + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide !== 1) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  select() { this.tone('select', 660, 0.08, { type: 'triangle', vol: 0.08 }); }
  scanTick() { this.tone('tick', 1200, 0.04, { type: 'square', vol: 0.025, gap: 0.18 }); }
  scanDone() { this.tone('d1', 520, 0.12, { type: 'triangle' }); this.tone('d2', 780, 0.16, { type: 'triangle', delay: 0.09 }); }
  success() { [523, 659, 784].forEach((f, i) => this.tone('s' + i, f, 0.22, { type: 'triangle', vol: 0.1, delay: i * 0.08 })); }
  fail() { this.tone('fail', 220, 0.28, { type: 'sawtooth', vol: 0.05, slide: 0.6 }); }
  hit() { this.tone('hit', 140, 0.14, { type: 'sine', vol: 0.12, slide: 0.5, gap: 0.6 }); }
  contain() { this.tone('contain', 440, 0.3, { type: 'sine', vol: 0.06, slide: 0.5, gap: 0.25 }); }
  evolve() { [392, 523, 659, 784, 1046].forEach((f, i) => this.tone('e' + i, f, 0.35, { type: 'triangle', vol: 0.09, delay: i * 0.11 })); }
}
