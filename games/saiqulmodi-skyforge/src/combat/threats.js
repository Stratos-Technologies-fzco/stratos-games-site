// Targets that fight back (fighter upgrade, phase 5, 09-Nov-2026). Everything here joins the weapons range's target
// list (src/combat/phase9), so the radar sees it, the gun, missiles and bombs hit it, and it is destroyed and comes
// back like the other range targets.
//   TGT-AIR-03  drone, medium: weaves and climbs (3 g)
//   TGT-AIR-04  drone, hard: jinks (5 g); when a missile comes for it, it breaks hard and drops flares
//   BANDIT-1/2  enemy fighters: patrol, then turn-fight the player (7 g), fire heat seekers (2 each),
//               defend against missiles with flares and a break turn
//   SAM-SITE-01 radar SAM: tracks inside 20 km, locks inside 12 km, fires (chaff and beaming fool it); the search
//               radar RADAR-SITE-02 feeds it: with that radar destroyed it only sees 10 km
//   SAM-SITE-03 heat-seeking SAM: no warning until it fires (inside 5 km, below 3,000 m)
//   TRUCK-1..3  a convoy driving round the range
// RWR: every emitter looking at the player (S = SAM, F = fighter) with search / track / lock, and M for each missile
// coming at the player. Threats only engage the fighter, in the air, with threats switched on.
import * as THREE from 'three';

const G = 9.81;
const DEG = Math.PI / 180;
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _z = new THREE.Vector3(0, 0, 1);
const UP = new THREE.Vector3(0, 1, 0);

function jetMesh(body, accent) {
  const g = new THREE.Group();
  const mb = new THREE.MeshStandardMaterial({ color: body, roughness: 0.5, metalness: 0.25, flatShading: true });
  const ma = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.6 });
  const fus = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.8, 11, 8), mb);
  fus.rotation.x = Math.PI / 2;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.55, 3, 8), mb);
  nose.rotation.x = Math.PI / 2; nose.position.z = 7;
  const shape = new THREE.Shape();
  shape.moveTo(0, 3); shape.lineTo(4.6, -2.2); shape.lineTo(4.6, -3.2); shape.lineTo(-4.6, -3.2); shape.lineTo(-4.6, -2.2); shape.closePath();
  const wg = new THREE.ShapeGeometry(shape);
  wg.rotateX(-Math.PI / 2);
  const wing = new THREE.Mesh(wg, mb);
  wing.material.side = THREE.DoubleSide;
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.4, 2.2), ma);
  fin.position.set(0, 1.4, -4.2);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 1.4), mb);
  tail.position.set(0, 0, -4.8);
  g.add(fus, nose, wing, fin, tail);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function droneMesh(color) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.45 });
  const w = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 7, 10), m);
  body.rotation.x = Math.PI / 2;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 10), m);
  nose.rotation.x = Math.PI / 2; nose.position.z = 4.6;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(7, 0.15, 2.2), w);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 1.4), w);
  fin.position.set(0, 0.9, -3);
  g.add(body, nose, wing, fin);
  return g;
}
function truckMesh() {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0x55603a, roughness: 0.85 });
  const c = new THREE.MeshStandardMaterial({ color: 0x3d4529, roughness: 0.85 });
  const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 5), m);
  bed.position.set(0, 1.6, -0.8);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2, 1.8), c);
  cab.position.set(0, 1.4, 2.6);
  g.add(bed, cab);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function launcherMesh(color) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 4), m);
  base.position.y = 3.5;
  g.add(base);
  for (const x of [-1, 1]) {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 6, 8), m);
    tube.rotation.x = Math.PI / 2 - 0.6; tube.position.set(x, 5.5, 0);
    g.add(tube);
  }
  return g;
}

