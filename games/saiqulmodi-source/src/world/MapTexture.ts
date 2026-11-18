// The ground picture, painted once at start (no downloads): main.py's _render_tile (main.py:516-671) for the day
// and _render_light_tile (main.py:674-738) for the night lights, over the whole 14,000 x 5,000 px map.
// 1 texel = 4 map px (16 m). Lines thinner than a texel are drawn one texel wide.
import { CanvasTexture, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';
import { coastX, WORLD_H_PX as H, WORLD_W_PX as W } from '../config';
import { isDesert, isHighland, MAP, ROOF_COLORS, WINDOW_COLORS } from './MapData';

export const TEX_SCALE = 0.25; // texels per map px
const MIN_W = 1 / TEX_SCALE; // one texel, in px

const FIELD_COLORS = ['rgb(70,122,48)', 'rgb(62,114,42)', 'rgb(80,130,52)', 'rgb(92,136,54)', 'rgb(66,118,46)', 'rgb(104,140,58)']; // main.py:334
const SAND = [[170, 148, 102], [162, 140, 96], [178, 156, 108], [156, 136, 94]]; // main.py:335
const rgb = (c: number[] | readonly number[]): string => `rgb(${c[0]},${c[1]},${c[2]})`;

function canvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = Math.round(W * TEX_SCALE);
  c.height = Math.round(H * TEX_SCALE);
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  ctx.scale(TEX_SCALE, TEX_SCALE);
  return [c, ctx];
}

function polyline(ctx: CanvasRenderingContext2D, p: number[]): void {
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
}

/** main.py hashes the cell corner with 64-bit ints and keeps 16 bits; Math.imul keeps the same low bits */
const cellHash = (gx: number, gy: number): number => (Math.imul(gx, 73856093) ^ Math.imul(gy, 19349663)) & 0xffff;

