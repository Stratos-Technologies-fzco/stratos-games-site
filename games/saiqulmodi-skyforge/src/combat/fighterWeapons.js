// Fighter weapons (fighter upgrade, phase 4, 09-Nov-2026): real numbers, pooled, the same physics for every shot.
//   GUN   M61 class: 511 rounds, 6,000 rounds a minute, 1,036 m/s plus the aircraft's speed, gravity and air drag,
//         small spread, a tracer every 5th round
//   IR    2 heat seekers (AIM-9 class): seeker growl, high tone when it sees a target; 0.8-18 km; motor 2.5 s to
//         about Mach 2.5 with a thick smoke trail; proportional navigation N = 4, at most 35 g; proximity fuse 8 m;
//         a flare from the target can pull it away
//   RDR   2 radar missiles (AIM-120 class): need the radar lock; 2-50 km; steered by the aircraft's radar until
//         15 km from the target, then by their own radar; chaff from the target can fool them
//   BOMB  4 free-fall 500 lb bombs: keep the release velocity, fall with gravity and drag; the HUD's CCIP pipper is
//         the same fall worked out ahead, so the bomb lands on it
//   FLARE / CHAFF 30 + 30, released in pairs from the back of the aircraft
// Stores hang on stations (STATIONS, body frame: x right, y up, nose -z) and disappear from the aircraft when fired.
// MASTER ARM must be on to fire anything; it cannot be switched on with the wheels on the ground.
import * as THREE from 'three';
import { atmosphere } from '../physics/flight.js';

const G = 9.81;
const DEG = Math.PI / 180;
const KT = 1 / 1.94384;

export const STORES = {
  GUN: { rounds: 511, rps: 100, mv: 1036, kgPerRound: 0.25, spread: 0.0016, tracerEvery: 5, damage: 12, life: 3.0, k0: 3.5e-4 },
  IR: { n: 2, kg: 86, drag: 0.012, minR: 800, maxR: 18000, burn: 2.5, thrust: 260, k0: 1.0e-4, maxG: 35, nav: 4, fuse: 8,
    gimbalDeg: 40, acqDeg: 2.5, slaveDeg: 30, life: 30, minSpeed: 220, len: 3.0, r: 0.065 },
  RDR: { n: 2, kg: 152, drag: 0.016, minR: 2000, maxR: 50000, burn: 6, thrust: 190, k0: 4.0e-5, maxG: 35, nav: 4, fuse: 8,
    gimbalDeg: 45, pitbull: 15000, life: 90, minSpeed: 250, len: 3.65, r: 0.09 },
  // enemy surface-to-air missile (phase 5): radar guided from the launch, chaff can fool it
  SAM: { n: 0, kg: 0, drag: 0, minR: 1500, maxR: 25000, burn: 5, thrust: 220, k0: 5.0e-5, maxG: 30, nav: 4, fuse: 10,
    gimbalDeg: 75, pitbull: 1e9, life: 45, minSpeed: 200, len: 5.5, r: 0.2 },
  BOMB: { n: 4, kg: 241, drag: 0.045, k0: 5.6e-5, blastR: 45, damage: 600, len: 2.2, r: 0.137 },
  FLARE: { n: 30, burn: 4 },
  CHAFF: { n: 30, life: 6 }
};
export const WEAPON_ORDER = ['GUN', 'IR', 'RDR', 'BOMB'];
export const WEAPON_NAME = { GUN: 'GUN', IR: 'IR MSL', RDR: 'RDR MSL', BOMB: 'MK82' };

// Where each store hangs (body frame, metres): wing-tip rails, outer pylons, inner pylons (two bombs a side)
export const STATIONS = {
  IR: [[-4.6, -0.06, 2.9], [4.6, -0.06, 2.9]],
  RDR: [[-3.4, -0.5, 2.0], [3.4, -0.5, 2.0]],
  BOMB: [[-1.95, -0.62, 1.3], [1.95, -0.62, 1.3], [-2.6, -0.62, 1.6], [2.6, -0.62, 1.6]],
  GUN: [-0.75, 0.32, -4.2],
  DECOY: [[-1.2, -0.3, 4.6], [1.2, -0.3, 4.6]]
};

