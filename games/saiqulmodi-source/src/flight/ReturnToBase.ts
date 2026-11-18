// Return to base with the fighter OVERHEAD BREAK, ported from the SkyForge fighter (src/flight/returnToBase.js),
// flown through this game's own JetPhysics (stick, rudder, throttle only):
//
//   RTB       turn back and fly to a point 12 km out on the runway's extended centre line (above the hills)
//   INITIAL   run in along the centre line at 1,500 ft above the field, 350 kt
//   BREAK     over the runway: 60 deg bank level turn through 180 deg, power to idle (the speed bleeds off)
//   DOWNWIND  back along the runway, 1,500 ft, 200 kt, gear down
//   BASE      descending 180 deg turn onto the centre line about 2 km out
//   FINAL     centre line + 3 deg glide slope to the aiming point 100 m past the threshold, approach speed
//   FLARE     below 3 m the sink rate is eased to about 1.5 m/s, power to idle: a firm fighter touchdown (the
//             runway is short, so no long float)
//   ROLLOUT   on the wheels: power off, brakes, nose-wheel steering on the centre line, down to taxi speed
//
// Moving the stick hands the jet back to the pilot (the game calls stop()). Speeds are indicated airspeed.
import { Vector2 } from 'three';
import { airDensity, GEAR_H, type JetPhysics, STALL_MPS_SL, stickForG } from './JetPhysics';
import { type Frame, frameOf, newFrame } from './Maneuvers';
import type { RunwayEnd } from '../world/Airfields';

const G = 9.81;
const FT = 0.3048;
const DEG = Math.PI / 180;
const KT = 0.514444;
const GLIDE = 3 * DEG;
const AIM_M = 100; // aiming point past the threshold (the runway is only 1,040 m)
const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
const wrap = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));
/** approach speed: 1.3 x the stall speed (~140 kt) */
export const APPROACH_KT = (1.3 * STALL_MPS_SL) / KT;

export type RtbPhase = 'RTB' | 'INITIAL' | 'BREAK' | 'DOWNWIND' | 'BASE' | 'FINAL' | 'FLARE' | 'ROLLOUT';

export interface RtbControls {
  pitch: number;
  roll: number;
  yaw: number;
  throttle: number;
  afterburner: boolean;
}

export class ReturnPilot {
  active = false;
  finished = false;
  phase: RtbPhase = 'RTB';
  gearDown = false;
  brakes = false;
  /** times it went around (not stable on short final) */
  goArounds = 0;
  end!: RunwayEnd;
  private side = -1; // left-hand pattern
  private rwyYaw = 0;
  private right = new Vector2();
  private patternY = 0;
  private thrI = 0.6;
  private f: Frame = newFrame();
  private dwCross = 0;
  private baseR = 500;
  private baseCenter = { along: 0, cross: 0 };
  private baseY0 = 0;
  private baseSwept = 0;
  private baseAz: number | null = null;
  /** ground height under a point (for the hills on the way) */
  private groundAt: (x: number, z: number) => number = () => 0;
  readonly out: RtbControls = { pitch: 0, roll: 0, yaw: 0, throttle: 0, afterburner: false };

  start(end: RunwayEnd, j: JetPhysics, groundAt: (x: number, z: number) => number): void {
    this.end = end;
    this.groundAt = groundAt;
    this.rwyYaw = Math.atan2(-end.dirX, -end.dirZ);
    this.right.set(-end.dirZ, end.dirX);
    this.patternY = end.y + 1500 * FT;
    this.phase = 'RTB';
    this.thrI = clamp(j.throttle, 0, 0.95);
    this.gearDown = false;
    this.brakes = false;
    this.active = true;
    this.finished = false;
    this.goArounds = 0;
    // already lined up on final: carry on down the glide slope instead of flying the pattern
    const f = frameOf(j, this.f);
    const r = this.rel(j.pos.x, j.pos.z);
    const glideY = end.y + GEAR_H + Math.max(0, AIM_M - r.along) * Math.tan(GLIDE);
    if (r.along > -12000 && r.along < -800 && Math.abs(r.cross) < 600 && Math.abs(wrap(f.az - this.rwyYaw)) < 20 * DEG && Math.abs(j.pos.y - glideY) < 200) {
      this.phase = 'FINAL';
      this.gearDown = true;
    }
  }

  stop(): void {
    this.active = false;
    this.gearDown = false;
    this.brakes = false;
  }

