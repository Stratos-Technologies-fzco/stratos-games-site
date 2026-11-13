// Vayu Island: deterministic terrain, river, roads, buildings, props, vegetation and loot spawns.
import manifest from '../../tools/asset_manifest.json';
import B from '../balance.json';

export const MAP = 640;
export const HALF = MAP / 2;
export const GRID = 129;
export const CELL = MAP / (GRID - 1); // 5 m

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export type Rng = () => number;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const toWorld = (mx: number, my: number): [number, number] => [mx - HALF, my - HALF];

// ---------- value noise ----------
function hash2(ix: number, iz: number): number {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x: number, z: number): number {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  return lerp(lerp(hash2(ix, iz), hash2(ix + 1, iz), u), lerp(hash2(ix, iz + 1), hash2(ix + 1, iz + 1), u), v);
}
const fbm = (x: number, z: number) => vnoise(x * 0.02, z * 0.02) * 0.6 + vnoise(x * 0.05, z * 0.05) * 0.3 + vnoise(x * 0.12, z * 0.12) * 0.1;

// ---------- island outline ----------
const OUTLINE_MAP: [number, number][] = [[60,180],[100,90],[190,55],[300,60],[400,45],[500,70],[580,120],[600,210],[585,300],[610,390],[570,480],[520,560],[430,600],[320,605],[220,590],[140,560],[80,490],[50,400],[70,300],[45,240]];
export const OUTLINE = OUTLINE_MAP.map(([x, y]) => toWorld(x, y));

function pointInPoly(x: number, z: number, p: [number, number][]) {
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, zi] = p[i], [xj, zj] = p[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
function distToSeg(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax, dz = bz - az;
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1), 0, 1);
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}
/** Signed distance to the coast: positive inland, negative at sea. */
export function coastDist(x: number, z: number): number {
  let d = Infinity;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) d = Math.min(d, distToSeg(x, z, OUTLINE[j][0], OUTLINE[j][1], OUTLINE[i][0], OUTLINE[i][1]));
  return pointInPoly(x, z, OUTLINE) ? d : -d;
}

// ---------- locations ----------
export type Tier = 'low' | 'mid' | 'high' | 'top';
export interface Poi { id: number; name: string; mx: number; my: number; x: number; z: number; tier: Tier }
const POI_DEF: [string, number, number, Tier][] = [
  ['Lighthouse Point', 108, 108, 'mid'], ['Tea Terraces', 320, 115, 'mid'], ['Radar Ridge', 525, 125, 'mid'],
  ['Salt Docks', 85, 330, 'high'], ['Old Sea Fort', 320, 320, 'top'], ['Spice Market', 475, 285, 'top'],
  ["Fisher's Cove", 580, 400, 'low'], ['Rail Yard', 485, 478, 'high'], ['Monsoon Dam', 250, 484, 'mid'], ['Mangrove Delta', 130, 530, 'low'],
];
export const POIS: Poi[] = POI_DEF.map(([name, mx, my, tier], i) => { const [x, z] = toWorld(mx, my); return { id: i + 1, name, mx, my, x, z, tier }; });
const poi = (n: number) => POIS[n - 1];

// ---------- river & roads ----------
const RIVER_MAP: [number, number][] = [[330,170],[318,250],[305,330],[300,420],[262,484],[215,535],[170,568],[130,590]];
export const RIVER = RIVER_MAP.map(([x, y]) => toWorld(x, y));
export const RIVER_WIDTH = 8;
const ROAD_LINKS: [number, number][] = [[1,2],[2,5],[2,3],[5,4],[5,6],[6,3],[6,8],[6,7],[5,9],[9,10],[8,9],[4,10],[1,4]];
export const ROADS: [number, number][][] = ROAD_LINKS.map(([a, b]) => {
  const A = poi(a), Bp = poi(b);
  const mx = (A.x + Bp.x) / 2 + (A.z - Bp.z) * 0.08, mz = (A.z + Bp.z) / 2 + (Bp.x - A.x) * 0.08;
  return [[A.x, A.z], [mx, mz], [Bp.x, Bp.z]] as [number, number][];
});
export const RAIL: [number, number][] = [[85,330],[200,346],[320,360],[400,420],[480,478]].map(([x, y]) => toWorld(x, y));

