// The skeleton as flat arrays, plus forward kinematics. Everything the animator does (blending, aim twist, IK) happens on these arrays;
// the result is written to the three.js bones once per update. Root space: +Y up, +Z forward, +X is the character's LEFT (the right hand is at -X).
import * as THREE from 'three';

type Q = Float32Array | Float64Array;
export function qmul(o: Q, oi: number, a: Q, ai: number, b: Q, bi: number) {
  const ax = a[ai], ay = a[ai + 1], az = a[ai + 2], aw = a[ai + 3], bx = b[bi], by = b[bi + 1], bz = b[bi + 2], bw = b[bi + 3];
  o[oi] = aw * bx + ax * bw + ay * bz - az * by; o[oi + 1] = aw * by - ax * bz + ay * bw + az * bx; o[oi + 2] = aw * bz + ax * by - ay * bx + az * bw; o[oi + 3] = aw * bw - ax * bx - ay * by - az * bz;
}
export function qnorm(q: Q, i: number) { const l = Math.hypot(q[i], q[i + 1], q[i + 2], q[i + 3]) || 1; q[i] /= l; q[i + 1] /= l; q[i + 2] /= l; q[i + 3] /= l; }
export function qaxis(o: Q, oi: number, ax: number, ay: number, az: number, angle: number) { const s = Math.sin(angle / 2); o[oi] = ax * s; o[oi + 1] = ay * s; o[oi + 2] = az * s; o[oi + 3] = Math.cos(angle / 2); }
/** o = a * v (rotates vector v by quaternion a) */
export function qrot(o: Float64Array | number[], q: Q, qi: number, x: number, y: number, z: number) {
  const qx = q[qi], qy = q[qi + 1], qz = q[qi + 2], qw = q[qi + 3];
  const tx = 2 * (qy * z - qz * y), ty = 2 * (qz * x - qx * z), tz = 2 * (qx * y - qy * x);
  o[0] = x + qw * tx + (qy * tz - qz * ty); o[1] = y + qw * ty + (qz * tx - qx * tz); o[2] = z + qw * tz + (qx * ty - qy * tx);
}

