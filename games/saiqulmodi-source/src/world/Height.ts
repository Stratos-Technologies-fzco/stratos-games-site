// Ground height from main.py's map: the western sea (main.py:483, 612-626), the northern mountain range
// (main.py:345-362, 561-574), rivers in their valleys (main.py:364-383, 592-610), the south-eastern desert
// (main.py:487) and rolling farmland elsewhere. Precomputed once into a 16 px (64 m) grid; outside the map the
// sea continues to the west and the map's mirror image to the north, east and south.
import { coastX, PX_M, WORLD_H_PX as H, WORLD_W_PX as W } from '../config';
import { isDesert, isHighland, MAP } from './MapData';

const CELL = 16; // px
const GW = Math.ceil(W / CELL) + 1;
const GH = Math.ceil(H / CELL) + 1;
const SEA = 0; // the water surface; land is always above 0.5 m

// ---- value noise ----
function hash(ix: number, iz: number): number {
  let h = (ix * 374761393 + iz * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h & 0xffffff) / 0xffffff;
}
export function noise(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz);
  const b = hash(ix + 1, iz);
  const c = hash(ix, iz + 1);
  const d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x: number, z: number): number {
  let f = 0;
  let amp = 1;
  let freq = 1;
  for (let o = 0; o < 4; o++) {
    f += amp * noise(x * freq + o * 17.3, z * freq - o * 9.1);
    amp *= 0.5;
    freq *= 2.03;
  }
  return f / 1.875; // 0..1
}

/** rolling farmland, metres (world x, z in metres) */
function plains(x: number, z: number): number {
  return 60 + fbm(x / 9000, z / 9000) * 380;
}

