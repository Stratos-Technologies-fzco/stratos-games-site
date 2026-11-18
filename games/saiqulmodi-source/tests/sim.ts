// Headless test: 50 guided SAM launches (half radar from batteries, half heat-seeking from TELs), each flown
// from the same start by several pilots: one who does nothing, one who uses the right countermeasure
// (flares vs heat seekers; notch + chaff + ECM vs radar; a hard break when it gets close), and three who use
// only one trick each (notch only, late break only, afterburner run only). Same code as the game.
// Run: npm run test:sim
import { Vector3 } from 'three';
import { FT, STEP } from '../src/config';
import type { Input } from '../src/core/Input';
import { JetPhysics } from '../src/flight/JetPhysics';
import type { Launcher } from '../src/threats/Launchers';
import type { Missile } from '../src/threats/Missile';
import { makeRand, ThreatSystem } from '../src/threats/ThreatSystem';
import { heightAt } from '../src/world/Terrain';
import { Weapons } from '../src/weapons/Weapons';

const TRIALS = 50;
const MAX_FRAMES = 60 * 60;

const inp = { pitch: 0, roll: 0, yaw: 0, throttle: 0, afterburner: false };
const asInput = inp as unknown as Input;
const vh = new Vector3();
const perp = new Vector3();
const cr = new Vector3();
const los = new Vector3();
const side = new Vector3();
const up = new Vector3(0, 1, 0);

/** roll the lift vector toward `dir` (its part across the flight path) and pull `pull` */
function steerLift(j: JetPhysics, dir: Vector3, pull: number): void {
  vh.copy(j.vel).normalize();
  perp.copy(dir).addScaledVector(vh, -dir.dot(vh));
  if (perp.lengthSq() < 1e-6) {
    inp.pitch = pull;
    return;
  }
  perp.normalize();
  const ang = Math.acos(Math.max(-1, Math.min(1, j.liftUp.dot(perp))));
  cr.crossVectors(j.liftUp, perp);
  const sgn = Math.sign(cr.dot(vh)) || 1;
  inp.roll = Math.max(-1, Math.min(1, sgn * ang * 2));
  inp.pitch = ang < 0.6 ? pull : 0.15;
}

type Pilot = 'passive' | 'countermeasures' | 'notch only' | 'late break only' | 'afterburner run only' | 'AAM shoots it down';
type Cause = 'hit' | 'crashed' | 'shot down' | 'flares' | 'chaff' | 'ECM' | 'notch' | 'overshoot' | 'out of energy' | 'self-destruct' | 'ground';

function notch(jet: JetPhysics, m: Missile, pull: number): void {
  los.copy(m.pos).sub(jet.pos).normalize();
  side.crossVectors(los, up).normalize();
  if (side.dot(jet.vel) < 0) side.negate();
  side.y = jet.pos.y - heightAt(jet.pos.x, jet.pos.z) > 1500 ? -0.3 : 0; // dive while there is room
  steerLift(jet, side.normalize(), pull);
}

function lateBreak(jet: JetPhysics, m: Missile): void {
  los.copy(m.pos).sub(jet.pos).normalize();
  side.crossVectors(jet.vel, los).normalize();
  steerLift(jet, side, 1);
  inp.afterburner = true;
}

function fly(ts: ThreatSystem, l: Launcher, startPos: Vector3, heading: number, pilot: Pilot, seed: number): Cause {
  ts.reset(seed);
  const jet = new JetPhysics();
  jet.reset(startPos.x, startPos.z, heading);
  jet.pos.y = startPos.y;
  Object.assign(inp, { pitch: 0, roll: 0, yaw: 0, throttle: 0, afterburner: false });
  const m = ts.launch(l, jet, true) as Missile;
  let breaking = false;
  let lastDecoy: 'flares' | 'chaff' | 'ECM' | '' = '';
  let lastLost: '' | 'gimbal' | 'notch' = '';
  let lastSpeed = 0;
  shotDown = false;
  weapons.reset();
  for (let f = 0; f < MAX_FRAMES; f++) {
    Object.assign(inp, { pitch: 0, roll: 0, yaw: 0, throttle: 0, afterburner: false });
    const tracking = m.active && m.tracking;
    const d = m.pos.distanceTo(jet.pos);
    // break when it is about 4 s from impact (range / closing speed)
    if (tracking) {
      const closing = -((jet.vel.x - m.vel.x) * (jet.pos.x - m.pos.x) + (jet.vel.y - m.vel.y) * (jet.pos.y - m.pos.y) + (jet.vel.z - m.vel.z) * (jet.pos.z - m.pos.z)) / Math.max(1, d);
      if (closing > 0 && d / closing < 4) breaking = true;
    }
    if (pilot === 'countermeasures' && tracking) {
      if (m.seeker === 'IR') {
        if (d < 900 && m.climbShare > 0.5) ts.cm.fireFlares(jet.pos, jet.vel); // inside flare range (main.py:1988)
      } else {
        notch(jet, m, 0.8);
        if (d < 1200 && m.climbShare > 0.5) ts.cm.fireChaff(jet.pos, jet.vel); // inside chaff range
        if (d < 1700) ts.cm.fireEcm(jet.pos, ts.missiles.items, ts.rand); // inside ECM range
      }
      if (breaking) lateBreak(jet, m);
    } else if (pilot === 'notch only' && tracking) {
      notch(jet, m, 0.8);
    } else if (pilot === 'late break only' && tracking && breaking) {
      lateBreak(jet, m);
    } else if (pilot === 'AAM shoots it down' && tracking) {
      if (d < 4500 && weapons.missileCd === 0) weapons.fireMissile('AAM', jet.pos, jet.vel);
    } else if (pilot === 'afterburner run only' && tracking) {
      // turn tail on the missile and run on afterburner, diving gently
      los.copy(jet.pos).sub(m.pos);
      los.y = -0.15 * Math.hypot(los.x, los.z);
      steerLift(jet, los.normalize(), 1);
      inp.afterburner = true;
    }
    // every pilot except the passive one keeps clear of the ground: wings level and pull up when low and sinking
    if (pilot !== 'passive' && jet.pos.y - heightAt(jet.pos.x, jet.pos.z) < 1000 && jet.vel.y < 0) {
      inp.roll = Math.max(-1, Math.min(1, -jet.liftUp.dot(side.crossVectors(jet.vel, up).normalize()) * 3));
      inp.pitch = 1;
    }
    jet.step(STEP, asInput);
    if (m.active) {
      lastDecoy = m.decoy === null ? '' : m.decoy === m.falseTrack ? 'ECM' : m.seeker === 'RADAR' ? 'chaff' : 'flares';
      lastLost = m.lostBy;
      lastSpeed = m.speed;
    }
    const wasActive = m.active;
    const age = m.age;
    ts.step(jet, false);
    weapons.step();
    if (ts.hitThisFrame) return 'hit';
    if (jet.pos.y < heightAt(jet.pos.x, jet.pos.z)) return 'crashed';
    if (wasActive && !m.active) {
      if (shotDown) return 'shot down';
      if (lastDecoy) return lastDecoy;
      if (lastLost === 'notch') return 'notch';
      if (lastLost === 'gimbal') return 'overshoot';
      if (lastSpeed < 200) return 'out of energy';
      return age >= 2400 ? 'self-destruct' : 'ground';
    }
  }
  return 'self-destruct';
}

