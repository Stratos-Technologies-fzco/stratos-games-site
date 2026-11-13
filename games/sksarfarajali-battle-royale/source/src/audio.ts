// Procedural Web Audio. Recipes are ported from Design/Audio.dc.html, plus the extra cues from the spec.
export type SoundId =
  | 'pistol' | 'rifle' | 'dmr' | 'shotgun' | 'sniper' | 'reload' | 'hit' | 'head' | 'pickup' | 'legend' | 'grenade' | 'steps' | 'whoosh' | 'siren'
  | 'tap' | 'victory' | 'lose' | 'machete' | 'machete_hit' | 'barrier' | 'purchase' | 'smg';
export type Bus = 'sfx' | 'ui' | 'music';

interface Opts { bus?: Bus; gain?: number; pan?: number; lowpass?: number }

export class AudioManager {
  private ac: AudioContext | null = null;
  private comp!: DynamicsCompressorNode; private master!: GainNode; private buses = {} as Record<Bus, GainNode>; private duck!: GainNode;
  private nb: AudioBuffer | null = null;
  volumes = { master: 0.55, music: 0.45, sfx: 1, ui: 0.6 };
  private voices = 0; private timer: number | null = null; private step = 0; private next = 0; private musicMode: 'off' | 'lobby' | 'match' | 'final' = 'off';
  private lastCombat = -99; private tension = false; private wind: AudioBufferSourceNode | null = null; private windGain: GainNode | null = null;

