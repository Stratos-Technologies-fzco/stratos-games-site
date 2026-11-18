// SAM missile, after main.py's SAMMissile (main.py:1054-1123), in 3D.
//  - guided: proportional navigation (a = N * Vc * LOS rate). Boost: speed ramps 35% -> 100% over the climb
//    (main.py:1106); the motor then burns UNGUIDED_MOTOR_FRAMES more (main.py:78) and burns out; after that it
//    coasts, losing speed to drag (more in thick air, more when it pulls hard) and gravity. Self-destructs at 40 s
//    (main.py:76) or when it is too slow to catch anything.
//    Seeker: RADAR (battery missiles) is fooled by ECM and notching, IR (TEL missiles) by flares.
//  - unguided: aimed where the jet will be (main.py:1072-1078), flies straight, then falls (main.py:1107-1112).
import { AdditiveBlending, CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, Quaternion, SphereGeometry, Vector3 } from 'three';
import {
  CRUISE_ALT_FT,
  DECOY_BLOW_FRAMES,
  DECOY_BLOW_M,
  DECOY_TURN_PER_FRAME,
  FT,
  GUIDED_SUSTAIN_FRAMES,
  JET_CRUISE_MPS,
  LEVEL_MULT,
  NOTCH_BEAM_COS,
  NOTCH_BREAK_PER_S,
  NOTCH_DIVE_MPS,
  NOTCH_MIN_RANGE_M,
  PN_GAIN,
  SAM_BOOST_START,
  SAM_CLIMB_FRAMES,
  SAM_CLIMB_MIN_FRAMES,
  SAM_LIFE_FRAMES,
  SAM_SPEED_MPS,
  SAM_TURN_PER_FRAME,
  SEEKER_GIMBAL_RAD,
  STEP,
  UNGUIDED_MOTOR_FRAMES,
} from '../config';
import type { Poolable } from '../core/Pool';
import { airDensity } from '../flight/JetPhysics';

const RHO0 = 1.225;
const G0 = 9.81;
/** Fins need air: the turn cap shrinks with air density, never below this share of main.py's value (new). */
const MIN_TURN_SHARE = 0.25;
const COAST_DRAG_K = 1.2e-4; // new: parasite drag after burnout, decel = k * (rho/rho0) * v^2 (37 m/s^2 at sea level, 554 m/s)
const OUTTURN_RANGE_M = 650; // new: inside this, being out-turned for OUTTURN_FRAMES = overshoot
const OUTTURN_FRAMES = 45;
const PASS_RANGE_M = 1500; // new: inside this, a missile whose range starts opening has flown past the jet (overshoot)
const MAX_G = 25; // new: structural / fin limit at sea level, falls with air density (main.py's 2D turn cap allows 74 G)
const INDUCED_SHARE = 0.15; // new: pulling at the turn limit costs 15% of the turn acceleration as drag
const MIN_SPEED = 0.6 * JET_CRUISE_MPS; // x LEVEL_MULT at use // new: slower than this it cannot catch a jet: self-destruct
const ARM_FRAMES = 60; // new: fuse arms 1 s after launch (main.py:2294 arms it near the end of the climb)
const COAST_DRAG = 0.996; // main.py:1111, unguided round loses forward speed every frame after burnout
const FALL_MAX = 400; // m/s, terminal fall speed of a spent round (main.py:1109 caps its fall too)

export type Seeker = 'RADAR' | 'IR' | 'NONE';
export type MissileEnd = 'none' | 'expired' | 'ground' | 'decoy';

const _r = new Vector3();
const _vr = new Vector3();
const _omega = new Vector3();
const _acc = new Vector3();
const _rh = new Vector3();
const _axis = new Vector3();
const _aim = new Vector3();
const _fwd = new Vector3(0, 1, 0);
const _q = new Quaternion();

const bodyGeo = new CylinderGeometry(0.25, 0.25, 5.5, 8);
const flameGeo = new SphereGeometry(0.7, 8, 6);
const radarMat = new MeshLambertMaterial({ color: 0xebebe6 }); // main.py:1129 guided body colour
const irMat = new MeshLambertMaterial({ color: 0xf0e0c8 });
const unguidedMat = new MeshLambertMaterial({ color: 0xc8c8a8 }); // main.py:1129 unguided
const flameMat = new MeshBasicMaterial({ color: 0xffa040 });
flameMat.color.multiplyScalar(4); // motor burn: blooms
const glowGeo = new SphereGeometry(1.6, 10, 8);
const glowMat = new MeshBasicMaterial({ color: 0xff9a40, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false });
glowMat.color.multiplyScalar(3);
/** the missile never shrinks below this many metres per 250 m of distance: it stays visible far away */
const MIN_SIZE_PER_M = 1 / 250;
const _cam = new Vector3();

