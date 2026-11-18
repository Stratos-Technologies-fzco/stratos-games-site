// The jet's weapons, from main.py:
//  - bomb (main.py:1300-1334): leaves with 0.9 x the jet's speed, loses 0.3% of its forward speed a frame,
//    falls 30 ft/frame growing by 2.2 ft/frame up to 260 ft/frame; its impact point is known at release and
//    marked; blast radius 45 px.
//  - AGM (main.py:1139-1192, 1859-1875): the nearest visible launcher within 1600 px; 3x the level speed,
//    turns 0.03 rad/frame, hits within 10 px: ground hit of radius 20 px, 1 damage.
//  - AAM: the nearest drone within 1200 px; 4x the level speed, turns 0.05 rad/frame; one hit downs it.
//  - ground hits (main.py:1877-1888): launchers within the radius (+14 px battery, +8 px TEL) lose 1 HP;
//    at 0 they are destroyed, lose their missiles and burn. Every hit leaves a fire.
// Missiles share one rail reload of 45 frames (main.py:83).
import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, Quaternion, type Scene, SphereGeometry, Vector3 } from 'three';
import {
  AAM_RANGE_M,
  AAM_SPEED_VS_JET,
  AAM_TURN_PER_FRAME,
  AGM_BLAST_M,
  AGM_RANGE_M,
  AGM_SPEED_VS_JET,
  AGM_TURN_PER_FRAME,
  BOMB_BLAST_M,
  edgeChance,
  PLAYER_EDGE,
  DRONE_RESPAWN_FRAMES,
  FIRE_LIFE_DESTROYED,
  FIRE_LIFE_HIT,
  FT,
  GROUND_HIT_PAD_SAM_M,
  GROUND_HIT_PAD_TEL_M,
  JET_CRUISE_MPS,
  LEVEL_MULT,
  JET_MISSILE_HIT_M,
  JET_MISSILE_LIFE,
  JET_MISSILE_RELOAD,
  STEP,
} from '../config';
import { targetDestroyed } from '../core/Analytics';
import { Pool, type Poolable } from '../core/Pool';
import type { Drone } from '../threats/Drones';
import type { Launcher } from '../threats/Launchers';
import type { Missile } from '../threats/Missile';
import type { ThreatSystem } from '../threats/ThreatSystem';
import { heightAt } from '../world/Height';

type Kind = 'BOMB' | 'AGM' | 'AAM';
/** new: a missile is small and fast; an AAM that reaches it destroys it half the time */
const INTERCEPT_CHANCE = (): number => edgeChance(0.5); // +15% player edge (equal for two players)
/** new: air-to-air missiles carried per jet (a new jet comes back full) */
export const AAM_LOAD = (): number => Math.round(4 * PLAYER_EDGE); // 5 with the +15% player edge, 4 for two players

export interface WeaponHooks {
  say(text: string): void;
  blast(x: number, y: number, z: number, radius: number, life: number): void;
  sound(name: 'shoot' | 'missile' | 'explode', at: Vector3 | null): void;
  smoke(x: number, y: number, z: number, life: number, s0: number, s1: number, grey: number): void;
}

const _to = new Vector3();
const _axis = new Vector3();
const _up = new Vector3(0, 1, 0);
const _q = new Quaternion();
const _cam = new Vector3();

const bombGeo = new CylinderGeometry(0.35, 0.35, 3, 8);
const bombMat = new MeshLambertMaterial({ color: 0x4a4a3c });
const agmMat = new MeshLambertMaterial({ color: 0xfadcaa }); // main.py:1187 AGM body
const aamMat = new MeshLambertMaterial({ color: 0xbeebff }); // main.py:1187 AAM body
const bodyGeo = new CylinderGeometry(0.2, 0.2, 3.6, 8);
const flameMat = new MeshBasicMaterial({ color: 0xffaa3c });
flameMat.color.multiplyScalar(4);
const flameGeo = new SphereGeometry(0.5, 8, 6);

class Ordnance implements Poolable {
  active = false;
  kind: Kind = 'BOMB';
  readonly pos = new Vector3();
  readonly vel = new Vector3();
  readonly dir = new Vector3();
  readonly impact = new Vector3(); // bombs: where it will land
  speed = 0;
  age = 0;
  fall = 0; // bombs: ft/frame
  launcher: Launcher | null = null;
  drone: Drone | null = null;
  /** AAM at an incoming SAM (one hit destroys a missile) */
  sam: Missile | null = null;
  readonly mesh = new Group();
  private bomb: Mesh;
  private body: Mesh;
  private flame: Mesh;

