import { describe, it, expect, afterEach } from 'vitest';
import { LocalFarmService, MemoryKV, WorldConfig } from '../src/services/LocalFarmService';
import { hintFor } from '../src/services/hints';
import { SC, coinBalance, offerCoins, track } from '../src/game/stratos';
import { ITEMS } from '../src/services/data';
import game from '../game.json';

const WORLD: WorldConfig = {
  cols: 12, rows: 12, plotCells: [{ gx: 0, gy: 0 }], staticObjects: [{ id: 'f', gx: 0, gy: 0, w: 1, h: 1 }], isBuildable: () => true,
};
let n = 0;
const k = () => `l${++n}`;
const mustOk = <T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> => { expect(r.ok, JSON.stringify(r)).toBe(true); return r as Extract<T, { ok: true }>; };
function make(o: { coins?: number; level?: number; inventory?: Record<string, number> } = {}) {
  const t = { v: 100 * 86_400_000 };
  const svc = new LocalFarmService(WORLD, new MemoryKV(), { now: () => t.v });
  const st = (svc as unknown as { state: { coins: number; level: number; inventory: Record<string, number> } }).state;
  if (o.coins !== undefined) st.coins = o.coins;
  if (o.level !== undefined) st.level = o.level;
  if (o.inventory) st.inventory = { ...o.inventory };
  return { svc, t };
}

describe('speed-up', () => {
  it('finishes a growing crop now, once', async () => {
    const { svc } = make();
    mustOk(await svc.plant('0,0', 'carrot', k()));
    expect((await svc.harvest('0,0', k())).ok).toBe(false);
    mustOk(await svc.speedUp('plot', '0,0', k()));
    expect(mustOk(await svc.harvest('0,0', k())).harvested[0].cropId).toBe('carrot');
    mustOk(await svc.plant('0,0', 'carrot', k()));
    mustOk(await svc.speedUp('plot', '0,0', k()));
    expect(await svc.speedUp('plot', '0,0', k())).toEqual({ ok: false, error: 'already_ready' });
    expect(await svc.speedUp('plot', '9,9', k())).toEqual({ ok: false, error: 'invalid_plot' });
  });
  it('replays an idempotent speed-up without side effects', async () => {
    const { svc } = make();
    mustOk(await svc.plant('0,0', 'wheat', k()));
    mustOk(await svc.speedUp('plot', '0,0', 'su'));
    expect(mustOk(await svc.speedUp('plot', '0,0', 'su')).replayed).toBe(true);
  });
  it('speeds up a producing animal but not a hungry one', async () => {
    const { svc } = make({ coins: 1000, inventory: { animal_feed: 2 } });
    const coop = mustOk(await svc.placeBuilding('chicken_coop', 4, 4, k())).buildingId;
    const aid = mustOk(await svc.buyAnimal(coop, k())).animalId;
    expect(await svc.speedUp('animal', aid, k())).toEqual({ ok: false, error: 'nothing_hungry' });
    mustOk(await svc.feedAnimals(coop, k()));
    mustOk(await svc.speedUp('animal', aid, k()));
    expect(mustOk(await svc.collectAnimals(coop, k())).collected[0].itemId).toBe('egg');
  });
  it('speeding up a factory job pulls the next job forward by the time saved', async () => {
    const { svc, t } = make({ coins: 1000, level: 1, inventory: { wheat: 6 } });
    const mill = mustOk(await svc.placeBuilding('flour_mill', 4, 4, k())).buildingId;
    const a = mustOk(await svc.queueRecipe(mill, 'flour', k()));
    const b = mustOk(await svc.queueRecipe(mill, 'flour', k()));
    expect(b.readyAt - a.readyAt).toBe(300_000);
    mustOk(await svc.speedUp('job', a.jobId, k()));
    const snap = await svc.load();
    const second = snap.jobs.find((j) => j.id === b.jobId)!;
    expect(second.readyAt - snap.serverNow).toBe(300_000); // runs for its own 5 minutes starting now
    t.v += 1000;
    expect(mustOk(await svc.collectJobs(mill, k())).collected).toEqual([{ itemId: 'flour', qty: 1 }]);
  });
});

describe('hints', () => {
  it('explains how to get every item in the game', () => {
    for (const i of ITEMS) {
      const h = hintFor(i.id);
      expect(h.length, i.id).toBeGreaterThan(10);
      expect(h, i.id).not.toContain('keep playing to find out');
    }
    expect(hintFor('flour')).toContain('Flour Mill');
    expect(hintFor('egg')).toContain('Chicken Coop');
    expect(hintFor('wheat')).toContain('field');
  });
});

describe('Stratos site link', () => {
  afterEach(() => { delete (globalThis as { Stratos?: unknown }).Stratos; });

  it('does nothing and stays free when the game runs outside the site', () => {
    expect(SC()).toBeNull();
    expect(coinBalance()).toBeNull();
    let paid = false;
    offerCoins('boost', () => { paid = true; });
    expect(paid).toBe(true);
    expect(() => track('level_start', { level: 1 })).not.toThrow();
  });
  it('sends events and asks the wallet before running the boost', () => {
    const events: [string, unknown][] = [];
    const offers: string[] = [];
    (globalThis as { Stratos?: unknown }).Stratos = {
      track: (name: string, d: unknown) => events.push([name, d]),
      coins: { balance: () => 42, offer: (kind: string, done: () => void) => { offers.push(kind); /* player has not paid yet */ } },
    };
    track('level_complete', { level: 2 });
    expect(events).toEqual([['level_complete', { level: 2 }]]);
    expect(coinBalance()).toBe(42);
    let ran = false;
    offerCoins('boost', () => { ran = true; });
    expect(offers).toEqual(['boost']);
    expect(ran).toBe(false); // runs only after the wallet says the player paid
  });
  it('survives a broken Stratos object', () => {
    (globalThis as { Stratos?: unknown }).Stratos = { track: () => { throw new Error('boom'); }, coins: { offer: () => { throw new Error('boom'); } } };
    expect(() => track('x')).not.toThrow();
    let ran = false;
    offerCoins('hint', () => { ran = true; });
    expect(ran).toBe(true);
  });
});

describe('game.json meets the site rules', () => {
  const words = (t: string) => (t.match(/[A-Za-z0-9']+/g) ?? []).length;
  it('has a full page for Google and AdSense', () => {
    expect(game.title).toBeTruthy();
    expect(game.how_to_play).toBeTruthy();
    expect(words(game.description)).toBeGreaterThanOrEqual(150);
    expect(game.controls.length).toBeGreaterThan(0);
    expect(game.tips.length).toBeGreaterThan(0);
    expect(game.story).toBeTruthy();
    expect(game.faq.length).toBeGreaterThan(0);
  });
  it('is no longer a coming-soon placeholder and records native resume', () => {
    expect((game as Record<string, unknown>).status).toBeUndefined();
    expect(game.resume.native).toBe(true);
    expect(game.maker).toBe('Nikhat Sultana');
    expect(game.github).toBe('nikhatenglish89');
  });
});