export class Missile implements Poolable {
  active = false;
  guided = true;
  seeker: Seeker = 'RADAR';
  readonly pos = new Vector3();
  readonly vel = new Vector3();
  readonly dir = new Vector3(0, 1, 0);
  readonly mesh = new Group();
  age = 0; // frames
  speed = 0;
  /** this missile's full speed: main.py:1855 speed_factor x 2.2, fixed at launch */
  topSpeed = SAM_SPEED_MPS;
  climbFrames = SAM_CLIMB_MIN_FRAMES;
  burnout = 0; // frame the motor stops
  /** the seeker has lost the jet for good (gimbal, notch) */
  lockLost = false;
  /** why it lost the jet: '' | 'gimbal' (overshoot) | 'notch' */
  lostBy: '' | 'gimbal' | 'notch' = '';
  /** chasing a flare or a jammed false track: points at the decoy's position */
  decoy: Vector3 | null = null;
  readonly falseTrack = new Vector3();
  decoyFrames = 0;
  /** last flare salvo this missile was rolled against (each salvo gets one roll per missile) */
  flareSalvoTried = -1;
  /** last chaff salvo this missile was rolled against */
  chaffSalvoTried = -1;
  /** the launcher index that fired it */
  launcher = -1;
  /** latest lateral acceleration, m/s^2 (for tests / HUD) */
  aLat = 0;
  /** frames in a row the missile could not turn as hard as it needed to, while close */
  saturated = 0;
  /** the jet's velocity last frame (to measure how hard it is turning) */
  private readonly prevTgtVel = new Vector3();
  private body: Mesh;
  private flame: Mesh;

  constructor() {
    this.body = new Mesh(bodyGeo, radarMat);
    this.mesh.add(this.body);
    this.flame = new Mesh(flameGeo, flameMat);
    this.flame.position.y = -3.2;
    this.flame.scale.set(1.4, 3, 1.4);
    const glow = new Mesh(glowGeo, glowMat); // a hot halo round the motor, so the missile reads from far off
    this.flame.add(glow);
    this.mesh.add(this.flame);
    this.mesh.visible = false;
  }

  /** Trail grey: main.py:1082 (guided 236/232/224, unguided 206/196/176). */
  get trailGrey(): number {
    return this.guided ? 0.92 : 0.78;
  }

  get motorOn(): boolean {
    return this.age <= this.burnout;
  }

  /** past this share of its boost/climb (main.py:1988 checks altitude > half the goal) */
  get climbShare(): number {
    return Math.min(1, this.age / this.climbFrames);
  }

  /** guided, still tracking the jet itself */
  get tracking(): boolean {
    return this.guided && !this.lockLost && this.decoy === null;
  }

  launch(x: number, y: number, z: number, target: Vector3, targetVel: Vector3, guided: boolean, seeker: Seeker, launcher: number): void {
    this.guided = guided;
    this.seeker = guided ? seeker : 'NONE';
    this.body.material = !guided ? unguidedMat : seeker === 'IR' ? irMat : radarMat;
    this.pos.set(x, y + 3, z);
    this.age = 0;
    this.topSpeed = SAM_SPEED_MPS * LEVEL_MULT;
    this.speed = this.topSpeed * SAM_BOOST_START;
    // main.py:1069 boost/climb time scales with the target's altitude, at least 90 frames
    this.climbFrames = Math.max(SAM_CLIMB_MIN_FRAMES, (SAM_CLIMB_FRAMES * (target.y / FT)) / CRUISE_ALT_FT);
    this.burnout = this.climbFrames + GUIDED_SUSTAIN_FRAMES; // guided: boost + sustain, then coast
    this.lockLost = false;
    this.lostBy = '';
    this.decoy = null;
    this.decoyFrames = 0;
    this.flareSalvoTried = -1;
    this.chaffSalvoTried = -1;
    this.launcher = launcher;
    this.aLat = 0;
    this.saturated = 0;
    this.prevTgtVel.copy(targetVel);
    // main.py:1073-1078 aim off: where the jet will be when the missile gets there (if it flies on as it is now).
    // A guided missile is launched toward that point too, then steers by proportional navigation.
    let t = this.climbFrames;
    for (let i = 0; i < 8; i++) {
      _aim.copy(target).addScaledVector(targetVel, t * STEP);
      t = this.framesToCover(_aim.distanceTo(this.pos));
    }
    this.dir.copy(_aim).sub(this.pos).normalize();
    if (!guided) {
      // in 3D the "climb" is the flight to the aim point; then 5 s more of motor (main.py:1079)
      this.burnout = t + UNGUIDED_MOTOR_FRAMES;
    }
    this.vel.copy(this.dir).multiplyScalar(this.speed);
    this.mesh.visible = true;
    this.flame.visible = true;
    this.syncMesh();
  }