  constructor() {
    this.bomb = new Mesh(bombGeo, bombMat);
    this.body = new Mesh(bodyGeo, agmMat);
    this.flame = new Mesh(flameGeo, flameMat);
    this.flame.position.y = -2;
    this.flame.scale.set(1, 2, 1);
    this.mesh.add(this.bomb, this.body, this.flame);
    this.mesh.visible = false;
  }

  setKind(k: Kind): void {
    this.kind = k;
    this.bomb.visible = k === 'BOMB';
    this.body.visible = k !== 'BOMB';
    this.flame.visible = k !== 'BOMB';
    this.body.material = k === 'AGM' ? agmMat : aamMat;
  }

  sync(cam: Vector3): void {
    this.mesh.position.copy(this.pos);
    _q.setFromUnitVectors(_up, this.dir.lengthSq() > 0 ? this.dir : _up);
    this.mesh.quaternion.copy(_q);
    this.mesh.scale.setScalar(Math.min(40, Math.max(1.5, _cam.copy(cam).distanceTo(this.pos) / 250)));
  }
}

interface Fire extends Poolable {
  x: number;
  y: number;
  z: number;
  age: number;
  life: number;
  size: number;
}

export class Weapons {
  readonly items: Pool<Ordnance>;
  private fires: Pool<Fire>;
  missileCd = 0;
  aamLeft = AAM_LOAD();
  private frame = 0;

  constructor(
    scene: Scene | null,
    private threats: ThreatSystem,
    private hooks: WeaponHooks,
  ) {
    this.items = new Pool<Ordnance>(16, () => {
      const o = new Ordnance();
      if (scene) scene.add(o.mesh);
      return o;
    });
    this.fires = new Pool<Fire>(60, () => ({ active: false, x: 0, y: 0, z: 0, age: 0, life: 1, size: 1 }));
  }

  reset(): void {
    for (const o of this.items.items) {
      o.active = false;
      o.mesh.visible = false;
    }
    this.fires.releaseAll();
    this.missileCd = 0;
    this.aamLeft = AAM_LOAD();
  }

  /** a new jet: full load */
  rearm(): void {
    this.missileCd = 0;
    this.aamLeft = AAM_LOAD();
  }

  /** The launcher an AGM would go for now (main.py:1861-1872), or null. */
  agmTarget(jet: Vector3): Launcher | null {
    let best: Launcher | null = null;
    let bd = AGM_RANGE_M();
    for (const l of this.threats.launchers) {
      if (l.hp <= 0 || !l.visible) continue; // main.py:1861 only what you can see
      const d = Math.hypot(l.x - jet.x, l.z - jet.z);
      if (d < bd) {
        bd = d;
        best = l;
      }
    }
    return best;
  }

  /** The drone an AAM would go for now (main.py:1865-1872), or null. */
  aamTarget(jet: Vector3): Drone | null {
    let best: Drone | null = null;
    let bd = AAM_RANGE_M();
    for (const d of this.threats.drones) {
      if (!d.alive) continue;
      const dist = Math.hypot(d.x - jet.x, d.z - jet.z);
      if (dist < bd) {
        bd = dist;
        best = d;
      }
    }
    return best;
  }

  /** The incoming missile an AAM would go for: the nearest one heading at the jet within AAM range. */
  samTarget(jet: Vector3): Missile | null {
    let best: Missile | null = null;
    let bd = AAM_RANGE_M();
    const items = this.threats.missiles.items;
    for (let i = 0; i < items.length; i++) {
      const m = items[i];
      if (!m.active || m.decoy !== null || !m.armed) continue;
      const d = m.pos.distanceTo(jet);
      // coming our way: its course points at us
      _to.copy(jet).sub(m.pos).divideScalar(Math.max(1, d));
      if (d < bd && m.dir.dot(_to) > 0.5) {
        bd = d;
        best = m;
      }
    }
    return best;
  }