const ts = new ThreatSystem(null, 1);
let shotDown = false;
const weapons = new Weapons(null, ts, {
  say: (text) => {
    if (text === 'MISSILE SHOT DOWN') shotDown = true;
  },
  blast: () => {},
  sound: () => {},
  smoke: () => {},
});
const radars = ts.launchers.filter((l) => l.kind === 'SAM');
const tels = ts.launchers.filter((l) => l.kind === 'TEL');
const rand = makeRand(77);
const pilots: Pilot[] = ['passive', 'countermeasures', 'notch only', 'late break only', 'afterburner run only', 'AAM shoots it down'];
type Tally = Record<string, number>;
const res: Record<Pilot, { RADAR: Tally; IR: Tally }> = {} as never;
for (const p of pilots) res[p] = { RADAR: {}, IR: {} };
const start = new Vector3();
for (let t = 0; t < TRIALS; t++) {
  const isRadar = t % 2 === 0;
  const l = isRadar ? radars[Math.floor(rand() * radars.length)] : tels[Math.floor(rand() * tels.length)];
  // the jet inside the launcher's ring, 15,000-35,000 ft, any heading
  const a = rand() * Math.PI * 2;
  const r = l.range * (0.45 + 0.5 * rand());
  const altFt = 15000 + rand() * 20000;
  start.set(l.x + Math.cos(a) * r, Math.max(altFt * FT, heightAt(l.x, l.z) + 3000), l.z + Math.sin(a) * r);
  const heading = rand() * Math.PI * 2;
  for (const p of pilots) {
    const c = fly(ts, l, start, heading, p, 1000 + t);
    const bucket = res[p][isRadar ? 'RADAR' : 'IR'];
    bucket[c] = (bucket[c] ?? 0) + 1;
  }
}

const half = TRIALS / 2;
const survived = (tl: Tally): number => Object.entries(tl).reduce((s, [k, v]) => (k === 'hit' || k === 'crashed' ? s : s + v), 0);
const why = (tl: Tally): string =>
  Object.entries(tl)
    .filter(([k]) => k !== 'hit')
    .map(([k, v]) => `${k} ${v}`)
    .join(', ') || '-';
console.log(`${TRIALS} guided launches: ${half} radar-guided (SAM batteries), ${half} heat-seeking (TELs), 15,000-35,000 ft\n`);
for (const p of pilots) {
  const r = res[p];
  const s = survived(r.RADAR) + survived(r.IR);
  const hits = (r.RADAR.hit ?? 0) + (r.IR.hit ?? 0);
  console.log(`${p.padEnd(22)} survived ${String(s).padStart(2)}/${TRIALS} (${Math.round((100 * s) / TRIALS)}%), hit ${hits}`);
  console.log(`${''.padEnd(22)}   radar ${survived(r.RADAR)}/${half}: ${why(r.RADAR)}`);
  console.log(`${''.padEnd(22)}   IR    ${survived(r.IR)}/${half}: ${why(r.IR)}`);
}
const passiveHits = (res.passive.RADAR.hit ?? 0) + (res.passive.IR.hit ?? 0);
const cmSurvived = survived(res.countermeasures.RADAR) + survived(res.countermeasures.IR);
const ok = passiveHits >= TRIALS * 0.85 && cmSurvived > TRIALS * 0.5;
console.log(`\n${ok ? 'PASS' : 'FAIL'}: doing nothing hit ${passiveHits}/${TRIALS} (need >= 85%), countermeasures survived ${cmSurvived}/${TRIALS} (need > 50%)`);
process.exitCode = ok ? 0 : 1;
