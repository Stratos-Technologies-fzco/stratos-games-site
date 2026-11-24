import raw from '../data/farm_layout.json';
import type { ExpansionDef, ObstacleDef } from '../services/types';
import { OBSTACLE_TYPES } from '../services/data';
import type { WorldConfig } from '../services/LocalFarmService';

export interface TerrainRect { frame: string; rect: [number, number, number, number]; animate?: string[] }
export interface LayoutObject {
  id: string;
  kind: 'building' | 'decor' | 'field';
  gx: number; gy: number; w: number; h: number;
  atlas?: string; frame?: string;
  interactive?: boolean;
  soil?: string;
  /** a rock, tree or bush the player can pay to clear */
  clearable?: boolean;
  /** a field the player can buy: it is on the map only once bought (its spot is then in `moved`) */
  extra?: boolean;
}
export interface InfoEntry { title: string; text: string; lines: string[] }
export interface FarmLayout {
  /** Hand-placed patches inside the starting island. The outer lots are generated below. */
  expansions: ExpansionDef[];
  version: number;
  /** The whole world grid (the farm can grow out to here). */
  cols: number; rows: number;
  /** The starting island. */
  base: { cols: number; rows: number };
  /** The world beyond the island is sold in square lots of this size. */
  lots: { size: number };
  terrain: { default: string[]; flowerFrame: string; flowerEvery: number; unbuildable: string[]; rects: TerrainRect[] };
  objects: LayoutObject[];
  info: Record<string, InfoEntry>;
}

const inRect = (r: number[], gx: number, gy: number) => gx >= r[0] && gx < r[0] + r[2] && gy >= r[1] && gy < r[1] + r[3];

// ---------- the land you can buy beyond the island ----------
// Rings: lots touching the island are ring 1, the next layer ring 2, and so on. Each ring costs more, needs a higher level and
// asks for better factory goods. A lot can only be cleared when it touches land you already own.
const RING_RULES = [
  { cost: 350, level: 2, materials: { flour: 3 } as Record<string, number> },
  { cost: 1200, level: 5, materials: { bread: 4, cheese: 2 } },
  { cost: 3500, level: 9, materials: { cake: 2, sweater: 1, strawberry_jam: 2 } },
];

export function lotId(lx: number, ly: number) { return `lot_${lx}_${ly}`; }

export function generateLots(l: Pick<FarmLayout, 'cols' | 'rows' | 'base' | 'lots'>): ExpansionDef[] {
  const s = l.lots.size;
  const baseLx = Math.ceil(l.base.cols / s), baseLy = Math.ceil(l.base.rows / s);
  const nx = Math.floor(l.cols / s), ny = Math.floor(l.rows / s);
  const out: ExpansionDef[] = [];
  for (let ly = 0; ly < ny; ly++) for (let lx = 0; lx < nx; lx++) {
    if (lx < baseLx && ly < baseLy) continue; // that is the island
    const ring = Math.max(lx - baseLx + 1, ly - baseLy + 1, 1);
    const rule = RING_RULES[Math.min(ring, RING_RULES.length) - 1];
    const n = out.length;
    out.push({
      id: lotId(lx, ly), name: `Land lot ${n + 1}`, rect: [lx * s, ly * s, s, s],
      cost: Math.round((rule.cost * (1 + (n % 5) * 0.1)) / 10) * 10, materials: { ...rule.materials }, unlockLevel: rule.level,
    });
  }
  return out;
}

const parsed = raw as unknown as FarmLayout;
export const farmLayout: FarmLayout = { ...parsed, expansions: [...parsed.expansions, ...generateLots(parsed)] };

export const isLot = (id: string) => id.startsWith('lot_');
const lotOfTile = (l: FarmLayout, gx: number, gy: number) => l.expansions.find((e) => isLot(e.id) && inRect(e.rect, gx, gy)) ?? null;
const inBase = (l: FarmLayout, gx: number, gy: number) => gx >= 0 && gy >= 0 && gx < l.base.cols && gy < l.base.rows;

