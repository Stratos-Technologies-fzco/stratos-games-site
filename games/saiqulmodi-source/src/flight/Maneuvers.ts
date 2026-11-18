// Fighter manoeuvres brought over from the SkyForge fighter (src/flight/maneuvers.js there), flown through this
// game's own flight physics (JetPhysics): the autopilot only moves the stick, rudder and throttle; nothing is
// animated along a fixed path. Loops fly a true constant-radius circle: the G asked for is the centripetal G for
// the radius plus the weight's share across the path, with a correction that pulls the jet back onto the circle.
// Moving the stick hands the jet back to the pilot at once; the ghost path and the score stay, so the pilot can
// finish the figure by hand.
//
//   1 LOOP          inside loop, back to the entry heading and height
//   2 IMMELMANN     half loop, half roll at the top: reversed heading, higher
//   3 SPLIT-S       half roll to inverted, half loop down: reversed heading, lower
//   4 BREAK 180     maximum-rate level turn to the reciprocal heading
//   5 AILERON ROLL  fast 360 deg roll about the flight path
//   6 BARREL ROLL   the nose draws a circle round a point on the horizon (true helix)
//   7 CUBAN EIGHT   5/8 loop, half roll, dive, 3/4 loop, half roll, dive, pull out
//   8 WINGOVER      climbing turn reversal: nose up, over the top banked, back down on the reciprocal heading
import { Vector3 } from 'three';
import { JetPhysics, JET_G_MIN, maxLoadG, stickForG } from './JetPhysics';
import type { Stick } from './Aerobatics';

const G = 9.81;
const DEG = Math.PI / 180;
const KT = 0.514444;
const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
const wrap = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

export interface ManeuverDef {
  id: string;
  name: string;
  minKt: number;
  minAglM: number;
  /** 0..1, above 0.7 = afterburner (SkyForge's throttle scale); undefined = leave the throttle alone */
  throttle?: number;
  /** keep the entry energy with the throttle (loops) */
  energy?: boolean;
}

export const MANEUVERS: Record<number, ManeuverDef> = {
  1: { id: 'loop', name: 'LOOP', minKt: 400, minAglM: 600, throttle: 1, energy: true },
  2: { id: 'immelmann', name: 'IMMELMANN', minKt: 420, minAglM: 600, throttle: 1, energy: true },
  3: { id: 'splitS', name: 'SPLIT-S', minKt: 220, minAglM: 1500, throttle: 0.35 },
  4: { id: 'break', name: 'BREAK 180', minKt: 250, minAglM: 300, throttle: 1 },
  5: { id: 'aroll', name: 'AILERON ROLL', minKt: 200, minAglM: 300 },
  6: { id: 'barrel', name: 'BARREL ROLL', minKt: 300, minAglM: 600, throttle: 0.6 },
  7: { id: 'cuban', name: 'CUBAN EIGHT', minKt: 420, minAglM: 800, throttle: 1, energy: true },
  8: { id: 'wingover', name: 'WINGOVER', minKt: 300, minAglM: 500, throttle: 0.45 },
};
export const MANEUVER_COUNT = 8;

/** flight angles of the jet */
export interface Frame {
  up: Vector3;
  right: Vector3;
  nose: Vector3;
  vHat: Vector3;
  v: number;
  gamma: number;
  /** + = right wing down; works upright and inverted */
  bank: number;
  /** direction of travel on the map (0 = north, + = turning left) */
  az: number;
}
export const newFrame = (): Frame => ({ up: new Vector3(), right: new Vector3(), nose: new Vector3(), vHat: new Vector3(), v: 1, gamma: 0, bank: 0, az: 0 });

export function frameOf(j: JetPhysics, f: Frame): Frame {
  f.v = Math.max(1, j.vel.length());
  f.vHat.copy(j.vel).divideScalar(f.v);
  f.up.copy(j.liftUp);
  f.nose.copy(j.nose);
  f.right.crossVectors(f.vHat, f.up).normalize();
  f.gamma = Math.asin(clamp(f.vHat.y, -1, 1));
  f.bank = Math.atan2(-f.right.y, f.up.y);
  f.az = Math.atan2(-j.vel.x, -j.vel.z);
  return f;
}

