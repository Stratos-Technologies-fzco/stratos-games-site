// Bots: a small state machine plus A* over a 5 m grid. They send the same commands a player does.
import B from '../balance.json';
import type { Colliders } from '../core/collision';
import { CELL, GRID, HALF, POIS, coastDist, type Terrain, type Tier } from '../core/world';
import type { Actor, GroundItem } from './types';
import type { ZoneState } from '../core/rules';
import { BOT_NAMES } from './names';

export type BotState = 'drop' | 'loot' | 'rotate' | 'engage' | 'heal' | 'flee';
export interface Cmd { dx: number; dz: number; sprint: boolean; crouch: boolean; jump: boolean; yaw: number; pitch: number; fire: boolean; reload: boolean; heal: boolean; barrier: boolean; slot: number; interact: GroundItem | null; leavePlane: boolean }

export interface BotEnv {
  time: number; actors: Actor[]; colliders: Colliders; terrain: Terrain; zone: ZoneState | null; items: GroundItem[]; rand: () => number;
  seeThrough: (from: Actor, to: Actor) => boolean;
}

/** Walkable grid built once from collider data. */
export class NavGrid {
  blocked = new Uint8Array((GRID - 1) * (GRID - 1)); n = GRID - 1;
  constructor(colliders: Colliders, terrain: Terrain) {
    for (let iz = 0; iz < this.n; iz++) for (let ix = 0; ix < this.n; ix++) {
      const x = (ix + 0.5) * CELL - HALF, z = (iz + 0.5) * CELL - HALF, h = terrain.height(x, z);
      if (coastDist(x, z) < 1.5 || terrain.slope(x, z) > 1.1) { this.blocked[iz * this.n + ix] = 1; continue; }
      let cover = 0; const x0 = x - CELL / 2, x1 = x + CELL / 2, z0 = z - CELL / 2, z1 = z + CELL / 2;
      colliders.near(x0, z0, x1, z1, (b) => { if (b.y1 < h + 0.6 || b.y0 > h + 1.8) return; const w = Math.min(x1, b.x1) - Math.max(x0, b.x0), d = Math.min(z1, b.z1) - Math.max(z0, b.z0); if (w > 0 && d > 0) cover += w * d; });
      if (cover > CELL * CELL * 0.55) this.blocked[iz * this.n + ix] = 1;
    }
  }
  cell(x: number, z: number): [number, number] { return [Math.max(0, Math.min(this.n - 1, Math.floor((x + HALF) / CELL))), Math.max(0, Math.min(this.n - 1, Math.floor((z + HALF) / CELL)))]; }
  /** A* with an expansion cap. Returns world waypoints (cell centres), or null. */
  path(sx: number, sz: number, gx: number, gz: number): [number, number][] | null {
    const n = this.n; const [sxi, szi] = this.cell(sx, sz); let [gxi, gzi] = this.cell(gx, gz);
    if (this.blocked[gzi * n + gxi]) { // nearest free neighbour of the goal
      let found = false; for (let r = 1; r < 4 && !found; r++) for (let dz = -r; dz <= r && !found; dz++) for (let dx = -r; dx <= r; dx++) { const a = gxi + dx, b = gzi + dz; if (a >= 0 && b >= 0 && a < n && b < n && !this.blocked[b * n + a]) { gxi = a; gzi = b; found = true; break; } }
    }
    const open: number[] = [szi * n + sxi]; const g = new Map<number, number>([[open[0], 0]]); const f = new Map<number, number>([[open[0], 0]]); const from = new Map<number, number>(); const closed = new Set<number>();
    const goal = gzi * n + gxi; let exp = 0;
    const hfn = (i: number) => { const dx = Math.abs((i % n) - gxi), dz = Math.abs(Math.floor(i / n) - gzi); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
    while (open.length && exp++ < 3500) {
      let bi = 0; for (let i = 1; i < open.length; i++) if ((f.get(open[i]) ?? 1e9) < (f.get(open[bi]) ?? 1e9)) bi = i;
      const cur = open.splice(bi, 1)[0]; if (cur === goal) { const out: [number, number][] = []; let c = cur; while (c !== undefined) { out.push([(c % n + 0.5) * CELL - HALF, (Math.floor(c / n) + 0.5) * CELL - HALF]); c = from.get(c)!; } return out.reverse(); }
      closed.add(cur); const cx = cur % n, cz = Math.floor(cur / n);
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dz) continue; const nx = cx + dx, nz = cz + dz; if (nx < 0 || nz < 0 || nx >= n || nz >= n) continue; const ni = nz * n + nx;
        if (this.blocked[ni] || closed.has(ni)) continue; if (dx && dz && (this.blocked[cz * n + nx] || this.blocked[nz * n + cx])) continue;
        const ng = (g.get(cur) ?? 0) + (dx && dz ? 1.414 : 1); if (ng < (g.get(ni) ?? 1e9)) { g.set(ni, ng); f.set(ni, ng + hfn(ni)); from.set(ni, cur); if (!open.includes(ni)) open.push(ni); }
      }
    }
    return null;
  }
}

