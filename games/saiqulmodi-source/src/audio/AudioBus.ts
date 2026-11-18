// One AudioContext for the whole game, started by the first key press, tap or click
// (browsers keep sound off until the player does something).

type Listener = (ctx: AudioContext, out: GainNode) => void;

class Bus {
  ctx: AudioContext | null = null;
  out: GainNode | null = null;
  private listeners: Listener[] = [];

  constructor() {
    const start = (): void => {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') void this.ctx.resume();
        return;
      }
      if (!window.AudioContext) return;
      const ctx = new AudioContext();
      const out = ctx.createGain();
      out.gain.value = 0.9;
      out.connect(ctx.destination);
      this.ctx = ctx;
      this.out = out;
      for (const l of this.listeners) l(ctx, out);
    };
    window.addEventListener('keydown', start);
    window.addEventListener('pointerdown', start);
  }

  /** Run `fn` once the context exists (now, or after the first gesture). */
  onReady(fn: Listener): void {
    if (this.ctx && this.out) fn(this.ctx, this.out);
    else this.listeners.push(fn);
  }
}

export const audioBus = new Bus();
