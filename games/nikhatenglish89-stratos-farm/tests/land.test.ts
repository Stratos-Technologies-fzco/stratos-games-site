import { describe, it, expect } from 'vitest';
import { LocalFarmService, MemoryKV } from '../src/services/LocalFarmService';
import { farmLayout as L, generateLots, isBuildableTile, isLot, landBox, landState, lockedExpansionAt, lotTouchesOwned, worldConfig } from '../src/game/layout';
import { ITEM_BY_ID } from '../src/services/data';

const world = worldConfig(L);
let n = 0;
const k = () => `land-${++n}`;
function make(o: { coins?: number; level?: number; inventory?: Record<string, number> } = {}) {
  const svc = new LocalFarmService(world, new MemoryKV(), { now: () => 9_000_000 });
  const st = (svc as unknown as { state: { coins: number; level: number; inventory: Record<string, number> } }).state;
  if (o.coins !== undefined) st.coins = o.coins;
  if (o.level !== undefined) st.level = o.level;
  if (o.inventory) st.inventory = { ...o.inventory };
  return svc;
}
const mustOk = <T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> => { expect(r.ok, JSON.stringify(r)).toBe(true); return r as Extract<T, { ok: true }>; };

describe('the farm can grow to four times its starting size', () => {
  const lots = L.expansions.filter((e) => isLot(e.id));
  it('is a 24 x 24 world whose starting island is 12 x 12, sold in 27 square lots', () => {
    expect([L.cols, L.rows]).toEqual([24, 24]);
    expect(L.base).toEqual({ cols: 12, rows: 12 });
    expect(lots).toHaveLength(27);
    expect(new Set(lots.map((l) => l.id)).size).toBe(27);
    // 12 x 12 + 27 lots of 4 x 4 = 576 tiles, the whole world
    expect(144 + lots.reduce((a, l) => a + l.rect[2] * l.rect[3], 0)).toBe(24 * 24);
  });
  it('lots stay inside the world and never overlap the island or each other', () => {
    const seen = new Set<string>();
    for (const l of lots) {
      const [x, y, w, h] = l.rect;
      expect(x + w).toBeLessThanOrEqual(24);
      expect(y + h).toBeLessThanOrEqual(24);
      for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) {
        const key = `${x + i},${y + j}`;
        expect(seen.has(key), key).toBe(false);
        seen.add(key);
        expect(x + i >= 12 || y + j >= 12, key).toBe(true); // outside the island
      }
    }
  });
  it('further lots cost more, need a higher level and ask for better goods', () => {
    const ring = (id: string) => { const [, lx, ly] = id.split('_').map(Number); return Math.max(lx - 2, ly - 2); };
    const byRing = (r: number) => lots.filter((l) => ring(l.id) === r);
    expect([byRing(1).length, byRing(2).length, byRing(3).length]).toEqual([7, 9, 11]);
    const maxCost = (r: number) => Math.max(...byRing(r).map((l) => l.cost));
    const minCost = (r: number) => Math.min(...byRing(r).map((l) => l.cost));
    expect(minCost(2)).toBeGreaterThan(maxCost(1));
    expect(minCost(3)).toBeGreaterThan(maxCost(2));
    expect(byRing(1)[0].unlockLevel).toBeLessThan(byRing(2)[0].unlockLevel);
    expect(byRing(2)[0].unlockLevel).toBeLessThan(byRing(3)[0].unlockLevel);
    for (const l of lots) for (const item of Object.keys(l.materials)) expect(ITEM_BY_ID.has(item), `${l.id}:${item}`).toBe(true);
  });
  it('shows only the land next to yours; the rest is open sea until you reach it', () => {
    expect(landState(L, 5, 5, [])).toBe('base');
    expect(landState(L, 13, 1, [])).toBe('locked');   // east of the island
    expect(landState(L, 1, 13, [])).toBe('locked');   // south of the island
    expect(landState(L, 17, 1, [])).toBe('sea');      // two lots out: not reachable yet
    expect(landState(L, 14, 14, [])).toBe('sea');     // the corner touches no owned land
    expect(landState(L, -1, 0, [])).toBe('sea');
    expect(landState(L, 30, 0, [])).toBe('sea');
    expect(landState(L, 17, 1, ['lot_3_0'])).toBe('locked'); // clearing the first east lot reveals the next
    expect(landState(L, 13, 1, ['lot_3_0'])).toBe('cleared');
  });
  it('cleared land is buildable, locked land and sea are not', () => {
    expect(isBuildableTile(L, 13, 1, [])).toBe(false);
    expect(isBuildableTile(L, 13, 1, ['lot_3_0'])).toBe(true);
    expect(isBuildableTile(L, 20, 20, [])).toBe(false);
  });
  it('a lot can be tapped only while it touches your land', () => {
    expect(lockedExpansionAt(L, 13, 1, [])?.id).toBe('lot_3_0');
    expect(lockedExpansionAt(L, 17, 1, [])).toBeNull();
    expect(lockedExpansionAt(L, 17, 1, ['lot_3_0'])?.id).toBe('lot_4_0');
    const lot = L.expansions.find((e) => e.id === 'lot_4_0')!;
    expect(lotTouchesOwned(L, lot, [])).toBe(false);
    expect(lotTouchesOwned(L, lot, ['lot_3_0'])).toBe(true);
  });
  it('the camera area grows with the land', () => {
    const a = landBox(L, [], false), b = landBox(L, ['lot_3_0'], false);
    expect(a.maxGx).toBe(11);
    expect(b.maxGx).toBe(15);
    expect(landBox(L, [], true).maxGx).toBe(15); // lots for sale are visible
  });
  it('generateLots follows the layout numbers', () => {
    expect(generateLots({ cols: 16, rows: 16, base: { cols: 8, rows: 8 }, lots: { size: 4 } })).toHaveLength(12);
  });
});

