import { describe, it, expect } from 'vitest';
import { LocalFarmService, MemoryKV, WorldConfig } from '../src/services/LocalFarmService';
import { animalHappiness, animalStatus } from '../src/services/types';
import { ANIMALS, BUILDINGS, ITEMS, ITEM_BY_ID, RECIPES, CROP_BY_ID } from '../src/services/data';

const WORLD: WorldConfig = {
  cols: 12, rows: 12, plotCells: [{ gx: 0, gy: 0 }],
  staticObjects: [{ id: 'field', gx: 0, gy: 0, w: 1, h: 1 }, { id: 'house', gx: 4, gy: 0, w: 3, h: 3 }],
  isBuildable: (gx, gy) => !(gx === 11 && gy === 11), // one unbuildable tile
};
let n = 0;
const k = () => `k${++n}`;

function make(opts: { coins?: number; level?: number; inventory?: Record<string, number> } = {}) {
  const t = { v: 10_000_000 };
  const kv = new MemoryKV();
  const svc = new LocalFarmService(WORLD, kv, { now: () => t.v });
  const st = (svc as any).state;
  if (opts.coins !== undefined) st.coins = opts.coins;
  if (opts.level !== undefined) st.level = opts.level;
  if (opts.inventory) st.inventory = { ...opts.inventory };
  return { svc, t, kv, st };
}
const mustOk = <T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> => { expect(r.ok).toBe(true); return r as Extract<T, { ok: true }>; };

describe('master data is consistent', () => {
  it('every recipe, animal and building references real items and buildings', () => {
    const b = new Set(BUILDINGS.map((x) => x.id));
    for (const r of RECIPES) {
      expect(b.has(r.building), r.id).toBe(true);
      expect(ITEM_BY_ID.has(r.output), r.id).toBe(true);
      Object.keys(r.inputs).forEach((i) => expect(ITEM_BY_ID.has(i), `${r.id}:${i}`).toBe(true));
    }
    for (const a of ANIMALS) { expect(b.has(a.habitat)).toBe(true); expect(ITEM_BY_ID.has(a.product)).toBe(true); }
    expect(ITEMS.length).toBe(35); // 12 crops, 6 animal products, 15 factory goods, wood and stone
    expect(BUILDINGS.filter((x) => x.kind === 'production')).toHaveLength(8);
    expect(ANIMALS).toHaveLength(6);
    expect(CROP_BY_ID.size).toBe(12);
  });
});

describe('placing buildings', () => {
  it('places a coop, charges the cost and rejects overlap, bounds and unbuildable tiles', async () => {
    const { svc } = make({ coins: 500 });
    const r = mustOk(await svc.placeBuilding('chicken_coop', 8, 4, k()));
    expect(r.snapshot.coins).toBe(440);
    expect(r.snapshot.buildings[0]).toMatchObject({ type: 'chicken_coop', gx: 8, gy: 4, level: 1 });
    expect(await svc.placeBuilding('chicken_coop', 9, 5, k())).toEqual({ ok: false, error: 'invalid_placement' }); // overlaps coop
    expect(await svc.placeBuilding('chicken_coop', 5, 1, k())).toEqual({ ok: false, error: 'invalid_placement' }); // overlaps house
    expect(await svc.placeBuilding('chicken_coop', 11, 11, k())).toEqual({ ok: false, error: 'invalid_placement' }); // out of bounds
    expect(await svc.placeBuilding('chicken_coop', 10, 10, k())).toEqual({ ok: false, error: 'invalid_placement' }); // 11,11 unbuildable
    expect((await svc.load()).coins).toBe(440);
  });
  it('checks level, coins and unknown types', async () => {
    const { svc } = make({ coins: 5000 });
    expect(await svc.placeBuilding('cow_pasture', 8, 4, k())).toEqual({ ok: false, error: 'not_unlocked' });
    expect(await svc.placeBuilding('castle', 8, 4, k())).toEqual({ ok: false, error: 'unknown_building' });
    const poor = make({ coins: 10 });
    expect(await poor.svc.placeBuilding('chicken_coop', 8, 4, k())).toEqual({ ok: false, error: 'insufficient_coins' });
  });
});