  /** along: metres past the threshold in the landing direction; cross: metres right of the centre line */
  rel(x: number, z: number): { along: number; cross: number } {
    const dx = x - this.end.thrX;
    const dz = z - this.end.thrZ;
    return { along: dx * this.end.dirX + dz * this.end.dirZ, cross: dx * this.right.x + dz * this.right.y };
  }

  /** heading that flies onto a line parallel to the runway, crossOfLine metres right of the centre line */
  private lineYaw(x: number, z: number, yawL: number, crossOfLine: number, k: number): number {
    let c = this.rel(x, z).cross - crossOfLine;
    if (Math.abs(wrap(yawL - this.rwyYaw)) > Math.PI / 2) c = -c;
    return yawL + clamp(Math.atan(c / k), -60 * DEG, 60 * DEG);
  }

  private setPhase(name: RtbPhase, j: JetPhysics): void {
    this.phase = name;
    const r = this.rel(j.pos.x, j.pos.z);
    if (name === 'DOWNWIND') this.dwCross = r.cross;
    if (name === 'BASE') {
      this.baseR = Math.max(500, Math.abs(r.cross) / 2);
      this.baseCenter = { along: r.along, cross: r.cross / 2 };
      this.baseY0 = j.pos.y;
      this.baseSwept = 0;
      this.baseAz = null;
    }
  }