interface Seg {
  t: 'level' | 'climb' | 'arc' | 'hturn' | 'roll' | 'line' | 'track';
  sweep?: number;
  R?: number;
  by?: number;
  rate?: number;
  gamma?: number;
  downTo?: number;
  kind?: 'barrel' | 'wingover';
  T?: number;
  alpha?: number;
  gammaMax?: number;
  // run-time
  time: number;
  ok: number;
  rolled: number;
  gTrim: number;
  center?: Vector3;
  normal?: Vector3;
  side?: Vector3;
  prevR?: Vector3;
  swept?: number;
  y0?: number;
  az0?: number;
  axis?: Vector3;
  side0?: Vector3;
  dWant?: Vector3;
  dNext?: Vector3;
}
const seg = (s: Partial<Seg> & Pick<Seg, 't'>): Seg => ({ time: 0, ok: 0, rolled: 0, gTrim: 0, ...s });

export interface StartEnv {
  aglM: number;
  /** +1 right, -1 left */
  turnDir: number;
}

/** what a figure sets each frame: the stick, plus an absolute throttle (0..1, > 0.7 afterburner) or undefined */
export interface ManeuverControls extends Stick {
  throttleAbs?: number;
}

export class ManeuverPilot {
  /** a figure is in progress (autopilot or the pilot following the ghost) */
  active = false;
  /** the autopilot has the controls */
  flying = false;
  def: ManeuverDef | null = null;
  num = 0;
  finished = false;
  private turnDir = -1;
  private t = 0;
  private entry = { y: 0, az: 0, v: 0 };
  private segs: Seg[] = [];
  private si = -1;
  private sg!: Seg;
  private f = newFrame();
  private prevUp = new Vector3();
  private _a = new Vector3();
  private _b = new Vector3();
  private _c = new Vector3();
  private _acc = new Vector3();
  private _up0 = new Vector3();
  readonly out: ManeuverControls = { pitch: 0, roll: 0, yaw: 0, throttle: 0, afterburner: false };

  /** Returns '' when it starts, or why not ('SPD LOW', 'ALT LOW'). */
  start(num: number, j: JetPhysics, env: StartEnv): string {
    const def = MANEUVERS[num];
    if (!def) return 'NONE';
    if (j.speed < def.minKt * KT) return 'SPD LOW';
    if (env.aglM < def.minAglM) return 'ALT LOW';
    this.def = def;
    this.num = num;
    this.turnDir = env.turnDir || -1;
    this.active = this.flying = true;
    this.finished = false;
    this.t = 0;
    frameOf(j, this.f);
    this.entry = { y: j.pos.y, az: this.f.az, v: this.f.v };
    this.segs = this.plan(def.id, j);
    this.si = -1;
    this.next(j);
    return '';
  }

  stop(): void {
    this.active = this.flying = false;
    this.segs = [];
  }
  handOver(): void {
    this.flying = false;
  }

  /** loop radius for this entry: as tight as the wing allows at this height (about 6.5 G at the bottom when it can) */
  private loopRadius(j: JetPhysics): number {
    const k = clamp(maxLoadG(j.pos.y, this.entry.v) - 1.3, 3.2, 5.5);
    return (this.entry.v * this.entry.v) / (G * k);
  }

