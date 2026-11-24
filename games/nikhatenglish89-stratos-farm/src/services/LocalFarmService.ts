import { xpForNextLevel } from '../game/rules';
import { OccupancyMap } from '../iso/occupancy';
import { validatePlacement } from '../iso/placement';
import {
  ANIMAL_BY_ID, BUILDING_BY_ID, CROPS, CROP_BY_ID, FEED_ITEM, ITEM_BY_ID, MAX_LEVEL, OBSTACLE_TYPE_BY_ID, ORDERS, RECIPES, RECIPE_BY_ID, START,
} from './data';
import { QUEST_BY_ID, TUTORIAL, dayOf, isClaimed, pickDaily, questProgress } from './quests';
import {
  MoveObjectResult, BuyFieldResult, AnimalBuyResult, AnimalState, BuildingState, ClaimResult, CollectResult, ErrorCode, ExpandResult, ExpansionDef, FarmService, FarmSnapshot,
  FeedResult, HarvestResult, JobState, ObstacleDef, ClearResult, RotateResult, LedgerRow, MoveResult, OrderResult, OrderState, PlaceResult, PlantResult, PlotState, QueueResult,
  RemoveResult, SellResult, SimpleResult, SpeedKind, SpeedResult, UpgradeResult,
  animalHappiness, animalStatus, habitatCapacity, productionSlots,
} from './types';

export { CROPS } from './data';

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

/** What the service needs to know about the map: field plots, fixed objects and which tiles may be built on. */
export interface WorldConfig {
  cols: number; rows: number;
  plotCells: { gx: number; gy: number }[];
  /** The fields of the map (they also appear in staticObjects). When given, plots follow the fields when a field is moved. */
  fields?: { id: string; gx: number; gy: number; w: number; h: number; extra?: boolean }[];
  staticObjects: { id: string; gx: number; gy: number; w: number; h: number; extra?: boolean }[];
  isBuildable: (gx: number, gy: number, moved?: Record<string, { gx: number; gy: number }>) => boolean;
  expansions?: ExpansionDef[];
  /** Rocks, trees and bushes that can be cleared (some belong to a lot and only appear once it is cleared). */
  obstacles?: ObstacleDef[];
  /** May this land be cleared now (does it touch land you own)? Missing = always. */
  canExpand?: (id: string, expandedIds: string[]) => boolean;
}

export const SAVE_KEY = 'stratos_farm_save_v1'; // not a "stratos." key, so it never touches the shared wallet
const PREV_KEY = 'stratos_farm_save_prev_v1'; // the save before the latest one: a way back if the latest is damaged
const VERSION = 5;
/** What the 1st, 2nd, 3rd... extra plot costs (each one is a single tile, 30 coins every time). */
export const FIELD_PRICES = Array.from({ length: 12 }, () => 30);
const IDEM_CAP = 200;
const LEDGER_CAP = 500;

interface SavedState {
  version: number;
  coins: number; gems: number; xp: number; level: number;
  inventory: Record<string, number>;
  plots: PlotState[];
  buildings: BuildingState[];
  animals: AnimalState[];
  jobs: JobState[];
  orders: OrderState[];
  orderCooldowns: Record<string, number>;
  orderCounter: number;
  expanded: string[];
  clearedObstacles: string[];
  moved: Record<string, { gx: number; gy: number }>;
  stats: Record<string, number>;
  claimed: string[];
  daily: { day: number; ids: string[]; base: Record<string, number>; claimed: string[] };
  tutorialDone: boolean;
  nextId: number;
  lastSeen: number;
  ledger: LedgerRow[];
  nextLedgerId: number;
  idem: Record<string, unknown>;
  idemOrder: string[];
}

