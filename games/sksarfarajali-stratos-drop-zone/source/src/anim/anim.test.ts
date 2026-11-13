import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CELLS, directionWeights, pitchWeights, speedWeights, strideRate, SPEED_STOPS } from './blend';
import { FacingState, newFacing, stepFacing, wrap } from './facing';
import { solveTwoBone } from './ik';

const D = Math.PI / 180;
describe('blend space', () => {
  it('the 8 direction weights always sum to 1, for every angle', () => {
    for (let deg = -540; deg <= 540; deg += 7) { const w = directionWeights(deg * D); expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6); expect(Math.max(...w)).toBeLessThanOrEqual(1); expect(Math.min(...w)).toBeGreaterThanOrEqual(0); }
  });
  it('each exact direction picks exactly its own cell', () => {
    CELLS.forEach((c, i) => { const w = directionWeights(((c.angle + 180) % 360 - 180) * D); expect(w[i]).toBeCloseTo(1, 6); });
  });
  it('a quarter-way angle shares weight between the two neighbours', () => { const w = directionWeights(22.5 * D); expect(w[0]).toBeCloseTo(0.5, 6); expect(w[1]).toBeCloseTo(0.5, 6); });
  it('backward cells play the clip reversed, forward and sideways cells do not', () => { expect(CELLS.filter((c) => c.reverse).map((c) => c.name)).toEqual(['back_right', 'back', 'back_left']); });
  it('speed weights sum to 1 and follow the real speed', () => {
    for (let s = 0; s <= 10; s += 0.25) expect(speedWeights(s).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
    expect(speedWeights(0)[0]).toBe(1); expect(speedWeights(SPEED_STOPS[2])[2]).toBeCloseTo(1, 6); expect(speedWeights(20)[3]).toBe(1);
  });
  it('the game speeds play a single clip each, so two different gaits are never mixed while running', () => {
    expect(speedWeights(4.5)[2]).toBe(1); expect(speedWeights(6.5)[3]).toBe(1); expect(speedWeights(1)[1]).toBe(1);
    const w = speedWeights(2.5); expect(w[1]).toBeGreaterThan(0.2); expect(w[2]).toBeGreaterThan(0.2); // slow movement (crouch walk) is the gap, so it blends
  });
  it('stride rate stays inside the 0.8 - 1.2 warp range and is 1 when the speed matches a clip', () => {
    for (let s = 0.5; s <= 9; s += 0.1) { const r = strideRate(s, speedWeights(s)); expect(r).toBeGreaterThanOrEqual(0.8); expect(r).toBeLessThanOrEqual(1.2); }
    expect(strideRate(SPEED_STOPS[2], speedWeights(SPEED_STOPS[2]))).toBeCloseTo(1, 2); expect(strideRate(4.5, speedWeights(4.5))).toBeCloseTo(4.5 / 5.357, 3); // the game's walk speed is the jog loop at x0.84
  });
  it('pitch weights sum to 1 and clamp at 70 degrees', () => { for (let p = -100; p <= 100; p += 5) expect(pitchWeights(p * D).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6); expect(pitchWeights(90 * D)[2]).toBe(1); });
});

