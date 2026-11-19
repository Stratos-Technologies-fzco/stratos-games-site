// Master data: everything the economy needs lives in JSON, never in logic. Definitions here, player-owned instances in the save.
import cropsJson from '../data/crops.json';
import itemsJson from '../data/items.json';
import animalsJson from '../data/animals.json';
import buildingsJson from '../data/buildings.json';
import recipesJson from '../data/recipes.json';
import ordersJson from '../data/orders.json';
import obstaclesJson from '../data/obstacles.json';

export interface CropDef {
  id: string; name: string; seedCost: number; growSeconds: number;
  yield: number; xp: number; unlockLevel: number; sellPrice: number;
}
export interface ItemDef { id: string; name: string; sellPrice: number; kind: 'crop' | 'animal' | 'product' | 'material'; /** art that is not in the item icon atlas */ icon?: { atlas: string; frame: string } }
export interface AnimalDef {
  id: string; name: string; cost: number; product: string; productSeconds: number;
  habitat: string; unlockLevel: number; xp: number;
}
export interface BuildingDef {
  id: string; kind: 'habitat' | 'production' | 'decor'; name: string;
  atlas: string; frames: string[]; w: number; h: number;
  cost: number; unlockLevel: number; upgradeCost: number[];
  animal?: string; capacity?: number[]; slots?: number[];
}
export interface RecipeDef {
  id: string; building: string; name: string; inputs: Record<string, number>;
  output: string; seconds: number; xp: number; unlockLevel: number;
}

export const CROPS = cropsJson.crops as CropDef[];
export const START = cropsJson.start;
export const ITEMS = itemsJson.items as ItemDef[];
export const ANIMALS = animalsJson.animals as AnimalDef[];
export const FEED_ITEM = animalsJson.feedItem;
export const HUNGRY_GRACE_S = animalsJson.hungryGraceSeconds;
export const HAPPINESS_MIN = animalsJson.happinessMin;
export const BUILDINGS = buildingsJson.buildings as BuildingDef[];
export const MAX_LEVEL = buildingsJson.maxLevel;
export const RECIPES = recipesJson.recipes as unknown as RecipeDef[];

export interface ObstacleType { id: string; name: string; frame: string; cost: number; unlockLevel: number; reward: Record<string, number>; xp: number }
export const OBSTACLE_TYPES = obstaclesJson.types as unknown as ObstacleType[];
export const OBSTACLE_TYPE_BY_ID = new Map(OBSTACLE_TYPES.map((t) => [t.id, t]));

export const CROP_BY_ID = new Map(CROPS.map((c) => [c.id, c]));
export const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));
export const ANIMAL_BY_ID = new Map(ANIMALS.map((a) => [a.id, a]));
export const BUILDING_BY_ID = new Map(BUILDINGS.map((b) => [b.id, b]));
export const RECIPE_BY_ID = new Map(RECIPES.map((r) => [r.id, r]));

export interface OrderConfig {
  slots: { unlockLevel: number }[]; cooldownSeconds: number; rewardMultiplier: number; xpDivisor: number;
  twoItemsFromLevel: number; firstOrder: { npc: string; items: Record<string, number> };
  npcs: { id: string; name: string }[];
}
export const ORDERS = ordersJson as OrderConfig;
export const NPC_BY_ID = new Map(ORDERS.npcs.map((n) => [n.id, n]));