const TIER_W: Record<Tier, number> = { low: 3, mid: 2.5, high: 1.5, top: 1 };
export class BotBrain {
  state: BotState = 'drop'; stateT = 0; target: Actor | null = null; seenT = 0; react = 0.5; pathPts: [number, number][] = []; pathAt = -9; goal: [number, number] = [0, 0];
  strafe = 1; strafeT = 0; lootGoal: GroundItem | null = null; dropPoi = 0; jumpAt = 0; landedAt = 0; difficulty: 'easy' | 'normal' | 'hard'; aimT = 0; barrierT = 0; stuckT = 0; lx = 0; lz = 0; name: string;
  constructor(rand: () => number, difficulty: 'easy' | 'normal' | 'hard', public nav: NavGrid) {
    this.difficulty = difficulty; this.name = BOT_NAMES[Math.floor(rand() * BOT_NAMES.length)];
    let tot = 0; const ws = POIS.map((p) => (tot += TIER_W[p.tier])); const r = rand() * tot; this.dropPoi = ws.findIndex((w) => r < w); this.jumpAt = 4 + rand() * 20;
    const [a, b] = B.bots.difficulty[difficulty].react; this.react = a + rand() * (b - a);
  }
  private go(a: Actor, env: BotEnv, gx: number, gz: number, cmd: Cmd, sprint: boolean) {
    const far = Math.hypot(gx - a.body.x, gz - a.body.z);
    if (far > 6 && (env.time - this.pathAt > 0.5 || Math.hypot(this.goal[0] - gx, this.goal[1] - gz) > 12)) { this.pathAt = env.time; this.goal = [gx, gz]; this.pathPts = this.nav.path(a.body.x, a.body.z, gx, gz) ?? []; }
    while (this.pathPts.length > 1 && Math.hypot(this.pathPts[0][0] - a.body.x, this.pathPts[0][1] - a.body.z) < 3) this.pathPts.shift();
    const [tx, tz] = far <= 14 || !this.pathPts.length ? [gx, gz] : this.pathPts[0];
    const dx = tx - a.body.x, dz = tz - a.body.z, l = Math.hypot(dx, dz) || 1; cmd.dx = dx / l; cmd.dz = dz / l; cmd.sprint = sprint;
    // stuck detection: jump and nudge sideways
    if (Math.hypot(a.body.x - this.lx, a.body.z - this.lz) < 0.05 * 0.5) this.stuckT += 0.05; else this.stuckT = 0; this.lx = a.body.x; this.lz = a.body.z;
    if (this.stuckT > 0.6) { cmd.jump = true; const s = Math.sin(env.time * 3) > 0 ? 1 : -1; cmd.dx += -cmd.dz * s * 0.8; cmd.dz += cmd.dx * s * 0.8; if (this.stuckT > 2) { this.pathPts = []; this.pathAt = -9; this.stuckT = 0; } }
  }
  private set(s: BotState) { if (this.state !== s) { this.state = s; this.stateT = 0; this.pathAt = -9; } }

