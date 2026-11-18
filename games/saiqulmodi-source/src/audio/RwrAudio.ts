// Radar warning tones with the Web Audio API (no audio files). Three persistent oscillators, gated by gain:
//   search: a short low chirp every 2 s while a launcher has you inside its ring
//   lock:   a fast steady pulse while a guided missile is tracking you
//   launch: a rising/falling warble for 1.2 s when a missile is fired at you
// Uses the shared AudioContext (AudioBus), started by the first key press or tap.
import { audioBus } from './AudioBus';

export class RwrAudio {
  private ctx: AudioContext | null = null;
  private searchGain: GainNode | null = null;
  private lockGain: GainNode | null = null;
  private launchGain: GainNode | null = null;
  private launchOsc: OscillatorNode | null = null;
  private nextSearch = 0;
  private nextLockPulse = 0;
  private launchUntil = 0;

  constructor() {
    audioBus.onReady((ctx, out) => this.build(ctx, out));
  }

  private build(ctx: AudioContext, out: GainNode): void {
    const master = ctx.createGain();
    master.gain.value = 0.2;
    master.connect(out);
    const voice = (type: OscillatorType, freq: number): [OscillatorNode, GainNode] => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0;
      o.connect(g).connect(master);
      o.start();
      return [o, g];
    };
    this.searchGain = voice('sine', 900)[1];
    this.lockGain = voice('square', 1250)[1];
    const [lo, lg] = voice('triangle', 900);
    this.launchOsc = lo;
    this.launchGain = lg;
    this.ctx = ctx;
  }
  /**
   * Call once per display frame.
   * @param painting launchers that have the jet in their ring
   * @param locked guided missiles tracking the jet
   * @param launched missiles fired at the jet this frame
   */
  update(painting: number, locked: number, launched: number, alive: boolean): void {
    const ctx = this.ctx;
    if (!ctx || !this.searchGain || !this.lockGain || !this.launchGain || !this.launchOsc) return;
    const t = ctx.currentTime;
    if (!alive) {
      this.searchGain.gain.setTargetAtTime(0, t, 0.01);
      this.lockGain.gain.setTargetAtTime(0, t, 0.01);
      this.launchGain.gain.setTargetAtTime(0, t, 0.01);
      this.launchUntil = 0;
      return;
    }
    if (launched > 0 && t > this.launchUntil - 0.6) {
      // warble 700 <-> 1500 Hz, 6 times a second, for 1.2 s
      this.launchUntil = t + 1.2;
      const f = this.launchOsc.frequency;
      f.cancelScheduledValues(t);
      f.setValueAtTime(700, t);
      for (let k = 1; k <= 14; k++) f.linearRampToValueAtTime(k % 2 ? 1500 : 700, t + k * 0.085);
      this.launchGain.gain.cancelScheduledValues(t);
      this.launchGain.gain.setValueAtTime(0.8, t);
      this.launchGain.gain.setValueAtTime(0, t + 1.2);
    }
    if (locked > 0) {
      if (t >= this.nextLockPulse) {
        // 0.09 s on, 0.07 s off
        const g = this.lockGain.gain;
        g.setValueAtTime(0.35, t);
        g.setValueAtTime(0, t + 0.09);
        this.nextLockPulse = t + 0.16;
      }
    } else if (painting > 0) {
      if (t >= this.nextSearch) {
        const g = this.searchGain.gain;
        g.setValueAtTime(0.5, t);
        g.setValueAtTime(0, t + 0.07);
        g.setValueAtTime(0.5, t + 0.14);
        g.setValueAtTime(0, t + 0.21);
        this.nextSearch = t + 2;
      }
    } else {
      this.nextSearch = 0;
    }
  }
}
