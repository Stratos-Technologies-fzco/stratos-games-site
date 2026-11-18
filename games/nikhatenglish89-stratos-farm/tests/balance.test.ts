import { describe, it, expect } from 'vitest';
import { LocalFarmService, MemoryKV, WorldConfig } from '../src/services/LocalFarmService';
import { ANIMALS, BUILDINGS, CROPS, ITEM_BY_ID, RECIPES } from '../src/services/data';
import { QUESTS, activeQuests, isClaimed, isComplete } from '../src/services/quests';
import { shouldReduceEffects } from '../src/game/perf';
import type { FarmSnapshot } from '../src/services/types';

// A simple bot plays the economy for many simulated hours. It is not clever, it just keeps every system busy,
// so we can see whether progression stalls, goes negative or runs away. Numbers are printed for the balance notes.
const PLOTS = Array.from({ length: 12 }, (_, i) => ({ gx: 2 + (i % 4), gy: 6 + Math.floor(i / 4) }));
const WORLD: WorldConfig = { cols: 24, rows: 24, plotCells: PLOTS, staticObjects: PLOTS.map((c, i) => ({ id: `p${i}`, gx: c.gx, gy: c.gy, w: 1, h: 1 })), isBuildable: () => true };
let keyN = 0;
const key = () => `bot${++keyN}`;

async function play(hours: number, stepMin = 4) {
  const t = { v: 200 * 86_400_000 };
  const svc = new LocalFarmService(WORLD, new MemoryKV(), { now: () => t.v });
  let spot = 0;
  const nextSpot = () => { const s = spot++; return { gx: 8 + (s % 4) * 3, gy: 1 + Math.floor(s / 4) * 3 }; };
  const checkpoints: Record<string, { level: number; coins: number }> = {};
  const steps = Math.round((hours * 60) / stepMin);
  let snap: FarmSnapshot = await svc.load();
  let minCoins = snap.coins;

  for (let i = 0; i < steps; i++) {
    t.v += stepMin * 60_000;
    snap = await svc.load();
    // 1. harvest everything that is ready
    await svc.harvestAll(key());
    // 2. animals and factories
    for (const b of snap.buildings) {
      const def = BUILDINGS.find((x) => x.id === b.type)!;
      if (def.kind === 'habitat') {
        await svc.collectAnimals(b.id, key());
        await svc.feedAnimals(b.id, key());
        await svc.buyAnimal(b.id, key());
        if (i % 30 === 0) await svc.upgradeBuilding(b.id, key());
      } else {
        await svc.collectJobs(b.id, key());
        const recipes = RECIPES.filter((r) => r.building === b.type).sort((a, c) => ITEM_BY_ID.get(c.output)!.sellPrice - ITEM_BY_ID.get(a.output)!.sellPrice);
        for (let q = 0; q < 4; q++) for (const r of recipes) if ((await svc.queueRecipe(b.id, r.id, key())).ok) break;
        if (i % 30 === 0) await svc.upgradeBuilding(b.id, key());
      }
    }
    snap = await svc.load();
    // 3. customer orders
    for (const o of snap.orders) await svc.fulfilOrder(o.id, key());
    // 4. quests
    for (const q of activeQuests({ stats: snap.stats, level: snap.level, daily: snap.daily, claimed: snap.claimed })) {
      const view = { stats: snap.stats, level: snap.level, daily: snap.daily, claimed: snap.claimed };
      if (isComplete(q, view) && !isClaimed(q, view)) await svc.claimQuest(q.id, key());
    }
    snap = await svc.load();
    // 5. build what is affordable and unlocked: one animal home and one factory of each kind
    for (const def of BUILDINGS) {
      if (def.unlockLevel > snap.level || snap.buildings.some((b) => b.type === def.id)) continue;
      if (snap.coins < def.cost + 40) continue;
      const s = nextSpot();
      if ((await svc.placeBuilding(def.id, s.gx, s.gy, key())).ok) snap = await svc.load();
    }
    // 6. sell everything not needed for recipes or feed (keep a little of what factories and animals eat)
    const keep = new Set<string>(['animal_feed']);
    for (const o of snap.orders) Object.keys(o.items).forEach((x) => keep.add(x)); // a sensible player holds what customers ask for
    for (const r of RECIPES) if (snap.buildings.some((b) => b.type === r.building)) Object.keys(r.inputs).forEach((x) => keep.add(x));
    for (const [item, qty] of Object.entries(snap.inventory)) {
      const sellQty = keep.has(item) ? Math.max(0, qty - 12) : qty;
      if (sellQty > 0) await svc.sell(item, sellQty, key());
    }
    snap = await svc.load();
    // 7. plant the best unlocked crop (profit per minute) on every empty plot
    const usable = CROPS.filter((c) => c.unlockLevel <= snap.level && c.seedCost <= snap.coins);
    const score = (c: (typeof CROPS)[number]) => (c.yield * c.sellPrice - c.seedCost) / (c.growSeconds / 60) + c.xp / (c.growSeconds / 60);
    const best = [...usable].sort((a, b) => score(b) - score(a))[0];
    // customers first: grow a crop a waiting order asks for, if we have none of it
    const wanted = snap.orders.flatMap((o) => Object.keys(o.items)).filter((x) => usable.some((c) => c.id === x) && (snap.inventory[x] ?? 0) === 0 && !snap.plots.some((p) => p.cropId === x));
    let w = 0;
    for (const p of snap.plots) {
      if (p.cropId) continue;
      const pick = wanted[w++] ?? best?.id;
      if (pick) await svc.plant(p.id, pick, key());
    }
    snap = await svc.load();
    minCoins = Math.min(minCoins, snap.coins);
    const h = ((i + 1) * stepMin) / 60;
    for (const mark of [0.5, 1, 2, 4, 8, 12, 24]) if (!checkpoints[`${mark}h`] && h >= mark) checkpoints[`${mark}h`] = { level: snap.level, coins: snap.coins };
  }
  return { snap, checkpoints, minCoins, ledger: svc.getLedger() };
}

