// Two-bone inverse kinematics (shoulder-elbow-hand or hip-knee-foot), solved in closed form with positions only.
// The animator turns the returned joint positions into bone rotations.
import * as THREE from 'three';

export interface TwoBoneResult { mid: THREE.Vector3; end: THREE.Vector3; reached: boolean }
const _u = new THREE.Vector3(), _p = new THREE.Vector3();

/** a = root joint, b = middle joint, c = end joint (current pose), target = where the end should be, pole = direction the middle joint should bend toward. */
export function solveTwoBone(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, target: THREE.Vector3, pole: THREE.Vector3, out: TwoBoneResult = { mid: new THREE.Vector3(), end: new THREE.Vector3(), reached: true }): TwoBoneResult {
  const l1 = a.distanceTo(b), l2 = b.distanceTo(c); _u.subVectors(target, a); const dist = _u.length(); if (dist < 1e-6) _u.set(0, -1, 0); else _u.divideScalar(dist);
  const dMax = l1 + l2 - 1e-4, dMin = Math.abs(l1 - l2) + 1e-4; const d = Math.min(dMax, Math.max(dMin, dist)); out.reached = dist <= dMax && dist >= dMin;
  const x = (d * d + l1 * l1 - l2 * l2) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  _p.copy(pole).addScaledVector(_u, -pole.dot(_u)); if (_p.lengthSq() < 1e-8) _p.set(0, 0, 1).addScaledVector(_u, -_u.z); _p.normalize();
  out.mid.copy(a).addScaledVector(_u, x).addScaledVector(_p, h); out.end.copy(a).addScaledVector(_u, d); return out;
}
