import * as THREE from 'three';
import { createFighter } from '../aircraft/fighter.js';
import { createAirliner } from '../aircraft/airliner.js';
import { stepRotorcraft } from '../physics/aero.js';

// Player 2 (same screen as player 1 - no split; second PS5 / any gamepad). Own aircraft and state;
// the shared camera in index.html frames both aircraft (sharedChaseCamera below).
// Flies with the same fixed-wing equations as player 1 (lift from AoA and speed, bank turns from the lift,
// slip decay, ground roll, rotate at Vr) and the shared rotorcraft model for the helicopter.
// P2 pad: right stick pitch/roll, left stick throttle + rudder, L2/R2 throttle, Cross = gun (fighter),
// Square = missile on lock (fighter), D-pad left/right = change aircraft, Options = respawn beside player 1.
const FACTORIES = { fighter: createFighter };
const ORDER = ['trainer', 'airliner', 'fighter', 'heli'];
const NAMES = { trainer: 'TRAINER', airliner: 'AIRLINER', fighter: 'FIGHTER', heli: 'HELICOPTER' };

export class Wingman {
  // ctx: { scene, terrain, combat, visuals, amslFt, message(text, color), exteriorLayer }
  constructor(ctx) {
    this.ctx = ctx;
    this.type = 'fighter';
    this.aircraft = null;
    this.profile = null;
    this.state = {
      pos: new THREE.Vector3(), vel: new THREE.Vector3(), rot: new THREE.Euler(0, 0, 0, 'YXZ'),
      throttle: 0, power: 0, ias: 0, onGround: true, prevOnGround: true, isAfterburner: false, airTime: 0, rollout: false
    };
    this.lastGun = 0;
    this.missiles = 6;
    this.active = false;
    this.hud = document.createElement('div');
    this.hud.id = 'wingman-hud';
    this.hud.style.cssText = 'position:fixed;bottom:96px;right:12px;z-index:10002;padding:8px 12px;font:bold 13px monospace;' +
      'color:#fbbf24;background:rgba(6,12,18,0.82);border:1px solid rgba(251,191,36,0.6);border-radius:4px;display:none;pointer-events:none;white-space:pre;';
    document.body.appendChild(this.hud);
    this.tmpQ = new THREE.Quaternion();
    this.fwd = new THREE.Vector3();
  }

  setType(type) {
    if (this.aircraft) {
      this.ctx.scene.remove(this.aircraft.mesh);
      this.aircraft.dispose();
    }
    this.type = type;
    this.aircraft = FACTORIES[type]();
    this.profile = this.aircraft.profile;
    this.ctx.visuals.enhanceAircraft(this.aircraft.mesh);
    this.ctx.scene.add(this.aircraft.mesh);
    this.aircraft.mesh.visible = this.active;
  }

