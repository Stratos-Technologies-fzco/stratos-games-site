// main.py's RetroSoundEngine (main.py:284-328) with the Web Audio API: the same six synthesised sounds,
// built once into buffers (no audio files), played only on actions (Jet_vs_Missile CLAUDE.md: sound only on
// actions, no music or decorative sounds).
//   create_tone: a sine sweeping freq_start -> freq_end, fading (1 - t)^1.3      (main.py:286-298)
//   create_rumble: low-passed noise, fading (1 - t)^1.6, a distant blast          (main.py:301-313)
import { audioBus } from './AudioBus';

const RATE = 44100; // main.py:287

function tone(ctx: AudioContext, f0: number, f1: number, dur: number, vol = 0.35): AudioBuffer {
  const n = Math.floor(RATE * dur);
  const buf = ctx.createBuffer(1, n, RATE);
  const d = buf.getChannelData(0);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const f = f0 + (f1 - f0) * t;
    phase = (phase + (2 * Math.PI * f) / RATE) % (2 * Math.PI);
    d[i] = Math.sin(phase) * Math.pow(1 - t, 1.3) * vol;
  }
  return buf;
}

function rumble(ctx: AudioContext, dur: number, vol = 0.45): AudioBuffer {
  const n = Math.floor(RATE * dur);
  const buf = ctx.createBuffer(1, n, RATE);
  const d = buf.getChannelData(0);
  let s = 7; // main.py:304 Random(7)
  let low = 0;
  for (let i = 0; i < n; i++) {
    s = (s * 16807) % 2147483647;
    const u = (s / 2147483647) * 2 - 1;
    low += (u - low) * 0.06; // main.py:309 low-passed noise
    d[i] = Math.max(-1, Math.min(1, low * 3)) * Math.pow(1 - i / n, 1.6) * vol;
  }
  return buf;
}

export type SoundName = 'shoot' | 'explode' | 'ignite' | 'switch' | 'missile' | 'flare' | 'boom';

class SfxEngine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private bufs = new Map<SoundName, AudioBuffer>();

  constructor() {
    audioBus.onReady((ctx, out) => {
      this.ctx = ctx;
      this.out = out;
      this.bufs.set('shoot', tone(ctx, 840, 260, 0.08)); // main.py:320 bomb
      this.bufs.set('explode', rumble(ctx, 0.45)); // main.py:321
      this.bufs.set('ignite', tone(ctx, 140, 380, 0.25)); // main.py:322 SAM launch, ECM
      this.bufs.set('switch', tone(ctx, 600, 980, 0.1)); // main.py:323 jet switch, aerobatics
      this.bufs.set('missile', tone(ctx, 1200, 500, 0.18, 0.25)); // main.py:324 AGM / AAM
      this.bufs.set('flare', tone(ctx, 2200, 1400, 0.12, 0.2)); // main.py:325
      this.bufs.set('boom', rumble(ctx, 0.9, 0.8)); // sonic boom as the jet goes through Mach 1 (SkyForge fighter)
    });
  }

  /** Play a sound; `distance` (m) softens far-away ones and skips them beyond `reach`. */
  play(name: SoundName, distance = 0, reach = 12000): void {
    const ctx = this.ctx;
    const buf = this.bufs.get(name);
    if (!ctx || !this.out || !buf || distance > reach) return;
    const src = ctx.createBufferSource(); // one node per action (Web Audio sources play once)
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = 1 / (1 + distance / 1500);
    src.connect(g).connect(this.out);
    src.start();
  }
}

export const SFX = new SfxEngine();