  /** main.py:1087-1095 frames the motor needs to fly `dist`: speed ramps 35% -> 100% over the climb, then holds. */
  private framesToCover(dist: number): number {
    const c = this.climbFrames;
    const v = this.topSpeed * STEP;
    const climbDist = v * (0.35 * c + (0.65 * c) / 2);
    if (dist >= climbDist) return c + (dist - climbDist) / v;
    const a = (0.65 * v) / (2 * c);
    const b = 0.35 * v;
    return (-b + Math.sqrt(b * b + 4 * a * dist)) / (2 * a);
  }

  /** Point the seeker at a decoy (a flare's position, or a jammed false track). */
  seduce(decoyPos: Vector3): void {
    this.decoy = decoyPos;
    this.decoyFrames = 0;
  }

  /** One 60 Hz frame. Returns why it ended, if it did. */
  step(tgtPos: Vector3 | null, tgtVel: Vector3 | null, groundAt: (x: number, z: number) => number, rand: () => number): MissileEnd {
    this.age++;
    if (this.guided && this.age > SAM_LIFE_FRAMES) return 'expired'; // main.py:1099

    if (!this.guided) {
      this.stepUnguided();
    } else {
      const rhoRatio = airDensity(this.pos.y) / RHO0;
      const share = Math.max(MIN_TURN_SHARE, rhoRatio);
      // main.py:1120 turn cap, and a G limit: both shrink in thin air
      const aMax = Math.min(SAM_TURN_PER_FRAME * 60 * share * this.speed, MAX_G * G0 * share);
      _acc.set(0, 0, 0);
      if (this.decoy) {
        // main.py:1115-1117: turn toward the decoy, blow up near it or after 150 frames (main.py:2288-2293)
        this.decoyFrames++;
        if (this.decoyFrames > DECOY_BLOW_FRAMES || this.pos.distanceTo(this.decoy) < DECOY_BLOW_M) return 'decoy';
        _r.copy(this.decoy).sub(this.pos).normalize();
        turnToward(this.dir, _r, DECOY_TURN_PER_FRAME);
        this.vel.copy(this.dir).multiplyScalar(this.speed);
      } else if (!this.lockLost && tgtPos && tgtVel) {
        _r.copy(tgtPos).sub(this.pos);
        const range = _r.length();
        _rh.copy(_r).divideScalar(range);
        // seeker gimbal: the jet broke out of its view (overshoot after a late hard break)
        if (this.age > this.climbFrames) {
          const opening = (tgtVel.x - this.vel.x) * _rh.x + (tgtVel.y - this.vel.y) * _rh.y + (tgtVel.z - this.vel.z) * _rh.z > 0;
          if (Math.acos(Math.min(1, this.dir.dot(_rh))) > SEEKER_GIMBAL_RAD || (opening && range < PASS_RANGE_M)) {
            this.lockLost = true;
            this.lostBy = 'gimbal';
          }
        }
        // notching: a radar seeker sees Doppler; a jet flying across the line of sight hides in the clutter
        // measured flat, the way the RWR shows it: the missile held at 3 or 9 o'clock, once its climb is over,
        // and diving so the ground clutter is behind the jet
        if (!this.lockLost && this.seeker === 'RADAR' && this.age > this.climbFrames) {
          const hx = _r.x;
          const hz = _r.z;
          const hd = Math.hypot(hx, hz);
          const tv = Math.hypot(tgtVel.x, tgtVel.z);
          const radial = hd > 0 ? Math.abs(tgtVel.x * hx + tgtVel.z * hz) / hd : tv;
          if (hd > NOTCH_MIN_RANGE_M && tv > 1 && tgtVel.y < -NOTCH_DIVE_MPS && radial < NOTCH_BEAM_COS * tv && rand() < 1 - Math.pow(1 - NOTCH_BREAK_PER_S(), STEP)) {
            this.lockLost = true;
            this.lostBy = 'notch';
          }
        }
        if (!this.lockLost) {
          // proportional navigation: a = N * Vc * (LOS rate x LOS)
          _vr.copy(tgtVel).sub(this.vel);
          _omega.crossVectors(_r, _vr).divideScalar(range * range);
          const vc = -_r.dot(_vr) / range;
          _acc.crossVectors(_omega, _rh).multiplyScalar(PN_GAIN * Math.max(vc, 50));
          if (this.motorOn) _acc.y += G0; // the motor holds it up against gravity while it burns
          _acc.addScaledVector(this.dir, -_acc.dot(this.dir)); // fins only push sideways
          const a = _acc.length();
          // out-turned at close range for a third of a second: it cannot come back (overshoot)
          // the jet out-turns it: its turn rate beats the missile's best turn rate
          const tv = Math.max(1, tgtVel.length());
          const jetTurn = _omega.copy(tgtVel).sub(this.prevTgtVel).length() / (tv * STEP);
          const missileTurn = aMax / Math.max(1, this.speed);
          const outTurned = jetTurn > missileTurn && range < OUTTURN_RANGE_M;
          this.saturated = outTurned ? this.saturated + 1 : 0;
          if (this.saturated > OUTTURN_FRAMES) {
            this.lockLost = true;
            this.lostBy = 'gimbal';
          }
          if (a > aMax) _acc.multiplyScalar(aMax / a);
          this.prevTgtVel.copy(tgtVel);
        }
      }
      this.aLat = _acc.length();
      if (this.decoy === null) {
        if (this.motorOn) {
          // boost and sustain: the motor holds the main.py speed profile (main.py:1106)
          this.speed = this.topSpeed * (SAM_BOOST_START + (1 - SAM_BOOST_START) * this.climbShare);
          this.vel.addScaledVector(_acc, STEP);
          this.vel.y -= G0 * STEP;
          this.vel.setLength(this.speed);
        } else {
          // coast: gravity, parasite drag (thick air costs more), induced drag from pulling
          this.vel.addScaledVector(_acc, STEP);
          this.vel.y -= G0 * STEP;
          let v = this.vel.length();
          const drag = COAST_DRAG_K * rhoRatio * v * v + INDUCED_SHARE * this.aLat * (this.aLat / Math.max(1, aMax));
          v = Math.max(0, v - drag * STEP);
          this.vel.setLength(v);
          this.speed = v;
          this.flame.visible = false;
          if (v < MIN_SPEED * LEVEL_MULT) return 'expired'; // out of energy
        }
        this.dir.copy(this.vel).divideScalar(Math.max(1e-3, this.speed));
      }
    }
    this.pos.addScaledVector(this.vel, STEP);
    if (this.age > 30 && this.pos.y <= groundAt(this.pos.x, this.pos.z)) return 'ground'; // main.py:1112 landed
    return 'none';
  }