const smooth = (e0: number, e1: number, v: number): number => {
  const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// ---- build the grid ----
const grid = new Float32Array(GW * GH);
(function build(): void {
  // distance to the nearest river / tributary, px (rasterised segment by segment)
  const river = new Float32Array(GW * GH).fill(1e9);
  const width = new Float32Array(GW * GH).fill(6);
  const lines: [number[], number | null][] = [[MAP.river, null], ...MAP.tributaries.map((t) => [t, 5] as [number[], number])];
  const reach = 220;
  for (const [line, baseW] of lines) {
    for (let i = 0; i + 3 < line.length; i += 2) {
      const ax = line[i], ay = line[i + 1], bx = line[i + 2], by = line[i + 3];
      const w = baseW ?? 7 + 9 * Math.max(0, 1 - ax / W); // main.py:597 the main river widens toward its mouth
      const gx0 = Math.max(0, Math.floor((Math.min(ax, bx) - reach) / CELL));
      const gx1 = Math.min(GW - 1, Math.ceil((Math.max(ax, bx) + reach) / CELL));
      const gy0 = Math.max(0, Math.floor((Math.min(ay, by) - reach) / CELL));
      const gy1 = Math.min(GH - 1, Math.ceil((Math.max(ay, by) + reach) / CELL));
      const dx = bx - ax, dy = by - ay;
      const len2 = dx * dx + dy * dy || 1;
      for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          const px = gx * CELL, py = gy * CELL;
          const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
          const d = Math.hypot(px - ax - t * dx, py - ay - t * dy);
          const k = gy * GW + gx;
          if (d < river[k]) {
            river[k] = d;
            width[k] = w;
          }
        }
      }
    }
  }
  // mountain peaks: the highest cone wins (main.py draws each peak with reach r * 1.6)
  const peaks = new Float32Array(GW * GH);
  for (const p of MAP.peaks) {
    const reachP = p.r * 1.6 * 2.2; // wider than main.py's drawn reach: a 3D massif, not a needle
    const top = p.r * 22 + (p.snow ? 300 : 0); // 900 - 2,400 m; snow caps on the tall ones
    const gx0 = Math.max(0, Math.floor((p.x - reachP) / CELL));
    const gx1 = Math.min(GW - 1, Math.ceil((p.x + reachP) / CELL));
    const gy0 = Math.max(0, Math.floor((p.y - reachP) / CELL));
    const gy1 = Math.min(GH - 1, Math.ceil((p.y + reachP) / CELL));
    for (let gy = gy0; gy <= gy1; gy++) {
      for (let gx = gx0; gx <= gx1; gx++) {
        // ridges run roughly east-west (main.py:353): stretch along the ridge
        const ux = gx * CELL - p.x, uy = gy * CELL - p.y;
        const along = ux * Math.cos(p.ridge) + uy * Math.sin(p.ridge);
        const across = -ux * Math.sin(p.ridge) + uy * Math.cos(p.ridge);
        const d = Math.hypot(along * 0.7, across) / reachP;
        if (d >= 1) continue;
        const u = 1 - d;
        const hgt = top * u * u * (3 - 2 * u); // smooth shoulder, rounded top
        const k = gy * GW + gx;
        if (hgt > peaks[k]) peaks[k] = hgt;
      }
    }
  }
  for (let gy = 0; gy < GH; gy++) {
    const py = gy * CELL;
    const coast = coastX(py);
    for (let gx = 0; gx < GW; gx++) {
      const px = gx * CELL;
      const k = gy * GW + gx;
      if (px < coast) {
        grid[k] = SEA; // western ocean
        continue;
      }
      const x = (px - W / 2) * PX_M;
      const z = (py - H / 2) * PX_M;
      let hgt = plains(x, z);
      if (isDesert(px, py)) hgt = 80 + fbm(x / 3000, z / 3000) * 90; // flat dunes
      // highland: a raised plateau under the peaks (main.py:490 band)
      const band = 640 + 160 * Math.sin(px / 900) + 40 * Math.sin(px / 230);
      const into = smooth(band + 250, band - 150, py) * smooth(2000, 2600, px) * smooth(W - 450, W - 900, px);
      hgt += into * (500 + fbm(x / 4000, z / 4000) * 500) + peaks[k];
      if (isHighland(px, py)) hgt += fbm(x / 1500, z / 1500) * 200;
      // shore: land rises from the beach (main.py:612-626)
      hgt = 1 + (hgt - 1) * smooth(0, 260, px - coast);
      // river valley: the water at 1 m, banks rising over 200 px
      const w = width[k];
      const v = smooth(w * 0.6, w + 200, river[k]);
      hgt = 1 + (hgt - 1) * v;
      grid[k] = Math.max(1, hgt);
    }
  }
})();

/** Ground height in metres at world (x, z). Same function for drawing, collisions and placing things. */
export function heightAt(x: number, z: number): number {
  const px = x / PX_M + W / 2;
  const py = z / PX_M + H / 2;
  if (px < 0) return SEA; // the ocean goes on to the west
  if (px > W || py < 0 || py > H) {
    // Beyond the map the country carries on as its mirror image (north: the mountain range continues instead of
    // ending in a wall; east / south: farmland, frontier and desert), so the ground meets the horizon naturally.
    // The terrain shader mirrors the map colours the same way.
    return sample(mirror(px, W), mirror(py, H));
  }
  return sample(px, py);
}

/** triangle-wave mirror of v into 0..size (0..size stays, size..2 size flips back, -size..0 flips) */
function mirror(v: number, size: number): number {
  const m = ((v % (2 * size)) + 2 * size) % (2 * size);
  return m <= size ? m : 2 * size - m;
}

function sample(px: number, py: number): number {
  const fx = px / CELL;
  const fy = py / CELL;
  const ix = Math.min(GW - 2, Math.floor(fx));
  const iy = Math.min(GH - 2, Math.floor(fy));
  const tx = fx - ix;
  const ty = fy - iy;
  const k = iy * GW + ix;
  const a = grid[k];
  const b = grid[k + 1];
  const c = grid[k + GW];
  const d = grid[k + GW + 1];
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
}