/** Does the lot touch land the player already owns (the island or a cleared lot)? */
export function lotTouchesOwned(l: FarmLayout, lot: ExpansionDef, expanded: string[]): boolean {
  const [x, y, w, h] = lot.rect;
  const owned = (gx: number, gy: number) => inBase(l, gx, gy) || expanded.some((id) => { const e = l.expansions.find((q) => q.id === id); return !!e && isLot(e.id) && inRect(e.rect, gx, gy); });
  for (let i = 0; i < w; i++) {
    if (owned(x + i, y - 1) || owned(x + i, y + h)) return true;
  }
  for (let j = 0; j < h; j++) {
    if (owned(x - 1, y + j) || owned(x + w, y + j)) return true;
  }
  return false;
}

/** What a tile is right now: the starting island, a cleared lot, a lot you can buy next, or open sea (nothing). */
export type LandState = 'base' | 'cleared' | 'locked' | 'sea';
export function landState(l: FarmLayout, gx: number, gy: number, expanded: string[]): LandState {
  if (gx < 0 || gy < 0 || gx >= l.cols || gy >= l.rows) return 'sea';
  if (inBase(l, gx, gy)) return 'base';
  const lot = lotOfTile(l, gx, gy);
  if (!lot) return 'sea';
  if (expanded.includes(lot.id)) return 'cleared';
  return lotTouchesOwned(l, lot, expanded) ? 'locked' : 'sea';
}

/** Terrain frame for a tile: explicit rects win, then flowers sprinkled by a stable hash, then plain grass. null = open sea. */
export type Moved = Record<string, { gx: number; gy: number }>;

/** An object where it stands now (the layout position, unless the player moved it). */
export function placedAt<T extends { id: string; gx: number; gy: number }>(o: T, moved: Moved): T {
  const m = moved[o.id];
  return m ? { ...o, gx: m.gx, gy: m.gy } : o;
}

/** Is this object on the map? Everything is, except a field that has not been bought yet. */
export const isLive = (o: { id: string; extra?: boolean }, moved: Moved) => !o.extra || !!moved[o.id];

export function terrainFrameAt(l: FarmLayout, gx: number, gy: number, expanded: string[] = [], moved: Moved = {}): { frame: string; animate?: string[] } {
  const state = landState(l, gx, gy, expanded);
  if (state === 'sea') return { frame: '' };
  if (state === 'locked') return { frame: 'locked_land' };
  if (state === 'cleared') {
    if ((gx * 5 + gy) % l.terrain.flowerEvery === 0) return { frame: l.terrain.flowerFrame };
    return { frame: l.terrain.default[(gx * 7 + gy * 3) % l.terrain.default.length] };
  }
  // a cleared patch inside the island is plain grass, whatever the locked-land rectangle says
  const cleared = l.expansions.some((e) => !isLot(e.id) && expanded.includes(e.id) && inRect(e.rect, gx, gy));
  for (const f of l.objects) {
    if (f.kind !== 'field' || !isLive(f, moved)) continue;
    const o = placedAt(f, moved);   // soil follows the field when it is moved
    if (gx >= o.gx && gx < o.gx + o.w && gy >= o.gy && gy < o.gy + o.h) return { frame: o.soil ?? 'dirt' };
  }
  for (let i = l.terrain.rects.length - 1; i >= 0; i--) {
    const r = l.terrain.rects[i];
    if (cleared && r.frame === 'locked_land') continue;
    const [x, y, w, h] = r.rect;
    if (gx >= x && gx < x + w && gy >= y && gy < y + h) return { frame: r.frame, animate: r.animate };
  }
  if ((gx * 5 + gy) % l.terrain.flowerEvery === 0) return { frame: l.terrain.flowerFrame };
  return { frame: l.terrain.default[(gx * 7 + gy * 3) % l.terrain.default.length] };
}

export function isBuildableTile(l: FarmLayout, gx: number, gy: number, expanded: string[] = [], moved: Moved = {}): boolean {
  const t = terrainFrameAt(l, gx, gy, expanded, moved);
  if (!t.frame) return false;
  return !l.terrain.unbuildable.includes(t.frame) && !t.animate;
}

/** Every tile of every field is one plot: the farm service owns what grows on it. */
export function plotCells(l: FarmLayout): { gx: number; gy: number }[] {
  const out: { gx: number; gy: number }[] = [];
  for (const o of l.objects) {
    if (o.kind !== 'field' || o.extra) continue;
    for (let dx = 0; dx < o.w; dx++) for (let dy = 0; dy < o.h; dy++) out.push({ gx: o.gx + dx, gy: o.gy + dy });
  }
  return out;
}