// Point-mass flying: turn the velocity towards a wanted direction at no more than maxG, ease the speed
function steer(t, dt, want, speedGoal, maxG, groundY) {
  const v = Math.max(50, t.velocity.length());
  _a.copy(t.velocity).divideScalar(v);
  _b.copy(want).normalize();
  // stay above the ground
  const floor = groundY(t.position.x, t.position.z) + 300;
  if (t.position.y < floor) _b.y = Math.max(_b.y, 0.5 * Math.min(1, (floor - t.position.y) / 200 + 0.3));
  _b.normalize();
  const ang = Math.acos(Math.max(-1, Math.min(1, _a.dot(_b))));
  const maxRate = maxG * G / v;
  const turn = Math.min(ang, maxRate * dt);
  if (ang > 1e-4) {
    _c.crossVectors(_a, _b);
    if (_c.lengthSq() < 1e-10) _c.set(0, 1, 0);
    _a.applyAxisAngle(_c.normalize(), turn);
  }
  const vNew = v + Math.max(-20 * dt, Math.min(15 * dt, speedGoal - v));
  t.velocity.copy(_a).multiplyScalar(vNew);
  t.loadG = Math.sqrt(1 + (turn / Math.max(dt, 1e-4) * v / G) ** 2);
  t.position.addScaledVector(t.velocity, dt);
  t.mesh.position.copy(t.position);
  t.mesh.quaternion.setFromUnitVectors(_z, _a);
  // bank into the turn (looks right)
  if (t.lastDir) {
    const side = _c.copy(t.lastDir).cross(_a).y;
    t.bank = (t.bank || 0) + (Math.max(-1.3, Math.min(1.3, -side / Math.max(dt, 1e-4) * v / G * 0.25)) - (t.bank || 0)) * Math.min(1, dt * 3);
    t.mesh.rotateZ(t.bank);
  }
  t.lastDir = (t.lastDir || new THREE.Vector3()).copy(_a);
}

