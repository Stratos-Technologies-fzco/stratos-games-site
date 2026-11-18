// main.py's country (CountryLandscape, main.py:339-513), generated with the same rules and counts, in map px.
// Built once when the module loads (fixed seed, like main.py's Random(2026), main.py:343). The sequence of
// random numbers differs from Python's, so the layout is a different draw from the same rules.
import { CITY_COUNT, coastX, WORLD_H_PX as H, WORLD_W_PX as W } from '../config';

export interface Peak {
  x: number;
  y: number;
  r: number; // main.py stores r * 1.6 as the reach
  snow: boolean;
  ridge: number;
  outline: number[]; // x0, y0, x1, y1, ...
}
export interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  tone: number;
  lights: number[]; // lx, ly, colourIndex, ...
}
export interface City {
  x: number;
  y: number;
  r: number;
  name: string;
  blocks: Block[];
}
export interface Forest {
  x: number;
  y: number;
  trees: number[]; // x, y, r, ...
}
export interface Village {
  x: number;
  y: number;
  houses: number[]; // x, y, colourIndex, ...
}
export type Line = number[]; // x0, y0, x1, y1, ...

export const ROOF_COLORS: [number, number, number][] = [[150, 82, 62], [170, 150, 120], [122, 112, 100], [140, 100, 70]]; // main.py:336
export const WINDOW_COLORS: [number, number, number][] = [[255, 222, 140], [255, 196, 96], [210, 232, 255]]; // main.py:511

function rng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const isDesert = (wx: number, wy: number): boolean =>
  (wx - 9600) / 1300 + (wy - 2900) / 800 + 0.35 * Math.sin(wx / 700) + 0.25 * Math.sin(wy / 410) > 1.0; // main.py:487
export const isHighland = (wx: number, wy: number): boolean =>
  wx > 2300 && wx < W - 750 && wy < 640 + 160 * Math.sin(wx / 900) + 40 * Math.sin(wx / 230); // main.py:490

/** main.py:200 chaikin smoothing on a flat x,y list */
function chaikin(pts: Line, iterations = 3): Line {
  let p = pts;
  for (let it = 0; it < iterations; it++) {
    const s: Line = [p[0], p[1]];
    for (let i = 0; i + 3 < p.length; i += 2) {
      const x0 = p[i], y0 = p[i + 1], x1 = p[i + 2], y1 = p[i + 3];
      s.push(0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1, 0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1);
    }
    s.push(p[p.length - 2], p[p.length - 1]);
    p = s;
  }
  return p;
}

export class MapData {
  readonly peaks: Peak[] = [];
  readonly river: Line;
  readonly tributaries: Line[] = [];
  readonly border: Line = [];
  readonly cities: City[] = [];
  readonly highways: Line[] = []; // 2 points each
  readonly railways: Line[] = [];
  readonly airbases: number[] = []; // x, y, ...
  readonly forests: Forest[] = [];
  readonly villages: Village[] = [];

