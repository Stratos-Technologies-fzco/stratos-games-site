// Animation clips as plain baked arrays: every bone's rotation (and the pelvis position) at 30 frames a second.
// The animator samples these itself, so it can play clips forward or reversed, turn the hips of a clip (strafe cells), and mix layers per bone.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import clipInfo from '../../shared/clip_info.json';
import type { Rig } from './rig';

export interface BakedClip { name: string; duration: number; frames: number; q: Float32Array; hip: Float32Array; rootSpeed: number }
const FPS = 30;

export function bakeClip(clip: THREE.AnimationClip, rig: Rig): BakedClip {
  const frames = Math.max(2, Math.round(clip.duration * FPS) + 1); const q = new Float32Array(frames * rig.n * 4); const hip = new Float32Array(frames * 3);
  for (let f = 0; f < frames; f++) for (let b = 0; b < rig.n; b++) q.set(rig.restQ.subarray(b * 4, b * 4 + 4), (f * rig.n + b) * 4);
  const pelvis = rig.i('pelvis'); for (let f = 0; f < frames; f++) hip.set(rig.restP.subarray(pelvis * 3, pelvis * 3 + 3), f * 3);
  for (const tr of clip.tracks) {
    const dot = tr.name.lastIndexOf('.'); const bone = rig.idx.get(tr.name.slice(0, dot)); const prop = tr.name.slice(dot + 1); if (bone === undefined) continue;
    const it = (tr as unknown as { createInterpolant(): { evaluate(t: number): ArrayLike<number> } }).createInterpolant(); const size = tr.getValueSize();
    for (let f = 0; f < frames; f++) {
      const t = Math.min(clip.duration, f / FPS); const v = it.evaluate(t);
      if (prop === 'quaternion' && size === 4) { const o = (f * rig.n + bone) * 4; q[o] = v[0]; q[o + 1] = v[1]; q[o + 2] = v[2]; q[o + 3] = v[3]; }
      else if (prop === 'position' && bone === pelvis) { hip[f * 3] = v[0]; hip[f * 3 + 1] = v[1]; hip[f * 3 + 2] = v[2]; }
    }
  }
  const info = (clipInfo as Record<string, { rootSpeed: number }>)[clip.name];
  return { name: clip.name, duration: clip.duration, frames, q, hip, rootSpeed: info?.rootSpeed ?? 0 };
}

/** Writes the clip's pose at `time` seconds into out (n*4 rotations) and hip (3). reverse plays it backwards; loop wraps, otherwise it holds the last frame. */
export function sampleClip(c: BakedClip, rig: Rig, time: number, loop: boolean, reverse: boolean, out: Float32Array, hip: Float32Array) {
  let t = loop ? ((time % c.duration) + c.duration) % c.duration : Math.min(Math.max(time, 0), c.duration); if (reverse) t = c.duration - t;
  const fp = Math.min(t * FPS, c.frames - 1); const f0 = Math.floor(fp), f1 = Math.min(c.frames - 1, f0 + 1), k = fp - f0; const n4 = rig.n * 4;
  const a = f0 * n4, b = f1 * n4;
  for (let i = 0; i < n4; i += 4) {
    const dotp = c.q[a + i] * c.q[b + i] + c.q[a + i + 1] * c.q[b + i + 1] + c.q[a + i + 2] * c.q[b + i + 2] + c.q[a + i + 3] * c.q[b + i + 3]; const s = dotp < 0 ? -k : k;
    let x = c.q[a + i] * (1 - k) + c.q[b + i] * s, y = c.q[a + i + 1] * (1 - k) + c.q[b + i + 1] * s, z = c.q[a + i + 2] * (1 - k) + c.q[b + i + 2] * s, w = c.q[a + i + 3] * (1 - k) + c.q[b + i + 3] * s;
    const l = Math.hypot(x, y, z, w) || 1; out[i] = x / l; out[i + 1] = y / l; out[i + 2] = z / l; out[i + 3] = w / l;
  }
  for (let i = 0; i < 3; i++) hip[i] = c.hip[f0 * 3 + i] * (1 - k) + c.hip[f1 * 3 + i] * k;
}

export class ClipBank {
  clips = new Map<string, BakedClip>();
  constructor(readonly rig: Rig, raw: THREE.AnimationClip[]) { for (const c of raw) this.clips.set(c.name, bakeClip(c, rig)); }
  get(name: string): BakedClip { const c = this.clips.get(name); if (!c) throw new Error('missing clip ' + name); return c; }
}
let rawPromise: Promise<THREE.AnimationClip[]> | null = null;
export function loadRawClips(): Promise<THREE.AnimationClip[]> { return rawPromise ??= new GLTFLoader().loadAsync('models/Animations/humanoid_anims.glb').then((g) => g.animations); }