/** Small, fast checksum (djb2). It catches damage and casual edits; it is not a security feature (the player owns the save). */
export function checksum(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** Is this text a save this game can load? Used before an imported backup replaces the real save. */
export function validateSave(text: string, world: WorldConfig): { ok: true } | { ok: false; error: string } {
  if (text.length > 2_000_000) return { ok: false, error: 'That file is too big to be a farm save.' };
  const probe = new LocalFarmService(world, new MemoryKV(), { now: () => Date.now() });
  const r = probe.parse(text);
  return r.ok || r.unsigned ? { ok: true } : { ok: false, error: 'That file is not a Stratos Farm save (or it is damaged).' };
}

type Fail = { ok: false; error: ErrorCode };
const fail = (error: ErrorCode): Fail => ({ ok: false, error });
const emptyPlot = (c: { gx: number; gy: number }): PlotState => ({ id: `${c.gx},${c.gy}`, gx: c.gx, gy: c.gy, cropId: null, plantedAt: null, readyAt: null });

/**
 * Local stand-in for the server. It keeps the server rules so a real API can replace it later:
 * lazy time (planted_at / ready_at / production job times, never a tick loop), one atomic transaction per action,
 * a ledger row for every change, idempotency keys, and a clock that can never run backwards.
 * Calls are queued one at a time (like row locks).
 */
export class LocalFarmService implements FarmService {
  private state: SavedState;
  private queue: Promise<unknown> = Promise.resolve();
  private skewMs = 0;
  private notice?: 'save_reset' | 'save_restored';

  constructor(
    private world: WorldConfig,
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
      version: VERSION, ...START, inventory: {},
      plots: this.cellsFor({}).map(emptyPlot), buildings: [], animals: [], jobs: [], ...this.phase4Defaults(), nextId: 1,
      lastSeen: this.clock.now(), ledger: [], nextLedgerId: 1, idem: {}, idemOrder: [],
    };
  }

  private read(): SavedState {
    const raw = this.kv.get(SAVE_KEY);
    if (!raw) return this.fresh();
    const good = this.parse(raw);
    if (good.ok) return good.state;
    // the latest save does not match its checksum: try the one before it, otherwise keep playing what we have (never destroy a farm over a checksum)
    const prev = this.kv.get(PREV_KEY);
    const back = prev ? this.parse(prev) : null;
    if (back && back.ok) { this.notice = 'save_restored'; return back.state; }
    if (good.unsigned) return good.unsigned;
    this.notice = 'save_reset';
    return this.fresh();
  }

  /** Turn saved text into a state: checks the shape, the checksum, and upgrades old versions. */
  parse(raw: string): { ok: true; state: SavedState } | { ok: false; unsigned?: SavedState } {
    try {
      const s = JSON.parse(raw) as SavedState & { sig?: string };
      let sigBad = false;
      if (s.sig !== undefined) {
        const { sig, ...rest } = s;
        sigBad = sig !== checksum(JSON.stringify(rest));
      }
      delete s.sig;
      if (typeof s.coins !== 'number' || !Array.isArray(s.plots)) throw new Error('bad save');
      if (s.version === 1) { // Phase 2 saves gain empty buildings, animals and jobs
        s.buildings = []; s.animals = []; s.jobs = []; s.nextId = 1; s.version = 2;
      }
      if (s.version === 2) { // Phase 3 saves gain orders, quests, expansions
        Object.assign(s, this.phase4Defaults()); s.version = 3;
      }
      if (s.version === 3) { // rocks, trees and bushes can be cleared now
        s.clearedObstacles = []; s.version = 4;
      }
      if (s.version === 4) { // fields, rocks, trees and lamp posts can be moved now
        s.moved = {}; s.version = VERSION;
      }
      if (s.version !== VERSION) throw new Error('unknown version');
      const byId = new Map(s.plots.map((p) => [p.id, p]));
      s.plots = this.cellsFor(s.moved ?? {}).map((c) => byId.get(`${c.gx},${c.gy}`) ?? emptyPlot(c));
      return sigBad ? { ok: false, unsigned: s } : { ok: true, state: s };
    } catch {
      return { ok: false };
    }
  }

  private phase4Defaults() {
    return {
      orders: [] as OrderState[], orderCooldowns: {} as Record<string, number>, orderCounter: 0, expanded: [] as string[], clearedObstacles: [] as string[], moved: {} as Record<string, { gx: number; gy: number }>,
      stats: {} as Record<string, number>, claimed: [] as string[],
      daily: { day: -1, ids: [] as string[], base: {} as Record<string, number>, claimed: [] as string[] }, tutorialDone: false,
    };
  }

  private save() {
    const before = this.kv.get(SAVE_KEY);
    if (before) this.kv.set(PREV_KEY, before);
    const body = JSON.stringify(this.state);
    this.kv.set(SAVE_KEY, JSON.stringify({ ...this.state, sig: checksum(body) }));
  }

  private snapshot(): FarmSnapshot {
    this.refresh();
    const s = this.state;
    return {
      version: VERSION, coins: s.coins, gems: s.gems, xp: s.xp, level: s.level,
      inventory: { ...s.inventory }, plots: s.plots.map((p) => ({ ...p })),
      buildings: s.buildings.map((b) => ({ ...b })), animals: s.animals.map((a) => ({ ...a })), jobs: s.jobs.map((j) => ({ ...j })),
      orders: s.orders.map((o) => ({ ...o, items: { ...o.items } })), orderCooldowns: { ...s.orderCooldowns },
      expanded: [...s.expanded], clearedObstacles: [...s.clearedObstacles], moved: Object.fromEntries(Object.entries(s.moved).map(([k, v]) => [k, { ...v }])), stats: { ...s.stats }, claimed: [...s.claimed],
      daily: { day: s.daily.day, ids: [...s.daily.ids], base: { ...s.daily.base }, claimed: [...s.daily.claimed] },
      tutorialDone: s.tutorialDone,
      serverNow: this.now(), ...(this.notice ? { notice: this.notice } : {}),
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
      this.refresh();
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

  private spend(amount: number, ref: string, reason: string) {
    this.state.coins -= amount;
    this.log('coins', ref, -amount, this.state.coins, reason);
  }
  private addItem(itemId: string, qty: number, ref: string, reason: string) {
    const inv = this.state.inventory;
    inv[itemId] = (inv[itemId] ?? 0) + qty;
    this.log('item', ref, qty, inv[itemId], reason);
  }
  private takeItem(itemId: string, qty: number, ref: string, reason: string) {
    const inv = this.state.inventory;
    inv[itemId] -= qty;
    this.log('item', ref, -qty, inv[itemId], reason);
    if (inv[itemId] === 0) delete inv[itemId];
  }
  private addXp(amount: number, ref: string, reason: string): number | null {
    const s = this.state;
    s.xp += amount;
    this.log('xp', ref, amount, s.xp, reason);
    let up: number | null = null;
    while (s.xp >= xpForNextLevel(s.level)) {
      s.xp -= xpForNextLevel(s.level); s.level += 1; up = s.level;
      const bonus = 10 * s.level; // a small present for every new level
      s.coins += bonus;
      this.log('coins', `level:${s.level}`, bonus, s.coins, 'level_up');
    }
    return up;
  }
  /** Count something the player did; quests and achievements read these counters. */
  private bump(stat: string, n = 1) { this.state.stats[stat] = (this.state.stats[stat] ?? 0) + n; }

  // ---------- lazy evaluation of orders and daily quests ----------
  private refresh() {
    const s = this.state, now = this.now();
    const day = dayOf(now);
    if (s.daily.day !== day) {
      s.daily = { day, ids: pickDaily(day, s.level), base: { ...s.stats }, claimed: [] };
    }
    ORDERS.slots.forEach((slot, i) => {
      if (slot.unlockLevel > s.level || s.orders.some((o) => o.slot === i)) return;
      if (now < (s.orderCooldowns[i] ?? 0)) return;
      s.orders.push(this.makeOrder(i));
      delete s.orderCooldowns[i];
    });
  }

  private rng() {
    // mulberry32: small seeded generator so orders are reproducible
    let t = (this.state.orderCounter++ * 0x9e3779b9 + 0x6d2b79f5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Items a customer may ask for at the player's level: crops, animal products and factory goods they can really make. */
  private orderableItems(): string[] {
    const lvl = this.state.level;
    const out: string[] = CROPS.filter((c) => c.unlockLevel <= lvl).map((c) => c.id);
    for (const a of ANIMAL_BY_ID.values()) if (a.unlockLevel <= lvl) out.push(a.product);
    for (const r of RECIPES) {
      const b = BUILDING_BY_ID.get(r.building)!;
      if (r.unlockLevel <= lvl && b.unlockLevel <= lvl && ITEM_BY_ID.get(r.output)) out.push(r.output);
    }
    return [...new Set(out)];
  }

  private makeOrder(slot: number): OrderState {
    const s = this.state;
    const id = this.newId('o');
    let npc: string, items: Record<string, number>;
    if (s.stats.order_made === undefined) { // the very first order is always easy, for the tutorial
      npc = ORDERS.firstOrder.npc; items = { ...ORDERS.firstOrder.items };
    } else {
      npc = ORDERS.npcs[Math.floor(this.rng() * ORDERS.npcs.length)].id;
      const pool = this.orderableItems();
      const kinds = s.level >= ORDERS.twoItemsFromLevel && this.rng() < 0.5 ? 2 : 1;
      items = {};
      for (let i = 0; i < kinds; i++) {
        const item = pool[Math.floor(this.rng() * pool.length)];
        const isCrop = CROP_BY_ID.has(item);
        items[item] = (items[item] ?? 0) + (isCrop ? 1 + Math.floor(this.rng() * 3) : 1 + Math.floor(this.rng() * 2));
      }
    }
    this.bump('order_made');
    const value = Object.entries(items).reduce((sum, [i, q]) => sum + ITEM_BY_ID.get(i)!.sellPrice * q, 0);
    return { id, slot, npc, items, coins: Math.round(value * ORDERS.rewardMultiplier), xp: Math.max(2, Math.round(value / ORDERS.xpDivisor)) };
  }

  private newId(prefix: string) { return `${prefix}${this.state.nextId++}`; }

  // ---------- farming ----------
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
      this.spend(crop.seedCost, `plant:${plotId}:${cropId}`, 'seed');
      plot.cropId = cropId; plot.plantedAt = now; plot.readyAt = now + crop.growSeconds * 1000;
      this.bump('plant'); this.bump(`plant:${cropId}`);
      return { ok: true as const, plotId, cropId, cost: crop.seedCost, snapshot: this.snapshot() };
    });
  }

  private harvestPlots(ids: string[]): HarvestResult {
    const s = this.state;
    const harvested: { plotId: string; cropId: string; amount: number; xp: number }[] = [];
    let levelUp: number | null = null;
    for (const id of ids) {
      const plot = s.plots.find((p) => p.id === id)!;
      const crop = CROP_BY_ID.get(plot.cropId!)!;
      this.addItem(crop.id, crop.yield, `harvest:${id}:${crop.id}`, 'harvest');
      const up = this.addXp(crop.xp, `harvest:${id}`, 'harvest');
      if (up) levelUp = up;
      harvested.push({ plotId: id, cropId: crop.id, amount: crop.yield, xp: crop.xp });
      this.bump('harvest'); this.bump(`harvest:${crop.id}`);
      plot.cropId = null; plot.plantedAt = null; plot.readyAt = null;
    }
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
      const item = ITEM_BY_ID.get(itemId);
      if (!item || !Number.isInteger(qty) || qty < 1) return fail('bad_request');
      if ((s.inventory[itemId] ?? 0) < qty) return fail('insufficient_items');
      this.takeItem(itemId, qty, `sell:${itemId}`, 'sell');
      this.bump('sell', qty);
      const coins = qty * item.sellPrice;
      s.coins += coins;
      this.log('coins', `sell:${itemId}`, coins, s.coins, 'sell');
      return { ok: true as const, itemId, qty, coins, snapshot: this.snapshot() };
    });
  }

  // ---------- buildings ----------
  private occupancy(): OccupancyMap {
    const occ = new OccupancyMap(this.world.cols, this.world.rows);
    for (const o of this.world.staticObjects) { if (o.extra && !this.state.moved[o.id]) continue; const p = this.state.moved[o.id] ?? o; occ.place(o.id, p.gx, p.gy, { w: o.w, h: o.h }); }
    for (const o of this.activeObstacles()) occ.place(o.id, o.gx, o.gy, { w: 1, h: 1 });
    for (const b of this.state.buildings) {
      const d = BUILDING_BY_ID.get(b.type)!;
      occ.place(b.id, b.gx, b.gy, { w: d.w, h: d.h });
    }
    return occ;
  }

  /** The tiles of every field, where the fields stand now. */
  private cellsFor(moved: Record<string, { gx: number; gy: number }>): { gx: number; gy: number }[] {
    if (!this.world.fields) return this.world.plotCells;
    const out: { gx: number; gy: number }[] = [];
    for (const f of this.world.fields) {
      if (f.extra && !moved[f.id]) continue;   // not bought yet
      const p = moved[f.id] ?? f;
      for (let dx = 0; dx < f.w; dx++) for (let dy = 0; dy < f.h; dy++) out.push({ gx: p.gx + dx, gy: p.gy + dy });
    }
    return out;
  }

  /** Obstacles that are in the world right now: not cleared, and (for lot obstacles) the lot is cleared. */
  activeObstacles(): ObstacleDef[] {
    const s = this.state;
    return (this.world.obstacles ?? []).filter((o) => !s.clearedObstacles.includes(o.id) && (!o.lot || s.expanded.includes(o.lot)))
      .map((o) => (s.moved[o.id] ? { ...o, ...s.moved[o.id] } : o)); // where they stand now
  }

  /** Base buildable land plus any patch the player has cleared. */
  private buildable(gx: number, gy: number): boolean {
    if (this.world.isBuildable(gx, gy, this.state.moved)) return true;
    return (this.world.expansions ?? []).some((e) => this.state.expanded.includes(e.id)
      && gx >= e.rect[0] && gx < e.rect[0] + e.rect[2] && gy >= e.rect[1] && gy < e.rect[1] + e.rect[3]);
  }

  /** Would this building fit here? Answers without changing anything (the real check still runs again in placeBuilding). */
  canPlace(type: string, gx: number, gy: number, ignoreId?: string): { valid: boolean; reason: 'ok' | 'out_of_bounds' | 'occupied' | 'locked' | 'unknown' } {
    const def = BUILDING_BY_ID.get(type);
    if (!def) return { valid: false, reason: 'unknown' };
    const r = validatePlacement(this.occupancy(), gx, gy, { w: def.w, h: def.h }, (x, y) => this.buildable(x, y), ignoreId);
    return { valid: r.valid, reason: r.reason };
  }

  placeBuilding(type: string, gx: number, gy: number, key: string, flipped = false): Promise<PlaceResult> {
    return this.tx(key, (): PlaceResult => {
      const s = this.state;
      const def = BUILDING_BY_ID.get(type);
      if (!def) return fail('unknown_building');
      if (!Number.isInteger(gx) || !Number.isInteger(gy)) return fail('bad_request');
      if (def.unlockLevel > s.level) return fail('not_unlocked');
      if (s.coins < def.cost) return fail('insufficient_coins');
      const check = validatePlacement(this.occupancy(), gx, gy, { w: def.w, h: def.h }, (x, y) => this.buildable(x, y));
      if (!check.valid) return fail('invalid_placement');
      const id = this.newId('b');
      s.buildings.push(flipped ? { id, type, gx, gy, level: 1, flipped: true } : { id, type, gx, gy, level: 1 });
      this.bump('build'); this.bump(`build:${def.kind}`);
      this.spend(def.cost, `build:${id}:${type}`, 'building');
      this.addXp(Math.max(3, Math.round(def.cost / 15)), `build:${id}`, 'building'); // building something is progress too
      return { ok: true as const, buildingId: id, cost: def.cost, snapshot: this.snapshot() };
    });
  }

  upgradeBuilding(buildingId: string, key: string): Promise<UpgradeResult> {
    return this.tx(key, (): UpgradeResult => {
      const s = this.state;
      const b = s.buildings.find((x) => x.id === buildingId);
      if (!b) return fail('unknown_building');
      const def = BUILDING_BY_ID.get(b.type)!;
      if (def.kind === 'decor' || b.level >= MAX_LEVEL) return fail('max_level');
      const cost = def.upgradeCost[b.level] ?? Infinity;
      if (s.coins < cost) return fail('insufficient_coins');
      this.spend(cost, `upgrade:${b.id}:${b.level + 1}`, 'upgrade');
      b.level += 1;
      this.bump('upgrade');
      return { ok: true as const, buildingId, level: b.level, cost, snapshot: this.snapshot() };
    });
  }

  // ---------- animals ----------
  buyAnimal(habitatId: string, key: string): Promise<AnimalBuyResult> {
    return this.tx(key, (): AnimalBuyResult => {
      const s = this.state;
      const b = s.buildings.find((x) => x.id === habitatId);
      if (!b) return fail('unknown_building');
      const def = BUILDING_BY_ID.get(b.type)!;
      if (def.kind !== 'habitat') return fail('wrong_building');
      const animal = ANIMAL_BY_ID.get(def.animal!)!;
      if (animal.unlockLevel > s.level) return fail('not_unlocked');
      if (s.animals.filter((a) => a.buildingId === habitatId).length >= habitatCapacity(def, b.level)) return fail('at_capacity');
      if (s.coins < animal.cost) return fail('insufficient_coins');
      const id = this.newId('a');
      s.animals.push({ id, type: animal.id, buildingId: habitatId, readyAt: null, hungrySince: this.now(), happiness: 100 });
      this.spend(animal.cost, `animal:${id}:${animal.id}`, 'animal');
      if (!s.stats.animal_buy) this.addItem(FEED_ITEM, 3, `starter:${id}`, 'starter_gift'); // your first animal comes with 3 animal feed
      this.addXp(5, `animal:${id}`, 'animal_buy');
      this.bump('animal_buy');
      return { ok: true as const, animalId: id, cost: animal.cost, snapshot: this.snapshot() };
    });
  }

  /** Feed every hungry animal in a habitat, one animal feed each, as far as the stock goes. */
  feedAnimals(habitatId: string, key: string): Promise<FeedResult> {
    return this.tx(key, (): FeedResult => {
      const s = this.state, now = this.now();
      const b = s.buildings.find((x) => x.id === habitatId);
      if (!b) return fail('unknown_building');
      if (BUILDING_BY_ID.get(b.type)!.kind !== 'habitat') return fail('wrong_building');
      const hungry = s.animals.filter((a) => a.buildingId === habitatId && animalStatus(a, now) === 'hungry');
      if (!hungry.length) return fail('nothing_hungry');
      const stock = s.inventory[FEED_ITEM] ?? 0;
      if (stock < 1) return fail('insufficient_items');
      let fed = 0;
      for (const a of hungry.slice(0, stock)) {
        const def = ANIMAL_BY_ID.get(a.type)!;
        const h = Math.min(100, animalHappiness(a, now) + 10);
        a.happiness = h;
        a.hungrySince = null;
        // an unhappy animal is a little slower: up to +12.5 percent at the happiness floor
        a.readyAt = now + Math.round(def.productSeconds * 1000 * (1 + (100 - h) / 400));
        this.takeItem(FEED_ITEM, 1, `feed:${a.id}`, 'feed');
        fed++;
      }
      return { ok: true as const, fed, snapshot: this.snapshot() };
    });
  }

  collectAnimals(habitatId: string, key: string): Promise<CollectResult> {
    return this.tx(key, (): CollectResult => {
      const s = this.state, now = this.now();
      const b = s.buildings.find((x) => x.id === habitatId);
      if (!b) return fail('unknown_building');
      if (BUILDING_BY_ID.get(b.type)!.kind !== 'habitat') return fail('wrong_building');
      const ready = s.animals.filter((a) => a.buildingId === habitatId && animalStatus(a, now) === 'ready');
      if (!ready.length) return fail('nothing_ready');
      const totals = new Map<string, number>();
      let xp = 0, levelUp: number | null = null;
      for (const a of ready) {
        const def = ANIMAL_BY_ID.get(a.type)!;
        this.addItem(def.product, 1, `collect:${a.id}`, 'animal_product');
        totals.set(def.product, (totals.get(def.product) ?? 0) + 1);
        xp += def.xp;
        const up = this.addXp(def.xp, `collect:${a.id}`, 'animal_product');
        if (up) levelUp = up;
        a.readyAt = null; a.hungrySince = now; // hungry again until fed
        this.bump('animal_collect');
      }
      return { ok: true as const, collected: [...totals].map(([itemId, qty]) => ({ itemId, qty })), xp, levelUp, snapshot: this.snapshot() };
    });
  }

  // ---------- production ----------
  queueRecipe(buildingId: string, recipeId: string, key: string): Promise<QueueResult> {
    return this.tx(key, (): QueueResult => {
      const s = this.state, now = this.now();
      const b = s.buildings.find((x) => x.id === buildingId);
      if (!b) return fail('unknown_building');
      const def = BUILDING_BY_ID.get(b.type)!;
      if (def.kind !== 'production') return fail('wrong_building');
      const recipe = RECIPE_BY_ID.get(recipeId);
      if (!recipe) return fail('unknown_recipe');
      if (recipe.building !== b.type) return fail('wrong_building');
      if (recipe.unlockLevel > s.level) return fail('not_unlocked');
      const mine = s.jobs.filter((j) => j.buildingId === buildingId);
      if (mine.length >= productionSlots(def, b.level)) return fail('queue_full');
      for (const [item, qty] of Object.entries(recipe.inputs)) if ((s.inventory[item] ?? 0) < qty) return fail('insufficient_items');
      const id = this.newId('j');
      for (const [item, qty] of Object.entries(recipe.inputs)) this.takeItem(item, qty, `job:${id}`, 'recipe_input');
      // every slot works on its own, so two flour (or two feed) queued together are ready together
      const startAt = now;
      const readyAt = startAt + recipe.seconds * 1000;
      s.jobs.push({ id, buildingId, recipeId, startAt, readyAt });
      this.bump('job_queue');
      return { ok: true as const, jobId: id, readyAt, snapshot: this.snapshot() };
    });
  }

  collectJobs(buildingId: string, key: string): Promise<CollectResult> {
    return this.tx(key, (): CollectResult => {
      const s = this.state, now = this.now();
      const b = s.buildings.find((x) => x.id === buildingId);
      if (!b) return fail('unknown_building');
      if (BUILDING_BY_ID.get(b.type)!.kind !== 'production') return fail('wrong_building');
      const done = s.jobs.filter((j) => j.buildingId === buildingId && now >= j.readyAt);
      if (!done.length) return fail('nothing_ready');
      const totals = new Map<string, number>();
      let xp = 0, levelUp: number | null = null;
      for (const j of done) {
        const r = RECIPE_BY_ID.get(j.recipeId)!;
        this.addItem(r.output, 1, `job:${j.id}`, 'production');
        totals.set(r.output, (totals.get(r.output) ?? 0) + 1);
        this.bump('job_collect'); this.bump(`produce:${r.output}`);
        xp += r.xp;
        const up = this.addXp(r.xp, `job:${j.id}`, 'production');
        if (up) levelUp = up;
      }
      s.jobs = s.jobs.filter((j) => !done.includes(j));
      return { ok: true as const, collected: [...totals].map(([itemId, qty]) => ({ itemId, qty })), xp, levelUp, snapshot: this.snapshot() };
    });
  }

  // ---------- customer orders ----------
  fulfilOrder(orderId: string, key: string): Promise<OrderResult> {
    return this.tx(key, (): OrderResult => {
      const s = this.state;
      const order = s.orders.find((o) => o.id === orderId);
      if (!order) return fail('unknown_order');
      for (const [item, qty] of Object.entries(order.items)) if ((s.inventory[item] ?? 0) < qty) return fail('insufficient_items');
      for (const [item, qty] of Object.entries(order.items)) this.takeItem(item, qty, `order:${order.id}`, 'order_items');
      s.coins += order.coins;
      this.log('coins', `order:${order.id}`, order.coins, s.coins, 'order');
      const levelUp = this.addXp(order.xp, `order:${order.id}`, 'order');
      s.orders = s.orders.filter((o) => o.id !== orderId);
      s.orderCooldowns[order.slot] = this.now() + ORDERS.cooldownSeconds * 1000;
      this.bump('order'); this.bump(`order:${order.npc}`);
      return { ok: true as const, orderId, coins: order.coins, xp: order.xp, levelUp, snapshot: this.snapshot() };
    });
  }

  /** Not interested: the slot gets a fresh customer after the cooldown. */
  skipOrder(orderId: string, key: string): Promise<SimpleResult> {
    return this.tx(key, (): SimpleResult => {
      const s = this.state;
      const order = s.orders.find((o) => o.id === orderId);
      if (!order) return fail('unknown_order');
      s.orders = s.orders.filter((o) => o.id !== orderId);
      s.orderCooldowns[order.slot] = this.now() + ORDERS.cooldownSeconds * 1000;
      return { ok: true as const, snapshot: this.snapshot() };
    });
  }

  // ---------- quests, achievements, tutorial ----------
  claimQuest(questId: string, key: string): Promise<ClaimResult> {
    return this.tx(key, (): ClaimResult => {
      const s = this.state;
      const def = QUEST_BY_ID.get(questId);
      if (!def) return fail('unknown_quest');
      const view = { stats: s.stats, level: s.level, daily: s.daily, claimed: s.claimed };
      const active = def.daily ? s.daily.ids.includes(def.id) : def.unlockLevel <= s.level;
      if (!active) return fail('unknown_quest');
      if (isClaimed(def, view)) return fail('already_claimed');
      if (questProgress(def, view) < def.target) return fail('not_complete');
      (def.daily ? s.daily.claimed : s.claimed).push(def.id);
      const coins = def.reward.coins ?? 0, xp = def.reward.xp ?? 0, gems = def.reward.gems ?? 0;
      if (coins) { s.coins += coins; this.log('coins', `quest:${def.id}`, coins, s.coins, 'quest'); }
      if (gems) { s.gems += gems; this.log('gems', `quest:${def.id}`, gems, s.gems, 'quest'); }
      const levelUp = xp ? this.addXp(xp, `quest:${def.id}`, 'quest') : null;
      if (TUTORIAL.every((t) => s.claimed.includes(t.id))) s.tutorialDone = true;
      return { ok: true as const, questId, coins, xp, gems, levelUp, snapshot: this.snapshot() };
    });
  }

  skipTutorial(key: string): Promise<SimpleResult> {
    return this.tx(key, (): SimpleResult => { this.state.tutorialDone = true; return { ok: true as const, snapshot: this.snapshot() }; });
  }

  // ---------- land ----------
  /** A locked patch becomes buildable land once cleared with coins and materials. */
  expandLand(expansionId: string, key: string): Promise<ExpandResult> {
    return this.tx(key, (): ExpandResult => {
      const s = this.state;
      const ex = this.world.expansions?.find((e) => e.id === expansionId);
      if (!ex) return fail('unknown_expansion');
      if (s.expanded.includes(ex.id)) return fail('already_expanded');
      if (this.world.canExpand && !this.world.canExpand(ex.id, s.expanded)) return fail('not_adjacent');
      if (ex.unlockLevel > s.level) return fail('not_unlocked');
      if (s.coins < ex.cost) return fail('insufficient_coins');
      for (const [item, qty] of Object.entries(ex.materials)) if ((s.inventory[item] ?? 0) < qty) return fail('insufficient_items');
      this.spend(ex.cost, `expand:${ex.id}`, 'expansion');
      for (const [item, qty] of Object.entries(ex.materials)) this.takeItem(item, qty, `expand:${ex.id}`, 'expansion_materials');
      s.expanded.push(ex.id);
      this.bump('expand');
      return { ok: true as const, expansionId, snapshot: this.snapshot() };
    });
  }

  moveBuilding(buildingId: string, gx: number, gy: number, key: string): Promise<MoveResult> {
    return this.tx(key, (): MoveResult => {
      const s = this.state;
      const b = s.buildings.find((x) => x.id === buildingId);
      if (!b) return fail('unknown_building');
      if (!Number.isInteger(gx) || !Number.isInteger(gy)) return fail('bad_request');
      if (b.gx === gx && b.gy === gy) return fail('same_spot');
      const def = BUILDING_BY_ID.get(b.type)!;
      const check = validatePlacement(this.occupancy(), gx, gy, { w: def.w, h: def.h }, (x, y) => this.buildable(x, y), b.id);
      if (!check.valid) return fail('invalid_placement');
      b.gx = gx; b.gy = gy;
      return { ok: true as const, buildingId, snapshot: this.snapshot() };
    });
  }

  /** Removing refunds half the build price. A building must be empty (no animals, no queued jobs). */
  removeBuilding(buildingId: string, key: string): Promise<RemoveResult> {
    return this.tx(key, (): RemoveResult => {
      const s = this.state;
      const b = s.buildings.find((x) => x.id === buildingId);
      if (!b) return fail('unknown_building');
      if (s.animals.some((a) => a.buildingId === b.id) || s.jobs.some((j) => j.buildingId === b.id)) return fail('not_empty');
      const refund = Math.floor(BUILDING_BY_ID.get(b.type)!.cost / 2);
      s.buildings = s.buildings.filter((x) => x.id !== buildingId);
      s.coins += refund;
      this.log('coins', `remove:${b.id}`, refund, s.coins, 'refund');
      return { ok: true as const, buildingId, refund, snapshot: this.snapshot() };
    });
  }

  // ---------- speed-up (paid for with Stratos Coins by the game page, outside the farm economy) ----------
  /** Finish one growing crop, one animal product or one factory job right now. */
  speedUp(kind: SpeedKind, id: string, key: string): Promise<SpeedResult> {
    return this.tx(key, (): SpeedResult => {
      const s = this.state, now = this.now();
      if (kind === 'plot') {
        const plot = s.plots.find((p) => p.id === id);
        if (!plot) return fail('invalid_plot');
        if (!plot.cropId || plot.readyAt === null) return fail('nothing_planted');
        if (now >= plot.readyAt) return fail('already_ready');
        plot.readyAt = now;
      } else if (kind === 'animal') {
        const a = s.animals.find((x) => x.id === id);
        if (!a) return fail('bad_request');
        if (a.readyAt === null) return fail('nothing_hungry'); // hungry animals need feed, not time
        if (now >= a.readyAt) return fail('already_ready');
        a.readyAt = now;
      } else if (kind === 'job') {
        const job = s.jobs.find((j) => j.id === id);
        if (!job) return fail('bad_request');
        if (now >= job.readyAt) return fail('already_ready');
        job.readyAt = now; // jobs are independent: nothing else moves
      } else return fail('bad_request');
      this.bump('speedup');
      this.log('item', `speedup:${kind}:${id}`, 1, 1, 'speedup');
      return { ok: true as const, kind, id, snapshot: this.snapshot() };
    });
  }

  // ---------- turning and clearing ----------
  /** Turn a building around (mirror it). Every building here is square, so it always fits. */
  rotateBuilding(buildingId: string, key: string): Promise<RotateResult> {
    return this.tx(key, (): RotateResult => {
      const b = this.state.buildings.find((x) => x.id === buildingId);
      if (!b) return fail('unknown_building');
      b.flipped = !b.flipped;
      return { ok: true as const, buildingId, flipped: !!b.flipped, snapshot: this.snapshot() };
    });
  }

  /** Pay to clear a rock, tree or bush; you get a little wood or stone and XP, and the land is free to build on. */
  clearObstacle(obstacleId: string, key: string): Promise<ClearResult> {
    return this.tx(key, (): ClearResult => {
      const s = this.state;
      const ob = this.activeObstacles().find((o) => o.id === obstacleId);
      if (!ob) return fail('unknown_obstacle');
      const t = OBSTACLE_TYPE_BY_ID.get(ob.type);
      if (!t) return fail('unknown_obstacle');
      if (t.unlockLevel > s.level) return fail('not_unlocked');
      if (s.coins < t.cost) return fail('insufficient_coins');
      this.spend(t.cost, `clear:${ob.id}`, 'clearing');
      for (const [item, qty] of Object.entries(t.reward)) this.addItem(item, qty, `clear:${ob.id}`, 'clearing');
      this.addXp(t.xp, `clear:${ob.id}`, 'clearing');
      s.clearedObstacles.push(ob.id);
      this.bump('clear'); this.bump(`clear:${t.id}`);
      return { ok: true as const, obstacleId, cost: t.cost, rewards: { ...t.reward }, xp: t.xp, snapshot: this.snapshot() };
    });
  }

  // ---------- more fields ----------
  /** Buy one more single-tile field plot. It appears on the first free spot; the player can move it afterwards. Each one costs more. */
  buyField(key: string): Promise<BuyFieldResult> {
    return this.tx(key, (): BuyFieldResult => {
      const s = this.state;
      const left = (this.world.fields ?? []).filter((f) => f.extra && !s.moved[f.id]);
      if (!left.length) return fail('max_fields');
      const bought = (this.world.fields ?? []).filter((f) => f.extra).length - left.length;
      const cost = FIELD_PRICES[Math.min(bought, FIELD_PRICES.length - 1)];
      if (s.coins < cost) return fail('insufficient_coins');
      const f = left[0];
      const occ = this.occupancy();
      // the free spot closest to the fields you already have
      const live = (this.world.fields ?? []).filter((q) => !q.extra || s.moved[q.id]).map((q) => s.moved[q.id] ?? q);
      const cx = live.length ? live.reduce((a, q) => a + q.gx, 0) / live.length : this.world.cols / 2;
      const cy = live.length ? live.reduce((a, q) => a + q.gy, 0) / live.length : this.world.rows / 2;
      let spot: { gx: number; gy: number } | null = null, best = Infinity;
      for (let gy = 0; gy < this.world.rows; gy++) for (let gx = 0; gx < this.world.cols; gx++) {
        const d = (gx - cx) ** 2 + (gy - cy) ** 2;
        if (d >= best) continue;
        if (validatePlacement(occ, gx, gy, { w: f.w, h: f.h }, (x, y) => this.buildable(x, y)).valid) { spot = { gx, gy }; best = d; }
      }
      if (!spot) return fail('invalid_placement');
      s.moved[f.id] = spot;
      const have = new Set(s.plots.map((p) => p.id));
      for (const c of this.cellsFor(s.moved)) if (!have.has(`${c.gx},${c.gy}`)) s.plots.push(emptyPlot(c));
      this.spend(cost, `field:${f.id}`, 'field');
      this.bump('buy_field');
      return { ok: true as const, objectId: f.id, cost, snapshot: this.snapshot() };
    });
  }

  /** What the next field costs, or null when there are no more to buy. */
  nextFieldCost(): number | null {
    const fs = (this.world.fields ?? []).filter((f) => f.extra);
    const bought = fs.filter((f) => this.state.moved[f.id]).length;
    return bought >= fs.length ? null : FIELD_PRICES[Math.min(bought, FIELD_PRICES.length - 1)];
  }

  // ---------- moving the things that were already on the farm ----------
  /** Move a field, rock, tree, bush, lamp post, well, silo, farmhouse or barn. Free. A field takes its crops with it. */
  moveObject(objectId: string, gx: number, gy: number, key: string): Promise<MoveObjectResult> {
    return this.tx(key, (): MoveObjectResult => {
      const s = this.state;
      const stat = this.world.staticObjects.find((o) => o.id === objectId);
      if (stat?.extra && !s.moved[objectId]) return fail('unknown_object');   // a field that is not bought yet
      const orig = stat ?? (this.world.obstacles ?? []).find((o) => o.id === objectId);
      const live = stat ?? this.activeObstacles().find((o) => o.id === objectId);
      if (!orig || !live) return fail('unknown_object');
      if (!Number.isInteger(gx) || !Number.isInteger(gy)) return fail('bad_request');
      const cur = s.moved[objectId] ?? orig;
      const w = stat ? stat.w : 1, h = stat ? stat.h : 1;
      if (cur.gx === gx && cur.gy === gy) return fail('same_spot');
      const check = validatePlacement(this.occupancy(), gx, gy, { w, h }, (x, y) => this.buildable(x, y), objectId);
      if (!check.valid) return fail('invalid_placement');
      if (this.world.fields?.some((f) => f.id === objectId)) {   // the crops move with the soil
        const dx = gx - cur.gx, dy = gy - cur.gy;
        const mine = new Set<string>();
        for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) mine.add(`${cur.gx + i},${cur.gy + j}`);
        const carried = s.plots.filter((p) => mine.has(p.id));
        s.plots = s.plots.filter((p) => !mine.has(p.id));
        for (const p of carried) { p.gx += dx; p.gy += dy; p.id = `${p.gx},${p.gy}`; }
        s.plots.push(...carried);
      }
      if (gx === orig.gx && gy === orig.gy) delete s.moved[objectId]; else s.moved[objectId] = { gx, gy };
      return { ok: true as const, objectId, snapshot: this.snapshot() };
    });
  }
}
