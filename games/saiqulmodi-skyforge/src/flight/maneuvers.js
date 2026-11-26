// Fighter aerobatics autopilot (fighter upgrade, phase 2, 09-Nov-2026).
// Every manoeuvre is flown by moving the stick, rudder and throttle through the same flight physics the pilot uses
// (src/physics/flight.js) - nothing is animated along a fixed path. Loops and half loops fly a true circle of
// constant radius: the g asked for is the centripetal g for the radius plus the share of the weight across the
// path, with a correction that pulls the aircraft back onto the circle.
// The pilot can take over at any moment by moving the stick (the game calls handOver()).
//
//   1 LOOP          inside loop, back to the entry heading and height
//   2 IMMELMANN     half loop, half roll at the top: reversed heading, higher
//   3 SPLIT-S       half roll to inverted, half loop down: reversed heading, lower (needs 1,500 m)
//   4 BREAK 180     maximum-rate level turn to the reciprocal heading (the way back to the runway)
//   5 AILERON ROLL  fast 360 deg roll about the flight path
//   6 BARREL ROLL   the nose draws a circle round a point on the horizon (true helix)
//   7 CUBAN EIGHT   5/8 loop, half roll, dive, 3/4 loop, half roll, dive, pull out
//   8 WINGOVER      climbing turn reversal: nose up, over the top banked, back down on the reciprocal heading
import * as THREE from 'three';
import { AIR } from '../physics/flight.js';

const G = 9.81;
const DEG = Math.PI / 180;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export const MANEUVERS = {
  1: { id: 'loop', name: 'LOOP', minKt: 400, minAglM: 600, throttle: 1, energy: true },
  2: { id: 'immelmann', name: 'IMMELMANN', minKt: 420, minAglM: 600, throttle: 1, energy: true },
  3: { id: 'splitS', name: 'SPLIT-S', minKt: 220, minAglM: 1500, throttle: 0.35 },
  4: { id: 'break', name: 'BREAK 180', minKt: 250, minAglM: 300, throttle: 1 },
  5: { id: 'aroll', name: 'AILERON ROLL', minKt: 200, minAglM: 300 },
  6: { id: 'barrel', name: 'BARREL ROLL', minKt: 300, minAglM: 600, throttle: 0.6 },
  7: { id: 'cuban', name: 'CUBAN EIGHT', minKt: 420, minAglM: 800, throttle: 1, energy: true },
  8: { id: 'wingover', name: 'WINGOVER', minKt: 300, minAglM: 500, throttle: 0.45 }
};

// Body axes and flight angles of a game state (state.rot is the airframe's Euler 'YXZ')
export function frame(s, f) {
  f.q.setFromEuler(s.rot);
  f.nose.set(0, 0, -1).applyQuaternion(f.q);
  f.up.set(0, 1, 0).applyQuaternion(f.q);
  f.right.set(1, 0, 0).applyQuaternion(f.q);
  f.v = Math.max(1, s.vel.length());
  f.vHat.copy(s.vel).divideScalar(f.v);
  f.gamma = Math.asin(clamp(f.vHat.y, -1, 1));
  f.bank = Math.atan2(-f.right.y, f.up.y);          // + = right wing down; works upright and inverted
  f.az = Math.atan2(-s.vel.x, -s.vel.z);            // direction of travel on the map (game yaw convention)
  return f;
}
export const newFrame = () => ({ q: new THREE.Quaternion(), nose: new THREE.Vector3(), up: new THREE.Vector3(), right: new THREE.Vector3(), vHat: new THREE.Vector3() });

// Stick position that asks the fighter's flight computer for gWant (inverse of the stick law in flight.js)
export function stickFor(gWant, s, f) {
  const air = AIR.fighter;
  const cosBank = Math.cos(s.rot.z);
  const hold = cosBank >= 0.34 ? Math.cos(f.gamma) / cosBank : 1 + (Math.cos(f.gamma) / 0.34 - 1) * clamp((cosBank + 0.1) / 0.44, 0, 1);
  const d = gWant >= hold ? (gWant - hold) / (air.nMax - hold) : (gWant - hold) / (hold - air.nMin);
  return Math.cbrt(clamp(d, -1, 1));
}