function polyDist(x: number, z: number, line: [number, number][]) {
  let d = Infinity;
  for (let i = 0; i + 1 < line.length; i++) d = Math.min(d, distToSeg(x, z, line[i][0], line[i][1], line[i + 1][0], line[i + 1][1]));
  return d;
}
export const riverDist = (x: number, z: number) => polyDist(x, z, RIVER);
export const inRiver = (x: number, z: number) => riverDist(x, z) < RIVER_WIDTH / 2;
export const roadDist = (x: number, z: number) => Math.min(...ROADS.map((r) => polyDist(x, z, r)));

// ---------- terrain ----------
const TEA = toWorld(320, 115), RADAR = toWorld(525, 125);
function baseHeightNoRiver(x: number, z: number): number {
  const d = coastDist(x, z);
  if (d < 0) return Math.max(-4, d * 0.15) + 0.05;
  const beach = lerp(0.1, 1.0, clamp(d / 11, 0, 1));
  const low = 2.2 + fbm(x, z) * 5;
  let h = lerp(beach, low, smooth(9, 34, d));
  const g = (c: [number, number], r: number) => Math.exp(-(((x - c[0]) ** 2 + (z - c[1]) ** 2) / (2 * r * r)));
  const tea = 26 * g(TEA, 55);
  const stepped = Math.floor(tea / 3.2) * 3.2 + smooth(0, 1, (tea % 3.2) / 3.2) * 0.4;
  h = Math.max(h, 2.2 + stepped * smooth(0, 3, tea));
  h = Math.max(h, 2.2 + 33 * g(RADAR, 48) + fbm(x * 2, z * 2));
  return h;
}
export function baseHeight(x: number, z: number): number {
  let h = baseHeightNoRiver(x, z);
  const rd = riverDist(x, z);
  if (rd < RIVER_WIDTH / 2 + 5 && coastDist(x, z) > 0) h -= 1.2 * (1 - smooth(RIVER_WIDTH / 2 - 1, RIVER_WIDTH / 2 + 5, rd));
  return h;
}

export const BUILDING_MODELS = new Set(['house_small','house_twostorey','shed','warehouse','fisher_hut','watch_tower','lighthouse','tea_drying_shed','station_shed','fort_corner_tower','radar_dish','dock_crane','fort_wall_segment','dam_section','market_stall_amber','market_stall_violet']);
const SIZE: Record<string, [number, number, number]> = {};
for (const m of manifest as unknown as { name: string; size_m_xyz: [number, number, number] }[]) SIZE[m.name] = m.size_m_xyz;
export const modelSize = (n: string) => SIZE[n] ?? [1, 1, 1];

export interface Placement { model: string; x: number; y: number; z: number; yaw: number; poi: number }
export interface LootSpawn { x: number; y: number; z: number; tier: Tier; poi: number }

export class Terrain {
  h = new Float32Array(GRID * GRID);
  at(ix: number, iz: number) { return this.h[clamp(iz, 0, GRID - 1) * GRID + clamp(ix, 0, GRID - 1)]; }
  height(x: number, z: number): number {
    const fx = (x + HALF) / CELL, fz = (z + HALF) / CELL;
    const ix = Math.floor(fx), iz = Math.floor(fz), tx = fx - ix, tz = fz - iz;
    return lerp(lerp(this.at(ix, iz), this.at(ix + 1, iz), tx), lerp(this.at(ix, iz + 1), this.at(ix + 1, iz + 1), tx), tz);
  }
  slope(x: number, z: number): number { return Math.hypot(this.height(x + 2, z) - this.height(x - 2, z), this.height(x, z + 2) - this.height(x, z - 2)) / 4; }
}