  think(a: Actor, env: BotEnv, dt: number): Cmd {
    const cmd: Cmd = { dx: 0, dz: 0, sprint: false, crouch: false, jump: false, yaw: a.yaw, pitch: 0, fire: false, reload: false, heal: false, barrier: false, slot: -1, interact: null, leavePlane: false };
    this.stateT += dt; const d = B.bots.difficulty[this.difficulty];
    if (a.mode === 'plane') { cmd.leavePlane = env.time >= this.jumpAt; return cmd; }
    if (a.mode === 'skydive' || a.mode === 'glide') {
      const P = POIS[this.dropPoi], dx = P.x - a.body.x, dz = P.z - a.body.z, l = Math.hypot(dx, dz) || 1; cmd.dx = dx / l; cmd.dz = dz / l; cmd.yaw = Math.atan2(dx, dz); return cmd;
    }
    if (this.state === 'drop') { this.set('loot'); this.landedAt = env.time; }

    // ---- perception ----
    let best: Actor | null = null, bd = B.bots.sightRange;
    for (const o of env.actors) {
      if (o === a || !o.alive || o.mode !== 'ground') continue; const dist = Math.hypot(o.body.x - a.body.x, o.body.z - a.body.z); if (dist > bd) continue;
      if (o.hidden && dist > B.player.bushHideRange) continue; if (!env.seeThrough(a, o)) continue; best = o; bd = dist;
    }
    if (best) { if (this.target === best) this.seenT += dt; else { this.target = best; this.seenT = 0; this.aimT = 0; } } else { this.seenT = 0; if (this.target && !this.target.alive) this.target = null; this.aimT = Math.max(0, this.aimT - dt); if (!best && this.state === 'engage' && this.stateT > 1.5) this.set('loot'); }
    const lowHp = a.hp < B.bots.healBelow, canHeal = a.inv.count('medkit') > 0 || a.inv.count('bandage') > 0;
    const z = env.zone; const outside = z ? Math.hypot(a.body.x - z.cx, a.body.z - z.cz) > z.radius - 4 : false;
    const outNext = z ? Math.hypot(a.body.x - z.nextCx, a.body.z - z.nextCz) > z.nextRadius * 0.9 : false;

    const armed = !!(a.inv.main[0] || a.inv.main[1] || a.inv.pistol) && (a.inv.count('light') + a.inv.count('heavy') + a.inv.count('shells') > 0 || a.inv.main.some((g) => g && g.mag > 0));
    if (outside && this.state !== 'flee') this.set('flee');
    else if (this.state === 'flee' && !outside) this.set('rotate');
    if (this.state !== 'flee') {
      if (best && this.seenT > this.react && armed) this.set('engage');
      else if (lowHp && canHeal && !best) this.set('heal');
      else if (this.state === 'heal' && !lowHp) this.set('loot');
      else if ((this.state === 'loot' && outNext && z && z.stage !== 'done' && (armed || env.time - this.landedAt > 45)) || (this.state === 'rotate' && !outNext && this.stateT > 6)) this.set(outNext ? 'rotate' : 'loot');
    }

    switch (this.state) {
      case 'flee': case 'rotate': {
        const jx = Math.sin(a.id * 7.1) * (z ? z.nextRadius * 0.4 : 0), jz = Math.cos(a.id * 3.3) * (z ? z.nextRadius * 0.4 : 0);
        this.go(a, env, (z?.nextCx ?? 0) + jx, (z?.nextCz ?? 0) + jz, cmd, true); cmd.yaw = Math.atan2(cmd.dx, cmd.dz); break;
      }
      case 'heal': {
        cmd.heal = true; cmd.crouch = true; cmd.dx = cmd.dz = 0; break;
      }
      case 'engage': {
        const t = this.target; if (!t || !t.alive) { this.set('loot'); break; }
        const dx = t.body.x - a.body.x, dz = t.body.z - a.body.z, dist = Math.hypot(dx, dz) || 1;
        this.aimT += dt; const err = d.aimErr * (1 + 3 * Math.max(0, 1 - this.aimT / d.aimTime));
        const ty = t.body.y + 1.3 - (a.body.y + 1.6);
        cmd.yaw = Math.atan2(dx, dz) + (Math.random() - 0.5) * err * 2; cmd.pitch = Math.atan2(ty, dist) + (Math.random() - 0.5) * err * 2;
        this.strafeT -= dt; if (this.strafeT < 0) { this.strafe = Math.random() < 0.5 ? -1 : 1; this.strafeT = 0.8 + Math.random() * 1.4; cmd.crouch = Math.random() < 0.3; }
        const gun = a.inv.main[Math.max(0, a.slot)] ?? a.inv.main[0] ?? a.inv.main[1] ?? a.inv.pistol; const want = gun ? B.weapons[gun.id].range : 2;
        const wantDist = Math.min(want * 0.7, 45);
        if (dist > wantDist + 6) { cmd.dx = dx / dist; cmd.dz = dz / dist; cmd.sprint = false; } else if (dist < wantDist * 0.4) { cmd.dx = -dx / dist; cmd.dz = -dz / dist; }
        cmd.dx += (-dz / dist) * this.strafe * 0.8; cmd.dz += (dx / dist) * this.strafe * 0.8;
        cmd.fire = dist < Math.min(want * 1.05, 110) && this.aimT > 0.35 && Math.sin(env.time * 4 + a.id) > -0.35; if (a.inv.main[0] || a.inv.main[1]) cmd.slot = a.inv.main[0] ? 0 : 1; else if (a.inv.pistol) cmd.slot = 2; else cmd.slot = 3;
        if (gun && gun.mag === 0) cmd.reload = true;
        this.barrierT -= dt; if (a.hp < 60 && a.inv.barriers > 0 && this.barrierT < 0 && dist > 8) { cmd.barrier = true; this.barrierT = 20; }
        break;
      }
      default: { // loot
        if (!this.lootGoal || this.lootGoal.taken || Math.hypot(this.lootGoal.x - a.body.x, this.lootGoal.z - a.body.z) > 150) this.lootGoal = this.chooseLoot(a, env);
        const g = this.lootGoal;
        if (g) {
          this.go(a, env, g.x, g.z, cmd, true); cmd.yaw = Math.atan2(cmd.dx, cmd.dz);
          if (Math.hypot(g.x - a.body.x, g.z - a.body.z) < 2.1 && Math.abs(g.y - a.body.y) < 2.5) { cmd.interact = g; this.lootGoal = null; }
        } else { const P = POIS[this.dropPoi]; this.go(a, env, P.x, P.z, cmd, false); cmd.yaw = Math.atan2(cmd.dx, cmd.dz); }
      }
    }
    if (!cmd.fire && this.state !== 'engage') cmd.pitch = 0;
    return cmd;
  }
  private chooseLoot(a: Actor, env: BotEnv): GroundItem | null {
    const armed = !!(a.inv.main[0] || a.inv.main[1]); let best: GroundItem | null = null, bs = -1e9;
    for (const it of env.items) {
      if (it.taken) continue; const dist = Math.hypot(it.x - a.body.x, it.z - a.body.z); if (dist > 110) continue; const k = it.items[0].kind;
      let w = k === 'weapon' ? (armed ? 3 : 12) : k === 'ammo' ? (armed ? 6 : 2) : k === 'heal' ? 5 : k === 'vest' || k === 'helmet' ? 6 : 3; w += it.rarity * 2 + (it.crate ? 8 : 0);
      const s = w * 20 - dist; if (s > bs) { bs = s; best = it; }
    }
    return best;
  }
}
