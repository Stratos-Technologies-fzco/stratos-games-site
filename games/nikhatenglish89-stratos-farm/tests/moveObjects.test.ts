import { describe, it, expect } from 'vitest';
import { LocalFarmService, MemoryKV } from '../src/services/LocalFarmService';
import { farmLayout as L, terrainFrameAt, worldConfig } from '../src/game/layout';

const world = worldConfig(L);
let n = 0;
const k = () => `mv-${++n}`;
const make = (kv = new MemoryKV()) => new LocalFarmService(world, kv, { now: () => 9_000_000 });
const snap = (svc: LocalFarmService) => (svc as unknown as { snapshot(): any }).snapshot();
const ok = <T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> => { expect(r.ok, JSON.stringify(r)).toBe(true); return r as Extract<T, { ok: true }>; };

describe('moving what was already on the farm', () => {
  it('moves a lamp post, a silo and a rock, free of charge, and remembers it', async () => {
    const kv = new MemoryKV();
    const svc = make(kv);
    const coins = snap(svc).coins;
    const r = ok(await svc.moveObject('lamp', 1, 0, k()));
    expect(r.snapshot.moved.lamp).toEqual({ gx: 1, gy: 0 });
    ok(await svc.moveObject('silo', 0, 11, k()));
    ok(await svc.moveObject('rock_1', 9, 11, k()));
    expect(snap(svc).coins).toBe(coins);
    const again = make(kv);                                    // a fresh start reads the same save
    expect(snap(again).moved).toMatchObject({ lamp: { gx: 1, gy: 0 }, silo: { gx: 0, gy: 11 }, rock_1: { gx: 9, gy: 11 } });
    expect(again.activeObstacles().find((o) => o.id === 'rock_1')).toMatchObject({ gx: 9, gy: 11 });
  });

  it('the old spot is free afterwards and the new one is taken', async () => {
    const svc = make();
    expect((await svc.moveObject('lamp', 4, 7, k())).ok).toBe(false);            // the scarecrow stands there
    ok(await svc.moveObject('lamp', 1, 0, k()));
    expect((await svc.moveObject('mailbox', 1, 0, k())).ok).toBe(false);         // it now stands at (1,0)
    ok(await svc.moveObject('mailbox', 4, 5, k()));                              // and (4,5) is free again
  });

  it('refuses water, locked land, the sea, a building or a half-way spot', async () => {
    const svc = make();
    for (const [gx, gy] of [[10, 4], [8, 8], [20, 20], [-1, 0], [3, 2]] as const) expect((await svc.moveObject('lamp', gx, gy, k())).ok, `${gx},${gy}`).toBe(false);
    expect((await svc.moveObject('lamp', 4.5, 5, k())).ok).toBe(false);
    expect((await svc.moveObject('nothing', 1, 1, k())).ok).toBe(false);
  });

  it('a big thing needs room for its whole footprint', async () => {
    const svc = make();
    expect((await svc.moveObject('barn', 10, 1, k())).ok).toBe(false);           // the silo and the edge are in the way
    ok(await svc.moveObject('barn', 7, 0, k()));
  });

  it('a field takes its soil and its crops with it', async () => {
    const svc = make();
    ok(await svc.plant('2,6', 'wheat', k()));
    ok(await svc.plant('3,7', 'wheat', k()));
    const r = ok(await svc.moveObject('field_a', 0, 5, k()));                     // Field A is at (2,6), 2 x 2
    const plots = r.snapshot.plots;
    expect(plots).toHaveLength(12);                                               // no plot lost, none added
    expect(plots.find((p) => p.id === '0,5')?.cropId).toBe('wheat');
    expect(plots.find((p) => p.id === '1,6')?.cropId).toBe('wheat');
    expect(plots.find((p) => p.id === '2,6')).toBeUndefined();
    expect(terrainFrameAt(L, 0, 5, [], r.snapshot.moved).frame).toBe('field_plowed');
    expect(terrainFrameAt(L, 2, 6, [], r.snapshot.moved).frame).not.toBe('field_plowed');
  });

  it('a field can slide over its own old tiles, and be put back', async () => {
    const svc = make();
    ok(await svc.moveObject('field_a', 2, 7, k()));
    expect(snap(svc).plots).toHaveLength(12);
    const back = ok(await svc.moveObject('field_a', 2, 6, k()));
    expect(back.snapshot.moved.field_a).toBeUndefined();                          // home again: nothing to remember
  });

  it('two moves with the same key count once', async () => {
    const svc = make();
    ok(await svc.moveObject('lamp', 1, 0, 'same'));
    const second = await svc.moveObject('lamp', 0, 0, 'same');
    expect(second.ok).toBe(true);
    expect(snap(svc).moved.lamp).toEqual({ gx: 1, gy: 0 });
  });

  it('is saved as version 5 and a save from before (no "moved") still loads', async () => {
    const kv = new MemoryKV();
    const svc = make(kv);
    ok(await svc.moveObject('lamp', 1, 0, k()));
    expect(JSON.parse(kv.get('stratos_farm_save_v1')!).version).toBe(5);
    const old = JSON.parse(kv.get('stratos_farm_save_v1')!); old.version = 4; delete old.moved; delete old.sig;
    const kv2 = new MemoryKV(); kv2.set('stratos_farm_save_v1', JSON.stringify(old));
    expect(snap(make(kv2)).moved).toEqual({});
  });
});