export class ThreatManager {
  // opts: { targets (the range's target array), groundY(x, z), weapons (FighterWeapons), fx, own (the player's target
  //         record: position, velocity, health ...), isActive() -> threats may engage now }
  constructor(scene, opts) {
    this.scene = scene;
    this.list = opts.targets;
    this.groundY = opts.groundY || (() => 0);
    this.weapons = opts.weapons;
    this.own = opts.own;
    this.isActive = opts.isActive || (() => true);
    this.rwr = [];
    this.events = [];
    this.ai = [];
    const add = (t) => { this.list.push(t); this.ai.push(t); return t; };
    const mk = (id, type, mesh, pos, extra) => {
      mesh.position.copy(pos);
      scene.add(mesh);
      return add(Object.assign({ id, type, ai: true, mesh, position: mesh.position, velocity: new THREE.Vector3(), hitRadius: 8,
        health: 100, maxHealth: 100, isDestroyed: false, home: pos.clone(), loadG: 1 }, extra));
    };
    // drones
    mk('TGT-AIR-03', 'AIR', droneMesh(0xf2c12e), new THREE.Vector3(3000, 2500, -16000), { kind: 'weaver', speed: 200, maxG: 3 });
    mk('TGT-AIR-04', 'AIR', droneMesh(0xd7262e), new THREE.Vector3(-6000, 3200, -14000), { kind: 'jinker', speed: 230, maxG: 5, flares: 12 });
    // enemy fighters
    mk('BANDIT-1', 'AIR', jetMesh(0x4b5058, 0xb91c1c), new THREE.Vector3(12000, 4000, -38000), { kind: 'bandit', speed: 250, maxG: 7, hitRadius: 9, missiles: 2, flares: 12 });
    mk('BANDIT-2', 'AIR', jetMesh(0x4b5058, 0xb91c1c), new THREE.Vector3(-12000, 4600, -40000), { kind: 'bandit', speed: 250, maxG: 7, hitRadius: 9, missiles: 2, flares: 12 });
    // ground: trucks, the heat-seeking SAM; the radar SAM and search radar are the range's existing sites
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Vector3(-1500 + 600, 0, -23500);
      p.y = this.groundY(p.x, p.z);
      mk(`TRUCK-${i + 1}`, 'GROUND', truckMesh(), p, { kind: 'truck', health: 60, maxHealth: 60, hitRadius: 6, loopA: -i * 0.06 });
    }
    {
      const p = new THREE.Vector3(1800, 0, -26000);
      p.y = this.groundY(p.x, p.z) + 1;
      const m = launcherMesh(0x6b6f5a);
      mk('SAM-SITE-03', 'GROUND', m, p, { kind: 'irsam', health: 150, maxHealth: 150, hitRadius: 12, missiles: 2, reload: 0 });
    }
    this.sam = this.list.find((t) => t.id === 'SAM-SITE-01') || null;
    this.searchRadar = this.list.find((t) => t.id === 'RADAR-SITE-02') || null;
    if (this.sam) {
      this.sam.mesh.add(launcherMesh(0x5b5f4c));
      Object.assign(this.sam, { missiles: 2, reload: 0, lockT: 0, lastShot: -99 });
    }
    if (this.searchRadar) {
      const dish = new THREE.Mesh(new THREE.BoxGeometry(7, 2.5, 0.3), new THREE.MeshStandardMaterial({ color: 0xc9ccc4, roughness: 0.6 }));
      dish.position.y = 6;
      this.searchRadar.mesh.add(dish);
      this.dish = dish;
    }
    this.time = 0;
    this.reset();
  }

  // the player's new start: everything back to its patrol
  reset() {
    for (const t of this.ai) this.respawn(t);
    if (this.sam) { this.sam.missiles = 2; this.sam.reload = 0; this.sam.lockT = 0; }
    this.rwr = [];
  }
  respawn(t) {
    t.position.copy(t.home);
    t.health = t.maxHealth;
    t.isDestroyed = false;
    t.respawnIn = undefined;
    t.mesh.visible = true;
    t.state = 'patrol';
    t.timer = 0;
    t.cool = 6;
    t.flareT = 0;
    if (t.kind === 'bandit') { t.missiles = 2; t.flares = 12; }
    if (t.kind === 'jinker') t.flares = 12;
    if (t.kind === 'irsam') { t.missiles = 2; t.reload = 0; }
    const h = Math.random() * Math.PI * 2;
    t.velocity.set(Math.sin(h), 0, Math.cos(h)).multiplyScalar(t.speed || 0);
    t.mesh.position.copy(t.position);
    t.wasDown = false;
  }

  // the player's missile chasing t (closest), or null
  incoming(t) {
    let best = null, bd = Infinity;
    for (const m of this.weapons.missiles) {
      if (m.owner !== 'own' || m.target !== t) continue;
      const d = m.pos.distanceTo(t.position);
      if (d < bd) { bd = d; best = m; }
    }
    return best ? { m: best, d: bd } : null;
  }

  // ownState: { pos, vel, rot, onGround }
  update(dt, ownState) {
    this.time += dt;
    this.events.length = 0;
    this.rwr.length = 0;
    const active = this.isActive() && !ownState.onGround;
    const own = this.own;
    if (this.dish && !this.searchRadar.isDestroyed) this.dish.rotation.y += dt * 1.5;
    for (const t of this.ai) {
      if (t.isDestroyed) { t.wasDown = true; continue; }
      if (t.wasDown) this.respawn(t);   // the range brought it back
      if (t.type === 'AIR') this.fly(t, dt, ownState, active);
      else if (t.kind === 'truck') this.drive(t, dt);
      else if (t.kind === 'irsam') this.irSam(t, dt, ownState, active);
    }
    if (this.sam && !this.sam.isDestroyed) this.radarSam(this.sam, dt, ownState, active);
    // missiles coming at the player
    for (const m of this.weapons.missiles) {
      if (m.owner === 'enemy' && m.target === own) this.addRwr('M', m.pos, ownState, 'launch');
    }
    return { rwr: this.rwr, events: this.events };
  }

  addRwr(kind, pos, ownState, level) {
    _q.setFromEuler(ownState.rot).invert();
    _a.copy(pos).sub(ownState.pos).applyQuaternion(_q);
    this.rwr.push({ kind, az: Math.atan2(_a.x, -_a.z) / DEG, level, range: _a.length() });
  }

  los(a, b) {
    for (let k = 1; k <= 7; k++) {
      const f = k / 8;
      const x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f, z = a.z + (b.z - a.z) * f;
      if (y < this.groundY(x, z) - 2) return false;
    }
    return true;
  }

  fly(t, dt, ownState, active) {
    t.timer -= dt;
    t.cool -= dt;
    t.flareT -= dt;
    const want = _c.set(0, 0, 0);
    let speed = t.speed;
    const threat = this.incoming(t);
    // defend: a missile inside 4-5 km -> break across its line of sight, flares in pairs
    if (threat && threat.d < (t.kind === 'bandit' ? 5000 : 4000) && t.kind !== 'weaver') {
      _a.copy(t.position).sub(threat.m.pos).normalize();
      want.crossVectors(_a, UP).normalize();
      if (want.dot(t.velocity) < 0) want.negate();
      if (t.flares > 0 && t.flareT <= 0) {
        t.flareT = 0.8;
        t.flares -= 2;
        this.weapons.releaseDecoys('FLARE', { pos: t.position, vel: t.velocity, rot: new THREE.Euler(0, Math.atan2(-t.velocity.x, -t.velocity.z), 0, 'YXZ') }, t, false);
      }
      steer(t, dt, want, speed + 30, t.maxG + 1, this.groundY);
      return;
    }
    const toOwn = _b.copy(ownState.pos).sub(t.position);
    const range = toOwn.length();
    if (t.kind === 'bandit' && active && range < 22000) {
      t.state = 'engage';
      // lead pursuit
      const tgo = Math.min(4, range / 400);
      want.copy(ownState.pos).addScaledVector(ownState.vel, tgo).sub(t.position);
      speed = 270;
      const off = t.velocity.angleTo(toOwn) / DEG;
      // its radar: tracks inside 20 km, locks when the nose is on inside 10 km
      this.addRwr('F', t.position, ownState, range < 10000 && off < 30 ? 'lock' : 'track');
      if (t.missiles > 0 && t.cool <= 0 && range > 1200 && range < 7000 && off < 20 && this.los(t.position, ownState.pos)) {
        t.missiles--;
        t.cool = 12;
        _a.copy(t.velocity).normalize();
        this.weapons.launchFrom('IR', _b.copy(t.position).addScaledVector(_a, 8), t.velocity, this.own, t);
      }
      steer(t, dt, want, speed, t.maxG, this.groundY);
      return;
    }
    // patrol / drone patterns around home
    t.state = 'patrol';
    if (t.timer <= 0) {
      t.timer = t.kind === 'jinker' ? 4 + Math.random() * 3 : 10 + Math.random() * 6;
      const h = Math.atan2(t.velocity.x, t.velocity.z) + (Math.random() - 0.5) * (t.kind === 'jinker' ? 2.4 : 1.6);
      t.goalDir = new THREE.Vector3(Math.sin(h), (Math.random() - 0.5) * 0.25, Math.cos(h));
    }
    want.copy(t.goalDir || t.velocity);
    // stay within 12 km of home and between 1,500 and 5,000 m
    _a.copy(t.home).sub(t.position);
    if (Math.hypot(_a.x, _a.z) > 12000) want.add(_a.setY(0).normalize().multiplyScalar(1.5));
    if (t.position.y < 1500) want.y = Math.abs(want.y) + 0.2;
    if (t.position.y > 5000) want.y = -Math.abs(want.y) - 0.2;
    steer(t, dt, want, speed, t.maxG, this.groundY);
  }

  drive(t, dt) {
    // a 600 m circle round the convoy's centre at 12 m/s
    t.loopA += dt * 12 / 600;
    const cx = -1500, cz = -23500;
    const x = cx + Math.cos(t.loopA) * 600, z = cz + Math.sin(t.loopA) * 600;
    t.velocity.set(-Math.sin(t.loopA) * 12, 0, Math.cos(t.loopA) * 12);
    t.position.set(x, this.groundY(x, z), z);
    t.mesh.position.copy(t.position);
    t.mesh.rotation.y = Math.atan2(t.velocity.x, t.velocity.z);
  }

  radarSam(s, dt, ownState, active) {
    s.reload = Math.max(0, s.reload - dt);
    if (s.missiles < 2 && s.reload <= 0) { s.missiles++; s.reload = s.missiles < 2 ? 20 : 0; }
    if (!active) { s.lockT = 0; return; }
    const range = s.position.distanceTo(ownState.pos);
    const agl = ownState.pos.y - this.groundY(ownState.pos.x, ownState.pos.z);
    const see = (this.searchRadar && !this.searchRadar.isDestroyed) ? 20000 : 10000;
    if (range > see || agl < 100 || !this.los(_a.copy(s.position).setY(s.position.y + 6), ownState.pos)) { s.lockT = 0; return; }
    const lockRange = Math.min(12000, see);
    if (range > lockRange) { s.lockT = 0; this.addRwr('S', s.position, ownState, 'track'); return; }
    s.lockT += dt;
    this.addRwr('S', s.position, ownState, 'lock');
    if (s.lockT > 3 && s.missiles > 0 && this.time - s.lastShot > 6) {
      s.missiles--;
      if (s.reload <= 0) s.reload = 20;
      s.lastShot = this.time;
      const from = _a.copy(s.position).setY(s.position.y + 7);
      _b.copy(ownState.pos).sub(from).normalize().addScaledVector(UP, 0.4).normalize().multiplyScalar(60);
      this.weapons.launchFrom('SAM', from, _b, this.own, s);
    }
  }

  irSam(s, dt, ownState, active) {
    s.reload = Math.max(0, s.reload - dt);
    if (s.missiles < 2 && s.reload <= 0) { s.missiles++; s.reload = 25; }
    if (!active || s.missiles <= 0 || s.reload > 15) return;
    const range = s.position.distanceTo(ownState.pos);
    if (range > 5000 || ownState.pos.y - s.position.y > 3000) return;
    if (!this.los(_a.copy(s.position).setY(s.position.y + 6), ownState.pos)) return;
    s.missiles--;
    s.reload = 25;
    const from = _a.copy(s.position).setY(s.position.y + 6);
    _b.copy(ownState.pos).sub(from).normalize().multiplyScalar(60);
    this.weapons.launchFrom('IR', from, _b, this.own, s);
  }
}
