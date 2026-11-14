// Builds the shared animation file from the CC0 Quaternius "Universal Animation Library" (Standard).
//   node tools/build-animations.ts --ual "<...>/Unreal-Godot"
// Output (committed): public/models/Animations/humanoid_anims.glb, shared/clip_info.json (length and real ground speed of every clip).
// The library's rig uses the same bone names as the character models, so no retargeting is needed. Only the clips the animator uses are kept
// (see src/anim/CharacterAnimator.ts), sampled at 30 fps, as bone rotations (16-bit normalized) plus the pelvis position: that is all the animator reads.
import { mkdirSync, writeFileSync } from 'node:fs';
import { Document, Node, NodeIO } from '@gltf-transform/core';
import { readGlb } from './lib/gltf.ts';

const args = process.argv.slice(2); const dir = args[args.indexOf('--ual') + 1]; if (!dir || !args.includes('--ual')) throw new Error('usage: node tools/build-animations.ts --ual "<Unreal-Godot folder>"');
const KEEP = ['Idle_Loop', 'Crouch_Idle_Loop', 'Walk_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop', 'Jump_Start', 'Jump_Loop', 'Jump_Land', 'Roll', 'Pistol_Idle_Loop', 'Pistol_Aim_Up', 'Pistol_Aim_Neutral', 'Pistol_Aim_Down', 'Pistol_Reload', 'Sword_Idle', 'Sword_Attack', 'PickUp_Table', 'Punch_Cross', 'Dance_Loop', 'Swim_Fwd_Loop', 'Death01'];
const FPS = 30;

const rm = await readGlb(`${dir}/UAL1_Standard_RM.glb`); const src = await readGlb(`${dir}/UAL1_Standard.glb`);
// how far the root moves in each clip (root motion file), to know each loop's real ground speed
const rootDistance = new Map<string, number>();
for (const a of rm.getRoot().listAnimations()) for (const ch of a.listChannels()) if (ch.getTargetPath() === 'translation' && ch.getTargetNode()!.getName() === 'root') { const v = ch.getSampler()!.getOutput()!.getArray()!; const n = v.length / 3; rootDistance.set(a.getName(), Math.hypot(v[(n - 1) * 3] - v[0], v[(n - 1) * 3 + 2] - v[2])); }

// ---- new document with the same skeleton (nodes only, no mesh)
const doc = new Document(); const buf = doc.createBuffer(); const scene = doc.createScene('Scene'); const byName = new Map<string, Node>();
const copy = (n: Node, parent: Node | null) => { const c = doc.createNode(n.getName()).setTranslation(n.getTranslation()).setRotation(n.getRotation()).setScale(n.getScale()); byName.set(n.getName(), c); if (parent) parent.addChild(c); else scene.addChild(c); for (const k of n.listChildren()) copy(k, c); };
for (const n of src.getRoot().listScenes()[0].listChildren()) copy(n, null);

const slerp = (a: number[], b: number[], t: number): number[] => { let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; const s = d < 0 ? -1 : 1; const o = [0, 0, 0, 0]; for (let i = 0; i < 4; i++) o[i] = a[i] * (1 - t) + b[i] * s * t; const l = Math.hypot(o[0], o[1], o[2], o[3]) || 1; return o.map((x) => x / l); };
function sampler(times: ArrayLike<number>, vals: ArrayLike<number>, size: number, t: number): number[] {
  const n = times.length; let i = 0; if (t >= times[n - 1]) i = n - 2; else while (i < n - 2 && times[i + 1] < t) i++; i = Math.max(0, i); const j = Math.min(n - 1, i + 1); const k = times[j] > times[i] ? Math.min(1, Math.max(0, (t - times[i]) / (times[j] - times[i]))) : 0;
  const a = Array.from({ length: size }, (_, c) => vals[i * size + c]), b = Array.from({ length: size }, (_, c) => vals[j * size + c]);
  return size === 4 ? slerp(a, b, k) : a.map((x, c) => x * (1 - k) + b[c] * k);
}

const info: Record<string, { duration: number; rootSpeed: number }> = {};
for (const a of src.getRoot().listAnimations()) {
  if (!KEEP.includes(a.getName())) continue;
  let dur = 0; for (const ch of a.listChannels()) { const t = ch.getSampler()!.getInput()!.getArray()!; dur = Math.max(dur, t[t.length - 1]); }
  const frames = Math.round(dur * FPS) + 1; const times = new Float32Array(frames); for (let f = 0; f < frames; f++) times[f] = Math.min(dur, f / FPS);
  const timeAcc = doc.createAccessor().setType('SCALAR').setArray(times).setBuffer(buf); const anim = doc.createAnimation(a.getName());
  for (const ch of a.listChannels()) {
    const path = ch.getTargetPath(); const bone = ch.getTargetNode()!.getName(); const target = byName.get(bone); if (!target) continue;
    if (path !== 'rotation' && !(path === 'translation' && bone === 'pelvis')) continue;
    const s = ch.getSampler()!; const tin = s.getInput()!.getArray()!, vin = s.getOutput()!.getArray()!; const size = path === 'rotation' ? 4 : 3; const out = path === 'rotation' ? new Int16Array(frames * 4) : new Float32Array(frames * 3);
    for (let f = 0; f < frames; f++) { const v = sampler(tin, vin, size, times[f]); for (let c = 0; c < size; c++) out[f * size + c] = path === 'rotation' ? Math.round(Math.max(-1, Math.min(1, v[c])) * 32767) : v[c]; }
    const outAcc = doc.createAccessor().setType(size === 4 ? 'VEC4' : 'VEC3').setArray(out).setBuffer(buf); if (path === 'rotation') outAcc.setNormalized(true);
    const sm = doc.createAnimationSampler().setInput(timeAcc).setOutput(outAcc).setInterpolation('LINEAR'); anim.addSampler(sm);
    anim.addChannel(doc.createAnimationChannel().setTargetNode(target).setTargetPath(path).setSampler(sm));
  }
  info[a.getName()] = { duration: +dur.toFixed(4), rootSpeed: +((rootDistance.get(a.getName()) ?? 0) / dur).toFixed(3) };
}
mkdirSync('public/models/Animations', { recursive: true }); mkdirSync('shared', { recursive: true });
await new NodeIO().write('public/models/Animations/humanoid_anims.glb', doc);
writeFileSync('shared/clip_info.json', JSON.stringify(info, null, 2) + '\n');
console.log(Object.keys(info).length, 'clips');
for (const k of ['Walk_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop']) console.log(k, info[k]);
