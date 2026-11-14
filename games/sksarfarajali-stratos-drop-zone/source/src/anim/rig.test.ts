import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { Rig } from './rig';

/** A small skeleton: root, pelvis, spine_01, spine_02, hand (a chain), plus a thigh off the pelvis. Listed parent first, like the real rig. */
function build() {
  const mk = (name: string, parent: THREE.Bone | null, x: number, y: number, z: number, q?: THREE.Quaternion) => { const b = new THREE.Bone(); b.name = name; b.position.set(x, y, z); if (q) b.quaternion.copy(q); parent?.add(b); return b; };
  const root = mk('root', null, 0, 0, 0), pelvis = mk('pelvis', root, 0, 1, 0), s1 = mk('spine_01', pelvis, 0, 0.12, 0, new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0.4, -0.1))), s2 = mk('spine_02', s1, 0, 0.12, 0.01, new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.3, 0.1, 0.2)));
  const hand = mk('hand', s2, -0.3, 0.1, 0.05, new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, -0.6, 0.3))); const thigh = mk('thigh', pelvis, 0.1, -0.05, 0, new THREE.Quaternion().setFromEuler(new THREE.Euler(0.7, 0, 0.1)));
  const bones = [root, pelvis, s1, s2, hand, thigh]; root.updateMatrixWorld(true); return { bones, rig: new Rig(bones) };
}
const lqOf = (bones: THREE.Bone[]) => { const a = new Float32Array(bones.length * 4); bones.forEach((b, i) => b.quaternion.toArray(a, i * 4)); return a; };

describe('rig forward kinematics', () => {
  it('matches three.js world positions and rotations', () => {
    const { bones, rig } = build(); const lq = lqOf(bones); rig.fk(lq, [0, 1, 0], rig.i('pelvis'));
    bones.forEach((b, i) => { const p = new THREE.Vector3(), q = new THREE.Quaternion(); b.matrixWorld.decompose(p, q, new THREE.Vector3()); expect(Math.hypot(rig.wp[i * 3] - p.x, rig.wp[i * 3 + 1] - p.y, rig.wp[i * 3 + 2] - p.z)).toBeLessThan(1e-5); expect(Math.abs(rig.wq[i * 4] * q.x + rig.wq[i * 4 + 1] * q.y + rig.wq[i * 4 + 2] * q.z + rig.wq[i * 4 + 3] * q.w)).toBeCloseTo(1, 5); });
  });
  it('moves the whole body with the pelvis position', () => {
    const { bones, rig } = build(); const lq = lqOf(bones); rig.fk(lq, [0, 1, 0], 1); const before = rig.wp[4 * 3 + 1]; rig.fk(lq, [0, 0.8, 0], 1); expect(before - rig.wp[4 * 3 + 1]).toBeCloseTo(0.2, 5);
  });
  it('rotateRoot turns a bone by the given angle about a root-space axis', () => {
    const { bones, rig } = build(); const lq = lqOf(bones); rig.fk(lq, [0, 1, 0], 1); const b = rig.i('spine_01'); const q0 = new THREE.Quaternion(rig.wq[b * 4], rig.wq[b * 4 + 1], rig.wq[b * 4 + 2], rig.wq[b * 4 + 3]);
    rig.rotateRoot(lq, b, 0, 1, 0, 0.5); rig.fk(lq, [0, 1, 0], 1); const q1 = new THREE.Quaternion(rig.wq[b * 4], rig.wq[b * 4 + 1], rig.wq[b * 4 + 2], rig.wq[b * 4 + 3]);
    const want = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.5).multiply(q0); expect(Math.abs(q1.dot(want))).toBeCloseTo(1, 5);
  });
  it('several rotations on parents and children in a row, with no fk in between, give the same result as doing fk each time', () => {
    const A = build(), Bld = build(); const lqA = lqOf(A.bones), lqB = lqOf(Bld.bones); A.rig.fk(lqA, [0, 1, 0], 1); Bld.rig.fk(lqB, [0, 1, 0], 1);
    const ops: [string, number, number, number, number][] = [['spine_01', 0, 1, 0, 0.3], ['spine_01', 1, 0, 0, -0.2], ['spine_02', 0, 1, 0, 0.25], ['spine_02', 1, 0, 0, 0.15], ['pelvis', 0, 0, 1, 0.1], ['hand', 0, 1, 0, -0.4]];
    for (const [n, x, y, z, a] of ops) { A.rig.rotateRoot(lqA, A.rig.i(n), x, y, z, a); A.rig.fk(lqA, [0, 1, 0], 1); Bld.rig.rotateRoot(lqB, Bld.rig.i(n), x, y, z, a); }
    A.rig.fk(lqA, [0, 1, 0], 1); Bld.rig.fk(lqB, [0, 1, 0], 1); for (let i = 0; i < A.rig.n * 4; i++) expect(Math.abs(Bld.rig.wq[i] - A.rig.wq[i])).toBeLessThan(1e-5); for (let i = 0; i < A.rig.n * 3; i++) expect(Math.abs(Bld.rig.wp[i] - A.rig.wp[i])).toBeLessThan(1e-5);
  });
  it('setWorld makes the bone point exactly where asked, whatever its parents do', () => {
    const { bones, rig } = build(); const lq = lqOf(bones); rig.fk(lq, [0, 1, 0], 1); rig.rotateRoot(lq, rig.i('spine_01'), 0, 1, 0, 0.7); const want = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, -0.2, 0.9)); const h = rig.i('hand');
    rig.setWorld(lq, h, [want.x, want.y, want.z, want.w]); rig.fk(lq, [0, 1, 0], 1); expect(Math.abs(rig.wq[h * 4] * want.x + rig.wq[h * 4 + 1] * want.y + rig.wq[h * 4 + 2] * want.z + rig.wq[h * 4 + 3] * want.w)).toBeCloseTo(1, 5);
  });
  it('marks the upper body (spine_01 and below it) for the weapon layer', () => { const { rig } = build(); expect(['spine_01', 'spine_02', 'hand'].every((n) => rig.upper[rig.i(n)] === 1)).toBe(true); expect(['root', 'pelvis', 'thigh'].every((n) => rig.upper[rig.i(n)] === 0)).toBe(true); });
});
