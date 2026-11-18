// Aerobatic display (main.py:179-183, 1950-1954, 2097-2133): each press of V flies the next figure by itself,
// trailing the 3-colour display smoke (orange, white, green). In 3D the figures are flown for real by the
// physics; main.py's frame counts (barrel roll 150, loop 260, victory rolls 150) become how far it has rolled /
// pitched, with a time limit.
import { Vector3 } from 'three';
import type { JetPhysics } from './JetPhysics';

export const AEROBATICS: [string, number][] = [
  ['BARREL ROLL', 150], // main.py:180
  ['LOOP', 260],
  ['VICTORY ROLLS', 150],
];
export const DISPLAY_SMOKE: [number, number, number][] = [
  [255 / 255, 140 / 255, 40 / 255], // main.py:181
  [245 / 255, 245 / 255, 245 / 255],
  [60 / 255, 190 / 255, 90 / 255],
];

/** the controls a figure flies with (the same fields JetPhysics reads from Input) */
export interface Stick {
  pitch: number;
  roll: number;
  yaw: number;
  throttle: number;
  afterburner: boolean;
}

const _right = new Vector3();
const _up = new Vector3(0, 1, 0);
const _vh = new Vector3();

export class Aerobatics {
  /** the running figure, or '' */
  kind = '';
  private next = 0;
  private frames = 0;
  private turned = 0; // rad rolled (rolls) or pitched (loop)
  private prevUp = new Vector3();
  private prevDir = new Vector3();
  readonly stick: Stick = { pitch: 0, roll: 0, yaw: 0, throttle: 0, afterburner: false };

  get active(): boolean {
    return this.kind !== '';
  }

  /** V: the next figure (main.py:1950-1953). Returns its name. */
  start(jet: JetPhysics): string {
    const [name] = AEROBATICS[this.next % AEROBATICS.length];
    this.next++;
    this.kind = name;
    this.frames = 0;
    this.turned = 0;
    this.prevUp.copy(jet.liftUp);
    this.prevDir.copy(jet.vel).normalize();
    return name;
  }

  stop(): void {
    this.kind = '';
  }

  /** One frame: sets `stick` for the figure; false once it is finished. */
  control(jet: JetPhysics): boolean {
    if (!this.active) return false;
    this.frames++;
    _vh.copy(jet.vel).normalize();
    // how far it has rolled (lift axis turning round the flight path) or pitched (flight path turning)
    if (this.kind === 'LOOP') this.turned += Math.acos(Math.min(1, Math.max(-1, this.prevDir.dot(_vh))));
    else this.turned += Math.acos(Math.min(1, Math.max(-1, this.prevUp.dot(jet.liftUp))));
    this.prevUp.copy(jet.liftUp);
    this.prevDir.copy(_vh);
    const s = this.stick;
    s.yaw = 0;
    s.throttle = 0;
    if (this.kind === 'BARREL ROLL') {
      // corkscrew round the flight path (main.py:2121-2126): rolling while pulling a little
      s.roll = 1;
      s.pitch = 0.45;
      s.afterburner = false;
      if (this.turned >= Math.PI * 2 || this.frames > 600) this.kind = '';
    } else if (this.kind === 'LOOP') {
      // wings level, full pull, afterburner: over the top inverted and back (main.py:2107-2117)
      _right.crossVectors(_vh, _up);
      const bank = _right.lengthSq() > 1e-6 ? jet.liftUp.dot(_right.normalize()) : 0;
      s.roll = Math.max(-1, Math.min(1, -bank * 3));
      s.pitch = 1;
      s.afterburner = true;
      if (this.turned >= Math.PI * 2 * 0.97 || this.frames > 1500) this.kind = '';
    } else {
      // three rolls (main.py:2119 rolls = 3)
      s.roll = 1;
      s.pitch = 0.08;
      s.afterburner = false;
      if (this.turned >= Math.PI * 6 || this.frames > 900) this.kind = '';
    }
    return this.active;
  }
}