  private plan(id: string, j: JetPhysics): Seg[] {
    const R = this.loopRadius(j);
    const v2 = this.entry.v * this.entry.v;
    const nMax = Math.min(6.5, maxLoadG(j.pos.y, this.entry.v) - 0.4);
    const ey = this.entry.y;
    switch (id) {
      case 'loop':
        return [seg({ t: 'level' }), seg({ t: 'arc', sweep: 2 * Math.PI - 0.06, R }), seg({ t: 'level' })];
      case 'immelmann':
        return [seg({ t: 'level' }), seg({ t: 'arc', sweep: Math.PI - 0.04, R }), seg({ t: 'roll', by: Math.PI, rate: 0.9 }), seg({ t: 'level' })];
      case 'splitS':
        return [seg({ t: 'level' }), seg({ t: 'roll', by: Math.PI, rate: 0.9 }), seg({ t: 'arc', sweep: Math.PI - 0.04, R: v2 / (G * clamp(nMax - 2, 2.5, 4)) }), seg({ t: 'level' })];
      case 'break':
        return [seg({ t: 'level' }), seg({ t: 'hturn', sweep: Math.PI - 0.12, R: v2 / (G * Math.sqrt(Math.max(2, nMax * nMax - 1))) }), seg({ t: 'level' })];
      case 'aroll':
        return [seg({ t: 'level' }), seg({ t: 'climb', gamma: 4 * DEG }), seg({ t: 'roll', by: 2 * Math.PI, rate: 1 }), seg({ t: 'level' })];
      case 'barrel':
        return [seg({ t: 'level' }), seg({ t: 'track', kind: 'barrel', T: (2 * Math.PI) / 0.6, alpha: 20 * DEG }), seg({ t: 'level' })];
      case 'cuban':
        return [
          seg({ t: 'level' }),
          seg({ t: 'arc', sweep: 1.25 * Math.PI, R }),
          seg({ t: 'roll', by: Math.PI, rate: 0.9 }),
          seg({ t: 'line', downTo: ey + R * (1 - Math.SQRT1_2) }),
          seg({ t: 'arc', sweep: 1.5 * Math.PI, R }),
          seg({ t: 'roll', by: Math.PI, rate: 0.9 }),
          seg({ t: 'line', downTo: ey + R * (1 - Math.SQRT1_2) }),
          seg({ t: 'arc', sweep: 0.25 * Math.PI - 0.02, R }),
          seg({ t: 'level' }),
        ];
      case 'wingover':
        {
          // thin air (the game cruises at 35,000 ft): a flatter, slower reversal that the wing can still pull
          const nAvail = maxLoadG(j.pos.y, this.entry.v);
          return [
            seg({ t: 'level' }),
            seg({ t: 'track', kind: 'wingover', T: 20 * clamp(7 / nAvail, 1, 1.6), gammaMax: 40 * DEG * clamp((nAvail - 2) / 5, 0.5, 1) }),
            seg({ t: 'level' }),
          ];
        }
      default:
        return [seg({ t: 'level' })];
    }
  }

  private next(j: JetPhysics): void {
    this.si++;
    if (this.si >= this.segs.length) {
      this.active = this.flying = false;
      this.finished = true;
      return;
    }
    const s = (this.sg = this.segs[this.si]);
    const f = frameOf(j, this.f);
    s.time = 0;
    s.ok = 0;
    s.rolled = 0;
    s.gTrim = 0;
    this.prevUp.copy(f.up);
    if (s.t === 'arc') {
      // a circle in the vertical plane of the flight path, on the side the jet's lift points to (above when
      // upright, below when inverted); the wings are held square to that plane
      const sg = Math.sign(f.up.y) || 1;
      const u0 = this._a.set(0, sg, 0).addScaledVector(f.vHat, -sg * f.vHat.y).normalize();
      s.center = j.pos.clone().addScaledVector(u0, s.R!);
      s.normal = new Vector3().crossVectors(f.vHat, u0).normalize();
      s.side = s.normal.clone().multiplyScalar(Math.sign(s.normal.dot(f.right)) || 1);
      s.prevR = j.pos.clone().sub(s.center);
      s.swept = 0;
    } else if (s.t === 'hturn') {
      const sideDir = new Vector3(Math.cos(f.az), 0, -Math.sin(f.az)).multiplyScalar(this.turnDir);
      s.center = j.pos.clone().addScaledVector(sideDir, s.R!);
      s.center.y = j.pos.y;
      s.y0 = j.pos.y;
      s.az0 = f.az;
    } else if (s.t === 'track') {
      s.az0 = f.az;
      s.y0 = j.pos.y;
      s.axis = new Vector3(-Math.sin(f.az), 0, -Math.cos(f.az));
      s.side0 = new Vector3(Math.cos(f.az), 0, -Math.sin(f.az));
      s.dWant = new Vector3();
      s.dNext = new Vector3();
    }
  }