export interface WorldData {
  seed: number; terrain: Terrain; placements: Placement[]; vegetation: Placement[]; loot: LootSpawn[];
  lights: Placement[]; waterLevel: number;
}

function poisson(rng: Rng, minDist: number, accept: (x: number, z: number) => boolean, tries = 30000): [number, number][] {
  const cs = minDist / Math.SQRT2, gw = Math.ceil(MAP / cs);
  const grid = new Int32Array(gw * gw).fill(-1); const pts: [number, number][] = [];
  for (let t = 0; t < tries; t++) {
    const x = rng() * MAP - HALF, z = rng() * MAP - HALF;
    if (!accept(x, z)) continue;
    const gx = Math.floor((x + HALF) / cs), gz = Math.floor((z + HALF) / cs);
    let ok = true;
    for (let dz = -2; dz <= 2 && ok; dz++) for (let dx = -2; dx <= 2; dx++) {
      const nx = gx + dx, nz = gz + dz; if (nx < 0 || nz < 0 || nx >= gw || nz >= gw) continue;
      const k = grid[nz * gw + nx]; if (k >= 0 && Math.hypot(pts[k][0] - x, pts[k][1] - z) < minDist) { ok = false; break; }
    }
    if (ok) { grid[gz * gw + gx] = pts.length; pts.push([x, z]); }
  }
  return pts;
}

