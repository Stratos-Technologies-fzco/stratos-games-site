import { describe, it, expect } from 'vitest';
import { LocalFarmService, MemoryKV, SAVE_KEY, WorldConfig, checksum, validateSave } from '../src/services/LocalFarmService';
import { MockAdProvider, withRewardedAd } from '../src/providers/ads';
import { MockPurchaseProvider, gemsForReceipt } from '../src/providers/purchases';
import { farmLayout, worldConfig } from '../src/game/layout';

const WORLD: WorldConfig = { cols: 12, rows: 12, plotCells: [{ gx: 0, gy: 0 }], staticObjects: [{ id: 'f', gx: 0, gy: 0, w: 1, h: 1 }], isBuildable: () => true };
let n = 0;
const k = () => `p7-${++n}`;
const mk = (kv = new MemoryKV()) => ({ kv, svc: new LocalFarmService(WORLD, kv, { now: () => 5_000_000 }) });
const reopen = (kv: MemoryKV) => new LocalFarmService(WORLD, kv, { now: () => 5_000_000 });

describe('save integrity and backup', () => {
  it('signs every save and loads it back unchanged', async () => {
    const { kv, svc } = mk();
    await svc.plant('0,0', 'wheat', k());
    expect(typeof JSON.parse(kv.get(SAVE_KEY)!).sig).toBe('string');
    const s = await reopen(kv).load();
    expect(s.plots[0].cropId).toBe('wheat');
    expect(s.notice).toBeUndefined();
  });
  it('restores the previous save when the latest one does not match its checksum', async () => {
    const { kv, svc } = mk();
    await svc.plant('0,0', 'wheat', k());      // save 1
    await svc.speedUp('plot', '0,0', k());     // save 2
    const latest = JSON.parse(kv.get(SAVE_KEY)!);
    latest.coins = 999_999;                    // edited by hand: the checksum no longer matches
    kv.set(SAVE_KEY, JSON.stringify(latest));
    const s = await reopen(kv).load();
    expect(s.notice).toBe('save_restored');
    expect(s.coins).toBeLessThan(1000);
  });
  it('never wipes a farm over a checksum alone when there is nothing to go back to', async () => {
    const { kv, svc } = mk();
    await svc.plant('0,0', 'wheat', k());
    const only = JSON.parse(kv.get(SAVE_KEY)!);
    kv.set('stratos_farm_save_prev_v1', 'garbage');
    only.coins = 77;
    kv.set(SAVE_KEY, JSON.stringify(only));
    const s = await reopen(kv).load();
    expect(s.coins).toBe(77);
    expect(s.notice).toBeUndefined();
  });
  it('still reads old saves that have no checksum', async () => {
    const kv = new MemoryKV();
    kv.set(SAVE_KEY, JSON.stringify({
      version: 3, coins: 321, gems: 1, xp: 0, level: 2, inventory: {}, plots: [], buildings: [], animals: [], jobs: [], orders: [], orderCooldowns: {},
      orderCounter: 0, expanded: [], stats: {}, claimed: [], daily: { day: -1, ids: [], base: {}, claimed: [] }, tutorialDone: false,
      nextId: 1, lastSeen: 1, ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    }));
    expect((await reopen(kv).load()).coins).toBe(321);
  });
  it('checksum is stable and sensitive', () => {
    expect(checksum('abc')).toBe(checksum('abc'));
    expect(checksum('abc')).not.toBe(checksum('abd'));
  });
});

describe('importing a backup', () => {
  const world = worldConfig(farmLayout);
  it('accepts a real save and rejects junk and huge files', async () => {
    const { kv, svc } = mk();
    await svc.plant('0,0', 'wheat', k());
    expect(validateSave(kv.get(SAVE_KEY)!, world)).toEqual({ ok: true });
    expect(validateSave('not json', world).ok).toBe(false);
    expect(validateSave('{"coins": "lots"}', world).ok).toBe(false);
    expect(validateSave('{"version":3,"coins":5,"plots":"no"}', world).ok).toBe(false);
    expect(validateSave('x'.repeat(2_000_001), world).ok).toBe(false);
  });
});

describe('ad and purchase providers are mocks and never grant on their own', () => {
  it('gives the reward only after a finished ad, and nothing without a provider', async () => {
    let given = 0;
    expect(await withRewardedAd(null, 'hint', () => given++)).toBe(false);
    expect(await withRewardedAd(new MockAdProvider({ rewarded: false, reason: 'closed_early' }), 'hint', () => given++)).toBe(false);
    expect(await withRewardedAd(new MockAdProvider({ rewarded: true }, false), 'hint', () => given++)).toBe(false);
    const ok = new MockAdProvider({ rewarded: true });
    expect(await withRewardedAd(ok, 'second_chance', () => given++)).toBe(true);
    expect(given).toBe(1);
    expect(ok.calls).toEqual(['second_chance']);
  });
  it('credits gems only for a receipt a backend verifies, never a mock or reused one', async () => {
    const p = new MockPurchaseProvider();
    const r = await p.purchase('gems_small');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.receipt.mock).toBe(true);
    const yes = { verify: async () => ({ valid: true, alreadyUsed: false }) };
    expect(await gemsForReceipt(r.receipt, yes)).toBe(0);                       // mock receipts never count
    expect(await gemsForReceipt({ ...r.receipt, mock: false }, yes)).toBe(10);
    expect(await gemsForReceipt({ ...r.receipt, mock: false }, { verify: async () => ({ valid: true, alreadyUsed: true }) })).toBe(0);
    expect(await gemsForReceipt({ ...r.receipt, mock: false }, { verify: async () => ({ valid: false, alreadyUsed: false }) })).toBe(0);
    expect(await gemsForReceipt({ ...r.receipt, mock: false }, null)).toBe(0);  // no server, no gems
    expect(await new MockPurchaseProvider('cancel').purchase('gems_small')).toEqual({ ok: false, error: 'cancelled' });
    expect(await p.purchase('nope')).toEqual({ ok: false, error: 'unavailable' });
  });
});