  /** the direction the flight path should have at time t of a 'track' segment */
  private trackDir(s: Seg, t: number, j: JetPhysics, out: Vector3): Vector3 {
    const T = s.T!;
    const x = clamp(t / T, 0, 1);
    if (s.kind === 'barrel') {
      const a = s.alpha! * Math.sin(Math.PI * x);
      const psi = 2 * Math.PI * x;
      return out
        .copy(s.axis!)
        .multiplyScalar(Math.cos(a))
        .addScaledVector(this._up0.set(0, 1, 0), Math.sin(a) * Math.cos(psi))
        .addScaledVector(s.side0!, Math.sin(a) * Math.sin(psi));
    }
    // wingover: the heading turns 180 deg (slow, fast, slow); the nose climbs to gammaMax and comes back down at
    // the angle that brings the jet back to the entry height at the end
    const az = s.az0! - (this.turnDir * Math.PI * (1 - Math.cos(Math.PI * x))) / 2;
    let g = s.gammaMax! * Math.sin(Math.PI * x);
    if (x > 0.5) {
      const left = Math.max(0.5, T - t);
      g = Math.min(g, -Math.asin(clamp((j.pos.y - s.y0!) / (j.vel.length() * left), 0, 0.6)));
    }
    return out.set(-Math.sin(az) * Math.cos(g), Math.sin(g), -Math.cos(az) * Math.cos(g));
  }