  get armed(): boolean {
    return this.age > ARM_FRAMES;
  }

  private stepUnguided(): void {
    if (this.age > this.burnout) {
      // motor out: a projectile now, losing speed and falling (main.py:1107-1112)
      this.vel.x *= COAST_DRAG; // main.py:1111
      this.vel.z *= COAST_DRAG;
      this.vel.y = Math.max(-FALL_MAX, this.vel.y - G0 * STEP);
      this.speed = this.vel.length();
      this.dir.copy(this.vel).divideScalar(Math.max(1e-3, this.speed));
      this.flame.visible = false;
    } else {
      this.speed = this.topSpeed * (SAM_BOOST_START + (1 - SAM_BOOST_START) * this.climbShare); // main.py:1106
      this.vel.copy(this.dir).multiplyScalar(this.speed);
    }
  }

  /** Draw-side; with the camera position the missile keeps a minimum size on screen. */
  syncMesh(cam?: Vector3): void {
    this.mesh.position.copy(this.pos);
    const s = cam ? Math.min(60, Math.max(1.6, _cam.copy(cam).distanceTo(this.pos) * MIN_SIZE_PER_M)) : 1.6;
    this.mesh.scale.setScalar(s);
    _q.setFromUnitVectors(_fwd, this.dir);
    this.mesh.quaternion.copy(_q);
  }

  hide(): void {
    this.active = false;
    this.mesh.visible = false;
    this.decoy = null;
  }
}

/** Turn unit vector `dir` toward unit vector `to` by at most `maxAngle` radians. */
function turnToward(dir: Vector3, to: Vector3, maxAngle: number): void {
  const ang = Math.acos(Math.min(1, Math.max(-1, dir.dot(to))));
  if (ang <= maxAngle) {
    dir.copy(to);
    return;
  }
  _axis.crossVectors(dir, to);
  if (_axis.lengthSq() < 1e-10) _axis.set(1, 0, 0);
  dir.applyAxisAngle(_axis.normalize(), maxAngle);
}
