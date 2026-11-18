// Quest and achievement rules. Progress is derived from cumulative counters (stats), so adding a quest never needs new tracking code.
import questsJson from '../data/quests.json';

export interface QuestReward { coins?: number; xp?: number; gems?: number }
export interface QuestDef {
  id: string; type: 'tutorial' | 'daily' | 'farming' | 'animal' | 'production' | 'achievement';
  title: string; desc: string; stat: string; target: number; reward: QuestReward;
  unlockLevel: number; daily?: boolean; order?: number;
}

export const QUESTS = questsJson.quests as QuestDef[];
export const QUEST_BY_ID = new Map(QUESTS.map((q) => [q.id, q]));
export const TUTORIAL = QUESTS.filter((q) => q.type === 'tutorial').sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
export const DAILY_COUNT = 3;

/** What the quest logic needs from a farm (a snapshot has all of it). */
export interface QuestView {
  stats: Record<string, number>;
  level: number;
  daily: { day: number; ids: string[]; base: Record<string, number>; claimed: string[] };
  claimed: string[];
}

export function questProgress(def: QuestDef, v: QuestView): number {
  if (def.stat === 'level') return Math.min(def.target, v.level);
  const now = v.stats[def.stat] ?? 0;
  const base = def.daily ? (v.daily.base[def.stat] ?? 0) : 0;
  return Math.min(def.target, Math.max(0, now - base));
}

export const isClaimed = (def: QuestDef, v: QuestView) => (def.daily ? v.daily.claimed.includes(def.id) : v.claimed.includes(def.id));
export const isComplete = (def: QuestDef, v: QuestView) => questProgress(def, v) >= def.target;

/** Quests that are visible now: non-daily ones at their level, today's daily ones. */
export function activeQuests(v: QuestView): QuestDef[] {
  return QUESTS.filter((q) => (q.daily ? v.daily.ids.includes(q.id) : q.unlockLevel <= v.level));
}

export const claimableCount = (v: QuestView) => activeQuests(v).filter((q) => isComplete(q, v) && !isClaimed(q, v)).length;

/** The tutorial step the player is on (first one not yet claimed), or null when finished. */
export function currentTutorialStep(v: QuestView): QuestDef | null {
  return TUTORIAL.find((q) => !v.claimed.includes(q.id)) ?? null;
}

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/** Today's daily quests: a stable pick from the pool, the same all day. */
export function pickDaily(day: number, level: number): string[] {
  const pool = QUESTS.filter((q) => q.daily && q.unlockLevel <= level);
  return pool.map((q) => ({ id: q.id, k: hash(`${q.id}:${day}`) })).sort((a, b) => a.k - b.k).slice(0, DAILY_COUNT).map((x) => x.id);
}

export const DAY_MS = 86_400_000;
export const dayOf = (ms: number) => Math.floor(ms / DAY_MS);