  /** Controls for this frame (null once the figure has ended). */
  update(j: JetPhysics, dt: number): ManeuverControls | null {
    if (!this.active) return null;
    this.t += dt;
    const f = frameOf(j, this.f);
    const s = this.sg;
    s.time += dt;
    // roll turned since the last frame, about the flight path (+ = right)
    const cr = this._a.crossVectors(this.prevUp, f.up).dot(f.vHat);
    const dRoll = Math.atan2(cr, this.prevUp.dot(f.up));
    s.rolled += Math.abs(dRoll) < 1 ? dRoll : 0;
    this.prevUp.copy(f.up);

    let pitch = 0;
    let roll = 0;
    let gWant: number | null = null;
    const def = this.def!;
    let thr: number | undefined = def.throttle;

    if (s.t === 'level') {
      gWant = Math.cos(f.gamma) / Math.max(0.3, Math.cos(f.bank)) - (0.6 * f.gamma * f.v) / G;
      roll = clamp(-2.2 * f.bank, -1, 1);
      if (Math.abs(f.bank) > 1.6) roll = Math.sign(roll || 1); // inverted: roll the short way round, fast
      if (Math.abs(f.bank) < 4 * DEG && Math.abs(f.gamma) < 3 * DEG) s.ok += dt;
      else s.ok = 0;
      if (s.ok > 0.3 || s.time > 7) this.next(j);
      if (this.si === this.segs.length - 1 || !this.active) thr = undefined;
    } else if (s.t === 'climb') {
      gWant = (Math.cos(f.gamma) + (1.2 * (s.gamma! - f.gamma) * f.v) / G) / Math.max(0.3, Math.cos(f.bank));
      roll = clamp(-2.2 * f.bank, -1, 1);
      if (Math.abs(s.gamma! - f.gamma) < 1 * DEG || s.time > 4) this.next(j);
      thr = undefined;
    } else if (s.t === 'arc') {
      const r = this._b.copy(j.pos).sub(s.center!);
      r.addScaledVector(s.normal!, -r.dot(s.normal!));
      const dist = r.length();
      const u = this._c.copy(r).multiplyScalar(-1 / Math.max(1, dist));
      const radialSpeed = j.vel.dot(r) / Math.max(1, dist);
      gWant = (f.v * f.v) / (G * s.R!) + u.y + 0.004 * (dist - s.R!) + 0.03 * radialSpeed;
      roll = clamp(-3 * s.side!.dot(f.up), -1, 1);
      const cross = this._a.crossVectors(s.prevR!, r).dot(s.normal!);
      s.swept! += Math.abs(Math.atan2(cross, s.prevR!.dot(r)));
      s.prevR!.copy(r);
      if (s.swept! >= s.sweep!) this.next(j);
    } else if (s.t === 'roll') {
      const left = s.by! - Math.abs(s.rolled);
      roll = Math.min(s.rate!, 0.25 + left * 1.6);
      // unloaded roll: the wing only carries the weight's share along its lift axis, so the path stays straight
      gWant = Math.cos(f.gamma) * Math.cos(f.bank);
      thr = s.by! > 3.5 ? undefined : thr;
      if (left <= 0.03) this.next(j);
    } else if (s.t === 'line') {
      gWant = Math.cos(f.gamma) * Math.cos(f.bank); // a straight line: lift holds only the weight across the path
      roll = clamp(-2.2 * f.bank, -1, 1);
      if (j.pos.y <= s.downTo! || s.time > 20) this.next(j);
    } else if (s.t === 'hturn') {
      const r = this._b.copy(j.pos).sub(s.center!);
      r.y = 0;
      const dist = r.length();
      const radialSpeed = (j.vel.x * r.x + j.vel.z * r.z) / Math.max(1, dist);
      const vh = Math.hypot(j.vel.x, j.vel.z);
      const aSide = (vh * vh) / (G * s.R!) + 0.004 * (dist - s.R!) + 0.03 * radialSpeed;
      const aUp = 1 + 0.01 * (s.y0! - j.pos.y) - 0.04 * j.vel.y;
      const bankWant = this.turnDir * Math.atan2(Math.max(0, aSide), aUp);
      gWant = Math.hypot(aSide, aUp);
      roll = clamp(2.5 * wrap(bankWant - f.bank), -1, 1);
      if (Math.abs(wrap(f.az - s.az0!)) >= s.sweep! && Math.sign(wrap(s.az0! - f.az)) === this.turnDir) this.next(j);
    } else if (s.t === 'track') {
      // lift = what turns the path that way (plus a pull back onto it) minus the weight's share across the path
      const dW = this.trackDir(s, s.time, j, s.dWant!);
      const dN = this.trackDir(s, s.time + 0.05, j, s.dNext!);
      const acc = this._acc.copy(dN).sub(dW).divideScalar(0.05).addScaledVector(this._b.copy(dW).sub(f.vHat), 1.5).multiplyScalar(f.v);
      acc.y += G;
      acc.addScaledVector(f.vHat, -acc.dot(f.vHat));
      const n = acc.length() / G;
      if (n > 0.05) {
        acc.divideScalar(n * G);
        const phi = Math.atan2(this._c.crossVectors(f.up, acc).dot(f.vHat), f.up.dot(acc));
        roll = clamp(2.5 * phi, -1, 1);
        gWant = n * Math.max(0, Math.cos(phi));
      } else {
        roll = 0;
        gWant = 0;
      }
      if (s.time >= s.T!) this.next(j);
    }

    // loops: the throttle keeps the entry energy, as a pilot does, so the circle can be held and the exit speed
    // matches the entry speed
    if (def.energy && this.active && s.t !== 'level') {
      const vt = Math.sqrt(Math.max(40 * 40, this.entry.v ** 2 - 2 * G * (j.pos.y - this.entry.y)));
      thr = clamp(0.7 + 0.05 * (vt - f.v), 0.1, 1);
    }

    if (gWant !== null) {
      // a little integral trim so the G asked for is the G flown
      const err = gWant - j.gLoad;
      if (Math.abs(err) < 2) s.gTrim = clamp(s.gTrim + 0.6 * err * dt, -1, 1);
      pitch = stickForG(clamp(gWant + s.gTrim, JET_G_MIN, 7.5));
    }
    const o = this.out;
    o.pitch = clamp(pitch, -1, 1);
    o.roll = clamp(roll, -1, 1);
    o.yaw = 0;
    o.throttle = 0;
    o.throttleAbs = thr;
    return o;
  }
}

