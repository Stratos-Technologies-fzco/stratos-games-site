// Builds the survivor models from the CC0 Quaternius "Universal Base Characters" (Superhero male + female).
//   node tools/build-characters.ts --chars "<...>/Base Characters/Godot - UE"
// Output (committed, so players never need the source pack):
//   public/models/Characters/humanoid_male.glb, humanoid_female.glb   one rigged skeleton (65 bones), three skinned LOD meshes each, four sockets
//   public/models/Characters/atlas_1024.png, atlas_512.png            one colour atlas, one palette row per survivor
//   shared/atlas_layout.json                                          which atlas column is which body region
// The pack's own skin texture is a realistic nude body, which does not fit the low-poly look and has no clothes. So the surface is
// repainted by REGION (skin, hair, jacket, sleeve, trousers, boots ...): every triangle points at one flat swatch of the atlas.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Accessor, Document, Node, NodeIO, Primitive } from '@gltf-transform/core';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import * as THREE from 'three';
import { readGltfNoTextures } from './lib/gltf.ts';
import palettes from './survivor_palettes.json' with { type: 'json' };

const args = process.argv.slice(2); const arg = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const CHARS = arg('--chars'); if (!CHARS) throw new Error('usage: node tools/build-characters.ts --chars "<Base Characters/Godot - UE folder>"');
const OUT = 'public/models/Characters';

export const REGIONS = ['skin', 'hair', 'eye', 'jacket', 'sleeve', 'forearm', 'neckwear', 'trousers', 'beard', 'boots', 'sole', 'belt', 'glove', 'band', 'trim', 'knee', 'cuff', 'laces', 'pack', 'roll', 'strap'] as const;
type Region = (typeof REGIONS)[number];
const R = (n: Region) => REGIONS.indexOf(n);
const GRID = 32; // atlas is GRID x GRID cells; column = region, row = survivor
const LOD_TRIS = [12000, 5000, 1500];

type V3 = [number, number, number];
interface Geo { pos: Float32Array; nrm: Float32Array; joints: Uint16Array; weights: Float32Array; kind: Uint8Array /* 0 body, 1 eye, 2 brow, 3 accessory */; acc: Uint8Array /* accessory region */; idx: Uint32Array }

function read(p: Primitive): { pos: Float32Array; nrm: Float32Array; j: Uint16Array; w: Float32Array; idx: Uint32Array } {
  const g = (s: string) => p.getAttribute(s)!.getArray()!;
  const pos = Float32Array.from(g('POSITION') as Float32Array), nrm = Float32Array.from(g('NORMAL') as Float32Array);
  const j = Uint16Array.from(g('JOINTS_0') as ArrayLike<number>); const wa = p.getAttribute('WEIGHTS_0')!; const w = new Float32Array(wa.getCount() * 4); const el = [0, 0, 0, 0]; for (let i = 0; i < wa.getCount(); i++) { wa.getElement(i, el); w.set(el, i * 4); }
  return { pos, nrm, j, w, idx: Uint32Array.from(p.getIndices()!.getArray() as ArrayLike<number>) };
}

/** A box (or tube) skinned rigidly to one bone, for the backpack. */
function box(cx: number, cy: number, cz: number, sx: number, sy: number, sz: number): { pos: number[]; nrm: number[]; idx: number[] } {
  const pos: number[] = [], nrm: number[] = [], idx: number[] = []; const faces: [V3, V3, V3][] = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 0, 1], [0, 1, 0]], [[0, 1, 0], [0, 0, 1], [1, 0, 0]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]]];
  for (const [n, u, v] of faces) { const b = pos.length / 3; for (const [a, c] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { pos.push(cx + (n[0] + u[0] * a + v[0] * c) * sx / 2, cy + (n[1] + u[1] * a + v[1] * c) * sy / 2, cz + (n[2] + u[2] * a + v[2] * c) * sz / 2); nrm.push(...n); } idx.push(b, b + 1, b + 2, b, b + 2, b + 3); }
  return { pos, nrm, idx };
}
function roll(cx: number, cy: number, cz: number, r: number, len: number, seg = 8): { pos: number[]; nrm: number[]; idx: number[] } { // cylinder along X
  const pos: number[] = [], nrm: number[] = [], idx: number[] = [];
  for (let i = 0; i < seg; i++) { const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2, b = pos.length / 3; for (const [x, a] of [[-1, a0], [1, a0], [1, a1], [-1, a1]] as [number, number][]) { pos.push(cx + x * len / 2, cy + Math.sin(a) * r, cz + Math.cos(a) * r); nrm.push(0, Math.sin(a), Math.cos(a)); } idx.push(b, b + 1, b + 2, b, b + 2, b + 3); }
  return { pos, nrm, idx };
}

