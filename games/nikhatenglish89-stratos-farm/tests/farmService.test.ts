import { describe, it, expect } from 'vitest';
import { LocalFarmService, MemoryKV } from '../src/services/LocalFarmService';
import { cropStage } from '../src/services/types';

const CELLS = [{ gx: 0, gy: 0 }, { gx: 1, gy: 0 }, { gx: 0, gy: 1 }, { gx: 1, gy: 1 }];
function make(kv = new MemoryKV(), t = { v: 1_000_000 }) {
  const svc = new LocalFarmService(CELLS, kv, { now: () => t.v });
  return { svc, kv, t };
}
let n = 0;
const k = () => `key-${++n}`;
const internals = (s: LocalFarmService) => s as unknown as { state: { coins: number; xp: number; plots: unknown[] } };

describe('planting', () => {
  it('starts with seed values', async () => {
    const { svc } = make();
    const s = await svc.load();
    expect([s.coins, s.gems, s.level, s.xp]).toEqual([100, 5, 1, 0]);
    expect(s.plots).toHaveLength(4);
  });
  it('plants wheat, charges the seed and writes a ledger row', async () => {
    const { svc } = make();
    const r = await svc.plant('0,0', 'wheat', k());
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.snapshot.coins).toBe(98); expect(r.snapshot.plots[0].cropId).toBe('wheat'); }
    const led = svc.getLedger();
    expect(led).toHaveLength(1);
    expect(led[0]).toMatchObject({ kind: 'coins', delta: -2, balanceAfter: 98 });
  });
  it('rejects an invalid tile, unknown crop, locked crop and occupied plot', async () => {
    const { svc } = make();
    expect(await svc.plant('9,9', 'wheat', k())).toEqual({ ok: false, error: 'invalid_plot' });
    expect(await svc.plant('0,0', 'banana', k())).toEqual({ ok: false, error: 'unknown_crop' });
    expect(await svc.plant('0,0', 'corn', k())).toEqual({ ok: false, error: 'not_unlocked' });
    await svc.plant('0,0', 'wheat', k());
    expect(await svc.plant('0,0', 'carrot', k())).toEqual({ ok: false, error: 'plot_occupied' });
  });
  it('rejects planting without enough coins and changes nothing', async () => {
    const { svc } = make();
    internals(svc).state.coins = 1;
    const before = JSON.stringify(internals(svc).state.plots);
    expect(await svc.plant('0,0', 'wheat', k())).toEqual({ ok: false, error: 'insufficient_coins' });
    expect(JSON.stringify(internals(svc).state.plots)).toBe(before);
    expect((await svc.load()).coins).toBe(1);
    expect(svc.getLedger()).toHaveLength(0);
  });
});

describe('growth by server time and offline progress', () => {
  it('moves through stages and is ready after growSeconds', async () => {
    const { svc, t } = make();
    await svc.plant('0,0', 'wheat', k()); // 120 s
    const plot = () => svc.load().then((s) => s.plots[0]);
    expect(cropStage(await plot(), svc.now())).toBe(0);
    t.v += 50_000; expect(cropStage(await plot(), svc.now())).toBe(1);
    t.v += 40_000; expect(cropStage(await plot(), svc.now())).toBe(2);
    t.v += 30_000; expect(cropStage(await plot(), svc.now())).toBe(3);
  });
  it('rejects harvest before ready', async () => {
    const { svc, t } = make();
    await svc.plant('0,0', 'wheat', k());
    t.v += 119_000;
    expect(await svc.harvest('0,0', k())).toEqual({ ok: false, error: 'not_ready' });
  });
  it('a crop planted before closing the game is ready after reopening later (offline progress)', async () => {
    const kv = new MemoryKV(); const t = { v: 1_000_000 };
    const a = new LocalFarmService(CELLS, kv, { now: () => t.v });
    await a.plant('0,0', 'wheat', k());
    t.v += 10 * 60_000; // 10 minutes pass with the game closed
    const b = new LocalFarmService(CELLS, kv, { now: () => t.v }); // reload
    const snap = await b.load();
    expect(snap.plots[0].cropId).toBe('wheat');
    expect(cropStage(snap.plots[0], b.now())).toBe(3);
    expect((await b.harvest('0,0', k())).ok).toBe(true);
  });
  it('turning the device clock back gains nothing', async () => {
    const { svc, t } = make();
    await svc.plant('0,0', 'wheat', k());
    t.v += 30_000; await svc.load();
    const seen = svc.now();
    t.v -= 3_600_000; // clock set back an hour
    expect(svc.now()).toBeGreaterThanOrEqual(seen);
  });
});