export class ManeuverPilot {
  constructor() {
    this.f = newFrame();
    this.active = false;     // a manoeuvre is in progress (autopilot or the pilot following the ghost)
    this.flying = false;     // the autopilot has the controls
    this.def = null;
    this._dq = new THREE.Quaternion();
    this._qPrev = new THREE.Quaternion();
    this._a = new THREE.Vector3();
    this._b = new THREE.Vector3();
    this._c = new THREE.Vector3();
    this._up0 = new THREE.Vector3();
    this._acc = new THREE.Vector3();
  }

  // env: { ias (kt), aglM, turnDir (+1 right / -1 left) }. Returns { ok, why }
  start(num, s, env) {
    const def = MANEUVERS[num];
    if (!def) return { ok: false, why: '' };
    if (env.onGround) return { ok: false, why: 'GND' };
    if (env.ias < def.minKt) return { ok: false, why: 'SPD LOW' };
    if (env.aglM < def.minAglM) return { ok: false, why: 'ALT LOW' };
    this.def = def;
    this.num = num;
    this.turnDir = env.turnDir || -1;
    this.active = this.flying = true;
    this.t = 0;
    frame(s, this.f);
    this.entry = { y: s.pos.y, az: this.f.az, v: this.f.v, pos: s.pos.clone() };
    this.segs = this.plan(def.id);
    this.si = -1;
    this.next(s);
    return { ok: true };
  }

  stop() { this.active = this.flying = false; this.segs = null; }
  handOver() { this.flying = false; }

  // Constant loop radius for this entry speed: about 6.5 g at the bottom, still flying over the top
  loopRadius(v) { return v * v / (G * 5.5); }

  plan(id) {
    const R = this.loopRadius(this.entry.v);
    switch (id) {
      case 'loop': return [{ t: 'level' }, { t: 'arc', sweep: 2 * Math.PI - 0.06, R }, { t: 'level' }];
      case 'immelmann': return [{ t: 'level' }, { t: 'arc', sweep: Math.PI - 0.04, R }, { t: 'roll', by: Math.PI, rate: 0.9 }, { t: 'level' }];
      case 'splitS': return [{ t: 'level' }, { t: 'roll', by: Math.PI, rate: 0.9 }, { t: 'arc', sweep: Math.PI - 0.04, R: this.entry.v ** 2 / (G * 4) }, { t: 'level' }];
      case 'break': return [{ t: 'level' }, { t: 'hturn', sweep: Math.PI - 0.12, R: this.entry.v ** 2 / (G * Math.sqrt(6.5 * 6.5 - 1)) }, { t: 'level' }];
      case 'aroll': return [{ t: 'level' }, { t: 'climb', gamma: 4 * DEG }, { t: 'roll', by: 2 * Math.PI, rate: 1 }, { t: 'level' }];
      case 'barrel': return [{ t: 'level' }, { t: 'track', kind: 'barrel', T: 2 * Math.PI / 0.6, alpha: 20 * DEG }, { t: 'level' }];
      case 'cuban': return [
        { t: 'level' }, { t: 'arc', sweep: 1.25 * Math.PI, R }, { t: 'roll', by: Math.PI, rate: 0.9 },
        { t: 'line', downTo: this.entry.y + R * (1 - Math.SQRT1_2) }, { t: 'arc', sweep: 1.5 * Math.PI, R },
        { t: 'roll', by: Math.PI, rate: 0.9 }, { t: 'line', downTo: this.entry.y + R * (1 - Math.SQRT1_2) },
        { t: 'arc', sweep: 0.25 * Math.PI - 0.02, R }, { t: 'level' }];
      case 'wingover': return [{ t: 'level' }, { t: 'track', kind: 'wingover', T: 20, gammaMax: 40 * DEG }, { t: 'level' }];
      default: return [{ t: 'level' }];
    }
  }