// ---------- store meshes (the same shape on the aircraft and in flight; nose along -z) ----------
const matCache = {};
function mats() {
  if (matCache.white) return matCache;
  matCache.white = new THREE.MeshStandardMaterial({ color: 0xe6e6e0, roughness: 0.45, metalness: 0.2 });
  matCache.grey = new THREE.MeshStandardMaterial({ color: 0x8b8f86, roughness: 0.6, metalness: 0.2 });
  matCache.olive = new THREE.MeshStandardMaterial({ color: 0x4f5638, roughness: 0.7, metalness: 0.1 });
  matCache.band = new THREE.MeshStandardMaterial({ color: 0xd8b02a, roughness: 0.6 });
  matCache.dark = new THREE.MeshStandardMaterial({ color: 0x2a2d30, roughness: 0.6 });
  matCache.plume = new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false });
  return matCache;
}
export function makeStoreMesh(kind) {
  const m = mats();
  const g = new THREE.Group();
  if (kind === 'BOMB') {
    const S = STORES.BOMB;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(S.r, S.r, S.len * 0.62, 12), m.olive);
    body.rotation.x = Math.PI / 2;
    const nose = new THREE.Mesh(new THREE.ConeGeometry(S.r, S.len * 0.22, 12), m.olive);
    nose.rotation.x = -Math.PI / 2; nose.position.z = -S.len * 0.42;
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(S.r, S.r * 0.45, S.len * 0.18, 12), m.olive);
    tail.rotation.x = Math.PI / 2; tail.position.z = S.len * 0.4;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(S.r * 1.02, S.r * 1.02, 0.06, 12), m.band);
    band.rotation.x = Math.PI / 2; band.position.z = -S.len * 0.22;
    g.add(body, nose, tail, band);
    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, S.r * 2.6, 0.32), m.olive);
      fin.position.z = S.len * 0.42; fin.rotation.z = i * Math.PI / 4 + Math.PI / 4;
      g.add(fin);
    }
  } else {
    const S = STORES[kind];
    const body = new THREE.Mesh(new THREE.CylinderGeometry(S.r, S.r, S.len * 0.88, 10), kind === 'IR' ? m.white : m.grey);
    body.rotation.x = Math.PI / 2;
    const nose = new THREE.Mesh(new THREE.ConeGeometry(S.r, S.len * 0.12, 10), kind === 'IR' ? m.dark : m.white);
    nose.rotation.x = -Math.PI / 2; nose.position.z = -S.len * 0.5;
    g.add(body, nose);
    for (let i = 0; i < 4; i++) {
      const tf = new THREE.Mesh(new THREE.BoxGeometry(0.015, S.r * 5, 0.3), m.white);
      tf.position.z = S.len * 0.38; tf.rotation.z = i * Math.PI / 4;
      const cf = new THREE.Mesh(new THREE.BoxGeometry(0.015, S.r * (kind === 'IR' ? 4.4 : 3.2), 0.2), m.white);
      cf.position.z = -S.len * 0.28; cf.rotation.z = i * Math.PI / 4;
      g.add(tf, cf);
    }
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function makePlume(kind) {
  const S = STORES[kind];
  const p = new THREE.Mesh(new THREE.ConeGeometry(S.r * 1.6, 2.4, 8), mats().plume);
  p.rotation.x = -Math.PI / 2;
  p.position.z = S.len * 0.5 + 1.2;
  return p;
}

// ---------- the loadout: what is left on the aircraft ----------
export class Loadout {
  constructor() { this.reset(); }
  reset() {
    this.rounds = STORES.GUN.rounds;
    this.IR = [1, 1]; this.RDR = [1, 1]; this.BOMB = [1, 1, 1, 1];
    this.flares = STORES.FLARE.n; this.chaff = STORES.CHAFF.n;
  }
  count(kind) { return kind === 'GUN' ? this.rounds : this[kind].reduce((a, b) => a + b, 0); }
  // next station to fire: alternate sides (the one with more left first)
  take(kind) {
    const st = this[kind];
    for (let i = 0; i < st.length; i++) if (st[i]) { st[i] = 0; return i; }
    return -1;
  }
  nextStation(kind) { return this[kind].findIndex((x) => x); }
  massKg() {
    return this.rounds * STORES.GUN.kgPerRound + this.count('IR') * STORES.IR.kg + this.count('RDR') * STORES.RDR.kg + this.count('BOMB') * STORES.BOMB.kg;
  }
  dragAdd() { return this.count('IR') * STORES.IR.drag + this.count('RDR') * STORES.RDR.drag + this.count('BOMB') * STORES.BOMB.drag; }
  rollScale() { return 1 - 0.06 * this.count('BOMB'); }
}

// ---------- shared physics ----------
// Bomb / free fall: gravity and drag (k0 = drag per metre at sea level), one step. Used for the real bomb and the CCIP.
export const BOMB_DT = 1 / 30;
function stepFall(p, v, k0, hMOf, dt) {
  const k = k0 * atmosphere(hMOf(p.y)).sigma;
  const sp = v.length();
  v.multiplyScalar(1 / (1 + k * sp * dt));
  v.y -= G * dt;
  p.addScaledVector(v, dt);
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _s = new THREE.Vector3(1, 1, 1);
const _z = new THREE.Vector3(0, 0, -1);
const _los = new THREE.Vector3();
const _rel = new THREE.Vector3();
const _om = new THREE.Vector3();
const _acc = new THREE.Vector3();
const velOf = (t) => t.velocity || t.vel || null;

// closest distance from the origin to the segment a -> b
function segDist(a, b) {
  _c.copy(b).sub(a);
  const l2 = _c.lengthSq();
  const t = l2 > 0 ? Math.max(0, Math.min(1, -a.dot(_c) / l2)) : 0;
  return Math.sqrt(a.lengthSq() + 2 * t * a.dot(_c) + t * t * l2);
}

export class FighterWeapons {
  // opts: { groundY(x, z) -> world y, hMOf(y) -> m above sea level, fx (OrdnanceFx or null), targets() -> list }
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.groundY = opts.groundY || (() => 0);
    this.hMOf = opts.hMOf || ((y) => y);
    this.fx = opts.fx || null;
    this.targets = opts.targets || (() => []);
    this.loadout = new Loadout();
    this.arm = false;
    this.sel = 'GUN';
    this.events = [];
    this.flareSeq = 0;
    // gun rounds (plain arrays, pooled) + instanced tracers
    const NR = 400;
    this.NR = NR;
    this.rp = new Float32Array(NR * 3); this.rv = new Float32Array(NR * 3); this.rl = new Float32Array(NR); this.rt = new Int16Array(NR).fill(-1);
    this.rNext = 0; this.gunAcc = 0; this.shot = 0;
    const tg = new THREE.CylinderGeometry(0.1, 0.1, 7, 5);
    tg.rotateX(Math.PI / 2);
    this.tracers = new THREE.InstancedMesh(tg, new THREE.MeshBasicMaterial({ color: 0xffd25a, toneMapped: false }), 96);
    this.tracers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.tracers.frustumCulled = false;
    this.tracers.count = 0;
    this.tracerFree = [];
    for (let i = 95; i >= 0; i--) this.tracerFree.push(i);
    this.tracerHide = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = 0; i < 96; i++) this.tracers.setMatrixAt(i, this.tracerHide);
    this.tracers.count = 96;
    scene.add(this.tracers);
    this.missiles = [];
    this.bombs = [];
    this.flares = [];
    this.chaffs = [];
    this.pool = { IR: [], RDR: [], BOMB: [] };
    this.firing = false;
    this.seeker = { state: 'off', target: null, dir: new THREE.Vector3() };
    this.flyouts = {};
  }

  reset() {
    this.loadout.reset();
    this.arm = false;
    this.sel = 'GUN';
    this.seeker.state = 'off'; this.seeker.target = null;
    this.rl.fill(0);
    for (let i = 0; i < this.NR; i++) this.freeTracer(i);
    this.missiles.forEach((m) => { m.mesh.visible = false; (this.pool[m.kind] || (this.pool[m.kind] = [])).push(m.mesh); });
    this.bombs.forEach((b) => { b.mesh.visible = false; this.pool.BOMB.push(b.mesh); });
    this.missiles.length = 0; this.bombs.length = 0; this.flares.length = 0; this.chaffs.length = 0;
  }

  setArm(on, onGround) {
    if (on && onGround) return { ok: false, why: 'GND' };
    this.arm = on;
    return { ok: true };
  }
  cycle() {
    const i = WEAPON_ORDER.indexOf(this.sel);
    this.sel = WEAPON_ORDER[(i + 1) % WEAPON_ORDER.length];
    return this.sel;
  }

  stationWorld(out, st, own) {
    _q.setFromEuler(own.rot);
    return out.set(st[0], st[1], st[2]).applyQuaternion(_q).add(own.pos);
  }

  // ---------- gun: call every frame with trigger = held ----------
  gun(dt, own, trigger) {
    this.firing = false;
    if (!trigger || !this.arm) { this.gunAcc = 0; return 0; }
    if (this.loadout.rounds <= 0) return 0;
    const S = STORES.GUN;
    this.gunAcc += dt * S.rps;
    let fired = 0;
    _q.setFromEuler(own.rot);
    while (this.gunAcc >= 1 && this.loadout.rounds > 0) {
      this.gunAcc -= 1;
      this.loadout.rounds--;
      this.shot++;
      fired++;
      const i = this.rNext;
      this.rNext = (this.rNext + 1) % this.NR;
      this.freeTracer(i);
      _a.set(STATIONS.GUN[0], STATIONS.GUN[1], STATIONS.GUN[2]).applyQuaternion(_q).add(own.pos);
      _b.set((Math.random() - 0.5) * 2 * S.spread, (Math.random() - 0.5) * 2 * S.spread, -1).normalize().applyQuaternion(_q);
      // rounds fired within one frame are spread along the frame so the stream has no gaps
      const lag = (this.gunAcc / S.rps);
      _c.copy(own.vel).addScaledVector(_b, S.mv);
      _a.addScaledVector(_c, lag);
      this.rp[3 * i] = _a.x; this.rp[3 * i + 1] = _a.y; this.rp[3 * i + 2] = _a.z;
      this.rv[3 * i] = _c.x; this.rv[3 * i + 1] = _c.y; this.rv[3 * i + 2] = _c.z;
      this.rl[i] = S.life;
      if (this.shot % S.tracerEvery === 0 && this.tracerFree.length) this.rt[i] = this.tracerFree.pop();
    }
    this.firing = fired > 0 || this.gunAcc > 0;
    return fired;
  }
  freeTracer(i) {
    const k = this.rt[i];
    if (k >= 0) { this.tracers.setMatrixAt(k, this.tracerHide); this.tracerFree.push(k); this.rt[i] = -1; }
  }

  stepRounds(dt, targets) {
    const S = STORES.GUN;
    let anyTracer = false;
    for (let i = 0; i < this.NR; i++) {
      if (this.rl[i] <= 0) continue;
      this.rl[i] -= dt;
      const px = this.rp[3 * i], py = this.rp[3 * i + 1], pz = this.rp[3 * i + 2];
      _b.set(this.rv[3 * i], this.rv[3 * i + 1], this.rv[3 * i + 2]);
      const k = S.k0 * atmosphere(this.hMOf(py)).sigma;
      _b.multiplyScalar(1 / (1 + k * _b.length() * dt));
      _b.y -= G * dt;
      const nx = px + _b.x * dt, ny = py + _b.y * dt, nz = pz + _b.z * dt;
      let gone = this.rl[i] <= 0;
      // hit a target: closest point of this step's path within the target's radius
      for (const t of targets) {
        if (t.isDestroyed) continue;
        _a.set(px - t.position.x, py - t.position.y, pz - t.position.z);
        _c.set(nx - t.position.x, ny - t.position.y, nz - t.position.z);
        if (_a.lengthSq() > 4e4 && _c.lengthSq() > 4e4 && _a.dot(_c) > 0) continue;
        if (segDist(_a, _c) < (t.hitRadius || 8)) {
          this.damage(t, S.damage, 'GUN');
          if (this.fx) this.fx.spark(_a.set(nx, ny, nz));
          gone = true;
          break;
        }
      }
      if (!gone && ny <= this.groundY(nx, nz)) {
        if (this.fx && (this.rt[i] >= 0 || Math.random() < 0.25)) this.fx.dust(_a.set(nx, this.groundY(nx, nz), nz));
        gone = true;
      }
      if (gone) { this.rl[i] = 0; this.freeTracer(i); continue; }
      this.rp[3 * i] = nx; this.rp[3 * i + 1] = ny; this.rp[3 * i + 2] = nz;
      this.rv[3 * i] = _b.x; this.rv[3 * i + 1] = _b.y; this.rv[3 * i + 2] = _b.z;
      const tk = this.rt[i];
      if (tk >= 0) {
        _q.setFromUnitVectors(_z, _c.copy(_b).normalize());
        _m.compose(_a.set(nx, ny, nz), _q, _s);
        this.tracers.setMatrixAt(tk, _m);
        anyTracer = true;
      }
    }
    this.tracers.instanceMatrix.needsUpdate = true;
    return anyTracer;
  }

  damage(t, amount, how) {
    if (t.isDestroyed || t.health === undefined) return;
    if (t.damageScale) amount *= t.damageScale;
    t.health -= amount;
    t.lastHitBy = how;
    if (t.onHit) t.onHit(amount, how);
    this.events.push({ type: 'hit', target: t, how, kill: t.health <= 0 });
  }

  // ---------- IR seeker: slaved to the radar lock (within 30 deg of the nose) or looking straight ahead ----------
  updateSeeker(own, radarLock, targets) {
    const sk = this.seeker;
    if (this.sel !== 'IR' || !this.arm || this.loadout.count('IR') === 0) { sk.state = 'off'; sk.target = null; return sk; }
    const S = STORES.IR;
    _q.setFromEuler(own.rot);
    const nose = _a.set(0, 0, -1).applyQuaternion(_q);
    const offNose = (t) => { _b.copy(t.position).sub(own.pos); const r = _b.length(); return { r, ang: Math.acos(Math.max(-1, Math.min(1, _b.dot(nose) / Math.max(1, r)))) / DEG }; };
    // keep a target it already sees while it stays inside the gimbal and range
    if (sk.target && !sk.target.isDestroyed) {
      const o = offNose(sk.target);
      if (o.ang < S.slaveDeg && o.r < S.maxR * 1.1) { sk.state = 'track'; sk.dir.copy(sk.target.position).sub(own.pos).normalize(); return sk; }
    }
    sk.target = null;
    let best = null, bestAng = Infinity;
    if (radarLock && !radarLock.isDestroyed && radarLock.type !== 'GROUND') {
      const o = offNose(radarLock);
      if (o.ang < S.slaveDeg && o.r < S.maxR) { best = radarLock; bestAng = o.ang; }
    }
    if (!best) {
      for (const t of targets) {
        if (t.isDestroyed || t.type === 'GROUND') continue;
        const o = offNose(t);
        if (o.ang < S.acqDeg && o.r < S.maxR && o.ang < bestAng) { best = t; bestAng = o.ang; }
      }
    }
    if (best) { sk.target = best; sk.state = 'track'; sk.dir.copy(best.position).sub(own.pos).normalize(); }
    else { sk.state = 'search'; sk.dir.copy(nose); }
    return sk;
  }

  // ---------- missiles ----------
  // kind 'IR' needs the seeker to track; 'RDR' needs a radar lock. Returns { ok, why, station }
  launch(kind, own, target) {
    if (!this.arm) return { ok: false, why: 'SAFE' };
    if (this.loadout.count(kind) === 0) return { ok: false, why: 'EMPTY' };
    if (!target) return { ok: false, why: kind === 'IR' ? 'NO TONE' : 'NO LOCK' };
    const st = this.loadout.take(kind);
    const S = STORES[kind];
    const mesh = this.missileMesh(kind);
    const pos = this.stationWorld(new THREE.Vector3(), STATIONS[kind][st], own);
    _q.setFromEuler(own.rot);
    const vel = own.vel.clone().add(_a.set(0, -3, 0).applyQuaternion(_q));   // pushed clear of the rail / pylon
    const m = { kind, S, mesh, plume: mesh.children[mesh.children.length - 1], pos, vel, target, t: 0, alive: true, active: kind === 'IR',
      lastFlare: this.flareSeq, lastChaff: this.flareSeq, decoyed: false, trailAcc: 0, owner: own.owner || 'own', minDist: Infinity };
    mesh.position.copy(pos);
    mesh.quaternion.copy(_q);
    this.missiles.push(m);
    this.events.push({ type: 'launch', kind, target, station: st, owner: m.owner });
    return { ok: true, station: st, missile: m };
  }
  missileMesh(kind) {
    const pool = this.pool[kind] || (this.pool[kind] = []);
    const mesh = pool.pop() || (() => { const g = makeStoreMesh(kind); g.add(makePlume(kind)); this.scene.add(g); return g; })();
    mesh.visible = true;
    return mesh;
  }
  // Phase 5: a missile fired by an enemy (SAM site or enemy fighter) at target (usually the player's aircraft).
  // pos, vel: launch point and velocity; launcher: the enemy object (for messages)
  launchFrom(kind, pos, vel, target, launcher) {
    const S = STORES[kind];
    const mesh = this.missileMesh(kind);
    const m = { kind, S, mesh, plume: mesh.children[mesh.children.length - 1], pos: pos.clone(), vel: vel.clone(), target, t: 0, alive: true,
      active: kind !== 'RDR', lastFlare: this.flareSeq, lastChaff: this.flareSeq, decoyed: false, trailAcc: 0, owner: 'enemy', launcher, minDist: Infinity };
    mesh.position.copy(m.pos);
    mesh.quaternion.setFromUnitVectors(_z, _a.copy(vel).normalize());
    this.missiles.push(m);
    this.events.push({ type: 'launch', kind, target, owner: 'enemy', launcher });
    return m;
  }

  // radarLock: the aircraft radar's locked target (datalink for the radar missile)
  stepMissiles(dt, radarLock, targets) {
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      const sub = Math.max(1, Math.ceil(dt * 120));
      const h = dt / sub;
      for (let s = 0; s < sub && m.alive; s++) this.stepMissile(m, h, radarLock, targets);
      if (!m.alive) {
        m.mesh.visible = false;
        this.pool[m.kind].push(m.mesh);
        this.missiles.splice(i, 1);
        continue;
      }
      m.mesh.position.copy(m.pos);
      _q.setFromUnitVectors(_z, _a.copy(m.vel).normalize());
      m.mesh.quaternion.copy(_q);
      const burning = m.t < m.S.burn;
      m.plume.visible = burning;
      if (burning) m.plume.scale.set(1, 1, 0.8 + Math.random() * 0.5);
      // smoke trail every few metres while the motor burns
      m.trailAcc += m.vel.length() * dt;
      if (this.fx && burning && m.trailAcc > (m.kind === 'SAM' ? 7 : 9)) {
        const n = Math.min(6, Math.floor(m.trailAcc / 9));
        for (let k = 0; k < n; k++) {
          _b.copy(m.pos).addScaledVector(m.vel, -dt * (k / n));
          this.fx.motorPuff(_b, m.vel, _a, true, m.kind === 'IR' ? 1.2 : 0.9);
        }
        m.trailAcc = 0;
      }
    }
  }

  stepMissile(m, dt, radarLock, targets) {
    const S = m.S;
    m.t += dt;
    const v = m.vel.length();
    const vHat = _a.copy(m.vel).divideScalar(Math.max(1, v));
    let tgt = m.target;
    // decoys: a new flare (IR) or chaff (radar) from the target, seen by the seeker, may pull the missile away
    if (tgt && !m.decoyed) this.checkDecoys(m, tgt);
    tgt = m.target;
    // guidance source
    let guided = false;
    if (tgt && !(tgt.isDestroyed) && !(tgt.burnt)) {
      _los.copy(tgt.position).sub(m.pos);
      const r = _los.length();
      if (m.kind === 'RDR' && !m.active) {
        // datalink while the aircraft still holds the lock; its own radar from 15 km
        if (r < S.pitbull) { m.active = true; this.events.push({ type: 'pitbull', target: tgt }); }
        guided = m.active || radarLock === tgt || m.decoyed;
      } else guided = true;
      const off = Math.acos(Math.max(-1, Math.min(1, _los.dot(vHat) / Math.max(1, r)))) / DEG;
      if (off > S.gimbalDeg) guided = false;
      if (guided) {
        // proportional navigation: a = N * closing speed * line-of-sight rate (across the line of sight), plus 1 g up
        const tv = velOf(tgt) || _rel.set(0, 0, 0);
        _rel.copy(tv).sub(m.vel);
        _om.crossVectors(_los, _rel).divideScalar(Math.max(1, r * r));
        const vc = -_rel.dot(_los) / Math.max(1, r);
        _acc.crossVectors(_om, _los).divideScalar(Math.max(1, r)).multiplyScalar(S.nav * Math.max(vc, 50));
        _acc.y += G;
        _acc.addScaledVector(vHat, -_acc.dot(vHat));           // steering only turns the missile
        const sigma = atmosphere(this.hMOf(m.pos.y)).sigma;
        const lim = Math.min(S.maxG, S.maxG * sigma * (v / 600) ** 2 * 2.5) * G;
        const al = _acc.length();
        if (al > lim) _acc.multiplyScalar(lim / al);
      }
    }
    if (!guided) _acc.set(0, 0, 0);
    const aLat = _acc.length();
    // along the path: motor, drag (more when it pulls g), gravity
    const sigma = atmosphere(this.hMOf(m.pos.y)).sigma;
    const thrust = m.t < S.burn ? S.thrust : 0;
    const dragA = S.k0 * sigma * v * v + 0.08 * aLat;
    _acc.addScaledVector(vHat, thrust - dragA);
    _acc.y -= G;
    const p0 = _b.copy(m.pos);
    const px = p0.x, py = p0.y, pz = p0.z;
    m.vel.addScaledVector(_acc, dt);
    m.pos.addScaledVector(m.vel, dt);
    // proximity fuse on any target within 8 m during this step (the closest point of the step)
    // enemy missiles only fuse on their own target; the player's never on the player
    const list = m.owner === 'enemy' ? (tgt && !tgt.isDecoy ? [tgt] : []) : tgt && !targets.includes(tgt) ? targets.concat([tgt]) : targets;
    for (const t of list) {
      if (t.isDestroyed || t.burnt || t.isDecoy) continue;
      if (m.owner === 'own' && t.isOwn) continue;
      _c.set(px - t.position.x, py - t.position.y, pz - t.position.z);
      const d0 = _c.length();
      if (d0 > 400) continue;
      _rel.copy(m.pos).sub(t.position);
      const d = segDist(_c, _rel);
      if (t === m.target) m.minDist = Math.min(m.minDist, d);
      if (d < S.fuse + 2) {
        this.damage(t, 250 * Math.max(0.4, 1 - d / 16), m.kind);
        if (this.fx) this.fx.airBurst(m.pos, 1.2);
        m.alive = false;
        this.events.push({ type: 'impact', kind: m.kind, target: t, owner: m.owner, launcher: m.launcher });
        return;
      }
    }
    // decoy reached: it bursts on the flare / passes the chaff and is lost
    if (m.target && (m.target.isDecoy) && m.pos.distanceTo(m.target.position) < 10) { m.target = null; }
    const gy = this.groundY(m.pos.x, m.pos.z);
    if (m.pos.y <= gy || m.t > S.life || (m.t > S.burn && m.vel.length() < S.minSpeed)) {
      if (this.fx) { if (m.pos.y <= gy) this.fx.groundBlast(_c.set(m.pos.x, gy, m.pos.z)); else this.fx.airBurst(m.pos, 0.6); }
      if (m.pos.y <= gy) this.blast(_c.set(m.pos.x, gy, m.pos.z), 20, 200, m.kind);
      m.alive = false;
      this.events.push({ type: 'miss', kind: m.kind, target: m.target, minDist: m.minDist, owner: m.owner, launcher: m.launcher, decoyed: m.decoyed });
    }
  }

  // Decoy chance. IR: best when released early (far), against a head-on shot, while the target turns hard.
  // Radar: best when the target flies across the missile's line of sight (the radar loses it in the ground clutter).
  checkDecoys(m, tgt) {
    const list = m.kind === 'IR' ? this.flares : this.chaffs;
    for (const d of list) {
      if (d.owner !== tgt || d.id <= (m.kind === 'IR' ? m.lastFlare : m.lastChaff)) continue;
      if (m.kind === 'IR') m.lastFlare = d.id; else m.lastChaff = d.id;
      if (d.age > 0.6) continue;
      _los.copy(tgt.position).sub(m.pos);
      const r = _los.length();
      _los.divideScalar(Math.max(1, r));
      const tv = velOf(tgt) || _rel.set(0, 0, -1);
      const ts = Math.max(1, tv.length());
      const cosA = tv.dot(_los) / ts;           // +1 = target flying straight away from the missile (tail on)
      let p;
      if (m.kind === 'IR') {
        p = 0.2;
        p *= r > 3000 ? 1.3 : r < 1000 ? 0.4 : 1;
        p *= cosA > 0.5 ? 0.75 : cosA < -0.5 ? 1.3 : 1;
        if ((tgt.loadG || 1) > 4) p *= 1.6;
      } else {
        p = 0.1;
        if (Math.abs(cosA) < 0.35) p *= 3.5;   // beaming
        if (!m.active) p *= 0.6;
      }
      if (Math.random() < Math.min(0.9, p)) {
        m.target = d;
        m.decoyed = true;
        this.events.push({ type: 'decoyed', kind: m.kind, by: d.kind, target: tgt, owner: m.owner });
        return;
      }
    }
  }

  // ---------- bombs ----------
  bombStart(own, st, outP, outV) {
    this.stationWorld(outP, STATIONS.BOMB[st], own);
    _q.setFromEuler(own.rot);
    outV.copy(own.vel).add(_a.set(0, -1.5, 0).applyQuaternion(_q));   // ejector push
  }
  dropBomb(own) {
    if (!this.arm) return { ok: false, why: 'SAFE' };
    if (this.loadout.count('BOMB') === 0) return { ok: false, why: 'EMPTY' };
    const st = this.loadout.take('BOMB');
    const mesh = this.pool.BOMB.pop() || (() => { const g = makeStoreMesh('BOMB'); this.scene.add(g); return g; })();
    mesh.visible = true;
    const b = { mesh, pos: new THREE.Vector3(), vel: new THREE.Vector3(), acc: 0, alive: true };
    this.bombStart(own, st, b.pos, b.vel);
    mesh.position.copy(b.pos);
    this.bombs.push(b);
    this.events.push({ type: 'release', kind: 'BOMB', station: st });
    return { ok: true, station: st, bomb: b };
  }
  stepBombs(dt) {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const b = this.bombs[i];
      b.acc += dt;
      while (b.acc >= BOMB_DT && b.alive) {
        b.acc -= BOMB_DT;
        stepFall(b.pos, b.vel, STORES.BOMB.k0, this.hMOf, BOMB_DT);
        const gy = this.groundY(b.pos.x, b.pos.z);
        if (b.pos.y <= gy) {
          b.alive = false;
          const at = new THREE.Vector3(b.pos.x, gy, b.pos.z);
          if (this.fx) this.fx.groundBlast(at);
          this.blast(at, STORES.BOMB.blastR, STORES.BOMB.damage, 'BOMB');
          this.events.push({ type: 'bombImpact', at });
        }
      }
      if (!b.alive) { b.mesh.visible = false; this.pool.BOMB.push(b.mesh); this.bombs.splice(i, 1); continue; }
      b.mesh.position.copy(b.pos);
      _q.setFromUnitVectors(_z, _a.copy(b.vel).normalize());
      b.mesh.quaternion.copy(_q);
    }
  }
  blast(at, radius, dmg, how) {
    for (const t of this.targets()) {
      if (t.isDestroyed) continue;
      const d = t.position.distanceTo(at);
      if (d < radius) this.damage(t, dmg * (1 - d / radius), how);
    }
  }

  // CCIP: where a bomb released now would hit (same fall, same steps). { point, t, valid }
  ccip(own, out = { point: new THREE.Vector3(), t: 0, valid: false }) {
    let st = this.loadout.nextStation('BOMB');
    if (st < 0) st = 0;
    const p = _b, v = _c;
    this.bombStart(own, st, p, v);
    let t = 0, gy = this.groundY(p.x, p.z);
    out.valid = false;
    for (let n = 0; n < 2400; n++) {
      stepFall(p, v, STORES.BOMB.k0, this.hMOf, BOMB_DT);
      t += BOMB_DT;
      if (p.y - gy < 400 || n % 10 === 0) gy = this.groundY(p.x, p.z);
      if (p.y <= gy) {
        // the same answer the real bomb gives (it stops at the first step below the ground)
        out.point.set(p.x, gy, p.z);
        out.t = t;
        out.valid = true;
        break;
      }
    }
    return out;
  }

  // ---------- decoys ----------
  // owner: the object the decoys protect (the aircraft's target record); a pair per press
  // fromLoadout false: an enemy's decoys (they do not come out of the player's stores)
  releaseDecoys(kind, own, owner, fromLoadout = true) {
    const left = kind === 'FLARE' ? this.loadout.flares : this.loadout.chaff;
    if (fromLoadout && left <= 0) return { ok: false, why: 'EMPTY' };
    _q.setFromEuler(own.rot);
    const id = ++this.flareSeq;          // the pair counts as one decoy for a missile's seeker
    for (const st of STATIONS.DECOY) {
      const pos = this.stationWorld(new THREE.Vector3(), st, own);
      const vel = own.vel.clone().add(_a.set(Math.sign(st[0]) * 9, -12, 6).applyQuaternion(_q));
      const d = { kind, id, pos, position: pos, vel, velocity: vel, age: 0, owner, isDecoy: true, burnt: false, puff: 0 };
      if (kind === 'FLARE') { this.flares.push(d); if (fromLoadout) this.loadout.flares--; }
      else { this.chaffs.push(d); if (fromLoadout) this.loadout.chaff--; if (this.fx) this.fx.chaffBurst(pos, vel); }
    }
    if (fromLoadout) this.events.push({ type: 'decoy', kind });
    return { ok: true };
  }
  stepDecoys(dt) {
    let newest = null;
    for (let i = this.flares.length - 1; i >= 0; i--) {
      const f = this.flares[i];
      f.age += dt;
      f.vel.multiplyScalar(Math.exp(-1.6 * dt));
      f.vel.y -= G * 0.6 * dt;
      f.pos.addScaledVector(f.vel, dt);
      if (f.age > STORES.FLARE.burn) { f.burnt = true; this.flares.splice(i, 1); continue; }
      f.puff -= dt;
      if (this.fx && f.puff <= 0) { f.puff = 0.03; this.fx.flarePuff(f.pos, f.vel); }
      if (!newest || f.age < newest.age) newest = f;
    }
    if (this.fx) this.fx.setFlareLight(newest ? newest.pos : null);
    for (let i = this.chaffs.length - 1; i >= 0; i--) {
      const c = this.chaffs[i];
      c.age += dt;
      c.vel.multiplyScalar(Math.exp(-3 * dt));
      c.vel.y -= 2 * dt;
      c.pos.addScaledVector(c.vel, dt);
      if (c.age > STORES.CHAFF.life) { c.burnt = true; this.chaffs.splice(i, 1); }
    }
  }

  // ---------- missile range (launch zone) ----------
  // Straight-line fly-out of the missile at this height and launch speed: distance and speed every 0.25 s
  flyout(kind, hM, v0) {
    const key = kind + Math.round(hM / 500) + '_' + Math.round(v0 / 25);
    if (this.flyouts[key]) return this.flyouts[key];
    const S = STORES[kind], sigma = atmosphere(hM).sigma;
    const d = [0], dt = 0.25;
    let v = v0, x = 0;
    for (let t = dt; t <= S.life; t += dt) {
      const a = (t < S.burn ? S.thrust : 0) - S.k0 * sigma * v * v;
      v += a * dt; x += v * dt;
      if (t > S.burn && v < S.minSpeed) break;
      d.push(x);
    }
    const keys = Object.keys(this.flyouts);
    if (keys.length > 200) delete this.flyouts[keys[0]];
    return (this.flyouts[key] = d);
  }
  // { rmin, rne, rmax, range (m), closureKt } for a shot at target t now
  dlz(kind, own, t) {
    if (kind !== 'IR' && kind !== 'RDR') return null;
    const S = STORES[kind];
    const d = this.flyout(kind, this.hMOf(own.pos.y), own.vel.length());
    _los.copy(t.position).sub(own.pos);
    const range = _los.length();
    _los.divideScalar(Math.max(1, range));
    const tv = velOf(t) || _rel.set(0, 0, 0);
    const away = tv.dot(_los), ts = tv.length();
    let rmax = 0, rne = 0;
    for (let i = 0; i < d.length; i++) {
      const tt = i * 0.25;
      rmax = Math.max(rmax, d[i] - away * tt);
      rne = Math.max(rne, d[i] - ts * tt);
    }
    rmax = Math.min(S.maxR, rmax * 0.85);
    rne = Math.min(rmax, rne * 0.75);
    _rel.copy(tv).sub(own.vel);
    return { rmin: S.minR, rne, rmax, range, closureKt: -_rel.dot(_los) / KT };
  }

  // Gun lead (LCOS): the direction in which rounds fired now will be at the target's range (put the ring on the target)
  lcos(own, t, out = new THREE.Vector3()) {
    const S = STORES.GUN;
    _q.setFromEuler(own.rot);
    const b = _a.set(0, 0, -1).applyQuaternion(_q);
    const w = _b.copy(own.vel).addScaledVector(b, S.mv);
    const v0 = w.length();
    w.divideScalar(v0);
    const R = t.position.distanceTo(own.pos);
    const tv = velOf(t) || _rel.set(0, 0, 0);
    const k = S.k0 * atmosphere(this.hMOf(own.pos.y)).sigma;
    let tof = R / v0;
    for (let i = 0; i < 6; i++) {
      const s = Math.log(1 + k * v0 * tof) / k;           // distance flown by a round with drag in time tof
      out.copy(w).multiplyScalar(s).addScaledVector(tv, -tof);
      out.y -= 0.5 * G * tof * tof;
      const len = out.length();
      tof *= R / Math.max(1, len);
    }
    return out.normalize();
  }

  update(dt, own, radarLock) {
    const targets = this.targets();
    this.stepRounds(dt, targets);
    this.stepMissiles(dt, radarLock, targets);
    this.stepBombs(dt);
    this.stepDecoys(dt);
    const ev = this.events.slice();
    this.events.length = 0;
    return ev;
  }
}
