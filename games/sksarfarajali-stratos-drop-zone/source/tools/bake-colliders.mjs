// Reads every building/prop GLB and writes simplified box colliders (model space) to src/data/colliders.json.
// Axis-aligned faces become thin slabs; slabs on the same plane are merged. Solid props use one box.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('public/models');
const SOLID = new Set(['container_closed_amber','container_closed_blue','container_closed_green','container_closed_laterite','container_open_laterite','boxcar','crate_wood','barrel_blue','barrel_red','generator','pallet','rock_large','rock_medium','rock_small','sandbag_wall','road_barrier','bench','fallen_log','supply_kiosk','market_stall_amber','market_stall_violet','dock_crane','radar_dish','fishing_boat','fort_wall_segment','dam_section','target_dummy']);
const TREES = { palm_tree: 0.3, broadleaf_tree: 0.4 };
function readGlb(file) {
  const b = fs.readFileSync(file); const jl = b.readUInt32LE(12);
  const json = JSON.parse(b.slice(20, 20 + jl).toString());
  const binOff = 20 + jl + 8; const bin = b.slice(binOff);
  const prim = json.meshes[0].primitives[0];
  const acc = (i) => json.accessors[i]; const view = (a) => json.bufferViews[a.bufferView];
  const pa = acc(prim.attributes.POSITION); const pv = view(pa);
  const pos = new Float32Array(bin.buffer.slice(bin.byteOffset + (pv.byteOffset || 0) + (pa.byteOffset || 0), bin.byteOffset + (pv.byteOffset || 0) + (pa.byteOffset || 0) + pa.count * 12));
  let idx;
  if (prim.indices != null) { const ia = acc(prim.indices); const iv = view(ia); const o = bin.byteOffset + (iv.byteOffset || 0) + (ia.byteOffset || 0);
    const size = ia.componentType === 5125 ? 4 : 2; const T = ia.componentType === 5125 ? Uint32Array : Uint16Array;
    idx = new T(bin.buffer.slice(o, o + ia.count * size)); } else { idx = Array.from({ length: pa.count }, (_, i) => i); }
  return { pos, idx, min: pa.min, max: pa.max };
}
const r2 = (v) => Math.round(v * 100) / 100;
function slabs(g) {
  const out = new Map(); const { pos, idx } = g;
  for (let i = 0; i < idx.length; i += 3) {
    const v = [0, 1, 2].map((k) => [pos[idx[i + k] * 3], pos[idx[i + k] * 3 + 1], pos[idx[i + k] * 3 + 2]]);
    const e1 = v[1].map((x, j) => x - v[0][j]); const e2 = v[2].map((x, j) => x - v[0][j]);
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const l = Math.hypot(...n); if (l < 1e-6) continue; const nn = n.map((x) => x / l);
    const ax = nn.findIndex((x) => Math.abs(x) > 0.98); if (ax < 0) continue;
    const mn = [0, 1, 2].map((j) => Math.min(v[0][j], v[1][j], v[2][j])); const mx = [0, 1, 2].map((j) => Math.max(v[0][j], v[1][j], v[2][j]));
    const plane = r2((v[0][ax] + v[1][ax] + v[2][ax]) / 3); const key = `${ax}:${Math.sign(nn[ax])}:${plane}`;
    if (!out.has(key)) out.set(key, { ax, sign: Math.sign(nn[ax]), plane, rects: [] });
    out.get(key).rects.push([mn, mx]);
  }
  const boxes = [];
  for (const s of out.values()) {
    let rects = s.rects.map(([a, b]) => ({ a: [...a], b: [...b] }));
    let changed = true;
    while (changed) { changed = false;
      outer: for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
        const A = rects[i], B = rects[j]; const U = { a: A.a.map((x, k) => Math.min(x, B.a[k])), b: A.b.map((x, k) => Math.max(x, B.b[k])) };
        const area = (R) => { const d = [0, 1, 2].filter((k) => k !== s.ax); return (R.b[d[0]] - R.a[d[0]]) * (R.b[d[1]] - R.a[d[1]]); };
        const touch = [0, 1, 2].every((k) => k === s.ax || (A.a[k] <= B.b[k] + 0.02 && B.a[k] <= A.b[k] + 0.02));
        if (touch && area(U) <= (area(A) + area(B)) * 1.02) { rects[i] = U; rects.splice(j, 1); changed = true; break outer; }
      } }
    for (const R of rects) {
      const a = [...R.a], b = [...R.b];
      if (s.ax === 1) { if (s.sign > 0) { a[1] = s.plane - 0.3; b[1] = s.plane; } else { a[1] = s.plane; b[1] = s.plane + 0.3; } }
      else { a[s.ax] = s.plane - 0.12; b[s.ax] = s.plane + 0.12; }
      if (b[0] - a[0] < 0.05 || b[2] - a[2] < 0.05 || b[1] - a[1] < 0.05) continue;
      boxes.push([...a.map(r2), ...b.map(r2)]);
    }
  }
  return boxes;
}
const result = {};
for (const dir of ['Environment_Buildings', 'Environment_Props']) for (const f of fs.readdirSync(path.join(root, dir))) {
  const name = f.replace('.glb', ''); const g = readGlb(path.join(root, dir, f)); const [x0, y0, z0] = g.min, [x1, y1, z1] = g.max;
  if (name in TREES) { const r = TREES[name]; result[name] = [[-r, 0, -r, r, y1, r]]; }
  else if (['bush','grass_clump','rail_track_10m','street_light','fence_3m'].includes(name)) result[name] = [];
  else if (SOLID.has(name) || dir === 'Environment_Props') result[name] = [[x0, y0, z0, x1, y1, z1].map(r2)];
  else result[name] = slabs(g);
}
fs.writeFileSync('src/data/colliders.json', JSON.stringify(result));
console.log(Object.entries(result).map(([k, v]) => `${k}:${v.length}`).join(' '));
