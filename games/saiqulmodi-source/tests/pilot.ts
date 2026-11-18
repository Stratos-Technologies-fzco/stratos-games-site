// Headless test: pilot G effects over time (flight/PilotG.ts) and the AoA limiter switch (JetPhysics.limiterOff):
// stall, wing drop, spin and recovery. Run: npm run test:pilot
import { FT, STEP } from '../src/config';
import { JetPhysics } from '../src/flight/JetPhysics';
import { newPilotG, stepPilotG } from '../src/flight/PilotG';

let fails = 0;
const check = (ok: boolean, msg: string): void => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`);
  if (!ok) fails++;
};

// --- pilot G ---
{
  const s = newPilotG();
  let t = 0;
  let grey = -1;
  let gloc = -1;
  for (; t < 20; t += STEP) {
    const v = stepPilotG(s, 9, STEP);
    if (grey < 0 && v.grey > 0.5) grey = t;
    if (v.gloc) {
      gloc = t;
      break;
    }
  }
  check(grey > 0.5 && grey < 4, `9 G: greys out after ${grey.toFixed(1)} s (not at once)`);
  check(gloc > 3 && gloc < 12, `9 G held: G-LOC after ${gloc.toFixed(1)} s`);
  let back = -1;
  for (let u = 0; u < 20; u += STEP) {
    const v = stepPilotG(s, 1, STEP);
    if (!v.controlsLost) {
      back = u;
      break;
    }
  }
  check(back > 5 && back < 10, `controls back ${back.toFixed(1)} s after G-LOC (6 s out + coming round)`);
}
{
  const s = newPilotG();
  let worst = 0;
  let lost = false;
  for (let t = 0; t < 30; t += STEP) {
    const v = stepPilotG(s, 7.5, STEP);
    worst = Math.max(worst, v.black);
    lost = lost || v.controlsLost;
  }
  check(!lost && worst < 0.5, `7.5 G (the manoeuvres' limit) for 30 s: no G-LOC (black ${worst.toFixed(2)})`);
}
{
  const s = newPilotG();
  let red = 0;
  for (let t = 0; t < 5; t += STEP) red = stepPilotG(s, -3, STEP).red;
  check(red > 0.5, `-3 G: red-out ${red.toFixed(2)}`);
}

// --- AoA limiter ---
const inp = { pitch: 0, roll: 0, yaw: 0, throttle: 0, afterburner: false };
function jetAt(altFt: number, mps: number): JetPhysics {
  const j = new JetPhysics();
  j.reset(0, 0, Math.PI / 2);
  j.pos.y = altFt * FT;
  j.vel.setLength(mps);
  return j;
}
{
  const j = jetAt(15000, 200);
  let stalled = false;
  for (let t = 0; t < 6; t += STEP) {
    Object.assign(inp, { pitch: 1, roll: 0, yaw: 0 });
    j.step(STEP, inp as never);
    stalled = stalled || j.stalled;
  }
  check(!stalled, 'limiter ON: full back stick for 6 s, no stall');
}
{
  const j = jetAt(15000, 110);
  j.limiterOff = true;
  let stalledAt = -1;
  let maxSpin = 0;
  for (let t = 0; t < 12; t += STEP) {
    Object.assign(inp, { pitch: 1, roll: 0, yaw: 0 });
    j.step(STEP, inp as never);
    if (j.stalled && stalledAt < 0) stalledAt = t;
    maxSpin = Math.max(maxSpin, Math.abs(j.spin));
  }
  check(stalledAt >= 0, `limiter OFF: full back stick stalls the wing (after ${stalledAt.toFixed(1)} s)`);
  check(maxSpin > 1, `held stall autorotates into a spin (${maxSpin.toFixed(2)} rad/s)`);
  const dir = Math.sign(j.spin);
  for (let t = 0; t < 8; t += STEP) {
    Object.assign(inp, { pitch: -0.6, roll: 0, yaw: -dir });
    j.step(STEP, inp as never);
  }
  check(!j.stalled && Math.abs(j.spin) < 0.05, `stick forward + opposite rudder recovers (spin ${j.spin.toFixed(3)}, stalled ${j.stalled})`);
  j.reset(0, 0, 0);
  check(!j.limiterOff, 'a new start puts the limiter back on');
}

console.log(fails ? `${fails} FAILED` : 'ALL PASS');
process.exit(fails ? 1 : 0);
