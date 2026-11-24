import { describe, it, expect } from 'vitest';
import { FIELD_PRICES, LocalFarmService, MemoryKV } from '../src/services/LocalFarmService';
import { farmLayout as L, terrainFrameAt, worldConfig } from '../src/game/layout';

const world = worldConfig(L);
let n = 0;
const k = () => `bf-${++n}`;
const make = (kv = new MemoryKV()) => new LocalFarmService(world, kv, { now: () => 9_000_000 });
const snap = (svc: LocalFarmService) => (svc as unknown as { snapshot(): any }).snapshot();
const ok = <T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> => { expect(r.ok, JSON.stringify(r)).toBe(true); return r as Extract<T, { ok: true }>; };
const rich = (svc: LocalFarmService) => { (svc as any).state.coins = 100000; };

describe('buying more fields', () => {
  it('starts with 12 plots and no extra field on the map', () => {
    const svc = make();
    expect(snap(svc).plots.length).toBe(12);
    expect(svc.nextFieldCost()).toBe(FIELD_PRICES[0]);
  });

  it('a new plot costs coins, lands on free ground and adds 1 plot', async () => {
    const svc = make();
    rich(svc);
    const before = snap(svc).coins;
    const r = ok(await svc.buyField(k()));
    expect(snap(svc).coins).toBe(before - FIELD_PRICES[0]);
    expect(r.snapshot.plots.length).toBe(13);
    const at = r.snapshot.moved[r.objectId];
    expect(terrainFrameAt(L, at.gx, at.gy, [], r.snapshot.moved).frame).toBe('field_plowed');
    expect(svc.nextFieldCost()).toBe(30);
  });

  it('refuses when short of coins, and the same key never pays twice', async () => {
    const svc = make();
    (svc as any).state.coins = 10;
    expect((await svc.buyField(k())).ok).toBe(false);
    rich(svc);
    const key = k();
    ok(await svc.buyField(key));
    const coins = snap(svc).coins;
    await svc.buyField(key);
    expect(snap(svc).coins).toBe(coins);
    expect(snap(svc).plots.length).toBe(13);
  });

  it('the new field can be moved, crops and all, and is kept after a reload', async () => {
    const kv = new MemoryKV();
    const svc = make(kv);
    rich(svc);
    const r = ok(await svc.buyField(k()));
    const from = r.snapshot.moved[r.objectId];
    expect((await svc.moveObject('field_f', 5, 5, k())).ok).toBe(false);   // not bought: not on the map
    let to = from;                                            // the first free 2x2 spot that is not where it stands
    for (let gy = 0; gy < 12 && to === from; gy++) for (let gx = 0; gx < 12 && to === from; gx++) {
      if (gx === from.gx && gy === from.gy) continue;
      const m = await svc.moveObject(r.objectId, gx, gy, k());
      if (m.ok) to = { gx, gy };
    }
    expect(to).not.toBe(from);
    expect(snap(svc).moved[r.objectId]).toEqual(to);
    expect(snap(svc).plots.some((p: any) => p.id === `${to.gx},${to.gy}`)).toBe(true);
    expect(snap(svc).plots.some((p: any) => p.id === `${from.gx},${from.gy}`)).toBe(false);
    const again = make(kv);
    expect(snap(again).plots.length).toBe(13);
  });

  it('stops after the last plot', async () => {
    const svc = make();
    rich(svc);
    let bought = 0;
    for (let i = 0; i < 20; i++) { const r = await svc.buyField(k()); if (r.ok) bought++; else break; }
    expect(bought).toBe(FIELD_PRICES.length);
    expect(svc.nextFieldCost()).toBeNull();
  });
});

describe('a field looks like a field wherever it stands', () => {
  it('shows soil on bought land too, not grass', async () => {
    const lot = L.expansions.find((e) => e.id.startsWith('lot_'))!;
    const [x, y] = lot.rect;
    const expanded = [lot.id];
    expect(terrainFrameAt(L, x, y, expanded, {}).frame).not.toBe('field_plowed');
    expect(terrainFrameAt(L, x, y, expanded, { field_d: { gx: x, gy: y } }).frame).toBe('field_plowed');
    expect(terrainFrameAt(L, x, y, expanded, { field_a: { gx: x, gy: y } }).frame).toBe('field_plowed');
    // and the spot a field left is plain land again
    expect(terrainFrameAt(L, 2, 6, [], { field_a: { gx: 0, gy: 0 } }).frame).not.toBe('field_plowed');
  });
});