  /** controls for this frame (null when finished); sets j.throttle itself */
  update(j: JetPhysics, dt: number): RtbControls | null {
    if (!this.active) return null;
    const f = frameOf(j, this.f);
    const e = this.end;
    const r = this.rel(j.pos.x, j.pos.z);
    const iasKt = (f.v * Math.sqrt(airDensity(j.pos.y) / 1.225)) / KT;
    const wheelsM = j.pos.y - GEAR_H - e.y;
    let yawCmd = 0;
    let bankMax = 45 * DEG;
    let bankCmd: number | null = null;
    let gammaCmd = 0;
    let spdKt = 350;
    let idle = false;
    const o = this.out;
    o.afterburner = false;

    if (j.onGround && this.phase !== 'ROLLOUT') this.setPhase('ROLLOUT', j);

    switch (this.phase) {
      case 'RTB': {
        const tx = e.thrX - e.dirX * 12000;
        const tz = e.thrZ - e.dirZ * 12000;
        const dist = Math.hypot(tx - j.pos.x, tz - j.pos.z);
        yawCmd = Math.atan2(-(tx - j.pos.x), -(tz - j.pos.z));
        let hT = this.patternY;
        for (const k of [1500, 3000, 5000, 8000]) hT = Math.max(hT, this.groundAt(j.pos.x + f.vHat.x * k, j.pos.z + f.vHat.z * k) + 300);
        gammaCmd = clamp((hT - j.pos.y) / (f.v * 8), -0.15, 0.25);
        spdKt = 400;
        bankMax = 60 * DEG;
        // too high for the distance left (e.g. coming back from 35,000 ft): spiral down first
        const excess = j.pos.y - hT;
        if (excess > 300 && excess > dist * 0.12) {
          bankCmd = this.side * 45 * DEG;
          gammaCmd = -0.15;
          spdKt = 300;
          break;
        }
        if (excess < 300 && (dist < 3000 || (r.along < -4000 && r.along > -14000 && Math.abs(r.cross) < 1500 && Math.abs(wrap(f.az - this.rwyYaw)) < 40 * DEG))) this.setPhase('INITIAL', j);
        break;
      }
      case 'INITIAL':
        yawCmd = this.lineYaw(j.pos.x, j.pos.z, this.rwyYaw, 0, 1500);
        gammaCmd = clamp((this.patternY - j.pos.y) / (f.v * 6), -0.12, 0.12);
        spdKt = 350;
        if (r.along >= e.lengthM * 0.25) this.setPhase('BREAK', j);
        break;
      case 'BREAK':
        bankCmd = this.side * 60 * DEG;
        gammaCmd = clamp((this.patternY - j.pos.y) / (f.v * 5), -0.08, 0.08);
        idle = true;
        if (Math.abs(wrap(f.az - (this.rwyYaw + Math.PI))) < 12 * DEG) this.setPhase('DOWNWIND', j);
        break;
      case 'DOWNWIND':
        yawCmd = this.lineYaw(j.pos.x, j.pos.z, this.rwyYaw + Math.PI, this.dwCross, 1200);
        gammaCmd = clamp((this.patternY - j.pos.y) / (f.v * 6), -0.1, 0.1);
        spdKt = 200;
        this.gearDown = true;
        if (r.along <= -2000) this.setPhase('BASE', j);
        break;
      case 'BASE': {
        // half circle onto the centre line, descending to the glide slope's height at its end
        const cx = this.baseCenter;
        const R = this.baseR;
        const da = r.along - cx.along;
        const dc = r.cross - cx.cross;
        const dist = Math.hypot(da, dc);
        const radialSpeed = ((j.vel.x * e.dirX + j.vel.z * e.dirZ) * da + (j.vel.x * this.right.x + j.vel.z * this.right.y) * dc) / Math.max(1, dist);
        const vh = Math.hypot(j.vel.x, j.vel.z);
        const aSide = (vh * vh) / (G * R) + 0.004 * (dist - R) + 0.03 * radialSpeed;
        bankCmd = this.side * Math.atan(Math.max(0, aSide));
        if (this.baseAz !== null) this.baseSwept += Math.abs(wrap(f.az - this.baseAz));
        this.baseAz = f.az;
        const prog = clamp(this.baseSwept / Math.PI, 0, 1);
        const yEnd = e.y + GEAR_H + (AIM_M - r.along) * Math.tan(GLIDE);
        const hT = this.baseY0 + (yEnd - this.baseY0) * prog;
        gammaCmd = clamp((hT - j.pos.y) / (f.v * 4) - 0.06 * (1 - prog), -0.14, 0.05);
        spdKt = APPROACH_KT + 20 * (1 - prog);
        this.gearDown = true;
        if (this.baseSwept > 150 * DEG && Math.abs(wrap(f.az - this.rwyYaw)) < 12 * DEG) this.setPhase('FINAL', j);
        break;
      }
      case 'FINAL': {
        yawCmd = this.lineYaw(j.pos.x, j.pos.z, this.rwyYaw, 0, 500);
        bankMax = 25 * DEG;
        const hT = e.y + GEAR_H + Math.max(0, AIM_M - r.along) * Math.tan(GLIDE);
        gammaCmd = clamp(-GLIDE + 0.004 * (hT - j.pos.y), -8 * DEG, 1 * DEG);
        spdKt = APPROACH_KT;
        this.gearDown = true;
        // not stable close in (too high, or off the centre line): go around and fly the pattern again
        if (r.along > -600 && (j.pos.y - hT > 40 || Math.abs(r.cross) > 30)) {
          this.goArounds++;
          this.gearDown = false;
          this.setPhase('RTB', j);
          break;
        }
        if (wheelsM < 3) this.setPhase('FLARE', j);
        break;
      }
      case 'FLARE': {
        yawCmd = this.lineYaw(j.pos.x, j.pos.z, this.rwyYaw, 0, 500);
        bankMax = 5 * DEG;
        const vyT = -Math.max(1.5, 0.6 * wheelsM);
        gammaCmd = Math.asin(clamp(vyT / f.v, -0.2, 0.05));
        spdKt = APPROACH_KT - 5;
        idle = true;
        this.gearDown = true;
        break;
      }
      case 'ROLLOUT': {
        this.brakes = true;
        // nose-wheel steering back onto the centre line (yaw + = right)
        o.yaw = -clamp(0.02 * r.cross + 2 * wrap(this.rwyYaw - f.az), -1, 1);
        o.pitch = 0;
        o.roll = 0;
        o.throttle = 0;
        j.throttle = 0;
        if (iasKt < 15) {
          this.active = false;
          this.finished = true;
          this.brakes = false;
        }
        return o;
      }
    }

    // lateral: heading error -> bank (turning left = negative bank)
    if (bankCmd === null) bankCmd = -clamp(2 * wrap(yawCmd - f.az), -bankMax, bankMax);
    o.roll = clamp(2.5 * wrap(bankCmd - f.bank), -1, 1);
    // vertical: flight-path angle -> G (the share of the lift that holds the path in the bank)
    const gWant = (Math.cos(f.gamma) + (1.0 * (gammaCmd - f.gamma) * f.v) / G) / Math.max(0.35, Math.cos(f.bank));
    o.pitch = stickForG(clamp(gWant, -1, 6.5));
    o.yaw = 0;
    // speed: throttle, proportional + integral, dry power
    const errKt = spdKt - iasKt;
    this.thrI = clamp(this.thrI + 0.006 * errKt * dt, 0, 1);
    j.throttle = idle ? 0 : clamp(this.thrI + 0.012 * errKt, 0, 1);
    o.throttle = 0;
    return o;
  }
}
