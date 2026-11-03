// Fixed-wing flight on standard aerodynamics (user, 03-Nov-2026: rolling, pitching, turning and speed must follow
// real flight rules, and each aircraft must fly like itself). Per unit mass, from each aircraft's own data:
//   Lift   L = 1/2 rho V^2 S CL       CL = cl0 + clAlpha * alpha, up to the stall angle; beyond it lift collapses
//   Drag   D = 1/2 rho V^2 S (cd0 + CL^2 / (pi e AR))    so a hard turn costs speed; extra wave drag near Mach 1
//   Thrust jets fall with air density; a propeller gives constant power, so its thrust falls with speed
//   Weight acts straight down on the true 3D velocity     so a nose-down aircraft dives and gains speed
//   Air    International Standard Atmosphere for density and the speed of sound
//   Turns  lift tilts with the bank: turn rate = g tan(bank) / V and load factor n = 1 / cos(bank) come out of this
// Stick and rudder move the aircraft about its own axes at each type's rates. Rudder yaws a little and the sideslip
// rolls the aircraft the same way. Hands off, the bank stays and the flight path is held (user, 01-Nov-2026).
// The helicopter has its own model in aero.js.
import * as THREE from 'three';

const G = 9.81;
const KT_TO_MS = 1 / 1.94384;
const RHO0 = 1.225;
const AB_GATE = 0.7;

