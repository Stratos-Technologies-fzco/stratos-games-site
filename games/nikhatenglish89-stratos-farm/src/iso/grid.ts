// Reusable isometric math. 2:1 diamond tiles; gx runs down-right, gy runs down-left.
export interface IsoConfig { tileW: number; tileH: number }
export const DEFAULT_ISO: IsoConfig = { tileW: 128, tileH: 64 };

export interface Point { x: number; y: number }
export interface Cell { gx: number; gy: number }
export interface Footprint { w: number; h: number }

/** Screen position of the TOP vertex of tile (gx, gy). */
export function gridToScreen(gx: number, gy: number, c: IsoConfig = DEFAULT_ISO): Point {
  return { x: ((gx - gy) * c.tileW) / 2, y: ((gx + gy) * c.tileH) / 2 };
}

/** Fractional grid position of a world point (inverse of gridToScreen). */
export function screenToGridF(x: number, y: number, c: IsoConfig = DEFAULT_ISO): Point {
  const a = (2 * x) / c.tileW; // gx - gy
  const b = (2 * y) / c.tileH; // gx + gy
  return { x: (a + b) / 2, y: (b - a) / 2 };
}

/** Integer tile containing a world point. Tile (gx,gy) spans [gx,gx+1) x [gy,gy+1) in fractional grid space. */
export function screenToGrid(x: number, y: number, c: IsoConfig = DEFAULT_ISO): Cell {
  const f = screenToGridF(x, y, c);
  return { gx: Math.floor(f.x), gy: Math.floor(f.y) };
}

/** Sort key: front-most cell of the footprint, then layer. Larger draws later (in front). */
export function depthKey(gx: number, gy: number, fp: Footprint = { w: 1, h: 1 }, layer = 0): number {
  const front = gx + fp.w - 1 + (gy + fp.h - 1);
  return front * 1000 + layer;
}

export function cellsOf(gx: number, gy: number, fp: Footprint): Cell[] {
  const out: Cell[] = [];
  for (let dx = 0; dx < fp.w; dx++) for (let dy = 0; dy < fp.h; dy++) out.push({ gx: gx + dx, gy: gy + dy });
  return out;
}

/** World pixel bounds of a cols x rows tile grid (top vertex of (0,0) is x=0,y=0). */
export function worldBounds(cols: number, rows: number, c: IsoConfig = DEFAULT_ISO, pad = 0) {
  const left = gridToScreen(0, rows, c).x;
  const right = gridToScreen(cols, 0, c).x;
  const bottom = gridToScreen(cols, rows, c).y;
  return { x: left - pad, y: -pad, width: right - left + pad * 2, height: bottom + pad * 2 };
}