  // Next to player 1: on the runway 150 m behind (staggered take-off), or 80 m right / 40 m behind in the air
  spawnBeside(p1) {
    const s = this.state;
    const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, p1.rot.y, 0, 'YXZ'));
    const back = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(0, p1.rot.y, 0, 'YXZ'));
    if (p1.onGround) {
      s.pos.copy(p1.pos).addScaledVector(back, 150);
      s.pos.y = this.ctx.terrain.groundY(s.pos.x, s.pos.z) + this.profile.groundHeight;
      s.vel.set(0, 0, 0);
      s.rot.set(0, p1.rot.y, 0);
      s.throttle = 0; s.power = 0; s.onGround = true;
    } else {
      s.pos.copy(p1.pos).addScaledVector(right, 80).addScaledVector(back, 40);
      s.vel.copy(p1.vel);
      s.rot.set(p1.rot.x, p1.rot.y, 0);
      s.throttle = p1.throttle; s.power = p1.power; s.onGround = false;
    }
    s.prevOnGround = s.onGround;
    s.airTime = 0;
    s.rollout = false;
    this.missiles = 6;
  }

  enable(on, p1) {
    this.active = on;
    if (on && !this.aircraft) this.setType(this.type);
    if (on) this.spawnBeside(p1);
    if (this.aircraft) this.aircraft.mesh.visible = on;
    this.hud.style.display = on ? 'block' : 'none';
  }

  crash(reason, p1) {
    this.ctx.message(`P2 CRASH: ${reason} - back beside P1`, '#f59e0b', 3000);
    this.spawnBeside(p1);
  }

  // pad: GamepadInput.poll() result for the second controller (or null); p1: player 1 state
  update(dt, pad, p1) {
    if (!this.active) return;
    const s = this.state, p = this.profile;
    let pIn = 0, rIn = 0, yIn = 0;
    if (pad) {
      pIn = pad.pitch; rIn = pad.roll; yIn = pad.yaw;
      s.throttle = Math.max(0, Math.min(1, s.throttle + pad.throttleRate * 0.4 * dt));
      for (const a of pad.actions) {
        if (a === 'prevAircraft' || a === 'nextAircraft') {
          const step = a === 'nextAircraft' ? 1 : ORDER.length - 1;
          this.setType(ORDER[(ORDER.indexOf(this.type) + step) % ORDER.length]);
          this.spawnBeside(p1);
          this.ctx.message(`P2: ${NAMES[this.type]}`, '#fbbf24', 2000);
        } else if (a === 'approach') {
          this.spawnBeside(p1);
        } else if (a === 'autopilot' && this.type === 'fighter') {
          this.fireMissile();
        }
      }
      const now = performance.now();
      if (pad.fire && this.type === 'fighter' && now - this.lastGun > 100) {
        this.lastGun = now;
        this.fwd.set(0, 0, -1).applyEuler(s.rot);
        this.ctx.combat.weapons.fireCannon(s.pos.clone().addScaledVector(this.fwd, 8), s.vel, this.fwd);
      }
    }
    s.power += (s.throttle * 100 - s.power) * 3.5 * dt;
    s.isAfterburner = p.afterburnerThrust !== undefined && s.throttle > 0.7;

    const terrainY = this.ctx.terrain.groundY(s.pos.x, s.pos.z);
    const fwdX = -Math.sin(s.rot.y), fwdZ = -Math.cos(s.rot.y);
    let forwardSpeed = Math.max(0, s.vel.x * fwdX + s.vel.z * fwdZ);
    s.ias = forwardSpeed * 1.94384;
    const velYBefore = s.vel.y;

    if (p.rotorcraft) {
      s.prevOnGround = s.onGround;
      stepRotorcraft(s, { pitch: pIn, roll: rIn, yaw: yIn }, p, dt, terrainY);
    } else {
      const cEff = Math.max(0.35, Math.min(1.2, forwardSpeed / 25));
      // attitude holds when the stick is let go (same as player 1; P2 has no autopilot)
      s.rot.x += pIn * p.maxPitchRate * cEff * dt;
      s.rot.z += -rIn * p.maxRollRate * cEff * dt;
      s.prevOnGround = s.onGround;
      const groundHeight = terrainY + p.groundHeight;
      const wheelsDown = s.pos.y <= groundHeight;
      const gamma = Math.atan2(s.vel.y, Math.max(1, forwardSpeed));
      const alpha = s.rot.x - gamma;
      const clMax = p.cl0 + p.clAlpha * p.stallAoA;
      let cl = alpha > p.stallAoA ? clMax * 0.55 : p.cl0 + p.clAlpha * alpha;
      cl = Math.max(-clMax, cl);
      const vs = p.stallKt / 1.94384;
      const liftAccel = 9.81 * (forwardSpeed / vs) ** 2 * (cl / clMax);
      const inducedDrag = Math.abs(liftAccel * cl) * 0.05;
      const turnLift = Math.max(-3 * 9.81, Math.min(6 * 9.81, liftAccel));
      const turnRate = wheelsDown ? 0 : turnLift * Math.sin(-s.rot.z) / Math.max(25, forwardSpeed);
      s.rot.y += (yIn * p.maxYawRate * cEff - turnRate) * dt;
      const fx = -Math.sin(s.rot.y), fz = -Math.cos(s.rot.y);
      const along = s.vel.x * fx + s.vel.z * fz;
      const slipKeep = Math.exp(-(wheelsDown ? 12 : 2.5) * dt);
      s.vel.x = fx * along + (s.vel.x - fx * along) * slipKeep;
      s.vel.z = fz * along + (s.vel.z - fz * along) * slipKeep;
      if (wheelsDown) {
        s.pos.y = groundHeight;
        s.onGround = true;
        s.rot.x = Math.max(0, Math.min(0.22, s.rot.x));
        s.rot.z *= 0.85;
        const braking = pad && pad.brake;
        const groundDecel = (s.throttle < 0.05 ? 1.2 : 0) + (braking ? 5.0 : 0);
        const rollSpeed = Math.hypot(s.vel.x, s.vel.z);
        if (groundDecel > 0 && rollSpeed > 0) {
          const k = Math.max(0, rollSpeed - groundDecel * dt) / rollSpeed;
          s.vel.x *= k; s.vel.z *= k;
        }
        if (s.throttle >= 0.05) {
          const gt = (s.power / 100) * p.groundThrust;
          s.vel.x += fx * gt * dt; s.vel.z += fz * gt * dt;
          s.vel.x *= 0.998; s.vel.z *= 0.998;
        }
        if (s.rollout) {
          s.rot.x = Math.max(0, s.rot.x - 0.12 * dt);
          if (s.ias < 30) s.rollout = false;
        }
        if ((!s.rollout || s.throttle > 0.5) && s.ias > p.vr && s.rot.x > 0.05 && liftAccel > 9.81) {
          s.rollout = false;
          s.onGround = false;
          s.vel.y = 0.5;
        } else {
          s.vel.y = 0;
        }
      } else {
        s.onGround = false;
        s.vel.y += (liftAccel * Math.cos(s.rot.z) - 9.81) * dt;
        s.vel.y = Math.max(-35, Math.min(40, s.vel.y));
        const maxThrust = s.isAfterburner ? p.afterburnerThrust : p.maxThrust;
        const mach = s.ias / 661.47;
        const waveDrag = mach > 0.85 && mach < 1.25 ? 0.0014 : 0.0006;
        const alongAccel = (s.power / 100) * maxThrust - waveDrag * forwardSpeed * forwardSpeed - inducedDrag - 9.81 * Math.sin(gamma);
        s.vel.x += fx * alongAccel * dt;
        s.vel.z += fz * alongAccel * dt;
      }
    }

    const gLimit = terrainY + p.groundHeight;
    if (s.pos.y < gLimit) { s.pos.y = gLimit; s.vel.y = 0; s.onGround = true; }
    s.pos.addScaledVector(s.vel, dt);

    // Touchdown check (same limits as player 1, no runway rating)
    if (!s.onGround) s.airTime += dt;
    if (s.onGround && !s.prevOnGround && s.airTime > 1.5) {
      s.airTime = 0;
      const fpm = -velYBefore * 196.85;
      const rollDeg = Math.abs(s.rot.z) * 180 / Math.PI;
      if (fpm > 900) return this.crash(`HARD LANDING ${Math.round(fpm)} FPM`, p1);
      if (!p.rotorcraft && rollDeg > 15) return this.crash('WINGTIP STRIKE', p1);
      if (!p.rotorcraft && s.rot.x < -0.09) return this.crash('NOSE-FIRST TOUCHDOWN', p1);
      if (!p.rotorcraft) s.rollout = true;
      this.ctx.message(`P2 LANDED - ${Math.round(fpm)} FPM`, '#fbbf24', 3000);
    }

    // Airframe
    const mesh = this.aircraft.mesh;
    mesh.position.copy(s.pos);
    mesh.rotation.copy(s.rot);
    this.aircraft.update(dt, { input: { pitch: pIn, roll: rIn, yaw: yIn }, throttle: s.throttle, power: s.power, isAfterburner: s.isAfterburner, iasKt: s.ias });

    const hdg = ((90 - s.rot.y * 180 / Math.PI) % 360 + 360) % 360;
    const sep = s.pos.distanceTo(p1.pos);
    this.hud.textContent = `P2 ${NAMES[this.type]}${this.type === 'fighter' ? `  MSL ${this.missiles}` : ''}\n` +
      `${Math.round(s.ias)} KT  ${Math.round(this.ctx.amslFt(s.pos.y))} FT  HDG ${String(Math.round(hdg)).padStart(3, '0')}\n` +
      `PWR ${Math.round(s.power)}%${s.isAfterburner ? ' AB' : ''}  P1 ${sep < 1852 ? Math.round(sep) + ' M' : (sep / 1852).toFixed(1) + ' NM'}`;
  }

  fireMissile() {
    const s = this.state;
    this.fwd.set(0, 0, -1).applyEuler(s.rot);
    // Own lock: nearest live target inside a 30 degree cone, 15 km
    let lock = null, best = Infinity;
    for (const t of this.ctx.combat.targets.targets) {
      if (t.isDestroyed) continue;
      const to = t.position.clone().sub(s.pos);
      const d = to.length();
      const ang = this.fwd.angleTo(to.normalize());
      if (d < 15000 && ang < Math.PI / 6 && ang < best) { best = ang; lock = t; }
    }
    if (!lock) { this.ctx.message('P2: NO LOCK', '#fbbf24', 1500); return; }
    if (this.missiles <= 0) { this.ctx.message('P2: NO MISSILES LEFT', '#fbbf24', 1500); return; }
    this.missiles--;
    this.ctx.combat.weapons.launchMissile(s.pos.clone().addScaledVector(this.fwd, 4), s.vel, this.fwd.clone(), lock);
    this.ctx.message(`P2 FOX 2 - ${lock.id}`, '#fbbf24', 2000);
  }
}

// One shared camera for two players: behind and above the midpoint of both aircraft, looking along
// player 1's heading; it pulls back as they separate so both stay on screen (up to ~6 km apart).
const _mid = new THREE.Vector3();
const _back = new THREE.Vector3();
const _sharedOffset = new THREE.Vector3();
export function sharedChaseCamera(camera, p1, p2, baseDist, dt) {
  _mid.copy(p1.pos).add(p2.pos).multiplyScalar(0.5);
  const sep = p1.pos.distanceTo(p2.pos);
  const dist = Math.min(9000, Math.max(baseDist, sep * 1.25 + baseDist));
  _back.set(Math.sin(p1.rot.y), 0, Math.cos(p1.rot.y)); // behind player 1's heading
  const target = _back.multiplyScalar(dist).add(new THREE.Vector3(0, baseDist * 0.25 + dist * 0.28, 0));
  if (_sharedOffset.lengthSq() === 0 || dt === 0) _sharedOffset.copy(target);
  else _sharedOffset.lerp(target, 1 - Math.exp(-3 * dt));
  camera.position.copy(_mid).add(_sharedOffset);
  camera.lookAt(_mid);
  return sep;
}
