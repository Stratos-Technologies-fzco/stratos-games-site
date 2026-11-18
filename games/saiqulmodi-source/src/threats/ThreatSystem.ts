// Everything that shoots at the jet, stepped once per 60 Hz frame. Used by the game and by the headless test.
// main.py:2208-2241 (drones cue, launchers engage), 2276-2326 (missiles, fuse), 2091-2095 (low-level spotting).
import { type Scene, Vector3 } from 'three';
import {
  AUTO_SAM_CAP,
  DRONE_CUE_RANGE_M,
  DRONE_SPOT_RANGE_M,
  DRONE_SPOT_RELOAD,
  FT,
  LOW_ALT_SPOT_FT,
  LOW_ALT_SPOT_RANGE_M,
  SAM_FUSE_M,
  SAM_GUIDED_SHARE,
  SAM_LAUNCH_CHANCE,
  SAM_SITE_RELOAD,
  TEL_REVEAL_FRAMES,
} from '../config';
import { Pool } from '../core/Pool';
import { heightAt } from '../world/Height';
import { MAP } from '../world/MapData';
import { Countermeasures } from './Countermeasures';
import { type Drone, makeDrones } from './Drones';
import { type CityPx, type Launcher, LauncherMeshes, placeLaunchers } from './Launchers';
import { Missile, type MissileEnd } from './Missile';

const MISSILE_POOL = 8; // AUTO_SAM_CAP 4 airborne + room for falling / decoyed rounds

export interface JetState {
  pos: Vector3;
  vel: Vector3;
}

export type BlastFn = (x: number, y: number, z: number, radius: number, life: number) => void;