/** Apply a figure's absolute throttle to the jet (SkyForge's scale: above 0.7 = afterburner) and fill the stick. */
export function applyThrottle(j: JetPhysics, c: ManeuverControls): void {
  if (c.throttleAbs === undefined) {
    c.afterburner = j.afterburner;
    return;
  }
  const t = c.throttleAbs;
  c.afterburner = t > 0.75;
  j.throttle = c.afterburner ? 1 : Math.min(1, t / 0.7);
}

export interface Ghost {
  points: Vector3[];
  duration: number;
  exitAz: number;
  exitY: number;
  name: string;
}

/** Flies the figure ahead on a copy of the jet and returns the path the autopilot will take: the ghost guide in
 *  the sky and the reference for the score. */
export function predictPath(num: number, j: JetPhysics, env: StartEnv): Ghost | null {
  const c = new JetPhysics();
  c.pos.copy(j.pos);
  c.vel.copy(j.vel);
  c.liftUp.copy(j.liftUp);
  c.alpha = j.alpha;
  c.throttle = j.throttle;
  c.afterburner = j.afterburner;
  c.gLoad = j.gLoad;
  const pilot = new ManeuverPilot();
  if (pilot.start(num, c, env) !== '') return null;
  const dt = 1 / 60;
  const pts: Vector3[] = [];
  let t = 0;
  let n = 0;
  for (; t < 180 && pilot.active; t += dt, n++) {
    const u = pilot.update(c, dt);
    if (!u) break;
    applyThrottle(c, u);
    c.step(dt, u as never);
    if (n % 6 === 0) pts.push(c.pos.clone());
  }
  pts.push(c.pos.clone());
  return { points: pts, duration: t, exitAz: Math.atan2(-c.vel.x, -c.vel.z), exitY: c.pos.y, name: MANEUVERS[num].name };
}

export interface ScoreResult {
  name: string;
  score: number;
  stars: number;
}

/** Score while a figure is flown: closeness to the ghost path, exit heading and exit height. */
export class ManeuverScore {
  on = false;
  /** nearest ghost point reached */
  i = 0;
  private g: Ghost | null = null;
  private sum = 0;
  private n = 0;
  private t = 0;

  start(ghost: Ghost | null): void {
    this.g = ghost;
    this.i = 0;
    this.sum = 0;
    this.n = 0;
    this.t = 0;
    this.on = !!ghost;
  }
  stop(): void {
    this.on = false;
  }

  /** a result once, when the ghost's end is reached (or the pilot strays far off it) */
  update(pos: Vector3, vel: Vector3, dt: number): ScoreResult | null {
    if (!this.on || !this.g) return null;
    this.t += dt;
    const p = this.g.points;
    let best = Infinity;
    let bi = this.i;
    for (let k = this.i; k < Math.min(p.length, this.i + 40); k++) {
      const d = p[k].distanceToSquared(pos);
      if (d < best) {
        best = d;
        bi = k;
      }
    }
    this.i = bi;
    const dev = Math.sqrt(best);
    this.sum += dev;
    this.n++;
    if (dev > 4000 || this.t > this.g.duration * 2 + 10) {
      this.on = false;
      return { name: this.g.name, score: 0, stars: 0 };
    }
    if (bi >= p.length - 3) return this.finish(pos, vel);
    return null;
  }

  finish(pos: Vector3, vel: Vector3): ScoreResult | null {
    if (!this.on || !this.g) return null;
    this.on = false;
    const az = Math.atan2(-vel.x, -vel.z);
    const hdgErr = Math.abs(wrap(az - this.g.exitAz)) / DEG;
    const altErr = Math.abs(pos.y - this.g.exitY);
    const mean = this.sum / Math.max(1, this.n);
    const score = Math.round(clamp(100 - mean / 6 - hdgErr * 1.5 - altErr / 12, 0, 100));
    return { name: this.g.name, score, stars: score >= 85 ? 3 : score >= 65 ? 2 : 1 };
  }
}
