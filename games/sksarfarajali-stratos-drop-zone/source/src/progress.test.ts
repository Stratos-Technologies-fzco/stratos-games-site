import { beforeEach, describe, expect, it } from 'vitest';
import type { Result } from './game/types';

const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k), clear: () => store.clear(), key: () => null, length: 0 };
const P = await import('./progress');
const res = (o: Partial<Result> = {}): Result => ({ win: false, placement: 12, total: 24, kills: 2, damage: 300, time: 150, headshots: 1, tokens: 100, xp: 40, killer: 'Aarav', ...o });
beforeEach(() => store.clear());

describe('progress', () => {
  it('picks 3 different missions per day, same for the same date', () => {
    const a = P.dailyMissions('2026-11-13'), b = P.dailyMissions('2026-11-13');
    expect(a.map((m) => m.id)).toEqual(b.map((m) => m.id)); expect(new Set(a.map((m) => m.id)).size).toBe(3);
  });
  it('adds stats and XP after a match', () => {
    P.recordMatch(res()); const s = P.getStats(); expect(s.matches).toBe(1); expect(s.kills).toBe(2); expect(s.deaths).toBe(1); expect(s.best).toBe(12);
  });
  it('unlocks achievements once', () => {
    const first = P.recordMatch(res({ kills: 1 })); expect(first.achievements.map((a) => a.id)).toEqual(expect.arrayContaining(['first', 'kill1']));
    expect(P.recordMatch(res({ kills: 1 })).achievements.find((a) => a.id === 'first')).toBeUndefined();
  });
  it('wins unlock "Storm cleared" and score counts the win bonus', () => {
    const o = P.recordMatch(res({ win: true, placement: 1, kills: 5 })); expect(o.achievements.some((a) => a.id === 'win1')).toBe(true); expect(o.score).toBeGreaterThan(P.runScore(res({ win: false, placement: 1, kills: 5 })));
  });
  it('level grows with XP', () => { expect(P.level(0).level).toBe(1); expect(P.level(100).level).toBe(2); expect(P.level(10000).level).toBeGreaterThan(5); });
  it('keeps a weekly leaderboard sorted by score', () => {
    P.recordMatch(res({ kills: 1 })); P.recordMatch(res({ kills: 8, placement: 3 })); const b = P.weeklyBoard(); expect(b.length).toBe(2); expect(b[0].score).toBeGreaterThanOrEqual(b[1].score);
  });
});
