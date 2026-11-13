// Custom capsule(cylinder)-vs-box character controller, spatial hash and ray queries. No physics engine.
import colliderData from '../data/colliders.json';
import B from '../balance.json';
import { HALF, type Placement, type Terrain, inRiver } from './world';

export interface Box { x0: number; y0: number; z0: number; x1: number; y1: number; z1: number; id: number; hp?: number }
const HASH = 8;
const key = (cx: number, cz: number) => (cx + 1000) * 4096 + (cz + 1000);
type LocalBoxes = Record<string, number[][]>;

export class Colliders {
  boxes: Box[] = [];
  private cells = new Map<number, number[]>();
  constructor(public terrain: Terrain, placements: Placement[]) {
    const data = colliderData as unknown as LocalBoxes;
    for (const p of placements) for (const b of data[p.model] ?? []) this.add(this.toWorld(p, b));
  }
  private toWorld(p: Placement, b: number[]): Omit<Box, 'id'> {
    const q = Math.round(p.yaw / (Math.PI / 2)) & 3;
    const rot = (x: number, z: number): [number, number] => (q === 0 ? [x, z] : q === 1 ? [z, -x] : q === 2 ? [-x, -z] : [-z, x]);
    const a = rot(b[0], b[2]), c = rot(b[3], b[5]);
    return { x0: p.x + Math.min(a[0], c[0]), x1: p.x + Math.max(a[0], c[0]), z0: p.z + Math.min(a[1], c[1]), z1: p.z + Math.max(a[1], c[1]), y0: p.y + b[1], y1: p.y + b[4] };
  }
  add(b: Omit<Box, 'id'>): Box {
    const box = { ...b, id: this.boxes.length }; this.boxes.push(box);
    for (let cx = Math.floor(b.x0 / HASH); cx <= Math.floor(b.x1 / HASH); cx++) for (let cz = Math.floor(b.z0 / HASH); cz <= Math.floor(b.z1 / HASH); cz++) {
      const k = key(cx, cz); const l = this.cells.get(k); if (l) l.push(box.id); else this.cells.set(k, [box.id]);
    }
    return box;
  }
  /** Remove a dynamic box (barriers) by zeroing it out; ids stay stable. */
  remove(box: Box) { box.x1 = box.x0 - 1; box.y1 = box.y0 - 1; box.z1 = box.z0 - 1; }
  near(x0: number, z0: number, x1: number, z1: number, fn: (b: Box) => void) {
    const seen = new Set<number>();
    for (let cx = Math.floor(x0 / HASH); cx <= Math.floor(x1 / HASH); cx++) for (let cz = Math.floor(z0 / HASH); cz <= Math.floor(z1 / HASH); cz++) {
      const l = this.cells.get(key(cx, cz)); if (!l) continue;
      for (const id of l) if (!seen.has(id)) { seen.add(id); const b = this.boxes[id]; if (b.x1 >= b.x0) fn(b); }
    }
  }
  /** Highest walkable surface at (x,z) that is at or below maxY. Terrain counts. */
  surfaceBelow(x: number, z: number, maxY: number): number | null {
    let found = this.terrain.height(x, z) <= maxY ? this.terrain.height(x, z) : null;
    this.near(x, z, x, z, (b) => { if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1 && b.y1 <= maxY && (found === null || b.y1 > found)) found = b.y1; });
    return found;
  }
  /** Is the point inside any solid box (used to keep loot out of walls)? */
  blocked(x: number, z: number, y: number): boolean {
    let hit = false;
    this.near(x - 0.4, z - 0.4, x + 0.4, z + 0.4, (b) => { if (x > b.x0 - 0.4 && x < b.x1 + 0.4 && z > b.z0 - 0.4 && z < b.z1 + 0.4 && b.y1 > y + 0.3 && b.y0 < y + 1.6) hit = true; });
    return hit;
  }
  /** Nearest hit distance along a ray against boxes and terrain, or Infinity. */
  raycast(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, maxT: number): number {
    let best = maxT;
    const step = HASH * 0.75, seen = new Set<number>();
    for (let t = 0; t <= maxT + step; t += step) {
      const x = ox + dx * Math.min(t, maxT), z = oz + dz * Math.min(t, maxT);
      for (let cx = Math.floor((x - 1) / HASH); cx <= Math.floor((x + 1) / HASH); cx++) for (let cz = Math.floor((z - 1) / HASH); cz <= Math.floor((z + 1) / HASH); cz++) {
        const l = this.cells.get(key(cx, cz)); if (!l) continue;
        for (const id of l) {
          if (seen.has(id)) continue; seen.add(id); const b = this.boxes[id]; if (b.x1 < b.x0) continue;
          const h = rayBox(ox, oy, oz, dx, dy, dz, b); if (h < best) best = h;
        }
      }
    }
    for (let t = 1; t < best; t += 1.5) { const x = ox + dx * t, z = oz + dz * t; if (oy + dy * t < this.terrain.height(x, z)) { best = t; break; } }
    return best;
  }
}