describe('economy balance (a bot plays 24 hours)', () => {
  it('keeps progressing without stalling, going negative or breaking the ledger', async () => {
    const r = await play(24);
    // eslint-disable-next-line no-console
    console.log('BALANCE', JSON.stringify(r.checkpoints), 'final level', r.snap.level, 'buildings', r.snap.buildings.length, 'animals', r.snap.animals.length, 'orders delivered', r.snap.stats.order ?? 0);
    expect(r.minCoins).toBeGreaterThanOrEqual(0);
    expect(r.snap.level).toBeGreaterThan(5);                       // 24 h of steady play gets well past the first unlocks
    expect(r.snap.buildings.length).toBeGreaterThanOrEqual(6);     // the bot unlocked and built a good part of the village
    expect(r.snap.stats.order ?? 0).toBeGreaterThan(5);            // customers keep coming and a player who grows what they ask for can serve them
    // early game must not drag: level 2 inside the first hour of play
    expect(r.checkpoints['1h'].level).toBeGreaterThanOrEqual(2);
    // the ledger balances: every coin movement is recorded, ending at the real balance
    const coinRows = r.ledger.filter((l) => l.kind === 'coins');
    expect(coinRows.length).toBeGreaterThan(50);
    expect(coinRows[coinRows.length - 1].balanceAfter).toBe(r.snap.coins);
  });
  it('rewards faster levels to the player who plays more (no cap that makes extra play pointless)', async () => {
    const a = await play(4), b = await play(8);
    expect(b.snap.level).toBeGreaterThanOrEqual(a.snap.level);
    expect(b.snap.coins + b.snap.xp).toBeGreaterThan(a.snap.coins + a.snap.xp);
  });
  it('every quest and achievement is reachable by the data (targets are positive, rewards exist)', () => {
    for (const q of QUESTS) {
      expect(q.target, q.id).toBeGreaterThan(0);
      expect(Object.keys(q.reward).length, q.id).toBeGreaterThan(0);
    }
    expect(ANIMALS.every((a) => a.productSeconds > 0 && a.cost > 0)).toBe(true);
  });
});

describe('frame-rate watchdog', () => {
  it('reduces effects only after several clearly slow samples in a row', () => {
    expect(shouldReduceEffects([20, 20])).toBe(false);          // not enough samples yet
    expect(shouldReduceEffects([60, 20, 20])).toBe(false);      // one good sample breaks the run
    expect(shouldReduceEffects([20, 22, 25])).toBe(true);
    expect(shouldReduceEffects([30, 30, 59])).toBe(false);
    expect(shouldReduceEffects([0, 0, 0])).toBe(false);         // 0 means "no reading", never "slow"
  });
});