export class Rig {
  readonly n: number; readonly names: string[]; readonly parent: Int16Array; readonly restQ: Float32Array; readonly restP: Float32Array; readonly idx = new Map<string, number>();
  /** world rotation / position of every bone in root space, valid after fk() */
  readonly wq: Float64Array; readonly wp: Float64Array;
  readonly upper: Uint8Array; // 1 for spine_01 and everything below it in the hierarchy (the weapon layer's mask)
  constructor(bones: THREE.Bone[]) {
    this.n = bones.length; this.names = bones.map((b) => b.name); this.names.forEach((nm, i) => this.idx.set(nm, i));
    this.parent = new Int16Array(this.n).fill(-1); this.restQ = new Float32Array(this.n * 4); this.restP = new Float32Array(this.n * 3); this.wq = new Float64Array(this.n * 4); this.wp = new Float64Array(this.n * 3);
    bones.forEach((b, i) => { this.parent[i] = bones.indexOf(b.parent as THREE.Bone); b.quaternion.toArray(this.restQ, i * 4); b.position.toArray(this.restP, i * 3); });
    for (let i = 0; i < this.n; i++) if (this.parent[i] >= i) throw new Error('rig: bones must be listed parent first');
    this.upper = new Uint8Array(this.n); const s1 = this.idx.get('spine_01')!; for (let i = 0; i < this.n; i++) { let p = i; while (p >= 0 && p !== s1) p = this.parent[p]; this.upper[i] = p === s1 ? 1 : 0; }
  }
  i(name: string): number { const v = this.idx.get(name); if (v === undefined) throw new Error('rig: no bone ' + name); return v; }
  /** Forward kinematics from local rotations lq and the pelvis position (the only animated translation). */
  fk(lq: Q, hip: ArrayLike<number>, pelvis: number) {
    const { n, parent, restP, wq, wp } = this;
    for (let b = 0; b < n; b++) {
      const p = parent[b], b4 = b * 4, b3 = b * 3;
      if (p < 0) { wq[b4] = lq[b4]; wq[b4 + 1] = lq[b4 + 1]; wq[b4 + 2] = lq[b4 + 2]; wq[b4 + 3] = lq[b4 + 3]; wp[b3] = restP[b3]; wp[b3 + 1] = restP[b3 + 1]; wp[b3 + 2] = restP[b3 + 2]; continue; }
      const p4 = p * 4, ax = wq[p4], ay = wq[p4 + 1], az = wq[p4 + 2], aw = wq[p4 + 3], bx = lq[b4], by = lq[b4 + 1], bz = lq[b4 + 2], bw = lq[b4 + 3];
      wq[b4] = aw * bx + ax * bw + ay * bz - az * by; wq[b4 + 1] = aw * by - ax * bz + ay * bw + az * bx; wq[b4 + 2] = aw * bz + ax * by - ay * bx + az * bw; wq[b4 + 3] = aw * bw - ax * bx - ay * by - az * bz;
      const x = b === pelvis ? hip[0] : restP[b3], y = b === pelvis ? hip[1] : restP[b3 + 1], z = b === pelvis ? hip[2] : restP[b3 + 2];
      const tx = 2 * (ay * z - az * y), ty = 2 * (az * x - ax * z), tz = 2 * (ax * y - ay * x);
      wp[b3] = wp[p * 3] + x + aw * tx + (ay * tz - az * ty); wp[b3 + 1] = wp[p * 3 + 1] + y + aw * ty + (az * tx - ax * tz); wp[b3 + 2] = wp[p * 3 + 2] + z + aw * tz + (ax * ty - ay * tx);
    }
  }
  /** Brings the world rotation of bone b (and of its ancestors) up to date from the local rotations, without touching positions. */
  private refresh(lq: Q, b: number) {
    const chain = this.chain; let k = 0; for (let i = b; i >= 0; i = this.parent[i]) chain[k++] = i;
    for (let j = k - 1; j >= 0; j--) { const i = chain[j], p = this.parent[i]; if (p < 0) { for (let m = 0; m < 4; m++) this.wq[i * 4 + m] = lq[i * 4 + m]; } else qmul(this.wq, i * 4, this.wq, p * 4, lq, i * 4); }
  }
  private chain = new Int16Array(80); private sa = new Float64Array(12);
  /** Rotates bone b by an angle about a ROOT-space axis, updating its local rotation. Children follow after the next fk(). Safe to call repeatedly in parent-first order without an fk() in between. */
  rotateRoot(lq: Q, b: number, ax: number, ay: number, az: number, angle: number) {
    if (angle === 0) return; this.refresh(lq, b); const t = this.sa; qaxis(t, 0, ax, ay, az, angle);
    qmul(t, 4, t, 0, this.wq, b * 4); const p = this.parent[b]; for (let k = 0; k < 4; k++) this.wq[b * 4 + k] = t[4 + k];
    if (p < 0) { for (let k = 0; k < 4; k++) lq[b * 4 + k] = t[4 + k]; return; }
    t[8] = -this.wq[p * 4]; t[9] = -this.wq[p * 4 + 1]; t[10] = -this.wq[p * 4 + 2]; t[11] = this.wq[p * 4 + 3];
    qmul(t, 0, t, 8, t, 4); qnorm(t, 0); for (let k = 0; k < 4; k++) lq[b * 4 + k] = t[k];
  }
  /** Sets bone b so that its world rotation becomes q (root space). */
  setWorld(lq: Q, b: number, q: Float64Array | number[]) {
    this.refresh(lq, this.parent[b] >= 0 ? this.parent[b] : b); const p = this.parent[b]; const t = this.sa; for (let k = 0; k < 4; k++) { t[4 + k] = q[k]; this.wq[b * 4 + k] = q[k]; }
    if (p < 0) { for (let k = 0; k < 4; k++) lq[b * 4 + k] = t[4 + k]; return; }
    t[8] = -this.wq[p * 4]; t[9] = -this.wq[p * 4 + 1]; t[10] = -this.wq[p * 4 + 2]; t[11] = this.wq[p * 4 + 3];
    qmul(t, 0, t, 8, t, 4); qnorm(t, 0); for (let k = 0; k < 4; k++) lq[b * 4 + k] = t[k];
  }
}
