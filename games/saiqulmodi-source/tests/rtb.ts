// Headless test: return to base (overhead break) from several start points, including the game's own start at
// 35,000 ft, on the game's JetPhysics; the landing must be on a runway, gentle, near the centre line, and the jet
// must stop on the runway. Also a take-off from the runway. Run: npm run test:rtb
import { STEP } from '../src/config';
import { JetPhysics } from '../src/flight/JetPhysics';
import { checkTouchdown } from '../src/flight/Landing';
import { ReturnPilot } from '../src/flight/ReturnToBase';
import { airfields, nearestField, onRunway, pickEnd, RWY_LEN, runwaySurface } from '../src/world/Airfields';
import { heightAt } from '../src/world/Terrain';
import { pxToX, pyToZ, START_X_PX, START_Y_PX, FT } from '../src/config';

let fails = 0;
const check = (ok: boolean, msg: string): void => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`);
  if (!ok) fails++;
};
const ground = (x: number, z: number): number => heightAt(x, z);

function fly(name: string, x: number, z: number, altM: number, headingRad: number, mps: number): void {
  const j = new JetPhysics();
  j.reset(x, z, headingRad);
  j.pos.y = Math.max(altM, ground(x, z) + 600);
  j.vel.setLength(mps);
  const { field } = nearestField(x, z);
  const end = pickEnd(field, x, z, j.vel.x, j.vel.z);
  const p = new ReturnPilot();
  p.start(end, j, ground);
  let t = 0;
  let td = null as ReturnType<typeof checkTouchdown>;
  const phases: string[] = [];
  let crashed = '';
  while (t < 1200 && (p.active || j.onGround)) {
    if (phases[phases.length - 1] !== p.phase) phases.push(p.phase);
    const u = p.update(j, STEP);
    j.gearDown = p.gearDown;
    j.brakes = p.brakes;
    if (j.onGround) {
      j.stepGround(STEP, (u ?? { pitch: 0, roll: 0, yaw: 0, throttle: 0, afterburner: false }) as never, runwaySurface(j.pos.x, j.pos.z));
      if (!onRunway(j.pos.x, j.pos.z, 0)) {
        crashed = `ran off the runway at ${((j.pos.x - end.thrX) * end.dirX).toFixed(0)} m, cross ${(j.pos.z - field.z).toFixed(1)}, ${Math.round(j.speed / 0.5144)} kt`;
        break;
      }
      if (!p.active) break;
    } else {
      j.step(STEP, u as never);
      const c = checkTouchdown(j);
      if (c) {
        td = c;
        console.log(`      touchdown ${((j.pos.x - end.thrX) * end.dirX).toFixed(0)} m in, ${Math.round(j.speed / 0.5144)} kt, cross ${(j.pos.z - field.z).toFixed(1)}`);
        if (!c.ok) {
          crashed = c.why;
          break;
        }
        j.touchDown(runwaySurface(j.pos.x, j.pos.z));
      } else if (j.pos.y <= ground(j.pos.x, j.pos.z) + 1.5) {
        crashed = `hit the ground ${((j.pos.x - end.thrX) * end.dirX).toFixed(0)} m from thr, cross ${(j.pos.z - field.z).toFixed(0)}, ${Math.round(j.speed / 0.5144)} kt`;
        break;
      }
    }
    t += STEP;
  }
  const stopAlong = (j.pos.x - end.thrX) * end.dirX;
  const ok = !crashed && !!td?.ok && j.speed < 10 && stopAlong > 0 && stopAlong < RWY_LEN;
  check(
    ok,
    `${name.padEnd(28)} rwy ${field.id}/${end.ident}  ${(t / 60).toFixed(1)} min  ${crashed || `sink ${td?.sink.toFixed(2)} m/s, ${td?.off.toFixed(1)} m off centre, stopped ${stopAlong.toFixed(0)} m in, ${td?.stars}*`}  [${phases.join(' > ')}]`,
  );
}

const f = airfields();
console.log(`airfields: ${f.map((a) => `${a.id} (${(a.x / 1000).toFixed(1)}, ${(a.z / 1000).toFixed(1)}) km, field ${runwaySurface(a.x, a.z).toFixed(0)} m`).join('; ')}`);
fly('game start, 35,000 ft', pxToX(START_X_PX), pyToZ(START_Y_PX), 35000 * FT, Math.PI / 2, 252);
for (const a of f) {
  const y = runwaySurface(a.x, a.z);
  fly(`base ${a.id}: 15 km east, 10,000 ft`, a.x + 15000, a.z + 2000, y + 3000, Math.PI / 2, 230);
  fly(`base ${a.id}: 8 km north, low, west`, a.x - 2000, a.z - 8000, y + 800, -Math.PI / 2, 200);
}

// take-off: full power, pull at speed, airborne before the runway end
{
  const a = f[0];
  const j = new JetPhysics();
  j.reset(a.x - RWY_LEN / 2 + 20, a.z, Math.PI / 2);
  j.vel.set(0, 0, 0);
  j.gearDown = true;
  j.touchDown(runwaySurface(j.pos.x, j.pos.z));
  let t = 0;
  let off = false;
  while (t < 60 && !off) {
    const pull = j.speed > 60 ? 1 : 0;
    off = j.stepGround(STEP, { pitch: pull, roll: 0, yaw: 0, throttle: 0, afterburner: true } as never, runwaySurface(j.pos.x, j.pos.z));
    t += STEP;
  }
  const used = j.pos.x - (a.x - RWY_LEN / 2);
  check(off && used < RWY_LEN, `take-off on afterburner: airborne after ${used.toFixed(0)} m, ${t.toFixed(1)} s, ${Math.round(j.speed / 0.5144)} kt`);
}

console.log(fails ? `${fails} FAILED` : 'ALL PASS');
process.exit(fails ? 1 : 0);