function paintDay(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgb(60,108,42)'; // main.py:520 continental grassland
  ctx.fillRect(0, 0, W, H);

  // farmland / pasture, desert dunes, rocky highland (main.py:522-551)
  const cell = 160;
  for (let gx = 0; gx < W; gx += cell) {
    for (let gy = 0; gy < H; gy += cell) {
      const h = cellHash(gx, gy);
      if (isDesert(gx + cell / 2, gy + cell / 2)) {
        const col = SAND[h % SAND.length];
        ctx.fillStyle = rgb(col);
        ctx.fillRect(gx, gy, cell, cell);
        ctx.strokeStyle = rgb([col[0] - 18, col[1] - 18, col[2] - 14]);
        ctx.lineWidth = MIN_W;
        for (let k = 0; k < 3; k++) {
          const y = gy + 22 + k * 48 + ((h >> (k * 3)) % 17);
          const x = gx + ((h >> (k * 4)) % 50);
          const w = 70 + ((h >> k) % 50);
          ctx.beginPath();
          ctx.ellipse(x + w / 2, y + 13, w / 2, 13, 0, -2.8, -0.3);
          ctx.stroke();
        }
        continue;
      }
      if (isHighland(gx + cell / 2, gy + cell / 2)) {
        ctx.fillStyle = 'rgb(54,60,46)';
        ctx.fillRect(gx, gy, cell, cell);
        for (let k = 0; k < 6; k++) {
          ctx.fillStyle = k % 2 ? 'rgb(46,52,40)' : 'rgb(62,66,52)';
          ctx.beginPath();
          ctx.ellipse(gx + ((h * (k + 3)) % cell) + 20, gy + (((h * (k + 7)) >> 3) % cell) + 11, 20, 11, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        continue;
      }
      const inset = 3 + (h % 4);
      const col = FIELD_COLORS[h % FIELD_COLORS.length];
      ctx.fillStyle = col;
      ctx.fillRect(gx + inset, gy + inset, cell - 2 * inset, cell - 2 * inset);
      if (h % 7 === 0 && h % 5 !== 0) {
        ctx.fillStyle = 'rgb(38,82,32)'; // woodland
        ctx.beginPath();
        ctx.ellipse(gx + cell / 2, gy + cell / 2, (cell - 2 * inset - 30) / 2, (cell - 2 * inset - 46) / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // forests (main.py:553-559)
  for (const f of MAP.forests) {
    for (let i = 0; i < f.trees.length; i += 3) {
      ctx.fillStyle = 'rgb(26,58,24)';
      ctx.beginPath();
      ctx.arc(f.trees[i] + 2, f.trees[i + 1] + 2, f.trees[i + 2], 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgb(40,88,34)';
      ctx.beginPath();
      ctx.arc(f.trees[i], f.trees[i + 1], f.trees[i + 2], 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // mountain range: lit face, shadow face, crest, snow cap (main.py:561-574)
  for (const p of MAP.peaks) {
    const o = p.outline;
    ctx.fillStyle = 'rgb(78,74,60)';
    polyline(ctx, o);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgb(52,49,42)';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    for (let k = 1; k < 5; k++) ctx.lineTo(o[k * 2], o[k * 2 + 1]);
    ctx.closePath();
    ctx.fill();
    if (p.snow) {
      ctx.fillStyle = 'rgb(222,226,232)';
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const x = p.x + (o[k * 2] - p.x) * 0.32;
        const y = p.y + (o[k * 2 + 1] - p.y) * 0.32;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // highways and railways (main.py:576-590)
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgb(74,74,68)';
  ctx.lineWidth = Math.max(3, MIN_W);
  for (const hw of MAP.highways) {
    polyline(ctx, hw);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgb(48,42,36)';
  ctx.lineWidth = MIN_W;
  for (const rl of MAP.railways) {
    polyline(ctx, rl);
    ctx.stroke();
  }

  // rivers: dark banks, water, the main river's bright centre (main.py:592-610)
  const rivers: [number[], number | null][] = [[MAP.river, null], ...MAP.tributaries.map((t) => [t, 5] as [number[], number])];
  for (const pass of [0, 1]) {
    for (const [line, baseW] of rivers) {
      for (let i = 0; i + 3 < line.length; i += 2) {
        const w = baseW ?? 7 + 9 * Math.max(0, 1 - line[i] / W);
        ctx.strokeStyle = pass === 0 ? 'rgb(28,54,48)' : 'rgb(34,84,132)';
        ctx.lineWidth = Math.max(MIN_W, pass === 0 ? w + 5 : w);
        ctx.beginPath();
        ctx.moveTo(line[i], line[i + 1]);
        ctx.lineTo(line[i + 2], line[i + 3]);
        ctx.stroke();
      }
    }
  }

  // western ocean, beach and surf lines (main.py:612-626)
  for (let y = 0; y < H; y += MIN_W) {
    const cx = coastX(y);
    const bands: [number, number, string][] = [
      [0, cx - 140, 'rgb(14,34,78)'],
      [cx - 140, cx - 50, 'rgb(18,46,96)'],
      [cx - 50, cx, 'rgb(26,70,120)'],
      [cx, cx + 7, 'rgb(168,160,120)'],
    ];
    for (const [x0, x1, col] of bands) {
      ctx.fillStyle = col;
      ctx.fillRect(x0, y, Math.max(MIN_W, x1 - x0), MIN_W);
    }
  }
  for (const [off, col] of [[-8, 'rgb(200,226,236)'], [-19, 'rgb(120,172,204)'], [-32, 'rgb(70,122,172)']] as [number, string][]) {
    ctx.strokeStyle = col;
    ctx.lineWidth = MIN_W * 0.7;
    ctx.beginPath();
    for (let y = -8; y < H + 9; y += 8) {
      const x = coastX(y) + off + 3 * Math.sin(y / 23 + off);
      if (y === -8) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // villages (main.py:628-633)
  for (const v of MAP.villages) {
    for (let i = 0; i < v.houses.length; i += 3) {
      ctx.fillStyle = rgb(ROOF_COLORS[v.houses[i + 2]]);
      ctx.fillRect(v.houses[i], v.houses[i + 1], MIN_W, MIN_W);
    }
  }

  // airbases: runway, centre-line marks, taxiway, apron, shelters (main.py:635-646)
  for (let i = 0; i < MAP.airbases.length; i += 2) {
    const ax = MAP.airbases[i];
    const ay = MAP.airbases[i + 1];
    ctx.fillStyle = 'rgb(86,88,86)';
    ctx.fillRect(ax - 130, ay - 6, 260, 12);
    ctx.fillStyle = 'rgb(220,220,210)';
    for (let d = -120; d < 120; d += 16) ctx.fillRect(ax + d, ay - 1, 8, Math.max(2, MIN_W * 0.5));
    ctx.fillStyle = 'rgb(76,78,76)';
    ctx.fillRect(ax - 100, ay + 14, 200, 4);
    ctx.fillStyle = 'rgb(80,82,80)';
    ctx.fillRect(ax - 30, ay + 20, 60, 22);
  }

  // cities: suburbs, asphalt, blocks with lit windows, main avenues (main.py:648-665)
  for (const c of MAP.cities) {
    ctx.fillStyle = isDesert(c.x, c.y) ? 'rgb(128,114,84)' : 'rgb(46,60,48)';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r * 1.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgb(56,58,60)';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
    for (const b of c.blocks) {
      ctx.fillStyle = `rgb(${b.tone},${b.tone},${b.tone + 6})`;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
    ctx.strokeStyle = 'rgb(176,160,110)';
    ctx.lineWidth = MIN_W;
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(c.x - c.r, c.y + k * 6);
      ctx.lineTo(c.x + c.r, c.y + k * 6);
      ctx.moveTo(c.x + k * 6, c.y - c.r);
      ctx.lineTo(c.x + k * 6, c.y + c.r);
      ctx.stroke();
    }
  }

  // national boundary, dashed (main.py:391-397, 667-670)
  ctx.strokeStyle = 'rgb(196,92,80)';
  ctx.lineWidth = MIN_W;
  ctx.setLineDash([26, 18]);
  polyline(ctx, MAP.border);
  ctx.stroke();
  ctx.setLineDash([]);
}

function paintNight(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter'; // lights add up (main.py BLEND_ADD)
  const lamp = (x: number, y: number, core: string, glow: number[], r: number): void => {
    ctx.fillStyle = rgb(glow);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgb([glow[0] * 2, glow[1] * 2, glow[2] * 2]);
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1, r / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = core;
    ctx.fillRect(x, y, MIN_W * 0.5, MIN_W * 0.5);
  };

  // highways: a sodium-orange ribbon of street lamps (main.py:686-697)
  for (const hw of MAP.highways) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgb(40,26,6)';
    ctx.lineWidth = 7;
    polyline(ctx, hw);
    ctx.stroke();
    ctx.strokeStyle = 'rgb(110,74,22)';
    ctx.lineWidth = MIN_W * 0.5;
    ctx.stroke();
    const seg = Math.hypot(hw[2] - hw[0], hw[3] - hw[1]);
    ctx.fillStyle = 'rgb(255,196,110)';
    for (let d = 0; d < seg; d += 18) {
      ctx.fillRect(hw[0] + ((hw[2] - hw[0]) * d) / seg, hw[1] + ((hw[3] - hw[1]) * d) / seg, MIN_W * 0.5, MIN_W * 0.5);
    }
  }
  // villages: a few lit windows each (main.py:698-704)
  for (const v of MAP.villages) {
    for (let i = 0, k = 0; i < v.houses.length; i += 3, k++) {
      if ((Math.floor(v.houses[i]) + k) % 3) lamp(v.houses[i], v.houses[i + 1], 'rgb(255,214,140)', [26, 18, 6], 4);
    }
  }
  // airbases: runway edge lights, threshold greens, the apron floodlit (main.py:705-715)
  for (let i = 0; i < MAP.airbases.length; i += 2) {
    const ax = MAP.airbases[i];
    const ay = MAP.airbases[i + 1];
    ctx.fillStyle = 'rgb(235,235,220)';
    for (let d = -128; d < 130; d += 12) {
      ctx.fillRect(ax + d, ay - 7, MIN_W * 0.5, MIN_W * 0.5);
      ctx.fillRect(ax + d, ay + 6, MIN_W * 0.5, MIN_W * 0.5);
    }
    ctx.fillStyle = 'rgb(40,230,90)';
    for (const end of [-131, 129]) ctx.fillRect(ax + end, ay - 6, MIN_W * 0.5, 12);
    ctx.fillStyle = 'rgb(60,52,30)';
    ctx.fillRect(ax - 34, ay + 18, 68, 26);
  }
  // cities: sky glow, lit street grid, glowing avenues, windows (main.py:716-737)
  for (const c of MAP.cities) {
    for (const [f, glow] of [[1.2, [12, 8, 3]], [0.95, [20, 13, 5]], [0.65, [28, 19, 7]], [0.35, [36, 25, 9]]] as [number, number[]][]) {
      ctx.fillStyle = rgb(glow);
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r * f, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgb(96,70,28)';
    ctx.lineWidth = MIN_W * 0.5;
    ctx.beginPath();
    for (let off = -c.r + 13; off < c.r; off += 26) {
      const half = Math.sqrt(Math.max(0, c.r * c.r - off * off));
      ctx.moveTo(c.x + off, c.y - half);
      ctx.lineTo(c.x + off, c.y + half);
      ctx.moveTo(c.x - half, c.y + off);
      ctx.lineTo(c.x + half, c.y + off);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgb(230,170,80)';
    ctx.lineWidth = MIN_W * 0.7;
    ctx.beginPath();
    for (const k of [-1, 1]) {
      ctx.moveTo(c.x - c.r, c.y + k * 6);
      ctx.lineTo(c.x + c.r, c.y + k * 6);
      ctx.moveTo(c.x + k * 6, c.y - c.r);
      ctx.lineTo(c.x + k * 6, c.y + c.r);
    }
    ctx.stroke();
    for (const b of c.blocks) {
      ctx.fillStyle = 'rgb(30,26,18)';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      for (let i = 0; i < b.lights.length; i += 3) {
        ctx.fillStyle = rgb(WINDOW_COLORS[b.lights[i + 2]]);
        ctx.fillRect(b.x + b.lights[i], b.y + b.lights[i + 1], MIN_W * 0.6, MIN_W * 0.6);
      }
    }
  }
  ctx.globalCompositeOperation = 'source-over';
}

export function makeMapTextures(): { day: CanvasTexture; night: CanvasTexture } {
  const [dc, dctx] = canvas();
  paintDay(dctx);
  const [nc, nctx] = canvas();
  paintNight(nctx);
  const tex = (c: HTMLCanvasElement): CanvasTexture => {
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.minFilter = LinearMipmapLinearFilter;
    t.anisotropy = 4;
    t.flipY = false;
    return t;
  };
  return { day: tex(dc), night: tex(nc) };
}