  next(s) {
    this.si++;
    if (this.si >= this.segs.length) { this.active = this.flying = false; this.finished = true; return; }
    const seg = this.seg = this.segs[this.si];
    const f = frame(s, this.f);
    seg.time = 0;
    seg.ok = 0;
    this._qPrev.copy(f.q);
    seg.rolled = 0;
    seg.gTrim = 0;
    if (seg.t === 'arc') {
      // circle in the vertical plane of the flight path, on the side the airframe's up points to (above when upright,
      // below when inverted); the wings are held square to that plane
      const u0 = this._a.set(0, Math.sign(f.up.y) || 1, 0).addScaledVector(f.vHat, -(Math.sign(f.up.y) || 1) * f.vHat.y).normalize();
      seg.center = s.pos.clone().addScaledVector(u0, seg.R);
      seg.normal = new THREE.Vector3().crossVectors(f.vHat, u0).normalize();
      seg.side = seg.normal.clone().multiplyScalar(Math.sign(seg.normal.dot(f.right)) || 1);
      seg.prevR = s.pos.clone().sub(seg.center);
      seg.swept = 0;
    } else if (seg.t === 'hturn') {
      const sideDir = new THREE.Vector3(Math.cos(f.az), 0, -Math.sin(f.az)).multiplyScalar(this.turnDir);   // + right
      seg.center = s.pos.clone().addScaledVector(sideDir, seg.R);
      seg.center.y = s.pos.y;
      seg.y0 = s.pos.y;
      seg.az0 = f.az;
    } else if (seg.t === 'track') {
      seg.az0 = f.az;
      seg.y0 = s.pos.y;
      seg.axis = new THREE.Vector3(-Math.sin(f.az), 0, -Math.cos(f.az));    // entry direction, level
      seg.side0 = new THREE.Vector3(Math.cos(f.az), 0, -Math.sin(f.az));    // its right
      seg.dWant = new THREE.Vector3();
      seg.dNext = new THREE.Vector3();
    }
  }

  // Direction the flight path should have at time t of a 'track' segment
  trackDir(seg, t, s, out) {
    const T = seg.T, x = clamp(t / T, 0, 1);
    if (seg.kind === 'barrel') {
      // the path leans out from the axis (cone angle grows then shrinks) while going once round it: up first, then right
      const a = seg.alpha * Math.sin(Math.PI * x), psi = 2 * Math.PI * x;
      return out.copy(seg.axis).multiplyScalar(Math.cos(a))
        .addScaledVector(this._up0.set(0, 1, 0), Math.sin(a) * Math.cos(psi))
        .addScaledVector(seg.side0, Math.sin(a) * Math.sin(psi));
    }
    // wingover: the heading turns 180 deg (slow, fast, slow); the nose climbs to gammaMax and comes back down at the
    // angle that brings the aircraft back to the entry height at the end
    const az = seg.az0 - this.turnDir * Math.PI * (1 - Math.cos(Math.PI * x)) / 2;
    let g = seg.gammaMax * Math.sin(Math.PI * x);
    if (x > 0.5 && s) {
      const left = Math.max(0.5, T - t);
      g = Math.min(g, -Math.asin(clamp((s.pos.y - seg.y0) / (s.vel.length() * left), 0, 0.6)));
    }
    return out.set(-Math.sin(az) * Math.cos(g), Math.sin(g), -Math.cos(az) * Math.cos(g));
  }