export function makeRand(seed: number): () => number {
  let s = seed | 0;
  return () => {
    // mulberry32
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class ThreatSystem {
  readonly cities: CityPx[];
  readonly launchers: Launcher[];
  readonly drones: Drone[];
  readonly missiles: Pool<Missile>;
  readonly cm: Countermeasures;
  readonly meshes: LauncherMeshes | null;
  rand: () => number;
  frame = 0;

  // ---- what happened this frame (read by the game: HUD, sound, damage) ----
  hitThisFrame = false;
  /** what hit the jet last: seeker, and the launcher that fired it (for the debrief caption) */
  lastHitSeeker = '';
  lastHitLauncher = '';
  launchedThisFrame = 0;
  decoyedThisFrame = 0;
  /** launchers that have the jet inside their ring right now (radar search tone) */
  painting = 0;

  /** set by the game for explosions; the test leaves it null */
  onBlast: BlastFn | null = null;

  constructor(scene: Scene | null, seed = 2026) {
    // world layout from a fixed seed, like main.py's Random(2026) (main.py:343)
    const layoutRand = makeRand(2026);
    this.cities = MAP.cities; // main.py:399-407
    this.launchers = placeLaunchers(layoutRand, this.cities, heightAt);
    this.meshes = scene ? new LauncherMeshes(scene, this.launchers) : null;
    this.drones = makeDrones(scene);
    this.missiles = new Pool<Missile>(MISSILE_POOL, () => {
      const m = new Missile();
      if (scene) scene.add(m.mesh);
      return m;
    });
    this.cm = new Countermeasures(scene);
    this.rand = makeRand(seed);
    this.reset(seed);
  }

  reset(seed: number): void {
    this.rand = makeRand(seed);
    for (const l of this.launchers) l.reset(this.rand);
    for (const d of this.drones) d.reset(this.rand, this.cities);
    for (const m of this.missiles.items) m.hide();
    this.cm.reset();
    this.frame = 0;
  }

  /** Launch from `l` at the jet (main.py:1848-1857). Returns the missile, or null when the pool is full. */
  launch(l: Launcher, jet: JetState, guided: boolean | null = null): Missile | null {
    const m = this.missiles.acquire();
    if (!m) return null;
    l.missiles--;
    l.flash = 24; // main.py:1850
    l.cooldown = SAM_SITE_RELOAD; // main.py:1851
    l.seen = TEL_REVEAL_FRAMES; // main.py:1852, the launch gives a hidden launcher away
    const g = guided === null ? this.rand() < SAM_GUIDED_SHARE : guided; // main.py:1853-1854
    m.launch(l.x, l.y + 12, l.z, jet.pos, jet.vel, g, l.seeker, l.index);
    this.launchedThisFrame++;
    return m;
  }

  private airborne(): number {
    let n = 0;
    const items = this.missiles.items;
    for (let i = 0; i < items.length; i++) if (items[i].active) n++;
    return n;
  }

  /** main.py:1839-1846 the nearest armed launcher within maxDist */
  nearestArmed(x: number, z: number, maxDist: number): Launcher | null {
    let best: Launcher | null = null;
    let bd = maxDist * maxDist;
    for (let i = 0; i < this.launchers.length; i++) {
      const l = this.launchers[i];
      if (!l.armed) continue;
      const d = (l.x - x) * (l.x - x) + (l.z - z) * (l.z - z);
      if (d < bd) {
        bd = d;
        best = l;
      }
    }
    return best;
  }

  /**
   * One frame. `jet` null = the jet is down (nothing aims at it). `engage` false = launchers hold fire (menu).
   */
  step(jet: JetState | null, engage: boolean): void {
    if ((globalThis as unknown as { __fighterHold?: boolean }).__fighterHold) engage = false; // mission.js: first-flight tutorial, no enemies yet
    this.frame++;
    this.hitThisFrame = false;
    this.launchedThisFrame = 0;
    this.painting = 0;
    const rand = this.rand;

    // flying low, you make out camouflaged launchers close below (main.py:2091-2095)
    if (jet && jet.pos.y / FT < LOW_ALT_SPOT_FT) {
      for (let i = 0; i < this.launchers.length; i++) {
        const l = this.launchers[i];
        if (l.camouflaged && l.hp > 0 && Math.hypot(l.x - jet.pos.x, l.z - jet.pos.z) < LOW_ALT_SPOT_RANGE_M) l.seen = Math.max(l.seen, 2);
      }
    }

    // drones patrol; one that sees the jet cues the nearest armed launcher (main.py:2208-2222)
    let airborne = this.airborne();
    for (let i = 0; i < this.drones.length; i++) {
      const d = this.drones[i];
      if (!d.alive) {
        if (d.respawn > 0 && --d.respawn === 0) d.respawnFromBorder(rand); // main.py:2223-2227
        continue;
      }
      d.step(rand, this.cities);
      if (!engage || !jet || d.spotCd > 0) continue;
      if (Math.hypot(jet.pos.x - d.x, jet.pos.z - d.z) >= DRONE_SPOT_RANGE_M || airborne >= AUTO_SAM_CAP) continue;
      const l = this.nearestArmed(jet.pos.x, jet.pos.z, DRONE_CUE_RANGE_M);
      if (l && this.launch(l, jet)) {
        airborne++;
        d.spotCd = DRONE_SPOT_RELOAD;
      }
    }

    // every launcher, seen or hidden, engages the jet inside its ring by itself (main.py:2229-2241)
    for (let i = 0; i < this.launchers.length; i++) {
      const l = this.launchers[i];
      if (l.seen > 0) l.seen--;
      if (l.flash > 0) l.flash--;
      const inRing = !!jet && l.armed && (jet.pos.x - l.x) ** 2 + (jet.pos.z - l.z) ** 2 < l.range * l.range;
      if (inRing && engage) this.painting++;
      if (l.cooldown > 0) {
        l.cooldown--;
        continue;
      }
      if (!engage || !inRing || airborne >= AUTO_SAM_CAP) continue;
      if (rand() < SAM_LAUNCH_CHANCE && jet && this.launch(l, jet)) airborne++;
    }

    // countermeasures (flares fly, cool, and seduce heat seekers)
    this.decoyedThisFrame = jet ? this.cm.step(jet.pos, this.missiles.items, rand) : this.cm.step(_nowhere, this.missiles.items, rand);

    // missiles
    const items = this.missiles.items;
    for (let i = 0; i < items.length; i++) {
      const m = items[i];
      if (!m.active) continue;
      const end: MissileEnd = m.step(jet ? jet.pos : null, jet ? jet.vel : null, heightAt, rand);
      if (end !== 'none') {
        // main.py:2279-2293 blasts: self-destruct 12 px, landed 14 px, decoyed 16 px
        if (this.onBlast) this.onBlast(m.pos.x, m.pos.y, m.pos.z, end === 'ground' ? 40 : end === 'decoy' ? 45 : 35, 1.2);
        m.hide();
        continue;
      }
      // proximity fuse (main.py:2311-2315); a decoyed missile no longer looks at the jet (main.py:2288-2293)
      if (jet && m.decoy === null && m.armed && m.pos.distanceTo(jet.pos) < SAM_FUSE_M) {
        if (this.onBlast) this.onBlast(m.pos.x, m.pos.y, m.pos.z, 70, 1.6);
        this.lastHitSeeker = m.seeker;
        this.lastHitLauncher = this.launchers[m.launcher]?.name ?? '';
        m.hide();
        this.hitThisFrame = true;
      }
    }
  }

  /** draw-side update (radar faces, hidden TELs, drones) */
  syncMeshes(night = false, cam?: Vector3): void {
    if (this.meshes) {
      this.meshes.update(this.frame);
      this.meshes.setNight(night, this.frame);
    }
    for (let i = 0; i < this.drones.length; i++) this.drones[i].syncMesh();
    const items = this.missiles.items;
    for (let i = 0; i < items.length; i++) if (items[i].active) items[i].syncMesh(cam);
  }
}

const _nowhere = new Vector3(0, -1e7, 0);