  /** SPACE in main.py (B here): drop a bomb (main.py:1939-1941). */
  dropBomb(jetPos: Vector3, jetVel: Vector3): void {
    const o = this.items.acquireOrRecycle();
    o.setKind('BOMB');
    o.pos.copy(jetPos).y -= 3;
    o.vel.set(jetVel.x * 0.9, 0, jetVel.z * 0.9); // main.py:1303-1304 speed_factor * 0.9 along the heading
    o.fall = 30; // main.py:1306 ft/frame
    o.age = 0;
    o.dir.set(0, -1, 0);
    // main.py:1308-1314: where it will land, the same physics run ahead
    let x = o.pos.x, y = o.pos.y, z = o.pos.z, vx = o.vel.x, vz = o.vel.z, fall = o.fall;
    for (let k = 0; k < 4000 && y > heightAt(x, z); k++) {
      x += vx * STEP;
      z += vz * STEP;
      vx *= 0.997;
      vz *= 0.997;
      fall = Math.min(260, fall + 2.2);
      y -= fall * FT;
    }
    o.impact.set(x, heightAt(x, z), z);
    o.mesh.visible = true;
    this.hooks.sound('shoot', null); // main.py:1941
  }

  /** R / F in main.py (G / Z here): fire an AGM or AAM (main.py:1942-1949). */
  fireMissile(kind: 'AGM' | 'AAM', jetPos: Vector3, jetVel: Vector3): void {
    if (this.missileCd > 0) {
      this.hooks.say('MISSILE RAIL RELOADING'); // main.py:1945
      return;
    }
    if (kind === 'AAM' && this.aamLeft <= 0) {
      this.hooks.say('NO AAM LEFT');
      return;
    }
    const l = kind === 'AGM' ? this.agmTarget(jetPos) : null;
    const s = kind === 'AAM' ? this.samTarget(jetPos) : null; // a missile coming at us comes first
    const d = kind === 'AAM' && !s ? this.aamTarget(jetPos) : null;
    if (!l && !d && !s) {
      this.hooks.say(kind === 'AGM' ? 'NO BATTERY IN AGM RANGE' : 'NO DRONE IN AAM RANGE'); // main.py:1947
      return;
    }
    const o = this.items.acquireOrRecycle();
    o.setKind(kind);
    o.launcher = l;
    o.drone = d;
    o.sam = s;
    o.pos.copy(jetPos).y -= 2;
    o.dir.copy(jetVel).normalize();
    o.speed = JET_CRUISE_MPS * LEVEL_MULT * (kind === 'AGM' ? AGM_SPEED_VS_JET : AAM_SPEED_VS_JET); // main.py:1873 speed_factor x 3 / x 4
    o.age = 0;
    o.mesh.visible = true;
    this.missileCd = JET_MISSILE_RELOAD();
    if (kind === 'AAM') this.aamLeft--;
    this.hooks.sound('missile', null); // main.py:1949
  }