  constructor() {
    const r = rng(2026);
    const U = (a: number, b: number): number => a + r() * (b - a);
    const randint = (a: number, b: number): number => a + Math.floor(r() * (b - a + 1));
    const gauss = (mu: number, sigma: number): number => {
      const u = Math.max(1e-9, r());
      return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
    };

    // northern mountain range (main.py:345-362)
    let x = 2500;
    while (x < W - 900) {
      for (let row = 0; row < 3; row++) {
        const px = x + U(-40, 40);
        const py = 150 + row * 170 + 160 * Math.sin(x / 900) + U(-60, 60);
        const rad = U(40, 95) * (1 - row * 0.2);
        const ridge = U(-0.5, 0.5);
        const outline: number[] = [];
        for (let k = 0; k < 10; k++) {
          const a = ridge + (k * Math.PI) / 5;
          const stretch = 1 + 0.6 * Math.abs(Math.cos(a - ridge));
          const rr = rad * stretch * U(0.55, 1.0);
          outline.push(px + Math.cos(a) * rr * 0.75, py + Math.sin(a) * rr * 0.5);
        }
        const snow = r() < 0.75 - row * 0.3;
        this.peaks.push({ x: px, y: py, r: rad, snow, ridge, outline });
      }
      x += U(40, 75);
    }

    // winding river to the western sea, 4 tributaries (main.py:364-383)
    const nodes: Line = [];
    let ry = H * 0.45;
    let rx = coastX(ry) - 160;
    while (rx <= W + 300) {
      nodes.push(rx, ry);
      rx += U(220, 360);
      ry = Math.max(H * 0.22, Math.min(H * 0.82, ry + U(-170, 170)));
    }
    this.river = chaikin(nodes);
    const n = this.river.length / 2;
    for (let k = 0; k < 4; k++) {
      const i = Math.floor(n * (0.2 + 0.18 * k));
      let sx = this.river[i * 2];
      let sy = this.river[i * 2 + 1];
      let heading = (k % 2 === 0 ? -Math.PI / 2 : Math.PI / 2) + U(-0.4, 0.4);
      const trib: Line = [sx, sy];
      const steps = randint(5, 8);
      for (let s = 0; s < steps; s++) {
        heading += U(-0.45, 0.45);
        sx = Math.max(1200, Math.min(W - 150, sx + Math.cos(heading) * U(200, 290)));
        sy = Math.max(120, Math.min(H - 120, sy + Math.sin(heading) * U(200, 290)));
        trib.push(sx, sy);
      }
      this.tributaries.push(chaikin(trib));
    }

    // frontier with the eastern neighbour (main.py:385-390)
    let bx = W * 0.78;
    for (let i = 0; i < 21; i++) {
      bx = Math.max(W * 0.72, Math.min(W * 0.84, bx + U(-160, 160)));
      this.border.push(bx, (H * i) / 20);
    }

    // cities with street-grid blocks (main.py:399-407, 497-513)
    const gap = (W - 2600) / (CITY_COUNT - 1);
    for (let i = 0; i < CITY_COUNT; i++) {
      const cx = 1500 + i * gap + U(-180, 180);
      const cy = U(1000, H - 550);
      const radius = randint(150, 250);
      const blocks: Block[] = [];
      for (let gx = -radius; gx <= radius; gx += 26) {
        for (let gy = -radius; gy <= radius; gy += 26) {
          const d = Math.hypot(gx, gy) / radius;
          if (d > 0.95 || r() < d * 0.55) continue;
          const w = randint(14, 21);
          const h = randint(14, 21);
          const tone = randint(72, 112);
          const lights: number[] = [];
          const nl = Math.floor(randint(1, 4) * (1.4 - d));
          for (let k = 0; k < nl; k++) lights.push(randint(2, w - 3), randint(2, h - 3), randint(0, 2));
          blocks.push({ x: cx + gx - w / 2, y: cy + gy - h / 2, w, h, tone, lights });
        }
      }
      this.cities.push({ x: cx, y: cy, r: radius, name: `SECTOR-${String.fromCharCode(65 + i)}`, blocks });
    }
    for (let i = 0; i + 1 < this.cities.length; i++) {
      const a = this.cities[i];
      const b = this.cities[i + 1];
      this.highways.push([a.x, a.y, b.x, b.y]); // main.py:408
    }
    for (let i = 0; i + 2 < this.cities.length; i++) {
      const a = this.cities[i];
      const b = this.cities[i + 2];
      const mid = [(a.x + b.x) / 2 + U(-200, 200), (a.y + b.y) / 2 + U(-400, 400)];
      this.railways.push(chaikin([a.x, a.y, mid[0], mid[1], b.x, b.y], 2)); // main.py:409-412
    }
    for (const i of [2, 6, 9]) {
      const c = this.cities[i];
      this.airbases.push(c.x + (r() < 0.5 ? -1 : 1) * 520, c.y + U(-260, 260)); // main.py:414-418
    }

    // forests and villages (main.py:420-435)
    for (let k = 0; k < 70; k++) {
      const fx = U(1500, W - 400);
      let fy = U(700, H - 300);
      if (fy > 1300 && r() < 0.6) fy = U(700, 1300);
      const trees: number[] = [];
      const nt = randint(25, 45);
      for (let t = 0; t < nt; t++) trees.push(gauss(fx, 60), gauss(fy, 40), randint(5, 10));
      this.forests.push({ x: fx, y: fy, trees });
    }
    while (this.villages.length < 240) {
      const vy = U(800, H - 150);
      const vx = U(coastX(vy) + 80, W - 150);
      if (this.cities.some((c) => Math.hypot(c.x - vx, c.y - vy) < c.r * 1.4)) continue;
      const houses: number[] = [];
      const nh = randint(5, 12);
      for (let h = 0; h < nh; h++) houses.push(vx + U(-28, 28), vy + U(-20, 20), randint(0, 3));
      this.villages.push({ x: vx, y: vy, houses });
    }
  }

  /** main.py:492 the frontier's x at map row wy */
  borderX(wy: number): number {
    const i = Math.min(this.border.length / 2 - 2, Math.max(0, Math.floor((wy / H) * 20)));
    const x0 = this.border[i * 2], y0 = this.border[i * 2 + 1];
    const x1 = this.border[i * 2 + 2], y1 = this.border[i * 2 + 3];
    return x0 + (x1 - x0) * ((wy - y0) / (y1 - y0));
  }

  /** distance in px from (x, y) to the nearest river point (main.py:451 uses every 2nd point) */
  nearRiver(x: number, y: number, dist: number): boolean {
    const p = this.river;
    for (let i = 0; i < p.length; i += 4) if (Math.hypot(p[i] - x, p[i + 1] - y) < dist) return true;
    return false;
  }
}

export const MAP = new MapData();