  // Controls for this frame: { pitch, roll, yaw, throttle } (null when the manoeuvre has ended)
  update(s, dt) {
    if (!this.active) return null;
    this.t += dt;
    const f = frame(s, this.f), seg = this.seg;
    seg.time += dt;
    // roll turned since the last frame, about the nose (+ = right)
    this._dq.copy(this._qPrev).invert().multiply(f.q);
    const dRoll = -2 * Math.atan2(this._dq.z, this._dq.w);
    seg.rolled += Math.abs(dRoll) < 1 ? dRoll : 0;
    this._qPrev.copy(f.q);

    let pitch = 0, roll = 0, gWant = null;
    const out = { pitch: 0, roll: 0, yaw: 0, throttle: this.def.throttle };

    if (seg.t === 'level') {
      // wings level, flight path level; done after it holds for a moment
      gWant = Math.cos(f.gamma) / Math.max(0.3, Math.cos(f.bank)) - 0.6 * f.gamma * f.v / G;
      roll = clamp(-2.2 * f.bank, -1, 1);
      if (Math.abs(f.bank) > 1.6) roll = Math.sign(roll || 1);              // inverted: roll the short way round, fast
      if (Math.abs(f.bank) < 4 * DEG && Math.abs(f.gamma) < 3 * DEG) seg.ok += dt; else seg.ok = 0;
      if (seg.ok > 0.3 || seg.time > 7) this.next(s);
      if (this.si === this.segs.length - 1 || !this.active) out.throttle = undefined;
    } else if (seg.t === 'climb') {
      gWant = (Math.cos(f.gamma) + 1.2 * (seg.gamma - f.gamma) * f.v / G) / Math.max(0.3, Math.cos(f.bank));
      roll = clamp(-2.2 * f.bank, -1, 1);
      if (Math.abs(seg.gamma - f.gamma) < 1 * DEG || seg.time > 4) this.next(s);
      out.throttle = undefined;
    } else if (seg.t === 'arc') {
      const r = this._b.copy(s.pos).sub(seg.center);
      r.addScaledVector(seg.normal, -r.dot(seg.normal));                     // into the plane of the circle
      const dist = r.length();
      const u = this._c.copy(r).multiplyScalar(-1 / Math.max(1, dist));     // towards the centre
      const radialSpeed = s.vel.dot(r) / Math.max(1, dist);
      // centripetal g for this radius + weight across the path + back onto the circle
      gWant = f.v * f.v / (G * seg.R) + u.y + 0.004 * (dist - seg.R) + 0.03 * radialSpeed;
      // keep the wings square to the circle's plane
      roll = clamp(-3 * seg.side.dot(f.up), -1, 1);
      const cross = this._a.crossVectors(seg.prevR, r).dot(seg.normal);
      seg.swept += Math.abs(Math.atan2(cross, seg.prevR.dot(r)));
      seg.prevR.copy(r);
      if (seg.swept >= seg.sweep) this.next(s);
    } else if (seg.t === 'roll') {
      const left = seg.by - Math.abs(seg.rolled);
      roll = Math.min(seg.rate, 0.25 + left * 1.6);                         // ease off near the end
      pitch = 0;                                                             // hands off: the flight computer holds the path
      out.throttle = seg.by > 3.5 ? undefined : out.throttle;
      if (left <= 0.03) this.next(s);
    } else if (seg.t === 'line') {
      pitch = 0;
      roll = clamp(-2.2 * f.bank, -1, 1);
      if (s.pos.y <= seg.downTo || seg.time > 20) this.next(s);
    } else if (seg.t === 'hturn') {
      // horizontal circle at the entry height: sideways g for the radius, vertical g to hold the height
      const r = this._b.copy(s.pos).sub(seg.center); r.y = 0;
      const dist = r.length();
      const radialSpeed = (s.vel.x * r.x + s.vel.z * r.z) / Math.max(1, dist);
      const vh = Math.hypot(s.vel.x, s.vel.z);
      const aSide = vh * vh / (G * seg.R) + 0.004 * (dist - seg.R) + 0.03 * radialSpeed;
      const aUp = 1 + 0.01 * (seg.y0 - s.pos.y) - 0.04 * s.vel.y;
      const bankWant = this.turnDir * Math.atan2(Math.max(0, aSide), aUp);
      gWant = Math.hypot(aSide, aUp);
      roll = clamp(2.5 * wrap(bankWant - f.bank), -1, 1);
      if (Math.abs(wrap(f.az - seg.az0)) >= seg.sweep && Math.sign(wrap(seg.az0 - f.az)) === this.turnDir) this.next(s);
    } else if (seg.t === 'track') {
      // Follow a direction that changes with time: lift = what turns the path that way (plus a pull back onto it)
      // minus the weight's share across the path. The roll lines the airframe's up up with that lift.
      const dW = this.trackDir(seg, seg.time, s, seg.dWant);
      const dN = this.trackDir(seg, seg.time + 0.05, s, seg.dNext);
      const acc = this._acc.copy(dN).sub(dW).divideScalar(0.05).addScaledVector(this._b.copy(dW).sub(f.vHat), 1.5).multiplyScalar(f.v);
      acc.y += G;                                                            // the wing also holds up the weight
      acc.addScaledVector(f.vHat, -acc.dot(f.vHat));                         // only the part across the path
      const n = acc.length() / G;
      if (n > 0.05) {
        acc.divideScalar(n * G);
        const phi = Math.atan2(this._c.crossVectors(f.up, acc).dot(f.nose), f.up.dot(acc));
        roll = clamp(2.5 * phi, -1, 1);
        gWant = n * Math.max(0, Math.cos(phi));                             // pull only when the lift points the right way
      } else { roll = 0; gWant = 0; }
      if (seg.time >= seg.T) this.next(s);
    }

    // Loops: the throttle keeps the energy of the entry (the speed falls as the height rises and comes back on the
    // way down), as a pilot does, so the circle can be held and the exit speed matches the entry speed
    if (this.def.energy && this.active && seg.t !== 'level') {
      const vt = Math.sqrt(Math.max(40 * 40, this.entry.v ** 2 - 2 * G * (s.pos.y - this.entry.y)));
      out.throttle = clamp(0.7 + 0.05 * (vt - f.v), 0.1, 1);
    }

    if (gWant !== null) {
      // a little integral trim so the g asked for is the g flown (held while the flight computer limits it)
      const err = gWant - (s.loadG ?? 1);
      if (Math.abs(err) < 2) seg.gTrim = clamp(seg.gTrim + 0.6 * err * dt, -1, 1);
      pitch = stickFor(clamp(gWant + seg.gTrim, AIR.fighter.nMin, 7.5), s, f);
    }
    out.pitch = clamp(pitch, -1, 1);
    out.roll = clamp(roll, -1, 1);
    return out;
  }
}

