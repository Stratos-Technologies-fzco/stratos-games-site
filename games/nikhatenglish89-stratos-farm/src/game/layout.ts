import raw from '../data/farm_layout.json';

export interface TerrainRect { frame: string; rect: [number, number, number, number]; animate?: string[] }
export interface LayoutObject {
  id: string;
  kind: 'building' | 'decor' | 'field';
  gx: number; gy: number; w: number; h: number;
  atlas?: string; frame?: string;
  interactive?: boolean;
  soil?: string;
}
export interface InfoEntry { title: string; text: string; lines: string[] }
import type { ExpansionDef } from '../services/types';
export interface FarmLayout {
  expansions: ExpansionDef[];
  version: number; cols: number; rows: number;
  terrain: { default: string[]; flowerFrame: string; flowerEvery: number; unbuildable: string[]; rects: TerrainRect[] };
  objects: LayoutObject[];
  info: Record<string, InfoEntry>;
}

export const farmLayout = raw as unknown as FarmLayout;

/** Terrain frame for a tile: explicit rects win, then flowers sprinkled by a stable hash, then plain grass. */
const inRect = (r: number[], gx: number, gy: number) => gx >= r[0] && gx < r[0] + r[2] && gy >= r[1] && gy < r[1] + r[3];

export function terrainFrameAt(l: FarmLayout, gx: number, gy: number, expanded: string[] = []): { frame: string; animate?: string[] } {
  // a cleared patch is plain grass, whatever the locked-land rectangle says
  const cleared = l.expansions.some((e) => expanded.includes(e.id) && inRect(e.rect, gx, gy));
  for (let i = l.terrain.rects.length - 1; i >= 0; i--) {
    const r = l.terrain.rects[i];
    if (cleared && r.frame === 'locked_land') continue;
    const [x, y, w, h] = r.rect;
    if (gx >= x && gx < x + w && gy >= y && gy < y + h) return { frame: r.frame, animate: r.animate };
  }
  for (const o of l.objects) {
    if (o.kind === 'field' && gx >= o.gx && gx < o.gx + o.w && gy >= o.gy && gy < o.gy + o.h) return { frame: o.soil ?? 'dirt' };
  }
  if ((gx * 5 + gy) % l.terrain.flowerEvery === 0) return { frame: l.terrain.flowerFrame };
  return { frame: l.terrain.default[(gx * 7 + gy * 3) % l.terrain.default.length] };
}

export function isBuildableTile(l: FarmLayout, gx: number, gy: number, expanded: string[] = []): boolean {
  const t = terrainFrameAt(l, gx, gy, expanded);
  return !l.terrain.unbuildable.includes(t.frame) && !t.animate;
}

/** Every tile of every field is one plot: the farm service owns what grows on it. */
export function plotCells(l: FarmLayout): { gx: number; gy: number }[] {
  const out: { gx: number; gy: number }[] = [];
  for (const o of l.objects) {
    if (o.kind !== 'field') continue;
    for (let dx = 0; dx < o.w; dx++) for (let dy = 0; dy < o.h; dy++) out.push({ gx: o.gx + dx, gy: o.gy + dy });
  }
  return out;
}

import type { WorldConfig } from '../services/LocalFarmService';
export function worldConfig(l: FarmLayout): WorldConfig {
  return {
    cols: l.cols, rows: l.rows, plotCells: plotCells(l),
    staticObjects: l.objects.map((o) => ({ id: o.id, gx: o.gx, gy: o.gy, w: o.w, h: o.h })),
    isBuildable: (gx, gy) => isBuildableTile(l, gx, gy),
    expansions: l.expansions,
  };
}

/** The expansion whose still-locked patch covers this tile, if any. */
export function lockedExpansionAt(l: FarmLayout, gx: number, gy: number, expanded: string[]): ExpansionDef | null {
  return l.expansions.find((e) => !expanded.includes(e.id) && inRect(e.rect, gx, gy)) ?? null;
}