const step = (s: FacingState, o: Partial<Parameters<typeof stepFacing>[1]>, dt = 1 / 60) => stepFacing(s, { aimYaw: 0, moveYaw: 0, speed: 0, aiming: false, firing: false, armed: true, dt, ...o });
describe('facing rules', () => {
  it('not aiming: the body turns toward the movement direction at 540 deg/s, not instantly', () => {
    const s = newFacing(0); step(s, { moveYaw: 120 * D, aimYaw: -90 * D, speed: 4.5 });
    expect(s.bodyYaw / D).toBeCloseTo(9, 3); // 540 * (1/60)
    for (let i = 0; i < 60; i++) step(s, { moveYaw: 120 * D, aimYaw: -90 * D, speed: 4.5 }); expect(s.bodyYaw / D).toBeCloseTo(120, 3);
  });
  it('aiming: the body faces the camera, smoothly, and the legs keep their own travel direction', () => {
    const s = newFacing(0); const twist = step(s, { moveYaw: 90 * D, aimYaw: 90 * D, speed: 4.5, aiming: true });
    expect(s.bodyYaw / D).toBeCloseTo(9, 3); expect(twist / D).toBeCloseTo(81, 3);
    for (let i = 0; i < 60; i++) step(s, { moveYaw: 0, aimYaw: 90 * D, speed: 4.5, aiming: true }); expect(s.bodyYaw / D).toBeCloseTo(90, 3);
  });
  it('turns the short way round through 180 degrees', () => { const s = newFacing(170 * D); step(s, { moveYaw: -170 * D, speed: 4, armed: false }); expect(s.bodyYaw / D).toBeGreaterThan(170); });
  it('standing still: the upper body follows the camera up to 60 degrees and the feet do not move', () => {
    const s = newFacing(0); const twist = step(s, { aimYaw: 50 * D }); expect(s.bodyYaw).toBe(0); expect(twist / D).toBeCloseTo(50, 3); expect(s.turning).toBe(0);
  });
  it('standing still beyond 60 degrees: the feet step round until the offset is small', () => {
    const s = newFacing(0); step(s, { aimYaw: 100 * D }); expect(s.turning).toBe(1);
    let frames = 0; while (s.turning !== 0 && frames < 600) { step(s, { aimYaw: 100 * D }); frames++; }
    expect(Math.abs(wrap(100 * D - s.bodyYaw)) / D).toBeLessThan(9); expect(frames).toBeGreaterThan(10); // a stepping turn, not a snap
  });
  it('standing still and unarmed: the camera is free, the body stays put', () => { const s = newFacing(0); const t = step(s, { aimYaw: 150 * D, armed: false }); expect(s.bodyYaw).toBe(0); expect(t).toBe(0); });
  it('reports angular velocity for the lean into turns', () => { const s = newFacing(0); step(s, { moveYaw: 90 * D, speed: 4 }); expect(s.angVel / D).toBeCloseTo(540, 1); });
});

describe('two-bone IK', () => {
  const A = new THREE.Vector3(0, 1, 0), B = new THREE.Vector3(0, 0.5, 0.1), C = new THREE.Vector3(0, 0, 0);
  const l1 = A.distanceTo(B), l2 = B.distanceTo(C);
  it('keeps both bone lengths and puts the end on a reachable target', () => {
    const t = new THREE.Vector3(0.2, 0.3, 0.3); const r = solveTwoBone(A, B, C, t, new THREE.Vector3(0, 0, 1));
    expect(r.reached).toBe(true); expect(r.end.distanceTo(t)).toBeLessThan(1e-4); expect(A.distanceTo(r.mid)).toBeCloseTo(l1, 4); expect(r.mid.distanceTo(r.end)).toBeCloseTo(l2, 4);
  });
  it('bends the middle joint toward the pole', () => {
    const t = new THREE.Vector3(0.1, 0.2, 0.2);
    const fwd = solveTwoBone(A, B, C, t, new THREE.Vector3(0, 0, 1)).mid.clone(), back = solveTwoBone(A, B, C, t, new THREE.Vector3(0, 0, -1)).mid.clone();
    expect(fwd.z).toBeGreaterThan(back.z); const axis = t.clone().sub(A).normalize(); expect(fwd.clone().sub(A).dot(axis)).toBeCloseTo(back.clone().sub(A).dot(axis), 4);
  });
  it('an unreachable target straightens the limb toward it', () => {
    const t = new THREE.Vector3(0, -3, 0); const r = solveTwoBone(A, B, C, t, new THREE.Vector3(0, 0, 1));
    expect(r.reached).toBe(false); expect(A.distanceTo(r.end)).toBeCloseTo(l1 + l2, 2); expect(r.end.x).toBeCloseTo(0, 4); expect(r.end.y).toBeLessThan(0);
  });
  it('survives a target on top of the root joint', () => { const r = solveTwoBone(A, B, C, A.clone(), new THREE.Vector3(0, 0, 1)); expect(Number.isFinite(r.mid.x + r.mid.y + r.mid.z + r.end.x)).toBe(true); });
});
