import crops from '../data/crops.json';
import { xpForNextLevel } from '../game/rules';
import {
  CropDef, ErrorCode, FarmService, FarmSnapshot, HarvestResult, LedgerRow, PlantResult, PlotState, SellResult,
} from './types';

export interface KV { get(key: string): string | null; set(key: string, value: string): void }
export interface Clock { now(): number }

export class MemoryKV implements KV {
  private m = new Map<string, string>();
  get(k: string) { return this.m.get(k) ?? null; }
  set(k: string, v: string) { this.m.set(k, v); }
}

export class BrowserKV implements KV {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } }
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* storage full or blocked: play on without saving */ } }
}

const SAVE_KEY = 'stratos_farm_save_v1'; // not a "stratos." key, so it never touches the shared wallet
const VERSION = 1;
const IDEM_CAP = 200;
const LEDGER_CAP = 500;

interface SavedState {
  version: number;
  coins: number; gems: number; xp: number; level: number;
  inventory: Record<string, number>;
  plots: PlotState[];
  lastSeen: number;
  ledger: LedgerRow[];
  nextLedgerId: number;
  idem: Record<string, unknown>;
  idemOrder: string[];
}

export const CROPS: CropDef[] = crops.crops;
const CROP_BY_ID = new Map(CROPS.map((c) => [c.id, c]));

type Fail = { ok: false; error: ErrorCode };
const fail = (error: ErrorCode): Fail => ({ ok: false, error });

/**
 * Local stand-in for the server. It keeps the server rules so a real API can replace it later:
 * lazy time (planted_at / ready_at, never a tick loop), one atomic transaction per action, a ledger row for every
 * change, idempotency keys, and a clock that can never run backwards. Calls are queued one at a time (like row locks).
 */
export class LocalFarmService implements FarmService {
  private state: SavedState;
  private queue: Promise<unknown> = Promise.resolve();
  private skewMs = 0;
  private notice?: 'save_reset';

  constructor(
    private plotCells: { gx: number; gy: number }[],
    private kv: KV = new BrowserKV(),
    private clock: Clock = { now: () => Date.now() },
  ) {
    this.state = this.read();
  }

  // ---------- time ----------
  /** Service time. Never earlier than the last time we saw, so turning the device clock back gains nothing. */
  now(): number {
    const n = Math.max(this.clock.now() + this.skewMs, this.state.lastSeen);
    this.state.lastSeen = n; // high-water mark, saved with the next action
    return n;
  }
  /** Debug only: pretend time has passed (used by tests and ?debug=1). */
  advance(ms: number) { this.skewMs += ms; }

  // ---------- persistence ----------
  private fresh(): SavedState {
    return {
      version: VERSION, ...crops.start, inventory: {},
      plots: this.plotCells.map((c) => ({ id: `${c.gx},${c.gy}`, gx: c.gx, gy: c.gy, cropId: null, plantedAt: null, readyAt: null })),
      lastSeen: this.clock.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    };
  }

  private read(): SavedState {
    const raw = this.kv.get(SAVE_KEY);
    if (!raw) return this.fresh();
    try {
      const s = JSON.parse(raw) as SavedState;
      if (s.version !== VERSION || typeof s.coins !== 'number' || !Array.isArray(s.plots)) throw new Error('bad save');
      // new plots added to the layout later start empty; plots removed from the layout are dropped
      const byId = new Map(s.plots.map((p) => [p.id, p]));
      s.plots = this.plotCells.map((c) => byId.get(`${c.gx},${c.gy}`) ?? { id: `${c.gx},${c.gy}`, gx: c.gx, gy: c.gy, cropId: null, plantedAt: null, readyAt: null });
      return s;
    } catch {
      this.notice = 'save_reset';
      return this.fresh();
    }
  }

  private save() { this.kv.set(SAVE_KEY, JSON.stringify(this.state)); }

  private snapshot(): FarmSnapshot {
    const s = this.state;
    return {
      version: VERSION, coins: s.coins, gems: s.gems, xp: s.xp, level: s.level,
      inventory: { ...s.inventory }, plots: s.plots.map((p) => ({ ...p })), serverNow: this.now(),
      ...(this.notice ? { notice: this.notice } : {}),
    };
  }

  // ---------- transaction helper ----------
  /** Runs `fn` alone (queued), replays a stored result for a repeated key, saves only on success. */
  private tx<T extends { ok: boolean }>(key: string, fn: () => T): Promise<T> {
    const run = async (): Promise<T> => {
      if (!key) return fail('bad_request') as unknown as T;
      const prev = this.state.idem[key] as T | undefined;
      if (prev) return { ...prev, snapshot: this.snapshot(), replayed: true } as T;
      this.state.lastSeen = this.now();
      const backup = JSON.stringify(this.state);
      let res: T;
      try { res = fn(); } catch (e) { this.state = JSON.parse(backup); throw e; }
      if (res.ok) {
        const stored: Record<string, unknown> = { ...res };
        delete stored.snapshot; // keep saves small; a replay gets a fresh snapshot
        this.state.idem[key] = stored;
        this.state.idemOrder.push(key);
        while (this.state.idemOrder.length > IDEM_CAP) delete this.state.idem[this.state.idemOrder.shift()!];
        this.save();
      } else {
        this.state = JSON.parse(backup); // a failed action changes nothing
      }
      return res;
    };
    const p = this.queue.then(run, run);
    this.queue = p.catch(() => undefined);
    return p;
  }

