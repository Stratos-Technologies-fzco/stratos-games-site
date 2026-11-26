// Fighter return to base (fighter upgrade, phase 3, 09-Nov-2026): turn back to the nearest runway and fly the fighter
// OVERHEAD BREAK pattern to a landing, through the same flight physics the pilot uses (stick, rudder, throttle).
//
//   RTB       turn back and fly to a point 12 km out on the runway's extended centre line (above the hills on the way)
//   INITIAL   run in along the centre line at 1,500 ft above the field, 350 kt
//   BREAK     over the runway: 60 deg bank level turn through 180 deg, power to idle (the speed bleeds off)
//   DOWNWIND  back along the runway, 1,500 ft, 200 kt, gear down
//   BASE      descending 180 deg turn onto the centre line about 2 km out
//   FINAL     localizer + 3 deg glide slope to the aiming point 300 m past the threshold, the aircraft's approach speed
//   FLARE     below 8 m the sink rate is eased off to touch down gently, power to idle in the last 2 m
//   ROLLOUT   on the wheels: power off, brakes, nose-wheel steering on the centre line, until taxi speed
//
// The pilot can take over at any moment by moving the stick (the game calls stop()).
import * as THREE from 'three';
import { atmosphere } from '../physics/flight.js';
import { frame, newFrame, stickFor } from './maneuvers.js';

const G = 9.81;
const FT = 0.3048;
const DEG = Math.PI / 180;
const KT = 1 / 1.94384;
const GLIDE = 3 * DEG;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export const RTB_PHASES = { transit: 'RTB', initial: 'INITIAL', break: 'BREAK', downwind: 'DOWNWIND', base: 'BASE', final: 'FINAL', flare: 'FLARE', rollout: 'ROLLOUT' };

export class ReturnPilot {
  constructor() {
    this.f = newFrame();
    this.active = false;
  }

  // end: runway end { thrX, thrZ, dirX, dirZ, y (field, world), lengthM, icao, ident }
  // env: { profile, groundHeight, hMOf(y) -> m above sea level, groundAt(x, z) -> world y, side: -1 left / +1 right traffic }
  start(end, s, env) {
    this.end = end;
    this.env = env;
    this.side = env.side || -1;
    this.rwyYaw = Math.atan2(-end.dirX, -end.dirZ);
    this.right = new THREE.Vector2(-end.dirZ, end.dirX);   // right of the landing direction on the map
    this.patternY = end.y + 1500 * FT;
    this.phase = 'transit';
    this.time = 0;
    this.thrI = clamp(s.throttle ?? 0.6, 0, 0.95);
    this.gearDown = false;
    this.brakes = false;
    this.turnDeg = 0;
    this.active = true;
    this.finished = false;
    // Already lined up on final (e.g. after APPROACH [L]): carry on down the glide slope instead of flying the pattern
    const f = frame(s, this.f), r = this.rel(s.pos);
    const glideY = end.y + env.groundHeight + Math.max(0, 300 - r.along) * Math.tan(GLIDE);
    if (r.along > -12000 && r.along < -800 && Math.abs(r.cross) < 600 && Math.abs(wrap(f.az - this.rwyYaw)) < 20 * DEG && Math.abs(s.pos.y - glideY) < 200) {
      this.phase = 'final';
      this.gearDown = true;
    }
    return { ok: true };
  }

  stop() { this.active = false; this.gearDown = false; this.brakes = false; }
  get label() { return RTB_PHASES[this.phase]; }

  // along: metres past the threshold in the landing direction; cross: metres right of the centre line
  rel(p) {
    const dx = p.x - this.end.thrX, dz = p.z - this.end.thrZ;
    return { along: dx * this.end.dirX + dz * this.end.dirZ, cross: dx * this.right.x + dz * this.right.y };
  }