describe('clearing and using new land (real layout and rules)', () => {
  const rich = { coins: 50_000, level: 10, inventory: { flour: 20, bread: 20, cheese: 10, cake: 5, sweater: 3, strawberry_jam: 5 } };
  it('a lot must touch your land, then needs level, coins and goods', async () => {
    const svc = make(rich);
    expect(await svc.expandLand('lot_4_0', k())).toEqual({ ok: false, error: 'not_adjacent' });
    const poor = make({ ...rich, level: 1 });
    expect(await poor.expandLand('lot_3_0', k())).toEqual({ ok: false, error: 'not_unlocked' });
    const broke = make({ ...rich, coins: 10 });
    expect(await broke.expandLand('lot_3_0', k())).toEqual({ ok: false, error: 'insufficient_coins' });
    const noGoods = make({ ...rich, inventory: {} });
    expect(await noGoods.expandLand('lot_3_0', k())).toEqual({ ok: false, error: 'insufficient_items' });
    const lot = L.expansions.find((e) => e.id === 'lot_3_0')!;
    const r = mustOk(await svc.expandLand('lot_3_0', k()));
    expect(r.snapshot.coins).toBe(50_000 - lot.cost);
    expect(r.snapshot.expanded).toContain('lot_3_0');
    expect(await svc.expandLand('lot_3_0', k())).toEqual({ ok: false, error: 'already_expanded' });
    mustOk(await svc.expandLand('lot_4_0', k())); // now it touches cleared land
  });
  it('you can build on a cleared lot (where no rock or tree stands) but not on a locked one or in the sea', async () => {
    const svc = make(rich);
    expect(await svc.placeBuilding('decor_bench', 12, 0, k())).toEqual({ ok: false, error: 'invalid_placement' }); // still locked
    mustOk(await svc.expandLand('lot_3_0', k()));
    const taken = new Set(svc.activeObstacles().map((o) => `${o.gx},${o.gy}`));
    let free: [number, number] | null = null;
    for (let x = 12; x < 16 && !free; x++) for (let y = 0; y < 4 && !free; y++) if (!taken.has(`${x},${y}`)) free = [x, y];
    expect(free).not.toBeNull();
    mustOk(await svc.placeBuilding('decor_bench', free![0], free![1], k()));
    expect(await svc.placeBuilding('chicken_coop', 19, 0, k())).toEqual({ ok: false, error: 'invalid_placement' }); // sea
    expect(svc.canPlace('flour_mill', 15, 2).valid).toBe(false); // would hang over the edge of the lot into locked land
  });
  it('the old starting patches still work', async () => {
    const svc = make(rich);
    mustOk(await svc.expandLand('south_meadow', k()));
    mustOk(await svc.placeBuilding('chicken_coop', 8, 8, k()));
  });
});