  /** Must be called from a user gesture the first time. */
  unlock() { this.ctx(); }
  private ctx(): AudioContext {
    if (!this.ac) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ac = new AC(); this.comp = this.ac.createDynamicsCompressor(); this.master = this.ac.createGain(); this.master.gain.value = this.volumes.master;
      this.master.connect(this.comp); this.comp.connect(this.ac.destination);
      this.duck = this.ac.createGain(); this.duck.connect(this.master);
      for (const b of ['sfx', 'ui', 'music'] as Bus[]) { const g = this.ac.createGain(); g.gain.value = this.volumes[b]; g.connect(b === 'music' ? this.duck : this.master); this.buses[b] = g; }
    }
    if (this.ac.state === 'suspended') void this.ac.resume();
    return this.ac;
  }
  setVolume(k: 'master' | 'music' | 'sfx' | 'ui', v: number) { this.volumes[k] = v; if (!this.ac) return; if (k === 'master') this.master.gain.value = v; else this.buses[k].gain.value = v; }
  private noiseBuf() {
    if (!this.nb) { const ac = this.ctx(); const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.nb = b; }
    return this.nb;
  }
  private out(o: Opts): AudioNode {
    const ac = this.ctx(); let node: AudioNode = this.buses[o.bus ?? 'sfx'];
    if (o.gain !== undefined || o.pan !== undefined || o.lowpass) {
      const g = ac.createGain(); g.gain.value = o.gain ?? 1; let tail: AudioNode = g;
      if (o.lowpass) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lowpass; tail.connect(f); tail = f; }
      if (o.pan !== undefined && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, o.pan)); tail.connect(p); tail = p; }
      tail.connect(node); return g;
    }
    return node;
  }
  private tone(dest: AudioNode, type: OscillatorType, f0: number, t: number, dur: number, gain: number, f1?: number) {
    const ac = this.ctx(); const o = ac.createOscillator(); const g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.02);
  }
  private noise(dest: AudioNode, t: number, dur: number, gain: number, ftype: BiquadFilterType, f0: number, f1?: number) {
    const ac = this.ctx(); const s = ac.createBufferSource(); s.buffer = this.noiseBuf(); const f = ac.createBiquadFilter(); f.type = ftype; f.frequency.setValueAtTime(f0, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }

  play(id: SoundId, o: Opts = {}) {
    if (this.voices >= 24) return; const ac = this.ctx(); this.voices++; setTimeout(() => this.voices--, 400);
    const d = this.out({ bus: id === 'tap' || id === 'victory' || id === 'lose' || id === 'purchase' ? 'ui' : 'sfx', ...o }); const t = ac.currentTime + 0.01;
    const N = (a: number, b: number, c: number, e: BiquadFilterType, f: number, g?: number) => this.noise(d, t + a, b, c, e, f, g);
    const T = (ty: OscillatorType, f: number, a: number, b: number, c: number, e?: number) => this.tone(d, ty, f, t + a, b, c, e);
    switch (id) {
      case 'pistol': N(0, 0.12, 0.8, 'bandpass', 1800, 900); T('square', 180, 0, 0.08, 0.25, 60); break;
      case 'smg': N(0, 0.09, 0.7, 'bandpass', 2200, 1000); T('square', 200, 0, 0.06, 0.2, 70); break;
      case 'rifle': N(0, 0.16, 0.9, 'lowpass', 3000, 700); T('triangle', 120, 0, 0.14, 0.5, 40); break;
      case 'dmr': N(0, 0.2, 1.0, 'lowpass', 4200, 600); T('triangle', 140, 0, 0.16, 0.55, 45); N(0, 0.04, 0.5, 'highpass', 3500); break;
      case 'shotgun': N(0, 0.4, 1.2, 'lowpass', 2200, 250); T('sine', 90, 0, 0.3, 0.9, 30); N(0.45, 0.03, 0.4, 'highpass', 3000); N(0.6, 0.04, 0.5, 'highpass', 2500); break;
      case 'sniper': N(0, 0.6, 1.2, 'lowpass', 4500, 350); T('sine', 70, 0, 0.5, 1, 25); N(0.28, 0.5, 0.25, 'lowpass', 800, 200); break;
      case 'reload': N(0, 0.04, 0.5, 'highpass', 2500); T('sawtooth', 300, 0.3, 0.12, 0.08, 900); N(0.35, 0.04, 0.6, 'highpass', 2000); N(0.75, 0.05, 0.7, 'highpass', 1800); break;
      case 'pickup': T('sine', 660, 0, 0.08, 0.35); T('sine', 880, 0.07, 0.12, 0.35); break;
      case 'legend': [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => T('triangle', f, i * 0.07, 0.35, 0.3)); N(0.2, 0.6, 0.12, 'highpass', 6000); break;
      case 'hit': T('square', 1200, 0, 0.05, 0.2); break;
      case 'head': T('sine', 1600, 0, 0.12, 0.35); T('sine', 2400, 0.02, 0.18, 0.2); break;
      case 'grenade': N(0, 0.05, 0.4, 'highpass', 4000); N(0.5, 1.3, 1.5, 'lowpass', 1400, 80); T('sine', 60, 0.5, 0.9, 1, 20); break;
      case 'steps': N(0, 0.07, 0.5, 'bandpass', 500); break;
      case 'whoosh': N(0, 0.6, 0.6, 'bandpass', 300, 2200); N(0.6, 0.7, 0.5, 'bandpass', 2200, 300); break;
      case 'tap': T('sine', 1000, 0, 0.05, 0.25); break;
      case 'victory': [293.66, 369.99, 440, 587.33].forEach((f, i) => { T('triangle', f, i * 0.12, 0.3, 0.3); T('sawtooth', f, 0.6, 1.6, 0.08); }); break;
      case 'lose': [440, 349.23, 293.66, 220].forEach((f, i) => T('sine', f, i * 0.25, 0.45, 0.3)); break;
      case 'machete': N(0, 0.18, 0.5, 'bandpass', 500, 2400); break;
      case 'machete_hit': T('sine', 140, 0, 0.1, 0.7, 60); N(0, 0.05, 0.4, 'lowpass', 1500); break;
      case 'barrier': T('sawtooth', 120, 0, 0.35, 0.25, 520); T('sine', 70, 0.3, 0.25, 0.8, 35); break;
      case 'purchase': T('sine', 660, 0, 0.1, 0.3); T('sine', 990, 0.1, 0.16, 0.3); break;
      case 'siren': {
        const o2 = ac.createOscillator(), l = ac.createOscillator(), lg = ac.createGain(), g = ac.createGain(), f = ac.createBiquadFilter();
        o2.type = 'sawtooth'; o2.frequency.value = 550; l.frequency.value = 1.2; lg.gain.value = 150; f.type = 'lowpass'; f.frequency.value = 1500; l.connect(lg); lg.connect(o2.frequency);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.2); g.gain.setValueAtTime(0.18, t + 2.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
        o2.connect(f); f.connect(g); g.connect(d); o2.start(t); l.start(t); o2.stop(t + 2.7); l.stop(t + 2.7); break;
      }
    }
  }
  /** World-positioned sound: volume falls to 0 at `range`, pan follows the bearing, enemies are 2 dB louder, far shots are muffled. */
  playAt(id: SoundId, dx: number, dz: number, yaw: number, range: number, enemy = false) {
    const dist = Math.hypot(dx, dz); if (dist > range) return;
    const k = 1 - dist / range, a = Math.atan2(dx, dz) - yaw; const pan = Math.sin(a);
    this.play(id, { gain: k * k * (enemy ? 1.26 : 1), pan, lowpass: dist > 70 ? 1400 : dist > 35 ? 3200 : undefined });
    if (range >= 100) this.lastCombat = this.ac ? this.ac.currentTime : 0;
    if (dist < 30 && range >= 100) this.duckMusic();
  }
  private duckMusic() { if (!this.ac) return; const t = this.ac.currentTime; this.duck.gain.cancelScheduledValues(t); this.duck.gain.setTargetAtTime(0.5, t, 0.05); this.duck.gain.setTargetAtTime(1, t + 1.2, 0.4); }

  // ---- music ----
  private musicStep(step: number, t: number, bpm: number, mode: 'lobby' | 'match' | 'final') {
    const d = this.buses.music;
    const bar = Math.floor(step / 16) % 4, s = step % 16;
    const bass = [73.42, 65.41, 58.27, 65.41][bar];
    const chords = [[293.66, 349.23, 440, 523.25], [261.63, 329.63, 392, 493.88], [233.08, 293.66, 349.23, 440], [261.63, 329.63, 392, 523.25]][bar];
    if (mode === 'lobby' || mode === 'final') {
      if ([0, 3, 6, 10, 12].includes(s)) this.tone(d, 'triangle', bass, t, 0.28, 0.45);
      if (s % 2 === 0) this.tone(d, 'triangle', chords[(s / 2) % 4] * (s >= 8 ? 2 : 1), t, 0.22, 0.12);
      if (s === 0 || s === 8) this.tone(d, 'sine', 150, t, 0.25, 0.9, 45);
      if ([3, 7, 11, 14].includes(s)) this.tone(d, 'sine', 230, t, 0.16, 0.35, 140);
      if ([2, 6, 10, 15].includes(s)) this.noise(d, t, 0.06, 0.25, 'bandpass', 3200);
      if (s % 2 === 1) this.noise(d, t, 0.03, 0.08, 'highpass', 8000);
      if (mode === 'final' && s % 2 === 0) { const sc = [293.66, 311.13, 392, 440, 466.16, 587.33]; const f = sc[(step * 3 + bar) % sc.length]; this.tone(d, 'sawtooth', f, t, 0.35, 0.09, f * 0.99); }
    } else {
      if (s === 0) this.tone(d, 'sine', bass * 2, t, 1.6, 0.2);
      if (this.tension && s % 4 === 0) this.tone(d, 'sine', 60, t, 0.2, 0.7, 40);
      if (this.ac && this.ac.currentTime - this.lastCombat < 6 && [0, 6, 8, 14].includes(s)) this.tone(d, 'sine', 120, t, 0.18, 0.6, 50);
    }
    void bpm;
  }
  startMusic(mode: 'lobby' | 'match' | 'final') {
    if (this.musicMode === mode) return; this.stopMusic(); const ac = this.ctx(); this.musicMode = mode; this.step = 0; this.next = ac.currentTime + 0.05;
    const bpm = mode === 'final' ? 120 : 100, sixteenth = 60 / bpm / 4;
    this.timer = window.setInterval(() => { while (this.next < ac.currentTime + 0.12) { this.musicStep(this.step, this.next, bpm, mode); this.step++; this.next += sixteenth; } }, 25);
    if (mode !== 'lobby') this.startWind();
  }
  private startWind() {
    const ac = this.ctx(); if (this.wind) return; const s = ac.createBufferSource(); s.buffer = this.noiseBuf(); s.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; const g = ac.createGain(); g.gain.value = 0.05;
    s.connect(f); f.connect(g); g.connect(this.buses.music); s.start(); this.wind = s; this.windGain = g;
  }
  setTension(on: boolean) { this.tension = on; }
  stopMusic() { if (this.timer) clearInterval(this.timer); this.timer = null; this.musicMode = 'off'; if (this.wind) { try { this.wind.stop(); } catch { /* already stopped */ } this.wind = null; } void this.windGain; }
}
export const audio = new AudioManager();
