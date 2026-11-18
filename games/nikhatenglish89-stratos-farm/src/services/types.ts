// The contract every farm backend must follow. Phase 2 ships a local implementation; a real API can replace it
// later without touching the game or the UI. All times are epoch milliseconds from the service clock.

export interface CropDef {
  id: string; name: string; seedCost: number; growSeconds: number;
  yield: number; xp: number; unlockLevel: number; sellPrice: number;
}

export interface PlotState {
  id: string; gx: number; gy: number;
  cropId: string | null;
  plantedAt: number | null;
  readyAt: number | null;
}

export interface FarmSnapshot {
  version: number;
  coins: number; gems: number; xp: number; level: number;
  inventory: Record<string, number>;
  plots: PlotState[];
  serverNow: number;
  /** Set when a saved game could not be read and a fresh farm was created. */
  notice?: 'save_reset';
}

export type ErrorCode =
  | 'invalid_plot' | 'unknown_crop' | 'not_unlocked' | 'insufficient_coins' | 'plot_occupied'
  | 'nothing_planted' | 'not_ready' | 'nothing_ready' | 'insufficient_items' | 'bad_request';

export type Result<T> = ({ ok: true; snapshot: FarmSnapshot; replayed?: boolean } & T) | { ok: false; error: ErrorCode };

export type PlantResult = Result<{ plotId: string; cropId: string; cost: number }>;
export type HarvestResult = Result<{ harvested: { plotId: string; cropId: string; amount: number; xp: number }[]; levelUp: number | null }>;
export type SellResult = Result<{ itemId: string; qty: number; coins: number }>;

export interface FarmService {
  load(): Promise<FarmSnapshot>;
  now(): number;
  plant(plotId: string, cropId: string, key: string): Promise<PlantResult>;
  harvest(plotId: string, key: string): Promise<HarvestResult>;
  harvestAll(key: string): Promise<HarvestResult>;
  sell(itemId: string, qty: number, key: string): Promise<SellResult>;
}

export interface LedgerRow {
  id: number; ts: number; kind: 'coins' | 'gems' | 'xp' | 'item';
  ref: string; delta: number; balanceAfter: number; reason: string;
}

/** Stage shown on screen: 0 planted, 1 sprout, 2 growing, 3 ready. Derived from time, never stored. */
export function cropStage(p: PlotState, now: number): number | null {
  if (!p.cropId || p.plantedAt === null || p.readyAt === null) return null;
  if (now >= p.readyAt) return 3;
  const frac = (now - p.plantedAt) / (p.readyAt - p.plantedAt);
  return frac < 1 / 3 ? 0 : frac < 2 / 3 ? 1 : 2;
}
