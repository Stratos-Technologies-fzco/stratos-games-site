// Flares (main.py:1974-1993) and the ECM jammer (main.py:1955-1972), as separate keys.
// Flares: a salvo of 6 hot flares behind the jet; each heat-seeking missile within range gets one roll per salvo
// (main.py 0.85), weighted by how hot the salvo still is: a flare cools over about 2 s.
// ECM: radar-guided missiles within range lose the jet (main.py 0.6) and fly to a false track 400 px ahead.
import { AdditiveBlending, DynamicDrawUsage, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, type Scene, SphereGeometry, Vector3 } from 'three';
import {
  CHAFF_BLOOM_FRAMES,
  CHAFF_DECOY_CHANCE,
  CHAFF_PER_SALVO,
  CHAFF_RANGE_M,
  CHAFF_RELOAD,
  ECM_BREAK_CHANCE,
  ECM_FALSE_SPREAD_M,
  ECM_FALSE_TRACK_M,
  ECM_RANGE_M,
  ECM_RELOAD,
  FLARE_BURN_FRAMES,
  FLARE_DECOY_CHANCE,
  FLARE_MIN_CLIMB,
  FLARE_RANGE_M,
  FLARE_RELOAD,
  FLARES_PER_SALVO,
  STEP,
} from '../config';
import { Pool, type Poolable } from '../core/Pool';
import type { Missile } from './Missile';

const MAX_FLARES = FLARES_PER_SALVO * 4;
const G0 = 9.81;

class Flare implements Poolable {
  active = false;
  readonly pos = new Vector3();
  readonly vel = new Vector3();
  age = 0;
  salvo = 0;
  constructor(readonly index: number) {}
  get heat(): number {
    return Math.max(0, 1 - this.age / FLARE_BURN_FRAMES);
  }
}

const _m = new Matrix4();
const _q = new Quaternion();
const _s = new Vector3();
const _zero = new Matrix4().makeScale(0, 0, 0);
const _fwd = new Vector3();
const _side = new Vector3();
const _up = new Vector3(0, 1, 0);

export class Countermeasures {
  readonly mesh: InstancedMesh;
  readonly flares = new Pool<Flare>(MAX_FLARES, (i) => new Flare(i));
  flareCd = 0;
  chaffCd = 0;
  /** chaff clouds (radar decoys): drift and slowly fall behind the jet */
  readonly chaff = new Pool<Flare>(CHAFF_PER_SALVO * 3, (i) => new Flare(i));
  private chaffSalvo = 0;
  ecmCd = 0;
  /** frames the ECM ring shows (main.py:1971 ecm_flash 40) */
  ecmFlash = 0;
  private salvo = 0;
  /** newest salvo still burning, per flare index ranges */
  private salvoHeat = 0;

  constructor(scene: Scene | null) {
    this.mesh = new InstancedMesh(
      new SphereGeometry(1, 10, 8),
      new MeshBasicMaterial({ color: 0xfffbe0, transparent: true, blending: AdditiveBlending, depthWrite: false }),
      MAX_FLARES,
    );
    (this.mesh.material as MeshBasicMaterial).color.multiplyScalar(5); // white-hot: blooms
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    for (let i = 0; i < MAX_FLARES; i++) this.mesh.setMatrixAt(i, _zero);
    if (scene) scene.add(this.mesh);
  }

