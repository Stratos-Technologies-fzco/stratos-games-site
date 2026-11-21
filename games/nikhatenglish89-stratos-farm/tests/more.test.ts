import { describe, it, expect } from 'vitest';
import { LocalFarmService, MemoryKV, SAVE_KEY } from '../src/services/LocalFarmService';
import { farmLayout as L, obstacleList, worldConfig } from '../src/game/layout';
import { BUILDINGS, ITEM_BY_ID, OBSTACLE_TYPES, OBSTACLE_TYPE_BY_ID } from '../src/services/data';
import { readFileSync } from 'node:fs';

const world = worldConfig(L);
let n = 0;
const k = () => `more-${++n}`;
const mustOk = <T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> => { expect(r.ok, JSON.stringify(r)).toBe(true); return r as Extract<T, { ok: true }>; };
function make(o: { coins?: number; level?: number; inventory?: Record<string, number> } = {}, kv = new MemoryKV()) {
  const svc = new LocalFarmService(world, kv, { now: () => 9_000_000 });
  const st = (svc as unknown as { state: { coins: number; level: number; inventory: Record<string, number> } }).state;
  if (o.coins !== undefined) st.coins = o.coins;
  if (o.level !== undefined) st.level = o.level;
  if (o.inventory) st.inventory = { ...o.inventory };
  return { svc, kv };
}

describe('turning a building around', () => {
  it('mirrors it and turns it back, for free, and it survives a reload', async () => {
    const { svc, kv } = make({ coins: 1000 });
    const id = mustOk(await svc.placeBuilding('chicken_coop', 0, 2, k())).buildingId;
    expect((await svc.load()).buildings[0].flipped).toBeFalsy();
    const coins = (await svc.load()).coins;
    expect(mustOk(await svc.rotateBuilding(id, k())).flipped).toBe(true);
    expect((await svc.load()).coins).toBe(coins);
    const again = new LocalFarmService(world, kv, { now: () => 9_000_000 });
    expect((await again.load()).buildings[0].flipped).toBe(true);
    expect(mustOk(await again.rotateBuilding(id, k())).flipped).toBe(false);
    expect(await again.rotateBuilding('nope', k())).toEqual({ ok: false, error: 'unknown_building' });
  });
  it('can be placed already turned', async () => {
    const { svc } = make({ coins: 1000 });
    mustOk(await svc.placeBuilding('flour_mill', 0, 2, k(), true));
    expect((await svc.load()).buildings[0].flipped).toBe(true);
  });
});

describe('decorations', () => {
  const decor = BUILDINGS.filter((b) => b.kind === 'decor');
  it('are 1x1, use real decor frames, cost coins and unlock by level', () => {
    expect(decor.length).toBeGreaterThanOrEqual(15);
    const frames = new Set(Object.keys(JSON.parse(readFileSync('assets/farm/atlases/atlas_decor.json', 'utf8')).frames));
    for (const d of decor) {
      expect([d.w, d.h]).toEqual([1, 1]);
      expect(frames.has(d.frames[0]), d.id).toBe(true);
      expect(d.cost).toBeGreaterThan(0);
    }
  });
  it('can be bought, moved, turned and removed, but not upgraded, and a bench is not a factory', async () => {
    const { svc } = make({ coins: 500, level: 4 });
    const id = mustOk(await svc.placeBuilding('decor_bench', 4, 4, k())).buildingId;
    expect((await svc.load()).stats['build:decor']).toBe(1);
    expect(await svc.upgradeBuilding(id, k())).toEqual({ ok: false, error: 'max_level' });
    expect(await svc.queueRecipe(id, 'flour', k())).toEqual({ ok: false, error: 'wrong_building' });
    expect(await svc.buyAnimal(id, k())).toEqual({ ok: false, error: 'wrong_building' });
    mustOk(await svc.moveBuilding(id, 5, 4, k()));
    mustOk(await svc.rotateBuilding(id, k()));
    const r = mustOk(await svc.removeBuilding(id, k()));
    expect(r.refund).toBe(12);
    expect(await make({ coins: 5, level: 4 }).svc.placeBuilding('decor_well', 4, 4, k())).toEqual({ ok: false, error: 'insufficient_coins' });
    expect(await make({ coins: 500, level: 1 }).svc.placeBuilding('decor_well', 4, 4, k())).toEqual({ ok: false, error: 'not_unlocked' });
  });
});

