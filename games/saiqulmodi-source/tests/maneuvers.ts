// Headless test: each of the 8 manoeuvres flown by the autopilot from the game's start (35,000 ft, level 1 cruise)
// and from 15,000 ft at 400 kt, on the game's own JetPhysics. Checks: it finishes, exit heading and height, max G
// within the airframe, the score against the ghost path, and the entry refusals.
// Run: npm run test:maneuvers
import { STEP, FT } from '../src/config';
import { JetPhysics } from '../src/flight/JetPhysics';
import { applyThrottle, MANEUVERS, ManeuverPilot, ManeuverScore, predictPath } from '../src/flight/Maneuvers';

let fails = 0;
const check = (ok: boolean, msg: string): void => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`);
  if (!ok) fails++;
};
const wrapDeg = (a: number): number => (((a % 360) + 540) % 360) - 180;
const azDeg = (j: JetPhysics): number => (Math.atan2(-j.vel.x, -j.vel.z) * 180) / Math.PI;

// what each figure should do to the heading (deg change) and height
const EXPECT: Record<number, { dHdg: number; height: 'same' | 'higher' | 'lower' }> = {
  1: { dHdg: 0, height: 'same' },
  2: { dHdg: 180, height: 'higher' },
  3: { dHdg: 180, height: 'lower' },
  4: { dHdg: 180, height: 'same' },
  5: { dHdg: 0, height: 'same' },
  6: { dHdg: 0, height: 'same' },
  7: { dHdg: 0, height: 'same' },
  8: { dHdg: 180, height: 'same' },
};

function startJet(altFt: number, mps: number): JetPhysics {
  const j = new JetPhysics();
  j.reset(0, 0, Math.PI / 2);
  j.pos.y = altFt * FT;
  j.vel.setLength(mps);
  // settle in level flight with a throttle that holds the speed
  for (let i = 0; i < 300; i++) {
    j.throttle = Math.min(1, Math.max(0, j.throttle + (mps - j.speed) * 0.002));
    j.step(STEP, { pitch: (j.pos.y < altFt * FT ? 0.01 : -0.01) - j.vel.y * 0.004, roll: 0, yaw: 0, throttle: 0, afterburner: false } as never);
  }
  return j;
}

for (const [altFt, mps] of [
  [35000, 252],
  [15000, 230],
]) {
  console.log(`--- entry ${altFt} ft, ${Math.round(mps / 0.5144)} kt ---`);
  for (let num = 1; num <= 8; num++) {
    const j = startJet(altFt, mps);
    const env = { aglM: j.pos.y, turnDir: 1 };
    const ghost = predictPath(num, j, env);
    const p = new ManeuverPilot();
    const why = p.start(num, j, env);
    if (why) {
      console.log(`SKIP  ${MANEUVERS[num].name}: ${why} (${Math.round(j.speed / 0.5144)} kt)`);
      continue;
    }
    const sc = new ManeuverScore();
    sc.start(ghost);
    const az0 = azDeg(j);
    const y0 = j.pos.y;
    const v0 = j.speed;
    let maxG = 0;
    let t = 0;
    let res = null;
    while (p.active && t < 200) {
      const u = p.update(j, STEP);
      if (!u) break;
      applyThrottle(j, u);
      j.step(STEP, u as never);
      maxG = Math.max(maxG, j.gLoad);
      res = sc.update(j.pos, j.vel, STEP) ?? res;
      t += STEP;
    }
    res = res ?? sc.finish(j.pos, j.vel);
    const dH = wrapDeg(azDeg(j) - az0);
    const dY = j.pos.y - y0;
    const e = EXPECT[num];
    const hdgOk = Math.abs(Math.abs(dH) - e.dHdg) < 20;
    const htOk = e.height === 'same' ? Math.abs(dY) < 250 : e.height === 'higher' ? dY > 300 : dY < -300;
    const msg = `${MANEUVERS[num].name.padEnd(13)} ${t.toFixed(1)} s  hdg ${dH.toFixed(0)}  height ${dY.toFixed(0)} m  v ${Math.round(v0)}->${Math.round(j.speed)}  maxG ${maxG.toFixed(1)}  score ${res?.score ?? '-'} (${res?.stars ?? 0}*)`;
    check(!p.active && hdgOk && htOk && maxG <= 9.01 && (res?.score ?? 0) >= 65, msg);
  }
}

// refusals
{
  const j = startJet(35000, 150);
  check(new ManeuverPilot().start(1, j, { aglM: j.pos.y, turnDir: 1 }) === 'SPD LOW', 'loop refused when too slow (SPD LOW)');
  const k = startJet(35000, 252);
  check(new ManeuverPilot().start(3, k, { aglM: 900, turnDir: 1 }) === 'ALT LOW', 'split-S refused when too low (ALT LOW)');
}

console.log(fails ? `${fails} FAILED` : 'ALL PASS');
process.exit(fails ? 1 : 0);
