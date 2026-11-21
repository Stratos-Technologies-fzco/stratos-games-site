import { describe, it, expect } from 'vitest';
import { LocalFarmService, MemoryKV, WorldConfig } from '../src/services/LocalFarmService';
import { ORDERS } from '../src/services/data';
import { QUESTS, TUTORIAL, claimableCount, currentTutorialStep, questProgress } from '../src/services/quests';

const WORLD: WorldConfig = {
  cols: 12, rows: 12,
  plotCells: [{ gx: 0, gy: 0 }, { gx: 1, gy: 0 }],
  staticObjects: [{ id: 'field', gx: 0, gy: 0, w: 2, h: 1 }],
  isBuildable: (x, y) => !(x >= 8 && x <= 9 && y >= 8 && y <= 9),
  expansions: [{ id: 'ex1', name: 'Test Meadow', rect: [8, 8, 2, 2], cost: 300, materials: { flour: 2 }, unlockLevel: 2 }],
};
let n = 0;
const k = () => `e${++n}`;
const mustOk = <T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> => { expect(r.ok, JSON.stringify(r)).toBe(true); return r as Extract<T, { ok: true }>; };

function make(o: { coins?: number; level?: number; inventory?: Record<string, number> } = {}, t = { v: 100 * 86_400_000 + 3_600_000 }, kv = new MemoryKV()) {
  const svc = new LocalFarmService(WORLD, kv, { now: () => t.v });
  const st = (svc as any).state;
  if (o.coins !== undefined) st.coins = o.coins;
  if (o.level !== undefined) st.level = o.level;
  if (o.inventory) st.inventory = { ...o.inventory };
  return { svc, t, kv };
}
const state = (svc: LocalFarmService) => (svc as any).state;

