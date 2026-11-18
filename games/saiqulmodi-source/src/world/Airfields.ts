// The 3 airbase runways as landing targets (the same strips world/Runways.ts draws: east-west, 1,040 x 48 m,
// laid on the drawn terrain). Runway 09 lands towards the east (+x), 27 towards the west.
import { PX_M, pxToX, pyToZ } from '../config';
import { MAP } from './MapData';
import { surfaceY } from './Terrain';

export const RWY_LEN = 260 * PX_M; // 1,040 m (Runways.ts)
export const RWY_WID = 12 * PX_M; // 48 m
const LIFT = 0.35; // Runways.ts: the strip sits this far above the ground triangles

export interface Airfield {
  /** centre */
  x: number;
  z: number;
  /** base number 1..3 */
  id: number;
}

/** one landing direction of a runway */
export interface RunwayEnd {
  field: Airfield;
  /** '09' (landing east) or '27' (landing west) */
  ident: string;
  /** threshold (start of the usable runway) */
  thrX: number;
  thrZ: number;
  /** landing direction (unit, horizontal) */
  dirX: number;
  dirZ: number;
  /** runway surface height at the threshold */
  y: number;
  lengthM: number;
}

let fields: Airfield[] | null = null;
export function airfields(): Airfield[] {
  if (!fields) {
    fields = [];
    for (let a = 0; a < MAP.airbases.length; a += 2) fields.push({ x: pxToX(MAP.airbases[a]), z: pyToZ(MAP.airbases[a + 1]), id: a / 2 + 1 });
  }
  return fields;
}

/** runway surface height (what the wheels roll on) */
export const runwaySurface = (x: number, z: number): number => surfaceY(x, z) + LIFT;

export function nearestField(x: number, z: number): { field: Airfield; dist: number } {
  let best = airfields()[0];
  let bd = Infinity;
  for (const f of airfields()) {
    const d = Math.hypot(f.x - x, f.z - z);
    if (d < bd) {
      bd = d;
      best = f;
    }
  }
  return { field: best, dist: bd };
}

/** the runway (and how far off its centre line) under a point, or null */
export function onRunway(x: number, z: number, margin = 6): Airfield | null {
  for (const f of airfields()) if (Math.abs(x - f.x) <= RWY_LEN / 2 + margin && Math.abs(z - f.z) <= RWY_WID / 2 + margin) return f;
  return null;
}

/** the landing direction to use from a jet at (x, z) heading (vx, vz): the end it can reach with the shorter turn */
export function pickEnd(f: Airfield, x: number, z: number, vx: number, _vz: number): RunwayEnd {
  // landing east (09) means approaching from the west; prefer the end in front of the jet's approach
  const fromWest = x < f.x;
  const headingEast = vx > 0;
  // far away: land the way the jet is already going if it is roughly lined up, else from the side it is on
  const east = Math.abs(x - f.x) > 6000 ? fromWest : fromWest || (headingEast && Math.abs(z - f.z) < 3000);
  return endOf(f, east);
}

export function endOf(f: Airfield, east: boolean): RunwayEnd {
  const dirX = east ? 1 : -1;
  const thrX = f.x - (dirX * RWY_LEN) / 2;
  return { field: f, ident: east ? '09' : '27', thrX, thrZ: f.z, dirX, dirZ: 0, y: runwaySurface(thrX, f.z), lengthM: RWY_LEN };
}