  reset(): void {
    this.flares.releaseAll();
    this.flareCd = 0;
    this.chaffCd = 0;
    this.chaff.releaseAll();
    this.ecmCd = 0;
    this.ecmFlash = 0;
    this.salvoHeat = 0;
    for (let i = 0; i < MAX_FLARES; i++) this.mesh.setMatrixAt(i, _zero);
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /** C: a salvo of 6 flares (main.py:1977-1985). False when still reloading. */
  fireFlares(jetPos: Vector3, jetVel: Vector3): boolean {
    if (this.flareCd > 0) return false;
    this.flareCd = FLARE_RELOAD();
    this.salvo++;
    _fwd.copy(jetVel).normalize();
    _side.crossVectors(_fwd, _up);
    if (_side.lengthSq() < 1e-6) _side.set(1, 0, 0);
    _side.normalize();
    for (let k = 0; k < FLARES_PER_SALVO; k++) {
      const f = this.flares.acquireOrRecycle();
      const side = (k % 2) * 2 - 1; // main.py:1982 alternate sides
      f.pos.copy(jetPos).addScaledVector(_fwd, -12 - k * 3);
      f.vel.copy(jetVel).multiplyScalar(0.55).addScaledVector(_side, side * (14 + k * 4)).addScaledVector(_up, -6 - k);
      f.age = 0;
      f.salvo = this.salvo;
    }
    return true;
  }

  /** K: chaff, the radar decoy (new): a salvo of reflecting clouds behind the jet. False when reloading. */
  fireChaff(jetPos: Vector3, jetVel: Vector3): boolean {
    if (this.chaffCd > 0) return false;
    this.chaffCd = CHAFF_RELOAD();
    this.chaffSalvo++;
    _fwd.copy(jetVel).normalize();
    _side.crossVectors(_fwd, _up);
    if (_side.lengthSq() < 1e-6) _side.set(1, 0, 0);
    _side.normalize();
    for (let k = 0; k < CHAFF_PER_SALVO; k++) {
      const c = this.chaff.acquireOrRecycle();
      const side = (k % 2) * 2 - 1;
      c.pos.copy(jetPos).addScaledVector(_fwd, -15 - k * 5);
      c.vel.copy(jetVel).multiplyScalar(0.25).addScaledVector(_side, side * (10 + k * 5)).addScaledVector(_up, 4 - k * 2);
      c.age = 0;
      c.salvo = this.chaffSalvo;
    }
    return true;
  }

  /** X: ECM jammer (main.py:1960-1972). Returns how many locks it broke, or -1 when reloading. */
  fireEcm(jetPos: Vector3, missiles: readonly Missile[], rand: () => number): number {
    if (this.ecmCd > 0) return -1;
    this.ecmCd = ECM_RELOAD();
    this.ecmFlash = 40;
    let broken = 0;
    for (let i = 0; i < missiles.length; i++) {
      const m = missiles[i];
      if (!m.active || !m.tracking || m.seeker !== 'RADAR') continue;
      if (m.pos.distanceTo(jetPos) >= ECM_RANGE_M || rand() >= ECM_BREAK_CHANCE()) continue;
      // seeker jammed: a false track 400 px ahead, +-150 px (main.py:1968)
      m.falseTrack
        .copy(m.pos)
        .addScaledVector(m.dir, ECM_FALSE_TRACK_M)
        .add(_s.set((rand() * 2 - 1) * ECM_FALSE_SPREAD_M, (rand() * 2 - 1) * ECM_FALSE_SPREAD_M * 0.4, (rand() * 2 - 1) * ECM_FALSE_SPREAD_M));
      m.seduce(m.falseTrack);
      broken++;
    }
    return broken;
  }

  /** One frame: flares fly and cool; heat seekers in range roll once per salvo. Returns missiles decoyed now. */
  step(jetPos: Vector3, missiles: readonly Missile[], rand: () => number): number {
    if (this.flareCd > 0) this.flareCd--;
    if (this.chaffCd > 0) this.chaffCd--;
    this.stepChaff(jetPos, missiles, rand);
    if (this.ecmCd > 0) this.ecmCd--;
    if (this.ecmFlash > 0) this.ecmFlash--;
    const items = this.flares.items;
    let hottest: Flare | null = null;
    for (let i = 0; i < items.length; i++) {
      const f = items[i];
      if (!f.active) continue;
      f.age++;
      if (f.age > FLARE_BURN_FRAMES + 30) {
        f.active = false;
        this.mesh.setMatrixAt(i, _zero);
        continue;
      }
      f.vel.multiplyScalar(0.985);
      f.vel.y -= G0 * 0.4 * STEP;
      f.pos.addScaledVector(f.vel, STEP);
      if (f.heat > 0 && (!hottest || f.heat > hottest.heat)) hottest = f;
      const s = 0.6 + 3.2 * f.heat;
      _m.compose(f.pos, _q, _s.set(s, s, s));
      this.mesh.setMatrixAt(i, f.heat > 0 ? _m : _zero);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    this.salvoHeat = hottest ? hottest.heat : 0;
    if (!hottest) return 0;

    // heat seekers close to the jet, past half their climb (main.py:1988-1990), one roll per salvo
    let pulled = 0;
    for (let i = 0; i < missiles.length; i++) {
      const m = missiles[i];
      if (!m.active || !m.tracking || m.seeker !== 'IR') continue;
      if (m.flareSalvoTried === hottest.salvo || m.climbShare < FLARE_MIN_CLIMB) continue;
      if (m.pos.distanceTo(jetPos) >= FLARE_RANGE_M) continue;
      m.flareSalvoTried = hottest.salvo;
      if (rand() < FLARE_DECOY_CHANCE() * hottest.heat) {
        // chase one of the salvo's flares (main.py:1991 picks one at random)
        let pick: Flare = hottest;
        const want = Math.floor(rand() * FLARES_PER_SALVO);
        let n = 0;
        for (let k = 0; k < items.length; k++) {
          const f = items[k];
          if (f.active && f.salvo === hottest.salvo) {
            if (n === want) pick = f;
            n++;
          }
        }
        m.seduce(pick.pos);
        pulled++;
      }
    }
    return pulled;
  }

  /** chaff clouds bloom, slow down, fall; radar seekers in range roll once per salvo */
  private stepChaff(jetPos: Vector3, missiles: readonly Missile[], rand: () => number): void {
    const cs = this.chaff.items;
    let newest: Flare | null = null;
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];
      if (!c.active) continue;
      c.age++;
      if (c.age > CHAFF_BLOOM_FRAMES) {
        c.active = false;
        continue;
      }
      c.vel.multiplyScalar(0.96);
      c.vel.y -= G0 * 0.05 * STEP;
      c.pos.addScaledVector(c.vel, STEP);
      if (!newest || c.salvo > newest.salvo) newest = c;
    }
    if (!newest) return;
    const strength = Math.max(0, 1 - newest.age / CHAFF_BLOOM_FRAMES);
    for (let i = 0; i < missiles.length; i++) {
      const m = missiles[i];
      if (!m.active || !m.tracking || m.seeker !== 'RADAR') continue;
      if (m.chaffSalvoTried === newest.salvo || m.climbShare < FLARE_MIN_CLIMB) continue;
      if (m.pos.distanceTo(jetPos) >= CHAFF_RANGE_M) continue;
      m.chaffSalvoTried = newest.salvo;
      if (rand() < CHAFF_DECOY_CHANCE() * strength) m.seduce(newest.pos);
    }
  }

  get flareHeat(): number {
    return this.salvoHeat;
  }
}