export function rayBox(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, b: { x0: number; y0: number; z0: number; x1: number; y1: number; z1: number }): number {
  let tmin = 0, tmax = Infinity;
  const o = [ox, oy, oz], d = [dx, dy, dz], lo = [b.x0, b.y0, b.z0], hi = [b.x1, b.y1, b.z1];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-9) { if (o[i] < lo[i] || o[i] > hi[i]) return Infinity; continue; }
    let t1 = (lo[i] - o[i]) / d[i], t2 = (hi[i] - o[i]) / d[i]; if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); if (tmin > tmax) return Infinity;
  }
  return tmin;
}

export interface Body { x: number; y: number; z: number; vy: number; onGround: boolean; crouch: boolean }
export interface MoveInput { dx: number; dz: number; speed: number; jump: boolean; crouch: boolean; coyote?: boolean }
const P = B.player;

/** Shared movement step. Cylinder of radius P.radius against boxes; terrain and box tops give ground. */
export function stepBody(c: Colliders, b: Body, inp: MoveInput, dt: number): { landedFall: number } {
  const h = inp.crouch ? P.crouchHeight : P.height; b.crouch = inp.crouch;
  let speed = inp.speed; if (b.onGround && inRiver(b.x, b.z)) speed *= 1 - P.riverSlow * 0 - 0.3;
  let nx = b.x + inp.dx * speed * dt, nz = b.z + inp.dz * speed * dt;
  const lim = HALF + B.match.softWallMeters; nx = Math.max(-lim, Math.min(lim, nx)); nz = Math.max(-lim, Math.min(lim, nz));
  for (let pass = 0; pass < 2; pass++) c.near(nx - P.radius, nz - P.radius, nx + P.radius, nz + P.radius, (bx) => {
    if (bx.y1 <= b.y + P.stepUp || bx.y0 >= b.y + h) return;
    const cx = Math.max(bx.x0, Math.min(nx, bx.x1)), cz = Math.max(bx.z0, Math.min(nz, bx.z1)); const ddx = nx - cx, ddz = nz - cz; const d = Math.hypot(ddx, ddz);
    if (d >= P.radius) return;
    if (d > 1e-5) { nx = cx + (ddx / d) * P.radius; nz = cz + (ddz / d) * P.radius; }
    else { const px = Math.min(nx - bx.x0, bx.x1 - nx), pz = Math.min(nz - bx.z0, bx.z1 - nz); if (px < pz) nx += (nx - bx.x0 < bx.x1 - nx ? -px : px) + Math.sign(nx - (bx.x0 + bx.x1) / 2) * P.radius; else nz += (nz - bx.z0 < bx.z1 - nz ? -pz : pz) + Math.sign(nz - (bx.z0 + bx.z1) / 2) * P.radius; }
  });
  b.x = nx; b.z = nz;
  if (inp.jump && (b.onGround || inp.coyote)) { b.vy = Math.sqrt(2 * P.gravity * P.jumpHeight); b.onGround = false; }
  const prevVy = b.vy; b.vy -= P.gravity * dt;
  let ny = b.y + b.vy * dt;
  const gh = c.surfaceBelow(b.x, b.z, b.y + P.stepUp + Math.max(0, b.vy) * dt + 0.05) ?? c.terrain.height(b.x, b.z);
  let landedFall = 0;
  if (ny <= gh || (b.onGround && b.vy <= 0 && ny - gh < 0.35)) { if (!b.onGround && prevVy < -1) landedFall = -prevVy; ny = gh; b.vy = 0; b.onGround = true; } else b.onGround = false;
  b.y = ny; return { landedFall };
}