// Flies the manoeuvre ahead on a copy of the aircraft (no wind) and returns the path the autopilot will take:
// the ghost guide in the sky and the reference for the score. env: start() env + { profile, massKg, hMOf(y), step }
export function predictPath(num, s, env) {
  const c = {
    pos: s.pos.clone(), vel: s.vel.clone(), rot: s.rot.clone(), power: s.power, throttle: s.throttle,
    isAfterburner: s.isAfterburner, stick: s.stick || 0, rollRate: s.rollRate || 0, holdGamma: s.holdGamma,
    loadG: s.loadG, aoa: s.aoa, stalled: false, wingDrop: 0, spin: 0, maxG: 1
  };
  const pilot = new ManeuverPilot();
  if (!pilot.start(num, c, env).ok) return null;
  const dt = 1 / 60, pts = [];
  let t = 0;
  for (; t < 90 && pilot.active; t += dt) {
    const u = pilot.update(c, dt);
    if (!u) break;
    if (u.throttle !== undefined) c.throttle = u.throttle;
    c.power += (c.throttle * 100 - c.power) * Math.min(1, AIR.fighter.spool * dt);
    c.isAfterburner = c.throttle > 0.7;
    env.step(c, { pitch: u.pitch, roll: u.roll, yaw: u.yaw, autoAltFt: null, hM: env.hMOf(c.pos.y), massKg: env.massKg }, env.profile, 'fighter', dt);
    c.pos.addScaledVector(c.vel, dt);
    if (Math.round(t / dt) % 6 === 0) pts.push(c.pos.clone());
  }
  pts.push(c.pos.clone());
  const fe = frame(c, newFrame());
  return { points: pts, duration: t, exitAz: fe.az, exitY: c.pos.y, name: MANEUVERS[num].name };
}

// Score while a manoeuvre is flown: how close to the ghost path, and the exit heading and height
export class ManeuverScore {
  start(ghost, num) { this.g = ghost; this.num = num; this.i = 0; this.sum = 0; this.n = 0; this.t = 0; this.result = null; this.on = !!ghost; }
  stop() { this.on = false; }
  // returns { name, score, stars } once, when the ghost's end is reached (or null)
  update(pos, vel, dt) {
    if (!this.on) return null;
    this.t += dt;
    const p = this.g.points;
    // nearest ghost point, searching forwards from the last one
    let best = Infinity, bi = this.i;
    for (let k = this.i; k < Math.min(p.length, this.i + 40); k++) {
      const d = p[k].distanceToSquared(pos);
      if (d < best) { best = d; bi = k; }
    }
    this.i = bi;
    const dev = Math.sqrt(best);
    this.sum += dev; this.n++;
    if (dev > 2500 || this.t > this.g.duration * 2 + 10) { this.on = false; return { name: this.g.name, score: 0, stars: 0 }; }
    if (bi >= p.length - 3) return this.finish(pos, vel);
    return null;
  }

  // Ends the score now (the autopilot has finished, or the pilot flew past the ghost's end)
  finish(pos, vel) {
    if (!this.on) return null;
    {
      this.on = false;
      const az = Math.atan2(-vel.x, -vel.z);
      const hdgErr = Math.abs(wrap(az - this.g.exitAz)) / DEG;
      const altErr = Math.abs(pos.y - this.g.exitY);
      const mean = this.sum / Math.max(1, this.n);
      const score = Math.round(clamp(100 - mean / 6 - hdgErr * 1.5 - altErr / 12, 0, 100));
      return { name: this.g.name, score, stars: score >= 85 ? 3 : score >= 65 ? 2 : 1 };
    }
  }
}