export function buildWorld(seed = 20241113): WorldData {
  const rng = mulberry32(seed);
  const placements: Placement[] = [];
  const taken: { x: number; z: number; r: number }[] = [];
  const snap = (m: string, yaw: number) => (BUILDING_MODELS.has(m) || ['container_closed_amber','container_closed_blue','container_closed_green','container_closed_laterite','container_open_laterite','boxcar','crate_wood','barrel_blue','barrel_red','generator','pallet','sandbag_wall','rock_large','rock_medium','rock_small','bench','fishing_boat','fallen_log','road_barrier'].includes(m) ? Math.round(yaw / (Math.PI / 2)) * (Math.PI / 2) : yaw);
  const radius = (m: string) => { const s = modelSize(m); return Math.max(s[0], s[2]) / 2 * 0.9; };
  function place(m: string, x: number, z: number, yaw: number, p: number, force = false): boolean {
    yaw = snap(m, yaw); const r = radius(m);
    if (!force) {
      if (coastDist(x, z) < 2 && !['jetty_section', 'fishing_boat'].includes(m)) return false;
      if (inRiver(x, z) && m !== 'dam_section') return false;
      for (const t of taken) if (Math.hypot(t.x - x, t.z - z) < t.r + r + 0.4) return false;
    }
    placements.push({ model: m, x, y: baseHeight(x, z), z, yaw, poi: p }); taken.push({ x, z, r }); return true;
  }
  function scatter(m: string, p: number, n: number, rMin: number, rMax: number, cx?: number, cz?: number) {
    const P = poi(p); let c = 0;
    for (let t = 0; t < n * 40 && c < n; t++) {
      const a = rng() * Math.PI * 2, d = rMin + rng() * (rMax - rMin);
      if (place(m, (cx ?? P.x) + Math.cos(a) * d, (cz ?? P.z) + Math.sin(a) * d, rng() * Math.PI * 2, p)) c++;
    }
  }
  // 1 Lighthouse Point
  place('lighthouse', poi(1).x, poi(1).z, 0, 1, true); scatter('house_small', 1, 2, 18, 34); scatter('rock_medium', 1, 5, 12, 45); scatter('palm_tree', 1, 8, 15, 50);
  // 2 Tea Terraces
  scatter('tea_drying_shed', 2, 3, 8, 36); scatter('shed', 2, 1, 14, 30); scatter('bush', 2, 14, 10, 55);
  // 3 Radar Ridge
  scatter('radar_dish', 3, 3, 6, 26); scatter('watch_tower', 3, 1, 22, 34); scatter('sandbag_wall', 3, 6, 10, 32); scatter('rock_large', 3, 4, 20, 50);
  // 4 Salt Docks
  scatter('dock_crane', 4, 2, 12, 28); scatter('warehouse', 4, 1, 8, 22);
  for (const c of ['container_closed_amber','container_closed_blue','container_closed_green','container_closed_laterite','container_open_laterite']) scatter(c, 4, 3, 8, 42);
  scatter('barrel_blue', 4, 4, 6, 40); scatter('barrel_red', 4, 4, 6, 40); scatter('pallet', 4, 6, 6, 36);
  // 5 Old Sea Fort: a square wall with 4 corner towers
  {
    const P = poi(5), wall = modelSize('fort_wall_segment'), seg = Math.max(wall[0], wall[2]), side = 4, half = (seg * side) / 2;
    for (let s = 0; s < side; s++) for (const sgn of [-1, 1]) {
      const o = -half + seg * (s + 0.5);
      place('fort_wall_segment', P.x + o, P.z + sgn * half, 0, 5, true); place('fort_wall_segment', P.x + sgn * half, P.z + o, Math.PI / 2, 5, true);
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) place('fort_corner_tower', P.x + sx * half, P.z + sz * half, 0, 5, true);
    scatter('crate_wood', 5, 10, 3, half - 4); scatter('sandbag_wall', 5, 6, 4, half - 4);
  }
  // 6 Spice Market
  scatter('house_twostorey', 6, 5, 8, 42); scatter('house_small', 6, 7, 8, 48);
  scatter('market_stall_amber', 6, 4, 6, 30); scatter('market_stall_violet', 6, 4, 6, 30); scatter('bench', 6, 1, 4, 20);
  // 7 Fisher's Cove
  scatter('fisher_hut', 7, 4, 8, 32);
  for (let i = 0; i < 3; i++) place('jetty_section', poi(7).x + 34 + i * 10, poi(7).z - 14 + i * 12, Math.PI / 2, 7, true);
  for (let i = 0; i < 3; i++) place('fishing_boat', poi(7).x + 52 + rng() * 6, poi(7).z - 20 + i * 14, rng() * 6.28, 7, true);
  // 8 Rail Yard
  place('station_shed', poi(8).x, poi(8).z, 0, 8, true); scatter('boxcar', 8, 7, 14, 42); scatter('watch_tower', 8, 1, 26, 36);
  // 9 Monsoon Dam: three sections across the river
  {
    const P = poi(9); const rx = RIVER[4][0] + (RIVER[5][0] - RIVER[4][0]) * 0.3, rz = RIVER[4][1] + (RIVER[5][1] - RIVER[4][1]) * 0.3;
    const dw = Math.max(modelSize('dam_section')[0], modelSize('dam_section')[2]);
    for (let i = -1; i <= 1; i++) place('dam_section', rx + i * dw * 0.7, rz + i * dw * 0.7, Math.PI / 4, 9, true);
    scatter('generator', 9, 1, 14, 24, rx, rz); scatter('shed', 9, 1, 18, 28, rx, rz); void P;
  }
  // 10 Mangrove Delta
  scatter('bush', 10, 22, 5, 50); scatter('broadleaf_tree', 10, 9, 8, 50); scatter('fallen_log', 10, 5, 8, 40);
  for (let i = 0; i < 3; i++) place('jetty_section', poi(10).x - 22 + i * 10, poi(10).z + 30, 0, 10, true);
  // extra landmarks between the named places: a stone circle, a lone watch tower and beached boats
  { const sc = toWorld(200, 250); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; place('rock_large', sc[0] + Math.cos(a) * 9, sc[1] + Math.sin(a) * 9, a, 0, true); } place('rock_large', sc[0], sc[1], 0, 0, true); place('crate_wood', sc[0] + 2, sc[1] + 1, 0.4, 0, true); }
  { const lt = toWorld(430, 205); place('watch_tower', lt[0], lt[1], 0.8, 0, true); place('sandbag_wall', lt[0] + 6, lt[1] + 2, 0, 0, true); place('sandbag_wall', lt[0] - 6, lt[1] - 3, Math.PI / 2, 0, true); }
  for (let t = 0, c = 0; t < 400 && c < 3; t++) { const [bx, bz] = toWorld(592 + (rng() - 0.5) * 50, 255 + (rng() - 0.5) * 80); const cd = coastDist(bx, bz); if (cd > 3 && cd < 9 && place('fishing_boat', bx, bz, rng() * 6.28, 0)) c++; }
  // rail track
  for (let i = 0; i + 1 < RAIL.length; i++) {
    const [ax, az] = RAIL[i], [bx, bz] = RAIL[i + 1], len = Math.hypot(bx - ax, bz - az), n = Math.ceil(len / 10), yaw = Math.atan2(bx - ax, bz - az);
    for (let k = 0; k < n; k++) { const t = (k + 0.5) / n; place('rail_track_10m', lerp(ax, bx, t), lerp(az, bz, t), yaw, 8, true); }
  }
  // street lights / barriers / fences along roads
  const lights: Placement[] = [];
  ROADS.forEach((r, ri) => {
    for (let i = 0; i + 1 < r.length; i++) {
      const [ax, az] = r[i], [bx, bz] = r[i + 1], len = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / len, nz = (bx - ax) / len;
      for (let d = 30; d < len - 20; d += 45) {
        const t = d / len, x = lerp(ax, bx, t) + nx * 4.5, z = lerp(az, bz, t) + nz * 4.5;
        const m = (ri + Math.floor(d / 45)) % 3 === 0 ? 'road_barrier' : (ri + Math.floor(d / 45)) % 3 === 1 ? 'street_light' : 'fence_3m';
        if (coastDist(x, z) > 6 && !inRiver(x, z)) lights.push({ model: m, x, y: baseHeight(x, z), z, yaw: Math.atan2(bx - ax, bz - az), poi: 0 });
      }
    }
  });

  // ---- height map with flat pads under every building ----
  const terrain = new Terrain();
  for (let iz = 0; iz < GRID; iz++) for (let ix = 0; ix < GRID; ix++) terrain.h[iz * GRID + ix] = baseHeight(ix * CELL - HALF, iz * CELL - HALF);
  for (const p of placements) {
    if (!BUILDING_MODELS.has(p.model) && !['boxcar','container_closed_amber','container_closed_blue','container_closed_green','container_closed_laterite','container_open_laterite'].includes(p.model)) continue;
    if (p.model === 'dam_section') continue;
    const s = modelSize(p.model), r = Math.hypot(s[0], s[2]) / 2 + 4, blend = 6;
    for (let iz = 0; iz < GRID; iz++) for (let ix = 0; ix < GRID; ix++) {
      const d = Math.hypot(ix * CELL - HALF - p.x, iz * CELL - HALF - p.z); if (d > r + blend) continue;
      const k = 1 - smooth(r, r + blend, d); terrain.h[iz * GRID + ix] = lerp(terrain.h[iz * GRID + ix], p.y, k);
    }
  }
  for (const p of placements) p.y = terrain.height(p.x, p.z);
  for (const p of lights) p.y = terrain.height(p.x, p.z);

  // ---- vegetation ----
  const veg: Placement[] = [];
  const free = (x: number, z: number, pad: number) => { for (const t of taken) if (Math.hypot(t.x - x, t.z - z) < t.r + pad) return false; return true; };
  const okLand = (x: number, z: number) => coastDist(x, z) > 3 && !inRiver(x, z) && roadDist(x, z) > 6 && terrain.slope(x, z) < 0.7 && polyDist(x, z, RAIL) > 6;
  for (const [x, z] of poisson(rng, 11, (x, z) => okLand(x, z) && coastDist(x, z) < 70 && free(x, z, 3))) veg.push({ model: 'palm_tree', x, y: terrain.height(x, z), z, yaw: rng() * 6.28, poi: 0 });
  for (const [x, z] of poisson(rng, 9, (x, z) => okLand(x, z) && coastDist(x, z) > 35 && free(x, z, 4) && fbm(x * 1.3 + 300, z * 1.3 - 120) > 0.5)) veg.push({ model: 'broadleaf_tree', x, y: terrain.height(x, z), z, yaw: rng() * 6.28, poi: 0 });
  for (const [x, z] of poisson(rng, 9, (x, z) => okLand(x, z) && free(x, z, 3))) veg.push({ model: rng() < 0.6 ? 'bush' : rng() < 0.5 ? 'rock_medium' : 'rock_small', x, y: terrain.height(x, z), z, yaw: rng() * 6.28, poi: 0 });
  for (const [x, z] of poisson(rng, 6, (x, z) => okLand(x, z) && free(x, z, 2), 20000)) veg.push({ model: 'grass_clump', x, y: terrain.height(x, z), z, yaw: rng() * 6.28, poi: 0 });

  return { seed, terrain, placements, vegetation: veg, lights, loot: [], waterLevel: 0 };
}