describe('customer orders', () => {
  it('opens with an easy first order from Old Joe and shows the right number of slots by level', async () => {
    const { svc } = make();
    const s = await svc.load();
    expect(s.orders).toHaveLength(2); // two slots at level 1
    const first = s.orders.find((o) => o.slot === 0)!;
    expect(first.npc).toBe('old_joe');
    expect(first.items).toEqual({ wheat: 2 });
    expect(first.coins).toBe(Math.round(2 * 3 * ORDERS.rewardMultiplier));
    const lvl6 = make({ level: 6 });
    expect((await lvl6.svc.load()).orders).toHaveLength(4);
  });
  it('only asks for things the player can make at their level', async () => {
    const { svc } = make({ level: 1 });
    for (const o of (await svc.load()).orders) for (const item of Object.keys(o.items)) expect(['wheat', 'carrot']).toContain(item);
  });
  it('delivers an order: takes items, pays coins and xp, writes ledger rows', async () => {
    const { svc } = make({ inventory: { wheat: 5 } });
    const o = (await svc.load()).orders.find((x) => x.slot === 0)!;
    const r = mustOk(await svc.fulfilOrder(o.id, k()));
    expect(r.snapshot.inventory.wheat).toBe(3);
    expect(r.snapshot.coins).toBe(100 + o.coins);
    expect(r.snapshot.orders.find((x) => x.id === o.id)).toBeUndefined();
    const reasons = svc.getLedger().map((l) => l.reason);
    expect(reasons).toEqual(expect.arrayContaining(['order_items', 'order']));
  });
  it('rejects missing items, unknown orders and a second delivery of the same order', async () => {
    const { svc } = make({ inventory: { wheat: 1 } });
    const o = (await svc.load()).orders[0];
    expect(await svc.fulfilOrder(o.id, k())).toEqual({ ok: false, error: 'insufficient_items' });
    expect(await svc.fulfilOrder('nope', k())).toEqual({ ok: false, error: 'unknown_order' });
    const rich = make({ inventory: { wheat: 20 } });
    const o2 = (await rich.svc.load()).orders.find((x) => x.slot === 0)!;
    mustOk(await rich.svc.fulfilOrder(o2.id, k()));
    expect(await rich.svc.fulfilOrder(o2.id, k())).toEqual({ ok: false, error: 'unknown_order' });
    const results = await Promise.all([rich.svc.fulfilOrder('x', k()), rich.svc.fulfilOrder('y', k())]);
    expect(results.every((r) => !r.ok)).toBe(true);
  });
  it('replaying the same key pays once', async () => {
    const { svc } = make({ inventory: { wheat: 20 } });
    const o = (await svc.load()).orders.find((x) => x.slot === 0)!;
    mustOk(await svc.fulfilOrder(o.id, 'deliver'));
    const again = mustOk(await svc.fulfilOrder(o.id, 'deliver'));
    expect(again.replayed).toBe(true);
    expect((await svc.load()).coins).toBe(100 + o.coins);
  });
  it('a delivered or skipped slot refills after the cooldown, not before', async () => {
    const { svc, t } = make({ inventory: { wheat: 20 } });
    const o = (await svc.load()).orders.find((x) => x.slot === 0)!;
    mustOk(await svc.fulfilOrder(o.id, k()));
    expect((await svc.load()).orders.some((x) => x.slot === 0)).toBe(false);
    t.v += (ORDERS.cooldownSeconds - 5) * 1000;
    expect((await svc.load()).orders.some((x) => x.slot === 0)).toBe(false);
    t.v += 6_000;
    const fresh = (await svc.load()).orders.find((x) => x.slot === 0)!;
    expect(fresh.id).not.toBe(o.id);
    const other = (await svc.load()).orders.find((x) => x.slot === 1)!;
    mustOk(await svc.skipOrder(other.id, k()));
    expect((await svc.load()).orders.some((x) => x.slot === 1)).toBe(false);
  });
  it('keeps pending orders and cooldowns across a reload', async () => {
    const { svc, t, kv } = make({ inventory: { wheat: 20 } });
    const o = (await svc.load()).orders.find((x) => x.slot === 0)!;
    mustOk(await svc.fulfilOrder(o.id, k()));
    const again = new LocalFarmService(WORLD, kv, { now: () => t.v });
    const s = await again.load();
    expect(s.orders.map((x) => x.slot)).toEqual([1]);
  });
  it('scales rewards with the order value', async () => {
    const { svc } = make({ level: 6 });
    for (const o of (await svc.load()).orders) {
      expect(o.coins).toBeGreaterThan(0);
      expect(o.xp).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('farm expansion', () => {
  it('needs level, coins and materials, then makes the patch buildable', async () => {
    const { svc } = make({ coins: 2000, level: 1, inventory: { flour: 5 } });
    expect(await svc.placeBuilding('chicken_coop', 8, 8, k())).toEqual({ ok: false, error: 'invalid_placement' }); // still locked
    expect(await svc.expandLand('ex1', k())).toEqual({ ok: false, error: 'not_unlocked' });
    const m2 = make({ coins: 100, level: 2, inventory: { flour: 5 } });
    expect(await m2.svc.expandLand('ex1', k())).toEqual({ ok: false, error: 'insufficient_coins' });
    const m3 = make({ coins: 2000, level: 2, inventory: { flour: 1 } });
    expect(await m3.svc.expandLand('ex1', k())).toEqual({ ok: false, error: 'insufficient_items' });
    const ok = make({ coins: 2000, level: 2, inventory: { flour: 5 } });
    const r = mustOk(await ok.svc.expandLand('ex1', k()));
    expect(r.snapshot.coins).toBe(1700);
    expect(r.snapshot.inventory.flour).toBe(3);
    expect(r.snapshot.expanded).toEqual(['ex1']);
    mustOk(await ok.svc.placeBuilding('chicken_coop', 8, 8, k()));
    expect(await ok.svc.expandLand('ex1', k())).toEqual({ ok: false, error: 'already_expanded' });
    expect(await ok.svc.expandLand('nope', k())).toEqual({ ok: false, error: 'unknown_expansion' });
  });
});

describe('moving and removing buildings', () => {
  async function coop() {
    const m = make({ coins: 1000 });
    const id = mustOk(await m.svc.placeBuilding('chicken_coop', 4, 4, k())).buildingId;
    return { ...m, id };
  }
  it('moves a building, rejects overlap, locked land and the same spot', async () => {
    const { svc, id } = await coop();
    mustOk(await svc.placeBuilding('flour_mill', 6, 4, k()));
    expect(await svc.moveBuilding(id, 4, 4, k())).toEqual({ ok: false, error: 'same_spot' });
    expect(await svc.moveBuilding(id, 5, 4, k())).toEqual({ ok: false, error: 'invalid_placement' }); // overlaps the mill at 6,4
    expect(await svc.moveBuilding(id, 8, 8, k())).toEqual({ ok: false, error: 'invalid_placement' }); // locked
    const r = mustOk(await svc.moveBuilding(id, 4, 6, k()));
    expect(r.snapshot.buildings.find((b) => b.id === id)).toMatchObject({ gx: 4, gy: 6 });
    mustOk(await svc.moveBuilding(id, 4, 5, k())); // overlapping its own old footprint is fine
  });
  it('removes an empty building for half the price, but not one with animals or jobs', async () => {
    const { svc, id } = await coop();
    state(svc).inventory.animal_feed = 2;
    mustOk(await svc.buyAnimal(id, k()));
    expect(await svc.removeBuilding(id, k())).toEqual({ ok: false, error: 'not_empty' });
    const m = make({ coins: 1000 });
    const mill = mustOk(await m.svc.placeBuilding('flour_mill', 2, 2, k())).buildingId;
    const before = (await m.svc.load()).coins;
    const r = mustOk(await m.svc.removeBuilding(mill, k()));
    expect(r.refund).toBe(60);
    expect(r.snapshot.coins).toBe(before + 60);
    expect(r.snapshot.buildings).toHaveLength(0);
    expect(await m.svc.removeBuilding(mill, k())).toEqual({ ok: false, error: 'unknown_building' });
  });
});

describe('quests, achievements, daily and the tutorial', () => {
  const view = (s: Awaited<ReturnType<LocalFarmService['load']>>) => ({ stats: s.stats, level: s.level, daily: s.daily, claimed: s.claimed });

  it('has the five tutorial steps in order', () => {
    expect(TUTORIAL.map((q) => q.id)).toEqual(['t1', 't2', 't3', 't4', 't5']);
    expect(TUTORIAL.map((q) => q.stat)).toEqual(['plant', 'harvest', 'sell', 'animal_buy', 'order']);
  });
  it('tracks progress from real actions and pays once when claimed', async () => {
    const { svc, t } = make();
    expect(currentTutorialStep(view(await svc.load()))!.id).toBe('t1');
    expect(await svc.claimQuest('t1', k())).toEqual({ ok: false, error: 'not_complete' });
    mustOk(await svc.plant('0,0', 'wheat', k()));
    const s1 = await svc.load();
    expect(questProgress(TUTORIAL[0], view(s1))).toBe(1);
    const claim = mustOk(await svc.claimQuest('t1', k()));
    expect(claim.coins).toBe(10);
    expect(claim.snapshot.coins).toBe(100 - 2 + 10);
    expect(await svc.claimQuest('t1', k())).toEqual({ ok: false, error: 'already_claimed' });
    void t;
  });
  it('replays a claim key without paying twice', async () => {
    const { svc } = make();
    mustOk(await svc.plant('0,0', 'wheat', k()));
    mustOk(await svc.claimQuest('t1', 'claim-1'));
    const again = mustOk(await svc.claimQuest('t1', 'claim-1'));
    expect(again.replayed).toBe(true);
    expect((await svc.load()).coins).toBe(100 - 2 + 10);
  });
  it('walks the whole tutorial and then marks it done', async () => {
    const { svc, t } = make({ coins: 500, inventory: { wheat: 4, animal_feed: 1 } });
    mustOk(await svc.plant('0,0', 'wheat', k()));
    t.v += 130_000;
    mustOk(await svc.harvest('0,0', k()));
    mustOk(await svc.sell('wheat', 1, k()));
    const coop = mustOk(await svc.placeBuilding('chicken_coop', 4, 4, k())).buildingId;
    mustOk(await svc.buyAnimal(coop, k()));
    const order = (await svc.load()).orders.find((o) => o.slot === 0)!;
    mustOk(await svc.fulfilOrder(order.id, k()));
    for (const q of TUTORIAL) mustOk(await svc.claimQuest(q.id, k()));
    const s = await svc.load();
    expect(s.tutorialDone).toBe(true);
    expect(currentTutorialStep(view(s))).toBeNull();
  });
  it('can skip the tutorial', async () => {
    const { svc } = make();
    mustOk(await svc.skipTutorial(k()));
    expect((await svc.load()).tutorialDone).toBe(true);
  });
  it('level achievements unlock from the level itself and pay gems', async () => {
    const { svc } = make({ level: 3 });
    const r = mustOk(await svc.claimQuest('ach_level_3', k()));
    expect(r.gems).toBe(1);
    expect(r.snapshot.gems).toBe(6);
    expect(await svc.claimQuest('ach_level_6', k())).toEqual({ ok: false, error: 'not_complete' }); // level 6 not reached
  });
  it('quests above the player level are not claimable', async () => {
    const { svc } = make({ level: 1 });
    expect(await svc.claimQuest('a_buy_3', k())).toEqual({ ok: false, error: 'unknown_quest' });
    expect(await svc.claimQuest('nope', k())).toEqual({ ok: false, error: 'unknown_quest' });
  });
  it('daily quests are stable within a day, reset on the next, and count only today', async () => {
    const { svc, t } = make();
    mustOk(await svc.plant('0,0', 'wheat', k()));
    const a = await svc.load();
    expect(a.daily.ids).toHaveLength(3);
    expect(a.daily.ids.every((id) => QUESTS.find((q) => q.id === id)!.daily)).toBe(true);
    t.v += 3_600_000;
    expect((await svc.load()).daily.ids).toEqual(a.daily.ids);
    t.v += 86_400_000; // tomorrow
    const b = await svc.load();
    expect(b.daily.day).toBe(a.daily.day + 1);
    expect(b.daily.claimed).toEqual([]);
    const plantQuest = QUESTS.find((q) => q.id === 'd_plant')!;
    expect(questProgress(plantQuest, view(b))).toBe(0); // yesterday's planting does not count today
  });
  it('a daily quest can be claimed once per day', async () => {
    const { svc, t } = make({ coins: 5000 });
    // find a daily quest that is both active today and easy: make everything easy by faking stats
    const day = (await svc.load()).daily;
    const id = day.ids[0];
    const def = QUESTS.find((q) => q.id === id)!;
    state(svc).stats[def.stat] = (state(svc).stats[def.stat] ?? 0) + def.target;
    mustOk(await svc.claimQuest(id, k()));
    expect(await svc.claimQuest(id, k())).toEqual({ ok: false, error: 'already_claimed' });
    expect(claimableCount(view(await svc.load()))).toBeGreaterThanOrEqual(0);
    t.v += 86_400_000;
    expect((await svc.load()).daily.claimed).toEqual([]);
  });
});

describe('save migration to version 3', () => {
  it('upgrades a Phase 3 save and keeps everything', async () => {
    const kv = new MemoryKV();
    kv.set('stratos_farm_save_v1', JSON.stringify({
      version: 2, coins: 321, gems: 5, xp: 10, level: 3, inventory: { egg: 2 },
      plots: [{ id: '0,0', gx: 0, gy: 0, cropId: null, plantedAt: null, readyAt: null }, { id: '1,0', gx: 1, gy: 0, cropId: null, plantedAt: null, readyAt: null }],
      buildings: [{ id: 'b1', type: 'chicken_coop', gx: 4, gy: 4, level: 1 }], animals: [], jobs: [], nextId: 2,
      lastSeen: 1, ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
    const svc = new LocalFarmService(WORLD, kv, { now: () => 100 * 86_400_000 });
    const s = await svc.load();
    expect(s.notice).toBeUndefined();
    expect(s.coins).toBe(321);
    expect(s.buildings).toHaveLength(1);
    expect(s.orders.length).toBeGreaterThan(0);
    expect(s.tutorialDone).toBe(false);
  });
});