describe('harvest, xp and levels', () => {
  it('harvests, pays items and xp, clears the plot', async () => {
    const { svc, t } = make();
    await svc.plant('0,0', 'wheat', k());
    t.v += 121_000;
    const h = await svc.harvest('0,0', k());
    expect(h.ok).toBe(true);
    if (h.ok) {
      expect(h.snapshot.inventory.wheat).toBe(2);
      expect(h.snapshot.xp).toBe(1);
      expect(h.snapshot.plots[0].cropId).toBeNull();
    }
  });
  it('prevents a duplicate harvest of the same plot', async () => {
    const { svc, t } = make();
    await svc.plant('0,0', 'wheat', k()); t.v += 121_000;
    expect((await svc.harvest('0,0', k())).ok).toBe(true);
    expect(await svc.harvest('0,0', k())).toEqual({ ok: false, error: 'nothing_planted' });
    expect((await svc.load()).inventory.wheat).toBe(2);
  });
  it('replays the same Idempotency-Key without paying twice', async () => {
    const { svc, t } = make();
    await svc.plant('0,0', 'wheat', k()); t.v += 121_000;
    const a = await svc.harvest('0,0', 'harvest-once');
    const b = await svc.harvest('0,0', 'harvest-once');
    expect(a.ok && b.ok && b.replayed).toBe(true);
    expect((await svc.load()).inventory.wheat).toBe(2);
    const planted = await svc.plant('0,0', 'carrot', 'plant-key');
    const again = await svc.plant('0,0', 'carrot', 'plant-key');
    expect(planted.ok && again.ok && again.replayed).toBe(true);
    expect((await svc.load()).coins).toBe(94); // 100 - 2 wheat - 4 carrot, carrot charged once
  });
  it('concurrent harvests of one plot pay exactly once', async () => {
    const { svc, t } = make();
    await svc.plant('0,0', 'wheat', k()); t.v += 121_000;
    const results = await Promise.all([svc.harvest('0,0', k()), svc.harvest('0,0', k()), svc.harvest('0,0', k())]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect((await svc.load()).inventory.wheat).toBe(2);
  });
  it('harvestAll takes every ready plot in one transaction', async () => {
    const { svc, t } = make();
    await svc.plant('0,0', 'wheat', k()); await svc.plant('1,0', 'wheat', k()); await svc.plant('0,1', 'carrot', k());
    t.v += 130_000; // wheat ready, carrot not
    const h = await svc.harvestAll(k());
    expect(h.ok && h.harvested).toHaveLength(2);
    expect((await svc.load()).inventory).toEqual({ wheat: 4 });
    expect(await svc.harvestAll(k())).toEqual({ ok: false, error: 'nothing_ready' });
  });
  it('levels up with leftover xp and keeps level-locked crops locked', async () => {
    const { svc } = make();
    internals(svc).state.xp = 99;
    await svc.plant('0,0', 'wheat', k());
    svc.advance(121_000);
    const h = await svc.harvest('0,0', k());
    expect(h.ok && h.levelUp).toBe(2);
    if (h.ok) { expect(h.snapshot.level).toBe(2); expect(h.snapshot.xp).toBe(0); }
    expect(await svc.plant('0,0', 'corn', k())).toEqual({ ok: false, error: 'not_unlocked' }); // corn needs level 3
  });
});

describe('selling and persistence', () => {
  it('sells items for coins and records ledger rows', async () => {
    const { svc, t } = make();
    await svc.plant('0,0', 'wheat', k()); t.v += 121_000; await svc.harvest('0,0', k());
    const r = await svc.sell('wheat', 2, k());
    expect(r.ok && r.coins).toBe(6);
    const s = await svc.load();
    expect(s.coins).toBe(104);
    expect(s.inventory.wheat).toBeUndefined();
    expect(await svc.sell('wheat', 1, k())).toEqual({ ok: false, error: 'insufficient_items' });
    expect(await svc.sell('wheat', -1, k())).toEqual({ ok: false, error: 'bad_request' });
    expect(svc.getLedger().filter((l) => l.reason === 'sell')).toHaveLength(2);
  });
  it('requires an idempotency key', async () => {
    const { svc } = make();
    expect(await svc.plant('0,0', 'wheat', '')).toEqual({ ok: false, error: 'bad_request' });
  });
  it('persists across a reload and survives a corrupt save', async () => {
    const kv = new MemoryKV(); const t = { v: 5_000 };
    const a = new LocalFarmService(CELLS, kv, { now: () => t.v });
    await a.plant('1,1', 'carrot', k());
    const b = new LocalFarmService(CELLS, kv, { now: () => t.v });
    expect((await b.load()).plots[3].cropId).toBe('carrot');
    kv.set('stratos_farm_save_v1', '{not json');
    const c = new LocalFarmService(CELLS, kv, { now: () => t.v });
    const s = await c.load();
    expect(s.coins).toBe(100);
    expect(s.notice).toBe('save_reset');
  });
});