// thrust, afterburner: full-power jet acceleration at sea level (m/s2); powerPerKg: propeller power (W/kg);
// wave: drag factor from Mach 0.85 to 1.25; nMax, nMin: g limits; roll, pitch, yaw: rad/s at full control;
// rollLag: seconds for a roll to build up; spool: how fast the engine follows the throttle (1/s);
// fbw: flight computer keeps the wing below the stall; bankMax: bank limit (rad); vne, mmo: never-exceed speed (kt) and Mach;
// gTolerance: g the pilot holds without greying out (a g-suit in the fighter)
export const AIR = {
  fighter: { thrust: 7.5, afterburner: 14, wave: 1.85, nMax: 9, nMin: -3, roll: 3.0, pitch: 0.7, yaw: 0.2, rollLag: 0.15, spool: 1.2, fbw: true, vne: 800, mmo: 2.0, gTolerance: 6.5 },
  trainer: { thrust: 3.2, powerPerKg: 48, wave: 1, nMax: 6, nMin: -3, roll: 1.2, pitch: 0.6, yaw: 0.25, rollLag: 0.25, spool: 2.0, vne: 230, mmo: 0.6, gTolerance: 4.5 },
  airliner: { thrust: 3.0, wave: 1.3, nMax: 2.5, nMin: -1, roll: 0.4, pitch: 0.2, yaw: 0.06, rollLag: 0.6, spool: 0.25, bankMax: 45 * Math.PI / 180, vne: 340, mmo: 0.82, gTolerance: 4.5 }
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clMaxOf = (p) => p.cl0 + p.clAlpha * p.stallAoA;

// International Standard Atmosphere: density ratio and speed of sound at a height in metres above sea level
export function atmosphere(hM) {
  const h = clamp(hM, 0, 20000);
  const t = 1 - 2.2558e-5 * Math.min(h, 11000);
  const sigma = t ** 4.2559 * (h > 11000 ? Math.exp(-(h - 11000) / 6342) : 1);
  return { sigma, soundMs: 340.3 * Math.sqrt(t) };
}

function liftCoefficient(alpha, p) {
  const clMax = clMaxOf(p);
  const beyond = Math.abs(alpha) - p.stallAoA;
  // Past the stall angle the airflow separates: lift falls away over the next 8 degrees, down to 55 %
  if (beyond > 0) return Math.sign(alpha) * clMax * (1 - 0.45 * Math.min(1, beyond / 0.14));
  return clamp(p.cl0 + p.clAlpha * alpha, -clMax, clMax);
}

const dragShare = (cl, p) => Math.abs(cl) / (Math.PI * p.oswaldEfficiency * p.aspectRatio);

// Parasite + wave drag per unit mass
function parasiteDrag(v, p, air, atm, stalled) {
  // Wave drag rises smoothly towards Mach 1 and eases off well past it
  const mach = v / atm.soundMs;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const waveShare = smooth(0.8, 0.98, mach) * (1 - smooth(1.2, 1.45, mach));
  const cd = p.cd0 * (1 + (air.wave - 1) * waveShare) + (stalled ? 0.3 : 0);
  return 0.5 * RHO0 * atm.sigma * v * v * p.wingArea * cd / p.mass;
}

// Engine thrust per unit mass at this power, speed and air density
function thrustAccel(power01, afterburner, v, air, atm) {
  if (air.powerPerKg) return power01 * Math.min(air.thrust * atm.sigma, air.powerPerKg * atm.sigma / Math.max(1, v));
  // Afterburning jet: 70 % throttle is full dry thrust, and thrust climbs on without a jump as the burner lights
  if (air.afterburner) {
    const thrust = power01 <= AB_GATE
      ? air.thrust * power01 / AB_GATE
      : air.thrust + (air.afterburner - air.thrust) * (power01 - AB_GATE) / (1 - AB_GATE);
    return thrust * atm.sigma ** 0.7;
  }
  return power01 * air.thrust * atm.sigma ** 0.7;
}

// Take-off / landing roll: engine against air drag and tyre rolling resistance (0.02 g)
export function groundRollAccel(state, type, p, v, hM) {
  const air = AIR[type], atm = atmosphere(hM);
  return thrustAccel(state.power / 100, state.isAfterburner, v, air, atm) - parasiteDrag(v, p, air, atm, false) - (v > 0.5 ? 0.02 * G : 0);
}

// Throttle (0..1) that holds speed v on a steady path of angle gammaRad (used to trim a final approach)
export function trimThrottle(type, p, v, gammaRad, hM) {
  const air = AIR[type], atm = atmosphere(hM);
  const cl = clMaxOf(p) * (p.stallKt * KT_TO_MS / v) ** 2 / atm.sigma;
  const drag = parasiteDrag(v, p, air, atm, false) + G * dragShare(cl, p);
  const fullDry = air.afterburner ? AB_GATE : 1;
  return clamp((drag + G * Math.sin(gammaRad)) / thrustAccel(fullDry, false, v, air, atm) * fullDry, 0, fullDry);
}

// Angle of attack for steady flight at speed v
export function trimAlpha(p, v, hM) {
  const cl = clMaxOf(p) * (p.stallKt * KT_TO_MS / v) ** 2 / atmosphere(hM).sigma;
  return (cl - p.cl0) / p.clAlpha;
}

const q = new THREE.Quaternion();
const qInv = new THREE.Quaternion();
const dq = new THREE.Quaternion();
const nose = new THREE.Vector3();
const up = new THREE.Vector3();
const right = new THREE.Vector3();
const vHat = new THREE.Vector3();
const vBody = new THREE.Vector3();
const liftDir = new THREE.Vector3();
const accel = new THREE.Vector3();
const pathRate = new THREE.Vector3();
const axis = new THREE.Vector3();

// input: { pitch: +1 pull .. -1 push, roll: +1 right, yaw: +1 left, autoAltFt: null or error to the target altitude,
//          wingsLevel: autopilot levels the wings, gentleRoll: NAV limits the roll rate, hM: height above sea level }
export function stepFixedWingAir(state, input, p, type, dt) {
  const air = AIR[type];
  const atm = atmosphere(input.hM);
  const vs = p.stallKt * KT_TO_MS;         // stall speed at sea-level density, 1 g
  const clMax = clMaxOf(p);

  q.setFromEuler(state.rot);
  nose.set(0, 0, -1).applyQuaternion(q);
  up.set(0, 1, 0).applyQuaternion(q);
  right.set(1, 0, 0).applyQuaternion(q);

  const v = Math.max(1, state.vel.length());
  vHat.copy(state.vel).divideScalar(v);
  vBody.copy(state.vel).applyQuaternion(qInv.copy(q).invert());
  const alpha = Math.atan2(-vBody.y, -vBody.z);
  const beta = Math.atan2(vBody.x, -vBody.z);
  const gamma = Math.asin(clamp(vHat.y, -1, 1));
  state.aoa = alpha;

  // (V / Vs)^2 at this air density = the g the wing gives at CLmax. Controls bite with it too.
  const qRatio = atm.sigma * (v / vs) ** 2;
  const ctrl = clamp(qRatio, 0.2, 1);

  // Load factor asked for. Hands off holds the flight path: n = cos(gamma) / cos(bank), as far as the bank allows
  const cosBank = Math.cos(state.rot.z);
  const hold = cosBank >= 0.34
    ? Math.cos(gamma) / cosBank
    : 1 + (Math.cos(gamma) / 0.34 - 1) * clamp((cosBank + 0.1) / 0.44, 0, 1);
  let nCmd;
  if (input.autoAltFt !== null && input.autoAltFt !== undefined) {
    const vsLimit = Math.min(25, v * 0.2);
    const vsWanted = clamp(input.autoAltFt * 0.3048 * 0.08, -vsLimit, vsLimit);
    nCmd = hold + clamp((vsWanted - state.vel.y) * 0.06, -0.5, 0.5);
  } else {
    // Keyboard and touch stick are all-or-nothing, so the stick moves over a moment: a tap asks for a little g
    // (a gentle flare), holding it asks for the limit. Same smoothing on a pad, so all inputs fly alike.
    const stickGoal = input.pitch, rate = (Math.abs(stickGoal) > Math.abs(state.stick || 0) ? 1.5 : 3) * dt;
    state.stick = (state.stick || 0) + clamp(stickGoal - (state.stick || 0), -rate, rate);
    const demand = state.stick ** 3;
    // Stick moved, or the wing at its limit: the path you are on now becomes the one held when you let go
    const atLimit = Math.abs(alpha) > p.stallAoA * 0.95 || qRatio < 1;
    if (Math.abs(state.stick) > 0.02 || atLimit || state.holdGamma === null || state.holdGamma === undefined) state.holdGamma = gamma;
    const pathError = clamp((state.holdGamma - gamma) * v * 0.5 / G, -0.5, 0.5);
    nCmd = demand >= 0 ? hold + pathError + demand * (air.nMax - hold) : hold + pathError + demand * (hold - air.nMin);
  }
  nCmd = clamp(nCmd, air.nMin, air.nMax);

  // The fighter's flight computer stops short of the stall. In the others, holding full back stick takes the wing past it.
  const alphaTop = p.stallAoA * (!air.fbw && (state.stick || 0) > 0.9 ? 1.15 : 0.98);
  const alphaCmd = clamp((clMax * nCmd / qRatio - p.cl0) / p.clAlpha, -p.stallAoA * 0.98, alphaTop);

  // Forces per unit mass: lift across the velocity in the wings' plane, drag against it, thrust along the nose, weight down
  const cl = liftCoefficient(alpha, p);
  const stalled = Math.abs(alpha) > p.stallAoA;
  const lift = clamp(G * qRatio * (cl / clMax), air.nMin * 1.1 * G, air.nMax * 1.1 * G);
  liftDir.copy(up).addScaledVector(vHat, -up.dot(vHat));
  if (liftDir.lengthSq() > 1e-6) liftDir.normalize(); else liftDir.copy(up);
  const drag = parasiteDrag(v, p, air, atm, stalled) + Math.abs(lift) * dragShare(cl, p);
  const side = clamp(-beta * v * v * 0.002, -2 * G, 2 * G);
  // The fighter's flight computer eases the engines back as it nears its speed limit, so power alone cannot overspeed it.
  // A steep dive still can.
  const iasNow = v * Math.sqrt(atm.sigma) * 1.94384;
  const speedGuard = air.fbw ? clamp((air.vne - iasNow) / 50, 0, 1) * clamp((air.mmo - v / atm.soundMs) / 0.1, 0, 1) : 1;
  accel.copy(nose).multiplyScalar(thrustAccel(state.power / 100, state.isAfterburner, v, air, atm) * speedGuard)
    .addScaledVector(liftDir, lift)
    .addScaledVector(vHat, -drag)
    .addScaledVector(right, side);
  accel.y -= G;

  // How fast the flight path itself is turning: the nose goes with it, plus the corrections below
  pathRate.crossVectors(vHat, accel).divideScalar(v);
  const pathPitch = pathRate.dot(right), pathYaw = pathRate.dot(up), pathRoll = -pathRate.dot(nose);

  // Stalled: the nose drops and a wing falls until the pilot lowers the angle of attack and adds power
  if (stalled && !state.stalled) state.wingDrop = (Math.random() < 0.5 ? -1 : 1) * 0.3;
  state.stalled = stalled;
  const pitchRate = clamp(pathPitch + 4 * ctrl * (alphaCmd - alpha) - (stalled ? 0.35 * Math.sign(alpha) : 0), -air.pitch, air.pitch);
  const yawRate = pathYaw + input.yaw * air.yaw * ctrl - 2 * beta;

  // Roll builds up over a moment; the autopilot is gentle; sideslip rolls the aircraft (rudder banks it)
  let rollWanted = -input.roll * air.roll * ctrl + 1.5 * beta + (stalled ? state.wingDrop : 0);
  if (input.wingsLevel) rollWanted += clamp(-state.rot.z * 0.5, -0.35, 0.35);
  if (input.gentleRoll) rollWanted = clamp(rollWanted, -0.35, 0.35);
  if (air.bankMax) {   // a heavy aircraft is held inside its bank limit
    if (state.rot.z > air.bankMax) rollWanted = Math.min(rollWanted, -(state.rot.z - air.bankMax));
    else if (state.rot.z < -air.bankMax) rollWanted = Math.max(rollWanted, -air.bankMax - state.rot.z);
  }

  // Limits the game reacts to: g on the airframe and the pilot, never-exceed speed (past 20 % over it the structure fails)
  state.loadG = lift / G;
  const ias = v * Math.sqrt(atm.sigma) * 1.94384, mach = v / atm.soundMs;
  state.overspeed = ias > air.vne || mach > air.mmo;
  if (ias > air.vne * 1.2 || mach > air.mmo * 1.2) state.structuralFail = true;
  state.rollRate = (state.rollRate || 0) + (rollWanted - (state.rollRate || 0)) * Math.min(1, dt / air.rollLag);

  state.vel.addScaledVector(accel, dt);

  axis.set(pitchRate, yawRate, state.rollRate + pathRoll);
  const angle = axis.length() * dt;
  if (angle > 1e-7) {
    axis.normalize();
    q.multiply(dq.setFromAxisAngle(axis, angle)).normalize();
    state.rot.setFromQuaternion(q, 'YXZ');
  }
}