async function buildOne(sex: 'male' | 'female') {
  const doc = await readGltfNoTextures(join(CHARS!, `Superhero_${sex === 'male' ? 'Male' : 'Female'}_FullBody.gltf`));
  const root = doc.getRoot(); const skin = root.listSkins()[0]; const joints = skin.listJoints(); const names = joints.map((j) => j.getName()); const ji = (n: string) => names.indexOf(n);
  const J: Record<string, V3> = {}; for (const j of joints) J[j.getName()] = j.getWorldTranslation() as V3;

  // ---- merge the three source primitives into one vertex buffer
  const parts: { pos: Float32Array; nrm: Float32Array; j: Uint16Array; w: Float32Array; idx: Uint32Array; kind: number }[] = [];
  for (const m of root.listMeshes()) for (const p of m.listPrimitives()) { const name = m.getName().toLowerCase(); parts.push({ ...read(p), kind: /eyebrow|^face$/.test(name) ? 2 : /eye/.test(name) ? 1 : 0 }); }
  const accs: { pos: number[]; nrm: number[]; idx: number[]; region: Region }[] = [];
  const sp3 = J.spine_03; const bp = (b: { pos: number[]; nrm: number[]; idx: number[] }, region: Region) => accs.push({ ...b, region });
  bp(box(0, sp3[1] - 0.03, sp3[2] - 0.215, 0.34, 0.46, 0.17), 'pack');
  bp(roll(0, sp3[1] + 0.2, sp3[2] - 0.215, 0.075, 0.38), 'roll');
  for (const s of [-1, 1]) bp(box(s * 0.12, sp3[1] + 0.02, sp3[2] + 0.1, 0.05, 0.42, 0.04), 'strap');
  for (const s of [-1, 1]) bp(box(s * 0.12, sp3[1] + 0.22, sp3[2] - 0.05, 0.05, 0.04, 0.3), 'strap');
  let nV = parts.reduce((a, p) => a + p.pos.length / 3, 0) + accs.reduce((a, p) => a + p.pos.length / 3, 0);
  const geo: Geo = { pos: new Float32Array(nV * 3), nrm: new Float32Array(nV * 3), joints: new Uint16Array(nV * 4), weights: new Float32Array(nV * 4), kind: new Uint8Array(nV), acc: new Uint8Array(nV), idx: new Uint32Array(0) };
  const idxs: number[] = []; let o = 0;
  for (const p of parts) { const n = p.pos.length / 3; geo.pos.set(p.pos, o * 3); geo.nrm.set(p.nrm, o * 3); geo.joints.set(p.j, o * 4); geo.weights.set(p.w, o * 4); geo.kind.fill(p.kind, o, o + n); for (const i of p.idx) idxs.push(i + o); o += n; }
  for (const a of accs) { const n = a.pos.length / 3; geo.pos.set(a.pos, o * 3); geo.nrm.set(a.nrm, o * 3); const jb = ji('spine_03'); for (let i = 0; i < n; i++) { geo.joints[(o + i) * 4] = jb; geo.weights[(o + i) * 4] = 1; } geo.kind.fill(3, o, o + n); geo.acc.fill(R(a.region), o, o + n); for (const i of a.idx) idxs.push(i + o); o += n; }
  geo.idx = Uint32Array.from(idxs);

  // ---- region of every vertex
  const eyeY = 1.695, headZ = J.Head[2];
  const region = new Uint8Array(nV);
  for (let v = 0; v < nV; v++) {
    const x = geo.pos[v * 3], y = geo.pos[v * 3 + 1], z = geo.pos[v * 3 + 2], ny = geo.nrm[v * 3 + 1];
    if (geo.kind[v] === 1) { region[v] = R('eye'); continue; } if (geo.kind[v] === 2) { region[v] = R('hair'); continue; } if (geo.kind[v] === 3) { region[v] = geo.acc[v]; continue; }
    let bi = 0, bw = -1; for (let k = 0; k < 4; k++) if (geo.weights[v * 4 + k] > bw) { bw = geo.weights[v * 4 + k]; bi = geo.joints[v * 4 + k]; }
    const b = names[bi]; const side = b.endsWith('_l') ? 'l' : b.endsWith('_r') ? 'r' : ''; let r: Region = 'skin';
    if (b === 'Head') { if (y > eyeY + 0.075) r = 'hair'; else if (y > eyeY + 0.045) r = 'band'; else if (y > eyeY && z < headZ - 0.06) r = 'hair'; else if (y < eyeY - 0.03 && y > eyeY - 0.135 && z > headZ + 0.02) r = 'beard'; }
    else if (b === 'neck_01') r = 'neckwear';
    else if (b === 'pelvis') { r = y < J.pelvis[1] - 0.02 ? 'trousers' : y < J.pelvis[1] + 0.06 ? 'belt' : 'jacket'; }
    else if (/^spine_0[123]$/.test(b) || b.startsWith('clavicle')) { r = 'jacket'; if (y > J.neck_01[1] - 0.07 && Math.abs(x) < 0.1) r = 'neckwear'; else if (b === 'spine_03' && Math.abs(y - (J.spine_03[1] + 0.03)) < 0.03) r = 'trim'; }
    else if (b.startsWith('upperarm')) { const t = (Math.abs(x) - Math.abs(J['upperarm_' + side][0])) / (Math.abs(J['lowerarm_' + side][0]) - Math.abs(J['upperarm_' + side][0])); r = t > 0.38 && t < 0.6 ? 'trim' : 'sleeve'; }
    else if (b.startsWith('lowerarm')) { const t = (Math.abs(x) - Math.abs(J['lowerarm_' + side][0])) / (Math.abs(J['hand_' + side][0]) - Math.abs(J['lowerarm_' + side][0])); r = t > 0.82 ? 'cuff' : 'forearm'; }
    else if (b.startsWith('hand') || /^(index|middle|ring|pinky|thumb)/.test(b)) r = 'glove';
    else if (b.startsWith('thigh')) { r = y < J['calf_' + side][1] + 0.06 && z > J['thigh_' + side][2] ? 'knee' : 'trousers'; }
    else if (b.startsWith('calf')) { const ky = J['calf_' + side][1], fy = J['foot_' + side][1]; r = y > ky - 0.1 && z > J['calf_' + side][2] + 0.01 ? 'knee' : y < fy + 0.2 ? 'boots' : Math.abs(y - (fy + 0.3)) < 0.025 ? 'trim' : 'trousers'; }
    else if (b.startsWith('foot') || b.startsWith('ball')) { r = ny < -0.55 && y < 0.07 ? 'sole' : ny > 0.4 && y > 0.06 && y < 0.16 && Math.abs(x) < 0.2 ? 'laces' : 'boots'; }
    region[v] = R(r);
  }

  // ---- LODs: simplify, then give every triangle ONE region (majority of its corners) and split vertices only where regions meet
  await MeshoptSimplifier.ready;
  const idxAll = geo.idx; const lodDocs: { tris: number; pos: number[]; nrm: number[]; j: number[]; w: number[]; reg: number[]; idx: number[] }[] = [];
  for (const target of LOD_TRIS) {
    let indices = idxAll; const triCount = idxAll.length / 3;
    if (target < triCount) {
      const attrs = new Float32Array(nV * 7); for (let v = 0; v < nV; v++) { attrs.set(geo.nrm.subarray(v * 3, v * 3 + 3), v * 7); attrs.set(geo.weights.subarray(v * 4, v * 4 + 4), v * 7 + 3); }
      const lock = new Uint8Array(nV);
      const [out] = MeshoptSimplifier.simplifyWithAttributes(idxAll, geo.pos, 3, attrs, 7, [0.5, 0.5, 0.5, 1, 1, 1, 1], lock, target * 3, 0.5, []);
      indices = out;
    }
    const map = new Map<number, number>(); const L = { tris: indices.length / 3, pos: [] as number[], nrm: [] as number[], j: [] as number[], w: [] as number[], reg: [] as number[], idx: [] as number[] };
    for (let t = 0; t < indices.length; t += 3) {
      const a = indices[t], b = indices[t + 1], c = indices[t + 2]; const ra = region[a], rb = region[b], rc = region[c];
      const tr = ra === rb || ra === rc ? ra : rb === rc ? rb : ra; // majority; all differ: first corner
      for (const v of [a, b, c]) { const key = v * 64 + tr; let n = map.get(key); if (n === undefined) { n = L.pos.length / 3; map.set(key, n); L.pos.push(geo.pos[v * 3], geo.pos[v * 3 + 1], geo.pos[v * 3 + 2]); L.nrm.push(geo.nrm[v * 3], geo.nrm[v * 3 + 1], geo.nrm[v * 3 + 2]); for (let k = 0; k < 4; k++) { L.j.push(geo.joints[v * 4 + k]); L.w.push(geo.weights[v * 4 + k]); } L.reg.push(tr); } L.idx.push(n); }
    }
    lodDocs.push(L);
  }

  // ---- write: replace the source meshes with our three LOD meshes on the same skin
  for (const n of root.listNodes()) if (n.getMesh()) n.dispose(); for (const m of root.listMeshes()) m.dispose(); for (const m of root.listMaterials()) m.dispose();
  const buf = root.listBuffers()[0] ?? doc.createBuffer();
  const mat = doc.createMaterial('Survivor').setBaseColorFactor([1, 1, 1, 1]).setMetallicFactor(0).setRoughnessFactor(1);
  const scene = root.listScenes()[0]; const lodStats: number[] = [];
  lodDocs.forEach((L, li) => {
    const acc = (type: Accessor.Type, arr: ArrayLike<number>, ctor: any) => doc.createAccessor().setType(type).setArray(ctor.from(arr)).setBuffer(buf);
    const uv: number[] = []; for (const r of L.reg) uv.push((r + 0.5) / GRID, 0.5 / GRID); // row 0 = first survivor; the game offsets V per survivor
    const prim = doc.createPrimitive().setMaterial(mat).setIndices(doc.createAccessor().setType('SCALAR').setArray(Uint32Array.from(L.idx)).setBuffer(buf))
      .setAttribute('POSITION', acc('VEC3', L.pos, Float32Array)).setAttribute('NORMAL', acc('VEC3', L.nrm, Float32Array)).setAttribute('TEXCOORD_0', acc('VEC2', uv, Float32Array))
      .setAttribute('JOINTS_0', acc('VEC4', L.j, Uint16Array)).setAttribute('WEIGHTS_0', acc('VEC4', L.w, Float32Array));
    const mesh = doc.createMesh(`body_lod${li}`).addPrimitive(prim); const node = doc.createNode(`body_lod${li}`).setMesh(mesh).setSkin(skin); scene.addChild(node); lodStats.push(L.tris);
  });

  // ---- sockets, placed in each bone's own space from a wanted world frame (T-pose)
  const sock = (name: string, parent: string, wpos: V3, wx: V3, wy: V3, wz: V3) => {
    const pj = joints[ji(parent)]; const pw = new THREE.Matrix4().fromArray(pj.getWorldMatrix() as number[]);
    const want = new THREE.Matrix4().makeBasis(new THREE.Vector3(...wx), new THREE.Vector3(...wy), new THREE.Vector3(...wz)).setPosition(...wpos);
    const local = pw.clone().invert().multiply(want); const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); local.decompose(p, q, s);
    const n = doc.createNode(name).setTranslation(p.toArray() as V3).setRotation(q.toArray() as [number, number, number, number]); pj.addChild(n);
  };
  const hr = J.hand_r, hl = J.hand_l;
  sock('hand_r_weapon', 'hand_r', [hr[0] - 0.06, hr[1], hr[2]], [0, -1, 0], [0, 0, 1], [-1, 0, 0]);
  sock('hand_l_ik', 'hand_l', [hl[0] + 0.06, hl[1], hl[2]], [0, 1, 0], [0, 0, 1], [1, 0, 0]);
  sock('spine_backpack', 'spine_03', [0, J.spine_03[1], J.spine_03[2] - 0.16], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  sock('head_cam', 'Head', [0, J.Head[1] + 0.095, J.Head[2] + 0.085], [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  mkdirSync(OUT, { recursive: true });
  await new NodeIO().write(join(OUT, `humanoid_${sex}.glb`), doc);
  console.log(`humanoid_${sex}.glb  bones ${joints.length}  LOD triangles ${lodStats.join(' / ')}`);
}

// ---- atlas: one row per survivor
async function atlas() {
  for (const size of [1024, 512]) {
    const cell = size / GRID; const raw = Buffer.alloc(size * size * 3, 128);
    palettes.survivors.forEach((s, row) => { REGIONS.forEach((reg, col) => { const hex = (s.colors as Record<string, string>)[reg]; const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); for (let y = row * cell; y < (row + 1) * cell; y++) for (let x = col * cell; x < (col + 1) * cell; x++) { const k = (y * size + x) * 3; raw[k] = rgb[0]; raw[k + 1] = rgb[1]; raw[k + 2] = rgb[2]; } }); });
    await sharp(raw, { raw: { width: size, height: size, channels: 3 } }).png({ palette: true }).toFile(join(OUT, `atlas_${size}.png`));
  }
  mkdirSync('shared', { recursive: true });
  writeFileSync('shared/atlas_layout.json', JSON.stringify({ grid: GRID, regions: REGIONS, rows: palettes.survivors.map((s, i) => ({ row: i, id: s.id, body: s.body })) }, null, 2) + '\n');
  console.log('atlas_1024.png, atlas_512.png, shared/atlas_layout.json');
}

await buildOne('male'); await buildOne('female'); await atlas();