describe('rocks, trees and bushes', () => {
  const obstacles = obstacleList(L);
  it('some stand on the island and each lot brings a few more (always the same ones)', () => {
    const island = obstacles.filter((o) => !o.lot);
    const lots = obstacles.filter((o) => o.lot);
    expect(island).toHaveLength(8);
    expect(lots).toHaveLength(27 * 3);
    expect(obstacleList(L)).toEqual(obstacles);                         // stable between runs
    expect(new Set(obstacles.map((o) => o.id)).size).toBe(obstacles.length);
    for (const o of lots) {
      const lot = L.expansions.find((e) => e.id === o.lot)!;
      expect(o.gx >= lot.rect[0] && o.gx < lot.rect[0] + lot.rect[2] && o.gy >= lot.rect[1] && o.gy < lot.rect[1] + lot.rect[3], o.id).toBe(true);
    }
    // no two obstacles share a tile, and none sits on a hand-placed object
    const tiles = new Set<string>();
    for (const o of obstacles) { expect(tiles.has(`${o.gx},${o.gy}`), o.id).toBe(false); tiles.add(`${o.gx},${o.gy}`); }
    for (const o of world.staticObjects) for (let i = 0; i < o.w; i++) for (let j = 0; j < o.h; j++) expect(tiles.has(`${o.gx + i},${o.gy + j}`), o.id).toBe(false);
  });
  it('every type uses a real decor frame and pays real items', () => {
    const frames = new Set(Object.keys(JSON.parse(readFileSync('assets/farm/atlases/atlas_decor.json', 'utf8')).frames));
    for (const t of OBSTACLE_TYPES) {
      expect(frames.has(t.frame), t.id).toBe(true);
      for (const item of Object.keys(t.reward)) expect(ITEM_BY_ID.has(item), `${t.id}:${item}`).toBe(true);
      expect(t.cost).toBeGreaterThan(0);
    }
  });
  it('block building until cleared; clearing costs coins and pays wood or stone and xp', async () => {
    const { svc } = make({ coins: 500 });
    const rock = obstacles.find((o) => o.id === 'rock_1')!;
    expect(svc.canPlace('decor_bench', rock.gx, rock.gy)).toEqual({ valid: false, reason: 'occupied' });
    const r = mustOk(await svc.clearObstacle('rock_1', k()));
    expect(r.cost).toBe(OBSTACLE_TYPE_BY_ID.get('rock_large')!.cost);
    expect(r.snapshot.coins).toBe(500 - 40);
    expect(r.snapshot.inventory.stone).toBe(3);
    expect(r.snapshot.xp).toBe(3);
    expect(r.snapshot.clearedObstacles).toEqual(['rock_1']);
    expect(svc.canPlace('decor_bench', rock.gx, rock.gy).valid).toBe(true);
    expect(await svc.clearObstacle('rock_1', k())).toEqual({ ok: false, error: 'unknown_obstacle' });
    expect(await svc.clearObstacle('nope', k())).toEqual({ ok: false, error: 'unknown_obstacle' });
    expect(await make({ coins: 5 }).svc.clearObstacle('rock_1', k())).toEqual({ ok: false, error: 'insufficient_coins' });
    expect((await svc.load()).stats.clear).toBe(1);
  });
  it('lot obstacles only appear once the lot is cleared, and replay of a key pays once', async () => {
    const { svc } = make({ coins: 5000, level: 5, inventory: { flour: 9 } });
    const lotRock = obstacles.find((o) => o.lot === 'lot_3_0')!;
    expect(await svc.clearObstacle(lotRock.id, k())).toEqual({ ok: false, error: 'unknown_obstacle' }); // not there yet
    mustOk(await svc.expandLand('lot_3_0', k()));
    expect(svc.activeObstacles().some((o) => o.id === lotRock.id)).toBe(true);
    mustOk(await svc.clearObstacle(lotRock.id, 'same'));
    const again = mustOk(await svc.clearObstacle(lotRock.id, 'same'));
    expect(again.replayed).toBe(true);
    const wood = ((await svc.load()).inventory.wood ?? 0) + ((await svc.load()).inventory.stone ?? 0);
    expect(wood).toBeGreaterThan(0);
    expect(wood).toBeLessThanOrEqual(3);
  });
  it('upgrades a version 3 save without losing anything', async () => {
    const kv = new MemoryKV();
    kv.set(SAVE_KEY, JSON.stringify({
      version: 3, coins: 321, gems: 1, xp: 0, level: 2, inventory: { egg: 2 }, plots: [], buildings: [{ id: 'b1', type: 'chicken_coop', gx: 4, gy: 4, level: 1 }], animals: [], jobs: [],
      orders: [], orderCooldowns: {}, orderCounter: 0, expanded: [], stats: {}, claimed: [], daily: { day: -1, ids: [], base: {}, claimed: [] }, tutorialDone: false,
      nextId: 2, lastSeen: 1, ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
    const s = await new LocalFarmService(world, kv, { now: () => 9_000_000 }).load();
    expect(s.notice).toBeUndefined();
    expect(s.coins).toBe(321);
    expect(s.buildings).toHaveLength(1);
    expect(s.clearedObstacles).toEqual([]);
  });
});