const hashStr = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/** Every rock, tree or bush in the world: the clearable ones on the island plus a few that come with each lot (always the same). */
export function obstacleList(l: FarmLayout): ObstacleDef[] {
  const out: ObstacleDef[] = l.objects.filter((o) => o.clearable).map((o) => ({ id: o.id, type: o.frame!, gx: o.gx, gy: o.gy }));
  for (const e of l.expansions) {
    if (!isLot(e.id)) continue;
    const used = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const h = hashStr(`${e.id}:${i}`);
      let gx = e.rect[0] + (h % e.rect[2]), gy = e.rect[1] + ((h >>> 8) % e.rect[3]);
      for (let tries = 0; used.has(`${gx},${gy}`) && tries < 16; tries++) { gx = e.rect[0] + ((gx - e.rect[0] + 1) % e.rect[2]); if (tries % e.rect[2] === e.rect[2] - 1) gy = e.rect[1] + ((gy - e.rect[1] + 1) % e.rect[3]); }
      used.add(`${gx},${gy}`);
      out.push({ id: `ob_${e.id}_${i}`, type: OBSTACLE_TYPES[(h >>> 16) % OBSTACLE_TYPES.length].id, gx, gy, lot: e.id });
    }
  }
  return out;
}

export function worldConfig(l: FarmLayout): WorldConfig {
  return {
    cols: l.cols, rows: l.rows, plotCells: plotCells(l),
    staticObjects: l.objects.filter((o) => !o.clearable).map((o) => ({ id: o.id, gx: o.gx, gy: o.gy, w: o.w, h: o.h, ...(o.extra ? { extra: true } : {}) })),
    obstacles: obstacleList(l),
    fields: l.objects.filter((o) => o.kind === 'field').map((o) => ({ id: o.id, gx: o.gx, gy: o.gy, w: o.w, h: o.h, ...(o.extra ? { extra: true } : {}) })),
    isBuildable: (gx, gy, moved) => isBuildableTile(l, gx, gy, [], moved),
    expansions: l.expansions,
    // a lot may only be cleared next to land you own
    canExpand: (id, expanded) => {
      const e = l.expansions.find((x) => x.id === id);
      return !!e && (!isLot(e.id) || lotTouchesOwned(l, e, expanded));
    },
  };
}

/** The expansion whose still-locked patch covers this tile, if any (lots only count while they touch your land). */
export function lockedExpansionAt(l: FarmLayout, gx: number, gy: number, expanded: string[]): ExpansionDef | null {
  const e = l.expansions.find((x) => !expanded.includes(x.id) && inRect(x.rect, gx, gy));
  if (!e) return null;
  if (isLot(e.id) && !lotTouchesOwned(l, e, expanded)) return null;
  return e;
}

/** Tile bounds of all land you can see (island + cleared + lots for sale). */
export function landBox(l: FarmLayout, expanded: string[], includeLocked = true): { minGx: number; minGy: number; maxGx: number; maxGy: number } {
  let minGx = 0, minGy = 0, maxGx = l.base.cols - 1, maxGy = l.base.rows - 1;
  for (const e of l.expansions) {
    if (!isLot(e.id)) continue;
    const owned = expanded.includes(e.id);
    if (!owned && !(includeLocked && lotTouchesOwned(l, e, expanded))) continue;
    maxGx = Math.max(maxGx, e.rect[0] + e.rect[2] - 1);
    maxGy = Math.max(maxGy, e.rect[1] + e.rect[3] - 1);
  }
  return { minGx, minGy, maxGx, maxGy };
}

/** The field (if any) that covers this tile, where the fields stand now. */
export function fieldAtCell(l: FarmLayout, moved: Moved, gx: number, gy: number): LayoutObject | null {
  for (const f of l.objects) {
    if (f.kind !== 'field' || !isLive(f, moved)) continue;
    const o = placedAt(f, moved);
    if (gx >= o.gx && gx < o.gx + o.w && gy >= o.gy && gy < o.gy + o.h) return f;
  }
  return null;
}