  private log(kind: LedgerRow['kind'], ref: string, delta: number, balanceAfter: number, reason: string) {
    const s = this.state;
    s.ledger.push({ id: s.nextLedgerId++, ts: this.now(), kind, ref, delta, balanceAfter, reason });
    if (s.ledger.length > LEDGER_CAP) s.ledger.splice(0, s.ledger.length - LEDGER_CAP);
  }

  /** Exposed for tests and the future audit view. */
  getLedger(): LedgerRow[] { return this.state.ledger.map((r) => ({ ...r })); }

  private addXp(amount: number, ref: string): number | null {
    const s = this.state;
    s.xp += amount;
    this.log('xp', ref, amount, s.xp, 'harvest');
    let up: number | null = null;
    while (s.xp >= xpForNextLevel(s.level)) { s.xp -= xpForNextLevel(s.level); s.level += 1; up = s.level; }
    return up;
  }

  // ---------- API ----------
  async load(): Promise<FarmSnapshot> { return this.queue.then(() => this.snapshot()); }

  plant(plotId: string, cropId: string, key: string): Promise<PlantResult> {
    return this.tx(key, () => {
      const s = this.state;
      const plot = s.plots.find((p) => p.id === plotId);
      if (!plot) return fail('invalid_plot');
      const crop = CROP_BY_ID.get(cropId);
      if (!crop) return fail('unknown_crop');
      if (crop.unlockLevel > s.level) return fail('not_unlocked');
      if (plot.cropId) return fail('plot_occupied');
      if (s.coins < crop.seedCost) return fail('insufficient_coins');
      const now = this.now();
      s.coins -= crop.seedCost;
      this.log('coins', `plant:${plotId}:${cropId}`, -crop.seedCost, s.coins, 'seed');
      plot.cropId = cropId; plot.plantedAt = now; plot.readyAt = now + crop.growSeconds * 1000;
      return { ok: true as const, plotId, cropId, cost: crop.seedCost, snapshot: this.snapshot() };
    });
  }

  private harvestPlots(ids: string[]): HarvestResult {
    const s = this.state, now = this.now();
    const harvested: { plotId: string; cropId: string; amount: number; xp: number }[] = [];
    let levelUp: number | null = null;
    for (const id of ids) {
      const plot = s.plots.find((p) => p.id === id)!;
      const crop = CROP_BY_ID.get(plot.cropId!)!;
      s.inventory[crop.id] = (s.inventory[crop.id] ?? 0) + crop.yield;
      this.log('item', `harvest:${id}:${crop.id}`, crop.yield, s.inventory[crop.id], 'harvest');
      const up = this.addXp(crop.xp, `harvest:${id}`);
      if (up) levelUp = up;
      harvested.push({ plotId: id, cropId: crop.id, amount: crop.yield, xp: crop.xp });
      plot.cropId = null; plot.plantedAt = null; plot.readyAt = null;
    }
    void now;
    return { ok: true, harvested, levelUp, snapshot: this.snapshot() };
  }

  harvest(plotId: string, key: string): Promise<HarvestResult> {
    return this.tx(key, (): HarvestResult => {
      const plot = this.state.plots.find((p) => p.id === plotId);
      if (!plot) return fail('invalid_plot');
      if (!plot.cropId) return fail('nothing_planted');
      if (this.now() < (plot.readyAt ?? Infinity)) return fail('not_ready');
      return this.harvestPlots([plotId]);
    });
  }

  harvestAll(key: string): Promise<HarvestResult> {
    return this.tx(key, (): HarvestResult => {
      const now = this.now();
      const ids = this.state.plots.filter((p) => p.cropId && now >= (p.readyAt ?? Infinity)).map((p) => p.id);
      if (!ids.length) return fail('nothing_ready');
      return this.harvestPlots(ids);
    });
  }

  sell(itemId: string, qty: number, key: string): Promise<SellResult> {
    return this.tx(key, (): SellResult => {
      const s = this.state;
      const crop = CROP_BY_ID.get(itemId);
      if (!crop || !Number.isInteger(qty) || qty < 1) return fail('bad_request');
      if ((s.inventory[itemId] ?? 0) < qty) return fail('insufficient_items');
      s.inventory[itemId] -= qty;
      if (s.inventory[itemId] === 0) delete s.inventory[itemId];
      this.log('item', `sell:${itemId}`, -qty, s.inventory[itemId] ?? 0, 'sell');
      const coins = qty * crop.sellPrice;
      s.coins += coins;
      this.log('coins', `sell:${itemId}`, coins, s.coins, 'sell');
      return { ok: true as const, itemId, qty, coins, snapshot: this.snapshot() };
    });
  }
}