/** Loot spawns need colliders (to find floors inside buildings), so they are generated after the collider index. */
export function generateLoot(w: WorldData, surfaceBelow: (x: number, z: number, maxY: number) => number | null, blocked: (x: number, z: number, y: number) => boolean, seed = 7): LootSpawn[] {
  const rng = mulberry32(seed); const out: LootSpawn[] = [];
  for (const P of POIS) {
    const target = { low: 14, mid: 22, high: 26, top: 30 }[P.tier];
    const spots: { x: number; z: number; y: number }[] = [];
    for (const p of w.placements.filter((q) => q.poi === P.id)) {
      const s = modelSize(p.model), swap = Math.abs(Math.sin(p.yaw)) > 0.7, ex = (swap ? s[2] : s[0]) / 2, ez = (swap ? s[0] : s[2]) / 2;
      if (BUILDING_MODELS.has(p.model) && !['dam_section','radar_dish','dock_crane','fort_wall_segment','fort_corner_tower','market_stall_amber','market_stall_violet'].includes(p.model)) {
        for (let k = 0; k < 6; k++) {
          // the building models are solid boxes, so loot goes on the ground around them (and on the two-storey roofs), where it can be reached
          const roof = k === 5 && p.model === 'house_twostorey'; let x: number, z: number;
          if (roof) { x = p.x + (rng() * 2 - 1) * (ex - 1); z = p.z + (rng() * 2 - 1) * (ez - 1); }
          else { const a = rng() * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), rr = 1 / Math.max(Math.abs(c) / ex, Math.abs(sn) / ez) + 1.7; x = p.x + c * rr; z = p.z + sn * rr; }
          const y = surfaceBelow(x, z, p.y + (roof ? s[1] + 0.2 : 1.5));
          if (y !== null && !blocked(x, z, y) && (roof ? y > p.y + 3 : true)) { spots.push({ x, z, y }); break; }
        }
      } else if (['crate_wood','container_open_laterite','pallet','sandbag_wall'].includes(p.model) || p.model.startsWith('market')) {
        const a = rng() * 6.28, x = p.x + Math.cos(a) * (ex + 1.2), z = p.z + Math.sin(a) * (ez + 1.2);
        const y = surfaceBelow(x, z, w.terrain.height(x, z) + 1); if (y !== null && !blocked(x, z, y)) spots.push({ x, z, y });
      }
    }
    for (let t = 0; spots.length < target && t < 600; t++) {
      const a = rng() * 6.28, d = 6 + rng() * 38, x = P.x + Math.cos(a) * d, z = P.z + Math.sin(a) * d;
      if (coastDist(x, z) < 3 || inRiver(x, z)) continue;
      const y = surfaceBelow(x, z, w.terrain.height(x, z) + 1); if (y !== null && !blocked(x, z, y)) spots.push({ x, z, y });
    }
    for (const s of spots.slice(0, target)) out.push({ ...s, tier: P.tier, poi: P.id });
  }
  void B; return out;
}