describe('starter feed', () => {
  it('your first animal comes with 3 animal feed, once', async () => {
    const m = make({ coins: 1000 });
    const coop = mustOk(await m.svc.placeBuilding('chicken_coop', 8, 4, k())).buildingId;
    expect((await m.svc.load()).inventory.animal_feed).toBeUndefined();
    const first = mustOk(await m.svc.buyAnimal(coop, k()));
    expect(first.snapshot.inventory.animal_feed).toBe(3);
    expect(m.svc.getLedger().some((l) => l.reason === 'starter_gift')).toBe(true);
    const second = mustOk(await m.svc.buyAnimal(coop, k()));
    expect(second.snapshot.inventory.animal_feed).toBe(3);   // no second gift
    // and the first chicken can be fed straight away, giving the first egg
    mustOk(await m.svc.feedAnimals(coop, k()));
    expect((await m.svc.load()).inventory.animal_feed).toBe(1);
  });
});

describe('animals: buy, feed, collect', () => {
  async function coop(inv: Record<string, number> = { animal_feed: 5 }) {
    const m = make({ coins: 1000, inventory: inv });
    (m.svc as any).state.stats.animal_buy = 1; // not the first animal, so no starter feed muddies the counts below
    const id = mustOk(await m.svc.placeBuilding('chicken_coop', 8, 4, k())).buildingId;
    return { ...m, id };
  }
  it('buys a chicken for 50, up to the capacity of 4', async () => {
    const { svc, id } = await coop();
    for (let i = 0; i < 4; i++) mustOk(await svc.buyAnimal(id, k()));
    expect(await svc.buyAnimal(id, k())).toEqual({ ok: false, error: 'at_capacity' });
    expect((await svc.load()).coins).toBe(1000 - 60 - 200);
  });
  it('rejects animals in a production building and unknown habitats', async () => {
    const m = make({ coins: 1000 });
    const mill = mustOk(await m.svc.placeBuilding('flour_mill', 8, 4, k())).buildingId;
    expect(await m.svc.buyAnimal(mill, k())).toEqual({ ok: false, error: 'wrong_building' });
    expect(await m.svc.buyAnimal('nope', k())).toEqual({ ok: false, error: 'unknown_building' });
  });
  it('feeding uses animal feed, then an egg is ready after 5 minutes and survives a reload', async () => {
    const { svc, t, kv, id } = await coop();
    mustOk(await svc.buyAnimal(id, k()));
    const fed = mustOk(await svc.feedAnimals(id, k()));
    expect(fed.fed).toBe(1);
    expect(fed.snapshot.inventory.animal_feed).toBe(4);
    t.v += 4 * 60_000;
    expect(await svc.collectAnimals(id, k())).toEqual({ ok: false, error: 'nothing_ready' });
    t.v += 2 * 60_000; // 6 minutes, the player was away
    const again = new LocalFarmService(WORLD, kv, { now: () => t.v });
    const snap = await again.load();
    expect(animalStatus(snap.animals[0], again.now())).toBe('ready');
    const c = mustOk(await again.collectAnimals(id, k()));
    expect(c.collected).toEqual([{ itemId: 'egg', qty: 1 }]);
    expect(c.snapshot.inventory.egg).toBe(1);
    expect(animalStatus(c.snapshot.animals[0], again.now())).toBe('hungry'); // hungry again
  });
  it('cannot feed without feed, or when nobody is hungry, and never collects twice', async () => {
    const { svc, t, id } = await coop({});
    mustOk(await svc.buyAnimal(id, k()));
    expect(await svc.feedAnimals(id, k())).toEqual({ ok: false, error: 'insufficient_items' });
    (svc as any).state.inventory.animal_feed = 3;
    mustOk(await svc.feedAnimals(id, k()));
    expect(await svc.feedAnimals(id, k())).toEqual({ ok: false, error: 'nothing_hungry' });
    t.v += 700_000;
    const results = await Promise.all([svc.collectAnimals(id, k()), svc.collectAnimals(id, k())]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect((await svc.load()).inventory.egg).toBe(1);
  });
  it('feeds only as many animals as the feed stock allows', async () => {
    const { svc, id } = await coop({ animal_feed: 2 });
    for (let i = 0; i < 3; i++) mustOk(await svc.buyAnimal(id, k()));
    const f = mustOk(await svc.feedAnimals(id, k()));
    expect(f.fed).toBe(2);
    expect(f.snapshot.inventory.animal_feed).toBeUndefined();
  });
  it('happiness only drops mildly and never below the floor while hungry for a long time', async () => {
    const { svc, t, id } = await coop();
    mustOk(await svc.buyAnimal(id, k()));
    const a = (await svc.load()).animals[0];
    expect(animalHappiness(a, t.v)).toBe(100);
    expect(animalHappiness(a, t.v + 30 * 60_000)).toBe(100); // inside the grace period
    expect(animalHappiness(a, t.v + (30 + 100) * 60_000)).toBe(90);
    expect(animalHappiness(a, t.v + 30 * 24 * 3_600_000)).toBe(50); // a month away: floor
  });
  it('upgrades a habitat for more capacity and stops at the top level', async () => {
    const { svc, id } = await coop();
    const up = mustOk(await svc.upgradeBuilding(id, k()));
    expect([up.level, up.cost]).toEqual([2, 120]);
    for (let i = 0; i < 6; i++) mustOk(await svc.buyAnimal(id, k()));
    mustOk(await svc.upgradeBuilding(id, k()));
    expect(await svc.upgradeBuilding(id, k())).toEqual({ ok: false, error: 'max_level' });
  });
});

describe('production: wheat -> flour -> bread, queues, offline', () => {
  async function mills() {
    const m = make({ coins: 5000, level: 2, inventory: { wheat: 6 } });
    const mill = mustOk(await m.svc.placeBuilding('flour_mill', 8, 4, k())).buildingId;
    const bakery = mustOk(await m.svc.placeBuilding('bakery', 8, 7, k())).buildingId;
    return { ...m, mill, bakery };
  }
  it('runs the whole chain and consumes inputs at queue time', async () => {
    const { svc, t, mill, bakery } = await mills();
    const q1 = mustOk(await svc.queueRecipe(mill, 'flour', k()));
    expect(q1.snapshot.inventory.wheat).toBe(3);
    mustOk(await svc.queueRecipe(mill, 'flour', k()));
    expect(await svc.collectJobs(mill, k())).toEqual({ ok: false, error: 'nothing_ready' });
    t.v += 301_000; // both flours were queued together and are done together (each slot works on its own)
    const c1 = mustOk(await svc.collectJobs(mill, k()));
    expect(c1.collected).toEqual([{ itemId: 'flour', qty: 2 }]);
    expect((await svc.load()).inventory).toEqual({ flour: 2 });
    mustOk(await svc.queueRecipe(bakery, 'bread', k()));
    t.v += 601_000;
    const b = mustOk(await svc.collectJobs(bakery, k()));
    expect(b.snapshot.inventory).toEqual({ bread: 1 });
    expect(b.xp).toBe(4);
  });
  it('rejects missing inputs, wrong building, locked recipe, full queue and unknown recipe', async () => {
    const { svc, mill, bakery } = await mills();
    expect(await svc.queueRecipe(bakery, 'bread', k())).toEqual({ ok: false, error: 'insufficient_items' });
    expect(await svc.queueRecipe(mill, 'bread', k())).toEqual({ ok: false, error: 'wrong_building' });
    expect(await svc.queueRecipe(mill, 'soup', k())).toEqual({ ok: false, error: 'unknown_recipe' });
    (svc as any).state.inventory.wheat = 20; // state objects are replaced after a failed action, so re-read it
    expect(await svc.queueRecipe(bakery, 'cake', k())).toEqual({ ok: false, error: 'not_unlocked' }); // level 4
    mustOk(await svc.queueRecipe(mill, 'flour', k())); mustOk(await svc.queueRecipe(mill, 'flour', k()));
    expect(await svc.queueRecipe(mill, 'flour', k())).toEqual({ ok: false, error: 'queue_full' }); // 2 slots at level 1
    mustOk(await svc.upgradeBuilding(mill, k()));
    mustOk(await svc.queueRecipe(mill, 'flour', k())); // 3 slots at level 2
  });
  it('jobs finish while the game is closed and queues are persisted', async () => {
    const { svc, t, kv, mill } = await mills();
    mustOk(await svc.queueRecipe(mill, 'flour', k()));
    mustOk(await svc.queueRecipe(mill, 'flour', k()));
    t.v += 3_600_000; // an hour away
    const again = new LocalFarmService(WORLD, kv, { now: () => t.v });
    expect((await again.load()).jobs).toHaveLength(2);
    const c = mustOk(await again.collectJobs(mill, k()));
    expect(c.collected).toEqual([{ itemId: 'flour', qty: 2 }]);
  });
  it('replays an idempotency key without consuming inputs twice', async () => {
    const { svc, mill } = await mills();
    mustOk(await svc.queueRecipe(mill, 'flour', 'same'));
    const again = mustOk(await svc.queueRecipe(mill, 'flour', 'same'));
    expect(again.replayed).toBe(true);
    expect((await svc.load()).inventory.wheat).toBe(3);
    expect((await svc.load()).jobs).toHaveLength(1);
  });
  it('collecting a production building does not work on a habitat and vice versa', async () => {
    const { svc, mill } = await mills();
    expect(await svc.collectAnimals(mill, k())).toEqual({ ok: false, error: 'wrong_building' });
    const coop = mustOk(await svc.placeBuilding('chicken_coop', 8, 10, k())).buildingId;
    expect(await svc.collectJobs(coop, k())).toEqual({ ok: false, error: 'wrong_building' });
  });
  it('writes ledger rows for inputs, outputs and coins', async () => {
    const { svc, t, mill } = await mills();
    mustOk(await svc.queueRecipe(mill, 'flour', k()));
    t.v += 301_000;
    mustOk(await svc.collectJobs(mill, k()));
    const reasons = svc.getLedger().map((l) => l.reason);
    expect(reasons).toContain('recipe_input');
    expect(reasons).toContain('production');
    expect(reasons).toContain('building');
  });
});

describe('save migration and selling products', () => {
  it('upgrades a Phase 2 save instead of resetting it', async () => {
    const kv = new MemoryKV();
    kv.set('stratos_farm_save_v1', JSON.stringify({
      version: 1, coins: 77, gems: 5, xp: 10, level: 1, inventory: { wheat: 4 },
      plots: [{ id: '0,0', gx: 0, gy: 0, cropId: null, plantedAt: null, readyAt: null }],
      lastSeen: 1, ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
    const svc = new LocalFarmService(WORLD, kv, { now: () => 5 });
    const s = await svc.load();
    expect(s.coins).toBe(77);
    expect(s.notice).toBeUndefined();
    expect(s.buildings).toEqual([]);
  });
  it('sells animal and factory products', async () => {
    const { svc } = make({ inventory: { egg: 3, bread: 1 } });
    const r = mustOk(await svc.sell('egg', 3, k()));
    expect(r.coins).toBe(24);
    mustOk(await svc.sell('bread', 1, k()));
    expect((await svc.load()).coins).toBe(100 + 24 + 34);
  });
});