  // heading (game yaw) that flies onto a line through the point (along0, cross0) with direction yawL
  lineYaw(p, yawL, crossOfLine, k) {
    const r = this.rel(p);
    let c = r.cross - crossOfLine;
    if (Math.abs(wrap(yawL - this.rwyYaw)) > Math.PI / 2) c = -c;    // flying the other way: right and left swap
    return yawL + clamp(Math.atan(c / k), -60 * DEG, 60 * DEG);
  }

  setPhase(name, s) {
    this.phase = name;
    this.time = 0;
    if (name === 'downwind') this.dwCross = this.rel(s.pos).cross;
    if (name === 'base') {
      const r = this.rel(s.pos);
      this.baseR = Math.max(500, Math.abs(r.cross) / 2);
      this.baseCenter = { along: r.along, cross: r.cross / 2 };
      this.baseY0 = s.pos.y;
      this.baseSwept = 0;
      this.baseAz = null;
    }
  }

  // Controls for this frame: { pitch, roll, yaw, throttle } (null when finished)
  update(s, dt, onGround) {
    if (!this.active) return null;
    this.time += dt;
    const f = frame(s, this.f), e = this.end, env = this.env;
    const r = this.rel(s.pos);
    const sigma = atmosphere(env.hMOf(s.pos.y)).sigma;
    const iasKt = f.v * Math.sqrt(sigma) / KT;
    const wheelsM = s.pos.y - e.y - env.groundHeight;
    let yawCmd = null, bankMax = 45 * DEG, bankCmd = null, gammaCmd = 0, spdKt = 350, thrMax = 0.69, yaw = 0, idle = false;

    if (onGround && this.phase !== 'rollout' && this.phase !== 'transit') this.setPhase('rollout', s);

    switch (this.phase) {
      case 'transit': {
        // to a point 12 km out on the centre line, high enough for the hills ahead
        const tx = e.thrX - e.dirX * 12000, tz = e.thrZ - e.dirZ * 12000;
        const dist = Math.hypot(tx - s.pos.x, tz - s.pos.z);
        yawCmd = Math.atan2(-(tx - s.pos.x), -(tz - s.pos.z));
        let hT = this.patternY;
        for (const k of [1500, 3000, 5000, 8000]) {
          const gx = s.pos.x + f.vHat.x * k, gz = s.pos.z + f.vHat.z * k;
          hT = Math.max(hT, env.groundAt(gx, gz) + 300);
        }
        gammaCmd = clamp((hT - s.pos.y) / (f.v * 8), -0.15, 0.25);
        spdKt = 400; thrMax = 1; bankMax = 60 * DEG;
        if (dist < 3000 || (r.along < -4000 && r.along > -14000 && Math.abs(r.cross) < 1500 && Math.abs(wrap(f.az - this.rwyYaw)) < 40 * DEG)) this.setPhase('initial', s);
        break;
      }
      case 'initial':
        yawCmd = this.lineYaw(s.pos, this.rwyYaw, 0, 1500);
        gammaCmd = clamp((this.patternY - s.pos.y) / (f.v * 6), -0.12, 0.12);
        spdKt = 350;
        if (r.along >= e.lengthM * 0.25) this.setPhase('break', s);
        break;
      case 'break':
        bankCmd = this.side * 60 * DEG;
        gammaCmd = clamp((this.patternY - s.pos.y) / (f.v * 5), -0.08, 0.08);
        idle = true;
        if (Math.abs(wrap(f.az - (this.rwyYaw + Math.PI))) < 12 * DEG) this.setPhase('downwind', s);
        break;
      case 'downwind':
        yawCmd = this.lineYaw(s.pos, this.rwyYaw + Math.PI, this.dwCross, 1200);
        gammaCmd = clamp((this.patternY - s.pos.y) / (f.v * 6), -0.1, 0.1);
        spdKt = 200;
        this.gearDown = true;
        if (r.along <= -2000) this.setPhase('base', s);
        break;
      case 'base': {
        // half circle onto the centre line, descending to the glide slope's height at its end
        const cx = this.baseCenter, R = this.baseR;
        const da = r.along - cx.along, dc = r.cross - cx.cross;
        const dist = Math.hypot(da, dc);
        const radialSpeed = ((s.vel.x * e.dirX + s.vel.z * e.dirZ) * da + (s.vel.x * this.right.x + s.vel.z * this.right.y) * dc) / Math.max(1, dist);
        const vh = Math.hypot(s.vel.x, s.vel.z);
        const aSide = vh * vh / (G * R) + 0.004 * (dist - R) + 0.03 * radialSpeed;
        bankCmd = this.side * Math.atan(Math.max(0, aSide));
        if (this.baseAz !== null) this.baseSwept += Math.abs(wrap(f.az - this.baseAz));
        this.baseAz = f.az;
        const prog = clamp(this.baseSwept / Math.PI, 0, 1);
        const yEnd = e.y + env.groundHeight + (300 - r.along) * Math.tan(GLIDE);
        const hT = this.baseY0 + (yEnd - this.baseY0) * prog;
        gammaCmd = clamp((hT - s.pos.y) / (f.v * 4) - 0.06 * (1 - prog), -0.14, 0.05);
        spdKt = this.env.profile.approachKt + 20 * (1 - prog);
        this.gearDown = true;
        if (this.baseSwept > 150 * DEG && Math.abs(wrap(f.az - this.rwyYaw)) < 12 * DEG) this.setPhase('final', s);
        break;
      }
      case 'final': {
        yawCmd = this.lineYaw(s.pos, this.rwyYaw, 0, 500);
        bankMax = 25 * DEG;
        const hT = e.y + env.groundHeight + Math.max(0, 300 - r.along) * Math.tan(GLIDE);
        gammaCmd = clamp(-GLIDE + 0.004 * (hT - s.pos.y), -8 * DEG, 1 * DEG);
        spdKt = this.env.profile.approachKt;
        this.gearDown = true;
        if (wheelsM < 8) this.setPhase('flare', s);
        break;
      }
      case 'flare': {
        yawCmd = this.lineYaw(s.pos, this.rwyYaw, 0, 500);
        bankMax = 5 * DEG;
        // sink eased from the glide slope's ~4 m/s to about 1 m/s at the wheels; power holds the speed until 2 m
        const vyT = -Math.max(1.0, 0.4 * wheelsM);
        gammaCmd = Math.asin(clamp(vyT / f.v, -0.2, 0.05));
        spdKt = this.env.profile.approachKt - 5;
        idle = wheelsM < 2;
        this.gearDown = true;
        break;
      }
      case 'rollout': {
        this.brakes = true;
        idle = true;
        // nose-wheel steering back to the centre line (rudder input: + = left)
        yaw = clamp(0.02 * r.cross + 2 * wrap(this.rwyYaw - f.az), -1, 1);
        this.turnDeg = 0;
        if (iasKt < 15) { this.active = false; this.finished = true; this.brakes = false; }
        return { pitch: 0, roll: 0, yaw, throttle: 0 };
      }
    }

    // Lateral: heading error -> bank (turn left = negative bank); roll towards it
    if (bankCmd === null) {
      const err = wrap(yawCmd - f.az);
      bankCmd = -clamp(2 * err, -bankMax, bankMax);
      this.turnDeg = -err / DEG;
    } else {
      this.turnDeg = -this.side * 90;
    }
    const roll = clamp(2.5 * wrap(bankCmd - f.bank), -1, 1);

    // Vertical: flight-path angle -> g (the share of the lift that holds the path in the bank)
    const gWant = (Math.cos(f.gamma) + 1.0 * (gammaCmd - f.gamma) * f.v / G) / Math.max(0.35, Math.cos(f.bank));
    const pitch = stickFor(clamp(gWant, -1, 6.5), s, f);

    // Speed: throttle, proportional + integral, dry power except on the way back
    const errKt = spdKt - iasKt;
    this.thrI = clamp(this.thrI + 0.006 * errKt * dt, 0, thrMax);
    const throttle = idle ? 0 : clamp(this.thrI + 0.012 * errKt, 0, thrMax);
    return { pitch, roll, yaw, throttle };
  }
}
