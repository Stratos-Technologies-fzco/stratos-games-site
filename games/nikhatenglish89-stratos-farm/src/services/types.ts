// The contract every farm backend must follow. Phases 2-3 ship a local implementation; a real API can replace it
// later without touching the game or the UI. All times are epoch milliseconds from the service clock.
import { ANIMAL_BY_ID, HAPPINESS_MIN, HUNGRY_GRACE_S } from './data';

export type { CropDef } from './data';

export interface PlotState {
  id: string; gx: number; gy: number;
  cropId: string | null;
  plantedAt: number | null;
  readyAt: number | null;
}

/** A habitat or production building the player owns (its definition lives in buildings.json). */
export interface BuildingState { id: string; type: string; gx: number; gy: number; level: number }

export interface AnimalState {
  id: string; type: string; buildingId: string;
  readyAt: number | null;   // product ready at; null while hungry
  hungrySince: number | null;
  happiness: number;        // value when it last changed; see animalHappiness()
}

export interface JobState {
  id: string; buildingId: string; recipeId: string;
  startAt: number; readyAt: number;
}

export interface OrderState {
  id: string; slot: number; npc: string;
  items: Record<string, number>;
  coins: number; xp: number;
}

export interface ExpansionDef {
  id: string; name: string; rect: [number, number, number, number];
  cost: number; materials: Record<string, number>; unlockLevel: number;
}

export interface FarmSnapshot {
  version: number;
  coins: number; gems: number; xp: number; level: number;
  inventory: Record<string, number>;
  plots: PlotState[];
  buildings: BuildingState[];
  animals: AnimalState[];
  jobs: JobState[];
  orders: OrderState[];
  /** slot -> time the next order appears there */
  orderCooldowns: Record<string, number>;
  expanded: string[];
  stats: Record<string, number>;
  claimed: string[];
  daily: { day: number; ids: string[]; base: Record<string, number>; claimed: string[] };
  tutorialDone: boolean;
  serverNow: number;
  /** Set when a saved game could not be read and a fresh farm was created. */
  notice?: 'save_reset' | 'save_restored';
}

export type ErrorCode =
  | 'invalid_plot' | 'unknown_crop' | 'not_unlocked' | 'insufficient_coins' | 'plot_occupied'
  | 'nothing_planted' | 'not_ready' | 'nothing_ready' | 'insufficient_items' | 'bad_request'
  | 'unknown_building' | 'invalid_placement' | 'wrong_building' | 'at_capacity' | 'nothing_hungry'
  | 'max_level' | 'unknown_recipe' | 'queue_full'
  | 'already_ready' | 'unknown_order' | 'unknown_quest' | 'not_complete' | 'already_claimed' | 'unknown_expansion' | 'already_expanded' | 'not_empty' | 'same_spot';

export type Result<T> = ({ ok: true; snapshot: FarmSnapshot; replayed?: boolean } & T) | { ok: false; error: ErrorCode };

export type PlantResult = Result<{ plotId: string; cropId: string; cost: number }>;
export type HarvestResult = Result<{ harvested: { plotId: string; cropId: string; amount: number; xp: number }[]; levelUp: number | null }>;
export type SellResult = Result<{ itemId: string; qty: number; coins: number }>;
export type PlaceResult = Result<{ buildingId: string; cost: number }>;
export type AnimalBuyResult = Result<{ animalId: string; cost: number }>;
export type FeedResult = Result<{ fed: number }>;
export type CollectResult = Result<{ collected: { itemId: string; qty: number }[]; xp: number; levelUp: number | null }>;
export type UpgradeResult = Result<{ buildingId: string; level: number; cost: number }>;
export type QueueResult = Result<{ jobId: string; readyAt: number }>;

export type OrderResult = Result<{ orderId: string; coins: number; xp: number; levelUp: number | null }>;
export type ClaimResult = Result<{ questId: string; coins: number; xp: number; gems: number; levelUp: number | null }>;
export type ExpandResult = Result<{ expansionId: string }>;
export type MoveResult = Result<{ buildingId: string }>;
export type RemoveResult = Result<{ buildingId: string; refund: number }>;
export type SimpleResult = Result<object>;
export type SpeedKind = 'plot' | 'animal' | 'job';
export type SpeedResult = Result<{ kind: SpeedKind; id: string }>;

export interface FarmService {
  load(): Promise<FarmSnapshot>;
  now(): number;
  plant(plotId: string, cropId: string, key: string): Promise<PlantResult>;
  harvest(plotId: string, key: string): Promise<HarvestResult>;
  harvestAll(key: string): Promise<HarvestResult>;
  sell(itemId: string, qty: number, key: string): Promise<SellResult>;
  placeBuilding(type: string, gx: number, gy: number, key: string): Promise<PlaceResult>;
  buyAnimal(habitatId: string, key: string): Promise<AnimalBuyResult>;
  feedAnimals(habitatId: string, key: string): Promise<FeedResult>;
  collectAnimals(habitatId: string, key: string): Promise<CollectResult>;
  upgradeBuilding(buildingId: string, key: string): Promise<UpgradeResult>;
  queueRecipe(buildingId: string, recipeId: string, key: string): Promise<QueueResult>;
  collectJobs(buildingId: string, key: string): Promise<CollectResult>;
  fulfilOrder(orderId: string, key: string): Promise<OrderResult>;
  skipOrder(orderId: string, key: string): Promise<SimpleResult>;
  claimQuest(questId: string, key: string): Promise<ClaimResult>;
  skipTutorial(key: string): Promise<SimpleResult>;
  expandLand(expansionId: string, key: string): Promise<ExpandResult>;
  moveBuilding(buildingId: string, gx: number, gy: number, key: string): Promise<MoveResult>;
  removeBuilding(buildingId: string, key: string): Promise<RemoveResult>;
  speedUp(kind: SpeedKind, id: string, key: string): Promise<SpeedResult>;
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

export type AnimalStatus = 'hungry' | 'producing' | 'ready';
export function animalStatus(a: AnimalState, now: number): AnimalStatus {
  if (a.readyAt === null) return 'hungry';
  return now >= a.readyAt ? 'ready' : 'producing';
}

/** Mild offline penalty: a long-hungry animal loses 1 happiness per 10 minutes after a grace period, never below the floor. */
export function animalHappiness(a: AnimalState, now: number): number {
  if (a.hungrySince === null) return a.happiness;
  const hungryMs = Math.max(0, now - a.hungrySince - HUNGRY_GRACE_S * 1000);
  return Math.max(HAPPINESS_MIN, a.happiness - Math.floor(hungryMs / 600_000));
}

export function habitatCapacity(def: { capacity?: number[] }, level: number): number {
  return def.capacity?.[level - 1] ?? 0;
}
export function productionSlots(def: { slots?: number[] }, level: number): number {
  return def.slots?.[level - 1] ?? 0;
}

export const animalDefFor = (a: AnimalState) => ANIMAL_BY_ID.get(a.type)!;
