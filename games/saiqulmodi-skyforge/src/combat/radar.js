// Fighter radar (fighter upgrade, phase 4, 09-Nov-2026).
// SEARCH: everything inside 40 km and 60 deg either side of the nose that the hills do not hide becomes a contact
// on the radar picture. LOCK (key T): the contact nearest the nose; T again steps to the next one; holding T unlocks.
// The track gives range, closure, the target's speed, heading and aspect. A lock is lost when the target is
// destroyed, or after 2 s outside the radar's view (behind a hill, past 60 deg off the nose or beyond range).
import * as THREE from 'three';

export const RADAR = { rangeM: 40000, gimbalDeg: 60, memoryS: 2 };
const DEG = Math.PI / 180;
const MS_TO_KT = 1.94384;

const _q = new THREE.Quaternion();
const _d = new THREE.Vector3();
const _l = new THREE.Vector3();
const _r = new THREE.Vector3();

const velOf = (t) => t.velocity || t.vel || null;

export class Radar {
  // groundY(x, z) -> terrain height (world y), used to hide what is behind the hills
  constructor(groundY = () => -1e9) {
    this.groundY = groundY;
    this.contacts = [];   // [{ t, range, az (deg, + = right), el (deg), ground }]
    this.lock = null;     // target object
    this.track = null;    // { range, closureKt, tgtKt, tgtHdg, aspectDeg, aspectSide, az, el, dir (world unit vector), inView }
    this.unseen = 0;
    this.events = [];     // 'lost' when a lock drops by itself
  }

  // own: { pos, vel, rot (Euler YXZ) }, targets: [{ id, type, position, velocity, isDestroyed }]
  update(dt, own, targets) {
    this.events.length = 0;
    _q.setFromEuler(own.rot).invert();
    this.contacts.length = 0;
    let lockSeen = false;
    for (const t of targets) {
      if (t.isDestroyed) continue;
      _d.copy(t.position).sub(own.pos);
      const range = _d.length();
      if (range > RADAR.rangeM || range < 1) continue;
      _l.copy(_d).applyQuaternion(_q);            // body frame: x right, y up, -z nose
      const off = Math.acos(Math.max(-1, Math.min(1, -_l.z / range)));
      if (off > RADAR.gimbalDeg * DEG) continue;
      if (this.masked(own.pos, t.position)) continue;
      const c = { t, range, az: Math.atan2(_l.x, -_l.z) / DEG, el: Math.atan2(_l.y, Math.hypot(_l.x, _l.z)) / DEG, off: off / DEG, ground: t.type === 'GROUND' };
      this.contacts.push(c);
      if (t === this.lock) lockSeen = true;
    }
    if (this.lock) {
      if (this.lock.isDestroyed) { this.drop('lost'); }
      else {
        this.unseen = lockSeen ? 0 : this.unseen + dt;
        if (this.unseen > RADAR.memoryS) this.drop('lost');
      }
    }
    this.track = this.lock ? this.trackOf(own, this.lock, lockSeen) : null;
    return this.contacts;
  }

  // true when the hills are in the way between a and b
  masked(a, b) {
    for (let k = 1; k <= 7; k++) {
      const f = k / 8;
      const x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f, z = a.z + (b.z - a.z) * f;
      if (y < this.groundY(x, z) - 2) return true;
    }
    return false;
  }

  trackOf(own, t, inView) {
    _d.copy(t.position).sub(own.pos);
    const range = _d.length();
    const dir = _d.clone().divideScalar(Math.max(1, range));
    const tv = velOf(t) || _r.set(0, 0, 0);
    _r.copy(tv).sub(own.vel);
    const closureKt = -_r.dot(dir) * MS_TO_KT;
    const tgtSpeed = tv.length();
    let tgtHdg = null, aspectDeg = null, aspectSide = '';
    if (tgtSpeed > 5) {
      tgtHdg = ((Math.atan2(tv.x, -tv.z) / DEG) % 360 + 360) % 360;
      // aspect: 0 = we see its tail, 180 = it is coming straight at us; L / R = which side of it we are on
      _l.copy(own.pos).sub(t.position).normalize();
      aspectDeg = 180 - Math.acos(Math.max(-1, Math.min(1, tv.dot(_l) / tgtSpeed))) / DEG;
      aspectSide = (tv.x * _l.z - tv.z * _l.x) > 0 ? 'L' : 'R';
    }
    _l.copy(_d).applyQuaternion(_q);
    return {
      id: t.id, range, closureKt, tgtKt: tgtSpeed * MS_TO_KT, tgtHdg, aspectDeg, aspectSide, dir, inView,
      az: Math.atan2(_l.x, -_l.z) / DEG, el: Math.atan2(_l.y, Math.hypot(_l.x, _l.z)) / DEG, ground: t.type === 'GROUND'
    };
  }

  // T: lock the contact nearest the nose, or step to the next one (by angle off the nose)
  lockNext() {
    if (!this.contacts.length) return null;
    const list = this.contacts.slice().sort((a, b) => a.off - b.off);
    let i = 0;
    if (this.lock) {
      const k = list.findIndex((c) => c.t === this.lock);
      i = k < 0 ? 0 : (k + 1) % list.length;
    }
    this.lock = list[i].t;
    this.unseen = 0;
    return this.lock;
  }

  drop(event) {
    if (this.lock && event) this.events.push(event);
    this.lock = null;
    this.track = null;
    this.unseen = 0;
  }
}
