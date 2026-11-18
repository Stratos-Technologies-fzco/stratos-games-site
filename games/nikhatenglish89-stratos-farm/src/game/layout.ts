import raw from '../data/farm_layout.json';

export interface TerrainRect { frame: string; rect: [number, number, number, number]; animate?: string[] }
export interface LayoutObject {
  id: string;
  kind: 'building' | 'decor' | 'field';
  gx: number; gy: number; w: number; h: number;
  atlas?: string; frame?: string;
  interactive?: boolean;
  soil?: string; crop?: string; stage?: number;
}
export interface InfoEntry { title: string; text: string; lines: string[] }
export interface FarmLayout {
  version: number; cols: number; rows: number;
  terrain: { default: string[]; flowerFrame: string; flowerEvery: number; unbuildable: string[]; rects: TerrainRect[] };
  objects: LayoutObject[];
  info: Record<string, InfoEntry>;
}

export const farmLayout = raw as unknown as FarmLayout;

/** Terrain frame for a tile: explicit rects win, then flowers sprinkled by a stable hash, then plain grass. */
export function terrainFrameAt(l: FarmLayout, gx: number, gy: number): { frame: string; animate?: string[] } {
  for (let i = l.terrain.rects.length - 1; i >= 0; i--) {
    const r = l.terrain.rects[i];
    const [x, y, w, h] = r.rect;
    if (gx >= x && gx < x + w && gy >= y && gy < y + h) return { frame: r.frame, animate: r.animate };
  }
  for (const o of l.objects) {
    if (o.kind === 'field' && gx >= o.gx && gx < o.gx + o.w && gy >= o.gy && gy < o.gy + o.h) return { frame: o.soil ?? 'dirt' };
  }
  if ((gx * 5 + gy) % l.terrain.flowerEvery === 0) return { frame: l.terrain.flowerFrame };
  return { frame: l.terrain.default[(gx * 7 + gy * 3) % l.terrain.default.length] };
}

export function isBuildableTile(l: FarmLayout, gx: number, gy: number): boolean {
  return !l.terrain.unbuildable.includes(terrainFrameAt(l, gx, gy).frame) && !terrainFrameAt(l, gx, gy).animate;
}