  /** One 60 Hz frame. */
  step(): void {
    this.frame++;
    if (this.missileCd > 0) this.missileCd--;
    const items = this.items.items;
    for (let i = 0; i < items.length; i++) {
      const o = items[i];
      if (!o.active) continue;
      o.age++;
      if (o.kind === 'BOMB') {
        // main.py:1316-1322
        o.pos.x += o.vel.x * STEP;
        o.pos.z += o.vel.z * STEP;
        o.vel.x *= 0.997;
        o.vel.z *= 0.997;
        o.fall = Math.min(260, o.fall + 2.2);
        o.pos.y -= o.fall * FT;
        o.dir.set(o.vel.x * STEP, -o.fall * FT, o.vel.z * STEP).normalize();
        if (this.frame % 2 === 0) this.hooks.smoke(o.pos.x, o.pos.y, o.pos.z, 1.5, 2, 5, 0.9);
        const g = heightAt(o.pos.x, o.pos.z);
        if (o.pos.y <= g) {
          o.pos.y = g;
          this.explode(o);
          this.groundHit(o.pos, BOMB_BLAST_M, 1, 'BOMB'); // main.py:2246-2250
        }
        continue;
      }
      // AGM / AAM: turn toward the target (main.py:1168-1181), the motor lights after the drop
      const sam = o.sam && o.sam.active ? o.sam : null;
      const tx = sam ? sam.pos.x : o.launcher ? o.launcher.x : o.drone ? o.drone.x : o.pos.x;
      const ty = sam ? sam.pos.y : o.launcher ? o.launcher.y + 4 : o.drone ? o.drone.y : o.pos.y;
      const tz = sam ? sam.pos.z : o.launcher ? o.launcher.z : o.drone ? o.drone.z : o.pos.z;
      const alive = sam ? true : o.launcher ? o.launcher.hp > 0 : o.drone ? o.drone.alive : false;
      _to.set(tx - o.pos.x, ty - o.pos.y, tz - o.pos.z);
      const dist = _to.length();
      _to.divideScalar(Math.max(1e-3, dist));
      const turn = o.kind === 'AGM' ? AGM_TURN_PER_FRAME : AAM_TURN_PER_FRAME;
      const ang = Math.acos(Math.min(1, Math.max(-1, o.dir.dot(_to))));
      if (ang <= turn) o.dir.copy(_to);
      else {
        _axis.crossVectors(o.dir, _to);
        if (_axis.lengthSq() < 1e-10) _axis.set(1, 0, 0);
        o.dir.applyAxisAngle(_axis.normalize(), turn);
      }
      const boost = Math.min(1, 0.4 + o.age / 90); // main.py:1171
      o.pos.addScaledVector(o.dir, o.speed * boost * STEP);
      const hitGround = o.pos.y <= heightAt(o.pos.x, o.pos.z);
      if (dist < JET_MISSILE_HIT_M) {
        // main.py:2260-2272
        this.explode(o);
        if (sam) {
          // one hit destroys a missile; not every interception is a hit
          if (this.threats.rand() < INTERCEPT_CHANCE()) {
            this.hooks.blast(sam.pos.x, sam.pos.y, sam.pos.z, 45, 1.2);
            sam.hide();
            this.hooks.say('MISSILE SHOT DOWN');
          } else this.hooks.say('AAM MISSED - FIRE AGAIN');
        } else if (o.kind === 'AGM') this.groundHit(o.pos, AGM_BLAST_M, 1, 'AGM');
        else if (o.drone && o.drone.alive) {
          o.drone.alive = false;
          o.drone.mesh.visible = false;
          o.drone.respawn = DRONE_RESPAWN_FRAMES; // main.py:2271
          this.hooks.say('DRONE SPLASHED'); // main.py:2272
        }
      } else if (o.age > JET_MISSILE_LIFE || hitGround || (!alive && dist < JET_MISSILE_HIT_M * 3)) {
        // main.py:2256-2259 spent or lost its target: a small blast, no damage
        this.hooks.blast(o.pos.x, o.pos.y, o.pos.z, 30, 0.8);
        o.active = false;
        o.mesh.visible = false;
      }
    }

    // fires: burning targets send up dark smoke (main.py:1565-1578)
    const fires = this.fires.items;
    for (let i = 0; i < fires.length; i++) {
      const f = fires[i];
      if (!f.active) continue;
      f.age++;
      if (f.age >= f.life) {
        f.active = false;
        continue;
      }
      if ((this.frame + i) % 6 === 0) this.hooks.smoke(f.x, f.y + 6, f.z, 6, f.size, f.size * 3.5, 0.22);
    }
  }

  private explode(o: Ordnance): void {
    this.hooks.blast(o.pos.x, o.pos.y + 5, o.pos.z, o.kind === 'BOMB' ? BOMB_BLAST_M * 0.6 : 50, 1.4);
    this.hooks.sound('explode', o.pos);
    o.active = false;
    o.mesh.visible = false;
  }

  /** a crashed jet burns where it fell (main.py:2335: life 2400, size 12) */
  burn(x: number, z: number): void {
    this.addFire(x, z, 2400, 12);
  }

  private addFire(x: number, z: number, life: number, size: number): void {
    const f = this.fires.acquireOrRecycle();
    f.x = x;
    f.z = z;
    f.y = heightAt(x, z);
    f.age = 0;
    f.life = life;
    f.size = size;
  }

  /** main.py:1877-1888 */
  private groundHit(p: Vector3, radius: number, damage: number, source: string): void {
    this.addFire(p.x, p.z, FIRE_LIFE_HIT, 9);
    for (const l of this.threats.launchers) {
      if (l.hp <= 0) continue;
      const pad = l.kind === 'SAM' ? GROUND_HIT_PAD_SAM_M : GROUND_HIT_PAD_TEL_M;
      if (Math.hypot(l.x - p.x, l.z - p.z) >= radius + pad) continue;
      l.hp = Math.max(0, l.hp - damage);
      if (l.hp === 0) {
        l.missiles = 0;
        this.addFire(l.x, l.z, FIRE_LIFE_DESTROYED, 14);
        this.hooks.say(`${l.name} DESTROYED BY ${source}` + targetDestroyed(l.name)); // + Stratos Coins
      } else this.hooks.say(`${l.name} DAMAGED BY ${source}`);
    }
  }

  /** Draw-side. */
  sync(cam: Vector3): void {
    const items = this.items.items;
    for (let i = 0; i < items.length; i++) if (items[i].active) items[i].sync(cam);
  }
}
